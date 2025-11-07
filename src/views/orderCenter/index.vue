<template>
  <div class="order-center-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="el-icon-s-order"></i>
          工单申请中心
        </h1>
        <p class="page-subtitle">选择您需要的工单类型，快速开始申请流程</p>
      </div>

      <!-- 统一信息提示卡片 -->
      <el-card
        class="unified-info-card"
        shadow="never"
      >
        <div class="info-section">
          <div class="info-item">
            <i class="el-icon-info info-icon"></i>
            <span class="info-text">{{ $t('order.description') }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <i class="el-icon-question info-icon warning"></i>
            <a
              href="https://github.com/sunwenbo/golang/raw/master/wx.jpeg"
              target="_blank"
              class="help-link"
            >
              遇到问题？点击这里获取帮助
            </a>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-card
        class="unified-content-card"
        shadow="hover"
      >
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-container">
            <el-input
              v-model="searchContent"
              placeholder="搜索工单类型..."
              prefix-icon="el-icon-search"
              class="search-input"
              @input="searchData"
              clearable
            >
            </el-input>
            <el-button
              type="primary"
              icon="el-icon-refresh"
              class="reset-btn"
              @click="handleReset"
            >
              重置
            </el-button>
          </div>
        </div>

        <div class="content-divider"></div>

        <!-- 工单列表内容 -->
        <div class="work-orders-content">
          <!-- 我的收藏 -->
          <transition name="section-fade">
            <div
              v-if="favoriteItems.length"
              class="favorites-section"
            >
              <div class="section-header">
                <div class="section-title">
                  <i class="el-icon-star-on favorite-icon"></i>
                  <span>我的收藏</span>
                  <el-badge
                    :value="favoriteItems.length"
                    class="count-badge"
                  />
                </div>
              </div>

              <div class="order-grid">
                <div
                  v-for="(item, index) in favoriteItems"
                  :key="`fav-${index}`"
                  class="order-item favorite-item"
                  @click="handleClick(item)"
                >
                  <div class="order-card">
                    <div class="order-content">
                      <div class="order-icon">
                        <i :class="item.icon"></i>
                      </div>
                      <div class="order-info">
                        <h3 class="order-title">{{ item.title }}</h3>
                        <p class="order-desc">{{ item.description }}</p>
                      </div>
                      <div class="favorite-actions">
                        <el-button
                          type="text"
                          icon="el-icon-star-on"
                          class="favorite-btn active"
                          @click.stop="toggleFavorite(item)"
                        >
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- 工单类别 -->
          <div
            v-for="category in filteredCategories"
            :key="category.id"
            class="category-section"
            v-if="category.items.length"
          >
            <div class="section-header">
              <div class="section-title">
                <i class="el-icon-folder-opened category-icon"></i>
                <span>{{ category.chineseName }}</span>
                <el-badge
                  :value="category.items.length"
                  class="count-badge"
                />
              </div>
            </div>

            <div class="order-grid">
              <div
                v-for="(item, index) in category.items"
                :key="`${category.id}-${index}`"
                class="order-item"
                @click="handleClick(item)"
              >
                <div class="order-card">
                  <div class="order-content">
                    <div class="order-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <div class="order-info">
                      <h3 class="order-title">{{ item.title }}</h3>
                      <p class="order-desc">{{ item.description }}</p>
                    </div>
                    <div class="favorite-actions">
                      <el-button
                        type="text"
                        :icon="item.favorite ? 'el-icon-star-on' : 'el-icon-star-off'"
                        :class="['favorite-btn', { active: item.favorite }]"
                        @click.stop="toggleFavorite(item)"
                      >
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="!favoriteItems.length && !filteredCategories.length"
            class="empty-state"
          >
            <el-empty description="暂无匹配的工单类型">
              <el-button
                type="primary"
                @click="handleReset"
              >重置搜索</el-button>
            </el-empty>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script>
import { itemsList } from '@/api/smart/orderItems'
import { getUserFavoriteList, createUserFavoriteList, deleteUserFavoriteList } from '@/api/smart/userFavorite'

import { categoryList } from '@/api/smart/flowCenter'

export default {
  name: 'OrderCenter',
  data () {
    return {
      orderItems: [],
      categories: [],
      searchContent: '',
      userFavorites: [],
      loading: false,
      queryParams: {
        page: 1,
        pageSize: 9999
      },
      originalCategories: [],
      searchTimer: null
    }
  },
  computed: {
    favoriteItems () {
      const favoriteIds = new Set(this.userFavorites.map(favorite => favorite.orderItemId));
      return this.orderItems.filter(item => favoriteIds.has(item.id)).map(item => ({
        ...item,
        favorite: true
      }));
    },

    filteredCategories () {
      const searchTerm = this.searchContent.toLowerCase().trim();

      if (!searchTerm) {
        return this.categories.map(category => ({
          ...category,
          items: this.orderItems.filter(item => item.categoryId === category.id)
        })).filter(category => category.items.length > 0);
      }

      return this.categories.map(category => {
        const filteredItems = this.orderItems.filter(item =>
          item.categoryId === category.id &&
          (item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm))
        );

        return {
          ...category,
          items: filteredItems
        };
      }).filter(category => category.items.length > 0);
    },

    hasSearchResults () {
      return this.favoriteItems.length > 0 || this.filteredCategories.length > 0;
    }
  },

  created () {
    this.initData();
  },

  methods: {
    async initData () {
      this.loading = true;
      try {
        await Promise.all([
          this.getItemsList(),
          this.getTemplateCategory(),
          this.getUserFavorites()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        this.$message.error('数据加载失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    handleClick (item) {
      this.$router.push({
        name: 'FormRender',
        params: {
          bindTempLate: item.bindTempLate,
          title: item.title,
          link: item.link
        }
      });
    },

    async toggleFavorite (item) {
      try {
        const isFavorited = this.userFavorites.some(fav => fav.orderItemId === item.id);

        if (isFavorited) {
          await deleteUserFavoriteList({ orderItemId: item.id });
          this.$message.success(`已取消收藏"${item.title}"`);
        } else {
          await createUserFavoriteList({ orderItemId: item.id });
          this.$message.success(`已收藏"${item.title}"`);
        }

        await this.getUserFavorites();
      } catch (error) {
        console.error('Toggle favorite failed:', error);
        this.$message.error('操作失败，请稍后重试');
      }
    },

    async getUserFavorites () {
      try {
        const response = await getUserFavoriteList();
        this.userFavorites = response.data || [];

        // 更新orderItems中的收藏状态
        const favoriteIds = new Set(this.userFavorites.map(fav => fav.orderItemId));
        this.orderItems.forEach(item => {
          item.favorite = favoriteIds.has(item.id);
        });
      } catch (error) {
        console.error('Failed to get user favorites:', error);
      }
    },

    async getItemsList () {
      try {
        const response = await itemsList(this.queryParams);
        this.orderItems = response.data.list || [];

        // 设置收藏状态
        const favoriteIds = new Set(this.userFavorites.map(fav => fav.orderItemId));
        this.orderItems.forEach(item => {
          item.favorite = favoriteIds.has(item.id);
        });
      } catch (error) {
        console.error('Failed to get items list:', error);
        throw error;
      }
    },

    async getTemplateCategory () {
      try {
        const response = await categoryList(this.queryParams);
        const categoryRes = response.data.list || [];

        this.originalCategories = categoryRes.map(item => ({
          id: item.id,
          name: item.name,
          chineseName: item.chineseName
        }));

        this.categories = [...this.originalCategories];
      } catch (error) {
        console.error('Failed to get template categories:', error);
        throw error;
      }
    },

    searchData () {
      // 使用防抖优化搜索性能
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(() => {
        // 过滤逻辑已在computed中处理
      }, 300);
    },

    handleReset () {
      this.searchContent = '';
      this.searchData();
    }
  }
}
</script>


<style lang="scss" scoped>
// 主容器 - 考虑左侧侧边栏布局
.order-center-container {
  max-width: calc(100vw - 250px); // 减去侧边栏宽度
  min-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  min-height: 100vh;
}

// 页面头部
.page-header {
  margin-bottom: 20px;

  .header-content {
    text-align: center;
    margin-bottom: 18px;

    .page-title {
      color: #303133;
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      i {
        color: #409eff;
        font-size: 1.8rem;
      }
    }

    .page-subtitle {
      color: #606266;
      font-size: 1rem;
      margin: 0;
      font-weight: 400;
    }
  }

  // 统一信息提示卡片
  .unified-info-card {
    max-width: auto;
    margin: 0 auto 25px auto;
    border: 1px solid #e9ecef;
    background: white;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    .info-section {
      display: flex;
      align-items: center;
      padding: 0;

      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        padding: 12px 16px;

        .info-icon {
          font-size: 1rem;
          color: #409eff;
          flex-shrink: 0;

          &.warning {
            color: #e6a23c;
          }
        }

        .info-text,
        .help-link {
          font-size: 0.9rem;
          color: #606266;
          text-decoration: none;
          transition: color 0.3s ease;
          line-height: 1.4;

          &:hover {
            color: #409eff;
          }
        }
      }

      .info-divider {
        width: 1px;
        height: 32px;
        background-color: #e9ecef;
        margin: 0 8px;
      }
    }
  }
}

// 主要内容区域
.main-content {
  // 统一内容卡片
  .unified-content-card {
    border-radius: 12px;
    border: 1px solid #e9ecef;
    background: white;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    // 搜索区域
    .search-section {
      padding: 16px 20px 0 20px;

      .search-container {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 0;

        .search-input {
          flex: 1;

          ::v-deep .el-input__inner {
            border-radius: 20px;
            height: 40px;
            font-size: 0.9rem;
            border: 2px solid #e4e7ed;
            transition: border-color 0.3s ease;
            padding-left: 45px;

            &:focus {
              border-color: #409eff;
            }
          }

          ::v-deep .el-input__prefix {
            left: 18px;
            color: #909399;
          }
        }

        .reset-btn {
          border-radius: 20px;
          height: 40px;
          padding: 0 20px;
          font-weight: 500;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
      }
    }

    // 内容分割线
    .content-divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e9ecef, transparent);
      margin: 20px 20px 0 20px;
    }

    // 工单内容区域
    .work-orders-content {
      padding: 20px;
    }
  }

  // 区域标题
  .section-header {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #303133;
      font-size: 1.1rem;
      font-weight: 600;
      padding: 10px 14px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      flex-wrap: nowrap; /* 防止换行 */

      .favorite-icon {
        color: #e6a23c;
        font-size: 1.6rem;
        flex-shrink: 0; /* 防止图标被压缩 */
      }

      .category-icon {
        color: #409eff;
        font-size: 1.2rem;
        flex-shrink: 0; /* 防止图标被压缩 */
      }

      span {
        flex-shrink: 0; /* 防止文字被压缩 */
        white-space: nowrap; /* 防止文字换行 */
      }

      .count-badge {
        ::v-deep .el-badge__content {
          background: linear-gradient(135deg, #e6a23c, #f7ba2a);
          border: none;
          font-size: 11px;
          height: 20px;
          line-height: 20px;
          padding: 0 6px;
          min-width: 20px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(230, 162, 60, 0.3);
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          vertical-align: baseline;
          position: relative;
          top: -2px;
        }
      }
    }
  }

  // 工单网格布局
  .order-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin-bottom: 30px;

    .order-item {
      height: 100%;

      .order-card {
        border: 1px solid #e9ecef;
        border-radius: 12px;
        transition: all 0.3s ease;
        cursor: pointer;
        height: 100%;
        background: white;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
          border-color: #409eff;

          .favorite-btn {
            opacity: 1;
            transform: scale(1);
          }
        }

        .order-content {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 28px 26px;
          position: relative;

          .order-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #409eff, #66b1ff);
            border-radius: 14px;
            flex-shrink: 0;

            i {
              font-size: 1.6rem;
              color: white;
            }
          }

          .order-info {
            flex: 1;
            min-width: 0;

            .order-title {
              margin: 0 0 8px 0;
              font-size: 1.1rem;
              font-weight: 600;
              color: #303133;
              line-height: 1.3;
              display: -webkit-box;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .order-desc {
              margin: 0;
              color: #909399;
              font-size: 0.9rem;
              line-height: 1.4;
              display: -webkit-box;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }

          .favorite-actions {
            position: absolute;
            top: 50%;
            right: 16px;
            transform: translateY(-50%);

            .favorite-btn {
              opacity: 0.7;
              transform: scale(0.9);
              transition: all 0.3s ease;
              color: #c0c4cc;
              font-size: 1.6rem;

              &.active {
                color: #e6a23c;
                opacity: 1;
              }

              &:hover {
                opacity: 1;
                transform: scale(1.1);
                color: #e6a23c;
              }
            }
          }
        }
      }

      &.favorite-item .order-card {
        background: linear-gradient(135deg, #fffbf0, #fff9e6);
        border-color: #fce38a;

        .order-title {
          font-family: inherit !important;
          font-weight: 600 !important;
          text-align: left !important;
        }

        .order-desc {
          font-family: inherit !important;
          text-align: left !important;
        }
      }
    }
  }

  // 分类区域
  .category-section {
    margin-bottom: 30px;
  }

  // 空状态
  .empty-state {
    text-align: center;
    padding: 40px 20px;

    ::v-deep .el-empty {
      .el-empty__image {
        width: 120px;
      }

      .el-empty__description {
        color: #909399;
        font-size: 0.95rem;
        margin-bottom: 20px;
      }
    }
  }
}

// 动画效果
.section-fade-enter-active,
.section-fade-leave-active {
  transition: all 0.4s ease;
}

.section-fade-enter,
.section-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

// 响应式设计
@media (max-width: 1200px) {
  .order-center-container {
    max-width: calc(100vw - 200px);
    min-width: 800px;
  }

  .order-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .order-center-container {
    max-width: 100vw;
    min-width: auto;
    padding: 15px;
  }

  .page-header .page-title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 8px;
  }

  .unified-info-card {
    max-width: 100%;
    margin-bottom: 20px;

    .info-section {
      flex-direction: column;
      gap: 0;

      .info-item {
        padding: 10px 14px;
      }

      .info-divider {
        width: 100%;
        height: 1px;
        margin: 0;
      }
    }
  }

  .search-section {
    padding: 12px 16px 0 16px !important;

    .search-container {
      flex-direction: column;
      gap: 10px;

      .search-input {
        ::v-deep .el-input__inner {
          height: 36px;
          font-size: 0.85rem;
          padding-left: 42px;
        }

        ::v-deep .el-input__prefix {
          left: 16px;
        }
      }

      .reset-btn {
        height: 36px;
        font-size: 0.85rem;
      }
    }
  }

  .content-divider {
    margin: 16px 16px 0 16px !important;
  }

  .work-orders-content {
    padding: 16px !important;
  }

  .order-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .order-content {
    padding: 16px !important;
    gap: 12px !important;

    .order-icon {
      width: 40px !important;
      height: 40px !important;

      i {
        font-size: 1.2rem !important;
      }
    }
  }

  .section-header .section-title {
    font-size: 1rem;
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .order-center-container {
    padding: 10px;
  }

  .page-header .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .unified-info-card {
    max-width: 100%;
    margin-bottom: 18px;

    .info-section {
      .info-item {
        padding: 8px 12px !important;
        gap: 10px !important;

        .info-icon {
          font-size: 0.9rem !important;
        }

        .info-text,
        .help-link {
          font-size: 0.85rem !important;
        }
      }
    }
  }

  .search-section {
    padding: 10px 12px 0 12px !important;

    .search-container {
      gap: 8px !important;

      .search-input {
        ::v-deep .el-input__inner {
          height: 32px !important;
          font-size: 0.8rem !important;
          padding-left: 38px !important;
        }

        ::v-deep .el-input__prefix {
          left: 14px !important;
        }
      }

      .reset-btn {
        height: 32px !important;
        font-size: 0.8rem !important;
        padding: 0 12px !important;
      }
    }
  }

  .content-divider {
    margin: 12px 12px 0 12px !important;
  }

  .work-orders-content {
    padding: 12px !important;
  }

  .order-content {
    padding: 20px 22px !important;
    gap: 16px !important;

    .order-icon {
      width: 48px !important;
      height: 48px !important;
      border-radius: 12px !important;

      i {
        font-size: 1.4rem !important;
      }
    }

    .order-title {
      font-size: 1rem !important;
      line-height: 1.3 !important;
      margin-bottom: 6px !important;
    }

    .order-desc {
      font-size: 0.85rem !important;
      line-height: 1.4 !important;
    }

    .favorite-actions {
      top: 50% !important;
      right: 12px !important;
      transform: translateY(-50%) !important;

      .favorite-btn {
        font-size: 1.1rem !important;
        transform: scale(0.9) !important;
      }
    }
  }
}
</style>