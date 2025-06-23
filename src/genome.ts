import { 
  ActivationType, 
  NodeType, 
  RealType, 
  NetworkInfo, 
  NodeInfo, 
  ConnectionInfo 
} from './types.js';
import { IDAG, DAG } from './dag.js';

// ゲノムのノード
export interface IGenomeNode {
  readonly id: number;
  readonly type: NodeType;
  readonly activation: ActivationType;
  readonly bias: RealType;
  readonly depth: number;
}

// ゲノムの接続
export interface IGenomeConnection {
  readonly from: number;
  readonly to: number;
  readonly weight: RealType;
  readonly enabled: boolean;
}

// ゲノムのインターフェース
export interface IGenome {
  readonly info: NetworkInfo;
  readonly nodes: readonly IGenomeNode[];
  readonly connections: readonly IGenomeConnection[];
  readonly dag: IDAG;
  
  createNode(activation: ActivationType, type?: NodeType): number;
  createConnection(from: number, to: number, weight: RealType): boolean;
  splitConnection(connectionIndex: number): boolean;
  removeConnection(connectionIndex: number): void;
  updateNodeBias(nodeIndex: number, bias: RealType): void;
  updateConnectionWeight(connectionIndex: number, weight: RealType): void;
  isInputNode(nodeId: number): boolean;
  isOutputNode(nodeId: number): boolean;
  isHiddenNode(nodeId: number): boolean;
  computeDepth(): void;
  getTopologicalOrder(): readonly number[];
  clone(): IGenome;
}

// ゲノムノードの実装
class GenomeNode implements IGenomeNode {
  constructor(
    public readonly id: number,
    public readonly type: NodeType,
    public readonly activation: ActivationType,
    private _bias: RealType = 0.0,
    private _depth: number = 0
  ) {}

  public get bias(): RealType {
    return this._bias;
  }

  public get depth(): number {
    return this._depth;
  }

  public setBias(bias: RealType): GenomeNode {
    return new GenomeNode(this.id, this.type, this.activation, bias, this._depth);
  }

  public setDepth(depth: number): GenomeNode {
    return new GenomeNode(this.id, this.type, this.activation, this._bias, depth);
  }
}

// ゲノム接続の実装
class GenomeConnection implements IGenomeConnection {
  constructor(
    public readonly from: number,
    public readonly to: number,
    private _weight: RealType,
    public readonly enabled: boolean = true
  ) {}

  public get weight(): RealType {
    return this._weight;
  }

  public setWeight(weight: RealType): GenomeConnection {
    return new GenomeConnection(this.from, this.to, weight, this.enabled);
  }

  public setEnabled(enabled: boolean): GenomeConnection {
    return new GenomeConnection(this.from, this.to, this._weight, enabled);
  }
}

// ゲノムの実装
export class Genome implements IGenome {
  private _nodes: GenomeNode[] = [];
  private _connections: GenomeConnection[] = [];
  private readonly _dag: DAG;
  private _info: NetworkInfo;

  constructor(inputs: number, outputs: number) {
    this._dag = new DAG();
    this._info = { inputs, outputs, hidden: 0 };

    // 入力ノードを作成
    for (let i = 0; i < inputs; i++) {
      this.createNode(ActivationType.None, NodeType.Input);
    }

    // 出力ノードを作成
    for (let i = 0; i < outputs; i++) {
      this.createNode(ActivationType.Tanh, NodeType.Output);
    }
  }

  public get info(): NetworkInfo {
    return this._info;
  }

  public get nodes(): readonly IGenomeNode[] {
    return this._nodes;
  }

  public get connections(): readonly IGenomeConnection[] {
    return this._connections;
  }

  public get dag(): IDAG {
    return this._dag;
  }

  public createNode(activation: ActivationType, type: NodeType = NodeType.Hidden): number {
    const nodeId = this._dag.createNode();
    const node = new GenomeNode(nodeId, type, activation);
    this._nodes.push(node);

    if (type === NodeType.Hidden) {
      this._info = { ...this._info, hidden: this._info.hidden + 1 };
    }

    return nodeId;
  }

  public createConnection(from: number, to: number, weight: RealType): boolean {
    if (this._dag.createConnection(from, to)) {
      const connection = new GenomeConnection(from, to, weight);
      this._connections.push(connection);
      return true;
    }
    return false;
  }

  public splitConnection(connectionIndex: number): boolean {
    if (connectionIndex < 0 || connectionIndex >= this._connections.length) {
      return false;
    }

    const connection = this._connections[connectionIndex];
    if (!connection.enabled) {
      return false;
    }

    // 新しい隠れノードを作成
    const newNodeId = this.createNode(ActivationType.ReLU, NodeType.Hidden);

    // 元の接続を無効化
    this._connections[connectionIndex] = connection.setEnabled(false);

    // 新しい接続を作成
    this.createConnection(connection.from, newNodeId, connection.weight);
    this.createConnection(newNodeId, connection.to, 1.0);

    return true;
  }

  public removeConnection(connectionIndex: number): void {
    if (connectionIndex < 0 || connectionIndex >= this._connections.length) {
      return;
    }

    const connection = this._connections[connectionIndex];
    this._dag.removeConnection(connection.from, connection.to);
    this._connections.splice(connectionIndex, 1);
  }

  public isInputNode(nodeId: number): boolean {
    return nodeId < this._info.inputs;
  }

  public isOutputNode(nodeId: number): boolean {
    return nodeId >= this._info.inputs && nodeId < (this._info.inputs + this._info.outputs);
  }

  public isHiddenNode(nodeId: number): boolean {
    return nodeId >= (this._info.inputs + this._info.outputs);
  }

  public computeDepth(): void {
    this._dag.computeDepth();

    // ノードの深度を更新
    for (let i = 0; i < this._nodes.length; i++) {
      const dagNode = this._dag.nodes[i];
      this._nodes[i] = this._nodes[i].setDepth(dagNode.depth);
    }

    // 出力ノードの深度を最後の層に設定
    const maxDepth = Math.max(...this._nodes.map(node => node.depth));
    const outputDepth = Math.max(maxDepth, 1);

    for (let i = this._info.inputs; i < this._info.inputs + this._info.outputs; i++) {
      this._nodes[i] = this._nodes[i].setDepth(outputDepth);
    }
  }

  public getTopologicalOrder(): readonly number[] {
    this.computeDepth();
    const order: number[] = [];
    
    for (let i = 0; i < this._nodes.length; i++) {
      order.push(i);
    }

    order.sort((a, b) => this._nodes[a].depth - this._nodes[b].depth);
    return order;
  }
  public updateNodeBias(nodeIndex: number, bias: RealType): void {
    if (nodeIndex >= 0 && nodeIndex < this._nodes.length) {
      this._nodes[nodeIndex] = this._nodes[nodeIndex].setBias(bias);
    }
  }

  public updateConnectionWeight(connectionIndex: number, weight: RealType): void {
    if (connectionIndex >= 0 && connectionIndex < this._connections.length) {
      this._connections[connectionIndex] = this._connections[connectionIndex].setWeight(weight);
    }
  }

  public clone(): IGenome {
    const clone = new Genome(this._info.inputs, this._info.outputs);
    
    // 隠れノードを複製
    for (const node of this._nodes) {
      if (node.type === NodeType.Hidden) {
        clone.createNode(node.activation, NodeType.Hidden);
      }
    }

    // 接続を複製
    for (const connection of this._connections) {
      if (connection.enabled) {
        clone.createConnection(connection.from, connection.to, connection.weight);
      }
    }

    // バイアスを設定
    for (let i = 0; i < this._nodes.length; i++) {
      if (i < clone._nodes.length) {
        clone._nodes[i] = clone._nodes[i].setBias(this._nodes[i].bias);
      }
    }

    return clone;
  }
}
