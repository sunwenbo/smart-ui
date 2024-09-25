<template>
  <div class="dashboard-editor-container">
    <el-card class="notifications" :bordered="false" style="margin-bottom: 10px;">
      <h4 class="notification-title">通知与公告</h4>
      <div v-for="notification in notifications" :key="notification.id" class="notification-item">
        <el-alert :title="notification.title" type="info" show-icon />
      </div>
    </el-card>

    <el-row :gutter="12">
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card class="chart-card" title="总工单数" :total="totalOrders">
          <el-tooltip slot="action" class="item" effect="dark" content="指标说明" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <trend flag="top" style="margin-right: 16px;" :rate="String(weeklyRate)">
              <span slot="term">周同比</span>
            </trend>
            <trend flag="bottom" :rate="String(dailyRate)">
              <span slot="term">日同比</span>
            </trend>
          </div>
          <template slot="footer">日均工单数/月<span>   {{ dailyAverage }}</span></template>
        </chart-card>
      </el-col>

      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card class="chart-card" title="已完结工单" :total="completedOrders">
          <el-tooltip slot="action" class="item" effect="dark" content="指标说明" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-bar />
          </div>
          <template slot="footer">完成率 <span>{{ conversionRate }}%</span></template>
        </chart-card>
      </el-col>

      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card class="chart-card" title="待办工单" :total="pendingTasks">
          <el-tooltip slot="action" class="item" effect="dark" content="指标说明" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-area />
          </div>
          <template slot="footer">待处理工单:<span>{{ pendingTasks }}</span></template>
        </chart-card>
      </el-col>

      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card class="chart-card" title="当前处理中的工单数" :total="currentProcessingOrders">
          <el-tooltip slot="action" class="item" effect="dark" content="指标说明" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-progress color="rgb(19, 194, 194)" :target="80" :percentage="currentProcessingOrders" height="8px" />
          </div>
          <template slot="footer">
            <trend flag="top" style="margin-right: 16px;" :rate="weeklyOperationRate">
              <span slot="term">同周比</span>
            </trend>
            <trend flag="bottom" :rate="dailyOperationRate">
              <span slot="term">日环比</span>
            </trend>
          </template>
        </chart-card>
      </el-col>
    </el-row>

    <el-card :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard">
        <el-tabs>
          <el-tab-pane label="工单统计">
            <div>
              <el-select v-model="timeFrame" placeholder="选择时间范围" @change="updateBarData">
                <el-option label="按月" value="month"></el-option>
                <el-option label="按周" value="week"></el-option>
              </el-select>
            </div>
            <el-row>
              <el-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar :list="orderCount" title="工单数趋势" />
              </el-col>
              <el-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="个人提交排行榜" :list="orderSubmitList" />
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="工单评分统计">
            <el-row>
              <el-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar :list="orderRatingCount" title="评分趋势" />
              </el-col>
              <el-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="个人评分排行榜" :list="orderRatingList" />
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
import ChartCard from '@/components/ChartCard'
import Trend from '@/components/Trend'
import MiniArea from '@/components/MiniArea'
import MiniBar from '@/components/MiniBar'
import MiniProgress from '@/components/MiniProgress'
import RankList from '@/components/RankList/index'
import Bar from '@/components/Bar.vue'
import { getOrderStatistics, getOrderCountByPeriod, getOrderRatingsByPeriod } from '@/api/smart/dashboard'

export default {
  name: 'DashboardSmart',
  components: {
    ChartCard,
    Trend,
    MiniArea,
    MiniBar,
    MiniProgress,
    RankList,
    Bar
  },
  data() {
    return {
      timeFrame: 'month',
      totalOrders: 0,
      completedOrders: 0,
      pendingTasks: 0,
      dailyAverage: 0,
      conversionRate: 0,
      currentProcessingOrders: 0,
      weeklyRate: '0',
      dailyRate: '0',
      weeklyOperationRate: '0',
      dailyOperationRate: '0',
      orderCount: [],
      orderRatingCount: [],
      orderSubmitList: [],
      orderRatingList: [],
      notifications: [
        { id: 1, title: "工单申请过程中，有任何问题请联系【孙文波（ swb956721830@163.com ）】协助处理" }
      ],
    }
  },
  async mounted() {
    await this.fetchOrderStatistics()
    await this.fetchOrderCountByPeriod()
    await this.fetchOrderRatingsByPeriod()
  },
  methods: {
    async fetchOrderStatistics() {
      const response = await getOrderStatistics()
      if (response.code === 200) {
        this.totalOrders = response.data.totalOrders
        this.completedOrders = response.data.completedOrders
        this.pendingTasks = response.data.pendingOrders
        this.dailyAverage = response.data.dailyAverage
        this.conversionRate = response.data.completionRate
        this.currentProcessingOrders = response.data.currentProcessingOrders
        this.weeklyRate = response.data.currentHandlerOrdersWeekOverWeek
        this.dailyRate = response.data.currentHandlerOrdersDayOverDay
      }
    },
    async fetchOrderCountByPeriod() {
      const response = await getOrderCountByPeriod({ period: this.timeFrame === 'month' ? 'month' : 'week' })
      if (response.code === 200) {
        this.orderCount = response.data.orderStats.map(stat => ({ x: stat.date, y: stat.count }))

        this.orderSubmitList = response.data.submissionRanking.map((item, index) => ({
          name: item.name,
          total: item.total
        }))
      }
    },
    async fetchOrderRatingsByPeriod() {
      const response = await getOrderRatingsByPeriod({ period: this.timeFrame === 'month' ? 'month' : 'week' })
      if (response.code === 200) {
        this.orderRatingCount = response.data.ratingsStats.map(stat => ({ x: stat.date, y: stat.average }))

        console.log('this.orderRatingCount=',this.orderRatingCount)
        this.orderRatingList = response.data.ratingRanking
        console.log('this.orderRatingList=',this.orderRatingList)

      }
    },
    updateBarData() {
      this.fetchOrderCountByPeriod()
      this.fetchOrderRatingsByPeriod()
    }
  }
}
</script>



<style lang="scss" scoped>
.chart-card {
  height: 190px; /* 设置统一高度 */
}

.notification-title {
  font-size: 15px; /* 调整标题字体大小 */
  margin: 0; /* 去掉默认的上下间距 */
  padding-bottom: 13px; /* 可以适当添加下边距 */
}

.shortcut-operations, .notifications {
  margin-top: 5px;
  background-color: #fff;
}
.notification-item {
  margin-bottom: 10px;
}

.dashboard-editor-container {
  padding: 12px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

.el-alert--info.is-light {
  background-color: #ecf1fd;
  color: #303133;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

::v-deep .el-tabs__item {
  padding-left: 16px!important;
  height: 50px;
  line-height: 50px;
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
