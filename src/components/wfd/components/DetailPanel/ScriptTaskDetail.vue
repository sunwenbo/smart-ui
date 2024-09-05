<template>
  <div :data-clazz="model.clazz">
    <div class="panelTitle">{{ i18n['scriptTask'] }}</div>
    <div class="panelBody">
      <DefaultDetail :model="model" :on-change="onChange" :read-only="readOnly" />
      <div class="panelRow">
        <div>类型：</div>
        <el-select
            style="width:90%; font-size:12px"
            placeholder="选择任务类型"
            :disabled="readOnly"
            :value="model.taskType"
            @change="(e) => onChange('taskType', e)"
        >
          <el-option label="任务" value="task" />
          <el-option label="脚本" value="script" />
        </el-select>
      </div>
      <div v-if="model.taskType === 'script'" class="panelRow">
        <div>{{ i18n['scriptTask.script'] }}：</div>
        <el-input
            style="width:90%; font-size:12px"
            placeholder="输入脚本"
            type="textarea"
            :rows="4"
            :disabled="readOnly"
            :value="model.script"
            @input="(value) => {onChange('script', value)}"
        />
      </div>
      <!--选择任务-->
      <div class="panelRow">
        <div>之后任务：</div>
        <el-select
          size="small"
          style="width:90%; font-size:12px"
          placeholder="选择任务"
          :disabled="readOnly"
          :value="model.task"
          :multiple="true"
          :filterable="true"
          @change="(e) => onChange('task', e)"
        >
          <el-option v-for="(taskValue, taskIndex) in tasks" :key="taskIndex" :label="taskValue.name" :value="taskValue.name" />
        </el-select>
      </div>
      <!--选择执行节点-->
      <div class="panelRow" v-if="model.task && model.task.length > 0">
        <div><span style="color: red">*</span> 选择执行任务的节点：</div>
        <el-select
          size="small"
          style="width:90%; font-size:12px"
          placeholder="选择执行节点"
          :disabled="readOnly"
          :value="model.machine"
          :multiple="true"
          :filterable="true"
          @change="(e) => onChange('machine', e)"
        >
          <el-option v-for="(machineValue, machineIndex) in execMachine" :key="machineIndex" :label="machineValue.hostName" :value="machineValue.hostName" />
        </el-select>
      </div>
    </div>
  </div>
</template>
<script>
  import DefaultDetail from "./DefaultDetail";
  export default {
    inject: ['i18n'],
    components: {
      DefaultDetail
    },
    props: {
      model: {
        type:Object,
        default: ()=>({}),
      },
      tasks: {
        type: Array,
        default: () => ([])
      },
      execMachine: {
        type: Array,
        default: () => ([])
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
  }
</script>
