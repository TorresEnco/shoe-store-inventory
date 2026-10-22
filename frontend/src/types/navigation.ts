/**
 * Represents the three main screens of the Comercial Torres POS system.
 *
 * Using a union type instead of a plain `string` gives us:
 * - Compile-time exhaustiveness checking (the compiler will warn us if we
 *   forget a case in a switch/if-else chain).
 * - IDE auto-complete on every component that accepts or emits a TabType.
 * - A single source of truth — rename a tab here and TypeScript flags every
 *   other place that must be updated.
 */
export type TabType = 'pos' | 'inventory' | 'metrics';
