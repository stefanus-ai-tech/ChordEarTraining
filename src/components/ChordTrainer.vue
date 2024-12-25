<script setup lang="ts">
import { ref, onMounted, defineExpose } from 'vue';
import * as Tone from 'tone';
import type { Chord, ChordProgression } from '../types';
import { chords, getRandomVoicing } from '../utils/chords';
import {
  levels,
  CORRECT_POINTS,
  WRONG_PENALTY,
  getMaxScore,
} from '../utils/levels';
import ProgressBar from './ProgressBar.vue';
import ChordButton from './ChordButton.vue';
import LevelInfo from './LevelInfo.vue';

const synth = new Tone.PolySynth().toDestination();
const currentLevel = ref(1);
const score = ref(0);
const currentQuestionNumber = ref(1);
const currentProgression = ref<ChordProgression>({
  key: 'C',
  chords: [],
});
const userAnswer = ref<string[]>([]);
const isPlaying = ref(false);
const feedback = ref('');
const buttonsEnabled = ref(true);
const nextEnabled = ref(false);
const completionMessageVisible = ref(false);

const playChord = async (chord: Chord) => {
  const notes = getRandomVoicing(chord.roman);
  synth.triggerAttackRelease(notes, '1n');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay between chords
};

const generateProgression = () => {
  const currentLevelData = levels.find(
    (level) => level.number === currentLevel.value
  );
  const availableChords = currentLevelData?.availableChords || [];
  const chordsPerQuestion = currentLevelData?.chordsPerQuestion || 2;
  const progression: Chord[] = [chords.I]; // Always start with tonic
  for (let i = 0; i < chordsPerQuestion - 1; i++) {
    const randomChord =
      availableChords[Math.floor(Math.random() * availableChords.length)];
    progression.push(chords[randomChord]);
  }
  currentProgression.value.chords = progression;
  userAnswer.value = [];
  feedback.value = '';
};

const playTonicGuide = async () => {
  buttonsEnabled.value = false; // Disable buttons at the start
  // Play I-IV-V-I cadence
  await playChord(chords.I);
  await playChord(chords.IV);
  await playChord(chords.V);
  await playChord(chords.I);
  await new Promise((resolve) => setTimeout(resolve, 50)); // Extra pause before progression
  buttonsEnabled.value = true;
};

const playProgression = async () => {
  if (isPlaying.value) return;
  isPlaying.value = true;
  buttonsEnabled.value = false; // Disable at the start of the full sequence
  await playTonicGuide();
  for (const chord of currentProgression.value.chords) {
    await playChord(chord);
  }
  isPlaying.value = false;
  buttonsEnabled.value = true; // Re-enable after the entire progression
};

const checkAnswer = () => {
  const correct = currentProgression.value.chords.every(
    (chord, i) => chord.roman === userAnswer.value[i]
  );
  if (correct) {
    feedback.value = 'Correct!';
    score.value += CORRECT_POINTS;
    nextEnabled.value = true;
    const currentLevelData = levels.find(
      (level) => level.number === currentLevel.value
    );
    if (
      currentQuestionNumber.value < (currentLevelData?.questionsPerLevel ?? 0)
    ) {
      // If there are more questions in the current level, proceed to the next question
      setTimeout(nextQuestion, 1500);
    } else if (currentLevel.value < levels.length) {
      // If all questions are answered, move to the next level
      currentLevel.value++;
      playProgression();
      generateProgression();
      currentQuestionNumber.value = 1; // Reset question number on new level
    } else {
      completionMessageVisible.value = true;
    }
  } else {
    feedback.value = 'Try again.';
    score.value = Math.max(0, score.value + WRONG_PENALTY);
  }
};

const selectChord = (roman: string) => {
  const currentLevelData = levels.find(
    (level) => level.number === currentLevel.value
  );
  if (
    userAnswer.value.length < (currentLevelData?.chordsPerQuestion || 0) &&
    buttonsEnabled.value
  ) {
    userAnswer.value.push(roman);
  }
};

const clearAnswer = () => {
  userAnswer.value = [];
  feedback.value = '';
};

const nextQuestion = () => {
  currentQuestionNumber.value++; // Increment question number
  generateProgression();
  playProgression();
  nextEnabled.value = false; // Reset nextEnabled
};

const startGame = () => {
  generateProgression();
  playProgression();
};

onMounted(() => {
  if (currentLevel.value === 1) {
    // Do nothing, wait for the start button
  } else {
    generateProgression();
    playProgression();
  }
});

defineExpose({
  currentLevel,
  score,
  isPlaying,
  feedback,
  buttonsEnabled,
  nextEnabled,
  completionMessageVisible,
  userAnswer,
  levels,
  nextQuestion,
  playProgression,
  selectChord,
  checkAnswer,
  getMaxScore,
  clearAnswer,
  startGame, // Expose the new method
});
</script>

<template>
  <div class="chord-trainer">
    <LevelInfo :current-level="currentLevel" />
    <ProgressBar
      :questionNumber="currentQuestionNumber"
      :totalQuestions="
        levels.find((level) => level.number === currentLevel)
          ?.questionsPerLevel ?? 0
      " />
    <div class="controls">
      <button
        v-if="currentLevel === 1 && !isPlaying"
        class="primary-button"
        @click="startGame">
        Start
      </button>
      <button
        class="secondary-button"
        @click="playProgression"
        :disabled="isPlaying"
        :style="{ 'margin-left': currentLevel === 1 ? '1rem' : '0' }">
        Hear Again
      </button>
    </div>
    <div class="answer-section">
      <h2>Choices</h2>
      <div class="chord-buttons">
        <ChordButton
          v-for="roman in levels[currentLevel - 1]?.availableChords"
          :key="roman"
          :roman="roman"
          @click="selectChord(roman)"
          :disabled="
            !buttonsEnabled ||
            userAnswer.length >=
              (levels.find((level) => level.number === currentLevel)
                ?.chordsPerQuestion ?? 0)
          " />
      </div>
      <div class="user-answer">
        <div class="answer-display">
          {{ userAnswer.join(' - ') || 'Select chords...' }}
        </div>
        <div class="answer-controls">
          <button
            class="primary-button"
            @click="checkAnswer"
            :disabled="
              !buttonsEnabled ||
              userAnswer.length !==
                (levels.find((level) => level.number === currentLevel)
                  ?.chordsPerQuestion ?? 0)
            ">
            Check Answer
          </button>
          <button
            class="secondary-button"
            @click="clearAnswer"
            :disabled="!userAnswer.length">
            Clear
          </button>
        </div>
      </div>
      <div class="feedback" :class="{ correct: feedback === 'Correct!' }">
        {{ feedback }}
      </div>
      <div v-if="completionMessageVisible" class="completion-message">
        Congratulations! You have completed all levels!
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

.completion-message {
  margin-top: 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #4caf50;
}
</style>
