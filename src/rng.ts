import { RealType } from './common_configuration';

/**
 * Random number generator utility class
 */
export class RNG {
    /**
     * Generates a random number between 0 and 1
     */
    static random(): number {
        return Math.random();
    }

    /**
     * Generates a random boolean with given probability
     */
    static proba(probability: number): boolean {
        return Math.random() < probability;
    }

    /**
     * Generates a random number in full range [-range, range]
     */
    static getFullRange(range: number): RealType {
        return (Math.random() * 2 - 1) * range;
    }

    /**
     * Generates a random number under the given value
     */
    static getUnder(maxValue: number): number {
        return Math.random() * maxValue;
    }

    /**
     * Generates a random integer under the given value
     */
    static getRandIndex(maxValue: number): number {
        return Math.floor(Math.random() * maxValue);
    }

    /**
     * Picks a random element from an array
     */
    static pickRandom<T>(container: T[]): T {
        const idx = RNG.getRandIndex(container.length);
        return container[idx];
    }
}
