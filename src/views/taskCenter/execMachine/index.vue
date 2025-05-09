<template>
  <div class="app-container">
    <el-card>
      <div class="baseInfo-window">
        <el-button v-waves style="margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="createMachineDialog">
          {{ $t('table.createMahcine') }}
        </el-button>
        <el-input v-model="searchContent" :placeholder="inputPlaceholder" style="width: 400px;" @keyup.enter.native="machineSearch">
          <el-dropdown slot="prepend" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ searchType === 'hostname' ? '主机名' : 'IP' }}
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
            <el-dropdown-menu slot="dropdown" class="fixed-dropdown-menu">
              <el-dropdown-item command="name">主机名</el-dropdown-item>
              <el-dropdown-item command="id">IP</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button slot="append" icon="el-icon-search" @click="machineSearch" />
        </el-input>
        <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset"/>
      </div>
    </el-card>
    <el-card>
      <div class="form-window">
        <el-table v-loading="listLoading" :data="execMachineList" border fit style="width: 100%;position: relative; height: 100%;" stripe>
          <el-table-column :label="$t('table.id')" fixed="left" min-width="50px" align="center" prop="id" />
          <el-table-column :label="$t('table.hostname')" min-width="150px" align="center" prop="hostName" />
          <el-table-column :label="$t('table.ip')" min-width="100px" align="center" prop="ip" />
          <el-table-column :label="$t('table.loginUser')" min-width="100px" align="center" prop="userName" />
          <el-table-column :label="$t('table.port')" min-width="100px" align="center" prop="port" />
          <el-table-column :label="$t('table.status')" min-width="80px" align="center" prop="status">
            <template slot-scope="scope">
              <el-tag :type="getStatusTag(scope.row.status)">
                {{ formatStatus(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.authType')" min-width="100px" align="center" prop="authType">
            <template slot-scope="scope">
              <el-tag :type="getTagType(scope.row.authType)">
                {{ formatAuthType(scope.row.authType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.heartbeat')" min-width="170px" align="center" prop="heartbeat" />
          <el-table-column :label="$t('table.creator')" min-width="110px" align="center" prop="creator" />
          <el-table-column :label="$t('table.regenerator')" min-width="110px" align="center" prop="regenerator" />
          <el-table-column :label="$t('table.createdAt')" min-width="170px" align="center" prop="createdAt" />
          <el-table-column :label="$t('table.updatedAt')" min-width="170px" align="center" prop="updatedAt" />
          <el-table-column :label="$t('table.actions')" fixed="right" align="center" min-width="250px" >
            <template slot-scope="scope">
              <el-button v-permisaction="['process:admin:manager:test']" type="text" icon="el-icon-mouse" @click="handleTestCon(scope.row)">
                连接测试
              </el-button>
              <el-button v-permisaction="['process:admin:manager:edit']" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button v-permisaction="['process:admin:manager:delete']"  type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getMachineList" />
      <el-dialog :title="dialogMachineVisibleName === 1 ? '新增主机' : '编辑主机信息'" :visible.sync="dialogVisible" width="60%" style="margin-top: 0">
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="IP:" prop="ip">
                <el-input v-model="ruleForm.ip" placeholder="请输入主机IP" style="width: 100%" :disabled="dialogMachineVisibleName !== 1" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="主机名:" prop="hostName">
                <el-input v-model="ruleForm.hostName" placeholder="请输入主机名" style="width: 100%" :disabled="dialogMachineVisibleName !== 1" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名:" prop="userName">
                <el-input v-model="ruleForm.userName" placeholder="请输入用户名" style="width: 100%" :disabled="dialogMachineVisibleName !== 1" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="端口号:" prop="port">
                <el-input v-model="ruleForm.port" placeholder="请输入端口号" style="width: 100%" type="number" @input="handlePortInput" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="状态:" prop="status">
                <el-switch
                    v-if="machineStatus.length > 0"
                    v-model="ruleForm.status"
                    :active-value="activeStatus.value"
                    :inactive-value="inactiveStatus.value"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="认证方式:" prop="authType">
                <el-select v-model="ruleForm.authType" filterable placeholder="请选择主机认证方式" style="width: 100%" @change="onAuthTypeChange">
                  <el-option
                    v-for="item in machineAuth"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>

          </el-row>
          <el-row :gutter="20">
            <!-- 用户密码认证 -->
            <el-col :span="24" v-if="ruleForm.authType === '1'">
              <el-form-item label="主机密码:" prop="passWord">
                <el-input v-model="ruleForm.passWord" placeholder="请输入密码" type="password" style="width: 100%" />
              </el-form-item>
            </el-col>
            <!-- 私钥认证 -->
            <el-col :span="24" v-if="ruleForm.authType === '2'">
              <el-form-item label="私钥内容:" prop="privateKey">
                <el-input
                  v-model="ruleForm.privateKey"
                  type="textarea"
                  placeholder="请输入您的私钥"
                  rows="20"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="描述:" prop="description">
            <el-input v-model="ruleForm.description" placeholder="请输入主机描述" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" style="width: 100%" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogMachineVisibleName === 1 ? submitForm('ruleForm') : editForm('ruleForm')">连接&提交</el-button>
          <el-button type="warning" @click="dialogVisible = false">取消</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import {
  getExecMachine,
  createExecMachine,
  deleteExecMachine,
  updateExecMachine,
  getExecMachineId,
  testConnExecMachine
} from '@/api/smart/execMachine'

export default {
  name: 'ExecMachine',
  directives: { waves },
  data() {
    return {
      searchType: 'ip',
      machineStatus: [],
      machineAuth: [],
      execMachineList: [],
      searchContent: '',
      queryParams: {
        pageIndex: 1,
        pageSize: 10
      },
      listLoading: true,
      originalExecMachineList: [],
      total: 0,
      dialogVisible: false,
      dialogMachineVisibleName: undefined,
      ruleForm: {
        id: undefined,
        hostName: '',
        userName: '',
        passWord: '',
        port: 22,
        status: 1, // 默认为在线
        authType: null, // 默认为用户名密码
        privateKey: '',
        description: '',
      },
      rules: {
        ip: [
          { required: true, message: '请输入IP', trigger: 'blur' }
        ],
        hostName: [
          { required: true, message: '请输入主机名', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        passWord: [
          { required: true, message: '请输入用户密码', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入端口号', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择主机状态', trigger: 'blur' }
        ],
        authType: [
          { required: true, message: '请选择认证类型', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getMachineList()
    this.getDicts('order_exec_machine_status').then(response => {
      this.machineStatus = response.data
    })
    this.getDicts('order_exec_machine_auth').then(response => {
      this.machineAuth = response.data
    })
  },

  computed: {
    inputPlaceholder() {
      return this.searchType === 'hostname' ? '请输入主机名' : '请输入主机ip'
    },
    activeStatus() {
      return this.machineStatus.find(status => status.value === 1) || { value: 1 };
    },
    inactiveStatus() {
      return this.machineStatus.find(status => status.value === 2) || { value: 2 };
    }
  },

  methods: {
    getMachineList() {
      this.listLoading = true
      getExecMachine().then(response => {
        this.execMachineList = response.data.list
        this.originalExecMachineList = response.data.list
        this.total = response.data.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    // 监听认证类型的变化
    onAuthTypeChange(value) {
      this.ruleForm.authType = value; // 更新当前认证类型
      if (value === '1') {
        // 用户名密码认证
        this.ruleForm.passWord = ''; // 清空密码字段
        this.ruleForm.privateKey = ''; // 清空公私钥路径字段
      } else if (value === '2') {
        // 公私钥认证
        this.ruleForm.privateKey = ''; // 清空公私钥路径字段
        this.ruleForm.passWord = ''; // 清空密码字段
      }
    },
    handlePortInput(value) {
      // 将输入值转换为数字
      this.ruleForm.port = value ? Number(value) : '';
    },
    handleCommand(command) {
      this.searchType = command
    },
    // 根据 authType 返回对应的显示文本
    formatAuthType(authType) {
      const authItem = this.machineAuth.find(item => item.value === authType);
      return authItem ? authItem.label : authType; // 如果匹配到 label，显示 label，否则显示原值
    },
    updateContent() {
      const { interpreter } = this.ruleForm
      const templateType = this.interpreterPaths[interpreter];
      const template = this.interpreterTemplates[templateType] || '';
    },
    // 根据 authType 返回对应的标签类型
    getTagType(authType) {
      if (authType === "1") {
        return "success"; // 例如: 密码为绿色
      } else if (authType === "2") {
        return "warning"; // 例如: 私钥为黄色
      }
      return "info"; // 默认类型
    },
    createMachineDialog() {
      this.dialogMachineVisibleName = 1
      this.dialogVisible = true
    },
    handleTestCon(row) {
      testConnExecMachine({id: row.id,}).then(response => {
        if (response.code === 200) {
          this.$message.success(response.msg)
          this.getMachineList()
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    handleEdit(row) {
      this.ruleForm = {...row}
      this.dialogMachineVisibleName = 2
      this.dialogVisible = true
    },

    machineSearch() {
      // 搜索功能逻辑
      this.listLoading = true
      setTimeout(() => {
        if (this.searchContent) {
          const searchLower = this.searchContent.toLowerCase();
          if (this.searchType === 'hostname') {
            this.execMachineList = this.originalExecMachineList.filter(item =>
                item.hostName.toLowerCase().includes(searchLower)
            );
          } else if (this.searchType === 'ip') {
            this.execMachineList = this.originalExecMachineList.filter(item =>
                item.ip.toString().includes(this.searchContent)
            )
          }
        } else {
          // 如果搜索内容为空，恢复原始数据
          this.execMachineList = this.originalExecMachineList;
        }
        this.listLoading = false
      }, 300)
    },
    handleReset() {
      this.listLoading = true
      setTimeout(() => {
        this.searchContent = ''
        this.getMachineList()
        this.listLoading = false
      }, 400)
    },
    getStatusTag(status) {
      const statusItem = this.machineStatus.find(item => String(item.value) === String(status))
      // 在线是绿色 (success)，离线是红色 (danger)
      return statusItem && statusItem.value === '1' ? 'success' : 'danger'
    },
    // 格式化显示状态
    formatStatus(status) {
      const statusItem = this.machineStatus.find(item => String(item.value) === String(status)) // 确保类型一致
      return statusItem ? statusItem.label : status  // 返回标签文本或默认状态
    },
    async handleSubmit(isEdit = false) {
      const valid = await this.$refs.ruleForm.validate();
      if (valid) {
        const action = isEdit ? updateExecMachine : createExecMachine;
        await action(this.ruleForm)
        this.$message.success(isEdit ? '编辑成功' : '创建成功');
        this.dialogVisible = false;
        this.getMachineList();
      }
    },

    submitForm() {
      this.handleSubmit(false);
    },

    editForm() {
      this.handleSubmit(true);
    },

    handleDelete(row) {
      this.$confirm('此操作将永久删除该主机, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteExecMachine({id: row.id}).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getMachineList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      })
    }
  }
}
</script>
