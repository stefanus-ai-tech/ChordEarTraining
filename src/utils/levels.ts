const questionsPerLevel = 10;

const chordMappings: { [key: string]: string[] } = {
  I: ['C4', 'E4', 'G4'],
  ii: ['D4', 'F4', 'A4'],
  iii: ['E4', 'G4', 'B4'],
  IV: ['F4', 'A4', 'C5'],
  V: ['G4', 'B4', 'D5'],
  vi: ['A4', 'C5', 'E5'],
  vii: ['B4', 'D5', 'F5'],
};

export const CORRECT_POINTS = 1;
export const WRONG_PENALTY = -2;

export const levels = [
  {
    number: 1,
    availableChords: ['I', 'IV', 'V'],
    description: 'Primary Chords (I, IV, V)',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 2,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
  {
    number: 2,
    availableChords: ['I', 'IV', 'V', 'vi'],
    description: 'Primary Chords + vi',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 2,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
  {
    number: 3,
    availableChords: ['I', 'ii', 'IV', 'V', 'vi'],
    description: 'Primary Chords + ii, vi',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 2,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
  {
    number: 4,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi'],
    description: 'All Major/Minor Chords',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 2,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
  {
    number: 5,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'],
    description: 'All Major/Minor Chords + vii dim',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 3,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
  {
    number: 6,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'],
    description: 'All Major/Minor Chords + vii dim',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 4,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
  {
    number: 7,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'],
    description: 'All Major/Minor Chords + vii dim',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 5,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
  {
    number: 8,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'],
    description: 'All Major/Minor Chords + vii dim',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 6,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
  {
    number: 9,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'],
    description: 'All Major/Minor Chords + vii dim',
    questionsPerLevel: questionsPerLevel,
    chordsPerQuestion: 7,
    getChord: (chord: keyof typeof chordMappings) => chordMappings[chord],
  },
];

export const getMaxScore = (level: number) => {
  const currentLevel = levels.find((l) => l.number === level);
  return currentLevel ? currentLevel.questionsPerLevel * CORRECT_POINTS : 0;
};
