<template>
  <div class="app-container">
    <el-card>
      <div class="baseInfo-window">
        <el-input v-model="searchContent" :placeholder="inputPlaceholder" style="width: 400px;" @keyup.enter.native="taskHistorySearch">
          <el-dropdown slot="prepend" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ searchType === 'taskname' ? '任务名称' : '任务id' }}
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
            <el-dropdown-menu slot="dropdown" class="fixed-dropdown-menu">
              <el-dropdown-item command="taskname">任务名称</el-dropdown-item>
              <el-dropdown-item command="taskid">任务ID</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button slot="append" icon="el-icon-search" @click="taskHistorySearch" />
        </el-input>
        <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset"/>
      </div>
    </el-card>
    <el-card>
      <div class="form-window">
        <el-table v-loading="listLoading" :data="taskHistory" border fit style="width: 100%;position: relative; height: 100%;" stripe @sort-change="sortChange">
          <el-table-column :label="$t('table.id')" fixed="left" min-width="50px" align="center" prop="id" />
          <el-table-column :label="$t('table.taskID')" min-width="100px" align="center" prop="taskID" />
          <el-table-column :label="$t('table.taskName')" min-width="150px" align="center" prop="taskName" />
          <el-table-column :label="$t('table.machine')" min-width="150px" align="center" prop="hostName" />
          <el-table-column :label="$t('table.executionTime')" min-width="80px" align="center" prop="executionTime" />
          <el-table-column :label="$t('table.executedAt')" min-width="170px" align="center" prop="executedAt" />
          <el-table-column :label="$t('table.status')" min-width="100px" align="center" prop="status">
            <template slot-scope="scope">
              <el-tag :type="getStatusTag(scope.row.status)">
                {{ formatStatus(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.execHandler')" min-width="110px" align="center" prop="creator" />
          <el-table-column :label="$t('table.createdAt')" min-width="170px" align="center" prop="createdAt" />
          <el-table-column :label="$t('table.actions')" fixed="right" align="center" min-width="150px" >
            <template slot-scope="scope">
              <el-button type="text" icon="el-icon-view" @click="handleOpenTerminal(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getTaskHistoryList" />
    </el-card>
    <!-- 终端模态弹窗 -->
    <el-dialog title="终端输出" :visible.sync="isTerminalVisible" width="60%">
      <div id="terminal" style="height: 400px; background-color: black; color: white;"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseTerminal">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { getTaskHistory } from '@/api/smart/execMachine'
import WebSocketClient from '@/api/smart/websocket';  // 引入 WebSocket 逻辑文件

export default {
  name: 'TaskHistory',
  directives: { waves },
  data() {
    return {
      searchType: 'taskname',
      isTerminalVisible: false,
      terminal: null,
      taskStatus: [],
      taskHistory: [],
      searchContent: '',
      queryParams: {
        pageIndex: 1,
        pageSize: 10
      },
      listLoading: true,
      originaltaskHistory: [],
      total: 0,
      dialogVisible: false
    }
  },
  created() {
    this.getTaskHistoryList()
    this.getDicts('task_history_type').then(response => {
      this.taskStatus = response.data
    })
  },

  computed: {
    inputPlaceholder() {
      return this.searchType === 'taskname' ? '请输入任务名称' : '请输入任务id'
    },
    activeStatus() {
      return this.taskStatus.find(status => status.value === 1) || { value: 1 };
    },
    inactiveStatus() {
      return this.taskStatus.find(status => status.value === 2) || { value: 2 };
    }
  },

  methods: {
    getTaskHistoryList() {
      this.listLoading = true
      getTaskHistory().then(response => {
        this.taskHistory = response.data.list
        this.originaltaskHistory = response.data.list
        this.total = response.data.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleCommand(command) {
      this.searchType = command
    },
    // 处理点击事件，显示终端
    handleOpenTerminal(row) {
      this.isTerminalVisible = true;
      this.$nextTick(() => {
        if (!this.terminal) {
          this.terminal = new Terminal({ cursorBlink: true });
          this.terminal.open(document.getElementById('terminal'));
        }

        // 动态生成 WebSocket URL，将工单 ID 传入
        const taskId = row.taskID;
        const webSocketUrl = `ws://localhost:8000/api/v1/ws/task/${taskId}`;

        // 获取 token，传入 WebSocketClient
        const token = this.$store.state.user.token;

        // 创建并连接 WebSocket
        this.webSocketClient = new WebSocketClient(webSocketUrl, this.terminal, token);
        this.webSocketClient.connect();
      });
    },
    handleCloseTerminal() {
      this.isTerminalVisible = false;
      if (this.webSocketClient) {
        this.webSocketClient.disconnect();
        this.webSocketClient = null;
      }
    },
    taskHistorySearch() {
      // 搜索功能逻辑
      this.listLoading = true
      setTimeout(() => {
        if (this.searchContent) {
          const searchLower = this.searchContent.toLowerCase();
          if (this.searchType === 'taskname') {
            this.taskHistory = this.originaltaskHistory.filter(item =>
              item.hostName.toLowerCase().includes(searchLower)
            );
          } else if (this.searchType === 'taskid') {
            console.log('this.originaltaskHistory=',this.originaltaskHistory)
            this.taskHistory = this.originaltaskHistory.filter(item =>
              item.ip.toString().includes(this.searchContent)
            )
          }
        } else {
          // 如果搜索内容为空，恢复原始数据
          this.taskHistory = this.originaltaskHistory;
        }
        this.listLoading = false
      }, 300)
    },
    handleReset() {
      this.listLoading = true
      setTimeout(() => {
        this.searchContent = ''
        this.getTaskHistoryList()
        this.listLoading = false
      }, 400)
    },
    getStatusTag(status) {
      const statusItem = this.taskStatus.find(item => String(item.value) === String(status))
      // 0 为 成功是绿色 (success)，1 为失败是红色 (danger) 、2 未知是灰色 (danger)
      return statusItem && statusItem.value === "0" ? 'success' : 'danger'
    },
    // 格式化显示状态
    formatStatus(status) {
      const statusItem = this.taskStatus.find(item => String(item.value) === String(status)) // 确保类型一致
      return statusItem ? statusItem.label : status  // 返回标签文本或默认状态
    },
    sortChange({prop, order}) {
      this.queryParams.sort = prop
      this.queryParams.order = order
      this.getTaskHistoryList()
    },

  }
}
</script>

<style scoped lang="scss">
/* 自定义终端样式 */
.terminal {
  font-family: monospace;
  padding: 10px;
  overflow: hidden;
}


</style>
