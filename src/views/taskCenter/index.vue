<template>
  <div class="app-container">
    <el-card>
      <el-button v-waves style="margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="createTaskDialog">
        {{ $t('table.createTask') }}
      </el-button>
      <el-input v-model="searchContent" :placeholder="inputPlaceholder" style="width: 400px;" @keyup.enter.native="taskSearch">
        <el-dropdown slot="prepend" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ searchType === 'name' ? '名称' : 'ID' }}
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown" class="fixed-dropdown-menu">
            <el-dropdown-item command="name">名称</el-dropdown-item>
            <el-dropdown-item command="id">ID</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button slot="append" icon="el-icon-search" @click="taskSearch" />
      </el-input>
      <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset"/>
      <el-button v-waves :loading="downloadDialogVisible" style="margin-left: 10px;" icon="el-icon-download" @click="toggleDownloadDialog(true)">
        {{ $t('table.export') }}
      </el-button>
    </el-card>
    <el-card>
      <el-table v-loading="listLoading" :data="taskDataList" border fit style="width: 100%;position: relative; height: 100%;" stripe @sort-change="sortChange">
        <el-table-column :label="$t('table.id')" min-width="20px" align="center" prop="id" />
        <el-table-column :label="$t('table.name')" min-width="80px" align="center" prop="name" />
        <el-table-column :label="$t('table.taskType')" min-width="30px" align="center" prop="taskType" />
        <el-table-column :label="$t('table.interpreter')" min-width="100px" align="center" prop="interpreter" />
        <el-table-column :label="$t('table.creator')" min-width="30px" align="center" prop="creator" />
        <el-table-column :label="$t('table.regenerator')" min-width="30px" align="center" prop="regenerator" />
        <el-table-column :label="$t('table.createdAt')" min-width="60px" align="center" prop="createdAt" />
        <el-table-column :label="$t('table.updatedAt')" min-width="60px" align="center" prop="updatedAt" />
        <el-table-column :label="$t('table.actions')" align="center" width="150">
          <template slot-scope="scope">
            <el-button v-permisaction="['process:admin:manager:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button v-permisaction="['process:admin:manager:delete']" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getTaskList" />
      <el-dialog :title="dialogTaskVisibleName === 1 ? '新建任务' : '编辑任务'" :visible.sync="dialogVisible" width="70%" style="margin-top: 0">
        <div>
          <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
            <el-col :span="24">
              <el-form-item label="名称:" prop="name">
                <el-input v-model="ruleForm.name" placeholder="请输入任务名称" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="类型:" prop="taskType">
                  <el-select v-model="ruleForm.taskType" filterable placeholder="请选择任务类型" style="width: 100%" @change="onTaskTypeChange">
                    <el-option v-for="item in taskType" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="解释器:" prop="interpreter">
                  <el-select v-model="ruleForm.interpreter" filterable placeholder="请选择解释器" style="width: 100%">
                    <el-option v-for="item in interpreterOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="描述:" prop="description">
              <el-input v-model="ruleForm.description" placeholder="请输入流程描述" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" style="width: 100%" />
            </el-form-item>
            <el-form-item label="内容:" prop="content">
              <codemirror v-model="ruleForm.content" :options="editorOptions" class="code-editor" />
            </el-form-item>
          </el-form>

          <div class="el-dialog__footer">
            <el-button type="primary" @click="dialogTaskVisibleName === 1 ? submitForm('ruleForm') : editForm('ruleForm')">提交</el-button>
            <el-button type="warning" @click="dialogVisible = false">取消</el-button>
          </div>
        </div>
      </el-dialog>

      <el-dialog title="下载提示" :visible.sync="downloadDialogVisible" width="30%" :before-close="() => toggleDownloadDialog(false)">
        <span>确认要导出数据吗？</span>
        <span slot="footer">
          <el-button type="warning" @click="toggleDownloadDialog(false)">取消</el-button>
          <el-button type="primary" @click="handleDownload">确定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { getTaskList, createTask, updateTask,deleteTask } from '@/api/smart/taskCenter'

import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/shell/shell.js'

export default {
  name: 'TaskList',
  directives: { waves },

  data() {
    return {
      searchType: 'name',
      taskType: [],
      taskDataList: [],
      downloadDialogVisible: false,
      searchContent: '',
      queryParams: {
        pageIndex: 1,
        pageSize: 10
      },
      listLoading: true,
      editorOptions: {
        mode: 'shell',
        lineNumbers: true,
        theme: 'default',
        tabSize: 2,
        lineWrapping: true,
        viewportMargin: Infinity
      },
      interpreterList: {
        shell: [
          { value: '/bin/bash', label: '/bin/bash' },
          { value: '/bin/sh', label: '/bin/sh' }
        ],
        python: [
          { value: '/usr/bin/python3', label: '/usr/bin/python3' },
          { value: '/usr/bin/python2', label: '/usr/bin/python2' }
        ],
        javascript: [
          { value: 'node', label: 'Node.js' },
          { value: 'deno', label: 'Deno' }
        ]
      },
      interpreterOptions: [],
      total: 0,
      dialogVisible: false,
      dialogTaskVisibleName: undefined,
      ruleForm: {
        id: undefined,
        name: '',
        taskType: '',
        interpreter: '',
        description: '',
        content: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入流程名称', trigger: 'blur' }
        ],
        taskType: [
          { required: true, message: '请选择类型', trigger: 'blur' }
        ],
        interpreter: [
          { required: true, message: '请选择解释器', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.getTaskList()
    this.getTaskType()
  },

  computed: {
    inputPlaceholder() {
      return this.searchType === 'name' ? '请输入任务名称' : '请输入任务ID'
    }
  },

  methods: {
    handleCommand(command) {
      this.searchType = command
    },

    onTaskTypeChange(value) {
      this.ruleForm.interpreter = ''
      switch (value) {
        case 'Shell':
          this.interpreterOptions = this.interpreterList.shell
          break
        case 'Python':
          this.interpreterOptions = this.interpreterList.python
          break
        case 'JavaScript':
          this.interpreterOptions = this.interpreterList.javascript
          break
        default:
          this.interpreterOptions = []
      }
    },

    createTaskDialog() {
      this.dialogTaskVisibleName = 1
      this.dialogVisible = true
    },

    handleEdit(row) {
      this.dialogTaskVisibleName = 2
      this.dialogVisible = true
      this.ruleForm = { ...row }
      this.onTaskTypeChange(this.ruleForm.taskType)
    },

    taskSearch() {
      this.queryParams.pageIndex = 1
      this.getTaskList()
    },

    handleReset() {
      this.searchContent = ''
      this.queryParams.pageIndex = 1
      this.getTaskList()
    },

    toggleDownloadDialog(value) {
      this.downloadDialogVisible = value
    },

    handleDownload() {
      this.downloadDialogVisible = false
      // Add your download logic here
    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          createTask(this.ruleForm).then(() => {
            this.$message.success('创建成功')
            this.dialogVisible = false
            this.getTaskList()
          }).catch((error) => {
            this.$message.error(error)
          })
        }
      })
    },

    editForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          updateTask(this.ruleForm).then(() => {
            this.$message.success('编辑成功')
            this.dialogVisible = false
            this.getTaskList()
          }).catch((error) => {
            this.$message.error(error)
          })
        }
      })
    },

    getTaskType() {
      // Retrieve task type data from API or static configuration
      this.taskType = [
        { value: 'Shell', label: 'Shell' },
        { value: 'Python', label: 'Python' },
        { value: 'JavaScript', label: 'JavaScript' }
      ]
    },

    getTaskList() {
      this.listLoading = true
      const params = {
        page: this.queryParams.pageIndex,
        size: this.queryParams.pageSize,
        [this.searchType]: this.searchContent
      }
      getTaskList(params).then(response => {
        this.taskDataList = response.data
        this.total = response.data.length
      }).finally(() => {
        this.listLoading = false
      })
    },

    handleDelete(row) {
      this.$confirm('此操作将永久删除该任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTask(row.id).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getTaskList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      })
    },

    sortChange({ prop, order }) {
      this.queryParams.sort = prop
      this.queryParams.order = order
      this.getTaskList()
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-table th {
  background-color: #f5f7fa; /* 你想要的背景颜色 */
  color: #333; /* 字体颜色 */
}

::v-deep .el-dialog{
  .el-dialog__header{
    position:sticky;
    top: 0;
    left: 0;
    z-index: 10;
    padding: 15px;
    background: #f5f7fa;
  }
  .el-dialog__body {
    padding-top: 20px;
    padding-bottom: 60px; /* 调整为按钮的高度 */
  }

  .el-dialog__footer {
    position: absolute;
    right: 0;
    left: 0;
    padding: 15px;
    background: #f5f7fa; /* 设置按钮行背景色为灰色 */
    border-top: 1px solid #e4e7ed;
    text-align: right;
  }

  .el-dialog__footer .el-button {
    margin-left: 10px; /* 按钮之间的间距 */
  }
}

/* 自定义样式 */
.code-editor {
  height: 303px;              /* 设置容器高度 */
  border: 1px solid #dcdfe6;  /* 增加边框 */
  border-radius: 2px;         /* 可选：圆角 */
  padding: 1px;               /* 可选：内边距 */
  box-sizing: border-box;     /* 确保内边距不会影响整体尺寸 */
  line-height: 20px;          /* 设置行高 */
  font-size: 14px;            /* 字体大小 */
}
</style>
