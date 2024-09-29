<template>
  <div class="add-k8s-svc-container">
    <div>
      <h2>{{ $t('order.k8sJoin') }}</h2>
      <aside>
        可以通过填写此表单信息，将服务部署到指定的集群并实现配置可视化
        <a href="www.baidu.com" target="_blank">👉k8s问题可以点击这里.</a>
      </aside>
    </div>
    <div class="baseInfo-window">
      <div class="base-info">
        基础信息
      </div>
      <hr class="divider">
      <el-form ref="baseForm" :model="k8sInfoForm" :rules="k8sInfoRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题:" prop="title">
              <el-input v-model="k8sInfoForm.title" placeholder="请输入标题" style="width: calc(100% - 110px);" />
              <el-button type="primary" style="margin-left: 10px;" @click="generateTitle">
                <i class="el-icon-edit" />
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级:" prop="priority">
              <el-radio-group v-model="k8sInfoForm.priority">
                <el-radio :label="'normal'">一般</el-radio>
                <el-radio :label="'urgent'">紧急</el-radio>
                <el-radio :label="'very-urgent'">非常紧急</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item label="描述信息:" prop="description">
              <el-input v-model="k8sInfoForm.description" type="textarea" :rows="2" placeholder="请输描述信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <h4>服务基础信息</h4>
    <el-form ref="k8sInfoForm" :model="k8sInfoForm" :rules="k8sInfoRules" label-width="100px" class="ruleForm">
      <el-row>
        <el-col :span="8">
          <el-form-item label="服务名称" prop="serviceName">
            <el-input v-model="k8sInfoForm.formData.serviceName" type="text" style="width: 70%;" placeholder="请输入服务名称" maxlength="30" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="业务线:" prop="productLine" style="width: auto;" label-width="100px">
            <el-select v-model="k8sInfoForm.formData.productLine" placeholder="请选择业务线">
              <el-option label="开放平台" value="open-platform" />
              <el-option label="北京企业解决方案" value="bj-enterprise" />
              <el-option label="杭州企业解决方案" value="hz-enterprise" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="机房/云厂:" prop="region">
            <el-select v-model="k8sInfoForm.formData.region" placeholder="请选择机房或者云厂">
              <el-option label="Ucloud" value="Ucloud" />
              <el-option label="内蒙乌兰察布" value="内蒙乌兰察布" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="k8s集群:" prop="cluster" label-width="100px">
            <el-select v-model="k8sInfoForm.formData.cluster" placeholder="请选择集群">
              <el-option label="Ucloud-CPU" value="Ucloud-CPU" />
              <el-option label="Ucloud-A800" value="Ucloud-A800" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="命名空间:" prop="namespace" label-width="100px">
            <el-select v-model="k8sInfoForm.formData.namespace" placeholder="请选择命名空间">
              <el-option label="sre" value="sre" />
              <el-option label="wudao" value="wudao" />
              <el-option label="bmm-server" value="bmm-server" />
              <el-option label="enterprise" value="enterprise" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开发语言:" prop="language" label-width="100px">
            <el-select v-model="k8sInfoForm.formData.language" placeholder="请选择开发语言">
              <el-option label="golang-1.21" value="golang-1.21" />
              <el-option label="java" value="java" />
              <el-option label="nodejs" value="nodejs" />
              <el-option label="python" value="python" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="责任人列表:" style="margin-left:3%" prop="dutyList">
            <el-input v-model="k8sInfoForm.formData.dutyList" type="textarea" style="width: 160%;" placeholder="请输入服务责任人,以冒号分割" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div>
      <el-divider />
    </div>
    <h4>服务配置</h4>
    <el-form ref="k8sInfoForm" :model="k8sInfoForm" :rules="k8sInfoRules" label-width="100px" class="k8sInfoForm">
      <el-row>
        <el-col :span="12">
          <el-form-item label="部署环境:" prop="env">
            <el-select v-model="k8sInfoForm.formData.configuration.deployment_conf.env" placeholder="请选择部署环境">
              <el-option label="prod" value="prod" />
              <el-option label="stating" value="stating" />
              <el-option label="dev" value="dev" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="日志路经:" prop="logPath">
            <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.logPath" style="width: 50%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="副本数量:" prop="replicas" label-width="100px">
            <el-input-number v-model="k8sInfoForm.formData.configuration.deployment_conf.replicas" :min="1" :max="10" @change="handleChange" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优雅停止时间:" prop="terminationGracePeriodSeconds" label-width="125px">
            <el-input-number v-model="k8sInfoForm.formData.configuration.deployment_conf.terminationGracePeriodSeconds" :min="30" :max="500" @change="handleChange" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="maxSurge:" prop="maxSurge">
            <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.maxSurge" type="" style="width: 25%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="maxUnAvailable:" label-width="150px" prop="maxUnAvailable">
            <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.maxUnAvailable" style="width: 25%" />
          </el-form-item>
        </el-col>
        <el-col :span="15">
          <el-form-item label="执行命令:" prop="execCmd">
            <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.execCmd" type="textarea" style="width: 150%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div>
      <el-divider />
    </div>
    <h4>标签</h4>
    <el-form ref="k8sInfoForm" :model="k8sInfoForm" :rules="k8sInfoRules" label-width="100px" class="k8sInfoForm">
      <el-row>
        <el-col :span="12">
          <el-form-item label="business:" prop="business" style="width: auto;" label-width="100px">
            <el-select v-model="k8sInfoForm.formData.configuration.labels.business" placeholder="请选择业务线">
              <el-option label="open-platform" value="open-platform" />
              <el-option label="bj-enterprise" value="bj-enterprise" />
              <el-option label="hz-enterprise" value="hz-enterprise" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机房/云厂" prop="region">
            <el-select v-model="k8sInfoForm.formData.configuration.labels.region" placeholder="请选择机房或者云厂">
              <el-option label="Ucloud" value="Ucloud" />
              <el-option label="内蒙乌兰察布" value="内蒙乌兰察布" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="万兆网卡:" prop="netCardWan">
            <el-switch v-model="k8sInfoForm.formData.configuration.labels.netCardWan" active-color="#13ce66" inactive-color="#ff4949" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否访问外网:" style="margin-left:3%" prop="outerNet">
            <el-switch v-model="k8sInfoForm.formData.configuration.labels.outerNet" active-color="#13ce66" inactive-color="#ff4949" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div>
      <el-divider />
    </div>
    <h4>容器配置</h4>
    <el-form ref="k8sInfoForm" :model="k8sInfoForm" :rules="k8sInfoRules" label-width="100px" class="k8sInfoForm">
      <el-row>
        <el-col :span="8">
          <el-form-item label="镜像仓库:" prop="imageRepo" label-width="100px">
            <el-select v-model="k8sInfoForm.formData.configuration.container.imageRepo" size="small" placeholder="请选择镜像仓库">
              <el-option label="uhub.service.ucloud.cn" value="prod" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="镜像:" prop="image">
            <el-input v-model="k8sInfoForm.formData.configuration.container.image" style="width: 80%;" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="版本:" prop="tag">
            <el-input v-model="k8sInfoForm.formData.configuration.container.tag" style="width: 50%;" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <h5>资源限制</h5>
        <el-col :span="12">
          <el-form-item label="cpu最小数量:" prop="cpu" label-width="150px">
            <el-input-number v-model="k8sInfoForm.formData.configuration.container.resources.requests.cpu" :min="0.5" :max="10" @change="handleChange" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="内存最小值:" prop="memory" label-width="100px">
            <el-input v-model="k8sInfoForm.formData.configuration.container.resources.requests.memory" style="width: 50%;" placeholder="单位为Mi、Gi" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="cpu最大数量:" prop="cpu" label-width="150px">
            <el-input-number v-model="k8sInfoForm.formData.configuration.container.resources.limits.cpu" :min="1" :max="10" @change="handleChange" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="内存最大值:" prop="memory" label-width="100px">
            <el-input v-model="k8sInfoForm.formData.configuration.container.resources.limits.memory" style="width: 50%;" placeholder="单位为Mi、Gi" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div>
      <el-divider />
    </div>
    <h4>service配置</h4>
    <el-form ref="k8sInfoForm" :model="k8sInfoForm" :rules="k8sInfoRules" label-width="100px" class="k8sInfoForm">
      <el-row>
        <el-col :span="12">
          <el-form-item label="类型:" prop="serviceType" label-width="100px">
            <el-select v-model="k8sInfoForm.formData.configuration.service_config.serviceType" size="small" placeholder="请选择service类型">
              <el-option label="ClusterIP" value="ClusterIP" />
              <el-option label="NodePort" value="NodePort" />
              <el-option label="LoadBalancer" value="LoadBalancer" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="端口:" prop="servicePort">
            <el-input v-model="k8sInfoForm.formData.configuration.service_config.servicePort" style="width: 50%;" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div>
      <el-divider />
    </div>
    <h4>高级配置</h4>
    <el-form ref="k8sInfoForm" :model="k8sInfoForm" :rules="k8sInfoRules" label-width="100px" class="k8sInfoForm">

      <h5>存活检测</h5>
      <el-form-item label="是否开启:" prop="enable">
        <el-switch v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.enable" active-color="#13ce66" inactive-color="#ff4949" @change="liveEnableChange" />
      </el-form-item>
      <div v-show="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.enable">
        <el-row>
          <el-col :span="6">
            <el-form-item label="检测周期:" prop="periodSeconds">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.periodSeconds" style="width: 40%;" placeholder="检测周期单位(s)" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="超时时间:" prop="timeoutSeconds">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.timeoutSeconds" style="width: 40%;" placeholder="超时时间(s)" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="错误次数:" prop="failureThreshold">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.failureThreshold" style="width: 40%;" placeholder="错误次数" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="成功次数:" prop="successThreshold">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.successThreshold" style="width: 40%;" placeholder="成功次数" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="探测方式:" prop="type" style="width: auto;" label-width="100px">
              <el-select v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.type" placeholder="请选择探测方式">
                <el-option label="tcp" value="tcp" />
                <el-option label="httpGet" value="httpGet" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.type === 'tcp'" :span="6">
            <el-form-item label="探测端口:" prop="port">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.probeType.tcp.tcpSocket.port" style="width: 50%;" placeholder="探测端口" maxlength="30" />
            </el-form-item>
          </el-col>
          <div v-show="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.type === 'httpGet'">
            <el-col :span="6">
              <el-form-item label="HTTP端口:" style="margin-left:3%" prop="port">
                <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.probeType.httpGet.port" style="width: 50%;" placeholder="探测端口" maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Url路径:" prop="path">
                <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.probeType.httpGet.path" style="width: 200%;" placeholder="Url路径" maxlength="30" />
              </el-form-item>
            </el-col>
          </div>

        </el-row>
      </div>
      <h5>就绪检测</h5>
      <el-form-item label="是否开启:" prop="enable">
        <el-switch v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.enable" active-color="#13ce66" inactive-color="#ff4949" @change="readEnableChange" />
      </el-form-item>
      <div v-show="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.enable">
        <el-row>
          <el-col :span="6">
            <el-form-item label="检测周期:" prop="periodSeconds">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.periodSeconds" style="width: 40%;" placeholder="检测周期单位(s)" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="超时时间:" prop="timeoutSeconds">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.timeoutSeconds" style="width: 40%;" placeholder="超时时间(s)" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="错误次数:" prop="failureThreshold">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.failureThreshold" style="width: 40%;" placeholder="错误次数" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="成功次数:" prop="successThreshold">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.successThreshold" style="width: 40%;" placeholder="成功次数" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="探测方式:" prop="type" style="width: auto;" label-width="100px">
              <el-select v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.type" placeholder="请选择探测方式">
                <el-option label="tcp" value="tcp" />
                <el-option label="httpGet" value="httpGet" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.type === 'tcp'" :span="6">
            <el-form-item label="探测端口:" prop="port">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.probeType.tcp.tcpSocket.port" style="width: 50%;" placeholder="探测端口" maxlength="30" />
            </el-form-item>
          </el-col>
          <div v-show="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.type === 'httpGet'">
            <el-col :span="6">
              <el-form-item label="HTTP端口:" style="margin-left:3%" prop="port">
                <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.probeType.httpGet.port" style="width: 50%;" placeholder="探测端口" maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Url路径:" prop="path">
                <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.probeType.httpGet.path" style="width: 200%;" placeholder="Url路径" maxlength="30" />
              </el-form-item>
            </el-col>
          </div>
        </el-row>
      </div>
      <h5>HPA(弹性扩缩容)</h5>
      <el-form-item label="是否开启:" prop="enable" style="min-width: 250px;">
        <el-switch v-model="k8sInfoForm.formData.configuration.deployment_conf.hpa.enable" active-color="#13ce66" inactive-color="#ff4949" @change="hapEnableChange" />
      </el-form-item>
      <div v-show="k8sInfoForm.formData.configuration.deployment_conf.hpa.enable">
        <el-row>
          <el-col :span="8">
            <el-form-item label="cpu利用率:" prop="cpuAverageUtilization">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.hpa.cpuAverageUtilization" style="width: 40%;" placeholder="Cpu平均利用率，单位为%" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="pod最小数:" prop="minNumber">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.hpa.minNumber" style="width: 40%;" placeholder="pod的最小数量" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="pod最大数:" prop="maxNumber">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.hpa.maxNumber" style="width: 40%;" placeholder="pod的最大数量" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <h5>基于内存</h5>
        <el-form-item label="是否开启:" prop="memEnable" style="min-width: 250px;">
          <el-switch v-model="k8sInfoForm.formData.configuration.deployment_conf.hpa.memEnable" active-color="#13ce66" inactive-color="#ff4949" />
          <div v-show="k8sInfoForm.formData.configuration.deployment_conf.hpa.memEnable">
            <el-form-item label="内存利用率:" prop="memAverageUtilization">
              <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.hpa.memAverageUtilization" style="width: 40%;" placeholder="内存平均利用率，单位为%" maxlength="100" />
            </el-form-item>
          </div>
        </el-form-item>
      </div>
      <h5>生命周期管理</h5>
      <el-form-item label="是否开启:" prop="enable">
        <el-switch v-model="k8sInfoForm.formData.configuration.deployment_conf.lifecycle.enable" active-color="#13ce66" inactive-color="#ff4949" @change="lifeEnableChange" />
      </el-form-item>
      <div v-show="k8sInfoForm.formData.configuration.deployment_conf.lifecycle.enable">
        <el-form-item label="启动前执行:" prop="postStartExec">
          <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.lifecycle.postStartExec" type="text" style="width: 40%;" placeholder="启动前执行的命令" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="停止前执行:" prop="preStopExec">
          <el-input v-model="k8sInfoForm.formData.configuration.deployment_conf.lifecycle.preStopExec" type="text" style="width: 40%;" placeholder="挺值前执行的命令" maxlength="100" show-word-limit />
        </el-form-item>
      </div>
      <h5>灰度配置</h5>
      <el-form-item label="是否开启:" prop="enable">
        <el-switch v-model="k8sInfoForm.formData.canary.enable" active-color="#13ce66" inactive-color="#ff4949" @change="canaryEnableChange" />
      </el-form-item>
      <div v-show="k8sInfoForm.formData.canary.enable">
        <el-row>
          <el-col :span="12">
            <el-form-item label="镜像:" prop="image">
              <el-input v-model="k8sInfoForm.formData.canary.image" style="width: 40%;" placeholder="灰度镜像" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副本" prop="replicas">
              <el-input v-model="k8sInfoForm.formData.canary.replicas" style="width: 40%;" placeholder="灰度副本数量" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="center-buttons">
        <el-form-item>
          <el-button type="primary" size="medium" @click="applyAddK8sService">提交申请</el-button>
          <el-button size="medium" @click="goBack">返回</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>

</template>

<script>

// 导入 Message 组件
import { Message } from 'element-ui'

export default {
  data: function() {
    return {
      k8sInfoForm: {
        title: '',
        description: '',
        priority: 'normal', // 默认优先级
        currentNode: '发起申请',
        currentHandler: '孙文波',
        department: '',
        process: 'k8s服务接入',
        status: 'under-way',
        creator: `${this.$store.getters.name}`,
        formData: {
          serviceName: 'ldap-user-manage111',
          productLine: 'open-bigmodel',
          region: 'Ucloud',
          cluster: 'Ucloud-CPU',
          namespace: 'sre',
          language: 'golang1.21',
          dutyList: 'sunwenbo,test',
          canary: {
            enable: false,
            image: 'canary-image',
            replicas: 1
          },
          configuration: {
            deployment_conf: {
              env: 'prod',
              logPath: '/home/service/logs/',
              replicas: '3',
              terminationGracePeriodSeconds: '30',
              maxSurge: '25%',
              maxUnAvailable: '25%',
              execCmd: '',
              livenessProbe: {
                enable: true,
                type: 'httpGet',
                probeType: {
                  tcp: {
                    tcpSocket: {
                      port: null
                    }
                  },
                  httpGet: {
                    path: '/heathcheck/nacos',
                    port: null
                  }
                },
                periodSeconds: 10,
                timeoutSeconds: 30,
                failureThreshold: 30,
                successThreshold: 1
              },
              readinessProbe: {
                enable: true,
                type: 'httpGet',
                probeType: {
                  tcp: {
                    tcpSocket: {
                      port: null
                    }
                  },
                  httpGet: {
                    path: '/heathcheck/nacos',
                    port: null
                  }
                },
                periodSeconds: 10,
                timeoutSeconds: 30,
                failureThreshold: 30,
                successThreshold: 1
              },
              hpa: {
                enable: false,
                cpuAverageUtilization: 70,
                maxNumber: 5,
                minNumber: 1,
                memEnable: false,
                memAverageUtilization: 70
              },
              lifecycle: {
                enable: false,
                postStartExec: '',
                preStopExec: 'sh -c \'sleep 70\''
              }
            },
            service_config: {
              serviceType: 'ClusterIP',
              servicePort: 8080
            },
            labels: {
              business: '开放平台',
              region: 'ucloud',
              netCardWan: true,
              outerNet: true
            },
            container: {
              imageRepo: 'uhub.service.ucloud.cn/',
              image: 'sre-paas/ldap-user-manage',
              tag: '202312251756',
              resources: {
                limits: {
                  cpu: 1,
                  memory: '1Gi'
                },
                requests: {
                  cpu: 1,
                  memory: '512Mi'
                }
              }
            }
          },
          version: 1,
          updateUser: 'sunwenbo'
        }
      },
      requestData: {},
      k8sInfoRules: {
        priority: [{ required: true, message: '必须选择', trigger: 'blur' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        productLine: [
          { required: true, message: '', trigger: 'blur' }
        ],
        cluster: [
          { required: true, message: '', trigger: 'blur' }
        ],
        language: [
          { required: true, message: '', trigger: 'blur' }
        ],
        dutyList: [
          { required: true, message: '', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: '', trigger: 'blur' }
        ],
        replicas: [
          { required: true, message: '', trigger: 'blur' }
        ],
        env: [
          { required: true, message: '', trigger: 'blur' }
        ],
        cpuAverageUtilization: [
          { required: true, message: '必须输入', trigger: 'blur' }
        ],
        minNumber: [
          { required: true, message: '必须输入', trigger: 'blur' }
        ],
        maxNumber: [
          { required: true, message: '必须输入', trigger: 'blur' }
        ],
        serviceType: [
          { required: true, message: '必须输入', trigger: 'blur' }
        ],
        imageRepo: [
          { required: true, message: '必须输入', trigger: 'blur' }
        ],
        image: [
          { required: true, message: '', trigger: 'blur' }
        ],
        tag: [
          { required: true, message: '', trigger: 'blur' }
        ],
        servicePort: [
          { required: true, message: '', trigger: 'blur' }
        ],
        serviceName: [
          { required: true, message: '请输入服务名称', trigger: 'blur' },
          { min: 10, max: 50, message: '长度必须在 10 到 50 个字符', trigger: 'blur' }
        ],
        region: [
          { required: true, message: '机房或云厂', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    handleChange(value) {
    },
    async applyAddK8sService() {
      // 处理注册逻辑
      this.loading = true
      const curUserToken = this.$store.getters.token
      this.k8sInfoForm.department = this.k8sInfoForm.formData.productLine

      const AddK8sServiceResult = await this.$store.dispatch('smart/createOrderWork', {
        data: this.k8sInfoForm,
        token: curUserToken
      })
      if (AddK8sServiceResult.code === 200) {
        const successMessage = `${this.k8sInfoForm.title} 提交成功`
        this.$showSuccess(successMessage)
        this.loading = false
        if (this.$store.getters.token) {
          const redirectPath = this.redirect || '/'
          this.$router.push({ path: redirectPath, query: this.otherQuery })
        }
      } else {
        this.$showError('提交出错，请重试或者联系管理员', AddK8sServiceResult.data)
      }
    },
    goBack() {
      // 处理返回操作，比如返回上一页
      this.$router.go(-1)
    },
    hapEnableChange(newValue) {
      console.log(newValue)
      this.k8sInfoForm.formData.configuration.deployment_conf.hpa.enable = newValue
    },
    lifeEnableChange(newValue) {
      this.k8sInfoForm.formData.configuration.deployment_conf.lifecycle.enable = newValue
    },
    canaryEnableChange(newValue) {
      this.k8sInfoForm.formData.canary.enable = newValue
    },
    liveEnableChange(newValue) {
      this.k8sInfoForm.formData.configuration.deployment_conf.livenessProbe.enable = newValue
    },
    readEnableChange(newValue) {
      this.k8sInfoForm.formData.configuration.deployment_conf.readinessProbe.enable = newValue
    },
    generateTitle() {
      const now = new Date()
      const formattedDate = new Date(now.getTime() + (8 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace(/[-T:]/g, '')
      this.k8sInfoForm.title = `${this.$t('order.k8sJoin')}-${this.$store.getters.name}-${formattedDate}`
    }
  }
}
</script>

<style scoped>
.add-k8s-svc-container {
  margin: 30px;
  left: auto;
  right: auto;
}

.center-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  left: auto;
  right: auto;
  width: auto;
  height: 100px;
  margin-right: 70px;
}

</style>

