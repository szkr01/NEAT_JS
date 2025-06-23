/**
 * Example demonstrating basic usage of the NEAT-JS library
 */

import { 
    Genome, 
    NetworkGenerator, 
    Mutator, 
    Activation, 
    defaultMutationConfig 
} from './src/index';

// Create a simple XOR problem solver
function xorExample() {
    console.log('=== XOR Example ===');
    
    // Create a genome with 2 inputs and 1 output
    const genome = new Genome(2, 1);
    
    // Add some initial connections
    genome.createConnection(0, 2, 0.5);  // Input 0 -> Output
    genome.createConnection(1, 2, -0.3); // Input 1 -> Output
    
    // Generate a network from the genome
    const generator = new NetworkGenerator();
    const network = generator.generate(genome);
    
    // Test XOR inputs
    const testCases = [
        { input: [0, 0], expected: 0 },
        { input: [0, 1], expected: 1 },
        { input: [1, 0], expected: 1 },
        { input: [1, 1], expected: 0 }
    ];
    
    console.log('Initial network performance:');
    for (const testCase of testCases) {
        const success = network.execute(testCase.input);
        if (success) {
            const output = network.getResult();
            console.log(`Input: [${testCase.input.join(', ')}] -> Output: ${output[0].toFixed(4)} (Expected: ${testCase.expected})`);
        }
    }
}

// Demonstrate evolution through mutations
function evolutionExample() {
    console.log('\n=== Evolution Example ===');
    
    const genome = new Genome(2, 1);
    genome.createConnection(0, 2, Math.random() - 0.5);
    genome.createConnection(1, 2, Math.random() - 0.5);
    
    const mutator = new Mutator({
        ...defaultMutationConfig,
        newNodeProba: 0.1,  // Higher probability for demonstration
        newConnProba: 0.2
    });
    
    const generator = new NetworkGenerator();
    
    console.log(`Initial genome: ${genome.nodes.length} nodes, ${genome.connections.length} connections`);
    
    // Evolve for several generations
    for (let generation = 1; generation <= 10; generation++) {
        mutator.mutateGenome(genome);
        
        if (generation % 3 === 0) {
            const network = generator.generate(genome);
            console.log(`Generation ${generation}: ${genome.nodes.length} nodes, ${genome.connections.length} connections, ${genome.info.hidden} hidden`);
            
            // Test with a simple input
            const testResult = network.execute([0.5, -0.3]);
            if (testResult) {
                console.log(`  Test output: ${network.getResult()[0].toFixed(4)}`);
            }
        }
    }
}

// Demonstrate different activation functions
function activationExample() {
    console.log('\n=== Activation Functions Example ===');
    
    const activations = [Activation.None, Activation.Relu, Activation.Sigm, Activation.Tanh];
    
    for (const activation of activations) {
        const genome = new Genome(1, 1);
        const hiddenNode = genome.createNode(activation);
        
        genome.createConnection(0, hiddenNode, 1.0);
        genome.createConnection(hiddenNode, 1, 1.0);
        
        const generator = new NetworkGenerator();
        const network = generator.generate(genome);
        
        const testInput = 0.5;
        const success = network.execute([testInput]);
        if (success) {
            const output = network.getResult()[0];
            console.log(`${activation} activation: input ${testInput} -> output ${output.toFixed(4)}`);
        }
    }
}

// Advanced XOR evolution with fitness tracking
function advancedXORExample() {
    console.log('\n=== Advanced XOR Evolution ===');
    
    const populationSize = 50;
    const generations = 100;
    let population: Genome[] = [];
    
    // Initialize population
    for (let i = 0; i < populationSize; i++) {
        const genome = new Genome(2, 1);
        genome.createConnection(0, 2, Math.random() * 2 - 1);
        genome.createConnection(1, 2, Math.random() * 2 - 1);
        population.push(genome);
    }
    
    const mutator = new Mutator(defaultMutationConfig);
    const generator = new NetworkGenerator();
    
    // XOR test cases
    const xorTests = [
        { input: [0, 0], expected: 0 },
        { input: [0, 1], expected: 1 },
        { input: [1, 0], expected: 1 },
        { input: [1, 1], expected: 0 }
    ];
    
    // Fitness function
    function evaluateFitness(genome: Genome): number {
        const network = generator.generate(genome);
        let totalError = 0;
        
        for (const test of xorTests) {
            if (network.execute(test.input)) {
                const output = network.getResult()[0];
                const error = Math.abs(output - test.expected);
                totalError += error;
            }
        }
        
        return 4.0 - totalError; // Higher is better
    }
    
    let bestFitness = 0;
    
    // Evolution loop
    for (let gen = 0; gen < generations; gen++) {
        // Evaluate fitness
        const fitness = population.map(genome => ({
            genome,
            fitness: evaluateFitness(genome)
        }));
        
        // Sort by fitness
        fitness.sort((a, b) => b.fitness - a.fitness);
        
        const currentBest = fitness[0].fitness;
        if (currentBest > bestFitness) {
            bestFitness = currentBest;
        }
        
        // Report progress
        if (gen % 20 === 0) {
            const avgFitness = fitness.reduce((sum, f) => sum + f.fitness, 0) / fitness.length;
            console.log(`Generation ${gen}: Best=${currentBest.toFixed(4)}, Avg=${avgFitness.toFixed(4)}`);
        }
        
        // Early stopping
        if (currentBest > 3.9) {
            console.log(`Solution found at generation ${gen}! Fitness: ${currentBest.toFixed(4)}`);
            
            // Test the best solution
            const bestNetwork = generator.generate(fitness[0].genome);
            console.log('Final test results:');
            for (const test of xorTests) {
                if (bestNetwork.execute(test.input)) {
                    const output = bestNetwork.getResult()[0];
                    const prediction = output > 0.5 ? 1 : 0;
                    console.log(`  [${test.input.join(',')}] -> ${output.toFixed(4)} (${prediction}) Expected: ${test.expected}`);
                }
            }
            break;
        }
        
        // Create next generation
        const nextGeneration: Genome[] = [];
        
        // Keep best 20%
        const eliteCount = Math.floor(populationSize * 0.2);
        for (let i = 0; i < eliteCount; i++) {
            nextGeneration.push(copyGenome(fitness[i].genome));
        }
        
        // Fill with mutated offspring
        while (nextGeneration.length < populationSize) {
            const parent = fitness[Math.floor(Math.random() * eliteCount)].genome;
            const child = copyGenome(parent);
            mutator.mutateGenome(child);
            nextGeneration.push(child);
        }
        
        population = nextGeneration;
    }
}

// Function approximation example
function functionApproximationExample() {
    console.log('\n=== Function Approximation Example ===');
    
    // Target function: f(x) = sin(x * 2)
    const targetFunction = (x: number) => Math.sin(x * 2);
    
    // Create initial genome
    const genome = new Genome(1, 1);
    genome.createConnection(0, 1, Math.random() * 2 - 1);
    
    const mutator = new Mutator({
        ...defaultMutationConfig,
        newNodeProba: 0.02,
        newConnProba: 0.05
    });
    
    const generator = new NetworkGenerator();
    
    // Training data
    const trainingData: { input: number, expected: number }[] = [];
    for (let i = 0; i < 20; i++) {
        const x = (i / 19) * Math.PI * 2 - Math.PI; // Range [-π, π]
        trainingData.push({ input: x, expected: targetFunction(x) });
    }
    
    function evaluateFitness(genome: Genome): number {
        const network = generator.generate(genome);
        let totalError = 0;
        
        for (const data of trainingData) {
            if (network.execute([data.input])) {
                const output = network.getResult()[0];
                const error = Math.abs(output - data.expected);
                totalError += error;
            }
        }
        
        return 1.0 / (1.0 + totalError); // Higher is better
    }
    
    let bestGenome = genome;
    let bestFitness = evaluateFitness(genome);
    
    console.log(`Initial fitness: ${bestFitness.toFixed(6)}`);
    
    // Evolution
    for (let gen = 0; gen < 500; gen++) {
        const mutatedGenome = copyGenome(bestGenome);
        mutator.mutateGenome(mutatedGenome);
        
        const fitness = evaluateFitness(mutatedGenome);
        
        if (fitness > bestFitness) {
            bestFitness = fitness;
            bestGenome = mutatedGenome;
            
            if (gen % 100 === 0) {
                console.log(`Generation ${gen}: Fitness=${fitness.toFixed(6)}, Nodes=${mutatedGenome.nodes.length}, Connections=${mutatedGenome.connections.length}`);
            }
        }
    }
    
    // Test final network
    console.log('\nFinal approximation test:');
    const finalNetwork = generator.generate(bestGenome);
    console.log('x\t\tExpected\tActual\t\tError');
    console.log('----------------------------------------');
    
    for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * Math.PI * 2 - Math.PI;
        const expected = targetFunction(x);
        
        if (finalNetwork.execute([x])) {
            const actual = finalNetwork.getResult()[0];
            const error = Math.abs(actual - expected);
            console.log(`${x.toFixed(2)}\t\t${expected.toFixed(4)}\t\t${actual.toFixed(4)}\t\t${error.toFixed(4)}`);
        }
    }
}

// Helper function to copy genomes
function copyGenome(original: Genome): Genome {
    const copy = new Genome(original.info.inputs, original.info.outputs);
    
    // Copy hidden nodes
    for (let i = original.info.inputs + original.info.outputs; i < original.nodes.length; i++) {
        copy.createNode(original.nodes[i].activation);
    }
    
    // Copy connections
    for (const conn of original.connections) {
        copy.createConnection(conn.from, conn.to, conn.weight);
    }
    
    return copy;
}

// Performance benchmark
function performanceBenchmark() {
    console.log('\n=== Performance Benchmark ===');
    
    const start = performance.now();
    
    // Create large population
    const population: Genome[] = [];
    for (let i = 0; i < 1000; i++) {
        const genome = new Genome(5, 2);
        
        // Add random connections
        for (let j = 0; j < 10; j++) {
            const from = Math.floor(Math.random() * 5);
            const to = Math.floor(Math.random() * 2) + 5;
            genome.tryCreateConnection(from, to, Math.random() * 2 - 1);
        }
        
        population.push(genome);
    }
    
    const creationTime = performance.now() - start;
    console.log(`Created ${population.length} genomes in ${creationTime.toFixed(2)}ms`);
    
    // Generation benchmark
    const genStart = performance.now();
    const generator = new NetworkGenerator();
    const networks = population.map(genome => generator.generate(genome));
    const genTime = performance.now() - genStart;
    console.log(`Generated ${networks.length} networks in ${genTime.toFixed(2)}ms`);
    
    // Execution benchmark
    const execStart = performance.now();
    let executions = 0;
    for (const network of networks) {
        for (let i = 0; i < 10; i++) {
            const input = Array(5).fill(0).map(() => Math.random());
            if (network.execute(input)) {
                executions++;
            }
        }
    }
    const execTime = performance.now() - execStart;
    console.log(`Executed ${executions} network runs in ${execTime.toFixed(2)}ms`);
    console.log(`Average execution time: ${(execTime / executions).toFixed(6)}ms per run`);
}

// Run all examples
function main() {
    console.log('NEAT-JS Library Examples\n');
    
    xorExample();
    evolutionExample();
    activationExample();
    advancedXORExample();
    functionApproximationExample();
    performanceBenchmark();
    
    console.log('\nAll examples completed!');
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}
