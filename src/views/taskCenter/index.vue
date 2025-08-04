<template>
  <div class="app-container">
    <el-card>
      <div class="baseInfo-window">
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
      </div>
    </el-card>
    <el-card>
      <div class="form-window">
        <el-table v-loading="listLoading" :data="taskDataList" border fit style="width: 100%;position: relative; height: 100%;" stripe >
          <el-table-column :label="$t('table.id')" fixed="left" min-width="50px" align="center" prop="id" />
          <el-table-column :label="$t('table.name')" min-width="130px" align="center" prop="name" />
          <el-table-column :label="$t('table.taskType')" min-width="120px" align="center" prop="taskType" >
            <template slot-scope="scope">
              {{ getTaskTypeName(scope.row.taskType) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.interpreter')" min-width="200px" align="center" prop="interpreter" />
          <el-table-column :label="$t('table.creator')" min-width="110px" align="center" prop="creator" />
          <el-table-column :label="$t('table.regenerator')" min-width="110px" align="center" prop="regenerator" />
          <el-table-column :label="$t('table.createdAt')" min-width="170px" align="center" prop="createdAt" />
          <el-table-column :label="$t('table.updatedAt')" min-width="170px" align="center" prop="updatedAt" />
          <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="200px">
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
      </div>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getTaskList" />
      <el-dialog :title="dialogTaskVisibleName === 1 ? '新建任务' : '编辑任务'" :visible.sync="dialogVisible" width="70%" style="margin-top: 10px">
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="名称:" prop="name">
                <el-input v-model="ruleForm.name" placeholder="请输入任务名称" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
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
          <el-form-item label="内容:" prop="content" style="height: auto">
            <div>
              <codemirror v-model="ruleForm.content" :options="editorOptions" class="code-editor" />
            </div>
          </el-form-item>
        </el-form>
        <span slot="footer" >
          <el-button type="primary" @click="dialogTaskVisibleName === 1 ? submitForm('ruleForm') : editForm('ruleForm')">提交</el-button>
          <el-button type="warning" @click="dialogVisible = false">取消</el-button>
        </span>
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
import 'codemirror/theme/eclipse.css'
import {parseTime} from "@/utils"; // 引入主题样式


export default {
  name: 'TaskList',
  directives: { waves },
  watch: {
    'ruleForm.interpreter': function(newVal) {
      this.updateContent();
    }
  },
  data() {
    return {
      searchType: 'name',
      defaultContentTemplate: `workOrderForm=$1 # 接收工单数据

# 推荐使用 jq 命令来获取 Json 结构对应的键值数据。具体使用方法，还请自行百度。
# 此外，还需注意 jq 命令，若没有还需在任务工作节点安装此命令。

# ------------- 在下面编写您的业务逻辑代码 -------------`,
      interpreterTemplates: {
        shell: `#!/bin/bash\n\n# 在这里编写 shell 脚本`,
        python: `#!/usr/bin/env python3\n\n# 在这里编写 Python 脚本`,
        javascript: `#!/usr/bin/env node\n\n// 在这里编写 JavaScript 脚本`
      },
      interpreterPaths: {
        "/bin/bash": "shell",
        "/usr/bin/python3": "python",
        "node": "javascript"
      },
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
        theme: 'eclipse',
        tabSize: 2,
        lineWrapping: true,
        viewportMargin: Infinity,
        styleActiveLine: true // 启用高亮当前行
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
      originalTaskDataList: [],
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
          { required: true, message: '请输入任务名称', trigger: 'blur' }
        ],
        taskType: [
          { required: true, message: '请选择类型', trigger: 'blur' }
        ],
        interpreter: [
          { required: true, message: '请选择解释器', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入脚本内容', trigger: 'blur' }
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
    getTaskList() {
      this.listLoading = true
      getTaskList(this.queryParams).then(response => {
        this.taskDataList = response.data.list
        this.originalTaskDataList = response.data.list
        this.total = response.data.count
      }).finally(() => {
        this.listLoading = false
      })
    },

    getTaskType() {
      this.getDicts('order_works_task_type').then(response => {
        this.taskType = response.data
      })
    },

    getTaskTypeName(taskType) {
      // 查找 taskTypeList 中的对应项
      const found = this.taskType.find(item => item.value === taskType);
      return found ? found.label : 'Unknown'; // 默认值为 'Unknown'
    },
    handleCommand(command) {
      this.searchType = command
    },

    onTaskTypeChange(taskType) {
      const interpreterMapping = {
        '0': this.interpreterList.shell,
        '1': this.interpreterList.python,
        '2': this.interpreterList.javascript,
      };

      // 更新解释器选项
      this.interpreterOptions = interpreterMapping[taskType] || [];

      // 设置解释器字段，如果任务数据中已有解释器，则赋值
      if (this.ruleForm.interpreter === '') {
        this.ruleForm.interpreter = interpreterMapping[taskType][0]?.value || '';
      }
    },

    updateContent() {
      const { interpreter,content } = this.ruleForm
      const templateType = this.interpreterPaths[interpreter];
      const template = this.interpreterTemplates[templateType] || '';
      // 只有当 content 为空时才设置默认内容
      if (!content) {
        this.ruleForm.content = `${template}\n\n${this.defaultContentTemplate}`;
      }
    },

    createTaskDialog() {
      this.dialogTaskVisibleName = 1
      this.dialogVisible = true
      this.resetForm()
    },

    handleEdit(row) {
      this.dialogTaskVisibleName = 2
      this.dialogVisible = true
      this.ruleForm = {...row}
      // 更新任务类型时的解释器列表
      this.onTaskTypeChange(this.ruleForm.taskType);
      // 如果编辑任务时已有内容，不要覆盖它
      if (!this.ruleForm.content) {
        this.ruleForm.content = this.defaultContentTemplate;  // 仅在内容为空时设置默认模板
      }
    },

    taskSearch() {
      // 搜索功能逻辑
      if (this.searchContent) {
        const searchLower = this.searchContent.toLowerCase();
        if (this.searchType === 'name') {
          this.taskDataList = this.originalTaskDataList.filter(item =>
              item.name.toLowerCase().includes(searchLower)
          );
        } else if (this.searchType === 'id') {
          this.taskDataList = this.originalTaskDataList.filter(item =>
              item.id.toString().includes(this.searchContent)
          );
        }
      } else {
        // 如果搜索内容为空，恢复原始数据
        this.taskDataList = this.originalTaskDataList;
      }
    },
    handleReset() {
      this.listLoading = true
      setTimeout(() => {
        this.searchContent = ''
        this.getTaskList()
        this.listLoading = false
      }, 400)
    },

    toggleDownloadDialog(value) {
      this.downloadDialogVisible = value
    },


    async handleSubmit(isEdit = false) {
      const valid = await this.$refs.ruleForm.validate();
      if (valid) {
        const action = isEdit ? updateTask : createTask;
        await action(this.ruleForm);
        this.$message.success(isEdit ? '编辑成功' : '创建成功');
        this.dialogVisible = false;
        this.getTaskList();
      }
    },

    submitForm() {
      this.handleSubmit(false);
    },

    editForm() {
      this.handleSubmit(true);
    },

    handleDelete(row) {
      this.$confirm('此操作将永久删除该任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTask({id: row.id}).then(() => {
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
    resetForm() {
      this.ruleForm = {
        name: '',
        taskType: '',
        interpreter: '',
        description: '',
        content: this.defaultContentTemplate // 设置默认内容
      };
    },
    formatJson(filterVal) {
      return this.taskDataList.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    handleDownload() {
      this.downloadDialogVisible = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '名称',  '类型', '解释器', '描述信息','创建人', '更新人', '创建时间', '更新时间']
        const filterVal = ['id', 'name','taskType', 'interpreter', 'description', 'creator', 'regenerator',  'createdAt', 'updatedAt']
        const data = this.formatJson(filterVal)
        // 获取当前日期并格式化为 YYYY-MM-DD
        const currentDate = new Date().toISOString().slice(0, 10)
        const filename = `task-list-${currentDate}`
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename
        })
        this.downloadDialogVisible = false
      })
    }

  }
}
</script>

<style scoped lang="scss">

/* 自定义样式 */
.code-editor {
  /* 设置容器高度 */
  border: 1px solid #dcdfe6;  /* 增加边框 */
  border-radius: 2px;         /* 可选：圆角 */
  padding: 1px;               /* 可选：内边距 */
  box-sizing: border-box;     /* 确保内边距不会影响整体尺寸 */
  line-height: 23px;          /* 设置行高 */
  font-size: 15px;            /* 字体大小 */
}
</style>
