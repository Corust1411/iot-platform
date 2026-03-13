<template>
  <div class="slider-widget">
    
    <div class="slider-info">
      <span class="value">{{ localValue }}</span>
      <span class="unit">{{ widget.config?.unit || '' }}</span>
    </div>

    <input 
      type="range" 
      class="range-slider"
      :min="min" 
      :max="max" 
      v-model="localValue" 
      @change="onReleaseSlider"
    />
    
    <div class="slider-labels">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>

  </div>
  
</template>

<script>
export default {
  name: 'WidgetSlider',
  props: {
    widget: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localValue: this.widget.currentValue || 0
    }
  },
  computed: {
    min() { return Number(this.widget.config?.min) || 0; },
    max() { return Number(this.widget.config?.max) || 100; }
  },
  watch: {
    'widget.currentValue'(newVal) {
      if (newVal !== null && newVal !== undefined) {
        this.localValue = newVal;
      }
    }
  },
  mounted() {
    if (this.widget.currentValue === null || this.widget.currentValue === undefined) {
      this.localValue = this.min;
    }
  },
  methods: {
    onReleaseSlider() {
      this.$emit('slide', this.widget, Number(this.localValue));
    }
  }
}
</script>

<style scoped>
.slider-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 8px;
  margin-top: -10px;
}
.slider-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.slider-info .value { font-size: 26px; font-weight: 700; color: #111827; }
.slider-info .unit { font-size: 14px; font-weight: 600; color: #6b7280; }

.range-slider {
  width: 90%;
  cursor: pointer;
  accent-color: #3b82f6; /* เปลี่ยนสี Slider เป็นสีฟ้า */
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  width: 90%;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
}
</style>