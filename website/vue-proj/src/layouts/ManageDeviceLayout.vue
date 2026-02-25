<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DeviceTabs from '@/components/DeviceTabs.vue'
import DeviceTable from '@/components/DeviceTable.vue'
//import { getDevices } from '@/api/device.api'

const devices = ref([])
const currentTab = ref<'all' | 'favorite'>('all')

async function fetchDevices() {
  devices.value = await getDevices(currentTab.value)
}

function onTabChange(tab: 'all' | 'favorite') {
  currentTab.value = tab
  fetchDevices()
}

onMounted(fetchDevices)
</script>

<template>
  <div class="manage-device">
    <DeviceTabs @change="onTabChange" />
    <DeviceTable :devices="devices" />
  </div>
</template>
