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
        :style="{
          width: `${
            questionNumber > 0
              ? ((questionNumber - 1) / totalQuestions) * 100
              : 0
          }%`,
        }"
        v-if="totalQuestions > 0"></div>
    </div>
  </div>
</template>
<style scoped>
.progress-container {
  margin: 0.75rem 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-text {
  text-align: center;
  margin-bottom: 0.25rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
