<template>
  <tr>
    <td>{{ device.name }}</td>
    <td>{{ device.category }}</td>
    <td>{{ device.protocol }}</td>
    <td>
      ❤️ ⋮
    </td>
  </tr>
</template>

<script setup lang="ts">
defineProps<{ device: any }>()
</script>
