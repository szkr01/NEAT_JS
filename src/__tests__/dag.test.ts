import { DAG } from '../dag.js';

describe('DAG', () => {
  let dag: DAG;

  beforeEach(() => {
    dag = new DAG();
  });

  describe('createNode', () => {
    it('should create nodes with incrementing IDs', () => {
      expect(dag.createNode()).toBe(0);
      expect(dag.createNode()).toBe(1);
      expect(dag.createNode()).toBe(2);
    });

    it('should create nodes with correct initial state', () => {
      const nodeId = dag.createNode();
      const node = dag.nodes[nodeId];
      
      expect(node.incoming).toBe(0);
      expect(node.depth).toBe(0);
      expect(node.outConnections).toEqual([]);
    });
  });

  describe('createConnection', () => {
    beforeEach(() => {
      dag.createNode(); // 0
      dag.createNode(); // 1
      dag.createNode(); // 2
    });

    it('should create valid connections', () => {
      expect(dag.createConnection(0, 1)).toBe(true);
      expect(dag.nodes[0].outConnections).toContain(1);
      expect(dag.nodes[1].incoming).toBe(1);
    });

    it('should reject self-connections', () => {
      expect(dag.createConnection(0, 0)).toBe(false);
    });

    it('should reject connections to invalid nodes', () => {
      expect(dag.createConnection(0, 5)).toBe(false);
      expect(dag.createConnection(5, 0)).toBe(false);
    });

    it('should reject duplicate connections', () => {
      expect(dag.createConnection(0, 1)).toBe(true);
      expect(dag.createConnection(0, 1)).toBe(false);
    });

    it('should reject connections that would create cycles', () => {
      dag.createConnection(0, 1);
      dag.createConnection(1, 2);
      expect(dag.createConnection(2, 0)).toBe(false);
    });
  });

  describe('removeConnection', () => {
    beforeEach(() => {
      dag.createNode(); // 0
      dag.createNode(); // 1
      dag.createConnection(0, 1);
    });

    it('should remove existing connections', () => {
      dag.removeConnection(0, 1);
      expect(dag.nodes[0].outConnections).not.toContain(1);
      expect(dag.nodes[1].incoming).toBe(0);
    });

    it('should handle removal of non-existing connections gracefully', () => {
      dag.removeConnection(1, 0); // Non-existing connection
      expect(dag.nodes[0].outConnections).toContain(1);
      expect(dag.nodes[1].incoming).toBe(1);
    });
  });

  describe('isParent', () => {
    beforeEach(() => {
      dag.createNode(); // 0
      dag.createNode(); // 1
      dag.createNode(); // 2
      dag.createConnection(0, 1);
    });

    it('should correctly identify parent-child relationships', () => {
      expect(dag.isParent(0, 1)).toBe(true);
      expect(dag.isParent(1, 0)).toBe(false);
      expect(dag.isParent(0, 2)).toBe(false);
    });
  });

  describe('isAncestor', () => {
    beforeEach(() => {
      dag.createNode(); // 0
      dag.createNode(); // 1
      dag.createNode(); // 2
      dag.createConnection(0, 1);
      dag.createConnection(1, 2);
    });

    it('should correctly identify ancestor-descendant relationships', () => {
      expect(dag.isAncestor(0, 1)).toBe(true);
      expect(dag.isAncestor(0, 2)).toBe(true);
      expect(dag.isAncestor(1, 2)).toBe(true);
      expect(dag.isAncestor(2, 0)).toBe(false);
    });
  });

  describe('computeDepth', () => {
    beforeEach(() => {
      dag.createNode(); // 0
      dag.createNode(); // 1
      dag.createNode(); // 2
      dag.createNode(); // 3
      dag.createConnection(0, 1);
      dag.createConnection(0, 2);
      dag.createConnection(1, 3);
      dag.createConnection(2, 3);
    });

    it('should correctly compute node depths', () => {
      dag.computeDepth();
      
      expect(dag.nodes[0].depth).toBe(0);
      expect(dag.nodes[1].depth).toBe(1);
      expect(dag.nodes[2].depth).toBe(1);
      expect(dag.nodes[3].depth).toBe(2);
    });
  });

  describe('getTopologicalOrder', () => {
    beforeEach(() => {
      dag.createNode(); // 0
      dag.createNode(); // 1
      dag.createNode(); // 2
      dag.createNode(); // 3
      dag.createConnection(0, 1);
      dag.createConnection(0, 2);
      dag.createConnection(1, 3);
      dag.createConnection(2, 3);
      dag.computeDepth();
    });

    it('should return nodes in topological order', () => {
      const order = dag.getTopologicalOrder();
      
      expect(order[0]).toBe(0); // depth 0
      expect(order[3]).toBe(3); // depth 2
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(1));
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(2));
      expect(order.indexOf(1)).toBeLessThan(order.indexOf(3));
      expect(order.indexOf(2)).toBeLessThan(order.indexOf(3));
    });
  });
});
