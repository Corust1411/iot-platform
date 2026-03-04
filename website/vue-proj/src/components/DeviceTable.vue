<template>
  <div class="device-card">
    <div class="tabs">
      <span class="active">All devices</span>
      <span>Favorite list</span>
    </div>

    <div class="table">
      <div class="table-header">
        <span>Name</span>
        <span>Category</span>
        <span>Protocol</span>
      </div>

      <div 
        v-for="device in devices"
        :key="device.id"
        class="table-row"
      >
        <span>{{ device.name }}</span>
        <span>{{ device.category }}</span>
        <span>{{ device.protocol }}</span>
      </div>
    </div>

    <div class="footer">
      <button class="add-btn">+ Add device</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['devices']
}
</script>

<style scoped>
.device-card {
  background: #dbe3ec;
  padding: 20px;
  border-radius: 12px;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.tabs span {
  cursor: pointer;
  color: #6b7280;
}

.tabs .active {
  color: black;
  border-bottom: 2px solid black;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 10px 0;
}

.table-row {
  border-top: 1px solid #cbd5e1;
}

.footer {
  text-align: right;
  margin-top: 20px;
}

.add-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
}
</style>