# NEAT-JS: Complete Documentation

A comprehensive TypeScript implementation of NEAT (NeuroEvolution of Augmenting Topologies) neural network library.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [API Reference](#api-reference)
   - [Genome](#genome)
   - [Network](#network)
   - [NetworkGenerator](#networkgenerator)
   - [Mutator](#mutator)
   - [Activation Functions](#activation-functions)
   - [DAG (Directed Acyclic Graph)](#dag-directed-acyclic-graph)
   - [Configuration](#configuration)
   - [Random Number Generator](#random-number-generator)
6. [Use Cases and Examples](#use-cases-and-examples)
   - [Basic Network Creation](#basic-network-creation)
   - [XOR Problem Solver](#xor-problem-solver)
   - [Function Approximation](#function-approximation)
   - [Evolution Simulation](#evolution-simulation)
   - [Custom Fitness Functions](#custom-fitness-functions)
   - [Population Management](#population-management)
7. [Advanced Topics](#advanced-topics)
   - [Topology Evolution](#topology-evolution)
   - [Speciation](#speciation)
   - [Performance Optimization](#performance-optimization)
8. [Testing](#testing)
9. [Contributing](#contributing)
10. [License](#license)

---

## Introduction

NEAT (NeuroEvolution of Augmenting Topologies) is a method for evolving artificial neural networks with a genetic algorithm. Unlike traditional neural networks with fixed architectures, NEAT evolves both the weights and the topology of the network, allowing it to find optimal solutions for complex problems.

### Key Features

- **Dynamic Topology**: Networks can grow and shrink during evolution
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Test Coverage**: 98%+ code coverage with comprehensive test suite
- **Performance**: Optimized algorithms ported from C++ implementation
- **Flexibility**: Configurable mutation parameters and activation functions

### When to Use NEAT

NEAT is particularly useful for:

- Problems where the optimal network structure is unknown
- Reinforcement learning tasks
- Function approximation with complex relationships
- Control systems requiring adaptive behavior
- Games and simulations requiring AI agents

---

## Installation

```bash
npm install neat-js
```

For development:

```bash
git clone https://github.com/yourusername/neat-js.git
cd neat-js
npm install
npm test
npm run build
```

---

## Quick Start

```typescript
import { Genome, NetworkGenerator, Mutator } from 'neat-js';

// Create a simple network with 2 inputs and 1 output
const genome = new Genome(2, 1);

// Add initial connections
genome.createConnection(0, 2, 0.5);  // Input 0 -> Output
genome.createConnection(1, 2, -0.3); // Input 1 -> Output

// Generate executable network
const generator = new NetworkGenerator();
const network = generator.generate(genome);

// Execute the network
const input = [1.0, 0.5];
if (network.execute(input)) {
    const output = network.getResult();
    console.log('Output:', output[0]);
}

// Evolve the genome
const mutator = new Mutator();
mutator.mutateGenome(genome);
```

---

## Core Concepts

### Genome vs Network

- **Genome**: The blueprint or DNA of a neural network. Contains nodes and connections but cannot execute.
- **Network**: The executable version generated from a genome. Optimized for fast computation.

### Node Types

- **Input Nodes**: Receive external data
- **Output Nodes**: Produce final results
- **Hidden Nodes**: Process information between inputs and outputs

### Connections

Connections have:
- **Source** and **target** nodes
- **Weight** values that determine influence
- **Enabled/disabled** status for evolution

### Activation Functions

- **None**: Identity function (f(x) = x)
- **Sigmoid**: S-curve for smooth transitions
- **ReLU**: Rectified Linear Unit for sparse activation
- **Tanh**: Hyperbolic tangent for symmetric output

---

## API Reference

### Genome

The genome represents the blueprint of a neural network.

#### Constructor

```typescript
new Genome(inputs?: number, outputs?: number)
```

**Parameters:**
- `inputs` (optional): Number of input nodes
- `outputs` (optional): Number of output nodes

**Example:**
```typescript
// Create empty genome
const genome = new Genome();

// Create genome with 3 inputs and 2 outputs
const genome = new Genome(3, 2);
```

#### Methods

##### `createNode(activation: Activation, hidden?: boolean): number`

Creates a new node in the genome.

**Parameters:**
- `activation`: The activation function for the node
- `hidden` (optional): Whether this is a hidden node (default: true)

**Returns:** Index of the newly created node

**Example:**
```typescript
import { Activation } from 'neat-js';

const hiddenNode = genome.createNode(Activation.Relu);
const outputNode = genome.createNode(Activation.Sigm, false);
```

##### `createConnection(from: number, to: number, weight: number): void`

Creates a connection between two nodes (forces creation).

**Parameters:**
- `from`: Source node index
- `to`: Target node index
- `weight`: Connection weight

**Example:**
```typescript
genome.createConnection(0, 2, 0.5); // Input 0 to Output with weight 0.5
```

##### `tryCreateConnection(from: number, to: number, weight: number): boolean`

Attempts to create a connection, respecting graph constraints.

**Returns:** `true` if connection was created, `false` if invalid

**Example:**
```typescript
const success = genome.tryCreateConnection(0, 1, 0.3);
if (success) {
    console.log('Connection created successfully');
}
```

##### `splitConnection(index: number): void`

Splits an existing connection by inserting a new node.

**Example:**
```typescript
// Split the first connection
genome.splitConnection(0);
```

##### `removeConnection(index: number): void`

Removes a connection by index.

##### `computeDepth(): void`

Computes the depth of each node for topological ordering.

##### `isInput(index: number): boolean`

Checks if a node is an input node.

##### `isOutput(index: number): boolean`

Checks if a node is an output node.

#### Properties

```typescript
interface Genome {
    info: NetworkInfo;           // Network structure information
    nodes: GenomeNode[];         // Array of nodes
    connections: GenomeConnection[]; // Array of connections
    graph: DAG;                  // Internal graph for validation
}
```

### Network

The executable neural network generated from a genome.

#### Methods

##### `execute(input: number[]): boolean`

Executes the network with given input.

**Parameters:**
- `input`: Array of input values

**Returns:** `true` if execution successful, `false` if input size mismatch

**Example:**
```typescript
const success = network.execute([0.5, -0.2, 0.8]);
if (success) {
    const result = network.getResult();
    console.log('Network output:', result);
}
```

##### `getResult(): number[]`

Gets the output values from the last execution.

**Example:**
```typescript
const output = network.getResult();
console.log('First output:', output[0]);
```

##### `getDepth(): number`

Returns the maximum depth of the network.

#### Use Case: Real-time Classification

```typescript
function classifyData(network: Network, dataPoints: number[][]): number[] {
    const results: number[] = [];
    
    for (const point of dataPoints) {
        if (network.execute(point)) {
            const output = network.getResult();
            results.push(output[0] > 0.5 ? 1 : 0); // Binary classification
        }
    }
    
    return results;
}
```

### NetworkGenerator

Converts genomes into executable networks.

#### Methods

##### `generate(genome: Genome): Network`

Generates an optimized network from a genome.

**Example:**
```typescript
const generator = new NetworkGenerator();
const network = generator.generate(genome);
```

#### Use Case: Batch Processing

```typescript
function generateNetworks(genomes: Genome[]): Network[] {
    const generator = new NetworkGenerator();
    return genomes.map(genome => generator.generate(genome));
}
```

### Mutator

Handles evolutionary mutations of genomes.

#### Constructor

```typescript
new Mutator(config?: MutationConfig)
```

#### Methods

##### `mutateGenome(genome: Genome): void`

Applies mutations to a genome based on configuration probabilities.

**Example:**
```typescript
const mutator = new Mutator({
    newNodeProba: 0.03,
    newConnProba: 0.05,
    weightRange: 2.0
});

mutator.mutateGenome(genome);
```

#### Use Case: Population Evolution

```typescript
function evolvePopulation(genomes: Genome[], mutator: Mutator): void {
    genomes.forEach(genome => {
        if (Math.random() < 0.8) { // 80% mutation rate
            mutator.mutateGenome(genome);
        }
    });
}
```

### Activation Functions

#### Available Functions

```typescript
enum Activation {
    None = 'none',   // f(x) = x
    Sigm = 'sigm',   // f(x) = 1 / (1 + e^(-4.9x))
    Relu = 'relu',   // f(x) = max(0, x)
    Tanh = 'tanh'    // f(x) = tanh(x)
}
```

#### Usage

```typescript
import { ActivationFunction, Activation } from 'neat-js';

// Get function reference
const reluFunc = ActivationFunction.getFunction(Activation.Relu);
const result = reluFunc(-0.5); // Returns 0

// Direct usage
const sigmoidResult = ActivationFunction.sigm(1.0);
```

#### Use Case: Custom Activation Analysis

```typescript
function analyzeActivations(input: number): void {
    const activations = [Activation.None, Activation.Sigm, Activation.Relu, Activation.Tanh];
    
    activations.forEach(activation => {
        const func = ActivationFunction.getFunction(activation);
        const output = func(input);
        console.log(`${activation}: ${input} -> ${output}`);
    });
}
```

### DAG (Directed Acyclic Graph)

Internal structure for maintaining valid network topology.

#### Methods

##### `createNode(): void`

Adds a new node to the graph.

##### `createConnection(from: number, to: number): boolean`

Attempts to create a connection while preventing cycles.

##### `isValid(index: number): boolean`

Checks if a node index is valid.

##### `isAncestor(node1: number, node2: number): boolean`

Checks if node1 is an ancestor of node2.

##### `computeDepth(): void`

Computes topological depth of all nodes.

### Configuration

#### MutationConfig Interface

```typescript
interface MutationConfig {
    mutCount: number;           // Number of mutations per genome
    newNodeProba: number;       // Probability of adding new node
    newConnProba: number;       // Probability of adding new connection
    newValueProba: number;      // Probability of replacing vs modifying values
    weightRange: number;        // Range for weight values
    weightSmallRange: number;   // Multiplier for small modifications
    maxHiddenNodes: number;     // Maximum hidden nodes allowed
}
```

#### Default Configuration

```typescript
export const defaultMutationConfig: MutationConfig = {
    mutCount: 3,
    newNodeProba: 0.03,
    newConnProba: 0.05,
    newValueProba: 0.1,
    weightRange: 2.0,
    weightSmallRange: 0.1,
    maxHiddenNodes: 50
};
```

### Random Number Generator

Utility class for all probabilistic operations.

#### Methods

```typescript
RNG.random(): number              // [0, 1)
RNG.proba(p: number): boolean     // Boolean with probability p
RNG.getFullRange(range: number): number  // [-range, range]
RNG.pickRandom<T>(array: T[]): T  // Random element from array
```

---

## Use Cases and Examples

### Basic Network Creation

```typescript
import { Genome, NetworkGenerator, Activation } from 'neat-js';

function createBasicNetwork(): void {
    // Create a 2-input, 1-output network
    const genome = new Genome(2, 1);
    
    // Add a hidden layer node
    const hiddenNode = genome.createNode(Activation.Sigmoid);
    
    // Connect inputs to hidden node
    genome.createConnection(0, hiddenNode, 0.7);
    genome.createConnection(1, hiddenNode, -0.4);
    
    // Connect hidden node to output
    genome.createConnection(hiddenNode, 2, 1.2);
    
    // Generate and test the network
    const generator = new NetworkGenerator();
    const network = generator.generate(genome);
    
    // Test with sample data
    const testCases = [
        [0, 0], [0, 1], [1, 0], [1, 1]
    ];
    
    testCases.forEach(input => {
        if (network.execute(input)) {
            const output = network.getResult();
            console.log(`Input: [${input.join(', ')}] -> Output: ${output[0].toFixed(4)}`);
        }
    });
}
```

### XOR Problem Solver

```typescript
import { Genome, NetworkGenerator, Mutator, defaultMutationConfig } from 'neat-js';

class XOREvolver {
    private population: Genome[] = [];
    private mutator: Mutator;
    private generator: NetworkGenerator;
    
    constructor(populationSize: number = 100) {
        this.mutator = new Mutator(defaultMutationConfig);
        this.generator = new NetworkGenerator();
        this.initializePopulation(populationSize);
    }
    
    private initializePopulation(size: number): void {
        for (let i = 0; i < size; i++) {
            const genome = new Genome(2, 1);
            // Add random initial connections
            genome.createConnection(0, 2, Math.random() * 2 - 1);
            genome.createConnection(1, 2, Math.random() * 2 - 1);
            this.population.push(genome);
        }
    }
    
    private evaluateFitness(genome: Genome): number {
        const network = this.generator.generate(genome);
        const testCases = [
            { input: [0, 0], expected: 0 },
            { input: [0, 1], expected: 1 },
            { input: [1, 0], expected: 1 },
            { input: [1, 1], expected: 0 }
        ];
        
        let totalError = 0;
        for (const testCase of testCases) {
            if (network.execute(testCase.input)) {
                const output = network.getResult()[0];
                const error = Math.abs(output - testCase.expected);
                totalError += error;
            }
        }
        
        return 4.0 - totalError; // Higher is better
    }
    
    public evolve(generations: number): Genome {
        for (let gen = 0; gen < generations; gen++) {
            // Evaluate fitness
            const fitness = this.population.map(genome => ({
                genome,
                fitness: this.evaluateFitness(genome)
            }));
            
            // Sort by fitness
            fitness.sort((a, b) => b.fitness - a.fitness);
            
            // Report best fitness
            if (gen % 10 === 0) {
                console.log(`Generation ${gen}: Best fitness = ${fitness[0].fitness.toFixed(4)}`);
            }
            
            // Create next generation
            const nextGeneration: Genome[] = [];
            
            // Keep best 20%
            const eliteCount = Math.floor(this.population.length * 0.2);
            for (let i = 0; i < eliteCount; i++) {
                nextGeneration.push(fitness[i].genome);
            }
            
            // Fill rest with mutated copies
            while (nextGeneration.length < this.population.length) {
                const parent = fitness[Math.floor(Math.random() * eliteCount)].genome;
                const child = this.copyGenome(parent);
                this.mutator.mutateGenome(child);
                nextGeneration.push(child);
            }
            
            this.population = nextGeneration;
        }
        
        // Return best genome
        const finalFitness = this.population.map(genome => ({
            genome,
            fitness: this.evaluateFitness(genome)
        }));
        finalFitness.sort((a, b) => b.fitness - a.fitness);
        
        return finalFitness[0].genome;
    }
    
    private copyGenome(original: Genome): Genome {
        const copy = new Genome(original.info.inputs, original.info.outputs);
        
        // Copy nodes
        for (let i = original.info.inputs + original.info.outputs; i < original.nodes.length; i++) {
            copy.createNode(original.nodes[i].activation);
        }
        
        // Copy connections
        for (const conn of original.connections) {
            copy.createConnection(conn.from, conn.to, conn.weight);
        }
        
        return copy;
    }
}

// Usage
const evolver = new XOREvolver(50);
const bestGenome = evolver.evolve(100);
console.log('Evolution complete!');
```

### Function Approximation

```typescript
import { Genome, NetworkGenerator, Mutator } from 'neat-js';

class FunctionApproximator {
    private targetFunction: (x: number) => number;
    
    constructor(targetFunction: (x: number) => number) {
        this.targetFunction = targetFunction;
    }
    
    public trainNetwork(generations: number = 1000): Genome {
        // Create initial genome
        const genome = new Genome(1, 1);
        genome.createConnection(0, 1, Math.random() * 2 - 1);
        
        const mutator = new Mutator({
            mutCount: 2,
            newNodeProba: 0.05,
            newConnProba: 0.1,
            newValueProba: 0.2,
            weightRange: 3.0,
            weightSmallRange: 0.2,
            maxHiddenNodes: 20
        });
        
        const generator = new NetworkGenerator();
        let bestGenome = genome;
        let bestFitness = this.evaluateFitness(genome, generator);
        
        for (let gen = 0; gen < generations; gen++) {
            // Create mutated copy
            const mutatedGenome = this.copyGenome(bestGenome);
            mutator.mutateGenome(mutatedGenome);
            
            const fitness = this.evaluateFitness(mutatedGenome, generator);
            
            if (fitness > bestFitness) {
                bestFitness = fitness;
                bestGenome = mutatedGenome;
                
                if (gen % 100 === 0) {
                    console.log(`Generation ${gen}: Fitness = ${fitness.toFixed(6)}`);
                }
            }
        }
        
        return bestGenome;
    }
    
    private evaluateFitness(genome: Genome, generator: NetworkGenerator): number {
        const network = generator.generate(genome);
        let totalError = 0;
        const testPoints = 50;
        
        for (let i = 0; i < testPoints; i++) {
            const x = (i / (testPoints - 1)) * 4 - 2; // Range [-2, 2]
            const expected = this.targetFunction(x);
            
            if (network.execute([x])) {
                const actual = network.getResult()[0];
                const error = Math.abs(actual - expected);
                totalError += error;
            }
        }
        
        return 1.0 / (1.0 + totalError); // Higher is better
    }
    
    private copyGenome(original: Genome): Genome {
        // Implementation similar to XOR example
        const copy = new Genome(original.info.inputs, original.info.outputs);
        
        for (let i = original.info.inputs + original.info.outputs; i < original.nodes.length; i++) {
            copy.createNode(original.nodes[i].activation);
        }
        
        for (const conn of original.connections) {
            copy.createConnection(conn.from, conn.to, conn.weight);
        }
        
        return copy;
    }
    
    public testNetwork(genome: Genome): void {
        const generator = new NetworkGenerator();
        const network = generator.generate(genome);
        
        console.log('x\t\tExpected\tActual\t\tError');
        console.log('-------------------------------------------');
        
        for (let i = 0; i <= 20; i++) {
            const x = (i / 20) * 4 - 2;
            const expected = this.targetFunction(x);
            
            if (network.execute([x])) {
                const actual = network.getResult()[0];
                const error = Math.abs(actual - expected);
                console.log(`${x.toFixed(2)}\t\t${expected.toFixed(4)}\t\t${actual.toFixed(4)}\t\t${error.toFixed(4)}`);
            }
        }
    }
}

// Usage: Approximate sin(x)
const approximator = new FunctionApproximator(x => Math.sin(x));
const trainedGenome = approximator.trainNetwork(2000);
approximator.testNetwork(trainedGenome);
```

### Evolution Simulation

```typescript
import { Genome, NetworkGenerator, Mutator, MutationConfig } from 'neat-js';

interface Individual {
    genome: Genome;
    fitness: number;
    age: number;
    species: number;
}

class EvolutionSimulator {
    private population: Individual[] = [];
    private mutator: Mutator;
    private generator: NetworkGenerator;
    private currentGeneration = 0;
    
    constructor(
        populationSize: number,
        private inputs: number,
        private outputs: number,
        private fitnessFunction: (network: Network) => number
    ) {
        this.mutator = new Mutator();
        this.generator = new NetworkGenerator();
        this.initializePopulation(populationSize);
    }
    
    private initializePopulation(size: number): void {
        for (let i = 0; i < size; i++) {
            const genome = new Genome(this.inputs, this.outputs);
            
            // Add minimal initial connections
            for (let input = 0; input < this.inputs; input++) {
                for (let output = 0; output < this.outputs; output++) {
                    if (Math.random() < 0.5) {
                        const weight = Math.random() * 2 - 1;
                        genome.createConnection(input, this.inputs + output, weight);
                    }
                }
            }
            
            this.population.push({
                genome,
                fitness: 0,
                age: 0,
                species: 0
            });
        }
    }
    
    public simulate(generations: number): void {
        for (let gen = 0; gen < generations; gen++) {
            this.currentGeneration = gen;
            
            // Evaluate fitness
            this.evaluatePopulation();
            
            // Perform speciation
            this.performSpeciation();
            
            // Selection and reproduction
            this.reproduce();
            
            // Report statistics
            if (gen % 10 === 0) {
                this.reportStatistics();
            }
        }
    }
    
    private evaluatePopulation(): void {
        this.population.forEach(individual => {
            const network = this.generator.generate(individual.genome);
            individual.fitness = this.fitnessFunction(network);
            individual.age++;
        });
    }
    
    private performSpeciation(): void {
        // Simple speciation based on network size
        this.population.forEach(individual => {
            const nodeCount = individual.genome.nodes.length;
            individual.species = Math.floor(nodeCount / 5);
        });
    }
    
    private reproduce(): void {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        const eliteCount = Math.floor(this.population.length * 0.1);
        const nextGeneration: Individual[] = [];
        
        // Keep elite
        for (let i = 0; i < eliteCount; i++) {
            nextGeneration.push({
                ...this.population[i],
                age: this.population[i].age
            });
        }
        
        // Generate offspring
        while (nextGeneration.length < this.population.length) {
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            const offspring = this.crossover(parent1.genome, parent2.genome);
            this.mutator.mutateGenome(offspring);
            
            nextGeneration.push({
                genome: offspring,
                fitness: 0,
                age: 0,
                species: 0
            });
        }
        
        this.population = nextGeneration;
    }
    
    private selectParent(): Individual {
        // Tournament selection
        const tournamentSize = 3;
        let best = this.population[Math.floor(Math.random() * this.population.length)];
        
        for (let i = 1; i < tournamentSize; i++) {
            const candidate = this.population[Math.floor(Math.random() * this.population.length)];
            if (candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        
        return best;
    }
    
    private crossover(parent1: Genome, parent2: Genome): Genome {
        // Simple crossover: copy structure from fitter parent, mix weights
        const fitterParent = parent1;
        const offspring = new Genome(this.inputs, this.outputs);
        
        // Copy nodes from fitter parent
        for (let i = this.inputs + this.outputs; i < fitterParent.nodes.length; i++) {
            offspring.createNode(fitterParent.nodes[i].activation);
        }
        
        // Copy and potentially mix connections
        for (const conn of fitterParent.connections) {
            let weight = conn.weight;
            
            // Check if connection exists in other parent
            const matchingConn = parent2.connections.find(
                c => c.from === conn.from && c.to === conn.to
            );
            
            if (matchingConn && Math.random() < 0.5) {
                weight = matchingConn.weight;
            }
            
            offspring.createConnection(conn.from, conn.to, weight);
        }
        
        return offspring;
    }
    
    private reportStatistics(): void {
        const avgFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length;
        const maxFitness = Math.max(...this.population.map(ind => ind.fitness));
        const avgNodes = this.population.reduce((sum, ind) => sum + ind.genome.nodes.length, 0) / this.population.length;
        const avgConnections = this.population.reduce((sum, ind) => sum + ind.genome.connections.length, 0) / this.population.length;
        
        console.log(`Generation ${this.currentGeneration}:`);
        console.log(`  Avg Fitness: ${avgFitness.toFixed(4)}`);
        console.log(`  Max Fitness: ${maxFitness.toFixed(4)}`);
        console.log(`  Avg Nodes: ${avgNodes.toFixed(2)}`);
        console.log(`  Avg Connections: ${avgConnections.toFixed(2)}`);
    }
    
    public getBestIndividual(): Individual {
        return this.population.reduce((best, current) => 
            current.fitness > best.fitness ? current : best
        );
    }
}

// Usage: Evolve a classifier
function fitnessFunction(network: Network): number {
    // Example: classify points in 2D space
    const testData = [
        { input: [0.1, 0.1], expected: 0 },
        { input: [0.9, 0.9], expected: 1 },
        { input: [0.1, 0.9], expected: 1 },
        { input: [0.9, 0.1], expected: 0 }
    ];
    
    let correct = 0;
    for (const data of testData) {
        if (network.execute(data.input)) {
            const output = network.getResult()[0];
            const prediction = output > 0.5 ? 1 : 0;
            if (prediction === data.expected) {
                correct++;
            }
        }
    }
    
    return correct / testData.length;
}

const simulator = new EvolutionSimulator(100, 2, 1, fitnessFunction);
simulator.simulate(200);
const best = simulator.getBestIndividual();
console.log(`Best individual fitness: ${best.fitness}`);
```

### Custom Fitness Functions

```typescript
import { Network } from 'neat-js';

// Fitness function for pole balancing
function poleBalancingFitness(network: Network): number {
    const maxSteps = 1000;
    let steps = 0;
    let position = 0;
    let velocity = 0;
    let angle = Math.random() * 0.1 - 0.05; // Small random initial angle
    let angularVelocity = 0;
    
    const gravity = 9.8;
    const poleLength = 1.0;
    const cartMass = 1.0;
    const poleMass = 0.1;
    const deltaTime = 0.02;
    
    for (steps = 0; steps < maxSteps; steps++) {
        // Network input: [position, velocity, angle, angular_velocity]
        const input = [position / 2.4, velocity / 2.0, angle / 0.2, angularVelocity / 2.0];
        
        if (!network.execute(input)) break;
        
        const output = network.getResult()[0];
        const force = (output - 0.5) * 20; // Convert to force range [-10, 10]
        
        // Physics simulation
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);
        const totalMass = cartMass + poleMass;
        
        const temp = (force + poleMass * poleLength * angularVelocity * angularVelocity * sinAngle) / totalMass;
        const angularAccel = (gravity * sinAngle - cosAngle * temp) / 
            (poleLength * (4.0/3.0 - poleMass * cosAngle * cosAngle / totalMass));
        const accel = temp - poleMass * poleLength * angularAccel * cosAngle / totalMass;
        
        // Update state
        position += velocity * deltaTime;
        velocity += accel * deltaTime;
        angle += angularVelocity * deltaTime;
        angularVelocity += angularAccel * deltaTime;
        
        // Check failure conditions
        if (Math.abs(position) > 2.4 || Math.abs(angle) > 0.2) {
            break;
        }
    }
    
    return steps; // Fitness is number of steps balanced
}

// Fitness function for pattern recognition
function patternRecognitionFitness(network: Network, patterns: {input: number[], output: number[]}[]): number {
    let totalError = 0;
    let validTests = 0;
    
    for (const pattern of patterns) {
        if (network.execute(pattern.input)) {
            const output = network.getResult();
            
            // Calculate mean squared error
            let error = 0;
            for (let i = 0; i < output.length; i++) {
                const diff = output[i] - pattern.output[i];
                error += diff * diff;
            }
            
            totalError += error;
            validTests++;
        }
    }
    
    if (validTests === 0) return 0;
    
    const mse = totalError / validTests;
    return 1.0 / (1.0 + mse); // Higher is better
}

// Fitness function for maze navigation
function mazeNavigationFitness(network: Network, maze: number[][], startX: number, startY: number, goalX: number, goalY: number): number {
    const maxSteps = maze.length * maze[0].length * 2;
    let x = startX;
    let y = startY;
    let steps = 0;
    let visited = new Set<string>();
    
    while (steps < maxSteps) {
        // Check if reached goal
        if (x === goalX && y === goalY) {
            return 1000 + (maxSteps - steps); // Bonus for efficiency
        }
        
        // Get sensor inputs (distances to walls in 4 directions)
        const sensors = [
            getDistanceToWall(maze, x, y, 0, -1), // North
            getDistanceToWall(maze, x, y, 1, 0),  // East
            getDistanceToWall(maze, x, y, 0, 1),  // South
            getDistanceToWall(maze, x, y, -1, 0)  // West
        ];
        
        // Add goal direction
        const goalDirection = [
            (goalX - x) / maze[0].length,
            (goalY - y) / maze.length
        ];
        
        const input = [...sensors, ...goalDirection];
        
        if (!network.execute(input)) break;
        
        const output = network.getResult();
        const action = output.findIndex(val => val === Math.max(...output));
        
        // Move based on action
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        const newX = x + directions[action][0];
        const newY = y + directions[action][1];
        
        // Check bounds and walls
        if (newX >= 0 && newX < maze[0].length && 
            newY >= 0 && newY < maze.length && 
            maze[newY][newX] === 0) {
            x = newX;
            y = newY;
            
            const posKey = `${x},${y}`;
            if (visited.has(posKey)) {
                // Penalty for revisiting
                return steps * 0.5;
            }
            visited.add(posKey);
        }
        
        steps++;
    }
    
    // Fitness based on distance to goal
    const distance = Math.abs(x - goalX) + Math.abs(y - goalY);
    return steps - distance * 10;
}

function getDistanceToWall(maze: number[][], x: number, y: number, dx: number, dy: number): number {
    let distance = 0;
    let currentX = x;
    let currentY = y;
    
    while (currentX >= 0 && currentX < maze[0].length && 
           currentY >= 0 && currentY < maze.length && 
           maze[currentY][currentX] === 0) {
        distance++;
        currentX += dx;
        currentY += dy;
    }
    
    return Math.min(distance / 10.0, 1.0); // Normalize
}
```

### Population Management

```typescript
import { Genome, NetworkGenerator, Mutator } from 'neat-js';

class PopulationManager {
    private population: Genome[] = [];
    private fitnessHistory: number[][] = [];
    private diversityHistory: number[] = [];
    
    constructor(
        private populationSize: number,
        private inputs: number,
        private outputs: number,
        private mutator: Mutator = new Mutator()
    ) {
        this.initializePopulation();
    }
    
    private initializePopulation(): void {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const genome = new Genome(this.inputs, this.outputs);
            
            // Add random initial connections
            const connectionProbability = 0.3;
            for (let input = 0; input < this.inputs; input++) {
                for (let output = 0; output < this.outputs; output++) {
                    if (Math.random() < connectionProbability) {
                        const weight = Math.random() * 4 - 2; // Range [-2, 2]
                        genome.createConnection(input, this.inputs + output, weight);
                    }
                }
            }
            
            this.population.push(genome);
        }
    }
    
    public evolve(
        fitnessFunction: (genome: Genome) => number,
        generations: number,
        options: {
            eliteRatio?: number,
            mutationRate?: number,
            diversityTarget?: number,
            extinctionThreshold?: number
        } = {}
    ): void {
        const {
            eliteRatio = 0.1,
            mutationRate = 0.8,
            diversityTarget = 0.5,
            extinctionThreshold = 0.01
        } = options;
        
        for (let gen = 0; gen < generations; gen++) {
            // Evaluate fitness
            const fitness = this.population.map(genome => ({
                genome,
                fitness: fitnessFunction(genome)
            }));
            
            // Sort by fitness
            fitness.sort((a, b) => b.fitness - a.fitness);
            
            // Record statistics
            const fitnesses = fitness.map(f => f.fitness);
            this.fitnessHistory.push(fitnesses);
            
            const diversity = this.calculateDiversity();
            this.diversityHistory.push(diversity);
            
            // Check for extinction event
            const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
            const maxFitness = Math.max(...fitnesses);
            
            if (maxFitness - avgFitness < extinctionThreshold && gen > 50) {
                console.log(`Extinction event at generation ${gen}`);
                this.handleExtinction(fitness.slice(0, Math.floor(this.populationSize * 0.1)));
                continue;
            }
            
            // Diversity maintenance
            if (diversity < diversityTarget && gen % 20 === 0) {
                this.injectDiversity();
            }
            
            // Create next generation
            const nextGeneration: Genome[] = [];
            
            // Elite selection
            const eliteCount = Math.floor(this.populationSize * eliteRatio);
            for (let i = 0; i < eliteCount; i++) {
                nextGeneration.push(this.copyGenome(fitness[i].genome));
            }
            
            // Tournament selection and reproduction
            while (nextGeneration.length < this.populationSize) {
                const parent1 = this.tournamentSelection(fitness, 3);
                const parent2 = this.tournamentSelection(fitness, 3);
                
                let offspring: Genome;
                if (Math.random() < 0.3) {
                    // Crossover
                    offspring = this.crossover(parent1.genome, parent2.genome);
                } else {
                    // Asexual reproduction
                    offspring = this.copyGenome(parent1.genome);
                }
                
                // Mutation
                if (Math.random() < mutationRate) {
                    this.mutator.mutateGenome(offspring);
                }
                
                nextGeneration.push(offspring);
            }
            
            this.population = nextGeneration;
            
            // Report progress
            if (gen % 10 === 0) {
                console.log(`Generation ${gen}:`);
                console.log(`  Best: ${maxFitness.toFixed(4)}`);
                console.log(`  Avg: ${avgFitness.toFixed(4)}`);
                console.log(`  Diversity: ${diversity.toFixed(4)}`);
            }
        }
    }
    
    private calculateDiversity(): number {
        let totalDistance = 0;
        let comparisons = 0;
        
        for (let i = 0; i < this.population.length; i++) {
            for (let j = i + 1; j < this.population.length; j++) {
                const distance = this.genomicDistance(this.population[i], this.population[j]);
                totalDistance += distance;
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalDistance / comparisons : 0;
    }
    
    private genomicDistance(genome1: Genome, genome2: Genome): number {
        const nodesDiff = Math.abs(genome1.nodes.length - genome2.nodes.length);
        const connsDiff = Math.abs(genome1.connections.length - genome2.connections.length);
        
        // Simple distance based on structural differences
        return (nodesDiff + connsDiff) / Math.max(genome1.nodes.length + genome2.nodes.length, 1);
    }
    
    private handleExtinction(survivors: {genome: Genome, fitness: number}[]): void {
        this.population = [];
        
        // Keep survivors
        for (const survivor of survivors) {
            this.population.push(this.copyGenome(survivor.genome));
        }
        
        // Fill with mutated copies and new random genomes
        while (this.population.length < this.populationSize) {
            if (this.population.length < this.populationSize * 0.5) {
                // Add mutated survivors
                const parent = survivors[Math.floor(Math.random() * survivors.length)];
                const offspring = this.copyGenome(parent.genome);
                
                // Heavy mutation for diversity
                for (let i = 0; i < 5; i++) {
                    this.mutator.mutateGenome(offspring);
                }
                
                this.population.push(offspring);
            } else {
                // Add completely new genomes
                const newGenome = new Genome(this.inputs, this.outputs);
                for (let input = 0; input < this.inputs; input++) {
                    for (let output = 0; output < this.outputs; output++) {
                        if (Math.random() < 0.5) {
                            const weight = Math.random() * 4 - 2;
                            newGenome.createConnection(input, this.inputs + output, weight);
                        }
                    }
                }
                this.population.push(newGenome);
            }
        }
    }
    
    private injectDiversity(): void {
        const diversityCount = Math.floor(this.populationSize * 0.1);
        
        for (let i = 0; i < diversityCount; i++) {
            const newGenome = new Genome(this.inputs, this.outputs);
            
            // Random topology
            const hiddenNodes = Math.floor(Math.random() * 5);
            for (let h = 0; h < hiddenNodes; h++) {
                newGenome.createNode(Math.random() < 0.5 ? Activation.Relu : Activation.Sigm);
            }
            
            // Random connections
            const nodeCount = newGenome.nodes.length;
            const connectionCount = Math.floor(Math.random() * nodeCount * 2);
            
            for (let c = 0; c < connectionCount; c++) {
                const from = Math.floor(Math.random() * (nodeCount - this.outputs));
                const to = Math.floor(Math.random() * (nodeCount - this.inputs)) + this.inputs;
                const weight = Math.random() * 4 - 2;
                
                newGenome.tryCreateConnection(from, to, weight);
            }
            
            // Replace random individual
            const replaceIndex = Math.floor(Math.random() * this.population.length);
            this.population[replaceIndex] = newGenome;
        }
    }
    
    private tournamentSelection(
        fitness: {genome: Genome, fitness: number}[], 
        tournamentSize: number
    ): {genome: Genome, fitness: number} {
        let best = fitness[Math.floor(Math.random() * fitness.length)];
        
        for (let i = 1; i < tournamentSize; i++) {
            const candidate = fitness[Math.floor(Math.random() * fitness.length)];
            if (candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        
        return best;
    }
    
    private crossover(parent1: Genome, parent2: Genome): Genome {
        const offspring = new Genome(this.inputs, this.outputs);
        
        // Copy nodes from both parents
        const maxNodes = Math.max(parent1.nodes.length, parent2.nodes.length);
        for (let i = this.inputs + this.outputs; i < maxNodes; i++) {
            if (i < parent1.nodes.length && i < parent2.nodes.length) {
                // Both parents have this node, choose randomly
                const sourceParent = Math.random() < 0.5 ? parent1 : parent2;
                offspring.createNode(sourceParent.nodes[i].activation);
            } else if (i < parent1.nodes.length) {
                offspring.createNode(parent1.nodes[i].activation);
            } else if (i < parent2.nodes.length) {
                offspring.createNode(parent2.nodes[i].activation);
            }
        }
        
        // Merge connections
        const allConnections = new Map<string, {weight: number, count: number}>();
        
        for (const conn of parent1.connections) {
            const key = `${conn.from}-${conn.to}`;
            allConnections.set(key, {weight: conn.weight, count: 1});
        }
        
        for (const conn of parent2.connections) {
            const key = `${conn.from}-${conn.to}`;
            const existing = allConnections.get(key);
            if (existing) {
                // Average weights if connection exists in both
                existing.weight = (existing.weight + conn.weight) / 2;
                existing.count = 2;
            } else {
                allConnections.set(key, {weight: conn.weight, count: 1});
            }
        }
        
        // Add connections to offspring
        for (const [key, {weight}] of allConnections) {
            const [from, to] = key.split('-').map(Number);
            if (from < offspring.nodes.length && to < offspring.nodes.length) {
                offspring.tryCreateConnection(from, to, weight);
            }
        }
        
        return offspring;
    }
    
    private copyGenome(original: Genome): Genome {
        const copy = new Genome(original.info.inputs, original.info.outputs);
        
        // Copy hidden nodes
        for (let i = this.inputs + this.outputs; i < original.nodes.length; i++) {
            copy.createNode(original.nodes[i].activation);
        }
        
        // Copy connections
        for (const conn of original.connections) {
            copy.createConnection(conn.from, conn.to, conn.weight);
        }
        
        return copy;
    }
    
    public getBest(): Genome {
        // This should be called after fitness evaluation
        return this.population[0]; // Placeholder
    }
    
    public getStatistics(): {
        fitnessHistory: number[][],
        diversityHistory: number[],
        averageComplexity: number
    } {
        const avgComplexity = this.population.reduce((sum, genome) => 
            sum + genome.nodes.length + genome.connections.length, 0) / this.population.length;
        
        return {
            fitnessHistory: this.fitnessHistory,
            diversityHistory: this.diversityHistory,
            averageComplexity: avgComplexity
        };
    }
}

// Usage
const popManager = new PopulationManager(100, 2, 1);

const xorFitness = (genome: Genome): number => {
    const generator = new NetworkGenerator();
    const network = generator.generate(genome);
    
    const testCases = [
        {input: [0, 0], expected: 0},
        {input: [0, 1], expected: 1},
        {input: [1, 0], expected: 1},
        {input: [1, 1], expected: 0}
    ];
    
    let score = 0;
    for (const test of testCases) {
        if (network.execute(test.input)) {
            const output = network.getResult()[0];
            const error = Math.abs(output - test.expected);
            score += 1 - error;
        }
    }
    
    return score / testCases.length;
};

popManager.evolve(xorFitness, 200, {
    eliteRatio: 0.1,
    mutationRate: 0.8,
    diversityTarget: 0.3
});
```

---

## Advanced Topics

### Topology Evolution

NEAT's key innovation is the evolution of network topology. Here's how to leverage this:

```typescript
// Monitor topology evolution
function trackTopologyEvolution(genomes: Genome[], generations: number): void {
    const stats = {
        avgNodes: [],
        avgConnections: [],
        maxDepth: [],
        complexity: []
    };
    
    for (let gen = 0; gen < generations; gen++) {
        const avgNodes = genomes.reduce((sum, g) => sum + g.nodes.length, 0) / genomes.length;
        const avgConns = genomes.reduce((sum, g) => sum + g.connections.length, 0) / genomes.length;
        const maxDepth = Math.max(...genomes.map(g => {
            g.computeDepth();
            return Math.max(...g.nodes.map(n => n.depth));
        }));
        const complexity = avgNodes + avgConns;
        
        stats.avgNodes.push(avgNodes);
        stats.avgConnections.push(avgConns);
        stats.maxDepth.push(maxDepth);
        stats.complexity.push(complexity);
        
        console.log(`Gen ${gen}: Nodes=${avgNodes.toFixed(2)}, Conns=${avgConns.toFixed(2)}, Depth=${maxDepth}`);
    }
}
```

### Speciation

Implement speciation to preserve diversity:

```typescript
class Species {
    public members: Genome[] = [];
    public representative: Genome;
    public staleness = 0;
    public bestFitness = 0;
    
    constructor(representative: Genome) {
        this.representative = representative;
        this.members.push(representative);
    }
    
    public isCompatible(genome: Genome, threshold: number): boolean {
        return this.calculateDistance(genome, this.representative) < threshold;
    }
    
    private calculateDistance(genome1: Genome, genome2: Genome): number {
        const c1 = 1.0; // Excess coefficient
        const c2 = 1.0; // Disjoint coefficient
        const c3 = 0.4; // Weight difference coefficient
        
        const maxGenes = Math.max(genome1.connections.length, genome2.connections.length);
        if (maxGenes === 0) return 0;
        
        // Simplified distance calculation
        const sizeDiff = Math.abs(genome1.connections.length - genome2.connections.length);
        const nodeDiff = Math.abs(genome1.nodes.length - genome2.nodes.length);
        
        return (c1 * sizeDiff + c2 * nodeDiff) / maxGenes;
    }
}
```

### Performance Optimization

Tips for optimizing NEAT performance:

```typescript
// Use object pooling for large populations
class GenomePool {
    private pool: Genome[] = [];
    
    public acquire(inputs: number, outputs: number): Genome {
        if (this.pool.length > 0) {
            const genome = this.pool.pop()!;
            this.resetGenome(genome, inputs, outputs);
            return genome;
        }
        return new Genome(inputs, outputs);
    }
    
    public release(genome: Genome): void {
        this.pool.push(genome);
    }
    
    private resetGenome(genome: Genome, inputs: number, outputs: number): void {
        genome.nodes.length = 0;
        genome.connections.length = 0;
        genome.graph.nodes.length = 0;
        genome.info.inputs = inputs;
        genome.info.outputs = outputs;
        genome.info.hidden = 0;
        
        // Reinitialize
        for (let i = 0; i < inputs + outputs; i++) {
            genome.createNode(i < inputs ? Activation.None : Activation.Tanh, false);
        }
    }
}

// Batch network evaluation
function evaluateNetworksBatch(genomes: Genome[], testData: {input: number[], expected: number[]}[]): number[] {
    const generator = new NetworkGenerator();
    const results: number[] = [];
    
    for (const genome of genomes) {
        const network = generator.generate(genome);
        let fitness = 0;
        
        for (const test of testData) {
            if (network.execute(test.input)) {
                const output = network.getResult();
                const error = output.reduce((sum, val, i) => 
                    sum + Math.abs(val - test.expected[i]), 0);
                fitness += 1 / (1 + error);
            }
        }
        
        results.push(fitness / testData.length);
    }
    
    return results;
}
```

---

## Testing

The library includes comprehensive tests covering:

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction
- **Performance Tests**: Large-scale operations
- **Error Handling**: Edge cases and invalid inputs

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="Genome"
```

### Writing Custom Tests

```typescript
import { Genome, NetworkGenerator } from 'neat-js';

describe('Custom NEAT Tests', () => {
    test('should create valid network topology', () => {
        const genome = new Genome(2, 1);
        genome.createConnection(0, 2, 0.5);
        
        const generator = new NetworkGenerator();
        const network = generator.generate(genome);
        
        expect(network.execute([1, 0])).toBe(true);
        expect(network.getResult()).toHaveLength(1);
    });
    
    test('should maintain acyclic property', () => {
        const genome = new Genome(3, 1);
        
        // These should succeed
        expect(genome.tryCreateConnection(0, 3, 0.5)).toBe(true);
        expect(genome.tryCreateConnection(1, 3, 0.3)).toBe(true);
        
        // This should fail (would create cycle)
        expect(genome.tryCreateConnection(3, 0, 0.2)).toBe(false);
    });
});
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch
3. **Write tests** for new functionality
4. **Ensure** all tests pass
5. **Update** documentation
6. **Submit** a pull request

### Development Setup

```bash
git clone https://github.com/yourusername/neat-js.git
cd neat-js
npm install
npm run build
npm test
```

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Maintain test coverage above 95%

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/neat-js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/neat-js/discussions)
- **Wiki**: [Project Wiki](https://github.com/yourusername/neat-js/wiki)

---

*This documentation covers the complete NEAT-JS library. For additional examples and advanced usage patterns, please refer to the examples directory and test files.*
