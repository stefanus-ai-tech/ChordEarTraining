<script setup lang="ts">
import { ref, onMounted, defineExpose, computed } from 'vue';
import Pizzicato from 'pizzicato';
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
// type SoundOutput = Pizzicato.Sound | Pizzicato.Group;
type SynthType = 'Sine' | 'Square' | 'Sawtooth' | 'Triangle';
const synthTypes: SynthType[] = ['Sine', 'Square', 'Sawtooth', 'Triangle'];
const audioContext = ref<AudioContext | null>(null);

const createSynthConfigs = () => {
  return {
    Sine: (notes: string[]) => {
      const sounds = notes.map(
        (note) =>
          new Pizzicato.Sound({
            source: 'wave',
            options: {
              type: 'sine',
              frequency: noteToFrequency(note),
              attack: 0.05,
              decay: 0.1,
              sustain: 0.8,
              release: 0.1,
              volume: 0.3,
              pitch: 0,
              detune: 0,
              pan: 0,
              fadeIn: 0.02,
              fadeOut: 0.05,
            },
          })
      );
      return new Pizzicato.Group(sounds);
    },

    Square: (notes: string[]) => {
      const sounds = notes.map(
        (note) =>
          new Pizzicato.Sound({
            source: 'wave',
            options: {
              type: 'square',
              frequency: noteToFrequency(note),
              attack: 0.05,
              decay: 0.15,
              sustain: 0.6,
              release: 0.1,
              volume: 0.2,
              harmonicity: 1.5,
              modulationFrequency: 2,
              modulationDepth: 0.1,
              distortion: 0.1,
              fadeIn: 0.03,
            },
          })
      );
      return new Pizzicato.Group(sounds);
    },

    Sawtooth: (notes: string[]) => {
      const sounds = notes.map(
        (note) =>
          new Pizzicato.Sound({
            source: 'wave',
            options: {
              type: 'sawtooth',
              frequency: noteToFrequency(note),
              attack: 0.05,
              decay: 0.2,
              sustain: 0.7,
              release: 0.1,
              volume: 0.2,
              pitch: -12,
              detune: 5,
              modulationFrequency: 4,
              modulationDepth: 0.15,
              pan: 0.2,
              fadeIn: 0.04,
              fadeOut: 0.08,
            },
          })
      );
      return new Pizzicato.Group(sounds);
    },

    Triangle: (notes: string[]) => {
      const sounds = notes.map((note) => {
        const sound = new Pizzicato.Sound({
          source: 'wave',
          options: {
            type: 'triangle',
            frequency: noteToFrequency(note),
            attack: 0.08, // Slightly slower attack for softer start
            decay: 0.3, // Longer decay for more sustain
            sustain: 0.9, // High sustain for continuous tone
            release: 0.2, // Smooth release
            volume: 0.25, // Moderate volume
            pitch: 0,
            detune: 2, // Slight detune for warmth
            pan: -0.1, // Slightly panned left
            fadeIn: 0.05, // Smooth fade in
            fadeOut: 0.1, // Gentle fade out
          },
        });

        return sound;
      });
      return new Pizzicato.Group(sounds);
    },
  };
};

const synthConfigs = computed(() => {
  if (!isAudioStarted.value) return null;
  return createSynthConfigs();
});

const currentSynthType = ref<SynthType>('Sine');
let currentSound: Pizzicato.Sound | Pizzicato.Group | null = null;

// Helper function to convert note names to frequencies
function noteToFrequency(note: string): number {
  const A4 = 440;
  const notes = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];
  const octave = parseInt(note.slice(-1));
  const semitone = notes.indexOf(note.slice(0, -1));
  const N = semitone - 9 + (octave - 4) * 12;
  return A4 * Math.pow(2, N / 12);
}

const changeSynthType = (type: SynthType) => {
  currentSynthType.value = type;
};

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
// const isToneStarted = ref(false);
const isAudioStarted = ref(false);
const isPlaying = ref(false);
const feedback = ref('');
const buttonsEnabled = ref(true);
const nextEnabled = ref(false);
const completionMessageVisible = ref(false);
const startButtonVisible = ref(true);

const startAudio = async () => {
  try {
    // Access the audioContext through Pizzicato's internal property
    const context =
      (Pizzicato as any).context || (window as any).Pizzicato?.context;
    if (context?.state === 'suspended') {
      await context.resume();
    }
    isAudioStarted.value = true;
    console.log('Audio context started successfully');
  } catch (error) {
    console.error('Failed to start audio context:', error);
  }
};

const playChord = async (chord: Chord) => {
  if (currentSound) {
    currentSound.stop();
  }
  const notes = getRandomVoicing(chord.roman, currentProgression.value.key);
  if (!synthConfigs.value) {
    console.error('Synth configs not initialized');
    return;
  }

  currentSound = synthConfigs.value[currentSynthType.value](notes);
  currentSound.play();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  if (currentSound) {
    currentSound.stop();
  }
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
  if (!isAudioStarted.value || isPlaying.value || !synthConfigs.value) return;
  isPlaying.value = true;
  buttonsEnabled.value = false;
  await playTonicGuide();
  for (const chord of currentProgression.value.chords) {
    await playChord(chord);
  }
  isPlaying.value = false;
  buttonsEnabled.value = true;
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

const startGame = async () => {
  if (!audioContext.value) {
    audioContext.value = new AudioContext();
  }
  startAudio();
  generateProgression();
  playProgression();
  startButtonVisible.value = false;
};

onMounted(() => {
  // Do nothing on mount, wait for user to click "Start"
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
    <div class="settings-panel">
      <div class="settings-row">
        <div class="sound-type-selector">
          <label>Sound Type:</label>
          <div class="sound-buttons">
            <button
              v-for="type in synthTypes"
              :key="type"
              :class="['sound-button', { active: currentSynthType === type }]"
              @click="changeSynthType(type)">
              {{ type.length > 2 ? type.substring(0, 2) : type }}
            </button>
          </div>
        </div>
        <div class="level-selector">
          <label>Level:</label>
          <select v-model="currentLevel" :disabled="!startButtonVisible">
            <option
              v-for="level in levels"
              :key="level.number"
              :value="level.number">
              Level {{ level.number }}
            </option>
          </select>
          <label class="random-tonic">
            <input
              type="checkbox"
              v-model="useRandomTonic"
              :disabled="!startButtonVisible" />
            <span class="checkmark"></span>
            Random Tonic
          </label>
        </div>
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
.chord-trainer {
  max-width: 480px;
  margin: 0 auto;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

@media (max-width: 480px) {
  .chord-trainer {
    padding: 0.5rem;
    max-width: 100%;
  }
}

.settings-panel {
  background: rgba(248, 249, 250, 0.9);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.settings-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.settings-row {
  display: flex;
  gap: 0.75rem;
  align-items: start;
  flex-wrap: wrap;
}

.sound-type-selector {
  flex: 1;
}

.sound-buttons {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}

.sound-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  flex-grow: 1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sound-button:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sound-button.active {
  background: #007bff;
  color: white;
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.level-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.random-tonic {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  position: relative;
  /* Ensure the checkmark is positioned correctly */
}

/* Hide the default checkbox */
.random-tonic input[type='checkbox'] {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

/* Style the custom checkmark */
.random-tonic .checkmark {
  position: relative;
  top: 0;
  left: 0;
  height: 16px;
  width: 16px;
  background-color: #eee;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
}

/* Create the checkmark/indicator (hidden when not checked) */
.random-tonic .checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.random-tonic input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.random-tonic .checkmark:after {
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Change background color when checked */
.random-tonic input:checked ~ .checkmark {
  background-color: #2196f3;
}

.instructions {
  background: rgba(233, 236, 239, 0.9);
  padding: 0.5rem;
  border-radius: 6px;
  margin: 0.75rem 0;
  font-size: 0.85rem;
  text-align: center;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.instructions:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

label {
  font-weight: 500;
  color: #495057;
}

select {
  padding: 0.25rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.sound-type-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

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
  margin: 0.75rem 0;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.chord-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  margin: 0.5rem 0;
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
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  margin-top: 0.75rem;
  text-align: center;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.answer-display {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  color: #555;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.answer-display:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feedback {
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: #666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.5s ease;
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
