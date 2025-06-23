/**
 * Represents a node in the DAG
 */
export class DAGNode {
    public incoming: number = 0;
    public depth: number = 0;
    public out: number[] = [];

    /**
     * Returns the number of outgoing connections
     */
    getOutConnectionCount(): number {
        return this.out.length;
    }
}

/**
 * Directed Acyclic Graph (DAG) implementation for NEAT
 */
export class DAG {
    public nodes: DAGNode[] = [];    /**
     * Creates a new node in the DAG
     */
    createNode(): void {
        this.nodes.push(new DAGNode());
    }

    /**
     * Creates a connection between two nodes
     * @param from Source node index
     * @param to Target node index
     * @returns true if connection was created successfully
     */
    createConnection(from: number, to: number): boolean {
        // Ensure both nodes exist
        if (!this.isValid(from)) {
            return false;
        }
        if (!this.isValid(to)) {
            return false;
        }
        
        // Ensure there is no cycle
        if (from === to) {
            return false;
        }

        if (this.isAncestor(to, from)) {
            return false;
        }
        
        // Ensure the connection doesn't already exist
        if (this.isParent(from, to)) {
            return false;
        }
        
        // Add the connection in the parent node
        this.nodes[from].out.push(to);
        // Increase the incoming connections count of the child node
        this.nodes[to].incoming++;
        return true;
    }

    /**
     * Checks if the given node index is valid
     */
    isValid(i: number): boolean {
        return i < this.nodes.length;
    }

    /**
     * Checks if node_1 has node_2 in its children list
     */
    isParent(node1: number, node2: number): boolean {
        const out = this.nodes[node1].out;
        return out.some(o => o === node2);
    }

    /**
     * Checks if node_1 is an ancestor of node_2
     */
    isAncestor(node1: number, node2: number): boolean {
        const out = this.nodes[node1].out;
        return this.isParent(node1, node2) || 
               out.some(o => this.isAncestor(o, node2));
    }    /**
     * Computes the depth of each node using topological sorting
     */
    computeDepth(): void {
        // Nodes with no incoming edge
        const startNodes: number[] = [];
        // Current incoming edge state
        const incoming: number[] = [];

        // Initialize incoming state
        for (const n of this.nodes) {
            incoming.push(n.incoming);
        }

        // Initialize the set of nodes with no incoming edge
        for (let i = 0; i < this.nodes.length; i++) {
            const n = this.nodes[i];
            if (n.incoming === 0) {
                n.depth = 0;
                startNodes.push(i);
            }
        }

        // Perform the sort
        while (startNodes.length > 0) {
            // Extract a node from the starting set
            const idx = startNodes.pop()!;

            // Remove incoming connection for all children of this node
            const n = this.nodes[idx];
            for (const o of n.out) {
                incoming[o]--;
                const connected = this.nodes[o];
                connected.depth = Math.max(connected.depth, n.depth + 1);
                // If a child has no incoming edge anymore, add it to the starting set
                if (incoming[o] === 0) {
                    startNodes.push(o);
                }
            }
        }
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
     * Removes a connection between two nodes
     */
    removeConnection(from: number, to: number): void {
        const connections = this.nodes[from].out;
        let found = 0;
        
        for (let i = 0; i < connections.length - found;) {
            if (connections[i] === to) {
                // Swap with last element and remove
                const lastIndex = connections.length - 1;
                connections[i] = connections[lastIndex];
                connections.pop();
                this.nodes[to].incoming--;
                found++;
            } else {
                i++;
            }
        }

        if (found === 0) {
            console.warn(`[WARNING] Connection ${from} -> ${to} not found`);
        }
    }
}
