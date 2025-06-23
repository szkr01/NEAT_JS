// 共通の型定義
export type RealType = number;

// 活性化関数の種類
export enum ActivationType {
  None = 'none',
  Sigmoid = 'sigmoid',
  ReLU = 'relu',
  Tanh = 'tanh',
}

// ノードの種類
export enum NodeType {
  Input = 'input',
  Hidden = 'hidden',
  Output = 'output',
}

// ネットワーク情報
export interface NetworkInfo {
  readonly inputs: number;
  readonly outputs: number;
  readonly hidden: number;
}

// ノード情報
export interface NodeInfo {
  readonly id: number;
  readonly type: NodeType;
  readonly activation: ActivationType;
  readonly bias: RealType;
  readonly depth: number;
}

// 接続情報
export interface ConnectionInfo {
  readonly from: number;
  readonly to: number;
  readonly weight: RealType;
  readonly enabled: boolean;
}

// 突然変異の設定
export interface MutationConfig {
  readonly weightMutationRate: number;
  readonly biasMutationRate: number;
  readonly addNodeRate: number;
  readonly addConnectionRate: number;
  readonly weightRange: number;
  readonly weightSmallRange: number;
  readonly newValueProbability: number;
  readonly maxHiddenNodes: number;
  readonly mutationCount: number;
}

// 進化の設定
export interface EvolutionConfig {
  readonly populationSize: number;
  readonly eliteCount: number;
  readonly selectionPressure: number;
  readonly maxGenerations: number;
  readonly fitnessThreshold?: number;
}

// 適応度評価の結果
export interface FitnessResult {
  readonly fitness: RealType;
  readonly data?: unknown;
}

// 個体群統計
export interface PopulationStats {
  readonly averageNodes: number;
  readonly averageConnections: number;
  readonly maxNodes: number;
  readonly maxConnections: number;
  readonly speciesCount: number;
}
