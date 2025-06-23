// ビルド済みのneat.jsを使用
const { NEAT, DEFAULT_MUTATION_CONFIG, DEFAULT_EVOLUTION_CONFIG } = require('./dist/neat.js');

console.log('🧠 NEAT.js XOR学習テスト開始...\n');

// NEATインスタンスを作成（ランダムシードで実行）
const neat = new NEAT({ seed: Math.floor(Math.random() * 10000) });

// XOR問題の適応度関数（改良版）
const xorFitnessFunction = (genome) => {
  const network = neat.createNetwork(genome);
  let fitness = 0;

  const testCases = [
    { input: [0, 0], expected: 0 },
    { input: [0, 1], expected: 1 },
    { input: [1, 0], expected: 1 },
    { input: [1, 1], expected: 0 }
  ];

  for (const testCase of testCases) {
    try {
      const output = network.execute(testCase.input);
      const error = Math.abs(output[0] - testCase.expected);
      
      // 二次的な適応度計算（より厳しい評価）
      if (error < 0.1) {
        fitness += 1.0; // ほぼ完璧
      } else if (error < 0.3) {
        fitness += 0.8; // 良い
      } else if (error < 0.5) {
        fitness += 0.5; // 普通
      } else {
        fitness += Math.max(0, 1.0 - error); // 線形減少
      }
    } catch (e) {
      fitness += 0; // エラーが発生した場合はフィットネス0
    }
  }

  return { fitness: Math.max(0, fitness) };
};

// 進化設定
const evolutionConfig = {
  ...DEFAULT_EVOLUTION_CONFIG,
  populationSize: 150,
  maxGenerations: 500,
  eliteCount: 5
};

const mutationConfig = {
  ...DEFAULT_MUTATION_CONFIG,
  addNodeRate: 0.03,
  addConnectionRate: 0.15,
  weightMutationRate: 0.9
};

console.log('📊 設定:');
console.log(`  - 個体数: ${evolutionConfig.populationSize}`);
console.log(`  - 最大世代数: ${evolutionConfig.maxGenerations}`);
console.log(`  - エリート数: ${evolutionConfig.eliteCount}`);
console.log(`  - ノード追加率: ${mutationConfig.addNodeRate}`);
console.log(`  - 接続追加率: ${mutationConfig.addConnectionRate}\n`);

console.log('🚀 進化開始...\n');

const startTime = Date.now();

try {
  // 進化を実行
  const result = neat.run(
    2, // 入力数（XORの2つの入力）
    1, // 出力数（XORの1つの出力）
    xorFitnessFunction,
    evolutionConfig,
    mutationConfig
  );

  const endTime = Date.now();
  const executionTime = (endTime - startTime) / 1000;

  console.log('✅ 進化完了!\n');
  console.log('📈 結果:');
  console.log(`  - 最終世代: ${result.generation}`);
  console.log(`  - 最高適応度: ${result.bestFitness.toFixed(6)}`);
  console.log(`  - 実行時間: ${executionTime.toFixed(2)}秒\n`);

  // 個体群の統計
  const stats = neat.getStats(result.population);
  console.log('📊 個体群統計:');
  console.log(`  - 平均ノード数: ${stats.averageNodes.toFixed(2)}`);
  console.log(`  - 平均接続数: ${stats.averageConnections.toFixed(2)}`);
  console.log(`  - 最大ノード数: ${stats.maxNodes}`);
  console.log(`  - 最大接続数: ${stats.maxConnections}\n`);

  // 適応度の履歴を表示
  console.log('📉 適応度履歴 (最後の10世代):');
  const recentHistory = result.fitnessHistory.slice(-100);
  recentHistory.forEach((fitness, index) => {
    const generation = result.generation - recentHistory.length + index + 1;
    console.log(`  世代 ${generation.toString().padStart(3)}: ${fitness.toFixed(6)}`);
  });
  console.log();

  // 最良のネットワークでXORテストを実行
  console.log('🧪 最良ネットワークのXORテスト:');
  const bestNetwork = neat.createNetwork(result.bestGenome);
  
  const testCases = [
    { input: [0, 0], expected: 0 },
    { input: [0, 1], expected: 1 },
    { input: [1, 0], expected: 1 },
    { input: [1, 1], expected: 0 }
  ];

  let correctPredictions = 0;
  let totalError = 0;

  for (const testCase of testCases) {
    const output = bestNetwork.execute(testCase.input);
    const prediction = output[0];
    const error = Math.abs(prediction - testCase.expected);
    const isCorrect = error < 0.5; // 0.5を閾値として正解判定
    
    totalError += error;
    if (isCorrect) correctPredictions++;

    const status = isCorrect ? '✅' : '❌';
    console.log(`  ${status} XOR(${testCase.input.join(',')}) = ${prediction.toFixed(6)} (期待値: ${testCase.expected}, 誤差: ${error.toFixed(6)})`);
  }

  console.log();
  console.log('📊 テスト結果サマリー:');
  console.log(`  - 正解数: ${correctPredictions}/4 (${(correctPredictions/4*100).toFixed(1)}%)`);
  console.log(`  - 平均誤差: ${(totalError/4).toFixed(6)}`);
  console.log(`  - 最終適応度: ${result.bestFitness.toFixed(6)}/4.0`);

  // 学習成功の判定
  const successThreshold = 3.5; // 4点満点中3.5点以上で成功
  const isLearningSuccessful = result.bestFitness >= successThreshold;
  
  console.log();
  if (isLearningSuccessful) {
    console.log('🎉 XOR学習成功! NEATアルゴリズムが正常に動作しています。');
    console.log(`   (適応度 ${result.bestFitness.toFixed(6)} >= 閾値 ${successThreshold})`);
  } else {
    console.log('⚠️  XOR学習が不完全です。より多くの世代が必要かもしれません。');
    console.log(`   (適応度 ${result.bestFitness.toFixed(6)} < 閾値 ${successThreshold})`);
  }

  // 進化の収束性をチェック
  if (result.fitnessHistory.length >= 10) {
    const lastTenGenerations = result.fitnessHistory.slice(-10);
    const improvement = lastTenGenerations[lastTenGenerations.length - 1] - lastTenGenerations[0];
    
    console.log();
    console.log('📈 進化の収束性:');
    console.log(`  - 最後の10世代での改善: ${improvement.toFixed(6)}`);
    
    if (improvement > 0.1) {
      console.log('  - 状態: まだ改善中 🔄');
    } else if (improvement > 0.01) {
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

console.log('\n🏁 XOR学習テスト完了');
