<template>
  <div class="app-container" style="width: 100%;">
    <el-card>
      <el-alert title="工单申请过程中，有任何问题请联系【孙文波（ swb956721830@163.com ）】协助处理" type="info" show-icon />
      <el-alert :title="'当前工单状态：' + getStatusText(orderDetail.status)" type="warning" show-icon />
    </el-card>
    <el-card>
      <div class="custmo-steps">
        <span> 工单进度 </span>
        <hr class="divider">
        <el-steps :space="200"  align-center :active="currentStepIndex" finish-status="success" >
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
    <!-- 留言组件 -->
    <el-card class="oper-window" v-if="orderDetail.bindFlowData && orderDetail.bindFlowData.comments">
      <div class="comments-section">
        <span>留言</span>
        <hr class="divider">
        <div v-if="commentsList.length > 0">
          <div class="comments-list">
            <div v-for="(comment, index) in commentsList" :key="index" :class="['comment-item', { 'my-comment': comment.username === currentUsername }]">
              <el-avatar :src="comment.avatarUrl" alt="头像" class="avatar" />
              <div class="comment-content">
                <strong>{{ comment.username }}:</strong>
                <p>{{ comment.comments }}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <el-avatar :src="userAvatar" alt="我的头像" style="margin-right: 10px" />
          <el-input type="textarea" v-model="commentsContent" style="width: 95%" placeholder="请输入您的留言" />
          <div class="submit-button">
            <el-button type="primary" style="margin-right: 10px" @click="submitComment">提交留言</el-button>
          </div>
        </div>
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
      <div v-if="orderDetail.currentNode !== '工单结束'" class="action-buttons">
        <el-button type="primary" @click="handleApprove">同意</el-button>
        <el-button type="danger" @click="handleReject">拒绝</el-button>
      </div>
      <div v-else class="action-buttons">
        <el-button type="default" @click="handleReject">返回上一层</el-button>
        <el-button type="primary" @click="handleApprove">结束工单</el-button>
      </div>
    </el-card>
    <!-- 评分弹窗 -->
    <el-dialog title="请给工单评分:" :visible.sync="ratingDialogVisible" width="30%">
      <div class="ratings-section" style="display: flex; margin-top: 25px; justify-content: center; align-items: center;">
        <el-rate
          v-model="ratingsScore"
          :colors="colors">
        </el-rate>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="ratingDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="submitRating">提交评分</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
import {handleOrderWork, orderWorkHistory, orderWorksSearch} from '@/api/smart/workOrder'
import {createOrderRating, getOrderComment, getOrderRating, createOrderComment } from "@/api/smart/comment";
import {listUser} from "@/api/admin/sys-user";

export default {
  name: 'WorkOrderDetails',
  data() {
    return {
      currentUsername: this.$store.getters.name, // 获取当前用户名
      userAvatar: this.$store.getters.avatar,
      orderRating: null, // 用于存储评分
      ratingSubmitted: false,
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'], // 等同于 { 2: '#99A9BF', 4: { value: '#F7BA2A', excluded: true }, 5: '#FF9900' }
      commentsContent: '',  // 用于存储留言内容
      commentsList: [], // 用于存储留言列表
      ratingDialogVisible: false, // 控制评分弹窗的显示
      ratingsScore: 0,            // 评分值
      formJson: {
        formConfig: {},
        widgetList: []
      },
      stepNodes: [],
      users: [], // 存储所有用户的信息
      currentStepIndex: 0,
      matchedTemplate: {},
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
      }
    }
  },
  computed: {
    isCurrentUserHandler() {
      const {currentNode, currentHandlerID} = this.orderDetail;
      const userId = this.$store.getters.userid;

      if (currentNode === "工单结束") {
        const hasRating = this.orderRating && this.orderRating.ratings !== undefined;
        return !hasRating && userId === currentHandlerID; // 只有在未评分且为当前处理人时才返回 true
      }

      return userId === currentHandlerID; // 在其他情况下直接返回
    }
  },
  mounted() {
    // 获取用户
    // 根据id查询该工单的留言信息
    // 获取指定工单的评分
    this.getUsers().then(() => {
      this.fetchComments();
      this.fetchRating();
    });
  },

  async created() {
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
      await this.processOrderWork()

    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  },
  methods: {
    async processOrderWork() {
      try {
        // 提取步骤节点
        this.stepNodes= this.orderDetail.bindFlowData.structure.nodes

        // 找到当前步骤的索引
        this.currentStepIndex = this.stepNodes.findIndex(node => node.label === this.orderDetail.currentNode) + 1

        // 查询该工单关联的模板详细数据
        await this.getFlowTemplate().then(response => {
          const flowTemplatedata = response.data.list
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
                if (widget.cols && widget.cols.length > 0) {
                  widget.cols.forEach(col => {
                    if (col.widgetList && col.widgetList.length > 0) {
                      setDisabledTrue(col.widgetList);
                    }
                  })
                }
              })
            }

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
      try {
        orderWorkHistory({title: this.$route.params.title}).then(response => {
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
    fetchRating() {
      getOrderRating(this.$route.params.id).then(response => {
        this.orderRating = response.data
      })
    },
    fetchComments() {
      getOrderComment(this.$route.params.id).then(response => {
        this.commentsList = response.data.map(comment => {
          const user = this.users.find(u => u.userId === comment.createBy);
          return {
            ...comment,
            username: user ? user.nickName : '未知用户', // 用户名称
            avatarUrl: user && user.avatar ? user.avatar : 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80' // 用户头像，替换为默认头像链接
          }
        })
      })
    },
    getUsers() {
      return listUser({pageSize: 999999}).then(response => {
        this.users = response.data.list;
      });
    },
    async handleApprove() {
      try {
        // 检查当前节点是否是 "工单结束" 并且当前用户是工单发起人
        const isInitiator = this.$store.getters.userid === this.orderDetail.currentHandlerID; // 当前处理人是发起人
        this.ratingSubmitted = false; // 标志位，判断是否提交评分

        if (this.orderDetail.currentNode === '工单结束' && isInitiator) {
          // 显示评分弹窗
          this.ratingDialogVisible = true;

          // 等待评分提交或取消
          const ratingSubmitted = await new Promise((resolve) => {
            const checkRatingSubmission = () => {
              if (!this.ratingDialogVisible) {
                resolve(this.ratingSubmitted); // 当评分弹窗关闭时，传递标志位
              } else {
                setTimeout(checkRatingSubmission, 100); // 每隔100ms检查一次
              }
            };
            checkRatingSubmission();
          });

          // 如果未提交评分，直接返回，停止后续操作
          if (!ratingSubmitted) {
            return;
          }
        }

        // 评分完成，执行工单操作
        const response = await handleOrderWork({
          id: this.orderDetail.id,
          actionType: '1' // 1 为同意 0 为拒绝
        });

        if (response.code === 200) {
          // 显示审核通过的提示并跳转
          this.$showSuccess('工单审核通过');
          await this.$router.push('/orderCenter/list');
        } else {
          this.$showError('工单操作失败，请重试');
        }
      } catch (error) {
        console.error('Failed to approve order:', error);
        this.$showError('工单操作失败，请重试');
      }
    },
    async submitRating() {
      if (this.ratingsScore > 0) {
        try {
          // 通过调用后端接口提交评分
          await createOrderRating({
            orderID: this.orderDetail.id, // 传递工单ID
            ratings: this.ratingsScore    // 传递评分值
          });

          // 显示评分提交成功的提示
          this.$showSuccess(`评分提交成功: ${this.ratingsScore}`);

          // 关闭弹窗
          this.ratingDialogVisible = false;

          // 更新标志位，表示评分已成功提交
          this.ratingSubmitted = true;

        } catch (error) {
          // 错误处理
          console.error('评分提交失败', error);
          this.$message.error('评分提交失败，请重试');
        }
      } else {
        this.$message.error('评分不能为空');
      }
    },
    async handleReject() {
      this.$confirm('此操作将会返回至上个流程, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await handleOrderWork(
            {id: this.orderDetail.id,
            actionType: '0' // 1 为同意  0 为拒绝
          })
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
    },
    async submitComment() {
      if (this.commentsContent) {
        try {
          const response = await createOrderComment({
            orderID: this.orderDetail.id, // 传递工单ID
            comments: this.commentsContent // 传递留言内容
          });

          if (response.code === 200) {
            // 获取当前用户的信息
            const currentUser = {
              username: this.currentUsername, // 从 Vuex 获取当前用户姓名
              avatarUrl: this.userAvatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80' // 默认头像
            };

            // 添加新的留言到列表
            this.commentsList.push({
              comments: this.commentsContent,
              // 你可能需要从响应中获取留言者的信息，例如姓名
              username: currentUser.username,
              avatarUrl: currentUser.avatarUrl

            })
            this.$showSuccess('留言提交成功');

            // 清空留言内容
            this.commentsContent = '';
          } else {
            this.$showError('留言提交失败，请重试');
          }
        } catch (error) {
          console.error('留言提交失败', error);
          this.$message.error('留言提交失败，请重试');
        }
      } else {
        this.$message.error('留言内容不能为空');
      }
    },
  }
}
</script>

<style scoped>

.action-buttons {
  display: flex;
  justify-content: center;
  margin: 0 30px; /* 按钮之间的间距 */
}

.custmo-steps {
  border: 1px solid #eeeeee;
  padding: 20px;
  margin-bottom: 10px;
}

.oper-window {
  border: 2px solid #eeeeee;
  padding: 10px;
  height: auto;
}

.comment-item {
  display: flex;
  align-items: flex-start; /* 垂直对齐 */
  margin-bottom: 20px;
  padding: 10px; /* 内边距 */
  background-color: #ffffff; /* 背景颜色 */
  border-radius: 13px; /* 圆角 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); /* 阴影效果 */
}

.comment-content {
  margin-left: 20px; /* 头像和留言之间的间距 */
}

.submit-button {
  display: flex;
  justify-content: flex-end; /* 右对齐 */
  margin-top: 10px; /* 输入框与按钮之间的间距 */
}
</style>
