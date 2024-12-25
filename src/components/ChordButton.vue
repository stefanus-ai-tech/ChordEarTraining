<script setup lang="ts">
defineProps<{
  roman: string;
  active?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <button 
    class="chord-button" 
    :class="{ active, disabled }"
    :disabled="disabled"
  >
    {{ roman }}
  </button>
</template>

<style scoped>
.chord-button {
  padding: 1rem 2rem;
  border: 2px solid #2196F3;
  border-radius: 8px;
  background: white;
  color: #2196F3;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chord-button:hover:not(:disabled) {
  background: #2196F3;
  color: white;
}

.chord-button.active {
  background: #2196F3;
  color: white;
}

.chord-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ccc;
  color: #666;
}
</style>