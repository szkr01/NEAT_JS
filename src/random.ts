// 乱数生成器のインターフェース
export interface IRandomGenerator {
  random(): number;
  randomInt(max: number): number;
  randomRange(min: number, max: number): number;
  probability(prob: number): boolean;
  choice<T>(array: readonly T[]): T;
  seed(seed: number): void;
}

// シンプルな線形合同法による乱数生成器
export class SimpleRandomGenerator implements IRandomGenerator {
  private _seed: number;

  constructor(seed: number = Date.now()) {
    this._seed = seed;
  }

  public random(): number {
    this._seed = (this._seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this._seed / Math.pow(2, 32);
  }

  public randomInt(max: number): number {
    return Math.floor(this.random() * max);
  }

  public randomRange(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  public probability(prob: number): boolean {
    return this.random() < prob;
  }

  public choice<T>(array: readonly T[]): T {
    const index = this.randomInt(array.length);
    return array[index];
  }

  public seed(seed: number): void {
    this._seed = seed;
  }
}

// 標準のMath.randomを使用する乱数生成器
export class StandardRandomGenerator implements IRandomGenerator {
  public random(): number {
    return Math.random();
  }

  public randomInt(max: number): number {
    return Math.floor(this.random() * max);
  }

  public randomRange(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  public probability(prob: number): boolean {
    return this.random() < prob;
  }

  public choice<T>(array: readonly T[]): T {
    const index = this.randomInt(array.length);
    return array[index];
  }

  public seed(seed: number): void {
    // Math.randomはシードの設定をサポートしていないため、警告を出す
    console.warn('StandardRandomGenerator does not support seeding. Use SimpleRandomGenerator for reproducible results.');
  }
}

// 乱数生成器のファクトリー
export class RandomGeneratorFactory {
  private static instance: IRandomGenerator = new StandardRandomGenerator();

  public static getInstance(): IRandomGenerator {
    return this.instance;
  }

  public static setInstance(generator: IRandomGenerator): void {
    this.instance = generator;
  }

  public static createSimple(seed?: number): IRandomGenerator {
    return new SimpleRandomGenerator(seed);
  }

  public static createStandard(): IRandomGenerator {
    return new StandardRandomGenerator();
  }
}
