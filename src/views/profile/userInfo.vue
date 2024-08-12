<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model="user.nickName" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="user.phone" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="归属部门" prop="deptId">
      <treeselect
        v-model="user.deptId"
        :options="deptOptions"
        placeholder="请选择归属部门"
      />
    </el-form-item>
    <el-form-item label="部门岗位" prop="postId">
      <el-select v-model="user.postId" placeholder="请选择岗位" style="width: 70%"  @change="$forceUpdate()">
        <el-option
          v-for="item in postOptions"
          :key="item.postId"
          :label="item.postName"
          :value="item.postId"
          :disabled="item.status === 1"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="性别">
      <el-radio-group v-model="user.sex">
        <el-radio label="0">男</el-radio>
        <el-radio label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUser } from '@/api/admin/sys-user'
import {listPost} from "@/api/admin/sys-post";
import { treeselect } from '@/api/admin/sys-dept'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  components: {Treeselect},
  props: {
    // eslint-disable-next-line vue/require-default-prop
    user: { type: Object }
  },
  created() {
    listPost({ pageSize: 1000 }).then(response => {
      this.postOptions = response.data.list
    })

    this.getTreeselect()

  },
  data() {
    return {
      deptOptions: undefined,
      postOptions: [], // 部门岗位
      // 表单校验
      rules: {
        nickName: [
          { required: true, message: '用户昵称不能为空', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ],
        deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
        roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
      }
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          console.log('this.user=',this.user)
          updateUser(this.user).then(response => {
            if (response.code === 200) {
              this.msgSuccess(response.msg)
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/index' })
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data
      })
    },
  }
}
</script>
