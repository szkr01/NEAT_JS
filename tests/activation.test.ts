import { Activation, ActivationFunction } from '../src/activation';

describe('ActivationFunction', () => {
    describe('none', () => {
        it('should return the input value unchanged', () => {
            expect(ActivationFunction.none(0)).toBe(0);
            expect(ActivationFunction.none(1)).toBe(1);
            expect(ActivationFunction.none(-1)).toBe(-1);
            expect(ActivationFunction.none(0.5)).toBe(0.5);
        });
    });

    describe('sigm', () => {
        it('should return values between 0 and 1', () => {
            expect(ActivationFunction.sigm(0)).toBeCloseTo(0.5, 5);
            expect(ActivationFunction.sigm(1)).toBeGreaterThan(0.5);
            expect(ActivationFunction.sigm(1)).toBeLessThan(1);
            expect(ActivationFunction.sigm(-1)).toBeGreaterThan(0);
            expect(ActivationFunction.sigm(-1)).toBeLessThan(0.5);
        });

        it('should handle extreme values', () => {
            expect(ActivationFunction.sigm(10)).toBeCloseTo(1, 5);
            expect(ActivationFunction.sigm(-10)).toBeCloseTo(0, 5);
        });
    });

    describe('relu', () => {
        it('should return 0 for negative inputs', () => {
            expect(ActivationFunction.relu(-1)).toBe(0);
            expect(ActivationFunction.relu(-0.5)).toBe(0);
            expect(ActivationFunction.relu(-10)).toBe(0);
        });

        it('should return the input for positive inputs', () => {
            expect(ActivationFunction.relu(0)).toBe(0);
            expect(ActivationFunction.relu(1)).toBe(1);
            expect(ActivationFunction.relu(0.5)).toBe(0.5);
            expect(ActivationFunction.relu(10)).toBe(10);
        });
    });

    describe('tanh', () => {
        it('should return values between -1 and 1', () => {
            expect(ActivationFunction.tanh(0)).toBe(0);
            expect(ActivationFunction.tanh(1)).toBeGreaterThan(0);
            expect(ActivationFunction.tanh(1)).toBeLessThan(1);
            expect(ActivationFunction.tanh(-1)).toBeGreaterThan(-1);
            expect(ActivationFunction.tanh(-1)).toBeLessThan(0);
        });

        it('should handle extreme values', () => {
            expect(ActivationFunction.tanh(10)).toBeCloseTo(1, 5);
            expect(ActivationFunction.tanh(-10)).toBeCloseTo(-1, 5);
        });
    });

    describe('getFunction', () => {
        it('should return the correct function for each activation type', () => {
            expect(ActivationFunction.getFunction(Activation.None)).toBe(ActivationFunction.none);
            expect(ActivationFunction.getFunction(Activation.Sigm)).toBe(ActivationFunction.sigm);
            expect(ActivationFunction.getFunction(Activation.Relu)).toBe(ActivationFunction.relu);
            expect(ActivationFunction.getFunction(Activation.Tanh)).toBe(ActivationFunction.tanh);
        });
    });
});
