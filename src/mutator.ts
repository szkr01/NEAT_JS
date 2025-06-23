import { IGenome } from './genome.js';
import { ActivationType, NodeType, MutationConfig, RealType } from './types.js';
import { IRandomGenerator, RandomGeneratorFactory } from './random.js';

// 突然変異操作のインターフェース
export interface IMutator {
  mutate(genome: IGenome, config: MutationConfig): IGenome;
}

// 突然変異操作の実装
export class Mutator implements IMutator {
  private readonly random: IRandomGenerator;

  constructor(random?: IRandomGenerator) {
    this.random = random ?? RandomGeneratorFactory.getInstance();
  }

  public mutate(genome: IGenome, config: MutationConfig): IGenome {
    const mutatedGenome = genome.clone();

    // 重みとバイアスの突然変異
    for (let i = 0; i < config.mutationCount; i++) {
      if (this.random.probability(0.25)) {
        if (this.random.probability(0.5)) {
          this.mutateBiases(mutatedGenome, config);
        } else {
          this.mutateWeights(mutatedGenome, config);
        }
      }
    }

    // 新しいノードの追加
    if (this.random.probability(config.addNodeRate) && 
        config.maxHiddenNodes > mutatedGenome.info.hidden) {
      this.addNode(mutatedGenome, config);
    }

    // 新しい接続の追加
    if (this.random.probability(config.addConnectionRate)) {
      this.addConnection(mutatedGenome, config);
    }

    return mutatedGenome;
  }

  private mutateBiases(genome: IGenome, config: MutationConfig): void {
    if (genome.nodes.length === 0) return;

    const nodeIndex = this.random.randomInt(genome.nodes.length);
    const node = genome.nodes[nodeIndex];

    let newBias: RealType;
    if (this.random.probability(config.newValueProbability)) {
      newBias = this.random.randomRange(-config.weightRange, config.weightRange);
    } else {
      if (this.random.probability(0.25)) {
        newBias = node.bias + this.random.randomRange(-config.weightRange, config.weightRange);
      } else {
        newBias = node.bias + config.weightSmallRange * 
          this.random.randomRange(-config.weightRange, config.weightRange);
      }
    }

    // バイアスを更新（実装はGenomeクラスで提供される必要がある）
    this.updateNodeBias(genome, nodeIndex, newBias);
  }

  private mutateWeights(genome: IGenome, config: MutationConfig): void {
    if (genome.connections.length === 0) return;

    const connectionIndex = this.random.randomInt(genome.connections.length);
    const connection = genome.connections[connectionIndex];

    let newWeight: RealType;
    if (this.random.probability(config.newValueProbability)) {
      newWeight = this.random.randomRange(-config.weightRange, config.weightRange);
    } else {
      if (this.random.probability(0.75)) {
        newWeight = connection.weight + config.weightSmallRange *
          this.random.randomRange(-config.weightRange, config.weightRange);
      } else {
        newWeight = connection.weight + 
          this.random.randomRange(-config.weightRange, config.weightRange);
      }
    }

    // 重みを更新（実装はGenomeクラスで提供される必要がある）
    this.updateConnectionWeight(genome, connectionIndex, newWeight);
  }

  private addNode(genome: IGenome, config: MutationConfig): void {
    if (genome.connections.length === 0) return;

    const enabledConnections = genome.connections
      .map((conn, index) => ({ connection: conn, index }))
      .filter(item => item.connection.enabled);

    if (enabledConnections.length === 0) return;

    const selectedItem = this.random.choice(enabledConnections);
    genome.splitConnection(selectedItem.index);
  }

  private addConnection(genome: IGenome, config: MutationConfig): void {
    // 入力 + 隠れノードから選択
    const sourceCount = genome.info.inputs + genome.info.hidden;
    let sourceIndex = this.random.randomInt(sourceCount);

    // 出力ノードが選ばれた場合は隠れノードに変更
    if (sourceIndex >= genome.info.inputs && 
        sourceIndex < (genome.info.inputs + genome.info.outputs)) {
      sourceIndex += genome.info.outputs;
    }

    // 隠れ + 出力ノードから選択
    const targetCount = genome.info.hidden + genome.info.outputs;
    const targetIndex = this.random.randomInt(targetCount) + genome.info.inputs;

    // 接続を作成
    const weight = this.random.randomRange(-config.weightRange, config.weightRange);
    genome.createConnection(sourceIndex, targetIndex, weight);
  }
  // ゲノムのメソッドを直接使用
  private updateNodeBias(genome: IGenome, nodeIndex: number, bias: RealType): void {
    genome.updateNodeBias(nodeIndex, bias);
  }

  private updateConnectionWeight(genome: IGenome, connectionIndex: number, weight: RealType): void {
    genome.updateConnectionWeight(connectionIndex, weight);
  }
}

// 突然変異操作のファクトリー
export class MutatorFactory {
  public static createMutator(random?: IRandomGenerator): IMutator {
    return new Mutator(random);
  }

  public static createWithSeed(seed: number): IMutator {
    const random = RandomGeneratorFactory.createSimple(seed);
    return new Mutator(random);
  }
}
