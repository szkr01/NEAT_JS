import { Genome } from '../genome.js';
import { ActivationType, NodeType } from '../types.js';

describe('Genome', () => {
  let genome: Genome;

  beforeEach(() => {
    genome = new Genome(2, 1); // 2入力、1出力
  });

  describe('constructor', () => {
    it('should create genome with correct info', () => {
      expect(genome.info.inputs).toBe(2);
      expect(genome.info.outputs).toBe(1);
      expect(genome.info.hidden).toBe(0);
    });

    it('should create input and output nodes', () => {
      expect(genome.nodes.length).toBe(3);
      
      // 入力ノード
      expect(genome.nodes[0].type).toBe(NodeType.Input);
      expect(genome.nodes[0].activation).toBe(ActivationType.None);
      expect(genome.nodes[1].type).toBe(NodeType.Input);
      expect(genome.nodes[1].activation).toBe(ActivationType.None);
      
      // 出力ノード
      expect(genome.nodes[2].type).toBe(NodeType.Output);
      expect(genome.nodes[2].activation).toBe(ActivationType.Tanh);
    });
  });

  describe('createNode', () => {
    it('should create hidden nodes by default', () => {
      const nodeId = genome.createNode(ActivationType.ReLU);
      
      expect(nodeId).toBe(3);
      expect(genome.nodes[nodeId].type).toBe(NodeType.Hidden);
      expect(genome.nodes[nodeId].activation).toBe(ActivationType.ReLU);
      expect(genome.info.hidden).toBe(1);
    });

    it('should create nodes with specified type', () => {
      const nodeId = genome.createNode(ActivationType.Sigmoid, NodeType.Hidden);
      
      expect(genome.nodes[nodeId].type).toBe(NodeType.Hidden);
      expect(genome.nodes[nodeId].activation).toBe(ActivationType.Sigmoid);
    });
  });

  describe('createConnection', () => {
    it('should create valid connections', () => {
      const success = genome.createConnection(0, 2, 0.5);
      
      expect(success).toBe(true);
      expect(genome.connections.length).toBe(1);
      expect(genome.connections[0].from).toBe(0);
      expect(genome.connections[0].to).toBe(2);
      expect(genome.connections[0].weight).toBe(0.5);
      expect(genome.connections[0].enabled).toBe(true);
    });

    it('should reject invalid connections', () => {
      // 循環を作る接続
      genome.createConnection(0, 2, 0.5);
      const success = genome.createConnection(2, 0, 0.5);
      
      expect(success).toBe(false);
      expect(genome.connections.length).toBe(1);
    });
  });

  describe('splitConnection', () => {
    beforeEach(() => {
      genome.createConnection(0, 2, 0.8);
    });

    it('should split connection and create new node', () => {
      const success = genome.splitConnection(0);
      
      expect(success).toBe(true);
      expect(genome.info.hidden).toBe(1);
      expect(genome.connections.length).toBe(3); // 元の接続（無効化）+ 2つの新しい接続
      expect(genome.connections[0].enabled).toBe(false);
    });

    it('should reject invalid connection index', () => {
      const success = genome.splitConnection(5);
      expect(success).toBe(false);
    });
  });

  describe('node type checks', () => {
    it('should correctly identify input nodes', () => {
      expect(genome.isInputNode(0)).toBe(true);
      expect(genome.isInputNode(1)).toBe(true);
      expect(genome.isInputNode(2)).toBe(false);
    });

    it('should correctly identify output nodes', () => {
      expect(genome.isOutputNode(0)).toBe(false);
      expect(genome.isOutputNode(1)).toBe(false);
      expect(genome.isOutputNode(2)).toBe(true);
    });

    it('should correctly identify hidden nodes after creation', () => {
      const hiddenId = genome.createNode(ActivationType.ReLU);
      expect(genome.isHiddenNode(hiddenId)).toBe(true);
      expect(genome.isHiddenNode(0)).toBe(false);
      expect(genome.isHiddenNode(2)).toBe(false);
    });
  });

  describe('computeDepth', () => {
    beforeEach(() => {
      genome.createConnection(0, 2, 0.5);
      genome.createConnection(1, 2, 0.5);
    });

    it('should compute correct node depths', () => {
      genome.computeDepth();
      
      expect(genome.nodes[0].depth).toBe(0); // 入力
      expect(genome.nodes[1].depth).toBe(0); // 入力
      expect(genome.nodes[2].depth).toBeGreaterThan(0); // 出力
    });
  });

  describe('getTopologicalOrder', () => {
    beforeEach(() => {
      const hiddenId = genome.createNode(ActivationType.ReLU);
      genome.createConnection(0, hiddenId, 0.5);
      genome.createConnection(hiddenId, 2, 0.5);
    });

    it('should return nodes in correct topological order', () => {
      const order = genome.getTopologicalOrder();
      
      expect(order.length).toBe(4);
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(3)); // 入力 -> 隠れ
      expect(order.indexOf(3)).toBeLessThan(order.indexOf(2)); // 隠れ -> 出力
    });
  });

  describe('clone', () => {
    beforeEach(() => {
      const hiddenId = genome.createNode(ActivationType.ReLU);
      genome.createConnection(0, hiddenId, 0.5);
      genome.createConnection(hiddenId, 2, 0.8);
    });

    it('should create exact copy of genome', () => {
      const clone = genome.clone();
      
      expect(clone.info).toEqual(genome.info);
      expect(clone.nodes.length).toBe(genome.nodes.length);
      expect(clone.connections.length).toBe(genome.connections.length);
    });

    it('should create independent copy', () => {
      const clone = genome.clone();
      
      // 元のゲノムを変更
      genome.createNode(ActivationType.Sigmoid);
      
      // クローンは影響を受けない
      expect(clone.nodes.length).toBe(4);
      expect(genome.nodes.length).toBe(5);
    });
  });
});
