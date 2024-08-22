<template>
    <div :data-clazz="model.clazz">
        <div class="panelTitle">{{i18n['startEvent']}}</div>
        <div class="panelBody">
            <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly" />
          <div class="panelRow">
            <div>之后任务：</div>
            <el-select
                style="width:90%; font-size:12px"
                placeholder="选择任务"
                :disabled="readOnly"
                :value="model.task"
                :multiple="true"
                :filterable="true"
                size="small"
                @change="(e) => onChange('task', e)"
            >
              <el-option v-for="(taskValue, taskIndex) in tasks" :key="taskIndex" :label="taskValue.name" :value="taskValue.full_name" />
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
  }
</script>
