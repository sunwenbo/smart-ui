<template>
  <div class="app-container" style="width: 100%;">
    <div>
      <el-alert title="工单申请过程中，有任何问题请联系【孙文波（ swb956721830@163.com ）】协助处理" type="info" show-icon />
      <el-alert :title="'当前工单状态：' + getStatusText(orderDetail.status)" type="warning" show-icon />
    </div>
    <el-card>
      <div class="custmo-steps">
        <span> 进度 </span>
        <hr class="divider">
        <el-steps :space="200" :active="currentStepIndex" finish-status="success">
          <el-step
            v-for="(node, index) in stepNodes"
            :key="node.id"
            :title="node.label"
          />
        </el-steps>
      </div>
    </el-card>
    <el-card>
      <div class="baseInfo-window">
      <span>
        基础信息
      </span>
        <hr class="divider">
        <el-form :model="orderDetail" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="标题:">
                <el-input v-model="orderDetail.title" :disabled="true" style="width: calc(100% - 110px);" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门:" prop="department">
                <el-input v-model="orderDetail.department" :disabled="true" style="width: calc(100% - 110px);" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form v-if="orderDetail.priority" :model="orderDetail" label-width="100px">
                <el-form-item label="优先级:" prop="priority">
                  <el-tag :type="getTagType(orderDetail.priority)">
                    {{ getPriorityText(orderDetail.priority) }}
                  </el-tag>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="18">
              <el-form-item label="描述信息:" prop="description">
                <el-input v-model="orderDetail.description" :disabled="true" type="textarea" :rows="2" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
    <el-card>
      <div class="form-window">
        <span>表单信息</span>
        <hr class="divider">
        <v-form-render ref="vFormRef" :form-json="formJson" :form-data="formData" :option-data="optionData"  />
      </div>
    </el-card>
    <el-card>
      <div class="oper-window">
        <span> 操作历史 </span>
        <hr class="divider">
        <el-table :data="histOperData" border stripe>
          <el-table-column prop="nodeName" label="节点名称" width="150" align="center" />
          <el-table-column prop="transfer" label="流转" width="150" align="center" />
          <el-table-column prop="handlerName" label="处理人" width="140" align="center" />
          <el-table-column :label="$t('table.status')" width="140px" align="center" prop="status">
            <template slot-scope="scope">
              {{ getResultText(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" width="140px" label="备注" align="center" />
          <el-table-column prop="handleDuration" width="140px" label="处理时长(分)" align="center" />
          <el-table-column prop="handleTime" width="180px" label="处理时间" align="center" />
          <el-table-column :label="$t('table.createdAt')" min-width="90px" align="center" prop="createdAt" />
        </el-table>
      </div>
    </el-card>
    <el-card v-if="isCurrentUserHandler">
      <div class="action-buttons">
        <el-button type="primary" @click="handleApprove">同意</el-button>
        <el-button type="danger" @click="handleReject">拒绝</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import {handleOrderWork, orderWorkHistory, orderWorksSearch} from '@/api/smart/workOrder'
import {getDeptList} from "@/api/admin/sys-dept";
import {deleteFlow} from "@/api/smart/flowManage";

export default {
  name: 'WorkOrderDetails',
  data() {
    return {
      formJson: {
        formConfig: {},
        widgetList: []
      },
      stepNodes: [],
      currentStepIndex: 1,
      matchedTemplate: [],
      formData: {},
      currentFlowData: {
        structure: {
            nodes: [],
            edges: []
        }
      },
      optionData: {},
      orderWorksStatus: [],
      orderWorksPriority: [],
      flowResultResponse: [],
      priorityTagMap: [],
      histOperData: [],
      orderDetail: {
        bindFlowData: undefined,
        currentHandlerID: undefined
      },
      listHistor: {
        title: '',
      },
      handleData: {
        id: '',
        title: '',
        currentHandler: '', // 当前操作人
      },
    }
  },
  computed: {
    isCurrentUserHandler() {
      if (this.orderDetail.currentNode !== "结束") {
        return this.$store.getters.userid ===  this.orderDetail.currentHandlerID
      } else {
        return false
      }
    }
  },

  async activated() {
    try {
      // 先获取字典数据
      const [statusResponse, priorityResponse, priorityResponseStatus,flowResultResponse] = await Promise.all([
        this.getDicts('order_works_status'),
        this.getDicts('order_works_priority_type'),
        this.getDicts('order_works_priority_status'),
        this.getDicts('order_works_flow_result')
      ]);
      this.orderWorksStatus = statusResponse.data;
      this.orderWorksPriority = priorityResponse.data;
      this.flowResultResponse = flowResultResponse.data;
      // 转换 priorityTagMap 为对象
      this.priorityTagMap = priorityResponseStatus.data.reduce((map, item) => {
        map[item.label] = item.value;
        return map;
      }, {});

      // 根据id查询该工单的详细数据
      await orderWorksSearch(this.$route.params.id).then(response => {
        this.orderDetail = response.data
      })
      await this.getOrderWorkHistory()
      await this.processOrderWork();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  },
  methods: {
    async processOrderWork() {
      try {
        const nodes = this.orderDetail.bindFlowData.structure.nodes
        const currentNode = this.orderDetail.currentNode

        // 提取步骤节点
        this.stepNodes = nodes;

        // 找到当前步骤的索引
        this.currentStepIndex = nodes.findIndex(node => node.label === currentNode) + 1
        // 查询该工单关联的模板详细数据
        await this.getFlowTemplate().then(response => {
          const flowTemplatedata = response.data;
          this.matchedTemplate = flowTemplatedata.find(template =>
              template.name === this.orderDetail.template
          )
          // 匹配到模板，获取模板的组件信息数据，然后渲染到vform
          if (this.matchedTemplate) {
            // 递归设置 disabled 属性为 true
            const setDisabledTrue = (widgetList) => {
              widgetList.forEach(widget => {
                if (widget.options && widget.options.disabled !== undefined) {
                  widget.options.disabled = true;
                }
                if (widget.widgetList && widget.widgetList.length > 0) {
                  setDisabledTrue(widget.widgetList);
                }
                if (widget.rows && widget.rows.length > 0) {
                  widget.rows.forEach(row => {
                    if (row.cols && row.cols.length > 0) {
                      row.cols.forEach(col => {
                        setDisabledTrue([col]);
                      });
                    }
                  });
                }
              });
            };

            setDisabledTrue(this.matchedTemplate.formData.widgetList)
            this.$refs.vFormRef.setFormJson(this.matchedTemplate.formData)
            this.$refs.vFormRef.setFormData(this.orderDetail.formData)
          }
        })
      } catch (error) {
        console.error('Failed to fetch order works:', error)
      }
    },
    getOrderWorkHistory() {
      this.listHistor.title = this.$route.params.title
      try {
        orderWorkHistory(this.listHistor).then(response => {
          this.histOperData = response.data
        })
      } catch (error) {
        console.error('Failed to fetch order works:', error)
      }
    },
    getTagType(priority) {
      return this.priorityTagMap[priority] || '';
    },
    getStatusText(status) {
      const statusItem = this.orderWorksStatus.find(item => item.value === status);
      return statusItem ? statusItem.label : status;
    },
    getPriorityText(priority) {
      const priorityItem = this.orderWorksPriority.find(item => item.value === priority);
      return priorityItem ? priorityItem.label : priority;
    },
    getResultText(value) {
      const option = this.flowResultResponse.find(option => option.value === value)
      return option ? option.label : '';
    },
    async handleApprove() {
      try {
        const response = await handleOrderWork({
          id: this.orderDetail.id,
          actionType: '1' // 1 为同意  0 为拒绝
        })

        if (response.code === 200) {
          this.$showSuccess('工单审核通过');
          await this.$router.push('/orderCenter/list')
        } else {
          this.$showError('工单拒绝失败，请重试1')
        }
      } catch (error) {
        console.error('Failed to approve order:', error)
        this.$showError('工单拒绝失败，请重试2')
      }
    },
    async handleReject() {
      this.$confirm('此操作将会返回至上个流程, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.handleData.id = this.orderDetail.id
        this.handleData.actionType = '0'
        try {
          const response = await handleOrderWork(this.handleData)
          if (response.code === 200) {
            this.$showSuccess('工单拒绝成功');
            await this.$router.push('/orderCenter/list')
          } else {
            this.$showError('工单拒绝失败，请重试')
          }
        } catch (error) {
          console.error('Failed to reject order:', error)
          this.$showError('工单拒绝失败，请重试')
        }
      })
    }
  }
}
</script>

<style scoped>

.action-buttons {
  display: flex;
  justify-content: center;
}

.action-buttons .el-button {
  margin: 0 30px; /* 按钮之间的间距 */
}
.custmo-steps {
  border: 1px solid #eeeeee;
  padding: 20px;
  margin-bottom: 10px;
}
.baseInfo-window {
  border: 2px solid #eeeeee;
  padding: 20px;
  margin-bottom: 20px;
}
.divider {
  border: 0;
  height: 1px;
  background: #eeeeee;
  margin-top: 5px;
  margin-bottom: 20px;
}

.form-window {
  border: 2px solid #eeeeee;
  padding: 20px;
  margin-bottom: 20px;
}

.oper-window {
  border: 2px solid #eeeeee;
  padding: 10px;
  height: auto;
}

/deep/ .el-table th {
  background-color: #f5f7fa; /* 你想要的背景颜色 */
  color: #333; /* 字体颜色 */
}
.el-alert--info.is-light {
  background-color: #ecf1fd;
  color: #303133;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}
.el-alert--warning.is-light {
  background-color: #fdf6ec;
  color: #E6A23C;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

</style>
