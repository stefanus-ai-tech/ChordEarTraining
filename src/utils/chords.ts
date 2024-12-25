import type { Chord } from '../types';

// Chord voicings for each inversion
const chordVoicings = {
  I: {
    root: ['C4', 'E4', 'G4'],
    first: ['E4', 'G4', 'C5'],
    second: ['G3', 'C4', 'E4'],
  },
  ii: {
    root: ['D4', 'F4', 'A4'],
    first: ['F4', 'A4', 'D5'],
    second: ['A3', 'D4', 'F4'],
  },
  iii: {
    root: ['E4', 'G4', 'B4'],
    first: ['G4', 'B4', 'E5'],
    second: ['B3', 'E4', 'G4'],
  },
  IV: {
    root: ['F4', 'A4', 'C5'],
    first: ['A4', 'C5', 'F5'],
    second: ['C4', 'F4', 'A4'],
  },
  V: {
    root: ['G4', 'B4', 'D5'],
    first: ['B4', 'D5', 'G5'],
    second: ['D4', 'G4', 'B4'],
  },
  vi: {
    root: ['A4', 'C5', 'E5'],
    first: ['C5', 'E5', 'A5'],
    second: ['E4', 'A4', 'C5'],
  },
  vii: {
    root: ['B4', 'D5', 'F5'],
    first: ['D5', 'F5', 'B5'],
    second: ['F4', 'B4', 'D5'],
  },
};

export const getRandomVoicing = (roman: string) => {
  const voicings = chordVoicings[roman as keyof typeof chordVoicings];
  const voicingTypes = ['root', 'first', 'second'] as const;
  const randomVoicing =
    voicingTypes[Math.floor(Math.random() * voicingTypes.length)];
  return voicings?.[randomVoicing] ?? voicings?.root;
};

export const chords: Record<string, Chord> = {
  I: {
    name: 'C Major',
    notes: ['C4', 'E4', 'G4'],
    roman: 'I',
  },
  ii: {
    name: 'D minor',
    notes: ['D4', 'F4', 'A4'],
    roman: 'ii',
  },
  iii: {
    name: 'E minor',
    notes: ['E4', 'G4', 'B4'],
    roman: 'iii',
  },
  IV: {
    name: 'F Major',
    notes: ['F4', 'A4', 'C5'],
    roman: 'IV',
  },
  V: {
    name: 'G Major',
    notes: ['G4', 'B4', 'D5'],
    roman: 'V',
  },
  vi: {
    name: 'A minor',
    notes: ['A4', 'C5', 'E5'],
    roman: 'vi',
  },
  vii: {
    name: 'B diminished',
    notes: ['B4', 'D5', 'F5'],
    roman: 'vii',
  },
};
