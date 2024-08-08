<template>
  <div class="header-notify">
    <div class="icon-wrapper" @click.stop="toggleDialog">
      <i class="fa fa-bell notify-icon" />
      <span v-if="unreadNotifications.length > 0" class="notification-dot" />
    </div>
    <el-dialog :visible.sync="show" width="650px" class="custom-dialog" :modal="false">
      <div slot="title" class="custom-title">消息通知</div>
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
      <el-button style="margin-left: 550px; margin-top: 15px;" type="primary" @click="show = false">关闭</el-button>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getOrderWorkNotify, updateOrderWorkNotify } from '@/api/smart/common'

export default {
  name: 'HeaderNotify',
  data() {
    return {
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
    async fetchNotifications() {
      try {
        const response = await getOrderWorkNotify();
        if (response.code === 200) {
          this.notifications = response.data;
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
  font-size: 0 !important;

  .icon-wrapper {
    position: relative;
    display: inline-block;
    .notify-icon {
      cursor: pointer;
      font-size: 20px; /* Enlarged the icon */
      vertical-align: middle;
    }
    .notification-dot {
      position: absolute;
      top: 12px; /* Adjusted the top position */
      right: -6px; /* Adjusted the right position */
      width: 8px; /* Enlarged the dot */
      height: 8px; /* Enlarged the dot */
      background-color: red;
      border-radius: 50%;
    }
  }

  .custom-title {
    font-weight: bold;
    font-size: 18px; /* Enlarged the title */
    color: #333; /* Darkened the color */
  }

  .notification-list {
    border: 1px solid #ccc;
    border-radius: 8px; /* Increased border radius */
    margin-top: -20px; /* Increased margin top */
    padding: 15px; /* Increased padding */
  }

  .notification-index {
    font-size: 15px; /* Enlarged the index */
    color: #666; /* Darkened the color */
  }

  .notification-message {
    font-size: 14px; /* Enlarged the message */
    color: #333; /* Darkened the color */
  }
  .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .notification-content {
    display: flex;
    align-items: center;
  }

  .custom-dialog {
    font-family: 'Arial', sans-serif;
  }

}

</style>
