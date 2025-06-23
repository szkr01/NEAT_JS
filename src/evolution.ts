import { RealType, FitnessResult, EvolutionConfig, MutationConfig } from './types.js';
import { IGenome } from './genome.js';

// 適応度評価関数の型
export type FitnessFunction<T = unknown> = (genome: IGenome) => FitnessResult;

// 選択戦略のインターフェース
export interface ISelectionStrategy {
  select(population: readonly IGenome[], fitnessScores: readonly RealType[], count: number): readonly IGenome[];
}

// 進化アルゴリズムのインターフェース
export interface IEvolutionEngine {
  evolve<T>(
    initialPopulation: readonly IGenome[],
    fitnessFunction: FitnessFunction<T>,
    evolutionConfig: EvolutionConfig,
    mutationConfig: MutationConfig
  ): IEvolutionResult;
}

// 進化結果のインターフェース
export interface IEvolutionResult {
  readonly bestGenome: IGenome;
  readonly bestFitness: RealType;
  readonly generation: number;
  readonly population: readonly IGenome[];
  readonly fitnessHistory: readonly RealType[];
}

// トーナメント選択戦略
export class TournamentSelection implements ISelectionStrategy {
  constructor(private readonly tournamentSize: number = 3) {}

  public select(
    population: readonly IGenome[],
    fitnessScores: readonly RealType[],
    count: number
  ): readonly IGenome[] {
    const selected: IGenome[] = [];

    for (let i = 0; i < count; i++) {
      let bestIndex = Math.floor(Math.random() * population.length);
      let bestFitness = fitnessScores[bestIndex];

      // トーナメントを実行
      for (let j = 1; j < this.tournamentSize; j++) {
        const candidateIndex = Math.floor(Math.random() * population.length);
        const candidateFitness = fitnessScores[candidateIndex];

        if (candidateFitness > bestFitness) {
          bestIndex = candidateIndex;
          bestFitness = candidateFitness;
        }
      }

      selected.push(population[bestIndex]);
    }

    return selected;
  }
}

// ルーレット選択戦略
export class RouletteWheelSelection implements ISelectionStrategy {
  public select(
    population: readonly IGenome[],
    fitnessScores: readonly RealType[],
    count: number
  ): readonly IGenome[] {
    const selected: IGenome[] = [];
    const totalFitness = fitnessScores.reduce((sum, fitness) => sum + Math.max(0, fitness), 0);

    if (totalFitness === 0) {
      // 全ての適応度が0または負の場合はランダム選択
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        selected.push(population[randomIndex]);
      }
      return selected;
    }

    for (let i = 0; i < count; i++) {
      const randomValue = Math.random() * totalFitness;
      let currentSum = 0;

      for (let j = 0; j < population.length; j++) {
        currentSum += Math.max(0, fitnessScores[j]);
        if (randomValue <= currentSum) {
          selected.push(population[j]);
          break;
        }
      }
    }

    return selected;
  }
}

// 進化結果の実装
class EvolutionResult implements IEvolutionResult {
  constructor(
    public readonly bestGenome: IGenome,
    public readonly bestFitness: RealType,
    public readonly generation: number,
    public readonly population: readonly IGenome[],
    public readonly fitnessHistory: readonly RealType[]
  ) {}
}

// 進化エンジンの実装
export class EvolutionEngine implements IEvolutionEngine {
  constructor(
    private readonly selectionStrategy: ISelectionStrategy = new TournamentSelection(),
    private readonly mutator: import('./mutator.js').IMutator
  ) {}

  public evolve<T>(
    initialPopulation: readonly IGenome[],
    fitnessFunction: FitnessFunction<T>,
    evolutionConfig: EvolutionConfig,
    mutationConfig: MutationConfig
  ): IEvolutionResult {
    let population = [...initialPopulation];
    const fitnessHistory: RealType[] = [];
    let bestGenome = population[0];
    let bestFitness = -Infinity;

    for (let generation = 0; generation < evolutionConfig.maxGenerations; generation++) {
      // 適応度を評価
      const fitnessScores = population.map(genome => fitnessFunction(genome).fitness);
      
      // 最良個体を更新
      for (let i = 0; i < population.length; i++) {
        if (fitnessScores[i] > bestFitness) {
          bestFitness = fitnessScores[i];
          bestGenome = population[i];
        }
      }

      fitnessHistory.push(bestFitness);

      // fitnessThresholdによる早期終了
      if (evolutionConfig.fitnessThreshold !== undefined && 
          bestFitness >= evolutionConfig.fitnessThreshold) {
        return new EvolutionResult(
          bestGenome,
          bestFitness,
          generation + 1,
          population,
          fitnessHistory
        );
      }

      // 次世代を生成
      const newPopulation: IGenome[] = [];

      // エリート選択
      const sortedIndices = Array.from({ length: population.length }, (_, i) => i)
        .sort((a, b) => fitnessScores[b] - fitnessScores[a]);

      for (let i = 0; i < evolutionConfig.eliteCount && i < population.length; i++) {
        newPopulation.push(population[sortedIndices[i]]);
      }

      // 残りの個体を選択と突然変異で生成
      const remainingCount = evolutionConfig.populationSize - evolutionConfig.eliteCount;
      const selectedParents = this.selectionStrategy.select(
        population,
        fitnessScores,
        remainingCount
      );

      for (const parent of selectedParents) {
        const mutatedChild = this.mutator.mutate(parent, mutationConfig);
        newPopulation.push(mutatedChild);
      }

      population = newPopulation;

      // 早期終了条件をチェック（オプション）
      if (this.shouldTerminateEarly(fitnessHistory, generation)) {
        break;
      }
    }

    return new EvolutionResult(
      bestGenome,
      bestFitness,
      fitnessHistory.length,
      population,
      fitnessHistory
    );
  }

  private shouldTerminateEarly(fitnessHistory: readonly RealType[], generation: number): boolean {
    // 過去10世代で改善がない場合に早期終了（オプション）
    if (generation < 10) return false;

    const recentHistory = fitnessHistory.slice(-10);
    const maxRecent = Math.max(...recentHistory);
    const minRecent = Math.min(...recentHistory);

    // 改善が非常に小さい場合
    return (maxRecent - minRecent) < 1e-6;
  }
}

// 進化エンジンのファクトリー
export class EvolutionEngineFactory {
  public static createWithTournamentSelection(
    mutator: import('./mutator.js').IMutator,
    tournamentSize: number = 3
  ): IEvolutionEngine {
    return new EvolutionEngine(new TournamentSelection(tournamentSize), mutator);
  }

  public static createWithRouletteSelection(
    mutator: import('./mutator.js').IMutator
  ): IEvolutionEngine {
    return new EvolutionEngine(new RouletteWheelSelection(), mutator);
  }
}
