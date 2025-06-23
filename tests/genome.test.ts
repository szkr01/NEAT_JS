import { Activation } from '../src/activation';
import { Genome, GenomeNode, GenomeConnection } from '../src/genome';

describe('GenomeNode', () => {
    it('should initialize with default values', () => {
        const node = new GenomeNode();
        expect(node.bias).toBe(0.0);
        expect(node.activation).toBe(Activation.Sigm);
        expect(node.depth).toBe(0);
    });
});

describe('GenomeConnection', () => {
    it('should initialize with default values', () => {
        const connection = new GenomeConnection();
        expect(connection.from).toBe(0);
        expect(connection.to).toBe(0);
        expect(connection.weight).toBe(0.0);
    });
});

describe('Genome', () => {
    describe('constructor', () => {
        it('should create empty genome when no parameters provided', () => {
            const genome = new Genome();
            expect(genome.info.inputs).toBe(0);
            expect(genome.info.outputs).toBe(0);
            expect(genome.info.hidden).toBe(0);
            expect(genome.nodes).toEqual([]);
            expect(genome.connections).toEqual([]);
        });

        it('should create genome with specified inputs and outputs', () => {
            const genome = new Genome(3, 2);
            expect(genome.info.inputs).toBe(3);
            expect(genome.info.outputs).toBe(2);
            expect(genome.info.hidden).toBe(0);
            expect(genome.nodes.length).toBe(5); // 3 inputs + 2 outputs
            
            // Check input nodes
            for (let i = 0; i < 3; i++) {
                expect(genome.nodes[i].activation).toBe(Activation.None);
            }
            
            // Check output nodes
            for (let i = 3; i < 5; i++) {
                expect(genome.nodes[i].activation).toBe(Activation.Tanh);
            }
        });
    });

    describe('createNode', () => {
        let genome: Genome;

        beforeEach(() => {
            genome = new Genome(2, 1);
        });

        it('should create a hidden node by default', () => {
            const initialHidden = genome.info.hidden;
            const initialLength = genome.nodes.length;
            
            const nodeIndex = genome.createNode(Activation.Relu);
            
            expect(genome.info.hidden).toBe(initialHidden + 1);
            expect(genome.nodes.length).toBe(initialLength + 1);
            expect(nodeIndex).toBe(initialLength);
            expect(genome.nodes[nodeIndex].activation).toBe(Activation.Relu);
        });

        it('should not increment hidden count when hidden=false', () => {
            const initialHidden = genome.info.hidden;
            
            genome.createNode(Activation.Relu, false);
            
            expect(genome.info.hidden).toBe(initialHidden);
        });
    });

    describe('tryCreateConnection', () => {
        let genome: Genome;

        beforeEach(() => {
            genome = new Genome(2, 1);
        });

        it('should create valid connections', () => {
            expect(genome.tryCreateConnection(0, 2, 0.5)).toBe(true);
            expect(genome.connections.length).toBe(1);
            expect(genome.connections[0].from).toBe(0);
            expect(genome.connections[0].to).toBe(2);
            expect(genome.connections[0].weight).toBe(0.5);
        });

        it('should reject invalid connections', () => {
            // Try to create a cycle
            genome.tryCreateConnection(0, 2, 0.5);
            expect(genome.tryCreateConnection(2, 0, 0.5)).toBe(false);
        });
    });

    describe('createConnection', () => {
        let genome: Genome;

        beforeEach(() => {
            genome = new Genome(2, 1);
        });

        it('should force create connections', () => {
            genome.createConnection(0, 2, 0.7);
            expect(genome.connections.length).toBe(1);
            expect(genome.connections[0].weight).toBe(0.7);
        });
    });

    describe('splitConnection', () => {
        let genome: Genome;

        beforeEach(() => {
            genome = new Genome(2, 1);
            genome.createConnection(0, 2, 0.8);
        });

        it('should split connection by inserting new node', () => {
            const initialNodes = genome.nodes.length;
            const initialConnections = genome.connections.length;
            
            genome.splitConnection(0);
            
            expect(genome.nodes.length).toBe(initialNodes + 1);
            expect(genome.connections.length).toBe(initialConnections + 1); // Remove 1, add 2
            
            // Check that new node has Relu activation
            const newNodeIndex = initialNodes;
            expect(genome.nodes[newNodeIndex].activation).toBe(Activation.Relu);
        });

        it('should handle invalid connection index', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            genome.splitConnection(99);
            
            expect(consoleSpy).toHaveBeenCalledWith('Invalid connection 99');
            consoleSpy.mockRestore();
        });
    });

    describe('removeConnection', () => {
        let genome: Genome;

        beforeEach(() => {
            genome = new Genome(2, 1);
            genome.createConnection(0, 2, 0.5);
            genome.createConnection(1, 2, 0.3);
        });

        it('should remove connection by index', () => {
            expect(genome.connections.length).toBe(2);
            
            genome.removeConnection(0);
            
            expect(genome.connections.length).toBe(1);
        });
    });

    describe('computeDepth', () => {
        let genome: Genome;

        beforeEach(() => {
            genome = new Genome(2, 1);
        });

        it('should compute depths correctly', () => {
            genome.computeDepth();
            
            // Outputs should be at depth 1 (max depth)
            expect(genome.nodes[2].depth).toBe(1); // Output node
        });
    });

    describe('isInput and isOutput', () => {
        let genome: Genome;

        beforeEach(() => {
            genome = new Genome(2, 1);
        });

        it('should correctly identify input nodes', () => {
            expect(genome.isInput(0)).toBe(true);
            expect(genome.isInput(1)).toBe(true);
            expect(genome.isInput(2)).toBe(false);
        });

        it('should correctly identify output nodes', () => {
            expect(genome.isOutput(0)).toBe(false);
            expect(genome.isOutput(1)).toBe(false);
            expect(genome.isOutput(2)).toBe(true);
        });
    });

    describe('getOrder', () => {
        let genome: Genome;

        beforeEach(() => {
            genome = new Genome(2, 1);
        });

        it('should return nodes in topological order', () => {
            genome.computeDepth();
            const order = genome.getOrder();
            
            expect(order.length).toBe(genome.nodes.length);
            expect(order).toContain(0);
            expect(order).toContain(1);
            expect(order).toContain(2);
        });
    });
});
