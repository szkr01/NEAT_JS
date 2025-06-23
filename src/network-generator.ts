import { IGenome } from './genome.js';
import { INetwork } from './network.js';
import { ActivationFunctionFactory } from './activation.js';
import { Network } from './network.js';

// ネットワーク生成器のインターフェース
export interface INetworkGenerator {
  generate(genome: IGenome): INetwork;
}

// ネットワーク生成器の実装
export class NetworkGenerator implements INetworkGenerator {
  private readonly indexToOrder: number[] = [];
  public generate(genome: IGenome): INetwork {
    // トポロジカル順序を取得
    const order = genome.getTopologicalOrder();
    this.indexToOrder.length = genome.info.inputs + genome.info.outputs + genome.info.hidden;

    // インデックスマッピングを作成
    for (let i = 0; i < order.length; i++) {
      this.indexToOrder[order[i]] = i;
    }

    // ネットワークビルダーを作成
    const builder = Network.builder().setInfo(genome.info);

    // 最初にノードを順序通りに追加
    for (const originalIndex of order) {
      const node = genome.nodes[originalIndex];
      const activation = ActivationFunctionFactory.getFunction(node.activation);
      
      // 有効な接続のみをカウント
      const validConnections = genome.connections.filter(
        conn => conn.from === originalIndex && conn.enabled
      );
      
      builder.addNode(activation, node.bias, node.depth, validConnections.length);
    }

    // 次に接続を追加
    for (const originalIndex of order) {
      const validConnections = genome.connections.filter(
        conn => conn.from === originalIndex && conn.enabled
      );
      
      for (const connection of validConnections) {
        const targetIndex = this.indexToOrder[connection.to];
        builder.addConnection(targetIndex, connection.weight);
      }
    }

    return builder.build();
  }
}

// ネットワーク生成器のファクトリー
export class NetworkGeneratorFactory {
  private static instance: INetworkGenerator | null = null;

  public static getInstance(): INetworkGenerator {
    if (!this.instance) {
      this.instance = new NetworkGenerator();
    }
    return this.instance;
  }

  public static createGenerator(): INetworkGenerator {
    return new NetworkGenerator();
  }
}
