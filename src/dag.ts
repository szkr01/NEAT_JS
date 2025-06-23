// DAG（有向非巡回グラフ）のノード
export interface IDAGNode {
  readonly incoming: number;
  readonly depth: number;
  readonly outConnections: readonly number[];
}

// DAGのインターフェース
export interface IDAG {
  readonly nodes: readonly IDAGNode[];
  createNode(): number;
  createConnection(from: number, to: number): boolean;
  removeConnection(from: number, to: number): void;
  isValid(nodeId: number): boolean;
  isParent(parent: number, child: number): boolean;
  isAncestor(ancestor: number, descendant: number): boolean;
  computeDepth(): void;
  getTopologicalOrder(): readonly number[];
}

// DAGノードの実装
class DAGNode implements IDAGNode {
  private _incoming: number = 0;
  private _depth: number = 0;
  private readonly _outConnections: number[] = [];

  public get incoming(): number {
    return this._incoming;
  }

  public get depth(): number {
    return this._depth;
  }

  public get outConnections(): readonly number[] {
    return this._outConnections;
  }

  public addOutConnection(to: number): void {
    this._outConnections.push(to);
  }

  public removeOutConnection(to: number): boolean {
    const index = this._outConnections.indexOf(to);
    if (index !== -1) {
      this._outConnections.splice(index, 1);
      return true;
    }
    return false;
  }

  public incrementIncoming(): void {
    this._incoming++;
  }

  public decrementIncoming(): void {
    this._incoming--;
  }

  public setDepth(depth: number): void {
    this._depth = depth;
  }
}

// DAGの実装
export class DAG implements IDAG {
  private readonly _nodes: DAGNode[] = [];

  public get nodes(): readonly IDAGNode[] {
    return this._nodes;
  }

  public createNode(): number {
    this._nodes.push(new DAGNode());
    return this._nodes.length - 1;
  }

  public createConnection(from: number, to: number): boolean {
    // 両方のノードが存在することを確認
    if (!this.isValid(from) || !this.isValid(to)) {
      return false;
    }

    // 自己接続を防ぐ
    if (from === to) {
      return false;
    }

    // 循環を防ぐ
    if (this.isAncestor(to, from)) {
      return false;
    }

    // 既存の接続をチェック
    if (this.isParent(from, to)) {
      return false;
    }

    // 接続を作成
    this._nodes[from].addOutConnection(to);
    this._nodes[to].incrementIncoming();
    return true;
  }

  public removeConnection(from: number, to: number): void {
    if (!this.isValid(from) || !this.isValid(to)) {
      return;
    }

    if (this._nodes[from].removeOutConnection(to)) {
      this._nodes[to].decrementIncoming();
    }
  }

  public isValid(nodeId: number): boolean {
    return nodeId >= 0 && nodeId < this._nodes.length;
  }

  public isParent(parent: number, child: number): boolean {
    if (!this.isValid(parent)) {
      return false;
    }
    return this._nodes[parent].outConnections.includes(child);
  }

  public isAncestor(ancestor: number, descendant: number): boolean {
    if (!this.isValid(ancestor)) {
      return false;
    }

    if (this.isParent(ancestor, descendant)) {
      return true;
    }

    return this._nodes[ancestor].outConnections.some(child =>
      this.isAncestor(child, descendant)
    );
  }

  public computeDepth(): void {
    const nodeCount = this._nodes.length;
    const startNodes: number[] = [];
    const incoming: number[] = this._nodes.map(node => node.incoming);

    // 入力ノード（incoming = 0）を見つける
    for (let i = 0; i < nodeCount; i++) {
      if (incoming[i] === 0) {
        this._nodes[i].setDepth(0);
        startNodes.push(i);
      }
    }

    // トポロジカルソートでDepthを計算
    while (startNodes.length > 0) {
      const nodeIdx = startNodes.pop()!;
      const node = this._nodes[nodeIdx];

      for (const childIdx of node.outConnections) {
        incoming[childIdx]--;
        const childNode = this._nodes[childIdx];
        const newDepth = Math.max(childNode.depth, node.depth + 1);
        childNode.setDepth(newDepth);

        if (incoming[childIdx] === 0) {
          startNodes.push(childIdx);
        }
      }
    }
  }

  public getTopologicalOrder(): readonly number[] {
    const order: number[] = [];
    for (let i = 0; i < this._nodes.length; i++) {
      order.push(i);
    }

    order.sort((a, b) => this._nodes[a].depth - this._nodes[b].depth);
    return order;
  }
}
