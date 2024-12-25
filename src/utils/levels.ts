export const QUESTIONS_PER_LEVEL = 2;
export const CORRECT_POINTS = 1;
export const WRONG_PENALTY = -2;

export const levels = [
  {
    number: 1,
    availableChords: ['I', 'IV', 'V'],
    description: 'Primary Chords (I, IV, V)',
  },
  {
    number: 2,
    availableChords: ['I', 'IV', 'V', 'vi'],
    description: 'Primary Chords + vi',
  },
  {
    number: 3,
    availableChords: ['I', 'ii', 'IV', 'V', 'vi'],
    description: 'Primary Chords + ii, vi',
  },
  {
    number: 4,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi'],
    description: 'All Major/Minor Chords',
  },
];

export const getMaxScore = (level: number) => {
  return QUESTIONS_PER_LEVEL;
};
