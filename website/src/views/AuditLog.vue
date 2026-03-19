<template>
  <div class="app-wrapper">
    <TopNavBar :username="username" />
    <div class="layout">
      <SideNavBar />
      <div class="content">
        <div class="page-header">
          <h1 class="page-title">System Audit Log</h1>
        </div>

        <div class="log-card">
          <div class="table-container">
            <div class="table-header">
              <span>Timestamp</span>
              <span>Account</span>
              <span>Action</span>
              <span>Detail</span>
            </div>

            <div v-for="log in displayedLogs" :key="log.id" class="table-row">
              <span class="text-small text-gray">{{ formatDate(log.created_at) }}</span>
              <span class="fw-bold">{{ getDisplayUser(log) }}</span>
              <span><span class="badge" :class="getActionClass(log.action)">{{ formatAction(log.action) }}</span></span>
              <span class="text-small log-detail" :title="log.detail">{{ log.detail || '-' }}</span>
            </div>

            <div v-if="logs.length === 0" class="empty-state">No audit logs found.</div>
          </div>
          <div class="paginator-wrapper" v-if="logs.length > 0">
            <div class="rows-per-page">
                <span class="text-small">Rows per page:</span>
                <select class="row-select" v-model.number="itemsPerPage" @change="currentPage = 1">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                </select>
            </div>

            <div class="paginator" v-if="totalPages > 1">
                <button :disabled="currentPage === 1" @click="currentPage--">
                <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <span>Page {{ currentPage }} of {{ totalPages }}</span>
                <button :disabled="currentPage === totalPages" @click="currentPage++">
                <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue'
import SideNavBar from '@/components/SideNavBar.vue'
import { http } from '@/api/http'

export default {
  components: { TopNavBar, SideNavBar },
  data() {
    return {
      username: localStorage.getItem('username') || 'Admin',
      logs: [],
      currentPage: 1,
      itemsPerPage: 10
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.logs.length / this.itemsPerPage) || 1;
    },
    displayedLogs() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.logs.slice(start, end);
    }
  },
  async mounted() {
    await this.fetchLogs();
  },
  methods: {
    async fetchLogs() {
      try {
        const res = await http.get('/logs');
        this.logs = res.data;
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('th-TH');
    },
    formatAction(action) {
      return action.split(' ')[0];
    },
    getActionClass(action) {
      if (action.startsWith('Create')) return 'badge-create';
      if (action.startsWith('Update')) return 'badge-update';
      if (action.startsWith('Delete')) return 'badge-delete';
      if (action.toLowerCase().includes('login')) return 'badge-default';
      return 'badge-default';
    },
    getDisplayUser(log) {
      if (log.username) return log.username;
      
      if (log.action && log.action.toLowerCase().includes('login')) {
        return 'System';
      }
      
      return 'Deleted User';
    },
  }
}
</script>

<style scoped>
.layout { display: flex; min-height: calc(100vh - 64px); }
.content { flex: 1; padding: 32px 40px; background: #f8fafc; }
.page-header { display: flex; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; margin: 0; color: #111827; }
.log-card { background: white; padding: 24px; border-radius: 16px; min-height: 70vh; border: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.table-container { display: flex; flex-direction: column; background-color: #f1f5f9; border-radius: 10px; flex: 1; overflow-y: auto; padding: 0 10px; }
.table-header, .table-row { display: grid; grid-template-columns: 1fr 1fr 0.5fr 3fr; align-items: start; padding: 12px; border-bottom: 1px solid #cbd5e1; gap: 12px;}
.table-header { font-weight: 700; font-size: 13px; color: #475569; }
.table-row { font-size: 13px; transition: 0.2s; }
.table-row:hover { background-color: #e2e8f0; }
.text-small { font-size: 12px; }
.text-gray { color: #64748b; }
.fw-bold { font-weight: 600; color: #0f172a; }
.log-detail { white-space: pre-wrap; word-break: break-all; line-height: 1.5; max-height: fit-content; overflow: auto; text-overflow: ellipsis; font-family: monospace; color: #475569; }

.badge { padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; }
.badge-create { background: #dcfce7; color: #166534; }
.badge-update { background: #dbeafe; color: #1e40af; }
.badge-delete { background: #fee2e2; color: #991b1b; }
.badge-default { background: #f3f4f6; color: #374151; }
.empty-state { text-align: center; padding: 40px; color: #64748b; }

.paginator-wrapper { display: flex; justify-content: right; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
.rows-per-page { display: flex; align-items: center; gap: 8px; }
.row-select { padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: inherit; color: #374151; outline: none; cursor: pointer; }
.row-select:focus { border-color: #486284; }

.paginator { display: flex; align-items: center; gap: 16px; padding-left: 10px;}
.paginator button { background: none; border: 1px solid #d1d5db; border-radius: 8px; padding: 4px 8px; cursor: pointer; display: flex; align-items: center; color: #374151; transition: 0.2s; }
.paginator button:hover:not(:disabled) { background-color: #f1f5f9; }
.paginator button:disabled { opacity: 0.5; cursor: not-allowed; background-color: #f3f4f6; }
.paginator span { font-size: 13px; font-weight: 600; color: #4b5563; }
</style>