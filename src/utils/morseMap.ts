/** Morse code mapping used throughout the app */
export const morseMap: Record<string, string> = {
  '...': 'S',
  '-': 'T',
  '.-': 'A',
  '-.--': 'Y',
};

/** The morse groups to display */
export const morseGroups = ['...', '-', '.-', '-.--'];

/** Full morse string */
export const morseString = '... - .- -.--';

/** Decoded word */
export const decodedWord = 'STAY';

/** Decode a single morse group */
export function decodeMorse(morse: string): string {
  return morseMap[morse] ?? '?';
}

/** Decode a full morse string (space-separated groups) */
export function decodeMorseString(morse: string): string {
  return morse
    .split(' ')
    .map((group) => decodeMorse(group))
    .join('');
}
