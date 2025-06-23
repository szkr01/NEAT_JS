import { NetworkGenerator, NetworkGeneratorFactory } from '../network-generator.js';
import { Genome } from '../genome.js';
import { ActivationType } from '../types.js';

describe('NetworkGenerator', () => {
  let generator: NetworkGenerator;
  let genome: Genome;

  beforeEach(() => {
    generator = new NetworkGenerator();
    genome = new Genome(2, 1); // 2入力、1出力
  });

  describe('generate', () => {
    it('should generate network from simple genome', () => {
      // 接続を追加
      genome.createConnection(0, 2, 0.5);
      genome.createConnection(1, 2, -0.3);

      const network = generator.generate(genome);

      expect(network.info).toEqual(genome.info);
      expect(network.maxDepth).toBeGreaterThan(0);
    });

    it('should generate network with hidden nodes', () => {
      // 隠れノードを追加
      const hiddenId = genome.createNode(ActivationType.ReLU);
      genome.createConnection(0, hiddenId, 0.8);
      genome.createConnection(1, hiddenId, 0.6);
      genome.createConnection(hiddenId, 2, 1.2);

      const network = generator.generate(genome);

      expect(network.info.hidden).toBe(1);
      
      // ネットワークが実行可能であることを確認
      const outputs = network.execute([1.0, -1.0]);
      expect(outputs.length).toBe(1);
      expect(typeof outputs[0]).toBe('number');
    });    it('should handle complex topology', () => {
      // 複雑なトポロジーを作成
      const hidden1 = genome.createNode(ActivationType.ReLU);
      const hidden2 = genome.createNode(ActivationType.Sigmoid);
      
      genome.createConnection(0, hidden1, 0.5);
      genome.createConnection(1, hidden1, 0.3);
      genome.createConnection(0, hidden2, 0.7);
      genome.createConnection(hidden1, hidden2, 0.9);
      genome.createConnection(hidden1, 2, 0.4);
      genome.createConnection(hidden2, 2, 0.6);

      const network = generator.generate(genome);

      expect(network.info.hidden).toBe(2);
      
      // ネットワークが実行可能であることを確認
      const outputs = network.execute([1.0, 0.5]);
      expect(outputs.length).toBe(1);
      expect(typeof outputs[0]).toBe('number');
      expect(isNaN(outputs[0])).toBe(false);
    });

    it('should respect node ordering', () => {
      const hiddenId = genome.createNode(ActivationType.ReLU);
      genome.createConnection(0, hiddenId, 1.0);
      genome.createConnection(hiddenId, 2, 1.0);

      const network = generator.generate(genome);
      
      // 入力 -> 隠れ -> 出力の順序で処理されることを確認
      const output = network.execute([2.0, 0.0]);
      
      // ReLU(2.0) = 2.0, tanh(2.0) ≈ 0.964
      expect(output[0]).toBeCloseTo(Math.tanh(2.0), 5);
    });

    it('should handle disabled connections', () => {
      genome.createConnection(0, 2, 1.0);
      genome.createConnection(1, 2, 1.0);
      
      // 接続を分割（元の接続が無効化される）
      genome.splitConnection(0);

      const network = generator.generate(genome);
      
      // ネットワークが正しく生成されることを確認
      expect(network.info.hidden).toBe(1);
      
      const output = network.execute([1.0, 1.0]);
      expect(output.length).toBe(1);
    });
  });
});

describe('NetworkGeneratorFactory', () => {
  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = NetworkGeneratorFactory.getInstance();
      const instance2 = NetworkGeneratorFactory.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('createGenerator', () => {
    it('should create new instances', () => {
      const generator1 = NetworkGeneratorFactory.createGenerator();
      const generator2 = NetworkGeneratorFactory.createGenerator();
      
      expect(generator1).not.toBe(generator2);
      expect(generator1).toBeInstanceOf(NetworkGenerator);
      expect(generator2).toBeInstanceOf(NetworkGenerator);
    });
  });
});
