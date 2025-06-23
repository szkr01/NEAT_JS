import { Activation, ActivationFunction, ActivationPtr } from './activation';
import { RealType } from './common_configuration';

/**
 * Network information structure
 */
export class NetworkInfo {
    public inputs: number = 0;
    public outputs: number = 0;
    public hidden: number = 0;

    constructor(inputs?: number, outputs?: number) {
        if (inputs !== undefined) this.inputs = inputs;
        if (outputs !== undefined) this.outputs = outputs;
        this.hidden = 0;
    }

    /**
     * Returns the total number of nodes in the network
     */
    getNodeCount(): number {
        return this.inputs + this.hidden + this.outputs;
    }
}

/**
 * Network node representation
 */
export class NetworkNode {
    public activation: ActivationPtr = ActivationFunction.none;
    public sum: RealType = 0.0;
    public bias: RealType = 0.0;
    public connectionCount: number = 0;
    public depth: number = 0;

    /**
     * Gets the computed value of this node
     */
    getValue(): RealType {
        return this.activation(this.sum + this.bias);
    }
}

/**
 * Network connection representation
 */
export class NetworkConnection {
    public to: number = 0;
    public weight: RealType = 0.0;
    public value: RealType = 0.0;
}

/**
 * Union-like structure for efficient memory layout
 * In TypeScript, we'll use a tagged union approach
 */
export type NetworkSlot = {
    type: 'node';
    node: NetworkNode;
} | {
    type: 'connection';
    connection: NetworkConnection;
};

/**
 * Neural network execution engine
 */
export class Network {
    public slots: NetworkSlot[] = [];
    public output: RealType[] = [];
    public info: NetworkInfo = new NetworkInfo();
    public maxDepth: number = 0;
    public connectionCount: number = 0;

    /**
     * Initializes the slots vector
     */
    initialize(info: NetworkInfo, connectionCount: number): void {
        this.info = info;
        this.connectionCount = connectionCount;

        // Initialize slots with nodes first, then connections
        this.slots = [];
        
        // Add node slots
        for (let i = 0; i < info.getNodeCount(); i++) {
            this.slots.push({
                type: 'node',
                node: new NetworkNode()
            });
        }
        
        // Add connection slots
        for (let i = 0; i < connectionCount; i++) {
            this.slots.push({
                type: 'connection',
                connection: new NetworkConnection()
            });
        }

        this.output = new Array(info.outputs).fill(0);
    }

    /**
     * Sets node properties
     */
    setNode(i: number, activation: Activation, bias: RealType, connectionCount: number): void {
        const node = this.getNode(i);
        node.activation = ActivationFunction.getFunction(activation);
        node.bias = bias;
        node.connectionCount = connectionCount;
    }

    /**
     * Sets node depth
     */
    setNodeDepth(i: number, depth: number): void {
        const slot = this.slots[i];
        if (slot.type === 'node') {
            slot.node.depth = depth;
        }
    }

    /**
     * Sets connection properties
     */
    setConnection(i: number, to: number, weight: RealType): void {
        const connection = this.getConnection(i);
        connection.to = to;
        connection.weight = weight;
    }

    /**
     * Gets a connection by index
     */
    getConnection(i: number): NetworkConnection {
        const slot = this.slots[this.info.getNodeCount() + i];
        if (slot.type === 'connection') {
            return slot.connection;
        }
        throw new Error(`Slot ${this.info.getNodeCount() + i} is not a connection`);
    }

    /**
     * Gets a node by index
     */
    getNode(i: number): NetworkNode {
        const slot = this.slots[i];
        if (slot.type === 'node') {
            return slot.node;
        }
        throw new Error(`Slot ${i} is not a node`);
    }

    /**
     * Gets an output node by output index
     */
    getOutput(i: number): NetworkNode {
        return this.getNode(this.info.inputs + this.info.hidden + i);
    }

    /**
     * Executes the network with given input
     */
    execute(input: RealType[]): boolean {
        // Check compatibility
        if (input.length !== this.info.inputs) {
            console.error('Input size mismatch, aborting');
            return false;
        }

        // Reset nodes
        this.foreachNode((node: NetworkNode) => {
            node.sum = 0.0;
        });

        // Initialize input
        for (let i = 0; i < this.info.inputs; i++) {
            this.getNode(i).sum = input[i];
        }

        // Execute network
        let currentConnection = 0;
        const nodeCount = this.info.getNodeCount();
        for (let i = 0; i < nodeCount; i++) {
            const node = this.getNode(i);
            const value = node.getValue();
            for (let o = 0; o < node.connectionCount; o++) {
                const connection = this.getConnection(currentConnection++);
                connection.value = value * connection.weight;
                this.getNode(connection.to).sum += connection.value;
            }
        }

        // Update output
        for (let i = 0; i < this.info.outputs; i++) {
            this.output[i] = this.getOutput(i).getValue();
        }

        return true;
    }

    /**
     * Gets the network execution result
     */
    getResult(): RealType[] {
        return this.output;
    }

    /**
     * Iterates over all nodes
     */
    foreachNode(callback: (node: NetworkNode, index: number) => void): void {
        const nodeCount = this.info.getNodeCount();
        for (let i = 0; i < nodeCount; i++) {
            callback(this.getNode(i), i);
        }
    }

    /**
     * Iterates over all connections
     */
    foreachConnection(callback: (connection: NetworkConnection, index: number) => void): void {
        for (let i = 0; i < this.connectionCount; i++) {
            callback(this.getConnection(i), i);
        }
    }

    /**
     * Returns the depth of the network
     */
    getDepth(): number {
        return this.maxDepth;
    }
}
