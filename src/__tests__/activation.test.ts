import { ActivationType, RealType } from '../types.js';
import { ActivationFunction, ActivationFunctionFactory } from '../activation.js';

describe('ActivationFunction', () => {
  describe('None activation', () => {
    let activation: ActivationFunction;

    beforeEach(() => {
      activation = new ActivationFunction(ActivationType.None);
    });

    it('should return input value unchanged', () => {
      expect(activation.activate(5.0)).toBe(5.0);
      expect(activation.activate(-3.2)).toBe(-3.2);
      expect(activation.activate(0)).toBe(0);
    });

    it('should have correct type', () => {
      expect(activation.getType()).toBe(ActivationType.None);
    });
  });

  describe('Sigmoid activation', () => {
    let activation: ActivationFunction;

    beforeEach(() => {
      activation = new ActivationFunction(ActivationType.Sigmoid);
    });    it('should return values between 0 and 1', () => {
      expect(activation.activate(0)).toBeCloseTo(0.5, 5);
      expect(activation.activate(1)).toBeGreaterThan(0.5);
      expect(activation.activate(-1)).toBeLessThan(0.5);
      expect(activation.activate(10)).toBeLessThanOrEqual(1);
      expect(activation.activate(-10)).toBeGreaterThanOrEqual(0);
    });

    it('should have correct type', () => {
      expect(activation.getType()).toBe(ActivationType.Sigmoid);
    });
  });

  describe('ReLU activation', () => {
    let activation: ActivationFunction;

    beforeEach(() => {
      activation = new ActivationFunction(ActivationType.ReLU);
    });

    it('should return 0 for negative values and value for positive', () => {
      expect(activation.activate(-5)).toBe(0);
      expect(activation.activate(0)).toBe(0);
      expect(activation.activate(5)).toBe(5);
      expect(activation.activate(3.14)).toBe(3.14);
    });

    it('should have correct type', () => {
      expect(activation.getType()).toBe(ActivationType.ReLU);
    });
  });

  describe('Tanh activation', () => {
    let activation: ActivationFunction;

    beforeEach(() => {
      activation = new ActivationFunction(ActivationType.Tanh);
    });

    it('should return values between -1 and 1', () => {
      expect(activation.activate(0)).toBeCloseTo(0, 5);
      expect(activation.activate(1)).toBeLessThan(1);
      expect(activation.activate(-1)).toBeGreaterThan(-1);
      expect(activation.activate(10)).toBeCloseTo(1, 1);
      expect(activation.activate(-10)).toBeCloseTo(-1, 1);
    });

    it('should have correct type', () => {
      expect(activation.getType()).toBe(ActivationType.Tanh);
    });
  });
});

describe('ActivationFunctionFactory', () => {
  it('should return singleton instances for same type', () => {
    const func1 = ActivationFunctionFactory.getFunction(ActivationType.Sigmoid);
    const func2 = ActivationFunctionFactory.getFunction(ActivationType.Sigmoid);
    expect(func1).toBe(func2);
  });

  it('should return different instances for different types', () => {
    const sigmoid = ActivationFunctionFactory.getFunction(ActivationType.Sigmoid);
    const tanh = ActivationFunctionFactory.getFunction(ActivationType.Tanh);
    expect(sigmoid).not.toBe(tanh);
  });

  it('should create new instances with createFunction', () => {
    const func1 = ActivationFunctionFactory.createFunction(ActivationType.Sigmoid);
    const func2 = ActivationFunctionFactory.createFunction(ActivationType.Sigmoid);
    expect(func1).not.toBe(func2);
  });
});
