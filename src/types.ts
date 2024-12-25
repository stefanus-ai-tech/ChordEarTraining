export interface Chord {
  name: string;
  notes: string[];
  roman: string;
}

export interface ChordProgression {
  chords: Chord[];
  key: string;
}

export interface Level {
  number: number;
  availableChords: string[];
  description: string;
}