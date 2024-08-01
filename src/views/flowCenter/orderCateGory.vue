<template>
  <div class="app-container" style="width: 100%;">
    <el-card>
      <div class="baseInfo-window">
        <el-button v-waves style="margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="createCategoryHandler">
          {{ $t('table.create') }}
        </el-button>
        <el-input v-model="searchContent" :placeholder="inputPlaceholder" style="width: 400px;" @keyup.enter.native="cateGorySearch">
          <el-dropdown slot="prepend" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ searchType === 'title' ? '标题' : 'ID' }}
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
            <el-dropdown-menu slot="dropdown" class="fixed-dropdown-menu">
              <el-dropdown-item command="title">标题</el-dropdown-item>
              <el-dropdown-item command="id">ID</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button slot="append" icon="el-icon-search" @click="cateGorySearch" />
        </el-input>
        <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset" />
        <el-button v-waves :loading="downloadLoading" style="margin-left: 10px;" icon="el-icon-download" @click="openDownloadDialog">
          {{ $t('table.export') }}
        </el-button>
      </div>
    </el-card>
    <el-card>
      <div class="form-window">
        <el-table v-loading="listLoading" :data="filteredData" border fit style="width: 100%;position: relative; height: 100%;" stripe @sort-change="sortChange">
          <el-table-column :label="$t('table.id')" min-width="40px" align="center" prop="id" />
          <el-table-column :label="$t('table.chineseName')" min-width="100px" align="center" prop="chineseName" />
          <el-table-column :label="$t('table.name')" min-width="100px" align="center" prop="name" />
          <el-table-column :label="$t('table.creator')" min-width="50px" align="center" prop="creator" />
          <el-table-column :label="$t('table.createdAt')" min-width="100px" align="center" prop="createdAt" />
          <el-table-column :label="$t('table.updatedAt')" min-width="100px" align="center" prop="updatedAt" />
          <el-table-column :label="$t('table.actions')" align="center" min-width="140px">
            <template v-slot="{ row }">
              <el-button type="text" icon="el-icon-edit" @click="updateCateGoryDialog(row)">
                {{ $t('table.update') }}
              </el-button>
              <el-button type="text" icon="el-icon-delete" @click="deleteCateGory(row)">
                {{ $t('table.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog :visible.sync="createcateGoryDialog" :title="dialogTitle" width="800px">
          <el-form ref="createForm" :model="createCateGory" :rules="createCateGoryRules" style="margin-right: 70px;" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="中文名称:" prop="chineseName">
                  <el-input v-model="createCateGory.chineseName"  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="英文名称:" prop="name">
                  <el-input v-model="createCateGory.name" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type=warning @click="createcateGoryDialog = false">取消</el-button>
            <el-button type="primary" @click="validateForm">创建</el-button>
          </div>
        </el-dialog>
        <el-dialog :visible.sync="updateDialog" :title="dialogTitle">
          <el-form :model="currentCateGory" label-width="90px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="中文名称:">
                  <el-input v-model="currentCateGory.chineseName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="英文名称:">
                  <el-input v-model="currentCateGory.name" :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="warning" @click="updateDialog = false">关闭</el-button>
            <el-button type="primary" @click="updateCateGory(currentCateGory)">保存</el-button>
          </div>
        </el-dialog>
        <el-dialog title="下载提示" :visible.sync="downloadDialogVisible" width="30%" :before-close="closeDownloadDiglog">
          <span>确认要导出数据吗？</span>
          <span slot="footer">
          <el-button type="warning" @click="downloadDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleDownload">确 定</el-button>
        </span>
        </el-dialog>
        <pagination v-show="total > 0" :total="total" :page.sync="cateGoryQuery.page" :limit.sync="cateGoryQuery.pageSize" @pagination="getCategoryList" />
      </div>
    </el-card>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination/index.vue'
import { parseTime } from '@/utils'
import { Message } from 'element-ui'
import { categoryList, createCateGory, deleteCateGory, updateCateGory } from '@/api/smart/flowCenter'

export default {
  name: 'OrderCateGory',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      dialogTitle: '',
      searchType: 'title', // 默认搜索类型为标题
      downloadLoading: false,
      currentCateGory: {}, // 当前item的数据
      createCateGory: {
        name: '',
        chineseName: ''
      },
      updateCateGoryData: {},
      total: 0,
      downloadDialogVisible: false, // 对话框是否可见
      createcateGoryDialog: false,
      updateDialog: false,
      isUpdate: false,
      listLoading: false,
      searchContent: '', // 搜索框内容默认为空
      getCateGoryData: [], // 保存table数据
      filteredData: [],
      cateGoryQuery: {
        page: 1,
        pageSize: 10,
      }, // 查询模板
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      createCateGoryRules: {
        name: [
          { required: true, message: '请输入英文名称', trigger: 'blur' }
        ],
        chineseName: [
          { required: true, message: '请输入中文名称', trigger: 'blur' }
        ]
      },
    }
  },
  computed: {
    inputPlaceholder() {
      return this.searchType === 'title' ? '请输入标题信息' : '请输入ID'
    }
  },
  watch: {
    getCateGoryData: {
      deep: true,
      handler() {
        this.cateGorySearch()
      }
    }
  },
  mounted() {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList() {
      this.listLoading = true
      await categoryList(
        this.cateGoryQuery
      ).then(response => {
        this.getCateGoryData = response.data
      })
      this.filteredData = this.getPaginatedData(this.getCateGoryData, this.cateGoryQuery.page, this.cateGoryQuery.pageSize)
      this.listLoading = false
    },
    getPaginatedData(data, page, pageSize) {
      const start = (page - 1) * pageSize
      const end = page * pageSize
      return data.slice(start, end)
    },
    createCategoryHandler() {
      // 创建新项目逻辑
      this.dialogTitle = '工单类别管理'
      this.createcateGoryDialog = true
      this.isUpdate = false
    },
    validateForm() {
      this.$refs.createForm.validate((valid) => {
        if (valid) {
          this.createCateGoryItems()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    async createCateGoryItems() {
      this.$confirm('是否确认创建该工单类别?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        try {
          createCateGory(this.createCateGory).then(response => {
            if (response.code === 200) {
              this.$showSuccess(`${this.createCateGory.name}创建成功`)
              this.getCategoryList()
              this.createcateGoryDialog = false
              } else {
              this.$showError('创建出错，请重试或者联系管理员', response.data)
              }
          })
        } catch (error) {
          console.error('Failed create to fetch order category:', error)
        } finally {
          this.listLoading = false // 停止加载状态
        }
      }).catch(() => {
        this.$showInfo('创建已取消')
      })
    },
    updateCateGoryDialog(row) {
      this.currentCateGory = { ...row } // 复制当前行的数据到 currentCateGory
      this.dialogTitle = '更新信息'
      this.updateDialog = true // 显示对话框
    },
    async updateCateGory(item) {
      this.$confirm('是否确认更新该工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        const { createdAt, updatedAt, ...updateCateGoryData } = item
        this.updateCateGoryData = updateCateGoryData
        try {
          updateCateGory(this.updateCateGoryData).then(response => {
            if (response.code === 200) {
              this.$showSuccess(`${this.currentCateGory.name}类别更新成功`)
              this.getCategoryList()
              this.updateDialog = false
            } else {
              this.$showError('更新出错，请重试或者联系管理员', updateCateGoryRes.data)
            }
          })
        } catch (error) {
          console.error('Failed update to fetch order category:', error)
        } finally {
          this.listLoading = false // 停止加载状态
        }
      }).catch(() => {
        this.$showInfo('更新已取消')
      })
    },

    deleteCateGory(row) {
      // 删除逻辑
      this.$confirm('是否确认删除该工单类型?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dialogTitle = '删除工单模版'
        this.deleteCateGoryItems(row)
      }).catch(() => {
        this.$showInfo('删除已取消')
      })
    },
    deleteCateGoryItems(row) {
      this.listLoading = true
      try {
        deleteCateGory({ id: row.id }).then(response => {
          if (response.code === 200) {
            this.$showSuccess(`${row.name}类别删除成功`)
            this.getCategoryList()
            this.updateDialog = false
          } else {
            this.$showError('更新出错，请重试或者联系管理员', response.data)
          }
        })
      } catch (error) {
        console.error('Failed delete to fetch order items:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    sortChange({ prop, order }) {
      this.listLoading = true // 开始加载状态
      // 判断排序的字段是 id
      if (prop === 'id') {
        // 根据排序的顺序对数据进行排序
        this.getCateGoryData.sort((a, b) => {
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
    cateGorySearch() {
      this.listLoading = true
      setTimeout(() => {
        if (this.searchContent) {
          if (this.searchType === 'title') {
            this.filteredData = this.getCateGoryData.filter(item => item.chineseName.includes(this.searchContent))
          } else if (this.searchType === 'id') {
            this.filteredData = this.getCateGoryData.filter(item => item.id.toString() === this.searchContent)
          }
        } else {
          this.filteredData = this.getPaginatedData(this.getCateGoryData, this.cateGoryQuery.page, this.cateGoryQuery.pageSize)
        }
        this.listLoading = false
      }, 500)
    },
    handleCommand(command) {
      this.searchType = command
    },
    handleReset() {
      this.searchContent = ''
      this.cateGorySearch()
    },

    openDownloadDialog() {
      this.downloadDialogVisible = true
    },
    closeDownloadDiglog() {
      this.downloadDialogVisible = false
    },
    formatJson(filterVal) {
      return this.getCateGoryData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '标题', '创建人', '图标', '类别', '跳转路经', '收藏', '描述信息', '绑定模板', '创建时间', '更新时间']
        const filterVal = ['id', 'title', 'creator', 'icon', 'category', 'link', 'favorite', 'description', 'bindTempLate', 'createdAt', 'updatedAt']
        const data = this.formatJson(filterVal)
        // 获取当前日期并格式化为 YYYY-MM-DD
        const currentDate = new Date().toISOString().slice(0, 10)
        const filename = `items-list-${currentDate}`
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename
        })
        this.downloadLoading = false
      })
    }
  }
}
</script>

<style scoped>
::v-deep .el-table th {
  background-color: #f5f7fa; /* 你想要的背景颜色 */
  color: #333; /* 字体颜色 */
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
  .pagination-container   {
    background: #fff;
    padding: 1px 10px;
    margin-top: 10px;
  }
}
.form-window:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.blue-text i {
  color: #4A9FF9;
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
    padding-top: 25px;
  }
}
</style>
