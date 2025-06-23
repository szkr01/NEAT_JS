import { Activation } from '../src/activation';
import { NetworkInfo, NetworkNode, NetworkConnection, Network } from '../src/network';

describe('NetworkInfo', () => {
    it('should initialize with default values', () => {
        const info = new NetworkInfo();
        expect(info.inputs).toBe(0);
        expect(info.outputs).toBe(0);
        expect(info.hidden).toBe(0);
    });

    it('should initialize with specified values', () => {
        const info = new NetworkInfo(3, 2);
        expect(info.inputs).toBe(3);
        expect(info.outputs).toBe(2);
        expect(info.hidden).toBe(0);
    });

    it('should return correct node count', () => {
        const info = new NetworkInfo(3, 2);
        info.hidden = 5;
        expect(info.getNodeCount()).toBe(10); // 3 + 2 + 5
    });
});

describe('NetworkNode', () => {
    it('should initialize with default values', () => {
        const node = new NetworkNode();
        expect(node.sum).toBe(0.0);
        expect(node.bias).toBe(0.0);
        expect(node.connectionCount).toBe(0);
        expect(node.depth).toBe(0);
    });

    it('should compute value correctly', () => {
        const node = new NetworkNode();
        node.sum = 0.5;
        node.bias = 0.3;
        // Default activation is 'none' (identity)
        expect(node.getValue()).toBe(0.8);
    });
});

describe('NetworkConnection', () => {
    it('should initialize with default values', () => {
        const connection = new NetworkConnection();
        expect(connection.to).toBe(0);
        expect(connection.weight).toBe(0.0);
        expect(connection.value).toBe(0.0);
    });
});

describe('Network', () => {
    let network: Network;

    beforeEach(() => {
        network = new Network();
    });

    describe('initialize', () => {
        it('should set up network structure correctly', () => {
            const info = new NetworkInfo(2, 1);
            network.initialize(info, 3);

            expect(network.info).toBe(info);
            expect(network.connectionCount).toBe(3);
            expect(network.slots.length).toBe(6); // 3 nodes + 3 connections
            expect(network.output.length).toBe(1);
        });
    });

    describe('setNode', () => {
        beforeEach(() => {
            const info = new NetworkInfo(2, 1);
            network.initialize(info, 0);
        });

        it('should configure node properties', () => {
            network.setNode(0, Activation.Relu, 0.5, 2);
            const node = network.getNode(0);
            
            expect(node.bias).toBe(0.5);
            expect(node.connectionCount).toBe(2);
        });
    });

    describe('setConnection', () => {
        beforeEach(() => {
            const info = new NetworkInfo(2, 1);
            network.initialize(info, 2);
        });

        it('should configure connection properties', () => {
            network.setConnection(0, 2, 0.7);
            const connection = network.getConnection(0);
            
            expect(connection.to).toBe(2);
            expect(connection.weight).toBe(0.7);
        });
    });

    describe('execute', () => {
        beforeEach(() => {
            const info = new NetworkInfo(2, 1);
            network.initialize(info, 2);
            
            // Set up a simple network: input -> output
            network.setNode(0, Activation.None, 0, 1); // Input 0
            network.setNode(1, Activation.None, 0, 1); // Input 1  
            network.setNode(2, Activation.None, 0, 0); // Output
            
            network.setConnection(0, 2, 0.5); // Input 0 -> Output with weight 0.5
            network.setConnection(1, 2, 0.3); // Input 1 -> Output with weight 0.3
        });

        it('should execute network with correct input size', () => {
            const result = network.execute([1.0, 2.0]);
            expect(result).toBe(true);
        });

        it('should reject incorrect input size', () => {
            const result = network.execute([1.0]); // Should be 2 inputs
            expect(result).toBe(false);
        });

        it('should produce correct output', () => {
            network.execute([1.0, 2.0]);
            const output = network.getResult();
            
            // Expected: 1.0 * 0.5 + 2.0 * 0.3 = 0.5 + 0.6 = 1.1
            expect(output[0]).toBeCloseTo(1.1, 5);
        });
    });

    describe('foreachNode', () => {
        beforeEach(() => {
            const info = new NetworkInfo(2, 1);
            network.initialize(info, 0);
        });

        it('should iterate over all nodes', () => {
            const nodeIndices: number[] = [];            network.foreachNode((_node, index) => {
                nodeIndices.push(index);
            });
            
            expect(nodeIndices).toEqual([0, 1, 2]);
        });
    });

    describe('foreachConnection', () => {
        beforeEach(() => {
            const info = new NetworkInfo(2, 1);
            network.initialize(info, 2);
        });

        it('should iterate over all connections', () => {
            const connectionIndices: number[] = [];            network.foreachConnection((_connection, index) => {
                connectionIndices.push(index);
            });
            
            expect(connectionIndices).toEqual([0, 1]);
        });
    });

    describe('getOutput', () => {
        beforeEach(() => {
            const info = new NetworkInfo(2, 2);
            network.initialize(info, 0);
        });

        it('should return correct output nodes', () => {
            const output0 = network.getOutput(0);
            const output1 = network.getOutput(1);
            
            expect(output0).toBe(network.getNode(2)); // inputs=2, so output 0 is at index 2
            expect(output1).toBe(network.getNode(3)); // output 1 is at index 3
        });
    });
});
