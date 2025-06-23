import { Network, NetworkBuilder } from '../network.js';
import { ActivationFunction } from '../activation.js';
import { ActivationType } from '../types.js';

describe('Network', () => {
  let network: Network;
  
  beforeEach(() => {
    // 2入力、1出力の簡単なネットワークを作成
    const builder = Network.builder()
      .setInfo({ inputs: 2, outputs: 1, hidden: 0 });

    // 入力ノード
    builder
      .addNode(new ActivationFunction(ActivationType.None), 0, 0, 1)
      .addNode(new ActivationFunction(ActivationType.None), 0, 0, 1);

    // 出力ノード
    builder.addNode(new ActivationFunction(ActivationType.Tanh), 0, 1, 0);

    // 接続
    builder
      .addConnection(2, 0.5) // ノード0 -> ノード2
      .addConnection(2, 0.3); // ノード1 -> ノード2

    network = builder.build();
  });

  describe('constructor and properties', () => {
    it('should have correct info', () => {
      expect(network.info.inputs).toBe(2);
      expect(network.info.outputs).toBe(1);
      expect(network.info.hidden).toBe(0);
    });

    it('should have correct max depth', () => {
      expect(network.maxDepth).toBe(1);
    });
  });

  describe('execute', () => {
    it('should execute network with valid inputs', () => {
      const inputs = [1.0, -1.0];
      const outputs = network.execute(inputs);
      
      expect(outputs.length).toBe(1);
      expect(typeof outputs[0]).toBe('number');
      expect(outputs[0]).toBeGreaterThan(-1);
      expect(outputs[0]).toBeLessThan(1);
    });

    it('should throw error with invalid input size', () => {
      expect(() => network.execute([1.0])).toThrow('Input size mismatch');
      expect(() => network.execute([1.0, 2.0, 3.0])).toThrow('Input size mismatch');
    });

    it('should produce consistent outputs for same inputs', () => {
      const inputs = [0.5, -0.3];
      const outputs1 = network.execute(inputs);
      const outputs2 = network.execute(inputs);
      
      expect(outputs1).toEqual(outputs2);
    });

    it('should calculate expected output for simple case', () => {
      const inputs = [1.0, 1.0];
      const outputs = network.execute(inputs);
      
      // 期待される計算: tanh(1.0*0.5 + 1.0*0.3) = tanh(0.8)
      const expected = Math.tanh(0.8);
      expect(outputs[0]).toBeCloseTo(expected, 10);
    });
  });

  describe('getOutputs', () => {
    it('should return last execution outputs', () => {
      const inputs = [0.2, 0.8];
      const executeOutputs = network.execute(inputs);
      const getOutputs = network.getOutputs();
      
      expect(getOutputs).toEqual(executeOutputs);
    });
  });

  describe('reset', () => {    it('should reset network state', () => {
      network.execute([1.0, 1.0]);
      network.reset();
      
      // リセット後は次の実行で適切な値が出力される
      const outputs = network.execute([0.0, 0.0]);
      expect(outputs[0]).toBeCloseTo(0, 5); // 入力が0なのでtanh(0) = 0
    });
  });
});

describe('NetworkBuilder', () => {
  let builder: NetworkBuilder;

  beforeEach(() => {
    builder = Network.builder();
  });

  describe('build', () => {
    it('should throw error if info not set', () => {
      expect(() => builder.build()).toThrow('Network info must be set before building');
    });

    it('should build network with correct structure', () => {
      const network = builder
        .setInfo({ inputs: 1, outputs: 1, hidden: 0 })
        .addNode(new ActivationFunction(ActivationType.None), 0, 0, 1)
        .addNode(new ActivationFunction(ActivationType.Tanh), 0.5, 1, 0)
        .addConnection(1, 2.0)
        .build();

      expect(network.info.inputs).toBe(1);
      expect(network.info.outputs).toBe(1);
      expect(network.maxDepth).toBe(1);
    });
  });

  describe('method chaining', () => {
    it('should support fluent interface', () => {
      const result = builder
        .setInfo({ inputs: 2, outputs: 1, hidden: 1 })
        .addNode(new ActivationFunction(ActivationType.None), 0, 0, 1)
        .addNode(new ActivationFunction(ActivationType.ReLU), 0, 1, 1)
        .addNode(new ActivationFunction(ActivationType.Tanh), 0, 2, 0)
        .addConnection(1, 1.0)
        .addConnection(2, 1.0);

      expect(result).toBe(builder);
    });
  });
});
