<template>
  <div class="register-container">
    <el-form ref="registerForm" :model="registerForm" :rules="loginRules" autocomplete="on">
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="registerForm.username"
          :placeholder="$t('用户名')"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-tooltip effect="dark" content="密码必须大于6位数且包含数组和字母">
          <el-input
            ref="password"
            :key="passwordType"
            v-model="registerForm.password"
            :type="passwordType"
            :placeholder="$t('密码')"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
        </el-tooltip>
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item prop="phone">
        <span class="svg-container">
          <i class="el-icon-mobile-phone" />
        </span>
        <el-input v-model="registerForm.phone" :placeholder="$t('手机号')" name="phone" />
      </el-form-item>
      <el-form-item prop="sex">
        <span class="svg-container">
          <i class="fa fa-intersex" />
        </span>
        <el-radio-group v-model="registerForm.sex" style="align-items: center;">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="department">
        <span class="svg-container">
          <i class="el-icon-s-cooperation" />
        </span>
        <el-select v-model="registerForm.department" placeholder="请选择部门">
          <el-option label="开放平台" value="open-platform" />
          <el-option label="北京企业解决方案" value="bj-enterprise" />
          <el-option label="杭州企业解决方案" value="hz-enterprise" />
        </el-select>
      </el-form-item>
      <el-form-item prop="email">
        <span class="svg-container">
          <svg-icon icon-class="email" />
        </span>
        <el-input
          ref="email"
          v-model="registerForm.email"
          :placeholder="$t('邮箱')"
          name="email"
          type="email"
          tabindex="5"
          autocomplete="on"
        />
      </el-form-item>
      <el-button :loading="loading" type="primary" size="normal" style="width: 100%" @click.native.prevent="registerClick">
        {{ $t('注册') }}
      </el-button>

    </el-form>
  </div>
</template>

<script>
import { Message } from 'element-ui'

export default {
  name: 'RegisterUser',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value || value.trim() === '') {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        username: 'admin',
        password: 'sunwenbo',
        sex: '男',
        phone: 13311246030,
        department: 'sre',
        email: 'example@example.com',
        source: 'SYSTEM'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      redirect: undefined,
      otherQuery: {}
    }
  },

  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.registerForm.username === '') {
      this.$refs.username.focus()
    } else if (this.registerForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    async registerClick() {
      try {
        const valid = await this.$refs.registerForm.validate()
        if (!valid) {
          this.$showError('error submit!!')
          return false
        }
        this.loading = true
        const registerResult = await this.$store.dispatch('user/register', this.registerForm)
        if (registerResult.code === 200) {
          this.$showSuccess(`${this.registerForm.username} 注册成功,请返回登陆页面进行登陆`)
        }
      } catch (error) {
        this.$showError('提交出错，请重试或者联系管理员', error.message)
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss">

.register-container {
    width: 100%;
    text-align: center;

  .el-form {
    border-radius: 5px;
    .el-form-item__content {
      padding: 0 20px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      background: #fff;
      .svg-container {
        width: 20px;
        i {
          color: #222;
          font-size: 16px;
        }
      }
      .el-select,
      .el-input{
        flex: 1;
        i {
          color: #222;
          font-size: 16px;
        }
        .el-input__inner {
          color: #666;
        }
      }
      .show-pwd {
        width: 30px;
      }
      .el-radio-group {
        padding: 12px 5px 12px 15px;
      }
    }
    }
}

</style>
