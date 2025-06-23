import { Activation } from './activation';
import { RealType } from './common_configuration';
import { DAG } from './dag';
import { NetworkInfo } from './network';

/**
 * Genome node representation
 */
export class GenomeNode {
    public bias: RealType = 0.0;
    public activation: Activation = Activation.Sigm;
    public depth: number = 0;
}

/**
 * Genome connection representation
 */
export class GenomeConnection {
    public from: number = 0;
    public to: number = 0;
    public weight: RealType = 0.0;
}

/**
 * Blueprint for a neural network
 */
export class Genome {
    public info: NetworkInfo = new NetworkInfo();
    public nodes: GenomeNode[] = [];
    public connections: GenomeConnection[] = [];
    public graph: DAG = new DAG();

    constructor(inputs?: number, outputs?: number) {
        if (inputs !== undefined && outputs !== undefined) {
            this.info = new NetworkInfo(inputs, outputs);
            
            // Create inputs
            for (let i = 0; i < this.info.inputs; i++) {
                this.createNode(Activation.None, false);
            }
            
            // Create outputs
            for (let i = 0; i < this.info.outputs; i++) {
                this.createNode(Activation.Tanh, false);
            }
        }
    }

    /**
     * Creates a new node in the genome
     */
    createNode(activation: Activation, hidden: boolean = true): number {
        const node = new GenomeNode();
        node.activation = activation;
        node.bias = 0.0;
        this.nodes.push(node);

        this.graph.createNode();
        
        // Update info if needed
        if (hidden) {
            this.info.hidden++;
        }
        
        // Return index of new node
        return this.nodes.length - 1;
    }

    /**
     * Attempts to create a connection between two nodes
     */
    tryCreateConnection(from: number, to: number, weight: RealType): boolean {
        if (this.graph.createConnection(from, to)) {
            this.connections.push({ from, to, weight });
            return true;
        }
        return false;
    }

    /**
     * Creates a connection between two nodes (assumes it's valid)
     */
    createConnection(from: number, to: number, weight: RealType): void {
        this.graph.createConnection(from, to);
        this.connections.push({ from, to, weight });
    }

    /**
     * Splits a connection by inserting a new node
     */
    splitConnection(i: number): void {
        if (i >= this.connections.length) {
            console.error(`Invalid connection ${i}`);
            return;
        }

        const c = this.connections[i];
        const from = c.from;
        const to = c.to;
        const weight = c.weight;
        this.removeConnection(i);

        const nodeIdx = this.createNode(Activation.Relu);
        this.createConnection(from, nodeIdx, weight);
        this.createConnection(nodeIdx, to, 1.0);
    }

    /**
     * Removes a connection by index
     */
    removeConnection(i: number): void {
        this.graph.removeConnection(this.connections[i].from, this.connections[i].to);
        // Swap with last element and remove
        this.connections[i] = this.connections[this.connections.length - 1];
        this.connections.pop();
    }

    /**
     * Returns nodes indexes sorted topologically
     */
    getOrder(): number[] {
        const order: number[] = [];
        for (let i = 0; i < this.nodes.length; i++) {
            order.push(i);
        }

        order.sort((a, b) => this.nodes[a].depth - this.nodes[b].depth);
        return order;
    }

    /**
     * Computes the depth of each node in the DAG
     */
    computeDepth(): void {
        // Compute order
        let maxDepth = 0;
        this.graph.computeDepth();
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].depth = this.graph.nodes[i].depth;
            maxDepth = Math.max(this.nodes[i].depth, maxDepth);
        }

        // Set outputs to the last "layer"
        const outputDepth = Math.max(maxDepth, 1);
        for (let i = 0; i < this.info.outputs; i++) {
            this.nodes[this.info.inputs + i].depth = outputDepth;
        }
    }

    /**
     * Checks if a node is an input
     */
    isInput(i: number): boolean {
        return i < this.info.inputs;
    }

    /**
     * Checks if a node is an output
     */
    isOutput(i: number): boolean {
        return (i >= this.info.inputs) && (i < this.info.inputs + this.info.outputs);
    }
}
