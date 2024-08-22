<template>
  <div>
    <div v-if="Preview" class="panelRow">
      <div>抄送邮件：</div>
      <el-select
        size="small"
        style="width:90%; font-size:12px"
        placeholder="请选择抄送人"
        :value="model.cc"
        :multiple="true"
        :filterable="true"
        @change="(e) => { onChange('cc', e);}"
      >
        <el-option v-for="user in users" :key="user.id" :label="user.name===''?user.name:user.name" :value="user.id" />
      </el-select>
    </div>
  </div>
</template>
<script>
export default {
  inject: ['i18n'],
  props: {
    model: {
      type: Object,
      default: () => ({})
    },
    onChange: {
      type: Function,
      default: () => {}
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    users: {
      type: Array,
      default: () => ([])
    },
    Preview: {
      type: Boolean,
      default: true
    }
  }
}
</script>
