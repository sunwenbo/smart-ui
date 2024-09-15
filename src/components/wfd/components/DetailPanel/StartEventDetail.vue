<template>
    <div :data-clazz="model.clazz">
        <div class="panelTitle">{{i18n['startEvent']}}</div>
        <div class="panelBody">
            <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly" />
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
          <NodeDetail
              :model="model"
              :on-change="onChange"
              :read-only="readOnly"
              :write-preview="false"
              :users="users"
          />
        </div>
    </div>
</template>
<script>
  import DefaultDetail from "./DefaultDetail";
  import NodeDetail from './NodeDetail'
  export default {
    inject: ['i18n'],
    components: {
      DefaultDetail,
      NodeDetail
    },
    props: {
      model: {
        type:Object,
        default: ()=>({}),
      },
      onChange: {
        type: Function,
        default: ()=>{}
      },
      users: {
        type: Array,
        default: ()=>([]),
      },
      tasks: {
        type: Array,
        default: () => ([])
      },
      execMachine: {
        type: Array,
        default: () => ([])
      },
      groups: {
        type: Array,
        default: ()=>([]),
      },
      categorys: {
        type: Array,
        default: ()=>([]),
      },
      roles: {
        type: Array,
        default: () => ([])
      },
      readOnly:{
        type: Boolean,
        default: false,
      }
    },
    created() {
      console.log("model=",this.model)
    }
  }
</script>
