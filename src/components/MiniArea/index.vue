<template>
  <div class="antv-chart-mini">
    <div class="chart-wrapper" :style="{ height: 46 }">
      <v-chart :force-fit="true" :height="height" :data="formattedData" :padding="[36, 0, 18, 0]">
        <v-tooltip />
        <v-smooth-area position="x*y" />
      </v-chart>
    </div>
  </div>
</template>

<script>


export default {
  name: 'MiniArea',
  props: {
    chartData: {
      type: Array,
      required: true,
      default: () => [] // 确保默认是一个空数组
    }
  },
  computed: {
    formattedData() {
      // 确保图表数据的格式为 [{ x: '日期', y: '值' }]
      return this.chartData.map(item => ({
        x: item.date, // 日期字段
        y: item.count // 工单数
      }))
    }
  },
  data() {
    return {
      height: 100
    }
  }
}
</script>

<style lang="scss" scoped>
  .antv-chart-mini {
  position: relative;
  width: 100%;

  .chart-wrapper {
    position: absolute;
    bottom: -28px;
    width: 100%;

/*    margin: 0 -5px;
    overflow: hidden;*/
  }
}
</style>
