<template>
  <div class="app-container" style="width: 100%;">
    <el-card>
      <div class="baseInfo-window">
        <el-button v-waves class="filter-item" style="margin-right: 10px;font-size: 14px" type="primary" icon="el-icon-s-promotion" @click="handleOrderCreate">
          {{ $t('table.createOrder') }}
        </el-button>
        <el-input v-model="searchContent" :placeholder="inputPlaceholder" style="width: 400px;" @keyup.enter.native=" handleSearch">
          <el-dropdown slot="prepend" @command="handleCommand">
          <span>
            {{ searchType === 'title' ? '标题' : '工单ID' }}
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
            <el-dropdown-menu slot="dropdown" class="fixed-dropdown-menu">
              <el-dropdown-item command="title">标题</el-dropdown-item>
              <el-dropdown-item command="id">工单ID</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
        </el-input>
        <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset" />
        <el-popover v-model="screenVisible" placement="bottom" width="700" trigger="click">
          <el-form label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="优先级:">
                  <el-select v-model="screenQuery.selectedPriority" placeholder="请选择优先级" @change="searchData">
                    <el-option v-for="option in orderWorksPriority" :key="option.value" :label="option.label" :value="option.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="当前处理人:">
                  <el-select v-model="screenQuery.currentHandler" placeholder="请选择当前处理人" @change="searchData">
                    <el-option v-for="username in currentHandler" :key="username" :label="username" :value="username" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="流程:">
                  <el-select v-model="screenQuery.process" placeholder="请选择流程" @change="searchData">
                    <el-option v-for="option in processOptions" :key="option.value" :label="option.label" :value="option.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态:">
                  <el-select v-model="screenQuery.status" placeholder="请选择状态" @change="searchData">
                    <el-option v-for="option in statusOptions" :key="option.label" :label="option.label" :value="option.value" />
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
                    @change="filterDateRange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div style="margin-left: 510px;">
            <el-button type="primary" @click="filterReset">重置</el-button>
            <el-button type="warning" @click="screenVisible = false">关闭</el-button>
          </div>
          <el-button slot="reference" style="margin-left: 10px;" icon="el-icon-edit-outline">筛选</el-button>
        </el-popover>
        <el-button v-waves :loading="downloadLoading" style="margin-left: 10px;" icon="el-icon-download" @click="openDownloadDialog">
          {{ $t('table.export') }}
        </el-button>
      </div>
    </el-card>
    <el-card>
      <div class="el-card is-hover-shadow box-card mb8" style="margin-bottom: 10px">
        <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
          <el-tab-pane name="myBacklog" >
            <span slot="label"><i class="el-icon-date" />我的待办</span>
          </el-tab-pane>
          <el-tab-pane name="createdByMe">
            <span slot="label"><i class="el-icon-s-flag" />我创建的</span>
          </el-tab-pane>
          <el-tab-pane name="relatedToMe" >
          <span slot="label"><i class="el-icon-link" />我相关的</span>
          </el-tab-pane>
          <el-tab-pane name="allOrders" >
            <span slot="label"><i class="el-icon-document" /> 所有工单</span>
          </el-tab-pane>
          <el-table :data="filteredData" v-loading="listLoading" border fit style="width: 100%;position: relative; height: 100%;" stripe>
            <el-table-column :label="$t('table.id')" fixed="left" min-width="60px" align="center" prop="id">
              <template #default="scope">
                <el-link
                    type="primary"
                    @click="handleView(scope.row)">
                  {{ scope.row.id }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.title')" min-width="300px" align="center" prop="title" />
            <el-table-column :label="$t('table.department')" min-width="150px" align="center" prop="department">
              <template slot-scope="scope">
                {{ formatDepartment(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.currentNode')" align="center" width="100px" prop="currentNode">
              <template slot-scope="scope">
                <el-tag :type="scope.row.currentNode === '结束' ? 'success' : 'warning'">
                  {{ scope.row.currentNode }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.currentHandler')" width="130px" align="center" prop="currentHandler" />
            <el-table-column :label="$t('table.priority')" width="95px" align="center">
              <template slot-scope="scope">
                <el-tag :type="getTagType(scope.row.priority)">
                  {{ formatPriority(scope.row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.status')" class-name="status-col" width="87" prop="status">
              <template slot-scope="scope">
                <el-tag :type="getStatusTag(scope.row.status)">
                  {{ formatStatus(scope.row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.process')" min-width="150px" align="center" prop="process" />
            <el-table-column :label="$t('table.creator')" min-width="130px" align="center" prop="creator">
            </el-table-column>
            <el-table-column :label="$t('table.description')" width="70px" align="center" prop="description">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-more" @click="openDialog(scope.row.description)" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.createdAt')" min-width="170px" align="center" prop="createdAt" />
            <el-table-column :label="$t('table.updatedAt')" min-width="170px" align="center" prop="updatedAt" />
            <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="90px">
              <template v-slot="{ row }">
                <el-dropdown trigger="click" size="small" placement="bottom" @command="(command) => actionsHandle(command, row)">
                <span>
                  <el-button type="text" icon="el-icon-more" />
                </span>
                  <el-dropdown-menu slot="dropdown" style="width: 80px" class="blue-text">
                    <el-dropdown-item command="view">
                      <i class="el-icon-view" />
                      <span style="color: #4A9FF9"> {{ $t( 'table.view') }} </span>
                    </el-dropdown-item>
                    <el-dropdown-item command="update">
                      <i class="el-icon-edit" />
                      <span style="color: #4A9FF9"> {{ $t('table.update') }} </span>
                    </el-dropdown-item>
                    <el-dropdown-item command="shift">
                      <i class="el-icon-upload" />
                      <span style="color: #4A9FF9"> {{ $t('table.shift') }} </span>
                    </el-dropdown-item>
                    <el-dropdown-item command="urge">
                      <i class="el-icon-bell" />
                      <span style="color: #4A9FF9"> {{ $t('table.urge') }} </span>
                    </el-dropdown-item>
                    <el-dropdown-item command="reopen">
                      <i class="el-icon-refresh" />
                      <span style="color: #4A9FF9"> {{ $t('table.reopen') }} </span>
                    </el-dropdown-item>
                    <el-dropdown-item command="closed">
                      <i class="el-icon-circle-close" />
                      <span style="color: #4A9FF9"> {{ $t('table.closed') }} </span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-tabs>
      </div>
      <pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.pageSize" @pagination="getOrderWorksList" />

    </el-card>
    <div>
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
      <el-dialog :visible.sync="updateDialogVisible" title="更新工单信息" @close="resetForm">
        <el-form :model="currentRow">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标题:">
                <el-input v-model="currentRow.title" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门:">
                <el-input :value="formattedDepartment" :disabled="true" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态:">
                <el-select v-model="currentRow.status" :disabled="true" style="width: 100%">
                  <el-option v-for="status in orderWorksStatus" :key="status.value" :label="status.label" :value="status.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级:">
                <el-select v-model="currentRow.priority" style="width: 100%">
                  <el-option v-for="priority in orderWorksPriority" :key="priority.value" :label="priority.label" :value="priority.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdate">更新</el-button>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="shiftDialogVisible" title="工单转交" @close="resetForm">
        <el-form :model="currentRow">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标题:">
                <el-input v-model="currentRow.title" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门:">
                <el-input :value="formattedDepartment" :disabled="true" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级:" prop="priority">
                <el-select v-model="currentRow.priority" style="width: 100%">
                  <el-option v-for="priority in orderWorksPriority" :key="priority.value" :label="priority.label" :value="priority.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="当前处理人:">
                <el-input :value="currentRow.currentHandler" :disabled="true" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="工单转交:" prop="priority">
                <el-select
                  v-model="selectedUsers"
                  style="width: 400px; height: 40px;"
                  filterable
                  remote
                  reserve-key-word
                  :remote-method="filterUsers"
                  :loading="listLoading"
                  @focus="loadAllUsers"> <!-- 点击输入框时加载所有用户 -->
                  <el-option
                      v-for="item in userOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer">
          <el-button @click="shiftDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleShift">转交</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { orderWorksList, updateOrderWork, getRelatedToMeWorks,getMyBacklogWorks,getCreatedByMeWorks } from '@/api/smart/workOrder'
import { listUser } from '@/api/admin/sys-user'
import {createOrderWorkNotify, sendFeishuNotify} from "@/api/smart/common";
import {mapGetters} from "vuex";

export default {
  name: 'OrderWorksList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      restaurants: [],
      state: '',
      timeout:  null,
      selectedUsers: null, // 默认选择的用户
      allUsers: [], // 存储所有用户
      userOptions: [], // 处理后的下拉选项
      orderWorksStatus: [],
      orderWorksPriority: [],
      orderStatusOptions: [],
      currentHandler: [], // 存储当前页面数据当前处理人
      dataFetchers: {
        myBacklog: getMyBacklogWorks,
        createdByMe: getCreatedByMeWorks,
        relatedToMe: getRelatedToMeWorks,
        allOrders: this.getOrderWorksList
      },
      statusTagMapping: {
        'under-way': '',
        'termination': 'success',
        'manual-termination': 'warning',
        'reopened': '',
        'reject': 'danger'
      },
      activeTab: 'allOrders',
      searchType: 'title', // 默认搜索类型为标题
      searchContent: '', // 搜索框内容默认为空
      screenVisible: false, // 筛选框是否可见，默认不可见
      screenQuery: {
        selectedPriority: '', // 优先级筛选条件
        currentHandler: '', // 当前处理人筛选条件
        process: '', // 流程
        creator: '', // 创建人
        status: '', // 工单状态
        createdAt: [] // 创建时间范围筛选条件，以数组形式存储开始时间和结束时间
      },
      orderWorks: [], // 后端返回工单信息数据
      updateOrderWorksData: [], // 接收后端更新后的工单数据
      filteredData: [], // 存放筛选后的数据
      downloadDialogVisible: false, // 对话框是否可见
      descDialogVisible: false, // 对话框是否可见
      updateDialogVisible: false, // 更新工单数据对话框
      shiftDialogVisible: false, // 工单转交弹框
      descriptionDialogContent: '', // 描述字段内容
      total: 0,
      currentPage: 1, // 当前页码，默认为第一页
      pageSize: 10, // 每页显示条目数，可以根据需求调整
      listLoading: true,
      currentRow: {},
      queryParams: {
        page: 1,
        pageSize: 20
      },
      sendUrgeQuery: {
        title: '',
        department: '',
        priority: '',
        status: '',
        currentHandler: '', // 当前处理人
        orderID: 0 // 工单ID
      },
      updateQuery: {
        title: '',
        department: '',
        priority: '',
        status: '',
        description: '',
        currentHandler: '', // 当前操作人
        formData: {}
      },
      priorityTagMap: [],
      downloadLoading: false,
    }
  },
  computed: {
    ...mapGetters({
        pickerOptions: 'pickerOptions/pickerOptions'
    }),
    processOptions() {
      return this.getOptions('process')
    },
    statusOptions() {
      const status = this.orderWorksStatus || []
      const seenLabels = new Set(); // 用于跟踪已出现的标签

      // 遍历选项数组，根据标签进行相应的修改
      status.forEach(option => {
        // 如果标签已经存在，增加唯一标识
        if (seenLabels.has(option.label)) {
          option.label += ` (${option.value})`
        }
        seenLabels.add(option.label)
      });

      return status
    },
    inputPlaceholder() {
      return this.searchType === 'title' ? '请输入标题信息' : '请输入工单ID'
    },
    formattedDepartment() {
      return this.formatDepartment(this.currentRow)
    }
  },
  watch: {
    orderWorks: {
      deep: true,
      handler() {
        // 在 orderWorks 对象发生变化时触发搜索
        this.searchData()
      }
    }
  },
  async created() {
    // 先获取字典数据
    try {
      const [statusResponse, priorityResponse, priorityResponseStatus] = await Promise.all([
        this.getDicts('order_works_status'),
        this.getDicts('order_works_priority_type'),
        this.getDicts('order_works_priority_status')
      ]);
      this.orderWorksStatus = statusResponse.data;
      this.orderWorksPriority = priorityResponse.data;
      this.priorityTagMap = priorityResponseStatus.data.reduce((map, item) => {
        map[item.label] = item.value;
        return map;
      }, {});

      // 再获取订单项数据
      await this.getOrderWorksList()
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  },
  methods: {
    async getOrderWorksList() {
      this.listLoading = true
      try {
        await orderWorksList(this.queryParams).then(response => {
          this.orderWorks = response.data.list.filter(order => order.status !== 'closed')
          this.total = response.data.count
          this.currentHandler = [...new Set(this.orderWorks.map(order => order.currentHandler))];
          this.filteredData = this.orderWorks // 确保初始显示所有数据
        })
      } catch (error) {
        console.error('Failed to fetch order works:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    async updateOrderWorks(row) {
      this.listLoading = true
      try {
        const { createdAt, updatedAt, ...cleanItem } = row
        this.updateQuery = cleanItem
        await updateOrderWork(this.updateQuery).then(response => {
          if (response.code === 200) {
            this.getOrderWorksList()
            this.$showSuccess(`${this.updateQuery.title} 更新成功`)
          } else {
            this.$showError('更新出错，请重试或者联系管理员', response.data)
          }
        })
      } catch (error) {
        console.error('Failed to fetch order works:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    async shiftCurrentHandler(row) {
      this.listLoading = true
      try {
        const { createdAt, updatedAt, ...cleanItem } = row
        this.updateQuery = cleanItem
        this.updateQuery.currentHandler = this.selectedUsers // 直接使用选中的用户名
        await updateOrderWork(this.updateQuery).then(response => {
          if (response.code === 200) {
            this.getOrderWorksList()
            this.$showSuccess(`${this.updateQuery.title} 工单转交成功`)
          } else {
            this.$showError('转交出错，请重试或者联系管理员', response.data)
          }
        })
      } catch (error) {
        console.error('Transfer of work order failed', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    // 加载所有用户列表
    async loadAllUsers() {
      this.listLoading = true
      try {
        const response = await listUser() // 加载所有用户
        this.allUsers = response.data.list.map(user => ({
          label: user.username,
          value: user.nickName
        }))
        this.userOptions = this.allUsers // 默认显示所有用户
      } catch (error) {
        console.error('Failed to load all users:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    // 本地过滤用户列表
    filterUsers(query) {
      if (query) {
        this.userOptions = this.allUsers.filter(user => user.label.includes(query))
      } else {
        this.userOptions = this.allUsers // 如果没有输入内容，则显示所有用户
      }
    },
    async sendUrgeMessage(row) {
      this.listLoading = true;
      try {
        const {
          id, createdAt, updateBy, creator, updatedAt, template, createBy, currentNode,
          description, formData, currentHandlerID, regenerator, bindFlowData, process,
          ...cleanItem
        } = row;

        this.sendUrgeQuery = cleanItem;
        this.sendUrgeQuery.orderID = row.id;

        await sendFeishuNotify({
          orderName: row.title,
          receiveName: row.currentHandler,
        });
        const orderNotifyResponse = await createOrderWorkNotify(this.sendUrgeQuery)

        if (orderNotifyResponse.code === 200) {
          this.getOrderWorksList();
          this.$showSuccess(`${this.updateQuery.title} 工单催办成功`)
        } else {
          this.$showError('催办出错，请重试或者联系管理员', orderNotifyResponse.data)
        }
      } catch (error) {
        console.error('Transfer of work order failed', error);
      } finally {
        this.listLoading = false;
      }
    },
    async reopenOrderWorks(row) {
      this.listLoading = true
      try {
        this.updateQuery = row
        this.updateQuery.status = 'reopened'
        await updateOrderWork(this.updateQuery).then(response => {
          if (response.code === 200) {
            this.getOrderWorksList()
            this.$showSuccess(`${this.updateQuery.title} 重新开启成功`)
          } else {
            this.$showError('重开出错，请重试或者联系管理员', response.data)
          }
        })
      } catch (error) {
        console.error('Failed to fetch order works:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    async closeOrderWorks(row) {
      this.listLoading = true
      try {
        this.updateQuery = row
        this.updateQuery.status = 'closed'
        await updateOrderWork(this.updateQuery).then(response => {
          if (response.code === 200) {
            this.getOrderWorksList()
            this.$showSuccess(`${this.updateQuery.title} 工单结单成功`)
          } else {
            this.$showError('结单出错，请重试或者联系管理员', response.data)
          }
        })
      } catch (error) {
        console.error('Failed to fetch order works:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    handleResponse(response) {
      this.orderWorks = response.data.filter(order => order.status !== 'reopened' && order.status !== 'closed');
      this.total = this.orderWorks.length;
      this.filteredData = this.orderWorks; // 确保初始显示所有数据
    },
    handleTabClick(tab) {
      const fetchFunction = this.dataFetchers[tab.name];
      if (fetchFunction) {
        fetchFunction().then(response => this.handleResponse(response))
          .catch(error => {
            console.error(`Failed to fetch data for ${tab.name}:`, error);
          });
      } else {
        // 处理未知的 tab 名称情况
        console.warn(`No data fetcher defined for tab: ${tab.name}`);
      }
    },
    searchData() {
      this.listLoading = true
      setTimeout(() => {
        let filteredData = this.orderWorks
        if (this.screenQuery.selectedPriority) {
          filteredData = filteredData.filter(item => item.priority === this.screenQuery.selectedPriority)
        }
        if (this.screenQuery.currentHandler) {
          filteredData = filteredData.filter(item => item.currentHandler === this.screenQuery.currentHandler)
        }
        if (this.screenQuery.process) {
          filteredData = filteredData.filter(item => item.process === this.screenQuery.process)
        }
        if (this.screenQuery.status) {
          filteredData = filteredData.filter(item => item.status === this.screenQuery.status)
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
          this.filteredData = [...this.orderWorks]
          this.listLoading = false
          return
        }
        if (this.screenQuery.createdAt.length === 2) {
          const [startTime, endTime] = this.screenQuery.createdAt.map(date => new Date(date).getTime())
          this.filteredData = this.orderWorks.filter(item => {
            const createTime = new Date(item.createdAt).getTime()
            return createTime >= startTime && createTime <= endTime
          })
        } else {
          this.filteredData = [...this.orderWorks] // 如果没有选择日期范围，则重置过滤
        }
        this.listLoading = false
      }, 500)
    },
    handleCommand(command) {
      this.searchType = command
    },
    handleSearch() {
      this.listLoading = true
      setTimeout(() => {
        if (this.searchContent) {
          if (this.searchType === 'title') {
            this.filteredData = this.orderWorks.filter(item => item.title.includes(this.searchContent))
          } else if (this.searchType === 'id') {
            this.filteredData = this.orderWorks.filter(item => item.id.toString() === this.searchContent)
          }
        } else {
          this.getOrderWorksList()
        }
        this.listLoading = false
      }, 500)
    },
    handleReset() {
      this.listLoading = true
      setTimeout(() => {
        this.searchContent = ''
          this.getOrderWorksList()
        this.listLoading = false
      }, 400)
    },
    filterReset() {
      // 清除筛选条件
      this.screenQuery = ''
      // 查询所有数据
      this.searchData()
    },
    getOptions(field) {
      const uniqueValues = [...new Set(this.orderWorks.map(item => item[field]))]
      return uniqueValues.map(value => ({
        value,
        label: value
      }))
    },
    formatDepartment(row) {
      switch (row.department) {
        case 'open-platform':
          return '开放平台'
        case 'hz-enterprise':
          return '杭州企业解决方案'
        case 'bj-enterprise':
          return '北京企业解决方案'
        default:
          return '开放平台'
      }
    },
    formatPriority(row) {
      const priority = this.orderWorksPriority.find(item => item.value === row.priority)
      return priority ? priority.label : row.priority
    },
    formatStatus(row) {
      const status = this.orderWorksStatus.find(item => item.value === row.status)
      return status ? status.label : row.status
    },
    getTagType(priority) {
      return this.priorityTagMap[priority] || ''
    },
    getStatusTag(status) {
      return this.statusTagMapping[status] || ''
    },
    openDownloadDialog() {
      this.downloadDialogVisible = true
    },
    openDialog(description) {
      this.descriptionDialogContent = description
      this.descDialogVisible = true
    },
    closeDownloadDiglog() {
      this.downloadDialogVisible = false
    },
    closeDescDiglog() {
      this.descDialogVisible = false
    },
    handleOrderCreate() {
      // 在这里进行页面跳转
      this.$router.push('/orderCenter/apply')
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '标题', '部门', '流程', '当前节点', '当前处理人', '优先级', '状态', '创建人', '描述', '创建时间', '更新时间']
        const filterVal = ['id', 'title', 'department', 'process', 'currentNode', 'currentHandler', 'priority', 'status', 'creator', 'description', 'createdAt', 'updatedAt']
        const data = this.formatJson(filterVal, this.tableData)
        // 获取当前日期并格式化为 YYYY-MM-DD
        const currentDate = new Date().toISOString().slice(0, 10)
        const filename = `table-list-${currentDate}`
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.orderWorks.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    actionsHandle(command, row) {
      switch (command) {
        case 'view':
          this.handleView(row)
          break
        case 'update':
          this.openUpdateDialog(row)
          break
        case 'shift':
          this.openShiftDialog(row)
          break
        case 'urge':
          this.handleUrge(row)
          break
        case 'reopen':
          this.handleReopen(row)
          break
        case 'closed':
          this.handleClose(row)
          break
      }
    },
    handleView(row) {
      this.$router.push({ name: 'WorkOrderDetails', params: { id: row.id, title: row.title }})
    },
    openUpdateDialog(row) {
      this.currentRow = { ...row } // populate form with row data
      this.updateDialogVisible = true
    },
    handleUpdate() {
      this.updateDialogVisible = false
      this.updateOrderWorks(this.currentRow)
    },
    judgeTermination(row) {
      if (row.status === 'termination') {
        this.$message({
          type: 'warning',
          message: '该工单已经结束'
        })
        return true
      }
      return false
    },
    handleShift() {
      this.shiftDialogVisible = false
      // 实现转交操作
      this.shiftCurrentHandler(this.currentRow)
    },
    openShiftDialog(row) {
      if (this.judgeTermination(row)) {
        return
      }
      this.$confirm('是否确认转交该工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.currentRow = { ...row }
        this.shiftDialogVisible = true
      }).catch(() => {
        this.$showInfo('已取消重新开启')
      })
    },
    handleUrge(row) {
      if (this.judgeTermination(row)) {
        return // 如果 judgeTermination 返回 true，则直接返回，不执行后面的逻辑
      }
      this.$confirm('是否确认催办该工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.currentRow = { ...row }
        this.sendUrgeMessage(this.currentRow)
      }).catch(() => {
        this.$showInfo('催办已取消')
      })
    },
    handleReopen(row) {
      // 实现重新打开操作
      this.$confirm('是否确认重新开启该工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {this.reopenOrderWorks(row)}).catch(() => {
        this.$showInfo('重新已取消')
      })
    },
    handleClose(row) {
      this.$confirm('是否确认关闭该工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.closeOrderWorks(row)
      }).catch(() => {
        this.$showInfo('已关闭')
      })
    },
    resetForm() {
      this.currentRow = {}
    }
  }
}
</script>

<style scoped>
.fixed-dropdown-menu {
  width: 80px; /* 设置下拉菜单的固定宽度 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>

