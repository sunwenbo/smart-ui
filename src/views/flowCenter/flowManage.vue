<template>
  <div class="app-container">
    <el-card>
      <el-button v-waves style="margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="createFlowDialog">
        {{ $t('table.createFlow') }}
      </el-button>
      <el-input v-model="searchContent" :placeholder="inputPlaceholder" style="width: 400px;" @keyup.enter.native="flowSearch">
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
        <el-button slot="append" icon="el-icon-search" @click="flowSearch" />
      </el-input>
      <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset"/>
      <el-button v-waves :loading="downloadDialogVisible" style="margin-left: 10px;" icon="el-icon-download" @click="toggleDownloadDialog(true)">
        {{ $t('table.export') }}
      </el-button>
    </el-card>
    <el-card>
      <el-table v-loading="listLoading" :data="filteredData" border fit style="width: 100%;position: relative; height: 100%;" stripe @sort-change="sortChange">
        <el-table-column :label="$t('table.id')" fixed="left" min-width="50px" align="center" prop="id" />
        <el-table-column :label="$t('table.name')" min-width="150px" align="center" prop="name" />
        <el-table-column :label="$t('table.description')" width="80px" align="center" prop="description">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-more" @click="toggleDescDialog(scope.row.description)" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.category')" min-width="130px" align="center" prop="categoryId" :formatter="categoryFormatter" />
        <el-table-column :label="$t('table.creator')" min-width="130px" align="center" prop="creator" />
        <el-table-column :label="$t('table.regenerator')" min-width="130px" align="center" prop="regenerator" />
        <el-table-column :label="$t('table.createdAt')" min-width="170px" align="center" prop="createdAt" />
        <el-table-column :label="$t('table.updatedAt')" min-width="170px" align="center" prop="updatedAt" />
        <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="240px">
          <template slot-scope="scope">
            <el-button
                v-permisaction="['process:admin:manager:unbind']"
                size="mini"
                type="text"
                icon="fa fa-unlink"
                @click="handleUnbind(scope.row)"
            >解绑</el-button>
            <el-button
                v-permisaction="['process:admin:manager:clone']"
                size="mini"
                type="text"
                icon="el-icon-receiving"
                @click="handleClone(scope.row)"
            >克隆</el-button>
            <el-button
                v-permisaction="['process:admin:manager:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
                v-permisaction="['process:admin:manager:delete']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
            >删除</el-button>

          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.pageSize" @pagination="getFlowList" />
      <el-dialog :title="dialogFlowVisibleName===1?'新建流程':'编辑流程'" :visible.sync="dialogVisible"  ref="ruleForm" :fullscreen="true">
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="名称" prop="name">
                <el-input v-model="ruleForm.name" placeholder="请输入流程名称" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="类别:" prop="categoryId">
                <el-select v-model="ruleForm.categoryId" filterable placeholder="请选择流程分类" style="width: 100%">
                  <el-option
                    v-for="item in categoryLists"
                    :key="item.id"
                    :label="item.chineseName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="通知:">
                <el-select v-model="ruleForm.notice" multiple filterable clearable placeholder="请选择通知方式" style="width: 100%">
                  <el-option label="邮件" :value="1" />
                  <el-option label="飞书" :value="2" />
                  <el-option label="电话" :value="3" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="开启留言:">
                <el-switch v-model="ruleForm.comments" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="开启评分:">
                <el-switch v-model="ruleForm.ratings" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="描述" prop="description">
            <el-input
                v-model="ruleForm.description"
                placeholder="请输入流程描述"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4}"
                style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="流程" prop="structure">
            <div style="border-radius: 4px; overflow:hidden">
              <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;" @click="()=>{this.$refs['wfd'].graph.saveXML()}">导出XML</el-button>
              <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;" @click="()=>{this.$refs['wfd'].graph.saveImg()}">导出图片</el-button>
              <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;" @click="()=>{this.modalVisible=true}">查看流程图</el-button>
              <WfdDesign
                  ref="wfd"
                  v-if="wfdDesignRefresh"
                  :isView=false
                  :data="ruleForm.structure"
                  :height="600"
                  :users="users"
                  :roles="roles"
                  :groups="groups"
                  :tasks="taskListData"
                  :execMachine="execMachine"
                  :categorys="categoryLists"
                  :departments="departments"
                  :lang="lang"
              />
            </div>
          </el-form-item>
        </el-form>
        <span slot="footer" >
          <el-button type="primary" @click="dialogFlowVisibleName===1?submitForm('ruleForm'):editForm('ruleForm')">提交</el-button>
          <el-button type="warning" @click="dialogVisible = false">取 消</el-button>
        </span>
      </el-dialog>
      <el-dialog title="查看流程图" :visible.sync="modalVisible" width="60%">
        <WfdDesign ref="wfd" :data="ruleForm.structure" :height="300" isView />
      </el-dialog>
      <el-dialog :visible.sync="descDialogVisible" title="描述信息" width="30%">
        <span>{{ descriptionDialogContent }}</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="warning" @click="toggleDescDialog()">关闭</el-button>
        </span>
      </el-dialog>
      <el-dialog :visible.sync="unbindDialogVisible" title="解绑确认" width="30%">
        <span>{{ descriptionDialogContent }}</span>
        <span>确定要解绑绑定的所有模板吗？</span>
        <div>流程名称: {{ currentFlow ? currentFlow.name : '' }}</div>
        <span slot="footer" class="dialog-footer">
          <el-button type="warning" @click="cancelUnbind">取消</el-button>
          <el-button type="primary" @click="confirmUnbind">确定</el-button>
        </span>
      </el-dialog>
      <el-dialog title="下载提示" :visible.sync="downloadDialogVisible" width="30%" :before-close="() => toggleDownloadDialog(false)">
        <span>确认要导出数据吗？</span>
        <span slot="footer" class="dialog-footer">
        <el-button type="warning" @click="toggleDownloadDialog(false)">取 消</el-button>
        <el-button type="primary" @click="handleDownload">确 定</el-button>
      </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>

import waves from '@/directive/waves'
import { listUser } from '@/api/admin/sys-user'
import { listRole } from '@/api/admin/sys-role'
import { categoryList, flowTemplateList } from '@/api/smart/flowCenter'
import {parseTime} from "@/utils";
import {createFlow, deleteFlow, flowDetails, getFlowList, updateFlow, cloneFlow } from "@/api/smart/flowManage";
import {getDeptList} from "@/api/admin/sys-dept";
import {getTaskList} from "@/api/smart/taskCenter";
import {getExecMachine} from '@/api/smart/execMachine'
export default {
  name: 'FlowManage',
  components: {
    WfdDesign: () => import('@/components/wfd/components/Wfd')
  },
  directives: {waves},

  data() {
    return {
      modalVisible:false,
      searchType: 'name', // 默认搜索类型为名称
      categoryLists: [], // 获取类别
      flowTemplateLists: [], // 获取所有模板
      flowDataList: [], // 保存流程数据
      filteredData: [], // 保存过滤后的数据
      descDialogVisible: false, // 描述对话窗
      descriptionDialogContent: '', // 描述字段内容
      downloadDialogVisible: false, // 对话框是否可见
      unbindDialogVisible: false,
      searchContent: '',
      currentFlow: null,
      queryParams: {
        page: 1,
        pageSize: 10
      },
      // 遮罩层
      listLoading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 是否显示弹出层
      dialogVisible: false,
      // 查询参数
      structureValue: [],
      users: [],
      roles: [],
      groups: [],
      lang: 'zh',
      departments: [],
      taskListData: [],
      execMachine: [],
      wfdDesignRefresh: true,
      dialogFlowVisibleName: undefined,
      ruleForm: {},
      rules: {
        name: [
          {required: true, message: '请输入流程名称', trigger: 'blur'}
        ],
        categoryId: [
          {required: true, message: '请选择流程类别', trigger: 'blur, change'}
        ],
        structure: [
          {required: true, message: '请设计流程', trigger: 'blur'}
        ],
        description: [
          {required: true, message: '请输入流程描述', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getFlowList()
    this.getCategoryList()
  },
  computed: {
    inputPlaceholder() {
      return this.searchType === 'name' ? '请输入流程名称' : '请输入ID'
    }
  },
  methods: {
    /** 查询流程列表 */
    getFlowList() {
      this.listLoading = true
      getFlowList(this.queryParams).then(response => {
        this.flowDataList = response.data.list
        this.filteredData = this.flowDataList
        this.total = response.data.count
        this.listLoading = false
      }).catch(error => {
        console.error("Error fetching flow list:", error)
        this.listLoading = false
      })
    },
    // 获取任务列表
    getTaskList() {
      getTaskList().then(response => {
        this.taskListData = response.data.list
      })
    },
    // 获取执行节点
    getMachineList() {
      getExecMachine().then(response => {
        this.execMachine = response.data.list
      })
    },
    // 获取部门
    getDepartments() {
      getDeptList().then(response => {
        this.departments = response.data
      })
    },
    // 获取分类
    getCategoryList() {
      categoryList().then(response => {
        this.categoryLists = response.data.list
      })
    },
    // 获取模板
    getTemplatesList() {
      flowTemplateList().then(response => {
        this.flowTemplateLists = response.data.list
      })
    },
    // 获取用户
    getUsers() {
      listUser({
        pageSize: 999999
      }).then(response => {
        // 获取用户数据
        const users = response.data.list;
        // 仅保留 userId 和 username
        this.users = users.map(user => ({
          id: user.userId,
          name: user.nickName
        }));
      })
    },
    getRoles() {
      listRole({
        pageSize: 999999
      }).then(response => {
        this.roles = response.data.list
      })
    },
    getFlowInitData() {
      this.getTemplatesList()
      this.getUsers()
      this.getRoles()
      this.getDepartments()
      this.getTaskList()
      this.getMachineList()
    },
    createFlowDialog() {
      this.getFlowInitData()
      this.ruleForm =  {
        id: undefined,
        name: '',
        structure: {nodes: [], edges: [] },
        categoryId: undefined,
        notice: [],
        description: ''
      }
      this.dialogFlowVisibleName = 1
      this.dialogVisible = true
      this.wfdDesignRefresh = false
      this.$nextTick(() => {
        this.wfdDesignRefresh = true
      })
    },
    handleEdit(row) {
      this.getFlowInitData()
      this.dialogFlowVisibleName = 2
      this.wfdDesignRefresh = false
      this.dialogVisible = true
      flowDetails(row.id).then(response => {
        this.ruleForm = {
          id: response.data.id,
          name: response.data.name,
          categoryId: response.data.categoryId,
          comments: response.data.comments,
          ratings: response.data.ratings,
          notice: response.data.notice,
          structure: response.data.structure,
          description: response.data.description
        }
        this.wfdDesignRefresh = false
        this.$nextTick(() => {
          this.wfdDesignRefresh = true
        })
      })
    },
    verifyProcess(structureValue) {
      for (var r of structureValue.nodes) {
        if (r.label === undefined || r.label === null || r.label === '') {
          return '流程节点标题不能为空'
        }
        if (r.clazz === 'userTask' || r.clazz === 'receiveTask') {
          if (r.assignType === undefined || r.assignType === null || r.assignType === '') {
            return '审批节点或处理节点的处理人类型不能为空'
          } else if (r.assignValue === undefined || r.assignValue === null || r.assignValue === '' || r.assignValue.length === 0) {
            return '审批节点或处理节点的处理人不能为空'
          }
        }
      }
      for (var e of structureValue.edges) {
        if (e.seq === undefined || e.seq === null || e.seq === '') {
          return '流转序号不能为空'
        } else if (e.label === undefined || e.label === null || e.label === '') {
          return '流转标题不能为空'
        }
        // } else if (e.flowProperties === undefined || e.flowProperties === null || e.flowProperties === '') {
        //   return '流转属性不能为空'
        // }
      }
      return ''
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const structureValue = this.$refs.wfd.graph.save()
          // 校验流程属性
          const r = this.verifyProcess(structureValue)
          if (r !== '') {
            this.$message.error(r)
            return
          }
          if (structureValue.nodes.length > 0 && structureValue.edges.length > 0) {
            this.ruleForm.structure = structureValue
            createFlow(this.ruleForm).then(response => {
              if (response.code === 200) {
                this.$showSuccess('流程创建成功')
                this.getFlowList()
                this.dialogVisible = false
              }else {
                this.$showError('创建流程失败，请完善流程')
              }
              this.getFlowList()
              this.dialogVisible = false
            })
          } else {
            this.$message.error('没有流程数据，请完善流程')
          }
        }
      })
    },
    editForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const structureValue = this.$refs.wfd.graph.save()
          const r = this.verifyProcess(structureValue)
          if (r !== '') {
            this.$message.error(r)
            return
          }
          if (structureValue.nodes.length > 0 && structureValue.edges.length > 0) {
            updateFlow({
              id: this.ruleForm.id,
              name: this.ruleForm.name,
              categoryId: this.ruleForm.categoryId,
              comments: this.ruleForm.comments,
              ratings: this.ruleForm.ratings,
              notice: this.ruleForm.notice,
              structure: structureValue,
              description: this.ruleForm.description
            }).then(response => {
              this.$showSuccess(`${this.ruleForm.name}流程更新成功`)
              this.getFlowList()
              this.dialogVisible = false
            })
          } else {
            this.$notify({
              title: '错误',
              message: '没有流程数据，请完善流程',
              type: 'error'
            })
          }
        }
      })
    },
    handleQuery() {
      this.queryParams.page = 1
      this.queryParams.pageSize = 10
      this.getFlowList()
    },
    handleReset() {
      this.listLoading = true;
      setTimeout(() => {
        this.searchContent = ''
        this.getFlowList()
        this.listLoading = false;
      }, 500);
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteFlow({id: row.id}).then(response => {
          if (response !== undefined) {
            this.getFlowList()
            this.$message({
              type: 'success',
              message: '流程已删除!'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleUnbind(row) {
      this.currentFlow = row
      this.unbindDialogVisible = true;
    },
    confirmUnbind() {
      if (this.currentFlow) {
        // 将所有模板都解绑
        this.currentFlow.template = []
        updateFlow(this.currentFlow).then(response => {
          if (response !== undefined) {
            this.getFlowList();
            this.$message({
              type: 'success',
              message: '流程已解绑!'
            });
          }
          this.unbindDialogVisible = false;
        });
      }
    },
    cancelUnbind() {
      this.unbindDialogVisible = false;
      this.$message({
        type: 'info',
        message: '已取消解绑'
      });
    },
    handleCommand(command) {
      this.searchType = command
    },
    toggleDownloadDialog(visible) {
      this.downloadDialogVisible = visible;
    },
    handleClone(row) {
      this.$confirm(`确认克隆流程 < ${row.name} > ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        cloneFlow(row.id).then(() => {
          this.getFlowList()
          this.$message({
            type: 'success',
            message: '流程已克隆!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    toggleDescDialog(description = null) {
      this.descriptionDialogContent = description;
      this.descDialogVisible = !this.descDialogVisible;
    },
    sortChange({ prop, order }) {
      this.listLoading = true // 开始加载状态
      // 判断排序的字段是 id
      if (prop === 'id') {
        // 根据排序的顺序对数据进行排序
        this.orderWorks.sort((a, b) => {
          // 如果是升序，返回比较结果
          if (order === 'ascending') {
            return a.id - b.id
          } else { // 否则是降序，返回比较结果的负值
            return b.id - a.id
          }
        })
      }
      this.listLoang = false // 停止加载状态
    },
    flowSearch() {
      this.listLoading = true;
      setTimeout(() => {
        if (!this.searchContent) {
          // 如果搜索内容为空，则显示所有数据
          this.filteredData = this.flowDataList;
        } else {
          if (this.searchType === 'name') {
            this.filteredData = this.flowDataList.filter(item => item.name.includes(this.searchContent));
          } else if (this.searchType === 'id') {
            this.filteredData = this.flowDataList.filter(item => item.id.toString() === this.searchContent);
          }
        }
        this.listLoading = false;
      }, 500);
    },
    categoryFormatter(row, column, cellValue) {
      const category = this.categoryLists.find(item => item.id === cellValue);
      return category ? category.chineseName : cellValue;
    },
    async handleDownload() {
      this.toggleDownloadDialog(false);
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '名称', '创建人','更新人','描述信息', '类别', '创建时间', '更新时间']
        const filterVal = ['id', 'name', 'creator', 'regenerator','description', 'categoryId', 'createdAt', 'updatedAt']
        const data = this.formatJson(filterVal, this.flowDataList) // 确保传递数据
        // 获取当前日期并格式化为 YYYY-MM-DD
        const currentDate = new Date().toISOString().slice(0, 10)
        const filename = `flowMange-list-${currentDate}`
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename
        })
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
