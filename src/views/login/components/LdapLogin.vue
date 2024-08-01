<template>
  <div class="ldaplogin-container">
    <el-form ref="ldapLoginForm" :model="ldapLoginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="ldapLoginForm.username"
          :placeholder="$t('用户名')"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>
      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="ldapLoginForm.password"
            :type="passwordType"
            :placeholder="$t('密码')"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" :style="{ color: 'white' }" />
          </span>
        </el-form-item>
      </el-tooltip>
      <el-button :loading="loading" type="primary" size="normal" style="width:100%;" @click.native.prevent="ldapLoginClick">
        {{ $t('LDAP登录') }}
      </el-button>

    </el-form>
  </div>
</template>

<script>

// import { ldapLoginPostRequest } from '@/api/smart'
import { Message } from 'element-ui'

export default {
  name: 'LdapLogin',
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
      ldapLoginForm: {
        username: 'caopengcheng',
        password: '123456'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      showDialogRegister: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.ldapLoginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.ldapLoginForm.password === '') {
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
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    async ldapLoginClick() {
      try {
        const valid = await this.$refs.ldapLoginForm.validate()
        if (!valid) {
          this.$showError('error submit!!')
          return false
        }
        this.loading = true
        const ldapLoginResult = await this.$store.dispatch('user/ldaplogin', this.ldapLoginForm)
        if (ldapLoginResult.code === 200) {
          const successMessage = `LDAP: ${this.ldapLoginForm.username} 登录成功`
          this.$showSuccess(successMessage)
          if (this.$store.getters.token) {
            const redirectPath = this.redirect || '/'
            this.$router.push({ path: redirectPath, query: this.otherQuery })
          }
        } else {
          this.$showError(`登录失败 错误码:${ldapLoginResult.code},请联系管理员.`)
        }
      } catch (error) {
        console.error('登录出错:', error)
        this.$showError('登录出错，请重试或者联系管理员', error.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.ldaplogin-container {
  width: 100%;
  text-align: center;

  ::v-deep .el-form {
    border-radius: 5px;
    .el-form-item__content {
      padding: 0 20px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      background: #fff;
      .svg-container {
        width: 20px;
        svg,i {
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
