<template>
    <div :data-clazz="model.clazz">
        <div class="panelTitle">{{i18n['userTask']}}</div>
        <div class="panelBody">
          <!--全局默认组件页面，'标题' -->
          <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly" />
          <div class="panelRow">
            <div>之后任务：</div>
            <el-select
                size="small"
                style="width: 90%; font-size: 12px"
                placeholder="选择任务"
                :disabled="readOnly"
                v-model="model.task"
                :filterable="true"
                @change="(value) => onChange('task', value)">
              <el-option
                  v-for="(taskValue, taskIndex) in tasks"
                  :key="taskIndex"
                  :label="taskValue.name"
                  :value="taskValue.name" />
            </el-select>
          </div>
          <!--根据指定的不同类型，决定工单的流转  用户、角色、部门以及用户组-->
          <div class="panelRow">
              <div>{{i18n['userTask.assignType']}}：</div>
              <el-select style="width:90%; font-size: 12px"
                         :placeholder="i18n['userTask.assignType.placeholder']"
                         :value="model.assignType"
                         :disabled="readOnly"
                         @change="(e) => { onChange('assignValue', []); onChange('assignType', e); assignmentType() }">
                <el-option key="assignee" value="assignee" :label="i18n['userTask.assignType.assignee']"/>
                <el-option key="department" value="department" :label="i18n['userTask.assignType.department']" />
                <el-option key="role" value="role" :label="i18n['userTask.assignType.role']" />
                <el-option key="persongroup" value="persongroup" :label="i18n['userTask.assignType.persongroup']"/>
              </el-select>
          </div>
          <div v-if="model.assignType === 'assignee'" class="panelRow">
            <div><span style="color: red">*</span> {{ i18n['userTask.assignType.assignee'] }}：</div>
              <el-select style="width:90%; font-size:12px"
                         :placeholder="i18n['userTask.assignType.assignee.placeholder']"
                         :disabled="readOnly"
                         :value="model.assignValue"
                         :multiple="true"
                         :multiple-limit="1"
                         allow-create
                         :filterable="true"
                         :filter-method="filterUsers"
                         @change="(e) => { onChange('assignValue', e); getPersons(e) }">
                  <el-option v-for="user in usersCopy" :key="user.id" :label="user.name" :value="user.id" />
              </el-select>
          </div>
          <div v-else-if="model.assignType === 'role'" class="panelRow">
            <div><span style="color: red">*</span> {{ i18n['userTask.assignType.role.title'] }}：</div>
            <el-select
                v-model.number="model.assignValue"
                size="small"
                style="width:90%; font-size:12px"
                :placeholder="i18n['userTask.assignType.role.placeholder']"
                :disabled="readOnly"
                :multiple="true"
                @change="(e) => { onChange('assignValue', e); getPersons(e) }"
            >
              <el-option v-for="(item, index) in roles" :key="index" :label="item.roleName" :value="item.roleId" />
            </el-select>
          </div>
          <div v-else-if="model.assignType === 'department'" class="panelRow">
            <div><span style="color: red">*</span> {{ i18n['userTask.assignType.department'] }}：</div>
            <el-select
                size="small"
                style="width:90%; font-size:12px"
                :placeholder="i18n['userTask.assignType.department.placeholder']"
                :value="model.assignValue"
                :disabled="readOnly"
                :multiple-limit="1"
                :multiple="true"
                :filterable="true"
                @change="(e) => { onChange('assignValue', e); getPersons(e) }"
            >
              <el-option v-for="department in departments" :key="department.deptId" :label="department.deptName" :value="department.deptId" />
            </el-select>
          </div>
          <div v-else-if="model.assignType === 'persongroup'" class="panelRow">
            <div><span style="color: red">*</span> {{ i18n['userTask.assignType.persongroup.title'] }}：</div>
            <el-select style="width:90%; font-size:12px"
                         :placeholder="i18n['userTask.assignType.persongroup.placeholder']"
                         :value="model.assignValue"
                         :disabled="readOnly"
                         :multiple="true"
                         allow-create
                         :filterable="true"
                         :filter-method="filterGroups"
                         @change="(e) => onChange('assignValue', e)">
                  <el-option v-for="group in groupsCopy" :key="group.id" :label="group.name" :value="group.id" />
              </el-select>
          </div>
          <!--到期时间-->
          <div class="panelRow">
              <div style="display:inline">{{i18n['userTask.dueDate']}}：</div>
              <el-date-picker type="datetime"
                              style="width:90%;"
                              :placeholder="i18n['userTask.dueDate.placeholder']"
                              :disabled="readOnly"
                              :value="model.dueDate"
                              value-format="yyyy-MM-dd HH:mm:ss"
                              @input="(value) => onChange('dueDate', value)" />
          </div>
          <!--会签 + 主动接单 + 全员处理 -->
          <div class="panelRow">
            <el-checkbox
                size="small"
                :disabled="model.assignType !== 'role' && model.assignType !== 'department' && (model.assignValue===undefined || model.assignValue===null || model.assignValue.length <= 1 || model.activeOrder || readOnly)"
                :value="model.isCounterSign"
                @change="(e) => { onChange('isCounterSign', e); initCounterSign(e) }"
            >{{ i18n['userTask.counterSign'] }}</el-checkbox>
            <el-checkbox
                size="small"
                :disabled="
                model.assignValue===undefined||
                model.assignValue===null||
                model.assignValue.length <= 1||
                model.isCounterSign||
                readOnly"
                :value="model.activeOrder"
                @change="(value) => onChange('activeOrder', value)"
            >{{ i18n['userTask.activeOrder'] }}</el-checkbox>
            <el-checkbox
                v-if="(model.assignType === 'role' || model.assignType === 'department') &&
            model.assignValue!==undefined &&
            model.assignValue!==null &&
            model.assignValue.length >= 1 &&
            model.isCounterSign"
                size="small"
                :value="model.fullHandle"
                @change="(value) => onChange('fullHandle', value)"
            >{{ i18n['userTask.fullHandle'] }}</el-checkbox>
          </div>
          <!-- 全局自定义组件，定义组件页面功能 -->
          <NodeDetail
              :model="model"
              :on-change="onChange"
              :read-only="readOnly"
              :readonly-preview="false"
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
      users: {
        type: Array,
        default: () => ([])
      },
      roles: {
        type: Array,
        default: () => ([])
      },
      groups: {
        type: Array,
        default: () => ([])
      },
      departments: {
        type: Array,
        default: () => ([])
      },
      tasks: {
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
    data() {
      return {
        usersCopy: this.users,
        groupsCopy: this.groups,
      }
    },
    created() {
      console.log('tasks=', this.tasks);
    },
    methods: {
      filterUsers(input) {
        if (input) {
          this.usersCopy = this.users.filter((item) => {
            if (!!~item.name.indexOf(input) || !!~item.name.toLowerCase().indexOf(input.toLowerCase())) {
              return true
            }
          })
        } else {
          this.usersCopy = this.users;
        }
      },
      filterGroups(input) {
        if (input) {
          this.groupsCopy = this.groups.filter((item) => {
            if (!!~item.name.indexOf(input) || !!~item.name.toLowerCase().indexOf(input.toLowerCase())) {
              return true
            }
          })
        } else {
          this.groupsCopy = this.groups;
        }
      },
      assignmentType() {
        this.onChange('isCounterSign', false)
      },
      getPersons(e) {
        if (e === undefined || e === null || e.length <= 1) {
          this.onChange('activeOrder', false)
          this.onChange('isCounterSign', false)
        }
      }
    }
  }
</script>
