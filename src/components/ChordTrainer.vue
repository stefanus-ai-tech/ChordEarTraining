<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as Tone from 'tone';
import type { Chord, ChordProgression } from '../types';
import { chords, getRandomVoicing } from '../utils/chords';
import {
  levels,
  QUESTIONS_PER_LEVEL,
  CORRECT_POINTS,
  WRONG_PENALTY,
  getMaxScore,
} from '../utils/levels';
import ProgressBar from './ProgressBar.vue';
import ChordButton from './ChordButton.vue';
import LevelInfo from './LevelInfo.vue';

const synth = new Tone.PolySynth().toDestination();
const currentLevel = ref<number>(1);
const score = ref<number>(0);
const currentProgression = ref<ChordProgression>({
  key: 'C',
  chords: [],
});
const userAnswer = ref<string[]>([]);
const isPlaying = ref<boolean>(false);
const feedback = ref<string>('');
const buttonsEnabled = ref<boolean>(false);
const nextEnabled = ref<boolean>(false);

const playChord = async (chord: Chord) => {
  const notes = getRandomVoicing(chord.roman);
  synth.triggerAttackRelease(notes, '1n');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 0.3s delay between chords
};

const generateProgression = () => {
  const availableChords = levels[currentLevel.value - 1].availableChords;
  const progression = [
    chords.I, // Always start with tonic
    chords[availableChords[Math.floor(Math.random() * availableChords.length)]],
    chords[availableChords[Math.floor(Math.random() * availableChords.length)]],
  ];
  currentProgression.value.chords = progression;
  userAnswer.value = [];
  feedback.value = '';
  nextEnabled.value = false;
};

const playTonicGuide = async () => {
  buttonsEnabled.value = false; // Disable buttons at the start
  // Play I-IV-V-I cadence
  await playChord(chords.I);
  await playChord(chords.IV);
  await playChord(chords.V);
  await playChord(chords.I);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Extra pause before progression
  buttonsEnabled.value = true;
};

const playProgression = async () => {
  if (isPlaying.value) return;
  isPlaying.value = true;

  await playTonicGuide();

  for (const chord of currentProgression.value.chords) {
    await playChord(chord);
  }

  isPlaying.value = false;
};

const checkAnswer = () => {
  const correct = currentProgression.value.chords.every(
    (chord, i) => chord.roman === userAnswer.value[i]
  );

  if (correct) {
    feedback.value = 'Correct!';
    score.value += CORRECT_POINTS;
    nextEnabled.value = true;
    buttonsEnabled.value = false; // Disable buttons after correct answer

    // Auto-clear the answer after correct feedback
    setTimeout(() => {
      userAnswer.value = [];
      feedback.value = '';
    }, 1000); // Clear after 1 second

    if (score.value >= getMaxScore(currentLevel.value)) {
      if (currentLevel.value < levels.length) {
        currentLevel.value++;
        score.value = 0;
      }
    }
  } else {
    feedback.value = 'Try again';
    score.value = Math.max(0, score.value + WRONG_PENALTY);

    // Auto-clear the answer after incorrect feedback
    setTimeout(() => {
      userAnswer.value = [];
      feedback.value = '';
    }, 1000); // Clear after 1 second
  }
};

const selectChord = (roman: string) => {
  if (userAnswer.value.length < 3 && buttonsEnabled.value) {
    userAnswer.value.push(roman);
  }
};

const nextQuestion = () => {
  generateProgression();
  playProgression();
};

onMounted(() => {
  generateProgression();
  playProgression();
});
</script>

<template>
  <div class="chord-trainer">
    <LevelInfo :current-level="currentLevel" />

    <ProgressBar :current="score" :total="getMaxScore(currentLevel)" />

    <div class="controls">
      <button
        class="primary-button"
        @click="nextQuestion"
        :disabled="isPlaying || !nextEnabled">
        Hear Next
      </button>
      <button
        class="secondary-button"
        @click="playProgression"
        :disabled="isPlaying">
        Hear Again
      </button>
    </div>

    <div class="answer-section">
      <h2>Choices</h2>
      <div class="chord-buttons">
        <ChordButton
          v-for="roman in levels[currentLevel - 1].availableChords"
          :key="roman"
          :roman="roman"
          @click="selectChord(roman)"
          :disabled="!buttonsEnabled || userAnswer.length >= 3" />
      </div>

      <div class="user-answer">
        <div class="answer-display">
          {{ userAnswer.join(' - ') || 'Select chords...' }}
        </div>
        <div class="answer-controls">
          <button
            class="primary-button"
            @click="checkAnswer"
            :disabled="!buttonsEnabled || userAnswer.length !== 3">
            Check Answer
          </button>
        </div>
      </div>

      <div class="feedback" :class="{ correct: feedback === 'Correct!' }">
        {{ feedback }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.chord-trainer {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #666;
  margin: 1.5rem 0;
}

.controls {
  margin: 2rem 0;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.chord-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
}

.primary-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #2196f3;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.primary-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.secondary-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #2196f3;
  border-radius: 8px;
  background: white;
  color: #2196f3;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.secondary-button:hover:not(:disabled) {
  background-color: #e3f2fd;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.answer-section {
  margin-top: 2rem;
  text-align: center;
}

.answer-display {
  margin: 1rem 0;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.2rem;
  color: #666;
}

.answer-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.feedback {
  margin-top: 1rem;
  font-weight: bold;
  font-size: 1.2rem;
  color: #666;
  transition: color 0.3s ease;
}

.feedback.correct {
  color: #4caf50;
}
</style>
