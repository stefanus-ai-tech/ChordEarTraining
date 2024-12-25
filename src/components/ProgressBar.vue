<script setup lang="ts">
defineProps<{
  questionNumber: number;
  totalQuestions: number;
}>();
</script>

<template>
  <div class="progress-container">
    <div class="progress-text">
      Question {{ questionNumber }} of {{ totalQuestions }}
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${(questionNumber / totalQuestions) * 100}%` }"
        v-if="totalQuestions > 0"></div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  margin: 1rem 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-text {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #666;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}
</style>
