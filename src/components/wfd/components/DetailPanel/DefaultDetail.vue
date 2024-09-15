<template>
    <div>
        <div class="panelRow">
          <div><span style="color: red">*</span> {{i18n['label']}}：</div>
           <el-input style="width:90%; font-size:12px"
                      :disabled="readOnly"
                      :value="model.label"
                      @input="(value) => {onChange('label', value)}" />
        </div>
        <div class="panelRow">
            <el-checkbox @change="(value) => onChange('hideIcon', value)"
                         :disabled="readOnly"
                         :value="!!model.hideIcon">{{i18n['hideIcon']}}</el-checkbox>
        </div>
    </div>
</template>
<script>
  export default {
    inject: ['i18n'],
    props: {
      model: {
        type:Object,
        default: ()=>({}),
      },
      onChange: {
        type: Function,
        default: ()=>{}
      },
      readOnly:{
        type: Boolean,
        default: false,
      }
    },
    mounted() {
      // Check if it's a startEvent and label is empty
      if (this.model.clazz === 'start' && !this.model.label) {
        this.onChange('label', '发起申请');
      }
      if (this.model.clazz === 'end' && !this.model.label) {
        this.onChange('label', '工单结束');
      }
    },
  }
</script>
