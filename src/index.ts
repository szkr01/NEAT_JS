// すべてのパブリック API をエクスポート

// 型定義
export * from './types.js';

// 活性化関数
export * from './activation.js';

// DAG（有向非巡回グラフ）
export * from './dag.js';

// ゲノム
export * from './genome.js';

// ニューラルネットワーク
export * from './network.js';

// ネットワーク生成器
export * from './network-generator.js';

// 乱数生成器
export * from './random.js';

// 突然変異
export * from './mutator.js';

// 進化アルゴリズム
export * from './evolution.js';

// メイン NEAT クラス
import { IGenome, Genome } from './genome.js';
import { INetwork } from './network.js';
import { INetworkGenerator, NetworkGeneratorFactory } from './network-generator.js';
import { IMutator, MutatorFactory } from './mutator.js';
import { 
  IEvolutionEngine, 
  EvolutionEngineFactory, 
  FitnessFunction,
  IEvolutionResult 
} from './evolution.js';
import { 
  MutationConfig, 
  EvolutionConfig, 
  ActivationType,
  RealType,
  PopulationStats
} from './types.js';
import { IRandomGenerator, RandomGeneratorFactory } from './random.js';

// デフォルト設定
export const DEFAULT_MUTATION_CONFIG: MutationConfig = {
  weightMutationRate: 0.8,
  biasMutationRate: 0.7,
  addNodeRate: 0.03,
  addConnectionRate: 0.05,
  weightRange: 2.0,
  weightSmallRange: 0.1,
  newValueProbability: 0.1,
  maxHiddenNodes: 100,
  mutationCount: 3
};

export const DEFAULT_EVOLUTION_CONFIG: EvolutionConfig = {
  populationSize: 150,
  eliteCount: 5,
  selectionPressure: 2.0,
  maxGenerations: 100
};

// メイン NEAT クラス
export class NEAT {
  private readonly networkGenerator: INetworkGenerator;
  private readonly mutator: IMutator;
  private readonly evolutionEngine: IEvolutionEngine;
  private readonly random: IRandomGenerator;

  constructor(options?: {
    seed?: number;
    mutationConfig?: Partial<MutationConfig>;
    evolutionConfig?: Partial<EvolutionConfig>;
    useSimpleRandom?: boolean;
  }) {
    // 乱数生成器の設定
    if (options?.useSimpleRandom || options?.seed !== undefined) {
      this.random = RandomGeneratorFactory.createSimple(options?.seed);
      RandomGeneratorFactory.setInstance(this.random);
    } else {
      this.random = RandomGeneratorFactory.getInstance();
    }

    // コンポーネントの初期化
    this.networkGenerator = NetworkGeneratorFactory.getInstance();
    this.mutator = MutatorFactory.createMutator(this.random);
    this.evolutionEngine = EvolutionEngineFactory.createWithTournamentSelection(this.mutator);
  }

  /**
   * 新しいゲノムを作成
   */
  public createGenome(inputs: number, outputs: number): IGenome {
    return new Genome(inputs, outputs);
  }

  /**
   * ゲノムからニューラルネットワークを生成
   */
  public createNetwork(genome: IGenome): INetwork {
    return this.networkGenerator.generate(genome);
  }

  /**
   * ゲノムを突然変異
   */
  public mutateGenome(
    genome: IGenome, 
    config: MutationConfig = DEFAULT_MUTATION_CONFIG
  ): IGenome {
    return this.mutator.mutate(genome, config);
  }

  /**
   * 初期個体群を作成
   */
  public createInitialPopulation(
    inputs: number,
    outputs: number,
    populationSize: number,
    mutationConfig: MutationConfig = DEFAULT_MUTATION_CONFIG
  ): readonly IGenome[] {
    const population: IGenome[] = [];

    for (let i = 0; i < populationSize; i++) {
      let genome = this.createGenome(inputs, outputs);
      
      // いくつかのランダムな接続を追加
      const connectionCount = this.random.randomInt(inputs * outputs) + 1;
      for (let j = 0; j < connectionCount; j++) {
        const fromNode = this.random.randomInt(inputs);
        const toNode = this.random.randomInt(outputs) + inputs;
        const weight = this.random.randomRange(-mutationConfig.weightRange, mutationConfig.weightRange);
        genome.createConnection(fromNode, toNode, weight);
      }

      // 軽い突然変異を適用
      genome = this.mutateGenome(genome, {
        ...mutationConfig,
        addNodeRate: mutationConfig.addNodeRate * 0.1,
        addConnectionRate: mutationConfig.addConnectionRate * 0.5
      });

      population.push(genome);
    }

    return population;
  }

  /**
   * 進化を実行
   */
  public evolve<T = unknown>(
    initialPopulation: readonly IGenome[],
    fitnessFunction: FitnessFunction<T>,
    evolutionConfig: EvolutionConfig = DEFAULT_EVOLUTION_CONFIG,
    mutationConfig: MutationConfig = DEFAULT_MUTATION_CONFIG
  ): IEvolutionResult {
    return this.evolutionEngine.evolve(
      initialPopulation,
      fitnessFunction,
      evolutionConfig,
      mutationConfig
    );
  }

  /**
   * 完全な進化プロセスを実行（初期個体群の作成から進化まで）
   */
  public run<T = unknown>(
    inputs: number,
    outputs: number,
    fitnessFunction: FitnessFunction<T>,
    evolutionConfig: EvolutionConfig = DEFAULT_EVOLUTION_CONFIG,
    mutationConfig: MutationConfig = DEFAULT_MUTATION_CONFIG
  ): IEvolutionResult {
    const initialPopulation = this.createInitialPopulation(
      inputs,
      outputs,
      evolutionConfig.populationSize,
      mutationConfig
    );

    return this.evolve(initialPopulation, fitnessFunction, evolutionConfig, mutationConfig);
  }

  /**
   * 乱数シードを設定
   */
  public setSeed(seed: number): void {
    this.random.seed(seed);
  }
  /**
   * 統計情報を取得
   */
  public getStats(population: readonly IGenome[]): PopulationStats {
    const nodesCounts = population.map(genome => genome.info.inputs + genome.info.outputs + genome.info.hidden);
    const connectionCounts = population.map(genome => genome.connections.length);

    return {
      averageNodes: nodesCounts.reduce((sum, count) => sum + count, 0) / nodesCounts.length,
      averageConnections: connectionCounts.reduce((sum, count) => sum + count, 0) / connectionCounts.length,
      maxNodes: Math.max(...nodesCounts),
      maxConnections: Math.max(...connectionCounts),
      speciesCount: 1 // 種分化は今回は実装しない
    };
  }
}

// デフォルト インスタンス
export const neat = new NEAT();
