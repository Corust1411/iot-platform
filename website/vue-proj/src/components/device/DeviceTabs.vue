<script setup lang="ts">
import { ref, defineEmits } from 'vue'

const emit = defineEmits<{
  (e: 'change', tab: 'all' | 'favorite'): void
}>()

const activeTab = ref<'all' | 'favorite'>('all')

function selectTab(tab: 'all' | 'favorite') {
  activeTab.value = tab
  emit('change', tab)
}
</script>

<template>
  <div class="device-tabs">
    <button
      :class="{ active: activeTab === 'all' }"
      @click="selectTab('all')"
    >
      All devices
    </button>

    <button
      :class="{ active: activeTab === 'favorite' }"
      @click="selectTab('favorite')"
    >
      Favorite list
    </button>
  </div>
</template>

<style scoped>
.device-tabs {
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #ddd;
}

button {
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
}

button.active {
  border-bottom: 2px solid #ff5a5a;
  font-weight: bold;
}
</style>
