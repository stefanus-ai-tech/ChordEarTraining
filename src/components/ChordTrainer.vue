<script setup lang="ts">
import { ref, onMounted, defineExpose } from 'vue';
import * as Tone from 'tone';
import type { Chord, ChordProgression } from '../types';
import { chords, getRandomVoicing, majorKeys } from '../utils/chords';
import {
  levels,
  CORRECT_POINTS,
  WRONG_PENALTY,
  getMaxScore,
} from '../utils/levels';
import ProgressBar from './ProgressBar.vue';
import ChordButton from './ChordButton.vue';
import LevelInfo from './LevelInfo.vue';

const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: {
    type: 'sine', // Use sine wave for smoother sound
  },
  envelope: {
    attack: 0.1, // Gradual attack for smoother start
    decay: 0.2, // Smooth decay
    sustain: 0.8, // High sustain level
    release: 1.5, // Longer release for smoother end
  },
  volume: -8, // Slightly reduce volume to prevent clipping
}).toDestination();
const currentLevel = ref(1);
const score = ref(0);
const useRandomTonic = ref(true);
const currentQuestionNumber = ref(1);
const currentProgression = ref<ChordProgression>({
  key: 'C',
  chords: [],
});
const userAnswer = ref<string[]>([]);
const userAnswerCorrectness = ref<boolean[]>([]);
const isPlaying = ref(false);
const feedback = ref('');
const buttonsEnabled = ref(true);
const nextEnabled = ref(false);
const completionMessageVisible = ref(false);
const startButtonVisible = ref(true);

const playChord = async (chord: Chord) => {
  // Pass both the roman numeral and the current key
  const notes = getRandomVoicing(chord.roman, currentProgression.value.key);
  synth.triggerAttackRelease(notes, '1n');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay between chords
};

const backspace = () => {
  if (userAnswer.value.length > 0) {
    userAnswer.value.pop();
    userAnswerCorrectness.value = [];
  }
};
const generateProgression = () => {
  const currentLevelData = levels.find(
    (level) => level.number === currentLevel.value
  );
  const availableChords = currentLevelData?.availableChords || [];
  const chordsPerQuestion = currentLevelData?.chordsPerQuestion || 2;

  let newKey = 'C';
  // Only change key if random tonic is enabled
  if (useRandomTonic.value) {
    do {
      newKey = majorKeys[Math.floor(Math.random() * majorKeys.length)];
    } while (newKey === currentProgression.value.key);
    currentProgression.value.key = newKey;
  } else {
    currentProgression.value.key = 'C'; // Default to C if random tonic is disabled
  }
  // Update the key in the current progression
  currentProgression.value.key = newKey;

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
  userAnswerCorrectness.value = currentProgression.value.chords.map(
    (chord, i) => chord.roman === userAnswer.value[i]
  );
  const correct = userAnswerCorrectness.value.every((isCorrect) => isCorrect);
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
  userAnswerCorrectness.value = [];
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
  startButtonVisible.value = false;
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
  backspace,
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
    <div class="settings">
      <div class="setting-group">
        <label>Level: </label>
        <select v-model="currentLevel" :disabled="!startButtonVisible">
          <option
            v-for="level in levels"
            :key="level.number"
            :value="level.number">
            Level {{ level.number }}
          </option>
        </select>
      </div>
      <div class="setting-group">
        <label>
          <input
            type="checkbox"
            v-model="useRandomTonic"
            :disabled="!startButtonVisible" />
          Random Tonic
        </label>
      </div>
    </div>
    <div class="instructions">
      [Instruction] In every question, there is chord progression I IV V I, then
      the chord you should guess is after that chord progression.
    </div>
    <LevelInfo :current-level="currentLevel" />
    <ProgressBar
      :questionNumber="currentQuestionNumber"
      :totalQuestions="
        levels.find((level) => level.number === currentLevel)
          ?.questionsPerLevel ?? 0
      " />
    <div class="controls">
      <button
        v-if="startButtonVisible"
        class="primary-button"
        @click="startGame">
        Start
      </button>
      <button
        class="secondary-button"
        @click="playProgression"
        :disabled="isPlaying"
        :style="{ 'margin-left': currentLevel === 1 ? '0rem' : '0' }">
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
          <template v-if="userAnswer.length > 0">
            <span
              v-for="(chord, index) in userAnswer"
              :key="index"
              :class="{
                correct:
                  feedback === 'Correct!' &&
                  currentProgression.chords[index]?.roman === chord,
                incorrect:
                  feedback !== 'Correct!' &&
                  userAnswerCorrectness[index] === false,
              }">
              {{ chord }}
            </span>
          </template>
          <template v-else> Select chords... </template>
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
            @click="backspace"
            :disabled="!userAnswer.length">
            Backspace
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
.settings {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting-group select {
  padding: 0.3rem;
  border-radius: 4px;
  border: 1px solid #2196f3;
}

.setting-group label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.instructions {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #333;
  /* to center the text */
  text-align: center;
  font-weight: bold;
}

.chord-trainer {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chord-trainer:hover {
  transform: translateY(-2px);
}

h2 {
  color: #444;
  margin: 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.controls {
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.chord-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 0.75rem 0;
  flex-wrap: wrap;
}

.primary-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.secondary-button {
  padding: 0.5rem 1rem;
  border: 2px solid #2196f3;
  border-radius: 12px;
  background: transparent;
  color: #2196f3;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.secondary-button:hover:not(:disabled) {
  background-color: rgba(33, 150, 243, 0.1);
  transform: translateY(-1px);
}

.answer-section {
  margin-top: 1rem;
  text-align: center;
}

.answer-display {
  margin: 0.75rem 0;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.1rem;
  color: #555;
  background: rgba(255, 255, 255, 0.5);
}

.feedback {
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: #666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feedback.correct {
  color: #4caf50;
  transform: scale(1.05);
}

.answer-display span {
  display: inline-block;
  margin-right: 0.25rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.answer-display span.correct {
  background-color: #c8e6c9;
  color: #1b5e20;
}

.answer-display span.incorrect {
  background-color: #ffcdd2;
  color: #b71c1c;
}
</style>
