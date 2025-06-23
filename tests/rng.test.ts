import { RNG } from '../src/rng';

describe('RNG', () => {
    describe('random', () => {
        it('should return values between 0 and 1', () => {
            for (let i = 0; i < 100; i++) {
                const value = RNG.random();
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThan(1);
            }
        });
    });

    describe('proba', () => {
        it('should return boolean values', () => {
            expect(typeof RNG.proba(0.5)).toBe('boolean');
        });

        it('should return false for probability 0', () => {
            // Test multiple times to ensure consistency
            for (let i = 0; i < 10; i++) {
                expect(RNG.proba(0)).toBe(false);
            }
        });

        it('should return true for probability 1', () => {
            // Test multiple times to ensure consistency
            for (let i = 0; i < 10; i++) {
                expect(RNG.proba(1)).toBe(true);
            }
        });
    });

    describe('getFullRange', () => {
        it('should return values in specified range', () => {
            const range = 2.0;
            for (let i = 0; i < 100; i++) {
                const value = RNG.getFullRange(range);
                expect(value).toBeGreaterThanOrEqual(-range);
                expect(value).toBeLessThanOrEqual(range);
            }
        });        it('should handle zero range', () => {
            // Note: Math.random() * 0 can result in -0 or 0, both are mathematically equivalent
            const result = RNG.getFullRange(0);
            expect(result).toEqual(0); // Use toEqual instead of toBe for -0/0 handling
        });
    });

    describe('getUnder', () => {
        it('should return values under max value', () => {
            const maxValue = 5.0;
            for (let i = 0; i < 100; i++) {
                const value = RNG.getUnder(maxValue);
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThan(maxValue);
            }
        });
    });

    describe('getRandIndex', () => {
        it('should return integer indices', () => {
            const maxValue = 10;
            for (let i = 0; i < 100; i++) {
                const index = RNG.getRandIndex(maxValue);
                expect(Number.isInteger(index)).toBe(true);
                expect(index).toBeGreaterThanOrEqual(0);
                expect(index).toBeLessThan(maxValue);
            }
        });

        it('should handle edge case of maxValue 1', () => {
            expect(RNG.getRandIndex(1)).toBe(0);
        });
    });

    describe('pickRandom', () => {
        it('should pick element from array', () => {
            const array = [1, 2, 3, 4, 5];
            for (let i = 0; i < 50; i++) {
                const picked = RNG.pickRandom(array);
                expect(array).toContain(picked);
            }
        });

        it('should pick only element from single-element array', () => {
            const array = [42];
            expect(RNG.pickRandom(array)).toBe(42);
        });

        it('should work with different types', () => {
            const stringArray = ['a', 'b', 'c'];
            const picked = RNG.pickRandom(stringArray);
            expect(typeof picked).toBe('string');
            expect(stringArray).toContain(picked);
        });
    });
});
