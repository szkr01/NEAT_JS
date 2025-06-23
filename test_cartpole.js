// ビルド済みのneat.jsを使用
const { NEAT, DEFAULT_MUTATION_CONFIG, DEFAULT_EVOLUTION_CONFIG } = require('./dist/neat.js');

console.log('🧠 NEAT.js 倒立振子制御テスト開始...\n');

// 倒立振子環境のクラス
class CartPoleEnvironment {
  constructor() {
    this.reset();
  }

  step(action) {
    const force = action * 10; // アクションを力に変換
    
    // 物理シミュレーション（簡略化）
    const gravity = 19.8;
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

  reset() {
    this.x = (Math.random() - 0.5) * 0.1;
    this.xDot = 0;
    this.theta = (Math.random() - 0.5) * 0.1;
    this.thetaDot = 0;
    return [this.x, this.xDot, this.theta, this.thetaDot];
  }
}

// NEATインスタンスを作成
const neat = new NEAT({ seed: Math.floor(Math.random() * 10000) });

// 倒立振子の適応度関数
const cartPoleFitnessFunction = (genome) => {
  const network = neat.createNetwork(genome);
  const env = new CartPoleEnvironment();
  
  let totalReward = 0;
  let state = env.reset();
  
  try {
    for (let step = 0; step < 500; step++) {
      const output = network.execute(state);
      const action = Math.tanh(output[0]); // -1 to 1の範囲にクランプ
      
      const result = env.step(action);
      totalReward += result.reward;
      state = result.state;
      
      if (result.done) break;
    }
  } catch (e) {
    totalReward = 0; // エラーが発生した場合は0
  }
  
  // 追加の報酬：角速度が小さいほど良い
  const stabilityBonus = totalReward / (1 + Math.abs(state[3]));
  
  return { fitness: stabilityBonus };
};

// 進化設定（制御問題用に調整）
const evolutionConfig = {
  ...DEFAULT_EVOLUTION_CONFIG,
  populationSize: 100,
  maxGenerations: 100,
  eliteCount: 10,
  fitnessThreshold: 400 // 400ステップ以上安定すれば成功
};

const mutationConfig = {
  ...DEFAULT_MUTATION_CONFIG,
  addNodeRate: 0.02,
  addConnectionRate: 0.08,
  weightMutationRate: 0.9,
  maxHiddenNodes: 20
};

console.log('📊 設定:');
console.log(`  - 個体数: ${evolutionConfig.populationSize}`);
console.log(`  - 最大世代数: ${evolutionConfig.maxGenerations}`);
console.log(`  - エリート数: ${evolutionConfig.eliteCount}`);
console.log(`  - 成功閾値: ${evolutionConfig.fitnessThreshold}ステップ`);
console.log(`  - ノード追加率: ${mutationConfig.addNodeRate}`);
console.log(`  - 接続追加率: ${mutationConfig.addConnectionRate}\n`);

console.log('🚀 進化開始...\n');

const startTime = Date.now();

try {
  // 進化を実行
  const result = neat.run(
    4, // 入力数（x, xDot, theta, thetaDot）
    1, // 出力数（action）
    cartPoleFitnessFunction,
    evolutionConfig,
    mutationConfig
  );

  const endTime = Date.now();
  const executionTime = (endTime - startTime) / 1000;

  console.log('✅ 進化完了!\n');
  console.log('📈 結果:');
  console.log(`  - 最終世代: ${result.generation}`);
  console.log(`  - 最高適応度: ${result.bestFitness.toFixed(2)}`);
  console.log(`  - 実行時間: ${executionTime.toFixed(2)}秒\n`);

  // 個体群の統計
  const stats = neat.getStats(result.population);
  console.log('📊 個体群統計:');
  console.log(`  - 平均ノード数: ${stats.averageNodes.toFixed(2)}`);
  console.log(`  - 平均接続数: ${stats.averageConnections.toFixed(2)}`);
  console.log(`  - 最大ノード数: ${stats.maxNodes}`);
  console.log(`  - 最大接続数: ${stats.maxConnections}\n`);

  // 適応度の履歴を表示（最後の10世代）
  console.log('📉 適応度履歴 (最後の10世代):');
  const recentHistory = result.fitnessHistory.slice(-10);
  recentHistory.forEach((fitness, index) => {
    const generation = result.generation - recentHistory.length + index + 1;
    console.log(`  世代 ${generation.toString().padStart(3)}: ${fitness.toFixed(2)}`);
  });
  console.log();

  // 最良のネットワークで倒立振子テストを実行
  console.log('🧪 最良ネットワークのテスト (3回実行):');
  const bestNetwork = neat.createNetwork(result.bestGenome);
  
  let totalTestSteps = 0;
  const testRuns = 3;

  for (let run = 0; run < testRuns; run++) {
    const env = new CartPoleEnvironment();
    let state = env.reset();
    let steps = 0;

    for (let step = 0; step < 500; step++) {
      const output = bestNetwork.execute(state);
      const action = Math.tanh(output[0]);
      
      const result = env.step(action);
      state = result.state;
      steps++;
      
      if (result.done) break;
    }

    totalTestSteps += steps;
    console.log(`  実行 ${run + 1}: ${steps}ステップ維持`);
  }

  const averageSteps = totalTestSteps / testRuns;
  console.log(`  平均: ${averageSteps.toFixed(1)}ステップ\n`);

  // 学習成功の判定
  const isLearningSuccessful = result.bestFitness >= evolutionConfig.fitnessThreshold;
  
  console.log('📊 制御結果サマリー:');
  console.log(`  - 最高適応度: ${result.bestFitness.toFixed(2)}`);
  console.log(`  - 平均制御時間: ${averageSteps.toFixed(1)}ステップ`);
  
  if (isLearningSuccessful) {
    console.log('🎉 倒立振子制御成功! NEATアルゴリズムが制御問題を解決できています。');
    console.log(`   (適応度 ${result.bestFitness.toFixed(2)} >= 閾値 ${evolutionConfig.fitnessThreshold})`);
  } else if (averageSteps > 200) {
    console.log('👍 倒立振子制御が部分的に成功しています。');
    console.log(`   (平均 ${averageSteps.toFixed(1)}ステップの制御を達成)`);
  } else {
    console.log('⚠️  倒立振子制御が不完全です。より多くの世代やパラメータ調整が必要かもしれません。');
    console.log(`   (適応度 ${result.bestFitness.toFixed(2)} < 閾値 ${evolutionConfig.fitnessThreshold})`);
  }

  // 進化の収束性をチェック
  if (result.fitnessHistory.length >= 10) {
    const lastTenGenerations = result.fitnessHistory.slice(-10);
    const improvement = lastTenGenerations[lastTenGenerations.length - 1] - lastTenGenerations[0];
    
    console.log();
    console.log('📈 進化の収束性:');
    console.log(`  - 最後の10世代での改善: ${improvement.toFixed(2)}`);
    
    if (improvement > 50) {
      console.log('  - 状態: 急速に改善中 🚀');
    } else if (improvement > 10) {
      console.log('  - 状態: まだ改善中 🔄');
    } else if (improvement > 1) {
      console.log('  - 状態: 緩やかに改善中 📈');
    } else {
      console.log('  - 状態: 収束済み ✅');
    }
  }

} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  console.error(error.stack);
  process.exit(1);
}

console.log('\n🏁 倒立振子制御テスト完了');
