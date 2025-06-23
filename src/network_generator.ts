import { Genome } from './genome';
import { Network } from './network';

/**
 * Generates executable networks from genomes
 */
export class NetworkGenerator {
    private idxToOrder: number[] = [];

    /**
     * Generates a network from a genome
     */
    generate(genome: Genome): Network {
        this.idxToOrder = new Array(genome.info.getNodeCount());
        const network = new Network();
        network.initialize(genome.info, genome.connections.length);

        const order = this.getOrder(genome);
        for (let i = 0; i < order.length; i++) {
            this.idxToOrder[order[i]] = i;
        }

        // Create nodes and connections
        let nodeIdx = 0;
        let connectionIdx = 0;
        for (const o of order) {
            // Initialize node
            const node = genome.nodes[o];
            network.setNode(nodeIdx, node.activation, node.bias, genome.graph.nodes[o].getOutConnectionCount());
            network.setNodeDepth(nodeIdx, node.depth);
            
            // Create its connections
            for (const c of genome.connections) {
                if (c.from === o) {
                    const target = this.idxToOrder[c.to];
                    // Target node should be processed after this one
                    if (target <= nodeIdx) {
                        throw new Error(`Invalid connection order: ${target} should be > ${nodeIdx}`);
                    }
                    network.setConnection(connectionIdx, target, c.weight);
                    connectionIdx++;
                }
            }
            nodeIdx++;
        }

        // Update network's max depth
        network.maxDepth = network.getNode(nodeIdx - 1).depth;

        return network;
    }

    /**
     * Gets the topological order of nodes in the genome
     */
    private getOrder(genome: Genome): number[] {
        genome.computeDepth();
        const order: number[] = [];
        for (let i = 0; i < genome.nodes.length; i++) {
            order.push(i);
        }

        // Only sort past the inputs to ensure inputs order (even if it shouldn't change anything)
        const inputsPart = order.slice(0, genome.info.inputs);
        const restPart = order.slice(genome.info.inputs);
        
        restPart.sort((a, b) => genome.nodes[a].depth - genome.nodes[b].depth);
        
        return inputsPart.concat(restPart);
    }
}
