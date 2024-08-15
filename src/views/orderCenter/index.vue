<template>
  <div class="work-order-apply" style="margin: 15px;">
    <el-card shadow="hover">
      <el-alert type="info" show-icon :title="$t('order.description')" />
      <el-alert type="warning" show-icon>
        <a href="https://www.baidu.com" style="font-size: 13px" target="_blank">👉  一些日常的问题可以点击这里.</a>
      </el-alert>
    </el-card>

    <!-- 查询结果显示 -->
    <el-card shadow="hover">
      <div class="outerframe">
        <div class="selectframe">
          <el-input v-model="searchContent" placeholder="请输入内容" style="max-width: 400px;" @change="searchData">
            <el-button slot="append" icon="el-icon-search" style="margin-left: -20px;" />
          </el-input>
          <el-button icon="el-icon-refresh" style="margin-left: 10px;" @click="handleReset" />
        </div>

        <!-- 我的收藏 -->
        <div class="flow-group-div" v-if="!isSingleSearch && favoriteItems.length > 0">
          <div class="flow-group">
            <div class="own-collection-title">
              <div class="collect-icon">
                <i class="fa fa-star" style="color: #FCE38A; font-size: 20px" />
              </div>
              <span>我的收藏</span>
            </div>
            <el-row>
              <el-col v-for="(item, index) in favoriteItems" :key="index" :span="6">
                <div class="order-class" @mouseenter="toggleStar(true, item.id)" @mouseleave="toggleStar(false, null)">
                  <div class="workflow-apply-common-row workflow-apply" @click.stop="handleClick(item)">
                    <div class="workflow-apply-icon" style="cursor: pointer;">
                      <i :class="item.icon" class="custom-icon" />
                    </div>
                    <div class="work-order-apply-title">
                      <div class="order-heading">{{ item.title }}</div>
                      <div class="order-description">{{ item.description }}</div>
                    </div>
                    <div v-if="showStar && currentHovered === item.id" class="star-container">
                      <i class="fa fa-star custom-star" :class="{ 'favorited': item.favorite }" @click.stop="toggleFavorite(item)" @mouseenter="showTip(true)" @mouseleave="showTip(false)" />
                      <div v-if="showStarTip" class="star-tip">{{ item.favorite ? '取消收藏' : '点击收藏' }}</div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 工单类别 -->
        <div class="flow-group-div" v-for="category in categories" :key="category.id" v-if="filteredItems(category.id).length > 0">
          <div class="flow-group">
            <div class="own-collection-title">
              <div class="order-title">{{ category.chineseName }}</div>
            </div>
            <el-row>
              <el-col v-for="(item, index) in filteredItems(category.id)" :key="index" :span="6">
                <div class="order-class" @mouseenter="toggleStar(true, item.id)" @mouseleave="toggleStar(false, null)">
                  <div class="workflow-apply-common-row workflow-apply" @click.stop="handleClick(item)">
                    <div class="workflow-apply-icon" style="cursor: pointer;">
                      <i :class="item.icon" class="custom-icon" />
                    </div>
                    <div class="work-order-apply-title">
                      <div class="order-heading">{{ item.title }}</div>
                      <div class="order-description">{{ item.description }}</div>
                    </div>
                    <div v-if="showStar && currentHovered === item.id" class="star-container">
                      <i class="fa fa-star custom-star" :class="{ 'favorited': item.favorite }" @click.stop="toggleFavorite(item)" @mouseenter="showTip(true)" @mouseleave="showTip(false)" />
                      <div v-if="showStarTip" class="star-tip">{{ item.favorite ? '取消收藏' : '点击收藏' }}</div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
import { itemsList, updateItems } from '@/api/smart/orderItems'
import { categoryList} from '@/api/smart/flowCenter'

export default {
  name: 'ItemsList',
  data() {
    return {
      isSingleSearch: false,
      orderItems: [],  // 全量的工单数据
      categories: [],  // 全量的分类数据
      searchContent: '',
      showStar: false,
      showStarTip: false,
      currentHovered: null,
      itemsQuery: {
        page: 1,
        pageSize: 9999,
      },
      originalCategories: [], // 保存初始分类数据
    }
  },
  computed: {
    // 过滤favorite为true的数据
    favoriteItems() {
      return this.orderItems.filter(item => item.favorite)
    }
  },
  created() {
    // 在组件创建时自动发送请求获取订单项数据
    this.getItemsList()
    this.getTemplateCategory()
  },
  methods: {
    // 跳转到对应的页面，根据数据库link字段的值进行跳转
    handleClick(item) {
      this.$router.push({ name: 'FormRender', params: { bindTempLate: item.bindTempLate, title: item.title, link: item.link }})
    },
    // 根据数据库数据Id字段，显示收藏图标
    toggleStar(value, ID) {
      this.showStar = value
      this.currentHovered = value ? ID : null
    },
    // 鼠标事件，当鼠标停留显示图标
    showTip(value) {
      this.showStarTip = value
    },
    // 收藏和取消收藏  调用后端接口，更改数据库收藏字段状态
    toggleFavorite(item) {
      item.favorite = !item.favorite // 切换收藏状态
      const { createdAt, updatedAt, ...cleanItem } = item
      updateItems(cleanItem).then(response => {
        if (response.code === 200) {
          if (item.favorite) {
            this.$message.success(`已成功收藏${item.title}工单`)
          } else {
            this.$message.success(`已取消收藏${item.title}工单`)
          }
        }
      })
    },
    // 调用后端接口，取回工单页面的数据
    getItemsList() {
      itemsList(this.itemsQuery).then(response => {
        this.orderItems = response.data
      })
    },

    // 查询工单类别用于在工单申请页面显示
    getTemplateCategory() {
      categoryList(
          this.itemsQuery
      ).then(response => {
        const categoryRes = response.data
        this.originalCategories = categoryRes.map(item => ({
          id: item.id,
          name: item.name,
          chineseName: item.chineseName
        }))
        this.categories = [...this.originalCategories]; // 初始化分类数据
      })
    },
    async searchData() {
      this.listLoading = true;
      setTimeout(() => {
        if (this.searchContent) {
          // 过滤工单数据
          const filteredOrderItems = this.orderItems.filter(item => item.title.includes(this.searchContent));
          this.isSingleSearch = filteredOrderItems.length === 1; // 判断是否只搜索到一个结果

          // 更新分类数据，仅保留包含搜索结果的分类
          this.categories = this.originalCategories.map(category => {
            const filteredItems = filteredOrderItems.filter(item => item.categoryId === category.id);
            return {
              ...category,
              items: filteredItems,
            };
          }).filter(category => category.items.length > 0); // 过滤掉没有匹配项的分类
        } else {
          // 如果没有搜索内容，恢复原始数据
          this.getItemsList();
          this.categories = [...this.originalCategories]; // 恢复到原始分类数据
          this.isSingleSearch = false;
        }
        this.listLoading = false;
      }, 500);
    },
    filteredItems(categoryId) {
      return this.orderItems.filter(item => item.categoryId === categoryId)
    },
    handleReset() {
      setTimeout(() => {
        this.searchContent = ''
        this.searchData()
      }, 400)
    },
  }
}
</script>


<style lang="scss" scoped>

.order-class {
  position: relative;
  padding: 10px;
  margin-bottom: 0;
  margin-top: 15px;
  width: 32%;
  .workflow-apply-common-row {
    position: relative;
    border: 2px solid #eeeeee;
    border-radius: 10px;
    background-color: #f9fbfd;
    display: flex;
    width: 330%;
    align-items: center; /* 确保图标和文字垂直居中 */
    .custom-star {
      /* 五角星图标的样式 */
      font-size: 30px;
      margin-left: 50px;
      color: #FCE38A;
      transition: color 0.3s;
      position: absolute;
      top: -10px;
      right: 5px
    }
  }
  .custom-icon {
    font-size: 39px
  }
  .work-order-apply-title {
    margin-left: 5px;
    padding-right: 5px;
    cursor: pointer;
    flex-grow: 1;
  }
  .workflow-apply {
    display: flex;
    padding: 15px 15px 15px 8px;
    margin-bottom: 10px;
    height: 70px;
    position: relative;
  }
  .workflow-apply .workflow-apply-icon {
    width: 60px;
    height: 44px;
    line-height: 44px;
    text-align: center;
  }
  .workflow-apply:last-child {
    margin-bottom: 0;
  }
  .order-heading {
    font-weight: 700;
    height: 20px;
    line-height: 20px;
    font-size: 14px;
  }
  .order-description {
    color: rgb(121, 135, 156);
    height: 20px;
    line-height: 20px;
    font-size: 13px;
  }
}

.star-container {
  position: relative;
  .star-tip {
    display: inline-block; /* 确保文字水平排列 */
    writing-mode: horizontal-tb; /* 明确指定水平书写模式 */
    white-space: nowrap; /* 防止自动换行 */
    transform: none; /* 确保没有不必要的变换 */
    position: absolute;
    background-color: black; /* 设置提示框背景颜色 */
    top: -45px; /* 调整提示框位置，显示在星星上方 */
    right: -11px; /* 使提示框与星星左对齐 */
    color: white; /* 设置文字颜色为白色 */
    padding: 5px;
    border-radius: 5px;
    z-index: 200; /* 保证提示框显示在星星之上 */
    font-size: 12px; /* 调整字体大小 */
  }
  .star-tip:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    border: 5px solid transparent;
    border-top-color: black;
    transform: translateX(-50%);
  }
}

.outerframe {
  border: 1px solid #eeeeee;
  box-shadow: 1px 4px 4px rgba(0, 0, 0, 0.3);
  padding: 10px;
  margin-bottom: 20px;
  .selectframe {
    margin-top: 15px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    width: 100%;
  }
}

.workflow-apply:hover .star-tip {
  display: block; /* 鼠标悬停时显示提示框 */
}
.flow-group-div {
  .flow-group {
    margin-bottom: 25px;
    .own-collection-title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 5px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e4e7ed;
      height: 30px;
      line-height: 26px;
      .collect-icon {
        width: 23px;
        display: inline-block;
        position: relative;
      }
      .order-title {
        font-size: 15px;
        font-weight: 700;
      }
    }
  }
}


.el-alert--info.is-light {
  background-color: #ecf1fd;
  color: #303133;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

</style>
