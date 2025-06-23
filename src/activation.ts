import { ActivationType, RealType } from './types.js';

// 活性化関数のインターフェース
export interface IActivationFunction {
  activate(value: RealType): RealType;
}

// 活性化関数の実装
export class ActivationFunction implements IActivationFunction {
  private readonly activationType: ActivationType;

  constructor(type: ActivationType) {
    this.activationType = type;
  }

  public activate(value: RealType): RealType {
    switch (this.activationType) {
      case ActivationType.None:
        return value;
      case ActivationType.Sigmoid:
        return 1.0 / (1.0 + Math.exp(-4.9 * value));
      case ActivationType.ReLU:
        return (value + Math.abs(value)) * 0.5;
      case ActivationType.Tanh:
        return Math.tanh(value);
      default:
        return value;
    }
  }

  public getType(): ActivationType {
    return this.activationType;
  }
}

// 活性化関数のファクトリー
export class ActivationFunctionFactory {
  private static readonly instances = new Map<ActivationType, IActivationFunction>();

  public static getFunction(type: ActivationType): IActivationFunction {
    if (!this.instances.has(type)) {
      this.instances.set(type, new ActivationFunction(type));
    }
    return this.instances.get(type)!;
  }

  public static createFunction(type: ActivationType): IActivationFunction {
    return new ActivationFunction(type);
  }
}
