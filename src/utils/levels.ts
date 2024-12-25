export const CORRECT_POINTS = 1;
export const WRONG_PENALTY = -2;

export const levels = [
  {
    number: 1,
    availableChords: ['I', 'IV', 'V'],
    description: 'Primary Chords (I, IV, V)',
    questionsPerLevel: 1,
    chordsPerQuestion: 2,
  },
  {
    number: 2,
    availableChords: ['I', 'IV', 'V', 'vi'],
    description: 'Primary Chords + vi',
    questionsPerLevel: 3,
    chordsPerQuestion: 2,
  },
  {
    number: 3,
    availableChords: ['I', 'ii', 'IV', 'V', 'vi'],
    description: 'Primary Chords + ii, vi',
    questionsPerLevel: 3,
    chordsPerQuestion: 2,
  },
  {
    number: 4,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi'],
    description: 'All Major/Minor Chords',
    questionsPerLevel: 3,
    chordsPerQuestion: 2,
  },
  {
    number: 5,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'bVII'],
    description: 'All Major/Minor Chords + bVII',
    questionsPerLevel: 4,
    chordsPerQuestion: 2,
  },
  {
    number: 6,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'bVII'],
    description: 'All Major/Minor Chords + bVII',
    questionsPerLevel: 5,
    chordsPerQuestion: 2,
  },
  {
    number: 7,
    availableChords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'bVII'],
    description: 'All Major/Minor Chords + bVII',
    questionsPerLevel: 6,
    chordsPerQuestion: 2,
  },
];

export const getMaxScore = (level: number) => {
  const currentLevel = levels.find((l) => l.number === level);
  return currentLevel ? currentLevel.questionsPerLevel * CORRECT_POINTS : 0;
};
