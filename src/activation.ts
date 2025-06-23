import { RealType } from './common_configuration';

/**
 * Type for activation function pointer
 */
export type ActivationPtr = (x: RealType) => RealType;

/**
 * Enumeration of available activation functions
 */
export enum Activation {
    None = 'none',
    Sigm = 'sigm',
    Relu = 'relu',
    Tanh = 'tanh',
}

/**
 * Collection of activation functions
 */
export class ActivationFunction {
    /**
     * Returns the activation function for the given activation type
     */
    static getFunction(activation: Activation): ActivationPtr {
        switch (activation) {
            case Activation.None:
                return ActivationFunction.none;
            case Activation.Sigm:
                return ActivationFunction.sigm;
            case Activation.Relu:
                return ActivationFunction.relu;
            case Activation.Tanh:
                return ActivationFunction.tanh;
            default:
                return ActivationFunction.none;
        }
    }

    /**
     * Identity activation function
     */
    static none(x: RealType): RealType {
        return x;
    }

    /**
     * Sigmoid activation function
     */
    static sigm(x: RealType): RealType {
        return 1.0 / (1.0 + Math.exp(-4.9 * x));
    }

    /**
     * ReLU activation function
     */
    static relu(x: RealType): RealType {
        return (x + Math.abs(x)) * 0.5;
    }

    /**
     * Hyperbolic tangent activation function
     */
    static tanh(x: RealType): RealType {
        return Math.tanh(x);
    }
}
