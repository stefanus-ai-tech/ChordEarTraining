<script setup lang="ts">
defineProps<{
  current: number;
  total: number;
}>();
</script>

<template>
  <div class="progress-container">
    <div class="progress-text">{{ current }} of {{ total }} correct</div>
    <div class="progress-bar">
      <div 
        class="progress-fill"
        :style="{ width: `${(current / total) * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  margin: 1rem 0;
  width: 100%;
}

.progress-text {
  text-align: left;
  margin-bottom: 0.5rem;
  color: #666;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}
</style>