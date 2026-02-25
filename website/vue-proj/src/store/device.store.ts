import { defineStore } from 'pinia'
import { fetchDevices } from '@/api/device.api'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [] as any[],
    tab: 'all' as 'all' | 'favorite',
    loading: false,
  }),

  actions: {
    async loadDevices() {
      this.loading = true
      const res = await fetchDevices(this.tab)
      this.devices = res.data
      this.loading = false
    },

    changeTab(tab: 'all' | 'favorite') {
      this.tab = tab
      this.loadDevices()
    },
  },
})
