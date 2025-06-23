/**
 * Mutation configuration parameters
 */
export interface MutationConfig {
    /** Number of mutations to attempt per genome */
    mutCount: number;
    /** Probability of adding a new node */
    newNodeProba: number;
    /** Probability of adding a new connection */
    newConnProba: number;
    /** Probability of replacing a value entirely vs modifying it */
    newValueProba: number;
    /** Weight range for new values */
    weightRange: number;
    /** Small modification range multiplier */
    weightSmallRange: number;
    /** Maximum number of hidden nodes allowed */
    maxHiddenNodes: number;
}

/**
 * Default mutation configuration
 */
export const defaultMutationConfig: MutationConfig = {
    mutCount: 3,
    newNodeProba: 0.03,
    newConnProba: 0.05,
    newValueProba: 0.1,
    weightRange: 2.0,
    weightSmallRange: 0.1,
    maxHiddenNodes: 50
};
