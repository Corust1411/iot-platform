<template>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Category</th>
        <th>Protocol</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <DeviceRow
        v-for="d in devices"
        :key="d.id"
        :device="d"
      />
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDeviceStore } from '@/store/device.store'
import DeviceRow from './DeviceRow.vue'

const store = useDeviceStore()
const devices = store.devices

onMounted(() => {
  store.fetchDevices()
})
</script>
