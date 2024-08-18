<template>
  <div class="app-container" style="width: 100%;">
    <el-card>
      <div class="baseInfo-window">
        <el-button v-waves style="margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="createItemsHandler">
          {{ $t('table.create') }}
        </el-button>
        <el-input v-model="searchContent" :placeholder="inputPlaceholder" style="width: 400px;" @keyup.enter.native="itemsSearch">
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
          <el-button slot="append" icon="el-icon-search" @click="itemsSearch" />
        </el-input>
        <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset" />
        <el-popover v-model="screenDialog" placement="bottom" style="margin-left: 10px" width="700" trigger="click">
          <el-form label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="创建人:">
                  <el-select v-model="screenQuery.creator" placeholder="请选择创建者" @change="searchData">
                    <el-option v-for="option in creatorOptions" :key="option.value" :label="option.label" :value="option.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="收藏:">
                  <el-select v-model="screenQuery.favorite" placeholder="请选择收藏状态" @change="searchData">
                    <el-option v-for="option in favoriteOptions" :key="option.value" :label="option.label" :value="option.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="类别:">
                  <el-select v-model="screenQuery.categoryId" placeholder="请选择类别" @change="searchData">
                    <el-option v-for="(category, index) in filteredCategory" :key="index" :label="category.chineseName" :value="category.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="绑定模板:">
                  <el-select v-model="screenQuery.bindTempLate" placeholder="请选择绑定模板" @change="searchData">
                    <el-option v-for="(name, index) in tempLateList" :key="index" :label="name" :value="name" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="创建时间:">
                  <el-date-picker
                    v-model="screenQuery.createdAt"
                    type="datetimerange"
                    :picker-options="pickerOptions"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 93%;"
                    align="left"
                    append-to-body
                    @change="filterDateRange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div style="text-align: right; margin-top: 10px;">
            <el-button type="primary" @click="filterReset">重置</el-button>
            <el-button type="warning" @click="screenDialog = false">关闭</el-button>
          </div>
          <el-button slot="reference" icon="el-icon-edit-outline">筛选</el-button>
        </el-popover>
        <el-button v-waves :loading="downloadLoading" style="margin-left: 10px;" icon="el-icon-download" @click="openDownloadDialog">
          {{ $t('table.export') }}
        </el-button>
      </div>
    </el-card>
    <el-card>
      <div class="form-window">
        <el-table v-loading="listLoading" :data="filteredData" border fit style="width: 100%;position: relative; height: 100%;" stripe @sort-change="sortChange">
          <el-table-column :label="$t('table.id')" min-width="20px" align="center" prop="id" />
          <el-table-column :label="$t('table.title')" min-width="50px" align="center" prop="title" />
          <el-table-column :label="$t('table.bindTempLate')" min-width="60px" align="center" prop="bindTempLate" />
          <el-table-column :label="$t('table.category')" min-width="40px" align="center">
            <template slot-scope="scope">
              {{ getCategoryName(scope.row.categoryId) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.icon')" min-width="60px" align="center" prop="icon" />
          <el-table-column :label="$t('table.creator')" min-width="40px" align="center" prop="creator" />
          <el-table-column :label="$t('table.link')" min-width="75px" align="center" prop="link" />
          <el-table-column :label="$t('table.favorite')" min-width="30px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.favorite ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.createdAt')" min-width="45px" align="center" prop="createdAt" />
          <el-table-column :label="$t('table.updatedAt')" min-width="45px" align="center" prop="updatedAt" />
          <el-table-column :label="$t('table.actions')" align="center" min-width="30px">
            <template v-slot="{ row }">
              <el-dropdown trigger="click" size="small" placement="bottom" @command="(command) => actionsHandle(command, row)">
              <span class="el-dropdown-link">
                <el-button type="text" icon="el-icon-more" />
              </span>
                <el-dropdown-menu slot="dropdown" style="width: 80px" class="blue-text">
                  <el-dropdown-item command="view">
                    <i class="el-icon-view" />
                    <span style="color: #4A9FF9"> {{ $t('table.view') }} </span>
                  </el-dropdown-item>
                  <el-dropdown-item command="unbind">
                    <i class="fa fa-unlink" />
                    <span style="color: #4A9FF9"> {{ $t('table.unbind') }} </span>
                  </el-dropdown-item>
                  <el-dropdown-item command="update">
                    <i class="el-icon-edit" />
                    <span style="color: #4A9FF9"> {{ $t('table.update') }} </span>
                  </el-dropdown-item>
                  <el-dropdown-item command="deleted">
                    <i class="el-icon-delete" />
                    <span style="color: #4A9FF9"> {{ $t('table.deleted') }} </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog :visible.sync="createItemsDialog" :title="dialogTitle" width="800px">
          <el-form ref="createForm" :model="createItems" :rules="createItemsRules" style="margin-right: 70px;" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标题:" prop="title">
                  <el-input v-model="createItems.title" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="图标:" prop="icon">
                  <e-icon-picker v-model="createItems.icon" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="类别:" prop="categoryId">
                  <el-select v-model="createItems.categoryId" style="width: 100%" placeholder="请选择类别" @change="handleCategoryChange">
                    <el-option v-for="(category, index) in filteredCategory" :key="index" :label="category.chineseName" :value="category.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="绑定模板:" prop="bindTempLate">
                  <el-select v-model="createItems.bindTempLate" style="width: 100%" placeholder="请选择绑定模板">
                    <el-option v-for="(template, index) in filteredTemplates" :key="index" :label="template" :value="template" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="收藏:" prop="favorite">
                  <el-select v-model="createItems.favorite" style="width: 100%" placeholder="请选择收藏状态">
                    <el-option v-for="option in favoriteOptions" :key="option.value" :label="option.label" :value="option.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="跳转链接:" prop="link">
                  <el-input v-model="createItems.link" :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="描述:">
                  <el-input v-model="createItems.description" type="textarea" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="el-dialog__footer">
            <el-button type="primary" @click="validateForm">创建</el-button>
            <el-button type="warning" @click="createItemsDialog = false">取消</el-button>
          </div>
        </el-dialog>
        <el-dialog :visible.sync="updateDialog" :title="dialogTitle">
          <el-form :model="currentItem" label-width="90px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="ID:">
                  <el-input v-model="currentItem.id" :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="创建人:">
                  <el-input v-model="currentItem.creator" :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标题:">
                  <el-input v-model="currentItem.title" :disabled="!isEditable" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="图标:">
                  <el-input v-model="currentItem.icon" :disabled="!isEditable" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="类别:" prop="categoryId">
                  <el-select v-model="currentItem.categoryId" style="width: 100%" placeholder="请选择类别" @change="handleCategoryChange" :disabled="!isEditable">
                    <el-option v-for="(category, index) in filteredCategory" :key="index" :label="category.chineseName" :value="category.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="绑定模板:" prop="bindTempLate">
                  <el-select v-model="currentItem.bindTempLate" style="width: 100%" placeholder="请选择绑定模板" :disabled="!isEditable">
                    <el-option v-for="(template, index) in filteredTemplates" :key="index" :label="template" :value="template" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="收藏:">
                  <el-select v-model="currentItem.favorite" style="width: 100%" :disabled="!isEditable" placeholder="请选择收藏状态">
                    <el-option v-for="option in favoriteOptions" :key="option.value" :label="option.label" :value="option.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="跳转路经:">
                  <el-input v-model="currentItem.link" :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="创建时间:">
                  <el-input v-model="currentItem.createdAt" :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="更新时间:">
                  <el-input v-model="currentItem.updatedAt" :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="描述信息:">
                  <el-input v-model="currentItem.description" type="textarea" :disabled="!isEditable" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="warning" @click="updateDialog = false">关闭</el-button>
            <el-button v-if="isEditable" type="primary" @click="updateOrderItems(currentItem)">保存</el-button>
          </div>
        </el-dialog>
        <el-dialog title="下载提示" :visible.sync="downloadDialogVisible" width="30%" :before-close="closeDownloadDiglog">
          <span>确认要导出数据吗？</span>
          <span slot="footer">
          <el-button type="warning" @click="downloadDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleDownload">确 定</el-button>
        </span>
        </el-dialog>
        <pagination v-show="total > 0" :total="total" :page.sync="itemsQuery.page" :limit.sync="itemsQuery.pageSize" @pagination="getItemsList" />
      </div>
    </el-card>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination/index.vue'
import { mapGetters } from 'vuex'

import { parseTime } from '@/utils'
import { categoryList, flowTemplateList } from '@/api/smart/flowCenter'
import { itemsList, updateItems, createItem, deleteItem } from '@/api/smart/orderItems'

export default {
  name: 'OrderManage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      dialogTitle: '',
      searchType: 'title', // 默认搜索类型为标题
      isEditable: false,
      downloadLoading: false,
      currentItem: {}, // 当前item的数据
      createItems: {
        title: '',
        description: '',
        bindTempLate: '',
        favorite: null,
        creator: this.$store.getters.name, // 获取当前系统登录用户
        icon: '',
        categoryId: null,
        link: ''
      },
      favoriteOptions: [
        { value: true, label: '是' },
        { value: false, label: '否' }
      ],
      screenQuery: {
        categoryId: null, // 类别
        bindTempLate: '', // 绑定模板
        creator: '', // 创建人
        favorite: null,
        createdAt: [] // 创建时间范围筛选条件，以数组形式存储开始时间和结束时间
      },
      total: 0,
      screenDialog: false, // 筛选框是否可见，默认不可见
      downloadDialogVisible: false, // 对话框是否可见
      createItemsDialog: false,
      updateDialog: false,
      isUpdate: false,
      listLoading: false,
      getTempLateData: {}, // 获取模版数据
      searchContent: '', // 搜索框内容默认为空
      getItemsData: [], // 保存table数据
      filteredData: [],
      currentPage: 1, // 当前页码，默认为第一页
      pageSize: 10, // 每页显示条目数，可以根据需求调整
      currentData: {},
      itemsQuery: {
        page: 1,
        pageSize: 15,
      }, // 查询模板
      tempLateRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入描述信息', trigger: 'blur' }]
      }, // 表单审核
      deleteQuery: {
        id: 0,
      },
      createItemsRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        bindTempLate: [
          { required: true, message: '请选择绑定模板', trigger: 'change' }
        ],
        favorite: [
          { required: true, message: '请选择收藏状态', trigger: 'change' }
        ],
        creator: [
          { required: true, message: '创建人不能为空', trigger: 'blur' }
        ],
        icon: [
          { required: true, message: '请输入图标', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择类别', trigger: 'change' }
        ]
      },
      tempLateList: [], // 保存模版名称
      filteredTemplates: [],
      templateData: [], // 存放模板名称和对应categoryId的数组
      categoryList: [] // 保存items类型
    }
  },
  computed: {
    ...mapGetters({
      pickerOptions: 'pickerOptions/pickerOptions'
    }),
    inputPlaceholder() {
      return this.searchType === 'title' ? '请输入标题信息' : '请输入ID'
    },
    creatorOptions() {
      return this.getOptions('creator')
    },
    formattedDepartment() {
      return this.formatDepartment(this.currentRow)
    },
    filteredCategory() {
      return this.categoryList.map(item => ({
        chineseName: item.chineseName,
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
  watch: {
    getItemsData: {
      deep: true,
      handler() {
        // 在 getItemsData 对象发生变化时触发搜索
        this.itemsSearch()
      }
    },
    itemsfilter: {
      deep: true,
      handler() {
        this.searchData()
      }
    }
  },
  mounted() {
    this.getCategoryList()
    // 在组件创建时自动发送请求获取数据
    this.getItemsList()
    this.getFlowTemplateList()

  },
  methods: {
    async getCategoryList() {
      await categoryList(this.itemsQuery).then(response => {
        this.categoryList = response.data
      })
    },
    getItemsList() {
      this.listLoading = true
      itemsList(this.itemsQuery).then(response => {
        this.getItemsData = response.data
        this.total = this.getItemsData.length
      })
      this.filteredData = this.getPaginatedData(this.getItemsData, this.page, this.pageSize)
      this.listLoading = false // 停止加载状态
    },
    async getFlowTemplateList() {
      try {
        await flowTemplateList(this.itemsQuery).then(response =>{
          this.getTempLateData = response.data
          this.total = this.getTempLateData.length
          this.searchModelData()
        })
      } catch (error) {
        console.error('Error fetching template list:', error)
      }
    },
    searchModelData() {
      this.listLoading = true
      // 获取筛选时的模板名称
      this.tempLateList = this.getTempLateData.map(item => item.name)
      // 将模板数据保存为包含name和categoryId的对象数组
      this.templateData = this.getTempLateData.map(item => ({
        name: item.name,
        categoryId: item.categoryId
      }))
    },

    // 根据类别选择更新模板列表
    handleCategoryChange() {
      const categoryId = this.createItems.categoryId || this.currentItem.categoryId
      this.filteredTemplates = this.templateData
        .filter(templateData => templateData.categoryId === categoryId)
        .map(templateData => templateData.name)
    },
    getPaginatedData(data, page, pageSize) {
      const start = (page - 1) * pageSize
      const end = page * pageSize
      return data.slice(start, end)
    },
    validateForm() {
      this.$refs.createForm.validate((valid) => {
        if (valid) {
          this.createOrderItems()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    async createOrderItems() {
      this.$confirm('是否确认创建该工单类型?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        try {
          this.handleCategoryChange()
          await createItem(this.createItems).then(response => {
            if (response.code === 200) {
              this.getItemsList()
              this.createItemsDialog = false
              this.$showSuccess(`${this.createItems.title}创建成功`)
            } else {
              this.$showError('创建出错，请重试或者联系管理员', response.data)
            }
          })
        } catch (error) {
          console.error('Failed create to fetch order items:', error)
        } finally {
          this.listLoading = false // 停止加载状态
        }
      }).catch(() => {
        this.$showInfo('创建已取消')
      })
    },
    async updateOrderItems(item) {
      this.$confirm('是否确认更新该工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        const { createdAt, updatedAt, ...updateItem } = item
        try {
          updateItems(updateItem).then(async response => {
            if (response.code === 200) {
              this.$showSuccess(`${this.currentItem.title}更新成功`)
              await this.getItemsList()
              this.updateDialog = false
            } else {
              this.$showError('更新出错，请重试或者联系管理员', response.data)
            }
          })
        } catch (error) {
          console.error('Failed update to fetch order items:', error)
        } finally {
          this.listLoading = false // 停止加载状态
        }
      }).catch(() => {
        this.$showInfo('更新已取消')
      })
    },
    deleteOrderItems(row) {
      this.listLoading = true
      try {
        this.deleteQuery.id = row.id
        deleteItem(this.deleteQuery).then(response => {
          if (response.code === 200) {
            this.$showSuccess(`${row.title}删除成功`)
            this.getItemsList()
            this.updateDialog = false
          } else {
            this.$showError('删除出错，请重试或者联系管理员', response.data)
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
        this.getItemsData.sort((a, b) => {
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
    itemsSearch() {
      this.listLoading = true
      setTimeout(() => {
        if (this.searchContent) {
          if (this.searchType === 'title') {
            this.filteredData = this.getItemsData.filter(item => item.title.includes(this.searchContent))
          } else if (this.searchType === 'id') {
            this.filteredData = this.getItemsData.filter(item => item.id.toString() === this.searchContent)
          }
        } else {
          this.filteredData = this.getPaginatedData(this.getItemsData, this.itemsQuery.page, this.itemsQuery.pageSize)
        }
        this.listLoading = false
      }, 500)
    },
    handleCommand(command) {
      this.searchType = command
    },
    handleReset() {
      setTimeout(() => {
        this.searchContent = ''
        this.getItemsList()
      }, 400)
    },
    actionsHandle(command, row) {
      switch (command) {
        case 'view':
          this.viewItem(row)
          break
        case 'unbind':
          this.unbindItem(row)
          break
        case 'update':
          this.updateItem(row)
          break
        case 'deleted':
          this.deleteItem(row)
          break
      }
    },
    viewItem(row) {
      this.currentItem = { ...row } // 复制当前行的数据到 currentItem
      this.dialogTitle = '查看详情'
      this.isEditable = false // 设置表单不可编辑
      this.updateDialog = true // 显示对话框
    },
    unbindItem(row) {
      this.currentItem = { ...row } // 复制当前行的数据到 currentItem
      this.currentItem.bindTempLate = ''
      this.updateOrderItems(this.currentItem)
    },
    updateItem(row) {
      this.currentItem = { ...row } // 复制当前行的数据到 currentItem
      this.dialogTitle = '更新信息'
      this.isEditable = true // 设置表单可编辑
      this.updateDialog = true // 显示对话框
      this.handleCategoryChange()
    },
    deleteItem(row) {
      // 删除逻辑
      this.$confirm('是否确认删除该工单类型?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dialogTitle = '删除工单模版'
        this.deleteOrderItems(row)
      }).catch(() => {
        this.$showInfo('删除已取消')
      })
    },
    createItemsHandler() {
      // 创建新项目逻辑
      this.dialogTitle = '工单类型管理'
      this.createItemsDialog = true
      this.isUpdate = false
    },
    openDownloadDialog() {
      this.downloadDialogVisible = true
    },
    closeDownloadDiglog() {
      this.downloadDialogVisible = false
    },
    filterReset() {
      // 清除筛选条件
      this.screenQuery = {}
      // 查询所有数据
      this.searchData()
    },
    searchData() {
      this.listLoading = true
      setTimeout(() => {
        let filteredData = this.getItemsData // 假设 getItemsData 返回所有数据的方法
        // 筛选数据
        if (this.screenQuery.creator) {
          filteredData = filteredData.filter(item => item.creator === this.screenQuery.creator)
        }
        if (this.screenQuery.favorite !== null) {
          filteredData = filteredData.filter(item => item.favorite === Boolean(this.screenQuery.favorite))
        }
        if (this.screenQuery.categoryId) {
          filteredData = filteredData.filter(item => item.categoryId === this.screenQuery.categoryId)
        }
        if (this.screenQuery.bindTempLate) {
          filteredData = filteredData.filter(item => item.bindTempLate.toString() === this.screenQuery.bindTempLate)
        }

        // 更新总数
        this.total = filteredData.length

        // 计算当前页数据
        const startIndex = (this.currentPage - 1) * this.pageSize
        this.filteredData = filteredData.slice(startIndex, startIndex + this.pageSize)
        this.listLoading = false
      }, 500)
    },
    filterDateRange() {
      this.listLoading = true
      setTimeout(() => {
        if (!this.screenQuery.createdAt) {
          this.filteredData = [...this.getItemsData]
          this.listLoading = false
          return
        }
        if (this.screenQuery.createdAt.length === 2) {
          const [startTime, endTime] = this.screenQuery.createdAt.map(date => new Date(date).getTime())
          this.filteredData = this.getItemsData.filter(item => {
            const createTime = new Date(item.createdAt).getTime()
            return createTime >= startTime && createTime <= endTime
          })
        } else {
          this.filteredData = [...this.getItemsData] // 如果没有选择日期范围，则重置过滤
        }
        this.listLoading = false
      }, 500)
    },
    getOptions(field) {
      const uniqueValues = [...new Set(this.getItemsData.map(item => item[field]))]
      return uniqueValues.map(value => ({
        value,
        label: value
      }))
    },
    formatJson(filterVal) {
      return this.getItemsData.map(v => filterVal.map(j => {
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
</style>
