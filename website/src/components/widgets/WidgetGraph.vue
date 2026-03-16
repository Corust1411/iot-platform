<template>
  <div class="graph-widget">
    <Line ref="lineChart" v-if="loaded" :data="chartData" :options="chartOptions" />
    <div v-else class="loading-text">Loading chart...</div>
  </div>
</template>

<script lang="">
import { defineComponent } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { http } from '@/api/http'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default defineComponent({
  name: 'WidgetGraph',
  components: { Line },
  props: {
    widget: { type: Object, required: true }
  },
  data() {
    return {
      loaded: false,
      chartData: { labels: [], datasets: [] },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 10 } } }
        },
        scales: {
          x: { ticks: { maxTicksLimit: 6, font: { size: 9 }, maxRotation: 0 } }, 
          y: { ticks: { font: { size: 10 } } }
        }
      }
    }
  },
  computed: {
    lineColor() { return this.widget.config?.lineColor || '#3b82f6'; },
    instanceName() { return this.widget.config?.instanceName || this.widget.data_key || 'Data'; },
    timeRange() { return this.widget.config?.timeRange || '1h'; }
  },
  watch: {
    timeRange(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.fetchHistoryData();
      }
    },
    'widget.currentValue'(newVal) {
      if (newVal !== null && this.loaded) {
        const nowStr = this.formatTime(new Date());
        
        this.chartData.labels.push(nowStr);
        this.chartData.datasets[0].data.push(newVal);

        let maxPoints = 50;
        if (this.timeRange === '24h') maxPoints = 100;
        else if (this.timeRange === '7d') maxPoints = 150;

        if (this.chartData.labels.length > maxPoints) {
          this.chartData.labels.shift();
          this.chartData.datasets[0].data.shift();
        }

        if (this.$refs.lineChart && this.$refs.lineChart.chart) {
          this.$refs.lineChart.chart.update('none'); 
        }
      }
    }
  },
  async mounted() {
    await this.fetchHistoryData();
  },
  methods: {
    formatTime(dateObj) {
      const d = new Date(dateObj);
      if (this.timeRange === '24h' || this.timeRange === '7d') {
        return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }) + ' ' + 
               d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    },

    async fetchHistoryData() {
      try {
        this.loaded = false;
        const res = await http.get(`/devices/${this.widget.device_id}/telemetry/history`, {
          params: { key: this.widget.data_key, range: this.timeRange }
        });

        const dataPoints = res.data.length > 0 ? res.data : [{ timestamp: new Date(), value: this.widget.currentValue || 0 }];

        const labels = dataPoints.map(d => this.formatTime(d.timestamp));
        const values = dataPoints.map(d => Number(d.value));

        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: `${this.instanceName} ${this.widget.config?.unit ? `(${this.widget.config.unit})` : ''}`,
              backgroundColor: this.lineColor,
              borderColor: this.lineColor,
              data: values,
              tension: 0.3,
              pointRadius: 1,
              borderWidth: 2
            }
          ]
        };
        this.loaded = true;
      } catch (error) {
        console.error("Error fetching graph data:", error);
        this.loaded = true;
      }
    }
  }
})
</script>

<style scoped>
.graph-widget {
  position: relative;
  width: 100%;
  height: 140px;
  margin-top: -15px;
}
.loading-text {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 12px;
  color: #9ca3af;
}
</style>