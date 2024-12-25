<script setup lang="ts">
import { levels } from '../utils/levels';

defineProps<{
  currentLevel: number;
}>();
</script>

<template>
  <div class="level-info">
    <h2>Level {{ currentLevel }}</h2>
    <p>{{ levels[currentLevel - 1].description }}</p>
  </div>
</template>

<style scoped>
.level-info {
  text-align: center;
  margin-bottom: 2rem;
}

h2 {
  color: #2196F3;
  margin-bottom: 0.5rem;
}

p {
  color: #666;
  margin: 0;
}
</style>