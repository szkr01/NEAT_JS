# NEAT.js - 完全ドキュメント

**NEAT (NeuroEvolution of Augmenting Topologies)** の TypeScript 実装 - 進化的アルゴリズムによるニューラルネットワークの構造と重みの同時最適化

---

## 目次

- [概要](#概要)
- [クイックスタート](#クイックスタート)
- [インストールと設定](#インストールと設定)
- [基本的な使用方法](#基本的な使用方法)
- [API リファレンス](#api-リファレンス)
- [詳細な使用例](#詳細な使用例)
- [設定とパラメータ](#設定とパラメータ)
- [アーキテクチャと設計](#アーキテクチャと設計)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [トラブルシューティング](#トラブルシューティング)
- [拡張とカスタマイズ](#拡張とカスタマイズ)

---

## 概要

### NEATアルゴリズムとは

NEAT（NeuroEvolution of Augmenting Topologies）は、進化的アルゴリズムを使用してニューラルネットワークの構造（トポロジー）と重みを同時に進化させる手法です。

**主な特徴:**
- **構造進化**: ネットワークの構造を動的に変更
- **重み最適化**: 接続の重みを進化的に調整
- **種分化**: 構造的類似性による個体の分類
- **複雑性制御**: 最小限の構造から始めて必要に応じて複雑化

### NEAT.jsの特徴

- ✅ **TypeScript完全対応**: 型安全性と開発効率
- ✅ **SOLID原則**: 保守性と拡張性を重視した設計
- ✅ **単一ファイル配布**: `neat.js`一つで使用可能
- ✅ **テスト駆動開発**: 66個のテストによる品質保証
- ✅ **豊富な使用例**: XOR、回帰、制御問題など
- ✅ **ブラウザ対応**: Web環境での実行可能

---

## クイックスタート

### 30秒でXOR問題を解く

```typescript
import { NEAT, DEFAULT_EVOLUTION_CONFIG, DEFAULT_MUTATION_CONFIG } from 'neat-js';

// NEATインスタンスを作成
const neat = new NEAT();

// XOR問題の適応度関数
const xorFitness = (genome) => {
  const network = neat.createNetwork(genome);
  let fitness = 0;

  const tests = [
    { input: [0, 0], expected: 0 },
    { input: [0, 1], expected: 1 },
    { input: [1, 0], expected: 1 },
    { input: [1, 1], expected: 0 }
  ];

  for (const test of tests) {
    const output = network.execute(test.input);
    const error = Math.abs(output[0] - test.expected);
    fitness += error < 0.1 ? 1.0 : Math.max(0, 1.0 - error);
  }

  return { fitness };
};

// 進化実行
const result = neat.run(2, 1, xorFitness);
console.log(`成功! 適応度: ${result.bestFitness}, 世代: ${result.generation}`);
```

---

## インストールと設定

### NPMインストール

```bash
npm install neat-js
```

### 直接使用（ブラウザ）

```html
<script src="dist/neat.js"></script>
<script>
  const neat = new NEAT.NEAT();
</script>
```

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-repo/neat-js.git
cd neat-js

# 依存関係をインストール
npm install

# ビルド
npm run build

# テスト実行
npm test

# デモ実行
npm run demo:xor
npm run demo:sin
npm run demo:cartpole
```

---

## 基本的な使用方法

### 1. 基本的なワークフロー

```typescript
import { NEAT, DEFAULT_EVOLUTION_CONFIG, DEFAULT_MUTATION_CONFIG } from 'neat-js';

// 1. NEATインスタンスを作成
const neat = new NEAT({ seed: 42 }); // オプション: 再現可能な結果

// 2. 適応度関数を定義
const fitnessFunction = (genome) => {
  const network = neat.createNetwork(genome);
  // あなたの問題に応じたテスト
  let fitness = evaluateNetwork(network);
  return { fitness };
};

// 3. 進化設定をカスタマイズ（オプション）
const evolutionConfig = {
  ...DEFAULT_EVOLUTION_CONFIG,
  populationSize: 100,
  maxGenerations: 200
};

// 4. 進化を実行
const result = neat.run(
  inputCount,      // 入力ノード数
  outputCount,     // 出力ノード数
  fitnessFunction, // 適応度関数
  evolutionConfig  // 進化設定（オプション）
);

// 5. 結果を使用
const bestNetwork = neat.createNetwork(result.bestGenome);
const output = bestNetwork.execute([input1, input2, ...]);
```

### 2. ステップバイステップ進化

```typescript
// より詳細な制御が必要な場合
const neat = new NEAT();

// 初期個体群を作成
const population = neat.createInitialPopulation(2, 1, 50);

// 世代ごとに進化
let currentPopulation = population;
for (let generation = 0; generation < 100; generation++) {
  const result = neat.evolve(currentPopulation, fitnessFunction);
  
  console.log(`世代 ${generation}: 最高適応度 ${result.bestFitness}`);
  
  if (result.bestFitness >= targetFitness) {
    console.log('目標達成!');
    break;
  }
  
  currentPopulation = result.population;
}
```

---

## API リファレンス

### NEAT クラス

#### コンストラクタ

```typescript
new NEAT(options?: {
  seed?: number;                           // 乱数シード
  mutationConfig?: Partial<MutationConfig>; // 突然変異設定
  evolutionConfig?: Partial<EvolutionConfig>; // 進化設定
  useSimpleRandom?: boolean;               // シンプル乱数使用
})
```

**例:**
```typescript
const neat = new NEAT({
  seed: 12345,
  mutationConfig: { addNodeRate: 0.05 },
  useSimpleRandom: true
});
```

#### 主要メソッド

##### `run()`
```typescript
run<T = unknown>(
  inputs: number,
  outputs: number,
  fitnessFunction: FitnessFunction<T>,
  evolutionConfig?: EvolutionConfig,
  mutationConfig?: MutationConfig
): IEvolutionResult
```

完全な進化プロセスを実行します。

**例:**
```typescript
const result = neat.run(3, 2, fitnessFunction, {
  maxGenerations: 150,
  populationSize: 80
});
```

##### `createNetwork()`
```typescript
createNetwork(genome: IGenome): INetwork
```

ゲノムから実行可能なネットワークを生成します。

**例:**
```typescript
const network = neat.createNetwork(bestGenome);
const output = network.execute([0.5, -0.2, 0.8]);
```

##### `evolve()`
```typescript
evolve<T = unknown>(
  initialPopulation: readonly IGenome[],
  fitnessFunction: FitnessFunction<T>,
  evolutionConfig?: EvolutionConfig,
  mutationConfig?: MutationConfig
): IEvolutionResult
```

既存個体群を一世代進化させます。

##### `getStats()`
```typescript
getStats(population: readonly IGenome[]): PopulationStats
```

個体群の統計情報を取得します。

**例:**
```typescript
const stats = neat.getStats(result.population);
console.log(`平均ノード数: ${stats.averageNodes}`);
console.log(`平均接続数: ${stats.averageConnections}`);
```

### 型定義

#### MutationConfig
```typescript
interface MutationConfig {
  weightMutationRate: number;    // 重み変異率 (0-1)
  biasMutationRate: number;      // バイアス変異率 (0-1)
  addNodeRate: number;           // ノード追加率 (0-1)
  addConnectionRate: number;     // 接続追加率 (0-1)
  weightRange: number;           // 重み値の範囲
  weightSmallRange: number;      // 小さな変異の範囲
  newValueProbability: number;   // 新値使用確率 (0-1)
  maxHiddenNodes: number;        // 最大隠れノード数
  mutationCount: number;         // 変異試行回数
}
```

#### EvolutionConfig
```typescript
interface EvolutionConfig {
  populationSize: number;        // 個体数
  eliteCount: number;            // エリート保存数
  selectionPressure: number;     // 選択圧力
  maxGenerations: number;        // 最大世代数
  fitnessThreshold?: number;     // 早期終了閾値
}
```

#### FitnessFunction
```typescript
type FitnessFunction<T = unknown> = (
  genome: IGenome,
  context?: T
) => { fitness: number };
```

#### IEvolutionResult
```typescript
interface IEvolutionResult {
  bestGenome: IGenome;           // 最良個体
  bestFitness: number;           // 最高適応度
  population: readonly IGenome[]; // 最終個体群
  generation: number;            // 到達世代数
  fitnessHistory: number[];      // 適応度履歴
}
```

---

## 詳細な使用例

### 1. XOR問題（基本例）

```typescript
import { NEAT, DEFAULT_EVOLUTION_CONFIG, DEFAULT_MUTATION_CONFIG } from 'neat-js';

function solveXOR() {
  const neat = new NEAT({ seed: 42 });

  // 改良された適応度関数
  const xorFitness = (genome) => {
    const network = neat.createNetwork(genome);
    let fitness = 0;

    const testCases = [
      { input: [0, 0], expected: 0 },
      { input: [0, 1], expected: 1 },
      { input: [1, 0], expected: 1 },
      { input: [1, 1], expected: 0 }
    ];

    for (const testCase of testCases) {
      const output = network.execute(testCase.input);
      const error = Math.abs(output[0] - testCase.expected);
      
      // 段階的適応度評価
      if (error < 0.1) {
        fitness += 1.0; // ほぼ完璧
      } else if (error < 0.3) {
        fitness += 0.8; // 良い
      } else if (error < 0.5) {
        fitness += 0.5; // 普通
      } else {
        fitness += Math.max(0, 1.0 - error); // 線形減少
      }
    }

    return { fitness: Math.max(0, fitness) };
  };

  // 進化実行
  const result = neat.run(2, 1, xorFitness, {
    ...DEFAULT_EVOLUTION_CONFIG,
    maxGenerations: 100,
    populationSize: 150
  });

  // 結果テスト
  const bestNetwork = neat.createNetwork(result.bestGenome);
  console.log('XOR学習結果:');
  
  const testCases = [
    [0, 0], [0, 1], [1, 0], [1, 1]
  ];
  
  for (const [a, b] of testCases) {
    const output = bestNetwork.execute([a, b]);
    const expected = a ^ b;
    console.log(`XOR(${a},${b}) = ${output[0].toFixed(4)} (期待値: ${expected})`);
  }

  return result;
}

// 実行
const xorResult = solveXOR();
```

### 2. 非線形回帰問題

```typescript
function solveSinRegression() {
  const neat = new NEAT({ seed: 123 });

  // sin(x) + y 関数の学習
  const regressionFitness = (genome) => {
    const network = neat.createNetwork(genome);
    let totalError = 0;
    let testCount = 0;

    // 0からπまでの範囲で複数のテストケースを生成
    const numSamples = 20;
    
    for (let i = 0; i < numSamples; i++) {
      for (let j = 0; j < numSamples; j++) {
        const x = (i / (numSamples - 1)) * Math.PI; // 0 to π
        const y = (j / (numSamples - 1)) * 2 - 1;   // -1 to 1
        const expected = Math.sin(x) + y;
        
        try {
          const output = network.execute([x / Math.PI, y]); // 入力正規化
          const prediction = output[0];
          const error = Math.abs(prediction - expected);
          totalError += error;
          testCount++;
        } catch (e) {
          totalError += 10; // エラーペナルティ
          testCount++;
        }
      }
    }

    const averageError = totalError / testCount;
    const fitness = Math.max(0, 10.0 / (1.0 + averageError));
    
    return { fitness };
  };

  // 複雑な問題なので設定を調整
  const evolutionConfig = {
    ...DEFAULT_EVOLUTION_CONFIG,
    populationSize: 200,
    maxGenerations: 500,
    eliteCount: 10,
    fitnessThreshold: 8.0
  };

  const mutationConfig = {
    ...DEFAULT_MUTATION_CONFIG,
    addNodeRate: 0.05,
    addConnectionRate: 0.2,
    weightMutationRate: 0.8
  };

  const result = neat.run(2, 1, regressionFitness, evolutionConfig, mutationConfig);
  
  // 結果評価
  const bestNetwork = neat.createNetwork(result.bestGenome);
  console.log('sin(x) + y 学習結果:');
  
  const testPoints = [
    { x: 0, y: 0 },
    { x: Math.PI/4, y: 0.5 },
    { x: Math.PI/2, y: -0.5 },
    { x: 3*Math.PI/4, y: 0.2 },
    { x: Math.PI, y: -0.8 }
  ];

  for (const point of testPoints) {
    const expected = Math.sin(point.x) + point.y;
    const output = bestNetwork.execute([point.x / Math.PI, point.y]);
    const prediction = output[0];
    const error = Math.abs(prediction - expected);
    
    console.log(`f(${point.x.toFixed(3)}, ${point.y.toFixed(3)}) = ${prediction.toFixed(4)} ` +
                `(期待値: ${expected.toFixed(4)}, 誤差: ${error.toFixed(4)})`);
  }

  return result;
}
```

### 3. 倒立振子制御問題

```typescript
class CartPoleEnvironment {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = (Math.random() - 0.5) * 0.1;        // カート位置
    this.xDot = 0;                               // カート速度
    this.theta = (Math.random() - 0.5) * 0.1;    // ポール角度
    this.thetaDot = 0;                           // ポール角速度
    return this.getState();
  }

  step(action) {
    const force = (action - 0.5) * 20; // -10 to 10の力
    
    // 物理シミュレーション（簡略化）
    const gravity = 9.8;
    const cartMass = 1.0;
    const poleMass = 0.1;
    const poleLength = 0.5;
    const dt = 0.02;

    const cosTheta = Math.cos(this.theta);
    const sinTheta = Math.sin(this.theta);
    
    const temp = (force + poleMass * poleLength * this.thetaDot * this.thetaDot * sinTheta) / (cartMass + poleMass);
    const thetaAcc = (gravity * sinTheta - cosTheta * temp) / 
                     (poleLength * (4.0/3.0 - poleMass * cosTheta * cosTheta / (cartMass + poleMass)));
    const xAcc = temp - poleMass * poleLength * thetaAcc * cosTheta / (cartMass + poleMass);

    // 状態更新
    this.x += this.xDot * dt;
    this.xDot += xAcc * dt;
    this.theta += this.thetaDot * dt;
    this.thetaDot += thetaAcc * dt;

    const state = this.getState();
    const done = Math.abs(this.theta) > 0.5 || Math.abs(this.x) > 2.4;
    const reward = done ? 0 : 1;

    return { state, reward, done };
  }

  getState() {
    return [this.x, this.xDot, this.theta, this.thetaDot];
  }
}

function solveCartPole() {
  const neat = new NEAT({ seed: 789 });

  const cartPoleFitness = (genome) => {
    const network = neat.createNetwork(genome);
    const env = new CartPoleEnvironment();
    
    let totalReward = 0;
    let state = env.reset();
    
    for (let step = 0; step < 500; step++) {
      const output = network.execute(state);
      const action = Math.max(0, Math.min(1, output[0])); // クランプ
      
      const result = env.step(action);
      totalReward += result.reward;
      state = result.state;
      
      if (result.done) break;
    }
    
    // 安定性ボーナス
    const stabilityBonus = totalReward / (1 + Math.abs(state[3])); // 角速度ペナルティ
    
    return { fitness: stabilityBonus };
  };

  const result = neat.run(4, 1, cartPoleFitness, {
    ...DEFAULT_EVOLUTION_CONFIG,
    populationSize: 100,
    maxGenerations: 100,
    fitnessThreshold: 400
  });

  console.log(`倒立振子制御学習完了: 最高スコア ${result.bestFitness.toFixed(2)}`);
  return result;
}
```

### 4. カスタム進化戦略

```typescript
class AdvancedEvolutionManager {
  constructor() {
    this.neat = new NEAT();
    this.populationHistory = [];
    this.diversityHistory = [];
  }

  // 適応的パラメータ調整
  adaptiveEvolution(fitnessFunction, generations = 100) {
    let population = this.neat.createInitialPopulation(2, 1, 100);
    let stagnationCount = 0;
    let lastBestFitness = 0;

    for (let gen = 0; gen < generations; gen++) {
      // 適応的突然変異率
      const stagnationFactor = Math.min(stagnationCount / 10, 0.8);
      const mutationConfig = {
        ...DEFAULT_MUTATION_CONFIG,
        addNodeRate: 0.03 + stagnationFactor * 0.07,
        addConnectionRate: 0.05 + stagnationFactor * 0.15,
        weightMutationRate: 0.8 + stagnationFactor * 0.2
      };

      const result = this.neat.evolve(population, fitnessFunction, undefined, mutationConfig);
      
      // 停滞検出
      if (result.bestFitness <= lastBestFitness + 0.001) {
        stagnationCount++;
      } else {
        stagnationCount = 0;
      }
      
      lastBestFitness = result.bestFitness;
      population = result.population;

      // 多様性監視
      const diversity = this.calculateDiversity(population);
      this.diversityHistory.push(diversity);

      // 多様性が低下した場合の対策
      if (diversity < 0.1 && gen > 20) {
        population = this.injectDiversity(population);
        console.log(`世代 ${gen}: 多様性注入実行`);
      }

      console.log(`世代 ${gen}: 適応度 ${result.bestFitness.toFixed(4)}, ` +
                  `多様性 ${diversity.toFixed(4)}, 停滞 ${stagnationCount}`);

      if (result.bestFitness >= 3.9) break; // 早期終了
    }

    return { bestGenome: population[0], generations: gen };
  }

  calculateDiversity(population) {
    let totalDistance = 0;
    let comparisons = 0;

    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        const distance = this.genomicDistance(population[i], population[j]);
        totalDistance += distance;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalDistance / comparisons : 0;
  }

  genomicDistance(genome1, genome2) {
    const nodesDiff = Math.abs(genome1.nodes.length - genome2.nodes.length);
    const connsDiff = Math.abs(genome1.connections.length - genome2.connections.length);
    return (nodesDiff + connsDiff) / Math.max(genome1.nodes.length + genome2.nodes.length, 1);
  }

  injectDiversity(population) {
    const diversePopulation = [...population];
    const diversityCount = Math.floor(population.length * 0.2);

    for (let i = 0; i < diversityCount; i++) {
      const newGenome = this.neat.createGenome(2, 1);
      // ランダム初期化
      for (let j = 0; j < 3; j++) {
        const mutatedGenome = this.neat.mutateGenome(newGenome);
      }
      diversePopulation[population.length - 1 - i] = newGenome;
    }

    return diversePopulation;
  }
}

// 使用例
const advancedManager = new AdvancedEvolutionManager();
const result = advancedManager.adaptiveEvolution(xorFitnessFunction, 150);
```

---

## 設定とパラメータ

### デフォルト設定

```typescript
// 突然変異設定
export const DEFAULT_MUTATION_CONFIG: MutationConfig = {
  weightMutationRate: 0.8,      // 80%の確率で重み変異
  biasMutationRate: 0.7,        // 70%の確率でバイアス変異
  addNodeRate: 0.03,            // 3%の確率でノード追加
  addConnectionRate: 0.05,      // 5%の確率で接続追加
  weightRange: 2.0,             // 重み値の範囲 [-2.0, 2.0]
  weightSmallRange: 0.1,        // 小さな変異の範囲
  newValueProbability: 0.1,     // 10%の確率で完全に新しい値
  maxHiddenNodes: 100,          // 最大隠れノード数
  mutationCount: 3              // 1個体あたりの変異試行回数
};

// 進化設定
export const DEFAULT_EVOLUTION_CONFIG: EvolutionConfig = {
  populationSize: 150,          // 個体数
  eliteCount: 5,                // エリート保存数
  selectionPressure: 2.0,       // 選択圧力
  maxGenerations: 100,          // 最大世代数
  fitnessThreshold: undefined   // 早期終了閾値（未設定）
};
```

### パラメータ調整ガイド

#### 問題の複雑さに応じた設定

**簡単な問題（XOR、AND、OR等）**
```typescript
const simpleConfig = {
  populationSize: 50,
  maxGenerations: 50,
  addNodeRate: 0.02,
  addConnectionRate: 0.03
};
```

**中程度の問題（回帰、分類等）**
```typescript
const mediumConfig = {
  populationSize: 150,
  maxGenerations: 200,
  addNodeRate: 0.05,
  addConnectionRate: 0.1
};
```

**複雑な問題（制御、複雑な関数近似等）**
```typescript
const complexConfig = {
  populationSize: 300,
  maxGenerations: 500,
  addNodeRate: 0.08,
  addConnectionRate: 0.15,
  eliteCount: 15
};
```

#### パフォーマンス重視の設定

```typescript
const fastConfig = {
  populationSize: 30,
  maxGenerations: 50,
  mutationCount: 1,
  addNodeRate: 0.01,
  addConnectionRate: 0.02
};
```

#### 高精度重視の設定

```typescript
const precisionConfig = {
  populationSize: 500,
  maxGenerations: 1000,
  eliteCount: 25,
  addNodeRate: 0.1,
  addConnectionRate: 0.2,
  weightMutationRate: 0.9
};
```

---

## アーキテクチャと設計

### SOLID原則の実装

#### 1. 単一責任原則 (SRP)
各クラスは単一の責任を持ちます：

```typescript
// ✅ 良い例：各クラスが明確な責任を持つ
class Genome {          // ゲノム表現のみ
class Network {         // ネットワーク実行のみ
class Mutator {         // 突然変異操作のみ
class EvolutionEngine { // 進化アルゴリズムのみ
```

#### 2. 開放閉鎖原則 (OCP)
拡張に対して開放的、修正に対して閉鎖的：

```typescript
// 新しい活性化関数を追加
export enum ActivationType {
  None = 0,
  Sigmoid = 1,
  ReLU = 2,
  Tanh = 3,
  // 新しい関数を追加可能
  Swish = 4
}

// 新しい選択アルゴリズムを追加
interface ISelectionStrategy {
  select(population: IGenome[], fitness: number[]): IGenome[];
}

class TournamentSelection implements ISelectionStrategy {
  // 実装...
}

class RouletteWheelSelection implements ISelectionStrategy {
  // 実装...
}
```

#### 3. リスコフ置換原則 (LSP)
インターフェースの実装は置換可能：

```typescript
interface IRandomGenerator {
  random(): number;
  randomInt(max: number): number;
  seed(value: number): void;
}

// どちらの実装も同じように使用可能
class SimpleRandom implements IRandomGenerator { /* ... */ }
class MersenneTwister implements IRandomGenerator { /* ... */ }
```

#### 4. インターフェース分離原則 (ISP)
必要最小限のインターフェース：

```typescript
interface IGenomeReader {
  readonly nodes: readonly INode[];
  readonly connections: readonly IConnection[];
}

interface IGenomeWriter {
  createNode(activation: ActivationType): number;
  createConnection(from: number, to: number, weight: number): boolean;
}

interface IGenome extends IGenomeReader, IGenomeWriter {
  clone(): IGenome;
}
```

#### 5. 依存関係逆転原則 (DIP)
抽象に依存し、具象に依存しない：

```typescript
class NEAT {
  constructor(
    private readonly networkGenerator: INetworkGenerator,
    private readonly mutator: IMutator,
    private readonly evolutionEngine: IEvolutionEngine
  ) {
    // 具象クラスではなくインターフェースに依存
  }
}
```

### コアコンポーネント

#### 1. DAG (有向非巡回グラフ)
```typescript
export class DAG implements IDAG {
  private nodes: IDAGNode[] = [];

  public addNode(id: number, type: NodeType): void {
    this.nodes.push({ id, type, depth: 0 });
  }

  public computeDepth(): void {
    // トポロジカルソートによる深度計算
    // 循環参照の検出と処理
  }

  public getExecutionOrder(): number[] {
    // 実行順序の決定
    return this.nodes
      .sort((a, b) => a.depth - b.depth)
      .map(node => node.id);
  }
}
```

#### 2. Genome (遺伝子表現)
```typescript
export class Genome implements IGenome {
  public nodes: INode[] = [];
  public connections: IConnection[] = [];
  
  constructor(inputs: number, outputs: number) {
    this.initializeTopology(inputs, outputs);
  }

  public createConnection(from: number, to: number, weight: RealType): boolean {
    // 循環チェック
    if (this.wouldCreateCycle(from, to)) {
      return false;
    }
    
    // 重複チェック
    if (this.hasConnection(from, to)) {
      return false;
    }

    this.connections.push({
      from, to, weight,
      enabled: true,
      innovation: this.getNextInnovation()
    });
    
    return true;
  }

  public splitConnection(connectionIndex: number): void {
    // ノード追加による接続分割
    const conn = this.connections[connectionIndex];
    conn.enabled = false;

    const newNodeId = this.createNode(ActivationType.Sigmoid);
    this.createConnection(conn.from, newNodeId, 1.0);
    this.createConnection(newNodeId, conn.to, conn.weight);
  }
}
```

#### 3. Network (実行エンジン)
```typescript
export class Network implements INetwork {
  constructor(
    private readonly nodes: readonly INetworkNode[],
    private readonly connections: readonly INetworkConnection[]
  ) {}

  public execute(inputs: readonly RealType[]): RealType[] {
    // 入力値設定
    this.setInputs(inputs);
    
    // 実行順序に従って計算
    const executionOrder = this.getExecutionOrder();
    
    for (const nodeId of executionOrder) {
      this.computeNodeValue(nodeId);
    }
    
    return this.getOutputs();
  }

  private computeNodeValue(nodeId: number): void {
    const node = this.nodes[nodeId];
    if (node.type === NodeType.Input) return;

    let sum = node.bias;
    
    // 入力接続からの値を集計
    for (const conn of this.connections) {
      if (conn.to === nodeId && conn.enabled) {
        sum += this.nodes[conn.from].value * conn.weight;
      }
    }

    // 活性化関数を適用
    node.value = this.activationFunction.activate(sum);
  }
}
```

---

## パフォーマンス最適化

### 1. メモリ効率化

```typescript
// オブジェクトプールパターン
class GenomePool {
  private pool: Genome[] = [];
  private maxSize = 1000;

  public acquire(inputs: number, outputs: number): Genome {
    if (this.pool.length > 0) {
      const genome = this.pool.pop()!;
      this.resetGenome(genome, inputs, outputs);
      return genome;
    }
    return new Genome(inputs, outputs);
  }

  public release(genome: Genome): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(genome);
    }
  }

  private resetGenome(genome: Genome, inputs: number, outputs: number): void {
    genome.nodes.length = 0;
    genome.connections.length = 0;
    genome.initialize(inputs, outputs);
  }
}
```

### 2. 計算最適化

```typescript
// 並列適応度評価
class ParallelFitnessEvaluator {
  async evaluatePopulation(
    population: IGenome[],
    fitnessFunction: FitnessFunction
  ): Promise<number[]> {
    const batchSize = Math.min(population.length, navigator.hardwareConcurrency || 4);
    const results: number[] = [];

    for (let i = 0; i < population.length; i += batchSize) {
      const batch = population.slice(i, i + batchSize);
      const batchPromises = batch.map(genome => 
        Promise.resolve(fitnessFunction(genome).fitness)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }
}

// キャッシュ機能付きネットワーク
class CachedNetwork implements INetwork {
  private cache = new Map<string, RealType[]>();

  public execute(inputs: readonly RealType[]): RealType[] {
    const key = inputs.join(',');
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const result = this.computeOutput(inputs);
    
    if (this.cache.size < 10000) { // キャッシュサイズ制限
      this.cache.set(key, result);
    }

    return result;
  }
}
```

### 3. アルゴリズム最適化

```typescript
// 効率的な種分化
class EfficientSpeciation {
  private speciesCache = new Map<string, number>();

  public speciate(population: IGenome[], threshold: number): IGenome[][] {
    const species: IGenome[][] = [];
    
    for (const genome of population) {
      const signature = this.getGenomeSignature(genome);
      const cachedSpecies = this.speciesCache.get(signature);
      
      if (cachedSpecies !== undefined && cachedSpecies < species.length) {
        species[cachedSpecies].push(genome);
        continue;
      }

      let assigned = false;
      for (let i = 0; i < species.length; i++) {
        if (this.isCompatible(genome, species[i][0], threshold)) {
          species[i].push(genome);
          this.speciesCache.set(signature, i);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        const newSpeciesIndex = species.length;
        species.push([genome]);
        this.speciesCache.set(signature, newSpeciesIndex);
      }
    }

    return species;
  }

  private getGenomeSignature(genome: IGenome): string {
    return `${genome.nodes.length}-${genome.connections.length}`;
  }
}
```

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. 進化が停滞する

**症状**: 世代を重ねても適応度が向上しない

**原因と解決方法**:
```typescript
// 解決方法1: 突然変異率を上げる
const highMutationConfig = {
  ...DEFAULT_MUTATION_CONFIG,
  addNodeRate: 0.1,           // 増加
  addConnectionRate: 0.15,    // 増加
  weightMutationRate: 0.9     // 増加
};

// 解決方法2: 個体数を増やす
const largerPopulationConfig = {
  ...DEFAULT_EVOLUTION_CONFIG,
  populationSize: 300         // 増加
};

// 解決方法3: 多様性注入
function injectDiversity(population: IGenome[]): IGenome[] {
  const diversityCount = Math.floor(population.length * 0.2);
  const newPopulation = [...population];
  
  for (let i = 0; i < diversityCount; i++) {
    const randomGenome = neat.createGenome(inputs, outputs);
    // ランダム変異を複数回適用
    for (let j = 0; j < 5; j++) {
      neat.mutateGenome(randomGenome);
    }
    newPopulation[newPopulation.length - 1 - i] = randomGenome;
  }
  
  return newPopulation;
}
```

#### 2. 適応度関数の設計問題

**症状**: 期待した行動が学習されない

**解決方法**:
```typescript
// ❌ 悪い適応度関数
const badFitness = (genome) => {
  const network = neat.createNetwork(genome);
  const output = network.execute([1, 0]);
  return { fitness: output[0] }; // 単純すぎる
};

// ✅ 良い適応度関数
const goodFitness = (genome) => {
  const network = neat.createNetwork(genome);
  let fitness = 0;
  
  // 複数のテストケース
  const testCases = generateTestCases();
  
  for (const testCase of testCases) {
    const output = network.execute(testCase.input);
    const error = Math.abs(output[0] - testCase.expected);
    
    // 段階的評価
    if (error < 0.1) {
      fitness += 1.0;
    } else if (error < 0.5) {
      fitness += 0.5;
    } else {
      fitness += Math.max(0, 1.0 - error);
    }
  }
  
  // 正規化
  return { fitness: fitness / testCases.length };
};
```

#### 3. メモリリークの防止

```typescript
// ✅ 適切なメモリ管理
class MemoryEfficientNEAT {
  private genomePool = new GenomePool();
  
  public run(inputs: number, outputs: number, fitnessFunction: FitnessFunction) {
    let population = this.createInitialPopulation(inputs, outputs, 100);
    
    try {
      for (let gen = 0; gen < 100; gen++) {
        const result = this.evolve(population, fitnessFunction);
        
        // 古い個体群をプールに返却
        for (const genome of population) {
          if (genome !== result.bestGenome) {
            this.genomePool.release(genome);
          }
        }
        
        population = result.population;
      }
      
      return { bestGenome: population[0] };
    } finally {
      // 最終クリーンアップ
      for (const genome of population) {
        this.genomePool.release(genome);
      }
    }
  }
}
```

#### 4. 数値精度の問題

```typescript
// 数値安定性の確保
class StableNetwork implements INetwork {
  private readonly EPSILON = 1e-10;
  private readonly MAX_VALUE = 1e6;
  
  private clampValue(value: number): number {
    if (Math.abs(value) < this.EPSILON) return 0;
    if (value > this.MAX_VALUE) return this.MAX_VALUE;
    if (value < -this.MAX_VALUE) return -this.MAX_VALUE;
    if (isNaN(value) || !isFinite(value)) return 0;
    return value;
  }
  
  public execute(inputs: readonly RealType[]): RealType[] {
    // 入力値のチェック
    const safeInputs = inputs.map(input => this.clampValue(input));
    
    // ... 実行処理 ...
    
    // 出力値のチェック
    return outputs.map(output => this.clampValue(output));
  }
}
```

---

## 拡張とカスタマイズ

### 1. カスタム活性化関数

```typescript
// 新しい活性化関数の追加
export enum ActivationType {
  None = 0,
  Sigmoid = 1,
  ReLU = 2,
  Tanh = 3,
  Swish = 4,      // 新追加
  Mish = 5,       // 新追加
  GELU = 6        // 新追加
}

export class ActivationFunction implements IActivationFunction {
  public activate(value: RealType): RealType {
    switch (this.activationType) {
      case ActivationType.None:
        return value;
      case ActivationType.Sigmoid:
        return 1.0 / (1.0 + Math.exp(-4.9 * value));
      case ActivationType.ReLU:
        return Math.max(0, value);
      case ActivationType.Tanh:
        return Math.tanh(value);
      case ActivationType.Swish:
        return value / (1.0 + Math.exp(-value));
      case ActivationType.Mish:
        return value * Math.tanh(Math.log(1.0 + Math.exp(value)));
      case ActivationType.GELU:
        return 0.5 * value * (1.0 + Math.tanh(Math.sqrt(2.0 / Math.PI) * (value + 0.044715 * Math.pow(value, 3))));
      default:
        return value;
    }
  }
}
```

### 2. カスタム選択戦略

```typescript
interface ISelectionStrategy {
  select(
    population: IGenome[], 
    fitness: number[], 
    count: number
  ): IGenome[];
}

// トーナメント選択
class TournamentSelection implements ISelectionStrategy {
  constructor(private tournamentSize: number = 3) {}
  
  select(population: IGenome[], fitness: number[], count: number): IGenome[] {
    const selected: IGenome[] = [];
    
    for (let i = 0; i < count; i++) {
      let bestIndex = Math.floor(Math.random() * population.length);
      let bestFitness = fitness[bestIndex];
      
      for (let j = 1; j < this.tournamentSize; j++) {
        const candidateIndex = Math.floor(Math.random() * population.length);
        if (fitness[candidateIndex] > bestFitness) {
          bestIndex = candidateIndex;
          bestFitness = fitness[candidateIndex];
        }
      }
      
      selected.push(population[bestIndex]);
    }
    
    return selected;
  }
}

// ルーレット選択
class RouletteWheelSelection implements ISelectionStrategy {
  select(population: IGenome[], fitness: number[], count: number): IGenome[] {
    const totalFitness = fitness.reduce((sum, f) => sum + Math.max(0, f), 0);
    if (totalFitness === 0) {
      return this.randomSelection(population, count);
    }
    
    const selected: IGenome[] = [];
    
    for (let i = 0; i < count; i++) {
      const random = Math.random() * totalFitness;
      let sum = 0;
      
      for (let j = 0; j < population.length; j++) {
        sum += Math.max(0, fitness[j]);
        if (sum >= random) {
          selected.push(population[j]);
          break;
        }
      }
    }
    
    return selected;
  }
  
  private randomSelection(population: IGenome[], count: number): IGenome[] {
    const selected: IGenome[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      selected.push(population[randomIndex]);
    }
    return selected;
  }
}
```

### 3. カスタム交叉戦略

```typescript
interface ICrossoverStrategy {
  crossover(parent1: IGenome, parent2: IGenome): IGenome;
}

class NEATCrossover implements ICrossoverStrategy {
  crossover(parent1: IGenome, parent2: IGenome): IGenome {
    // より適応度の高い親を選択
    const [fitter, weaker] = this.orderByFitness(parent1, parent2);
    
    const offspring = new Genome(fitter.info.inputs, fitter.info.outputs);
    
    // ノードをコピー
    this.copyNodes(fitter, offspring);
    
    // 接続を交叉
    this.crossoverConnections(fitter, weaker, offspring);
    
    return offspring;
  }
  
  private crossoverConnections(fitter: IGenome, weaker: IGenome, offspring: IGenome): void {
    const fitterConnections = new Map<string, IConnection>();
    const weakerConnections = new Map<string, IConnection>();
    
    // 接続をマップに変換
    for (const conn of fitter.connections) {
      fitterConnections.set(`${conn.from}-${conn.to}`, conn);
    }
    
    for (const conn of weaker.connections) {
      weakerConnections.set(`${conn.from}-${conn.to}`, conn);
    }
    
    // 交叉実行
    for (const [key, fitterConn] of fitterConnections) {
      const weakerConn = weakerConnections.get(key);
      
      if (weakerConn) {
        // 共通接続：ランダムに選択
        const selectedConn = Math.random() < 0.5 ? fitterConn : weakerConn;
        offspring.createConnection(selectedConn.from, selectedConn.to, selectedConn.weight);
      } else {
        // 適応度の高い親のみの接続：継承
        offspring.createConnection(fitterConn.from, fitterConn.to, fitterConn.weight);
      }
    }
  }
}
```

### 4. 進化統計とモニタリング

```typescript
class EvolutionMonitor {
  private fitnessHistory: number[][] = [];
  private diversityHistory: number[] = [];
  private complexityHistory: { nodes: number[], connections: number[] } = { nodes: [], connections: [] };
  
  public recordGeneration(population: IGenome[], fitness: number[]): void {
    // 適応度統計
    this.fitnessHistory.push([...fitness]);
    
    // 多様性統計
    const diversity = this.calculateDiversity(population);
    this.diversityHistory.push(diversity);
    
    // 複雑性統計
    const avgNodes = population.reduce((sum, g) => sum + g.nodes.length, 0) / population.length;
    const avgConnections = population.reduce((sum, g) => sum + g.connections.length, 0) / population.length;
    this.complexityHistory.nodes.push(avgNodes);
    this.complexityHistory.connections.push(avgConnections);
  }
  
  public generateReport(): string {
    const generations = this.fitnessHistory.length;
    if (generations === 0) return "統計データがありません";
    
    const finalFitness = this.fitnessHistory[generations - 1];
    const maxFitness = Math.max(...finalFitness);
    const avgFitness = finalFitness.reduce((sum, f) => sum + f, 0) / finalFitness.length;
    
    const finalDiversity = this.diversityHistory[generations - 1];
    const finalNodes = this.complexityHistory.nodes[generations - 1];
    const finalConnections = this.complexityHistory.connections[generations - 1];
    
    return `
進化統計レポート
================
世代数: ${generations}
最高適応度: ${maxFitness.toFixed(4)}
平均適応度: ${avgFitness.toFixed(4)}
最終多様性: ${finalDiversity.toFixed(4)}
平均ノード数: ${finalNodes.toFixed(2)}
平均接続数: ${finalConnections.toFixed(2)}

適応度改善率: ${this.calculateImprovementRate().toFixed(4)}
収束状況: ${this.assessConvergence()}
`;
  }
  
  public exportCSV(): string {
    const headers = ['Generation', 'MaxFitness', 'AvgFitness', 'Diversity', 'AvgNodes', 'AvgConnections'];
    const rows = [headers.join(',')];
    
    for (let i = 0; i < this.fitnessHistory.length; i++) {
      const fitness = this.fitnessHistory[i];
      const maxFit = Math.max(...fitness);
      const avgFit = fitness.reduce((sum, f) => sum + f, 0) / fitness.length;
      const diversity = this.diversityHistory[i];
      const nodes = this.complexityHistory.nodes[i];
      const connections = this.complexityHistory.connections[i];
      
      rows.push([i + 1, maxFit, avgFit, diversity, nodes, connections].join(','));
    }
    
    return rows.join('\n');
  }
  
  private calculateDiversity(population: IGenome[]): number {
    let totalDistance = 0;
    let comparisons = 0;
    
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        const distance = this.genomicDistance(population[i], population[j]);
        totalDistance += distance;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalDistance / comparisons : 0;
  }
  
  private genomicDistance(genome1: IGenome, genome2: IGenome): number {
    const nodesDiff = Math.abs(genome1.nodes.length - genome2.nodes.length);
    const connsDiff = Math.abs(genome1.connections.length - genome2.connections.length);
    return (nodesDiff + connsDiff) / Math.max(genome1.nodes.length + genome2.nodes.length, 1);
  }
  
  private calculateImprovementRate(): number {
    if (this.fitnessHistory.length < 2) return 0;
    
    const firstGenFitness = Math.max(...this.fitnessHistory[0]);
    const lastGenFitness = Math.max(...this.fitnessHistory[this.fitnessHistory.length - 1]);
    
    return (lastGenFitness - firstGenFitness) / Math.max(firstGenFitness, 0.001);
  }
  
  private assessConvergence(): string {
    if (this.fitnessHistory.length < 10) return "不明";
    
    const recentFitness = this.fitnessHistory.slice(-10).map(gen => Math.max(...gen));
    const improvement = recentFitness[recentFitness.length - 1] - recentFitness[0];
    
    if (improvement > 0.1) return "急速に改善中";
    if (improvement > 0.01) return "緩やかに改善中";
    if (improvement > 0.001) return "ほぼ収束";
    return "完全に収束";
  }
}

// 使用例
const monitor = new EvolutionMonitor();

for (let gen = 0; gen < 100; gen++) {
  const result = neat.evolve(population, fitnessFunction);
  
  // 統計を記録
  const fitness = result.population.map(genome => fitnessFunction(genome).fitness);
  monitor.recordGeneration(result.population, fitness);
  
  population = result.population;
}

// レポート生成
console.log(monitor.generateReport());

// CSV出力
const csvData = monitor.exportCSV();
console.log(csvData);
```

---

## 最後に

NEAT.jsは、進化的アルゴリズムを使用したニューラルネットワークの構造最適化のための包括的なライブラリです。このドキュメントで示した例とパターンを参考に、あなたの問題に最適なソリューションを構築してください。

### 次のステップ

1. **基本例の実行**: XOR問題から始めてライブラリに慣れる
2. **カスタム問題の実装**: あなたの具体的な問題に適用
3. **パラメータ調整**: 問題に応じた最適な設定を見つける
4. **拡張機能の開発**: 必要に応じてカスタムコンポーネントを実装

### サポートとコミュニティ

- GitHub: [リポジトリURL]
- ドキュメント: [ドキュメントURL]
- 問題報告: [Issues URL]

NEAT.jsを使用した素晴らしいプロジェクトの作成を願っています！

---

*最終更新: 2025年6月23日*
*バージョン: 1.0.0*
