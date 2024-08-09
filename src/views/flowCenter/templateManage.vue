<template>
  <div class="app-container" style="width: 100%;">
    <el-card>
      <div class="baseInfo-window">
        <el-button v-waves style="margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="createTempLateDialog">
          {{ $t('table.createTemplate') }}
        </el-button>
        <el-input v-model="searchContent" :placeholder="inputPlaceholder" style="width: 400px;" @keyup.enter.native="templateSearch">
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
          <el-button slot="append" icon="el-icon-search" @click="templateSearch" />
        </el-input>
        <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset" />
        <el-button v-waves :loading="downloadDialogVisible" style="margin-left: 10px;" icon="el-icon-download" @click="openDownloadDialog">
          {{ $t('table.export') }}
        </el-button>
      </div>
    </el-card>
    <el-card>
      <div class="form-window">
        <el-table v-loading="listLoading" :data="filteredData" border fit style="width: 100%;position: relative; height: 100%;" stripe @sort-change="sortChange">
          <el-table-column :label="$t('table.id')" min-width="25px" align="center" prop="id" />
          <el-table-column :label="$t('table.name')" min-width="80px" align="center" prop="name" />
          <el-table-column :label="$t('table.creator')" min-width="30px" align="center" prop="creator" />
          <el-table-column :label="$t('table.regenerator')" min-width="30px" align="center" prop="regenerator" />
          <el-table-column :label="$t('table.category')" min-width="40px" align="center">
            <template slot-scope="scope">
              {{ getCategoryName(scope.row.categoryId) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.bindFlow')" min-width="50px" align="center">
            <template slot-scope="scope">
              {{ getFlowNameById(scope.row.bindFlow) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.description')" width="80px" align="center" prop="description">
            <template slot-scope="scope">
              <el-button type="text" icon="el-icon-more" @click="openDialog(scope.row.description)" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.bindCount')" min-width="30px" align="center" prop="bindCount" />
          <el-table-column :label="$t('table.createdAt')" min-width="40px" align="center" prop="createdAt" />
          <el-table-column :label="$t('table.updatedAt')" min-width="40px" align="center" prop="updatedAt" />
          <el-table-column :label="$t('table.actions')" align="center" width="200px">
            <template v-slot="{ row }">
              <el-button type="text" icon="el-icon-copy-document" @click="handleCopy(row)">
                {{ $t('table.copy') }}
              </el-button>
              <el-button type="text" icon="el-icon-edit" @click="openUpdateDialog(row)">
                {{ $t('table.update') }}
              </el-button>
              <el-button type="text" icon="el-icon-delete" @click="handleDelete(row)">
                {{ $t('table.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="tempLateQuery.page" :limit.sync="tempLateQuery.pageSize" @pagination="getFlowTemplateList" />
      </div>
    </el-card>
    <el-dialog :visible.sync="templateDialogVisible" title="模板管理" :fullscreen="true">
      <el-form ref="vFormRef" :model="currentData" :rules="tempLateRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="模板名称:" prop="name">
              <el-input v-model="currentData.name" placeholder="请输入英文名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类别:" prop="category">
              <el-select v-model="currentData.categoryId" style="width: 80%" >
                <el-option v-for="(category, index) in filteredCategory" :key="index" :label="category.chineseName" :value="category.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="绑定流程:" prop="bindFlow">
              <el-select v-model="currentData.bindFlow" style="width: 80%" >
                <el-option v-for="(flow, index) in filteredFlow" :key="index" :label="flow.name" :value="flow.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="18">
            <el-form-item label="描述信息:" prop="description">
              <el-input v-model="currentData.description" type="textarea" :rows="2" placeholder="请输入描述信息" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <v-form-designer ref="vfDesigner" v-model="currentData.formData" :designer-config="designerConfig">
              <template v-slot:footer>
                <el-button type="text" @click="submitForm">
                  <i class="el-icon-finished" />保存
                </el-button>
              </template>
            </v-form-designer>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
    <el-dialog :visible.sync="descDialogVisible" title="描述信息" width="30%" :before-close="closeDescDiglog">
      <span>{{ descriptionDialogContent }}</span>
      <span slot="footer">
        <el-button type="warning" @click="descDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog title="下载提示" :visible.sync="downloadDialogVisible" width="30%" :before-close="closeDownloadDiglog">
      <span>确认要导出数据吗？</span>
      <span slot="footer">
        <el-button type="warning" @click="downloadDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDownload">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination/index.vue'
import { Message } from 'element-ui'
import {
  categoryList, copyFlowTemplate, createFlowTemplate,
  deleteFlowTemplate, flowTemplateList, updateFlowTemplate
} from '@/api/smart/flowCenter'

export default {
  name: 'TemplateManage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      total: 0,
      searchType: 'name', // 默认搜索类型为名称
      downloadDialogVisible: false, // 对话框是否可见
      descriptionDialogContent: '', // 描述字段内容
      descDialogVisible: false, // 对话框是否可见
      templateDialogVisible: false,
      isUpdate: false,
      designerConfig: {
        languageMenu: true,
        toolbarMinWidth: 470
      },
      listLoading: false,
      searchContent: '', // 搜索框内容默认为空
      getTempLateData: [], // 保存table数据
      filteredData: [], // 保存过滤后的数据
      currentData: [],
      flowListResponse: [], // 获取流程
      creTempLateQuery: {
        name: '',
        description: '',
        bindCount: 0,
        categoryId: undefined,
        bindFlow: undefined,
        formData: {}
      }, // 创建模板
      updTempLateQuery: {}, // 更新模板
      copyTempLateData: {
        name: '',
        description: '',
        creator: '',
        bindCount: 0,
        categoryId: undefined,
        bindFlow: undefined,
        formData: {}
      }, // 复制模板
      tempLateQuery: {
        page: 1,
        pageSize: 10,
      }, // 查询模板
      tempLateRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        category:  [{ required: false, message: '请选择类别', trigger: 'blur' }],
        description: [{ required: true, message: '请输入描述信息', trigger: 'blur' }]
      }, // 表单审核
      categoryList: [] // 保存模板类型
    }
  },
  computed: {
    inputPlaceholder() {
      return this.searchType === 'name' ? '请输入名称信息' : '请输入ID'
    },
    filteredCategory() {
      return this.categoryList.map(item => ({
        chineseName: item.chineseName,
        id: item.id
      }))
    },
    filteredFlow() {
      return this.flowListResponse.map(item => ({
        name: item.name,
        id: item.id
      }))
    },
    getCategoryName() {
      return (categoryId) => {
        const category = this.categoryList.find(cat => cat.id === categoryId)
        return category ? category.chineseName : 'Unknown'
      }
    }
  },
  // watch: {
  //   getTempLateData: {
  //     deep: true,
  //     handler() {
  //       // 在 tempLateData 对象发生变化时触发搜索
  //       this.templateSearch()
  //     }
  //   }
  // },
  mounted() {
    this.getCategoryList()
    // 在组件创建时自动发送请求获取模板数据
    this.getFlowTemplateList()
    this.getFlowList({ pageIndex: 1, pageSize: 9999 }).then(response => {
      this.flowListResponse = response.data
    })
  },
  methods: {
    getFlowTemplateList() {
      this.listLoading = true
      flowTemplateList (
        this.tempLateQuery
      ).then(response => {
        this.getTempLateData = response.data
        this.total = this.getTempLateData.length
        this.filteredData = this.getTempLateData
        this.listLoading = false
      })
    },
    getCategoryList() {
      this.listLoading = true
      categoryList(
        this.tempLateQuery
      ).then(response => {
        this.categoryList = response.data
      })
      this.listLoading = false
    },
    async createFlowTemplate() {
      this.creTempLateQuery = {
        ...this.creTempLateQuery,
        ...this.currentData,
        formData: this.$refs.vfDesigner.getFormJson()
      };

      this.listLoading = true
      try {
        await createFlowTemplate(this.creTempLateQuery).then(response => {
          if (response.code === 200) {
            this.getFlowTemplateList()
            this.$showSuccess(`${this.creTempLateQuery.name} 模板创建成功`)
          } else {
            this.$showError('创建出错，请重试或者联系管理员', response.data)
          }
        })
      } catch (error) {
        console.error('Failed to fetch FlowTemplate:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    // 获取流程名称
    getFlowNameById(id) {
      const flow = this.flowListResponse.find(item => item.id === id)
      return flow ? flow.name : '';
    },
    async DeleteFlowTemplate(row) {
      this.listLoading = true
      try {
        deleteFlowTemplate({id: row.id}).then(response => {
          if (response.code === 200) {
            this.$showSuccess(`${row.name} 模板删除成功`)
            this.getFlowTemplateList()
            this.updateDialog = false
          } else {
            this.$showError('删除出错，请重试或者联系管理员', response.data)
          }
        })
      } catch (error) {
        console.error('Failed to delete FlowTemplate:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    async updateFlowTemplates(row) {
      try {
        const { createdAt, updatedAt, ...cleanItem } = row
        this.updTempLateQuery = cleanItem
        const response = await updateFlowTemplate(this.updTempLateQuery)
          if (response.code === 200) {
            this.getFlowTemplateList()
            this.$showSuccess(`${this.updTempLateQuery.name} 模板更新成功`)
          } else {
            this.$showError('更新出错，请重试或者联系管理员', response.data)
          }
      } catch (error) {
        console.error('Failed to update FlowTemplate:', error)
      }
    },
    getPaginatedData(data, page, pageSize) {
      const start = (page - 1) * pageSize
      const end = page * pageSize
      return data.slice(start, end)
    },
    templateSearch() {
      this.listLoading = true
      setTimeout(() => {
        if (this.searchContent) {
          if (this.searchType === 'name') {
            this.filteredData = this.getTempLateData.filter(item => item.name.includes(this.searchContent))
          } else if (this.searchType === 'id') {
            this.filteredData = this.getTempLateData.filter(item => item.id.toString() === this.searchContent)
          }
        } else {
          this.handleReset()
          this.filteredData = this.getPaginatedData(this.getTempLateData, this.tempLateQuery.page, this.tempLateQuery.pageSize)
        }
        this.listLoading = false
      }, 500)
    },
    handleReset() {
      this.listLoading = true
      setTimeout(() => {
        this.searchContent = ''
        this.getFlowTemplateList()
        this.listLoading = false
      }, 400)
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
      this.listLoading = false // 停止加载状态
    },
    async handleCopy(row) {
      this.$confirm('是否确复制该模版?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.copyTempLateData.name = `${row.name}_copy`
        this.copyTempLateData.description = row.description
        this.copyTempLateData.formData = row.formData
        this.copyTempLateData.bindFlow = row.bindFlow
        this.copyTempLateData.categoryId = row.categoryId
        try {
          await copyFlowTemplate(this.copyTempLateData).then(response => {
            if (response.code === 200) {
              this.getFlowTemplateList()
              this.$showSuccess(`${this.copyTempLateData.name} 模板复制成功`)
            } else {
              this.$showError('创建出错，请重试或者联系管理员', response.data)
            }
          })
        } catch (error) {
          console.error('Failed to fetch FlowTemplate:', error)
        } finally {
          this.listLoading = false // 停止加载状态
        }
      }).catch(() => {
        this.$showinfo('复制已取消')
      })
    },
    createTempLateDialog() {
      // 打开创建表单对话框
      this.currentData = {
        name: '',
        description: '',
        creator: '',
        bindCount: 0,
        formData: {}
      }
      this.templateDialogVisible = true
      this.$nextTick(() => {
        this.$refs.vfDesigner.resetForm() // 重置表单设计器内的表单数据
      })
    },
    openUpdateDialog(row) {
      this.isUpdate = true
      this.templateDialogVisible = true
      this.currentData = { ...row }
      this.$nextTick(() => {
        this.$refs.vfDesigner.setFormJson(row.formData) // 确保表单设计器正确加载表单数据
      })
    },
    submitForm() {
      this.$refs.vFormRef.validate((valid) => {
        if (valid) {
          if (this.isUpdate) {
            // 更新表单
            this.updateFlowTemplates(this.currentData)
            this.isUpdate = false
          } else {
            // 创建表单
            this.createFlowTemplate(this.currentData)
          }
          this.templateDialogVisible = false
        } else {
          console.log('表单校验未通过!')
          return false
        }
      })
    },
    handleDelete(row) {
      // 处理删除操作的逻辑
      this.$confirm('是否确认删除该模板?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.DeleteFlowTemplate(row)
      }).catch(() => {
        this.$showinfo('删除模板已取消')
      })
    },
    openDialog(description) {
      this.descriptionDialogContent = description
      this.descDialogVisible = true
    },
    closeDescDiglog() {
      this.descDialogVisible = false
    },
    handleCommand(command) {
      this.searchType = command
    },
    openDownloadDialog() {
      this.downloadDialogVisible = true
    },
    closeDownloadDiglog() {
      this.downloadDialogVisible = false
    },
    formatJson(filterVal) {
      return this.filteredData.map(row => {
        return filterVal.map(key => {
          if (key === 'category') {
            return this.getCategoryName(row.categoryId)
          }
          return row[key]
        })
      })
    },
    handleDownload() {
      this.downloadDialogVisible = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '名称', '创建人', '类别', '描述信息', '绑定次数', '创建时间', '更新时间']
        const filterVal = ['id', 'name', 'creator', 'category', 'description', 'bindTempLate', 'createdAt', 'updatedAt']
        const data = this.formatJson(filterVal)
        // 获取当前日期并格式化为 YYYY-MM-DD
        const currentDate = new Date().toISOString().slice(0, 10)
        const filename = `template-list-${currentDate}`
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
::v-deep .el-table th {
  background-color: #f5f7fa; /* 你想要的背景颜色 */
  color: #333; /* 字体颜色 */
}

::v-deep .el-container.main-container {
  margin-left: 0!important;
  .main-header {
    display:none;
  }
  .right-toolbar {
    width: 480px !important;
    text-align: left;
  }
}
::v-deep label {
  font-weight: normal;
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
  }
}

.baseInfo-window {
  border: 2px solid #eeeeee;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease-in-out;
}
.baseInfo-window:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-window {
  border: 2px solid #eeeeee;
  padding: 10px;
  height: auto;
  transition: box-shadow 0.3s ease-in-out;
  .pagination-container {
    background: #fff;
    padding: 1px 10px;
    margin-top: 10px;
  }
}
.form-window:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

</style>
