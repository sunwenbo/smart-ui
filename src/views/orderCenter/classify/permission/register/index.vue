<template>
  <div class="ldap-register">
    <div>
      <h2>{{ $t('order.ldapUserRegister') }}</h2>
      <aside>
        目前已经接入了Grafana，jenkins，Rancher系统。注册LDAP账号后可以登陆这三个系统，但是得开相应的权限
        <a href="https://www.baidu.com" target="_blank">👉LDAP问题可以点击这里.</a>
      </aside>
    </div>
    <div class="baseInfo-window">
      <div class="base-info">
        基础信息
      </div>
      <hr class="divider">
      <el-form ref="baseForm" :model="LdapRegister" :rules="registerRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题:" prop="title">
              <el-input v-model="LdapRegister.title" placeholder="请输入标题" style="width: calc(100% - 110px);" />
              <el-button type="primary" style="margin-left: 10px;" @click="generateTitle">
                <i class="el-icon-edit" />
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级:" prop="priority">
              <el-radio-group v-model="LdapRegister.priority">
                <el-radio :label="'normal'">一般</el-radio>
                <el-radio :label="'urgent'">紧急</el-radio>
                <el-radio :label="'very-urgent'">非常紧急</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item label="描述信息:" prop="description">
              <el-input v-model="LdapRegister.description" type="textarea" :rows="2" placeholder="请输描述信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="register-window">
      <el-form ref="registerForm" :model="LdapRegister.formData" :rules="registerRules" label-width="100px">
        <el-form-item label="姓名:" prop="userName">
          <el-tooltip effect="dark" content="姓名请用中文拼音，例如 李四：lisi">
            <el-input v-model="LdapRegister.formData.userName" placeholder="请输入姓名" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="部门:" prop="userSecondOu">
          <el-select v-model="LdapRegister.formData.userSecondOu" placeholder="请选择部门">
            <el-option v-for="dept in departments" :key="dept.value" :label="dept.label" :value="dept.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户密码:" prop="userOnePasswd">
          <el-tooltip effect="dark" content="密码必须大于6位数且包含数组和字母">
            <el-input v-model="LdapRegister.formData.userOnePasswd" type="password" placeholder="请输入密码" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="确认密码:" prop="userTwoPasswd">
          <el-input v-model="LdapRegister.formData.userTwoPasswd" type="password" placeholder="请确认密码" />
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="warning" size="medium" @click="resetHandle">重置</el-button>
          <el-button type="primary" size="medium" @click="applyRegister">提交申请</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

import { Message } from 'element-ui'
import { createOrderWork } from '@/api/smart/workOrder'

export default {
  data() {
    const validateUsername = (rule, value, callback) => {
      // 使用正则表达式检查用户名是否包含中文字符
      const chineseRegex = /[\u4E00-\u9FA5]/
      // 使用正则表达式检查用户名是否包含大写字母
      const upperCaseRegex = /[A-Z]/
      if (chineseRegex.test(value)) {
        callback(new Error('用户名不能包含中文字符'))
      } else if (!value || value.trim() === '') {
        callback(new Error('请输入姓名'))
      } else if (upperCaseRegex.test(value)) {
        callback(new Error('用户名不能包含大写字母'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
      } else if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
        callback(new Error('密码必须包含字母和数字'))
      } else {
        callback()
      }
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.LdapRegister.formData.userOnePasswd) {
        callback(new Error('确认密码与密码不一致'))
      } else {
        callback()
      }
    }
    return {
      LdapRegister: {
        title: '',
        description: '',
        priority: 'normal', // 默认优先级
        currentNode: '发起申请',
        currentHandler: '孙文波',
        process: 'LDAP用户注册',
        status: 'under-way',
        creator: `${this.$store.getters.name}`,
        department: '',
        userSecondOu: 'open-bigmodel',
        formData: {
          userName: '',
          userFirstOu: 'develop',
          userOnePasswd: '',
          userTwoPasswd: ''
        }
      },
      registerRules: {
        priority: [{ required: true, message: '必须选择', trigger: 'blur' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        userName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { validator: validateUsername, trigger: 'blur' }
        ],
        userOnePasswd: [
          { required: true, message: '请输入密码', trigger: 'blur' }, { validator: validatePassword, trigger: 'blur' }
        ],
        userTwoPasswd: [
          { required: true, message: '请确认密码', trigger: 'blur' }, { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      departments: [
        { label: 'xxxx', value: 'open-bigmodel' },
        { label: 'codegeex', value: 'codegeex' },
        { label: '北京解决方案团队', value: 'bj-enterprise-solution' },
        { label: '杭州解决方案团队', value: 'hz-enterprise-solution' },
        { label: 'QA', value: 'qa' },
        { label: 'API平台', value: 'api-platform' },
        { label: 'SRE', value: 'sre' }
      ]
    }
  },
  methods: {
    async applyRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (!valid) {
          console.log('表单验证失败')
        }
      })
      if (this.LdapRegister.formData.userOnePasswd !== this.LdapRegister.formData.userTwoPasswd) {
        this.$message.error('密码和确认密码不一致')
        return
      }
      this.loading = true
      this.LdapRegister.department = this.LdapRegister.userSecondOu
      try {
      await createOrderWork(this.LdapRegister).then(response => {
        if (response.code === 200) {
          this.$showSuccess(`${this.LdapRegister.title} 提交成功`)
          if (this.$store.getters.token) {
            const redirectPath = this.redirect || '/'
            this.$router.push({ path: redirectPath, query: this.otherQuery })
          }
        } else {
          this.$showError('注册出错，请重试或者联系管理员', response.data)
        }
      })
    } catch (error) {
      console.error('Failed to fetch apply err:', error)
    } finally {
      this.loading = false // 停止加载状态
    }},
    generateTitle() {
      const now = new Date()
      const formattedDate = new Date(now.getTime() + (8 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace(/[-T:]/g, '')
      this.LdapRegister.title = `${this.$t('order.ldapUserRegister')}-${this.$store.getters.name}-${formattedDate}`
    },
    resetHandle() {
      // 清空输入框的内容
      this.LdapRegister = {}
    }
  }
}
</script>

<style scoped>

.ldap-register {
  width: 100% !important;
  text-align: left;
  height: 200%;
  margin: 25px;
  .register-window  {
    border: 2px solid #eeeeee;
    width: 100%;
    margin: 0 auto; /* 水平居中 */
    display: flex;
    flex-direction: column; /* 确保子元素垂直排列 */
    align-items: center; /* 确保子元素水平居中 */
    padding: 30px; /* 添加内边距 */
  }
  .el-form-item label {
    font-size: 15px; /* 调整标签字体大小 */
  }
  .el-input {
    width: 400px; /* 设置输入框的宽度 */
    height: 40px; /* 设置输入框的高度 */
    font-size: 14px; /* 设置字体大小 */
  }
  .button-group {
    display: flex;
    justify-content: flex-end; /* 将按钮组推向右侧 */
  }
}

.baseInfo-window {
  border: 2px solid #eeeeee;
  padding: 20px;
  margin-bottom: 20px;
}

.base-info {
  font-weight: bold;
  margin-top: 5px;
  margin-bottom: 5px;
}

.divider {
  border: 0;
  height: 1px;
  background: #eeeeee;
  margin-top: 5px;
  margin-bottom: 20px;
}

</style>
