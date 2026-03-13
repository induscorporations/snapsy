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

/**
 * Placeholder selfie validation. Replace with ML Kit face detection when integrating.
 * Returns 'ok' to allow save, or 'no_face' / 'multiple_faces' to block and show retake prompts.
 */
export async function validateSelfieForFace(_uri: string): Promise<'ok' | 'no_face' | 'multiple_faces'> {
  await new Promise((r) => setTimeout(r, 300));
  return 'ok';
}
