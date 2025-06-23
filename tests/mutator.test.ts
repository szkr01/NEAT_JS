import { defaultMutationConfig, MutationConfig } from '../src/config';
import { Genome } from '../src/genome';
import { Mutator } from '../src/mutator';
import { RNG } from '../src/rng';

// Mock RNG to make tests deterministic
jest.mock('../src/rng');
const mockedRNG = RNG as jest.Mocked<typeof RNG>;

describe('Mutator', () => {
    let mutator: Mutator;
    let genome: Genome;

    beforeEach(() => {
        mutator = new Mutator();
        genome = new Genome(2, 1);
        
        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should use default config when none provided', () => {
            const defaultMutator = new Mutator();
            expect(defaultMutator).toBeDefined();
        });

        it('should use provided config', () => {
            const customConfig: MutationConfig = {
                ...defaultMutationConfig,
                mutCount: 5
            };
            const customMutator = new Mutator(customConfig);
            expect(customMutator).toBeDefined();
        });
    });

    describe('mutateGenome', () => {
        beforeEach(() => {
            // Set up some connections for mutation
            genome.createConnection(0, 2, 0.5);
        });

        it('should call mutation methods based on probabilities', () => {
            // Mock proba to return true for mutations but false for new nodes/connections
            mockedRNG.proba
                .mockReturnValueOnce(true)  // First mutation iteration
                .mockReturnValueOnce(true)  // Choose bias mutation
                .mockReturnValueOnce(false) // Second mutation iteration
                .mockReturnValueOnce(false) // Third mutation iteration  
                .mockReturnValueOnce(false) // No new node
                .mockReturnValueOnce(false); // No new connection

            mockedRNG.pickRandom.mockReturnValue(genome.nodes[0]);
            mockedRNG.getFullRange.mockReturnValue(0.1);

            mutator.mutateGenome(genome);

            expect(mockedRNG.proba).toHaveBeenCalled();
            expect(mockedRNG.pickRandom).toHaveBeenCalled();
        });
    });

    describe('bias mutation', () => {
        it('should mutate node bias with new value', () => {
            const originalBias = genome.nodes[0].bias;
            
            // Mock to use new value
            mockedRNG.proba.mockReturnValue(true);
            mockedRNG.pickRandom.mockReturnValue(genome.nodes[0]);
            mockedRNG.getFullRange.mockReturnValue(1.5);

            // Trigger bias mutation by calling mutateGenome with right conditions
            mockedRNG.proba
                .mockReturnValueOnce(true)  // First mutation iteration
                .mockReturnValueOnce(true)  // Choose bias mutation
                .mockReturnValueOnce(true)  // Use new value
                .mockReturnValueOnce(false) // No more mutations
                .mockReturnValueOnce(false) // No more mutations
                .mockReturnValueOnce(false) // No new node
                .mockReturnValueOnce(false); // No new connection

            mutator.mutateGenome(genome);

            expect(genome.nodes[0].bias).not.toBe(originalBias);
        });
    });

    describe('weight mutation', () => {
        beforeEach(() => {
            genome.createConnection(0, 2, 0.5);
        });

        it('should mutate connection weight', () => {
            const originalWeight = genome.connections[0].weight;
            
            mockedRNG.proba
                .mockReturnValueOnce(true)  // First mutation iteration
                .mockReturnValueOnce(false) // Choose weight mutation (not bias)
                .mockReturnValueOnce(true)  // Use new value
                .mockReturnValueOnce(false) // No more mutations
                .mockReturnValueOnce(false) // No more mutations
                .mockReturnValueOnce(false) // No new node
                .mockReturnValueOnce(false); // No new connection

            mockedRNG.pickRandom.mockReturnValue(genome.connections[0]);
            mockedRNG.getFullRange.mockReturnValue(1.2);

            mutator.mutateGenome(genome);

            expect(genome.connections[0].weight).not.toBe(originalWeight);
        });

        it('should handle genome with no connections', () => {
            const emptyGenome = new Genome(2, 1);
            // No connections added
            
            mockedRNG.proba
                .mockReturnValueOnce(true)  // First mutation iteration
                .mockReturnValueOnce(false) // Choose weight mutation
                .mockReturnValueOnce(false) // No more mutations
                .mockReturnValueOnce(false) // No more mutations
                .mockReturnValueOnce(false) // No new node
                .mockReturnValueOnce(false); // No new connection

            // Should not throw error
            expect(() => mutator.mutateGenome(emptyGenome)).not.toThrow();
        });
    });

    describe('new node mutation', () => {
        beforeEach(() => {
            genome.createConnection(0, 2, 0.8);
        });

        it('should add new node by splitting connection', () => {
            const initialNodeCount = genome.nodes.length;
            const initialConnectionCount = genome.connections.length;
            
            mockedRNG.proba
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(true)  // Add new node
                .mockReturnValueOnce(false); // No new connection

            mockedRNG.getRandIndex.mockReturnValue(0);

            mutator.mutateGenome(genome);

            expect(genome.nodes.length).toBe(initialNodeCount + 1);
            expect(genome.connections.length).toBe(initialConnectionCount + 1); // -1 + 2
            expect(genome.info.hidden).toBe(1);
        });

        it('should not add node if at maximum limit', () => {
            const limitedConfig: MutationConfig = {
                ...defaultMutationConfig,
                maxHiddenNodes: 0 // No hidden nodes allowed
            };
            const limitedMutator = new Mutator(limitedConfig);
            const initialNodeCount = genome.nodes.length;

            mockedRNG.proba
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No regular mutations  
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(true)  // Try to add new node (should be blocked)
                .mockReturnValueOnce(false); // No new connection

            limitedMutator.mutateGenome(genome);

            expect(genome.nodes.length).toBe(initialNodeCount);
        });
    });

    describe('new connection mutation', () => {
        it('should add new connection between valid nodes', () => {
            const initialConnectionCount = genome.connections.length;
            
            mockedRNG.proba
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No new node
                .mockReturnValueOnce(true);  // Add new connection

            mockedRNG.getRandIndex
                .mockReturnValueOnce(0) // Pick input node 0
                .mockReturnValueOnce(0); // Pick output node (index 0 in output range)

            mockedRNG.getFullRange.mockReturnValue(0.7);

            mutator.mutateGenome(genome);

            expect(genome.connections.length).toBeGreaterThan(initialConnectionCount);
        });

        it('should handle connection creation failure gracefully', () => {
            // Create a scenario where connection creation might fail
            genome.createConnection(0, 2, 0.5); // Already connect input 0 to output

            mockedRNG.proba
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No regular mutations
                .mockReturnValueOnce(false) // No new node
                .mockReturnValueOnce(true);  // Add new connection

            mockedRNG.getRandIndex
                .mockReturnValueOnce(0) // Pick input node 0
                .mockReturnValueOnce(0); // Pick output node

            mockedRNG.getFullRange.mockReturnValue(0.7);

            // Should not throw even if connection creation fails
            expect(() => mutator.mutateGenome(genome)).not.toThrow();
        });
    });
});
