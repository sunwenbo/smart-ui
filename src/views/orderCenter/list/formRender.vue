<template>
  <div class="render">
    <el-card>
      <div>
        <el-alert
            title="工单申请过程中，有任何问题请联系【孙文波（ swb956721830@163.com ）】协助处理"
            type="info"
            show-icon
        />
      </div>
      <div class="baseInfo-window">
        <div class="base-info">基础信息</div>
        <hr class="divider">
        <el-form ref="baseForm" :model="applyQuery" :rules="rules" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标题:" prop="title">
                <el-input v-model="applyQuery.title" placeholder="请输入标题" style="width: calc(100% - 110px);" />
                <el-button type="primary" style="margin-left: 10px;" @click="generateTitle">
                  <i class="el-icon-edit" />
                </el-button>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门:" prop="department" >
                <el-select v-model="applyQuery.department" placeholder="请选择部门" style="width: calc(100% - 110px);">
                  <el-option v-for="dept in departments" :key="dept.value" :label="dept.label" :value="dept.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级:" prop="priority">
                <el-radio-group v-model="applyQuery.priority">
                  <el-radio v-for="priority in orderWorksPriority" :key="priority.value" :label="priority.value">
                    {{ priority.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="20">
              <el-form-item label="描述信息:" prop="description">
                <el-input v-model="applyQuery.description" type="textarea" :rows="2" placeholder="请输描述信息" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
    <el-card>
      <div class="form-custom">
        <div class="base-info">表单信息 </div>
        <hr class="divider">
        <v-form-render ref="vFormRef" :form-json="formJson" :form-data="formData" :option-data="optionData" />
      </div>
      <div class="center-buttons">
        <el-button type="warning" size="medium" @click.native="goBack">返回</el-button>
        <el-button type="primary" size="medium" @click="applyOrderWork">提交申请</el-button>
      </div>
    </el-card>

  </div>
</template>

<script>
import { createOrderWork } from '@/api/smart/workOrder'
import {getDeptList} from "@/api/admin/sys-dept";

export default {
  name: 'FormRender',
  mounted() {
    const title = this.$route.params.title;
    document.title = title ? `${title}` : '工单信息';
  },
  data() {
    return {
      orderWorksPriority: [],
      category: '',
      formJson: {
        formConfig: {},
        widgetList: []
      },
      formData: {},
      optionData: {},
      applyQuery: {
        title: '',
        description: '',
        department: '',
        priority: 'normal', // 默认优先级
        status: 'under-way',
        template:  this.$route.params.bindTempLate,
        formData: {
        }
      },
      flowTemplatedata: [],
      matchedTemplate: [],
      listLoading: false,
      categoryList: [],
      departments: [],
      rules: {
        title: [
          { required: true, message: '请输入工单标题', trigger: 'blur' }
        ],
        priority: [
          { required: true, message: '请选择工单优先级', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请选择所属部门', trigger: 'blur' }
        ]
      },
    }
  },
  activated() {
    this.initializeTitle()
    this.loadData()
  },
  watch: {
    generatedTitle(newTitle) {
      this.applyQuery.title = newTitle;
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 将路由参数传递给组件
      if (to.params.title) {
        vm.applyQuery.title = vm.generatedTitle;
      }
    });
  },
  methods: {
    async loadData() {
      try {
        const [priorityResponse, templateResponse, categoryResponse, deptResponse] = await Promise.all([
          this.getDicts('order_works_priority_type'),
          this.getFlowTemplate(),
          this.getCategory(),
          getDeptList()
        ]);
        this.orderWorksPriority = priorityResponse.data
        this.flowTemplatedata = templateResponse.data.list;

        this.matchedTemplate = this.flowTemplatedata.find(template =>
            template.name === this.$route.params.bindTempLate
        )
        if (this.matchedTemplate) {
          this.$refs.vFormRef.setFormJson(this.matchedTemplate.formData)
        }
        this.categoryList = categoryResponse.data.list
        const matchingCategory = this.categoryList.find(item => item.id === this.matchedTemplate.categoryId);
        if (matchingCategory) {
          this.category = matchingCategory.chineseName
        }

        this.departments = deptResponse.data.map(dept => ({
          label: dept.deptName,
          value: dept.deptName
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    // 处理返回操作，比如返回上一页
    goBack() {
      this.$router.push('/orderCenter/apply')
    },
    // 生成工单标题
    generateTitle() {
      if (this.category) {
        const now = new Date()
        const formattedDate = new Date(now.getTime() + (8 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace(/[-T:]/g, '')
        this.applyQuery.title = `${this.$route.params.title}-${this.$store.getters.name}-${formattedDate}`
      }
    },
    initializeTitle() {
      const routeTitle = this.$route.params.title || '默认标题'
      const now = new Date()
      const formattedDate = new Date(now.getTime() + (8 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace(/[-T:]/g, '')
      this.applyQuery.title = `${routeTitle}-${this.$store.getters.name}-${formattedDate}`
    },
    // 提交工单
    async applyOrderWork() {
      this.listLoading = true
      try {
        // 使用await等待getFormData的Promise解决
        const data = await this.$refs.vFormRef.getFormData()
        this.applyQuery.formData = { ...data }
        const response = await createOrderWork(this.applyQuery)
        if (response.code === 200) {
          this.$showSuccess(`${this.applyQuery.title} 提交成功`)
          setTimeout(() => {this.$router.push('/orderCenter/apply')}, 500) // 500毫秒等于0.5秒
        } else {
          this.$showError('提交错误，详情：', response.data)
        }
      } catch (error) {
        this.$message.error(error)
      } finally {
        this.listLoading = false
      }
    }
  }
}
</script>

<style scoped>
.render {
  padding: 20px;
}
.center-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.el-alert--info.is-light {
  background-color: #ecf1fd;
  color: #303133;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.baseInfo-window {
  border: 2px solid #eeeeee;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease-in-out;
}
.base-info {
  font-weight: bold;
  margin-top: 5px;
  margin-bottom: 5px;
}

.baseInfo-window:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.divider {
  border: 0;
  height: 1px;
  background: #eeeeee;
  margin-top: 5px;
  margin-bottom: 20px;
}

.form-custom {
  border: 2px solid #eeeeee;
  padding: 20px;
  transition: box-shadow 0.3s ease-in-out;
}
.form-custom:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

</style>
