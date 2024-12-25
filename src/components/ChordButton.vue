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
    :disabled="disabled">
    {{ roman }}
  </button>
</template>

<style scoped>
.chord-button {
  padding: 0.5rem 1rem;
  border: 2px solid #2196f3;
  border-radius: 12px;
  background: white;
  color: #2196f3;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chord-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.chord-button.active {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.chord-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ddd;
  color: #999;
  transform: none;
  box-shadow: none;
}
</style>
