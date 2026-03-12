<template>
  <div class="toggle-widget">
    <label class="switch">
      <input 
        type="checkbox" 
        :checked="widget.currentValue" 
        @change="onToggle"
      >
      <span class="slider round"></span>
    </label>
    <div class="toggle-status">
      {{ widget.currentValue ? 'ON' : 'OFF' }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'WidgetToggle',
  props: {
    widget: {
      type: Object,
      required: true
    }
  },
  methods: {
    onToggle(event) {
      this.$emit('toggle', this.widget, event);
    }
  }
}
</script>

<style scoped>
.toggle-widget { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.toggle-status { font-weight: 700; font-size: 14px; color: #4b5563; }

/* CSS ของสวิตช์ที่ย้ายมาจากหน้าหลัก */
.switch { position: relative; display: inline-block; width: 60px; height: 34px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: #10b981; }
input:focus + .slider { box-shadow: 0 0 1px #10b981; }
input:checked + .slider:before { transform: translateX(26px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }
</style>