import { MutationConfig, defaultMutationConfig } from './config';
import { Genome } from './genome';
import { RNG } from './rng';

/**
 * Handles genome mutations for NEAT evolution
 */
export class Mutator {
    private config: MutationConfig;

    constructor(config: MutationConfig = defaultMutationConfig) {
        this.config = config;
    }

    /**
     * Mutates a genome using the configured probabilities
     */
    mutateGenome(genome: Genome): void {
        for (let i = 0; i < this.config.mutCount; i++) {
            if (RNG.proba(0.25)) {
                if (RNG.proba(0.5)) {
                    this.mutateBiases(genome);
                } else {
                    this.mutateWeights(genome);
                }
            }
        }
        
        if (RNG.proba(this.config.newNodeProba) && this.config.maxHiddenNodes > genome.info.hidden) {
            this.newNode(genome);
        }

        if (RNG.proba(this.config.newConnProba)) {
            this.newConnection(genome);
        }
    }

    /**
     * Mutates node biases
     */
    private mutateBiases(genome: Genome): void {
        const node = RNG.pickRandom(genome.nodes);
        if (RNG.proba(this.config.newValueProba)) {
            node.bias = RNG.getFullRange(this.config.weightRange);
        } else {
            if (RNG.proba(0.25)) {
                node.bias += RNG.getFullRange(this.config.weightRange);
            } else {
                node.bias += this.config.weightSmallRange * RNG.getFullRange(this.config.weightRange);
            }
        }
    }

    /**
     * Mutates connection weights
     */
    private mutateWeights(genome: Genome): void {
        // Nothing to do if no connections
        if (genome.connections.length === 0) {
            return;
        }

        const connection = RNG.pickRandom(genome.connections);
        if (RNG.proba(this.config.newValueProba)) {
            connection.weight = RNG.getFullRange(this.config.weightRange);
        } else {
            if (RNG.proba(0.75)) {
                connection.weight += this.config.weightSmallRange * RNG.getFullRange(this.config.weightRange);
            } else {
                connection.weight += RNG.getFullRange(this.config.weightRange);
            }
        }
    }

    /**
     * Adds a new node by splitting an existing connection
     */
    private newNode(genome: Genome): void {
        // Nothing to do if no connections
        if (genome.connections.length === 0) {
            return;
        }

        const connectionIdx = RNG.getRandIndex(genome.connections.length);
        genome.splitConnection(connectionIdx);
    }

    /**
     * Adds a new connection between two nodes
     */
    private newConnection(genome: Genome): void {
        // Pick first random node, input + hidden
        const count1 = genome.info.inputs + genome.info.hidden;
        let idx1 = RNG.getRandIndex(count1);
        
        // If the picked node is an output, offset it by the number of outputs to land on hidden
        if (idx1 >= genome.info.inputs && idx1 < (genome.info.inputs + genome.info.outputs)) {
            idx1 += genome.info.outputs;
        }
        
        // Pick second random node, hidden + output
        const count2 = genome.info.hidden + genome.info.outputs;
        // Skip inputs
        const idx2 = RNG.getRandIndex(count2) + genome.info.inputs;

        // Validate connection
        if (genome.isOutput(idx1)) {
            throw new Error(`Node ${idx1} should not be an output for source`);
        }
        if (genome.isInput(idx2)) {
            throw new Error(`Node ${idx2} should not be an input for target`);
        }

        // Create the new connection
        genome.tryCreateConnection(idx1, idx2, RNG.getFullRange(this.config.weightRange));
    }
}
