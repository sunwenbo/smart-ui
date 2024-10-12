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
          <el-tooltip slot="action" class="item" effect="dark" content="所有工单" placement="top-start">
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
          <el-tooltip slot="action" class="item" effect="dark" content="状态为已结束或者手动结束(近10天)" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-bar :chart-data="completedOrdersLast10Days" />
          </div>
          <template slot="footer">完成率 <span>{{ conversionRate }}%</span></template>
        </chart-card>
      </el-col>

      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card class="chart-card" title="待办工单" :total="pendingTasks">
          <el-tooltip slot="action" class="item" effect="dark" content="非结束的工单(近10天)" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-area :chart-data="pendingOrdersLast10Days" />
          </div>
          <template slot="footer">待处理工单:<span>{{ pendingTasks }}</span></template>
        </chart-card>
      </el-col>

      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card class="chart-card" title="当前处理中的工单数" :total="currentProcessingOrders">
          <el-tooltip slot="action" class="item" effect="dark" content="正在处理的工单" placement="top-start">
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
          <el-tab-pane label="工单统计" lazy>
            <div>
              <el-select v-model="timeFrame" placeholder="选择时间范围" @change="fetchOrderCountByPeriod">
                <el-option label="按月" value="month"></el-option>
                <el-option label="按周" value="week"></el-option>
              </el-select>
            </div>
            <el-row>
              <el-col :span="16">
                <div ref="lineChart" style="width: 100%; height: 400px;"></div>
              </el-col>
              <el-col :span="8">
                <rank-list title="提交排行榜" :list="orderSubmitList" />
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="工单评分统计" lazy>
            <div>
              <el-select v-model="timeFrame" placeholder="选择时间范围" @change="updateBarData">
                <el-option label="按月" value="month"></el-option>
                <el-option label="按周" value="week"></el-option>
              </el-select>
            </div>
            <el-row>
              <el-col :span="16">
                <bar :list="orderRatingCount" title="评分趋势" />
              </el-col>
              <el-col :span="8">
                <rank-list title="评分排行榜" :list="orderRatingList" />
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
import * as echarts from 'echarts';


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
      // 模拟从后端获取的数据，实际可以通过 API 获取
      timeFrame: 'month',  // 默认按月统计， month 、 week
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
      orderData: [],
      orderRatingCount: [],
      orderSubmitList: [],
      orderRatingList: [],
      completedOrdersLast10Days: [],
      pendingOrdersLast10Days: [],
      notifications: [
        { id: 1, title: "工单申请过程中，有任何问题请联系【孙文波（ swb956721830@163.com ）】协助处理" }
      ],
    }
  },
  async mounted() {
    await this.fetchOrderStatistics()
    await this.fetchOrderCountByPeriod()
    await this.fetchOrderRatingsByPeriod()
    this.initChart()
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
        this.completedOrdersLast10Days = response.data.completedOrdersLast10Days
        this.pendingOrdersLast10Days = response.data.pendingOrdersLast10Days
      }
    },
    // 初始化折线图
    initChart() {
      const chart = echarts.init(this.$refs.lineChart);
      const option = {
        // title: { text: '最近 7 天内工单的工单提交统计' },
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['所有', '已结束', '进行中'],
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.orderData.map(item => item.date),
        },
        yAxis: {
          type: 'value',
          name: '工单数量',
        },
        series: [
          {
            name: '所有',
            type: 'line',
            data: this.orderData.map(item => item.total),
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2,
              color: '#5470C6',
            },
            itemStyle: {
              color: '#5470C6',
            },
          },
          {
            name: '已结束',
            type: 'line',
            data: this.orderData.map(item => item.completed),
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2,
              color: '#91CC75',
            },
            itemStyle: {
              color: '#91CC75',
            },
          },
          {
            name: '进行中',
            type: 'line',
            data: this.orderData.map(item => item.underWay),
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2,
              color: '#FAC858',
            },
            itemStyle: {
              color: '#FAC858',
            },
          },
        ],
      };
      chart.setOption(option);
    },
    async fetchOrderCountByPeriod() {
      const response = await getOrderCountByPeriod({ period: this.timeFrame === 'month' ? 'month' : 'week' })
      if (response.code === 200) {
        this.orderData = response.data.orderStats.map(stat => ({
          date: stat.date,
          total: stat.total,
          completed: stat.completed,
          underWay: stat.underWay
        }));
        this.orderSubmitList = response.data.submissionRanking.map((item, index) => ({
          name: item.name,
          total: item.total
        }))
        // 获取数据后重新初始化图表
        this.initChart()
      }
    },
    async fetchOrderRatingsByPeriod() {
      const response = await getOrderRatingsByPeriod({ period: this.timeFrame === 'month' ? 'month' : 'week' })
      if (response.code === 200) {
        this.orderRatingCount = response.data.ratingsStats.map(stat => ({ x: stat.date, y: stat.average }))
        this.orderRatingList = response.data.ratingRanking.map(item => {
          return {
            name: item.name,   // 保留 name 字段
            total: item.score  // 将 score 的值赋给 total
          };
        });        // 获取数据后重新初始化图表
      }
    },
    updateBarData() {
      this.fetchOrderRatingsByPeriod()
    }
  }
}
</script>



<style lang="scss" scoped>
.chart-card {
  height: 190px; /* 设置统一高度 */
}

.rank {
  padding: 0 32px 32px 10px;
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
