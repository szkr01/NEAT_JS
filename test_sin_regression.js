// ビルド済みのneat.jsを使用
const { NEAT, DEFAULT_MUTATION_CONFIG, DEFAULT_EVOLUTION_CONFIG } = require('./dist/neat.js');

console.log('🧠 NEAT.js sin(x) + y 回帰学習テスト開始...\n');

// NEATインスタンスを作成（ランダムシードで実行）
const neat = new NEAT({ seed: Math.floor(Math.random() * 10000) });

// sin(x) + y 問題の適応度関数
const sinRegressionFitnessFunction = (genome) => {
  const network = neat.createNetwork(genome);
  let totalError = 0;
  let testCount = 0;

  // 0からπまでの範囲で複数のテストケースを生成
  const numSamples = 20; // テストサンプル数
  
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
  // フィットネスは誤差の逆数（誤差が小さいほど高い適応度）
  const fitness = Math.max(0, 10.0 / (1.0 + averageError));
  
  return { fitness: fitness };
};

// 進化設定（複雑な問題なのでより多くのリソースを使用）
const evolutionConfig = {
  ...DEFAULT_EVOLUTION_CONFIG,
  populationSize: 500,
  maxGenerations: 1000,
  eliteCount: 20,
  fitnessThreshold: 8.0 // より高い閾値を設定
};

const mutationConfig = {
  ...DEFAULT_MUTATION_CONFIG,
  addNodeRate: 0.05,
  addConnectionRate: 0.2,
  weightMutationRate: 0.8,
  weightMutationStrength: 2.0
};

console.log('📊 設定:');
console.log(`  - 個体数: ${evolutionConfig.populationSize}`);
console.log(`  - 最大世代数: ${evolutionConfig.maxGenerations}`);
console.log(`  - エリート数: ${evolutionConfig.eliteCount}`);
console.log(`  - 適応度閾値: ${evolutionConfig.fitnessThreshold}`);
console.log(`  - ノード追加率: ${mutationConfig.addNodeRate}`);
console.log(`  - 接続追加率: ${mutationConfig.addConnectionRate}`);
console.log(`  - 重み変異率: ${mutationConfig.weightMutationRate}\n`);

console.log('🚀 進化開始...\n');

const startTime = Date.now();

try {
  // 進化を実行
  const result = neat.run(
    2, // 入力数（x, y）
    1, // 出力数（sin(x) + y）
    sinRegressionFitnessFunction,
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

  // 適応度の履歴を表示（最後の20世代）
  console.log('📉 適応度履歴 (最後の20世代):');
  const recentHistory = result.fitnessHistory.slice(-20);
  recentHistory.forEach((fitness, index) => {
    const generation = result.generation - recentHistory.length + index + 1;
    console.log(`  世代 ${generation.toString().padStart(3)}: ${fitness.toFixed(6)}`);
  });
  console.log();

  // 最良のネットワークでsin(x) + yテストを実行
  console.log('🧪 最良ネットワークの回帰テスト:');
  const bestNetwork = neat.createNetwork(result.bestGenome);
  
  // 特定のテストポイントで精度を確認
  const testPoints = [
    { x: 0, y: 0 },
    { x: Math.PI/4, y: 0.5 },
    { x: Math.PI/2, y: -0.5 },
    { x: 3*Math.PI/4, y: 0.2 },
    { x: Math.PI, y: -0.8 }
  ];

  let totalAbsError = 0;
  let maxError = 0;

  console.log('  サンプルテスト結果:');
  for (const point of testPoints) {
    const expected = Math.sin(point.x) + point.y;
    const output = bestNetwork.execute([point.x / Math.PI, point.y]);
    const prediction = output[0];
    const error = Math.abs(prediction - expected);
    const relativeError = Math.abs(error / expected) * 100;
    
    totalAbsError += error;
    maxError = Math.max(maxError, error);

    console.log(`    x=${point.x.toFixed(3)}, y=${point.y.toFixed(3)}: 予測=${prediction.toFixed(4)}, 実際=${expected.toFixed(4)}, 誤差=${error.toFixed(4)} (${relativeError.toFixed(1)}%)`);
  }

  console.log();
  console.log('📊 テスト結果サマリー:');
  console.log(`  - 平均絶対誤差: ${(totalAbsError / testPoints.length).toFixed(6)}`);
  console.log(`  - 最大誤差: ${maxError.toFixed(6)}`);
  console.log(`  - 最終適応度: ${result.bestFitness.toFixed(6)}/10.0`);

  // より詳細な精度テスト
  console.log('\n🔬 詳細精度テスト (100サンプル):');
  let detailedTotalError = 0;
  let detailedTestCount = 0;
  
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const x = (i / 9) * Math.PI;
      const y = (j / 9) * 2 - 1;
      const expected = Math.sin(x) + y;
      const output = bestNetwork.execute([x / Math.PI, y]);
      const prediction = output[0];
      const error = Math.abs(prediction - expected);
      
      detailedTotalError += error;
      detailedTestCount++;
    }
  }

  const averageDetailedError = detailedTotalError / detailedTestCount;
  console.log(`  - 100サンプル平均誤差: ${averageDetailedError.toFixed(6)}`);

  // 学習成功の判定
  const successThreshold = 8.0; // 10点満点中8点以上で成功
  const isLearningSuccessful = result.bestFitness >= successThreshold;
  
  console.log();
  if (isLearningSuccessful) {
    console.log('🎉 sin(x) + y学習成功! NEATアルゴリズムが複雑な関数を学習できています。');
    console.log(`   (適応度 ${result.bestFitness.toFixed(6)} >= 閾値 ${successThreshold})`);
  } else {
    console.log('⚠️  sin(x) + y学習が不完全です。より多くの世代やパラメータ調整が必要かもしれません。');
    console.log(`   (適応度 ${result.bestFitness.toFixed(6)} < 閾値 ${successThreshold})`);
  }

  // 進化の収束性をチェック
  if (result.fitnessHistory.length >= 20) {
    const lastGenerations = result.fitnessHistory.slice(-20);
    const improvement = lastGenerations[lastGenerations.length - 1] - lastGenerations[0];
    
    console.log();
    console.log('📈 進化の収束性:');
    console.log(`  - 最後の20世代での改善: ${improvement.toFixed(6)}`);
    
    if (improvement > 0.5) {
      console.log('  - 状態: 急速に改善中 🚀');
    } else if (improvement > 0.1) {
      console.log('  - 状態: まだ改善中 🔄');
    } else if (improvement > 0.01) {
      console.log('  - 状態: 緩やかに改善中 📈');
    } else {
      console.log('  - 状態: 収束済み ✅');
    }
  }

  // 関数近似の可視化データ（CSVファイル出力）
  console.log('\n📄 結果データをCSVファイルに出力中...');
  const fs = require('fs');
  let csvContent = 'x,y,expected,predicted,error\n';
  
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      const x = (i / 19) * Math.PI;
      const y = (j / 19) * 2 - 1;
      const expected = Math.sin(x) + y;
      const output = bestNetwork.execute([x / Math.PI, y]);
      const prediction = output[0];
      const error = Math.abs(prediction - expected);
      
      csvContent += `${x.toFixed(6)},${y.toFixed(6)},${expected.toFixed(6)},${prediction.toFixed(6)},${error.toFixed(6)}\n`;
    }
  }
  
  fs.writeFileSync('sin_regression_results.csv', csvContent);
  console.log('  - 結果データを sin_regression_results.csv に保存しました');

} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  console.error(error.stack);
  process.exit(1);
}

console.log('\n🏁 sin(x) + y 回帰学習テスト完了');
