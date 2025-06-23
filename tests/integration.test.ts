import { 
    Activation, 
    Genome, 
    NetworkGenerator, 
    Mutator,
    defaultMutationConfig 
} from '../src/index';

describe('NEAT Integration Tests', () => {
    describe('Complete workflow', () => {
        it('should create, mutate, and execute a simple network', () => {
            // Create a genome with 2 inputs and 1 output
            const genome = new Genome(2, 1);
            
            // Add some initial connections
            genome.createConnection(0, 2, 0.5); // Input 0 -> Output
            genome.createConnection(1, 2, -0.3); // Input 1 -> Output
            
            // Generate a network from the genome
            const generator = new NetworkGenerator();
            const network = generator.generate(genome);
            
            // Test the network
            const input = [1.0, 0.5];
            const success = network.execute(input);
            expect(success).toBe(true);
            
            const output = network.getResult();
            expect(output).toHaveLength(1);
            expect(typeof output[0]).toBe('number');
              // Expected output with tanh activation: tanh(1.0 * 0.5 + 0.5 * (-0.3)) = tanh(0.35)
            expect(output[0]).toBeCloseTo(Math.tanh(0.35), 5);
        });

        it('should evolve network topology through mutations', () => {
            const genome = new Genome(3, 2);
            const mutator = new Mutator(defaultMutationConfig);
            const generator = new NetworkGenerator();
            
            // Initial state
            expect(genome.info.hidden).toBe(0);
            expect(genome.connections.length).toBe(0);
            
            // Add initial connections manually to enable mutations
            genome.createConnection(0, 3, 0.5); // Input 0 -> Output 0
            genome.createConnection(1, 4, 0.3); // Input 1 -> Output 1
            genome.createConnection(2, 3, -0.2); // Input 2 -> Output 0
            
            // Perform multiple mutation rounds
            for (let i = 0; i < 50; i++) {
                mutator.mutateGenome(genome);
            }
            
            // Generate and test the evolved network
            const network = generator.generate(genome);
            const input = [0.5, -0.2, 0.8];
            const success = network.execute(input);
            
            expect(success).toBe(true);
            
            const output = network.getResult();
            expect(output).toHaveLength(2);
            expect(output.every(val => typeof val === 'number')).toBe(true);
        });

        it('should handle complex network with hidden nodes', () => {
            const genome = new Genome(2, 1);
            
            // Create a more complex topology
            const hidden1 = genome.createNode(Activation.Relu);
            const hidden2 = genome.createNode(Activation.Sigm);
            
            // Create connections: Input -> Hidden -> Output
            genome.createConnection(0, hidden1, 0.7);
            genome.createConnection(1, hidden1, 0.4);
            genome.createConnection(hidden1, hidden2, 0.6);
            genome.createConnection(hidden2, 2, 0.8);
            
            // Also add direct connections
            genome.createConnection(0, 2, 0.2);
            
            const generator = new NetworkGenerator();
            const network = generator.generate(genome);
            
            // Test with various inputs
            const testCases = [
                [0.0, 0.0],
                [1.0, 0.0],
                [0.0, 1.0],
                [1.0, 1.0],
                [0.5, 0.5],
                [-0.5, 0.3]
            ];
            
            for (const input of testCases) {
                const success = network.execute(input);
                expect(success).toBe(true);
                
                const output = network.getResult();
                expect(output).toHaveLength(1);
                expect(typeof output[0]).toBe('number');
                expect(isNaN(output[0])).toBe(false);
            }
        });

        it('should maintain network consistency after mutations', () => {
            const genome = new Genome(2, 2);
            const mutator = new Mutator();
            const generator = new NetworkGenerator();
            
            // Add initial connections
            genome.createConnection(0, 2, 0.5);
            genome.createConnection(1, 3, 0.3);
            
            // Mutate and test multiple times
            for (let iteration = 0; iteration < 10; iteration++) {
                mutator.mutateGenome(genome);
                
                // Ensure genome is still valid
                expect(genome.info.inputs).toBe(2);
                expect(genome.info.outputs).toBe(2);
                expect(genome.nodes.length).toBeGreaterThanOrEqual(4);
                
                // Generate network and test
                const network = generator.generate(genome);
                const success = network.execute([0.5, -0.2]);
                expect(success).toBe(true);
                
                const output = network.getResult();
                expect(output).toHaveLength(2);
                expect(output.every(val => !isNaN(val))).toBe(true);
            }
        });

        it('should work with different activation functions', () => {
            const activations = [Activation.None, Activation.Relu, Activation.Sigm, Activation.Tanh];
            
            for (const activation of activations) {
                const genome = new Genome(1, 1);
                const hiddenNode = genome.createNode(activation);
                
                genome.createConnection(0, hiddenNode, 1.0);
                genome.createConnection(hiddenNode, 1, 1.0);
                
                const generator = new NetworkGenerator();
                const network = generator.generate(genome);
                
                const success = network.execute([0.5]);
                expect(success).toBe(true);
                
                const output = network.getResult();
                expect(output).toHaveLength(1);
                expect(typeof output[0]).toBe('number');
                expect(isNaN(output[0])).toBe(false);
            }
        });
    });

    describe('Error handling', () => {
        it('should handle malformed inputs gracefully', () => {
            const genome = new Genome(2, 1);
            genome.createConnection(0, 2, 0.5);
            
            const generator = new NetworkGenerator();
            const network = generator.generate(genome);
            
            // Wrong input size
            expect(network.execute([1.0])).toBe(false);
            expect(network.execute([1.0, 2.0, 3.0])).toBe(false);
            
            // Empty input
            expect(network.execute([])).toBe(false);
        });

        it('should handle empty genomes', () => {
            const genome = new Genome(1, 1);
            // No connections
            
            const generator = new NetworkGenerator();
            const network = generator.generate(genome);
            
            const success = network.execute([0.5]);
            expect(success).toBe(true);
            
            // Output should be from bias only (default 0)
            const output = network.getResult();
            expect(output).toHaveLength(1);
        });
    });

    describe('Performance characteristics', () => {
        it('should handle reasonably large networks', () => {
            const genome = new Genome(10, 5);
            
            // Create a fully connected network
            for (let i = 0; i < genome.info.inputs; i++) {
                for (let j = 0; j < genome.info.outputs; j++) {
                    genome.createConnection(i, genome.info.inputs + j, Math.random() - 0.5);
                }
            }
            
            // Add some hidden nodes
            for (let i = 0; i < 5; i++) {
                const hiddenNode = genome.createNode(Activation.Relu);
                genome.createConnection(i % genome.info.inputs, hiddenNode, Math.random() - 0.5);
                genome.createConnection(hiddenNode, genome.info.inputs + (i % genome.info.outputs), Math.random() - 0.5);
            }
            
            const generator = new NetworkGenerator();
            const network = generator.generate(genome);
            
            const input = new Array(10).fill(0).map(() => Math.random() - 0.5);
            const success = network.execute(input);
            
            expect(success).toBe(true);
            
            const output = network.getResult();
            expect(output).toHaveLength(5);
            expect(output.every(val => typeof val === 'number' && !isNaN(val))).toBe(true);
        });
    });
});
