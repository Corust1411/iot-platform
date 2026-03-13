<template>
  <div class="gauge-widget">
    <div class="gauge-container">
      <svg viewBox="0 0 100 55" class="gauge-svg">
        <path 
          class="gauge-track" 
          d="M 10 50 A 40 40 0 0 1 90 50" 
        />
        <path 
          class="gauge-fill" 
          d="M 10 50 A 40 40 0 0 1 90 50" 
          :style="{ strokeDashoffset: dashOffset }"
        />
      </svg>
      
      <div class="gauge-text">
        <span class="value">{{ displayValue }}</span>
        <span class="unit">{{ unit }}</span>
      </div>
    </div>
    
    <div class="gauge-labels">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WidgetGauge',
  props: {
    widget: {
      type: Object,
      required: true
    }
  },
  computed: {
    min() { return Number(this.widget.config?.min) || 0; },
    max() { return Number(this.widget.config?.max) || 100; },
    unit() { return this.widget.config?.unit || ''; },
    
    displayValue() {
      if (this.widget.currentValue === null || this.widget.currentValue === undefined) return '--';
      return Number(this.widget.currentValue).toFixed(1);
    },

    dashOffset() {
      const circumference = 125.66;
      
      let val = Number(this.widget.currentValue) || 0;
      
      if (val < this.min) val = this.min;
      if (val > this.max) val = this.max;

      const percentage = (val - this.min) / (this.max - this.min);
      
      const offset = circumference - (percentage * circumference);
      return offset;
    }
  }
}
</script>

<style scoped>
.gauge-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: -10px; 
}

.gauge-container {
  position: relative;
  width: 140px;
  height: 75px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.gauge-track {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 12;
  stroke-linecap: round;
}

.gauge-fill {
  fill: none;
  stroke: #FE7743;
  stroke-width: 12;
  stroke-linecap: round;
  stroke-dasharray: 125.66; 
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.gauge-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.gauge-text .value {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.gauge-text .unit {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.gauge-labels {
  display: flex;
  justify-content: space-between;
  width: 120px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  margin-top: 4px;
}
</style>