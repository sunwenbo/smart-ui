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
        <el-table v-loading="listLoading" :data="taskHistory" border fit style="width: 100%;position: relative; height: 100%;" stripe>
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
          <el-table-column :label="$t('table.actions')" fixed="right" align="center" min-width="200px" >
            <template slot-scope="scope">
              <el-button type="text" icon="el-icon-loading" @click="handleOpenTerminal(scope.row)">
                实时日志
              </el-button>
              <el-button type="text" icon="el-icon-view" @click="handleOpenHisTaskTerminal(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getTaskHistoryList" />
    </el-card>
    <!-- 终端模态弹窗 -->
    <el-dialog title="终端输出" :visible.sync="isTerminalVisible" width="70%">
      <div id="terminal" style="height: 500px; padding: 15px;background-color: black; color: white;"></div>
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
import { getTaskHistory, getTaskHistoryLog } from '@/api/smart/taskCenter'
import WebSocketClient from '@/api/smart/websocket';  // 引入 WebSocket 逻辑文件
import { FitAddon } from 'xterm-addon-fit'; // 引入 fit-addon

export default {
  name: 'TaskHistory',
  directives: { waves },
  data() {
    return {
      searchType: 'taskname',
      isTerminalVisible: false,
      terminal: null,
      fitAddon: null, // 用于动态调整尺寸的插件
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
    // 显示实时日志终端
    handleOpenTerminal(row) {
      this.isTerminalVisible = true;
      this.$nextTick(() => {
        if (!this.terminal) {
          this.terminal = new Terminal({ cursorBlink: true });
          this.terminal.open(document.getElementById('terminal'));
        } else {
          // 每次打开新日志前清理终端
          this.terminal.clear();
        }

        // 动态生成 WebSocket URL，将工单 ID 传入
        const taskId = row.taskID;
        const webSocketUrl = `${process.env.VUE_APP_WEBSOCKET_HOST}/v1/ws/task/${taskId}`;

        // 创建并连接 WebSocket
        this.webSocketClient = new WebSocketClient(webSocketUrl, this.terminal, this.$store.state.user.token);
        this.webSocketClient.connect();
      });
    },

    // 显示历史任务日志终端
    handleOpenHisTaskTerminal(row) {
      this.isTerminalVisible = true;
      this.$nextTick(() => {
        const terminalContainer = document.getElementById('terminal');
        if (!this.terminal) {
          this.terminal = new Terminal({ cursorBlink: true });
          this.fitAddon = new FitAddon();
          this.terminal.loadAddon(this.fitAddon); // 加载 fit-addon
          this.terminal.open(terminalContainer);
        } else {
          // 每次打开新日志前清理终端
          this.terminal.clear();
        }

        // 调整终端尺寸
        this.fitAddon.fit();
        // 动态监听终端大小变化
        const resizeObserver = new ResizeObserver(() => {
          this.fitAddon.fit(); // 自适应终端大小
        });
        resizeObserver.observe(terminalContainer); // 监听容器大小变化

        getTaskHistoryLog(row.id).then(response => {
          // 格式化日志内容
          const logData = response.data.split("\n").map(line => {
            // 高亮时间戳
            line = line.replace(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{6})/, (match) => {
              return `\x1b[36m${match}\x1b[0m`; // 青色显示时间戳
            });

            // 高亮关键字
            line = line.replace(/(任务开始|任务结束|错误|成功|失败)/g, (match) => {
              let color;
              switch (match) {
                case "任务开始":
                case "成功":
                  color = "\x1b[34m"; // 绿色
                  break;
                case "任务结束":
                  color = "\x1b[32m"; // 蓝色
                  break;
                case "错误":
                case "失败":
                  color = "\x1b[31m"; // 红色
                  break;
                default:
                  color = "\x1b[0m";
              }
              return `${color}${match}\x1b[0m`;
            });

            return line;
          });

          // 将格式化后的日志内容逐行写入终端
          logData.forEach(line => {
            this.terminal.writeln(line);
          });
        }).catch(error => {
          this.terminal.write(`\x1b[31m错误: 无法获取日志 - ${error.message}\x1b[0m`);
          console.error("获取任务日志失败:", error);
        });
      })
    },
    handleCloseTerminal() {
      this.isTerminalVisible = false;
      if (this.terminal) {
        this.terminal.dispose(); // 关闭时清理终端实例
        this.terminal = null;
        this.fitAddon = null;
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
    }

  }
}
</script>
