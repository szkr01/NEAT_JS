import { Activation } from '../src/activation';
import { Genome } from '../src/genome';
import { NetworkGenerator } from '../src/network_generator';

describe('NetworkGenerator', () => {
    let generator: NetworkGenerator;

    beforeEach(() => {
        generator = new NetworkGenerator();
    });

    describe('generate', () => {
        it('should generate a simple network from genome', () => {
            const genome = new Genome(2, 1);
            genome.createConnection(0, 2, 0.5); // Connect input 0 to output
            
            const network = generator.generate(genome);
            
            expect(network.info.inputs).toBe(2);
            expect(network.info.outputs).toBe(1);
            expect(network.connectionCount).toBe(1);
        });

        it('should handle complex topology', () => {
            const genome = new Genome(2, 1);
            
            // Add a hidden node
            const hiddenNode = genome.createNode(Activation.Relu);
            
            // Create connections: input0 -> hidden, hidden -> output
            genome.createConnection(0, hiddenNode, 0.7);
            genome.createConnection(hiddenNode, 2, 0.3);
            
            const network = generator.generate(genome);
            
            expect(network.info.inputs).toBe(2);
            expect(network.info.outputs).toBe(1);
            expect(network.info.hidden).toBe(1);
            expect(network.connectionCount).toBe(2);
        });

        it('should maintain topological order', () => {
            const genome = new Genome(2, 1);
            
            // Add hidden nodes
            const hidden1 = genome.createNode(Activation.Relu);
            const hidden2 = genome.createNode(Activation.Sigm);
            
            // Create a chain: input0 -> hidden1 -> hidden2 -> output
            genome.createConnection(0, hidden1, 0.5);
            genome.createConnection(hidden1, hidden2, 0.3);
            genome.createConnection(hidden2, 2, 0.8);
            
            const network = generator.generate(genome);
            
            // Network should execute without errors
            const result = network.execute([1.0, 0.0]);
            expect(result).toBe(true);
            
            const output = network.getResult();
            expect(output).toHaveLength(1);
            expect(typeof output[0]).toBe('number');
        });

        it('should handle multiple paths to output', () => {
            const genome = new Genome(2, 1);
            
            // Connect both inputs directly to output
            genome.createConnection(0, 2, 0.4);
            genome.createConnection(1, 2, 0.6);
            
            const network = generator.generate(genome);
            
            const result = network.execute([1.0, 1.0]);
            expect(result).toBe(true);
            
            const output = network.getResult();            // Expected with tanh activation: tanh(1.0 * 0.4 + 1.0 * 0.6) = tanh(1.0)
            expect(output[0]).toBeCloseTo(Math.tanh(1.0), 5);
        });

        it('should set correct network depth', () => {
            const genome = new Genome(2, 1);
            
            // Create a chain of hidden nodes
            const hidden1 = genome.createNode(Activation.Relu);
            const hidden2 = genome.createNode(Activation.Relu);
            
            genome.createConnection(0, hidden1, 0.5);
            genome.createConnection(hidden1, hidden2, 0.5);
            genome.createConnection(hidden2, 2, 0.5);
            
            const network = generator.generate(genome);
            
            expect(network.getDepth()).toBeGreaterThan(0);
        });
    });

    describe('error handling', () => {
        it('should handle empty genome', () => {
            const genome = new Genome(1, 1);
            // No connections
            
            const network = generator.generate(genome);
            
            expect(network.connectionCount).toBe(0);
            expect(network.execute([0.5])).toBe(true);
        });
    });
});
