import { RealType, NetworkInfo } from './types.js';
import { IActivationFunction } from './activation.js';

// ネットワークのノード
export interface INetworkNode {
  readonly activation: IActivationFunction;
  readonly bias: RealType;
  readonly depth: number;
  readonly connectionCount: number;
  setValue(value: RealType): void;
  getValue(): RealType;
  getActivatedValue(): RealType;
  reset(): void;
}

// ネットワークの接続
export interface INetworkConnection {
  readonly to: number;
  readonly weight: RealType;
  getValue(): RealType;
  setValue(value: RealType): void;
}

// ニューラルネットワークのインターフェース
export interface INetwork {
  readonly info: NetworkInfo;
  readonly maxDepth: number;
  
  execute(inputs: readonly RealType[]): readonly RealType[];
  getOutputs(): readonly RealType[];
  reset(): void;
}

// ネットワークノードの実装
class NetworkNode implements INetworkNode {
  private _sum: RealType = 0.0;

  constructor(
    public readonly activation: IActivationFunction,
    public readonly bias: RealType,
    public readonly depth: number,
    public readonly connectionCount: number
  ) {}

  public setValue(value: RealType): void {
    this._sum = value;
  }

  public getValue(): RealType {
    return this._sum;
  }

  public getActivatedValue(): RealType {
    return this.activation.activate(this._sum + this.bias);
  }

  public reset(): void {
    this._sum = 0.0;
  }
}

// ネットワーク接続の実装
class NetworkConnection implements INetworkConnection {
  private _value: RealType = 0.0;

  constructor(
    public readonly to: number,
    public readonly weight: RealType
  ) {}

  public getValue(): RealType {
    return this._value;
  }

  public setValue(value: RealType): void {
    this._value = value * this.weight;
  }
}

// ニューラルネットワークの実装
export class Network implements INetwork {
  private readonly _nodes: NetworkNode[] = [];
  private readonly _connections: NetworkConnection[] = [];
  private readonly _outputs: RealType[] = [];
  private readonly _info: NetworkInfo;
  private readonly _maxDepth: number;

  constructor(
    info: NetworkInfo,
    nodes: readonly NetworkNode[],
    connections: readonly NetworkConnection[],
    maxDepth: number
  ) {
    this._info = info;
    this._nodes = [...nodes];
    this._connections = [...connections];
    this._outputs = new Array(info.outputs).fill(0);
    this._maxDepth = maxDepth;
  }

  public get info(): NetworkInfo {
    return this._info;
  }

  public get maxDepth(): number {
    return this._maxDepth;
  }

  public execute(inputs: readonly RealType[]): readonly RealType[] {
    if (inputs.length !== this._info.inputs) {
      throw new Error(`Input size mismatch: expected ${this._info.inputs}, got ${inputs.length}`);
    }

    // ノードをリセット
    this.reset();

    // 入力を設定
    for (let i = 0; i < this._info.inputs; i++) {
      this._nodes[i].setValue(inputs[i]);
    }

    // ネットワークを実行
    let connectionIndex = 0;
    for (let i = 0; i < this._nodes.length; i++) {
      const node = this._nodes[i];
      const activatedValue = node.getActivatedValue();

      // この ノードからの接続を処理
      for (let j = 0; j < node.connectionCount; j++) {
        const connection = this._connections[connectionIndex++];
        connection.setValue(activatedValue);
        this._nodes[connection.to].setValue(
          this._nodes[connection.to].getValue() + connection.getValue()
        );
      }
    }

    // 出力を更新
    const outputStartIndex = this._info.inputs + this._info.hidden;
    for (let i = 0; i < this._info.outputs; i++) {
      this._outputs[i] = this._nodes[outputStartIndex + i].getActivatedValue();
    }

    return this._outputs;
  }

  public getOutputs(): readonly RealType[] {
    return this._outputs;
  }

  public reset(): void {
    for (const node of this._nodes) {
      node.reset();
    }
  }

  // ネットワークビルダー
  public static builder(): NetworkBuilder {
    return new NetworkBuilder();
  }
}

// ネットワークビルダークラス
export class NetworkBuilder {
  private _info?: NetworkInfo;
  private _nodes: NetworkNode[] = [];
  private _connections: NetworkConnection[] = [];
  private _maxDepth: number = 0;

  public setInfo(info: NetworkInfo): NetworkBuilder {
    this._info = info;
    return this;
  }

  public addNode(
    activation: IActivationFunction,
    bias: RealType,
    depth: number,
    connectionCount: number
  ): NetworkBuilder {
    const node = new NetworkNode(activation, bias, depth, connectionCount);
    this._nodes.push(node);
    this._maxDepth = Math.max(this._maxDepth, depth);
    return this;
  }

  public addConnection(to: number, weight: RealType): NetworkBuilder {
    const connection = new NetworkConnection(to, weight);
    this._connections.push(connection);
    return this;
  }

  public build(): Network {
    if (!this._info) {
      throw new Error('Network info must be set before building');
    }

    return new Network(this._info, this._nodes, this._connections, this._maxDepth);
  }
}
