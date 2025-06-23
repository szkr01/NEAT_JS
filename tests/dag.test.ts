import { DAG, DAGNode } from '../src/dag';

describe('DAGNode', () => {
    it('should initialize with default values', () => {
        const node = new DAGNode();
        expect(node.incoming).toBe(0);
        expect(node.depth).toBe(0);
        expect(node.out).toEqual([]);
    });

    it('should return correct outgoing connection count', () => {
        const node = new DAGNode();
        expect(node.getOutConnectionCount()).toBe(0);
        
        node.out.push(1, 2, 3);
        expect(node.getOutConnectionCount()).toBe(3);
    });
});

describe('DAG', () => {
    let dag: DAG;

    beforeEach(() => {
        dag = new DAG();
    });

    describe('createNode', () => {
        it('should add a new node to the DAG', () => {
            expect(dag.nodes.length).toBe(0);
            dag.createNode();
            expect(dag.nodes.length).toBe(1);
            expect(dag.nodes[0]).toBeInstanceOf(DAGNode);
        });
    });

    describe('isValid', () => {
        it('should return false for invalid node indices', () => {
            expect(dag.isValid(0)).toBe(false);
            expect(dag.isValid(1)).toBe(false);
        });

        it('should return true for valid node indices', () => {
            dag.createNode();
            dag.createNode();
            expect(dag.isValid(0)).toBe(true);
            expect(dag.isValid(1)).toBe(true);
            expect(dag.isValid(2)).toBe(false);
        });
    });

    describe('createConnection', () => {
        beforeEach(() => {
            dag.createNode(); // Node 0
            dag.createNode(); // Node 1
            dag.createNode(); // Node 2
        });

        it('should create valid connections', () => {
            expect(dag.createConnection(0, 1)).toBe(true);
            expect(dag.nodes[0].out).toContain(1);
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

        it('should reject cyclic connections', () => {
            dag.createConnection(0, 1);
            dag.createConnection(1, 2);
            expect(dag.createConnection(2, 0)).toBe(false);
        });
    });

    describe('isParent', () => {
        beforeEach(() => {
            dag.createNode(); // Node 0
            dag.createNode(); // Node 1
            dag.createNode(); // Node 2
        });

        it('should detect parent relationships', () => {
            dag.createConnection(0, 1);
            expect(dag.isParent(0, 1)).toBe(true);
            expect(dag.isParent(1, 0)).toBe(false);
            expect(dag.isParent(0, 2)).toBe(false);
        });
    });

    describe('isAncestor', () => {
        beforeEach(() => {
            dag.createNode(); // Node 0
            dag.createNode(); // Node 1
            dag.createNode(); // Node 2
            dag.createNode(); // Node 3
        });

        it('should detect direct parent as ancestor', () => {
            dag.createConnection(0, 1);
            expect(dag.isAncestor(0, 1)).toBe(true);
        });

        it('should detect indirect ancestors', () => {
            dag.createConnection(0, 1);
            dag.createConnection(1, 2);
            dag.createConnection(2, 3);
            
            expect(dag.isAncestor(0, 3)).toBe(true);
            expect(dag.isAncestor(1, 3)).toBe(true);
            expect(dag.isAncestor(3, 0)).toBe(false);
        });
    });

    describe('computeDepth', () => {
        it('should compute correct depths for linear chain', () => {
            dag.createNode(); // Node 0
            dag.createNode(); // Node 1
            dag.createNode(); // Node 2
            
            dag.createConnection(0, 1);
            dag.createConnection(1, 2);
            
            dag.computeDepth();
            
            expect(dag.nodes[0].depth).toBe(0);
            expect(dag.nodes[1].depth).toBe(1);
            expect(dag.nodes[2].depth).toBe(2);
        });

        it('should handle multiple starting nodes', () => {
            dag.createNode(); // Node 0
            dag.createNode(); // Node 1
            dag.createNode(); // Node 2
            dag.createNode(); // Node 3
            
            dag.createConnection(0, 2);
            dag.createConnection(1, 2);
            dag.createConnection(2, 3);
            
            dag.computeDepth();
            
            expect(dag.nodes[0].depth).toBe(0);
            expect(dag.nodes[1].depth).toBe(0);
            expect(dag.nodes[2].depth).toBe(1);
            expect(dag.nodes[3].depth).toBe(2);
        });
    });

    describe('getOrder', () => {
        it('should return nodes in topological order', () => {
            dag.createNode(); // Node 0
            dag.createNode(); // Node 1
            dag.createNode(); // Node 2
            
            dag.createConnection(0, 1);
            dag.createConnection(1, 2);
            dag.computeDepth();
            
            const order = dag.getOrder();
            expect(order).toEqual([0, 1, 2]);
        });
    });

    describe('removeConnection', () => {
        beforeEach(() => {
            dag.createNode(); // Node 0
            dag.createNode(); // Node 1
            dag.createConnection(0, 1);
        });

        it('should remove existing connections', () => {
            expect(dag.nodes[0].out).toContain(1);
            expect(dag.nodes[1].incoming).toBe(1);
            
            dag.removeConnection(0, 1);
            
            expect(dag.nodes[0].out).not.toContain(1);
            expect(dag.nodes[1].incoming).toBe(0);
        });

        it('should warn about non-existent connections', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            dag.removeConnection(0, 2);
            
            expect(consoleSpy).toHaveBeenCalledWith('[WARNING] Connection 0 -> 2 not found');
            consoleSpy.mockRestore();
        });
    });
});
