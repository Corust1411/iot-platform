<template>
  <div class="text-widget" :title="widget.currentValue">
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
      const val = this.widget.currentValue;
      if (val === null || val === undefined) {
        return '--';
      }

      const strVal = String(val);

      const isIP = strVal.split('.').length > 2;
      const isText = isNaN(Number(strVal));

      if (isIP || isText) {
        return strVal;
      }

      if (strVal.includes('.')) {
        return Number(val).toFixed(2);
      }

      return strVal;
    }
  }
}
</script>

<style scoped>
.text-widget { 
  display: flex; 
  align-items: baseline; 
  justify-content: center;
  gap: 4px; 
  width: 100%;
  overflow: hidden;
}
.widget-value { 
  font-size: 32px; 
  font-weight: 700; 
  color: #111827; 
  
  max-width: 100%;
}
.widget-unit { 
  font-size: 16px; 
  font-weight: 600; 
  color: #6b7280; 
  white-space: nowrap;
}
</style>