<template>
  <div class="text-widget">
    <span class="widget-value">{{ displayValue }}</span>
    <span class="widget-unit">{{ widget.config?.unit || '' }}</span>
  </div>
</template>

<script>
export default {
  name: 'WidgetText',
  props: {
    widget: {
      type: Object,
      required: true
    }
  },
  computed: {
    displayValue() {
      // ถ้าค่าเป็น null หรือ undefined ให้โชว์เครื่องหมาย --
      if (this.widget.currentValue === null || this.widget.currentValue === undefined) {
        return '--';
      }
      return this.widget.currentValue;
    }
  }
}
</script>

<style scoped>
.text-widget { 
  display: flex; 
  align-items: baseline; 
  gap: 4px; 
}
.widget-value { 
  font-size: 32px; 
  font-weight: 700; 
  color: #111827; 
}
.widget-unit { 
  font-size: 16px; 
  font-weight: 600; 
  color: #6b7280; 
}
</style>