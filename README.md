# NEAT-JS

[![npm version](https://badge.fury.io/js/neat-js.svg)](https://badge.fury.io/js/neat-js)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/yourusername/neat-js/actions)
[![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen.svg)](https://github.com/yourusername/neat-js/actions)

A comprehensive TypeScript implementation of NEAT (NeuroEvolution of Augmenting Topologies) neural network library.

## Overview

NEAT is a method for evolving artificial neural networks with a genetic algorithm. This library provides a complete TypeScript implementation that allows you to:

- Create and evolve neural network topologies
- Execute networks with given inputs
- Mutate genomes to explore different network architectures
- Generate executable networks from genome blueprints

## Installation

```bash
npm install neat-js
```

## Quick Start

```typescript
import { Genome, NetworkGenerator, Mutator } from 'neat-js';

// Create a simple genome with 2 inputs and 1 output
const genome = new Genome(2, 1);

// Generate an executable network
const generator = new NetworkGenerator();
const network = generator.generate(genome);

// Execute the network
const input = [0.5, -0.3];
if (network.execute(input)) {
    const output = network.getResult();
    console.log('Output:', output);
}

// Mutate the genome
const mutator = new Mutator();
mutator.mutateGenome(genome);
```

## Core Components

### Genome
The blueprint of a neural network containing nodes and connections.

```typescript
const genome = new Genome(inputs, outputs);
genome.createNode(Activation.Relu);
genome.tryCreateConnection(fromNode, toNode, weight);
```

### Network
The executable neural network generated from a genome.

```typescript
const network = generator.generate(genome);
const success = network.execute([input1, input2, ...]);
const results = network.getResult();
```

### Mutator
Handles the evolutionary mutations of genomes.

```typescript
const mutator = new Mutator({
    newNodeProba: 0.03,
    newConnProba: 0.05,
    weightRange: 2.0
});
mutator.mutateGenome(genome);
```

## 📖 Documentation

For complete documentation, API reference, and advanced examples, see:

- **[Complete Documentation](DOCUMENTATION.md)** - Comprehensive guide with examples
- **[API Reference](DOCUMENTATION.md#api-reference)** - Detailed API documentation  
- **[Use Cases & Examples](DOCUMENTATION.md#use-cases-and-examples)** - Practical examples and patterns
- **[Advanced Topics](DOCUMENTATION.md#advanced-topics)** - Performance optimization and advanced techniques

## 🚀 Quick Examples

Run the included examples to see NEAT-JS in action:

```bash
# Run all examples
npm run examples

# Or execute directly
npx ts-node examples.ts
```

Examples include:
- Basic XOR problem solving
- Advanced evolutionary strategies
- Function approximation 
- Performance benchmarks

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
