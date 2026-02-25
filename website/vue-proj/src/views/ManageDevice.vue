<script setup lang="ts">
import { onMounted } from 'vue'
import { useDeviceStore } from '@/store/device.store.ts'
import DeviceTabs from '@/components/device/DeviceTabs.vue'
import DeviceTable from '@/components/device/DeviceTable.vue'

const store = useDeviceStore()

onMounted(() => {
  store.loadDevices()
})
</script>

<template>
  <DeviceTabs @change="store.changeTab" />

  <DeviceTable
    v-if="!store.loading"
    :devices="store.devices"
  />
</template>
