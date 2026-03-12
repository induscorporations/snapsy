/**
 * Placeholder embedding for MVP.
 * Replace with real face embedding from ML Kit (or similar) when integrating.
 * Standard size often 128 or 512 dimensions.
 */
const EMBEDDING_SIZE = 128;

export function createPlaceholderEmbedding(): number[] {
  const arr: number[] = [];
  for (let i = 0; i < EMBEDDING_SIZE; i++) {
    arr.push(Math.random() * 0.2 - 0.1);
  }
  return arr;
}
