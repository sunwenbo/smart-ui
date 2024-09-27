<template>
  <div class="header-notify">
    <div class="icon-wrapper" @click.stop="toggleDialog">
      <i class="fa fa-bell notify-icon" />
      <span v-if="unreadNotifications.length > 0" class="notification-dot" />
    </div>
    <el-dialog :visible.sync="show" :title="dialogTitle" width="650px" :modal="false" top="30vh">
      <div class="notification-list">
        <div v-if="unreadNotifications.length === 0" class="no-notifications">暂无通知</div>
        <div v-else>
          <div v-for="(item, index) in unreadNotifications" :key="item.id" class="notification-item">
            <div class="notification-content">
              <div class="notification-index">通知 {{ index + 1 }}：</div>
              <div class="notification-message">{{ item.message }}</div>
            </div>
            <el-button type="text" size="small" @click="handleNotificationAcknowledge(item)">我知道了</el-button>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button  type="primary" @click="show = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrderWorkNotify, updateOrderWorkNotify } from '@/api/smart/common'

export default {
  name: 'HeaderNotify',
  data() {
    return {
      dialogTitle: '消息通知',
      show: false,
      notifications: [],
    }
  },
  computed: {
    unreadNotifications() {
      return this.notifications.filter(notification => notification.readStatus === 0);
    }
  },
  mounted() {
    this.fetchNotifications()
  },
  methods: {
    messageNotify(data) {
      const h = this.$createElement;
      this.$notify({
        title: '工单通知',
        message: h('i', {style: 'color: teal'}, data.message)
      });
    },
    async fetchNotifications() {
      try {
        const response = await getOrderWorkNotify();
        if (response.code === 200) {
          this.notifications = response.data
          if (this.notifications.length > 0 && this.notifications) {
            this.notifications.forEach(item => {
              if (item.readStatus === 0) {  // 判断每个通知的 readStatus 是否为 0, 0 未读 1 已读
                this.messageNotify(item)
              }
            })
          }
        } else {
          console.error('Unexpected response structure', response);
        }
      } catch (error) {
        console.error('Error fetching notifications', error);
      }
    },
    async updateNotifyStatus(row) {
      try {
        const updateNotifyQuery = {
          id: row.id,
          readStatus: 1
        }
        const response = await updateOrderWorkNotify(updateNotifyQuery)
        if (response.code === 200) {
          this.$showSuccess('通知已读成功');
          await this.fetchNotifications(); // Refresh the notifications after update
        }
      } catch (error) {
        console.error('Error updating notification status', error);
      }
    },
    toggleDialog() {
      this.show = !this.show
    },
    handleNotificationAcknowledge(item) {
      // 处理通知被确认的逻辑
      this.updateNotifyStatus(item)
    }
  }
}
</script>

<style lang="scss" scoped>
.header-notify {
  line-height: 35px;

  .icon-wrapper {
    position: relative;
    display: inline-block;

    .notify-icon {
      cursor: pointer;
      font-size: 22px; /* 增大图标 */
      vertical-align: middle;
      margin-top: 10px;
      transition: color 0.3s;

      &:hover {
        color: #da8787; /* 添加悬停效果 */
      }
    }
  }

  .notification-dot {
    position: absolute;
    top: 5px; /* 调整位置 */
    right: -8px;
    width: 10px; /* 增大圆点 */
    height: 10px;
    background-color: red;
    border-radius: 50%;
  }

  .notification-list {
    border: 1px solid #ccc;
    border-radius: 8px; /* 增加圆角 */
    margin-top: 15px; /* 调整顶部边距 */
    padding: 15px; /* 调整内边距 */
    max-height: 400px; /* 设置最大高度 */
    overflow-y: auto; /* 添加滚动条 */
  }

  .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0; /* 添加上下内边距 */
    border-bottom: 1px solid #e4e7ed; /* 添加分隔线 */

    &:last-child {
      border-bottom: none; /* 最后一项不显示分隔线 */
    }
  }

  .notification-index {
    font-size: 16px; /* 增大索引 */
    color: #666; /* 深化颜色 */
  }

  .notification-message {
    font-size: 15px; /* 增大消息 */
    color: #333; /* 深化颜色 */
  }

}

</style>


