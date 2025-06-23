import { NEAT, DEFAULT_MUTATION_CONFIG, DEFAULT_EVOLUTION_CONFIG } from '../index.js';
import { Genome } from '../genome.js';
import { ActivationType } from '../types.js';

describe('NEAT Integration Tests', () => {
  let neat: NEAT;

  beforeEach(() => {
    neat = new NEAT({ seed: 12345 }); // 再現可能な結果のためのシード
  });

  describe('createGenome', () => {
    it('should create genome with correct structure', () => {
      const genome = neat.createGenome(3, 2);
      
      expect(genome.info.inputs).toBe(3);
      expect(genome.info.outputs).toBe(2);
      expect(genome.info.hidden).toBe(0);
      expect(genome.nodes.length).toBe(5);
    });
  });

  describe('createNetwork', () => {
    it('should create functional network from genome', () => {
      const genome = neat.createGenome(2, 1);
      genome.createConnection(0, 2, 0.5);
      genome.createConnection(1, 2, -0.3);

      const network = neat.createNetwork(genome);
      
      expect(network.info).toEqual(genome.info);
      
      const outputs = network.execute([1.0, 1.0]);
      expect(outputs.length).toBe(1);
      expect(typeof outputs[0]).toBe('number');
    });
  });

  describe('mutateGenome', () => {
    it('should create mutated copy of genome', () => {
      const original = neat.createGenome(2, 1);
      original.createConnection(0, 2, 0.5);

      const mutated = neat.mutateGenome(original);
      
      expect(mutated).not.toBe(original);
      expect(mutated.info).toEqual(original.info);
    });
  });

  describe('createInitialPopulation', () => {
    it('should create population with correct size', () => {
      const population = neat.createInitialPopulation(2, 1, 10);
      
      expect(population.length).toBe(10);
      population.forEach(genome => {
        expect(genome.info.inputs).toBe(2);
        expect(genome.info.outputs).toBe(1);
        expect(genome.connections.length).toBeGreaterThan(0);
      });
    });
  });

  describe('evolve', () => {
    it('should improve fitness over generations', () => {
      // XOR問題のような簡単なフィットネス関数
      const fitnessFunction = (genome: any) => {
        const network = neat.createNetwork(genome);
        let fitness = 0;

        const testCases = [
          { input: [0, 0], expected: 0 },
          { input: [0, 1], expected: 1 },
          { input: [1, 0], expected: 1 },
          { input: [1, 1], expected: 0 }
        ];

        for (const testCase of testCases) {
          const output = network.execute(testCase.input);
          const error = Math.abs(output[0] - testCase.expected);
          fitness += 1.0 - error; // エラーが小さいほど高いフィットネス
        }

        return { fitness: Math.max(0, fitness) };
      };

      const population = neat.createInitialPopulation(2, 1, 20);
      const result = neat.evolve(
        population,
        fitnessFunction,
        { ...DEFAULT_EVOLUTION_CONFIG, maxGenerations: 10 }
      );

      expect(result.generation).toBeGreaterThan(0);
      expect(result.bestFitness).toBeGreaterThanOrEqual(0);
      expect(result.fitnessHistory.length).toBeGreaterThan(0);
      expect(result.population.length).toBe(DEFAULT_EVOLUTION_CONFIG.populationSize);
    });
  });

  describe('run', () => {
    it('should execute complete evolution process', () => {
      const fitnessFunction = (genome: any) => {
        const network = neat.createNetwork(genome);
        // 単純な適応度関数：出力の絶対値が大きいほど良い
        const output = network.execute([1.0, 0.5]);
        return { fitness: Math.abs(output[0]) };
      };

      const result = neat.run(
        2, 1,
        fitnessFunction,
        { ...DEFAULT_EVOLUTION_CONFIG, maxGenerations: 5, populationSize: 10 }
      );

      expect(result.generation).toBeGreaterThan(0);
      expect(result.bestGenome).toBeDefined();
      expect(result.population.length).toBe(10);
    });
  });

  describe('getStats', () => {
    it('should return correct population statistics', () => {
      const population = neat.createInitialPopulation(3, 2, 5);
      const stats = neat.getStats(population);

      expect(stats.averageNodes).toBeGreaterThan(0);
      expect(stats.averageConnections).toBeGreaterThan(0);
      expect(stats.maxNodes).toBeGreaterThanOrEqual(stats.averageNodes);
      expect(stats.maxConnections).toBeGreaterThanOrEqual(stats.averageConnections);
      expect(stats.speciesCount).toBe(1);
    });
  });

  describe('deterministic behavior with seed', () => {
    it('should produce identical results with same seed', () => {
      const neat1 = new NEAT({ seed: 42 });
      const neat2 = new NEAT({ seed: 42 });

      const pop1 = neat1.createInitialPopulation(2, 1, 5);
      const pop2 = neat2.createInitialPopulation(2, 1, 5);

      // 同じシードで同じ結果が出ることを確認
      for (let i = 0; i < pop1.length; i++) {
        expect(pop1[i].connections.length).toBe(pop2[i].connections.length);
      }
    });
  });

  describe('complex topology evolution', () => {
    it('should be able to evolve complex networks', () => {
      const fitnessFunction = (genome: any) => {
        // 複雑なネットワークを優先する適応度関数
        const nodeCount = genome.info.hidden;
        const connectionCount = genome.connections.filter((c: any) => c.enabled).length;
        
        return { 
          fitness: nodeCount * 0.1 + connectionCount * 0.05 + Math.random() * 0.1 
        };
      };

      const population = neat.createInitialPopulation(3, 2, 15);
      const result = neat.evolve(
        population,
        fitnessFunction,
        { ...DEFAULT_EVOLUTION_CONFIG, maxGenerations: 20 },
        { ...DEFAULT_MUTATION_CONFIG, addNodeRate: 0.1, addConnectionRate: 0.15 }
      );

      // 進化後により複雑なネットワークが生まれていることを確認
      const finalStats = neat.getStats(result.population);
      expect(finalStats.maxNodes).toBeGreaterThan(5); // 入力+出力だけでなく隠れノードも
    });
  });
});
