# NEAT.js

**NEAT (NeuroEvolution of Augmenting Topologies)** の TypeScript 実装。進化的アルゴリズムを使用してニューラルネットワークの構造と重みを同時に最適化します。

## インストール

```html
<script src="release/neat.js"></script>
<script>
  const neat = new NEAT.NEAT();
</script>
```

## 基本的な使用方法

### 1. 簡単な例

```typescript
import { NEAT, DEFAULT_MUTATION_CONFIG, DEFAULT_EVOLUTION_CONFIG } from 'neat-js';

// NEATインスタンスを作成
const neat = new NEAT();

// 適応度関数を定義（XOR問題）
const fitnessFunction = (genome) => {
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
    fitness += 1.0 - error;
  }

  return { fitness: Math.max(0, fitness) };
};

// 進化設定
const evolutionConfig = {
  ...DEFAULT_EVOLUTION_CONFIG,
  maxGenerations: 100,
  populationSize: 150,
  eliteCount: 5
};

const mutationConfig = {
  ...DEFAULT_MUTATION_CONFIG,
  addNodeRate: 0.03,
  addConnectionRate: 0.05
};

// 進化を実行
const result = neat.run(
  2, // 入力数
  1, // 出力数
  fitnessFunction,
  evolutionConfig,
  mutationConfig
);

console.log(`最高適応度: ${result.bestFitness}`);
console.log(`世代数: ${result.generation}`);

// 最良のネットワークをテスト
const bestNetwork = neat.createNetwork(result.bestGenome);
console.log('XOR(0,0):', bestNetwork.execute([0, 0])[0]);
console.log('XOR(0,1):', bestNetwork.execute([0, 1])[0]);
console.log('XOR(1,0):', bestNetwork.execute([1, 0])[0]);
console.log('XOR(1,1):', bestNetwork.execute([1, 1])[0]);
```

### 2. 非線形回帰問題

```typescript
import { NEAT, DEFAULT_MUTATION_CONFIG, DEFAULT_EVOLUTION_CONFIG } from 'neat-js';

// sin(x) + y 関数の学習
const neat = new NEAT({ seed: 123 });

const regressionFitnessFunction = (genome) => {
  const network = neat.createNetwork(genome);
  let totalError = 0;
  let testCount = 0;

  // 0からπまでの範囲でテスト
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      const x = (i / 19) * Math.PI;
      const y = (j / 19) * 2 - 1;
      const expected = Math.sin(x) + y;
      
      const output = network.execute([x / Math.PI, y]);
      const prediction = output[0];
      const error = Math.abs(prediction - expected);
      totalError += error;
      testCount++;
    }
  }

  const averageError = totalError / testCount;
  const fitness = Math.max(0, 10.0 / (1.0 + averageError));
  
  return { fitness: fitness };
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

const result = neat.run(2, 1, regressionFitnessFunction, evolutionConfig, mutationConfig);
console.log(`sin(x) + y学習完了: 適応度 ${result.bestFitness.toFixed(4)}`);
```

### 3. 倒立振子の制御（実装例）

```typescript
import { NEAT, DEFAULT_MUTATION_CONFIG, DEFAULT_EVOLUTION_CONFIG } from 'neat-js';

class CartPoleEnvironment {
  private x = 0;         // カートの位置
  private xDot = 0;      // カートの速度
  private theta = 0.1;   // ポールの角度
  private thetaDot = 0;  // ポールの角速度

  public step(action: number): { state: number[], reward: number, done: boolean } {
    const force = action * 10; // アクションを力に変換
    
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

    this.x += this.xDot * dt;
    this.xDot += xAcc * dt;
    this.theta += this.thetaDot * dt;
    this.thetaDot += thetaAcc * dt;

    const state = [this.x, this.xDot, this.theta, this.thetaDot];
    const done = Math.abs(this.theta) > 0.5 || Math.abs(this.x) > 2.4;
    const reward = done ? 0 : 1;

    return { state, reward, done };
  }

  public reset(): number[] {
    this.x = (Math.random() - 0.5) * 0.1;
    this.xDot = 0;
    this.theta = (Math.random() - 0.5) * 0.1;
    this.thetaDot = 0;
    return [this.x, this.xDot, this.theta, this.thetaDot];
  }
}

// 倒立振子の適応度関数
const cartPoleFitness = (genome) => {
  const neat = new NEAT();
  const network = neat.createNetwork(genome);
  const env = new CartPoleEnvironment();
  
  let totalReward = 0;
  let state = env.reset();
  
  for (let step = 0; step < 500; step++) {
    const output = network.execute(state);
    const action = output[0]; // -1 to 1
    
    const result = env.step(action);
    totalReward += result.reward;
    state = result.state;
    
    if (result.done) break;
  }
  
  // 追加の報酬：角速度が小さいほど良い
  const stabilityBonus = totalReward / (1 + Math.abs(state[3]));
  
  return { fitness: stabilityBonus };
};

// 進化を実行
const neat = new NEAT({ seed: 42 });
const result = neat.run(4, 1, cartPoleFitness, {
  ...DEFAULT_EVOLUTION_CONFIG,
  maxGenerations: 50,
  populationSize: 100,
  eliteCount: 3
});

console.log(`最高適応度: ${result.bestFitness}`);
```

## API リファレンス

### NEAT クラス

#### コンストラクタ
```typescript
new NEAT(options?: {
  seed?: number;
  mutationConfig?: Partial<MutationConfig>;
  evolutionConfig?: Partial<EvolutionConfig>;
  useSimpleRandom?: boolean;
})
```

#### メソッド

- `createGenome(inputs: number, outputs: number): IGenome`
- `createNetwork(genome: IGenome): INetwork`
- `mutateGenome(genome: IGenome, config?: MutationConfig): IGenome`
- `createInitialPopulation(inputs: number, outputs: number, size: number, mutationConfig?: MutationConfig): readonly IGenome[]`
- `evolve(population: readonly IGenome[], fitnessFunction: FitnessFunction, evolutionConfig?: EvolutionConfig, mutationConfig?: MutationConfig): IEvolutionResult`
- `run(inputs: number, outputs: number, fitnessFunction: FitnessFunction, evolutionConfig?: EvolutionConfig, mutationConfig?: MutationConfig): IEvolutionResult`
- `setSeed(seed: number): void`
- `getStats(population: readonly IGenome[]): PopulationStats`

### 型定義

#### MutationConfig
```typescript
interface MutationConfig {
  weightMutationRate: number;    // 重み変異率 (デフォルト: 0.8)
  biasMutationRate: number;      // バイアス変異率 (デフォルト: 0.7)
  addNodeRate: number;           // ノード追加率 (デフォルト: 0.03)
  addConnectionRate: number;     // 接続追加率 (デフォルト: 0.05)
  weightRange: number;           // 重み範囲 (デフォルト: 2.0)
  weightSmallRange: number;      // 小さな変異の範囲 (デフォルト: 0.1)
  newValueProbability: number;   // 新しい値の確率 (デフォルト: 0.1)
  maxHiddenNodes: number;        // 最大隠れノード数 (デフォルト: 100)
  mutationCount: number;         // 変異回数 (デフォルト: 3)
}
```

#### EvolutionConfig
```typescript
interface EvolutionConfig {
  populationSize: number;        // 個体数 (デフォルト: 150)
  eliteCount: number;            // エリート数 (デフォルト: 5)
  selectionPressure: number;     // 選択圧 (デフォルト: 2.0)
  maxGenerations: number;        // 最大世代数 (デフォルト: 100)
  fitnessThreshold?: number;     // 早期終了閾値 (オプション)
}
```

#### FitnessFunction
```typescript
type FitnessFunction<T = unknown> = (genome: IGenome, context?: T) => { fitness: number };
```

### デフォルト設定

```typescript
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
  maxGenerations: 100,
  fitnessThreshold: undefined // オプション: 早期終了用閾値
};
```

## デモとテスト

プロジェクトには以下のデモスクリプトが含まれています：

```bash
# XOR問題の学習テスト
npm run demo:xor

# sin(x) + y 回帰学習テスト  
npm run demo:sin

# 倒立振子制御テスト
npm run demo:cartpole
```

### 主要コンポーネント

- **DAG**: 有向非巡回グラフの実装
- **Genome**: ネットワークの設計図
- **Network**: 実行可能なニューラルネットワーク
- **NetworkGenerator**: ゲノムからネットワークを生成
- **Mutator**: 突然変異操作
- **EvolutionEngine**: 進化アルゴリズムの実装

## ライセンス

MIT