<template>
  <div class="app-container" style="width: 100%;">
    <div>
      <el-alert title="工单申请过程中，有任何问题请联系【孙文波（ swb956721830@163.com ）】协助处理" type="info" show-icon />
      <el-alert :title="'当前工单状态：' + getStatusText(orderDetail.status)" type="warning" show-icon />
    </div>
    <el-card>
      <div class="custmo-steps">
        <span> 进度 </span>
        <hr class="divider">
        <el-steps :space="200" :active="1" finish-status="success">
          <el-step title="已完成" />
          <el-step title="进行中" />
          <el-step title="步骤 3" />
        </el-steps>
      </div>
    </el-card>
    <el-card>
      <div class="baseInfo-window">
      <span>
        基础信息
      </span>
        <hr class="divider">
        <el-form :model="orderDetail" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="标题:">
                <el-input v-model="orderDetail.title" :disabled="true" style="width: calc(100% - 110px);" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门:" prop="department">
                <el-input v-model="orderDetail.department" :disabled="true" style="width: calc(100% - 110px);" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级:" prop="priority">
                <el-tag :type="getTagType(orderDetail.priority)">
                  {{ getPriorityText(orderDetail.priority) }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="18">
              <el-form-item label="描述信息:" prop="description">
                <el-input v-model="orderDetail.description" :disabled="true" type="textarea" :rows="2" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
    <el-card>
      <div class="form-window">
      <span>
        表单信息
      </span>
        <hr class="divider">
        <el-form :model="orderDetail" label-width="100px">
          <div v-if="orderDetail.process === 'LDAP用户注册'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名:">
                  <el-input v-model="orderDetail.formData.userName" :disabled="true" style="width: 400px;" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="部门:" prop="department">
                  <el-input v-model="orderDetail.formData.userFirstOu" :disabled="true" style="width: 400px;" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div v-if="orderDetail.process === 'k8s服务接入'">
            <h5>服务基础信息</h5>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="服务名:">
                  <el-input v-model="orderDetail.formData.serviceName" :disabled="true" style="width: 80%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="部门:" prop="department">
                  <el-input v-model="orderDetail.formData.productLine" :disabled="true" style="width: 80%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="机房/云厂:" prop="region">
                  <el-select v-model="orderDetail.formData.region" :disabled="true" style="width: 80%">
                    <el-option label="Ucloud" value="Ucloud" />
                    <el-option label="内蒙乌兰察布" value="内蒙乌兰察布" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="k8s集群:" prop="cluster">
                  <el-select v-model="orderDetail.formData.cluster" :disabled="true" style="width: 80%">
                    <el-option label="Ucloud-CPU" value="Ucloud-CPU" />
                    <el-option label="Ucloud-A800" value="Ucloud-A800" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="命名空间:" prop="namespace">
                  <el-select v-model="orderDetail.formData.namespace" :disabled="true" style="width: 80%">
                    <el-option label="sre" value="sre" />
                    <el-option label="wudao" value="wudao" />
                    <el-option label="bmm-server" value="bmm-server" />
                    <el-option label="enterprise" value="enterprise" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开发语言:" prop="language">
                  <el-select v-model="orderDetail.formData.language" :disabled="true" style="width: 80%">
                    <el-option label="golang-1.21" value="golang-1.21" />
                    <el-option label="java" value="java" />
                    <el-option label="nodejs" value="nodejs" />
                    <el-option label="python" value="python" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="责任人列表:" style="margin-right:5%" prop="dutyList">
                  <el-input v-model="orderDetail.formData.dutyList" type="textarea" />
                </el-form-item>
              </el-col>
            </el-row>
            <div>
              <el-divider />
            </div>
            <h5>服务配置</h5>
            <el-row>
              <el-col :span="8">
                <el-form-item label="部署环境:">
                  <el-select v-model="orderDetail.formData.configuration.deployment_conf.env" :disabled="true">
                    <el-option label="prod" value="prod" />
                    <el-option label="stating" value="stating" />
                    <el-option label="dev" value="dev" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="副本数量:" label-width="100px">
                  <el-input-number v-model="orderDetail.formData.configuration.deployment_conf.replicas" :disabled="true" :min="1" :max="10" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="日志路经:">
                  <el-input v-model="orderDetail.formData.configuration.deployment_conf.logPath" :disabled="true" style="width: 80%;" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="优雅停止时间:">
                  <el-input-number v-model="orderDetail.formData.configuration.deployment_conf.terminationGracePeriodSeconds" :disabled="true" :min="30" :max="500" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="maxSurge:">
                  <el-input v-model="orderDetail.formData.configuration.deployment_conf.maxSurge" :disabled="true" style="width: 75%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="maxUnAvailable:" label-width="150px">
                  <el-input v-model="orderDetail.formData.configuration.deployment_conf.maxUnAvailable" :disabled="true" style="width: 75%" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="执行命令:">
                  <el-input v-model="orderDetail.formData.configuration.deployment_conf.execCmd" :disabled="true" type="textarea" />
                </el-form-item>
              </el-col>
            </el-row>
            <div>
              <el-divider />
            </div>
            <h5>标签</h5>
            <el-row>
              <el-col :span="12">
                <el-form-item label="business:">
                  <el-select v-model="orderDetail.formData.configuration.labels.business" :disabled="true" placeholder="请选择业务线">
                    <el-option label="开放平台" value="open-platform" />
                    <el-option label="北京企业解决方案" value="bj-enterprise" />
                    <el-option label="杭州企业解决方案" value="hz-enterprise" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机房/云厂:" prop="region">
                  <el-select v-model="orderDetail.formData.configuration.labels.region" :disabled="true" placeholder="请选择机房或者云厂">
                    <el-option label="Ucloud" value="Ucloud" />
                    <el-option label="内蒙乌兰察布" value="内蒙乌兰察布" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="万兆网卡:" prop="netCardWan">
                  <el-switch v-model="orderDetail.formData.configuration.labels.netCardWan" :disabled="true" active-color="#13ce66" inactive-color="#ff4949" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否访问外网:" style="margin-left:3%" prop="outerNet">
                  <el-switch v-model="orderDetail.formData.configuration.labels.outerNet" :disabled="true" active-color="#13ce66" inactive-color="#ff4949" />
                </el-form-item>
              </el-col>
            </el-row>
            <div>
              <el-divider />
            </div>
            <h5>容器配置</h5>
            <el-row>
              <el-col :span="8">
                <el-form-item label="镜像仓库:" prop="imageRepo" label-width="100px">
                  <el-select v-model="orderDetail.formData.configuration.container.imageRepo" :disabled="true" style="width: 80%;" placeholder="请选择镜像仓库">
                    <el-option label="uhub.service.ucloud.cn" value="prod" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="镜像:" prop="image">
                  <el-input v-model="orderDetail.formData.configuration.container.image" :disabled="true" style="width: 80%;" />
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="版本:" prop="tag">
                  <el-input v-model="orderDetail.formData.configuration.container.tag" :disabled="true" style="width: 80%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <h6>资源限制</h6>
              <el-col :span="12">
                <el-form-item label="cpu最小数量:" prop="cpu" label-width="150px">
                  <el-input-number v-model="orderDetail.formData.configuration.container.resources.requests.cpu" :disabled="true" :min="0.5" :max="10" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存最小值:" prop="memory" label-width="100px">
                  <el-input v-model="orderDetail.formData.configuration.container.resources.requests.memory" :disabled="true" style="width: 50%;" placeholder="单位为Mi、Gi" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="cpu最大数量:" prop="cpu" label-width="150px">
                  <el-input-number v-model="orderDetail.formData.configuration.container.resources.limits.cpu" :disabled="true" :min="1" :max="10" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存最大值:" prop="memory" label-width="100px">
                  <el-input v-model="orderDetail.formData.configuration.container.resources.limits.memory" :disabled="true" style="width: 50%;" placeholder="单位为Mi、Gi" />
                </el-form-item>
              </el-col>
            </el-row>
            <div>
              <el-divider />
            </div>
            <h5>service配置</h5>
            <el-row>
              <el-col :span="12">
                <el-form-item label="类型:" prop="serviceType" label-width="100px">
                  <el-select v-model="orderDetail.formData.configuration.service_config.serviceType" :disabled="true" size="small" placeholder="请选择service类型">
                    <el-option label="ClusterIP" value="ClusterIP" />
                    <el-option label="NodePort" value="NodePort" />
                    <el-option label="LoadBalancer" value="LoadBalancer" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="端口:" prop="servicePort">
                  <el-input v-model="orderDetail.formData.configuration.service_config.servicePort" :disabled="true" style="width: 50%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <div>
              <el-divider />
            </div>
            <h5>高级配置</h5>
            <h6>存活检测</h6>
            <el-form-item label="是否开启:" prop="enable">
              <el-switch v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.enable" :disabled="true" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <div v-show="orderDetail.formData.configuration.deployment_conf.livenessProbe.enable">
              <el-row>
                <el-col :span="6">
                  <el-form-item label="检测周期:" prop="periodSeconds">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.periodSeconds" :disabled="true" style="width: 40%;" placeholder="检测周期单位(s)" maxlength="30" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="超时时间:" prop="timeoutSeconds">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.timeoutSeconds" :disabled="true" style="width: 40%;" placeholder="超时时间(s)" maxlength="30" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="错误次数:" prop="failureThreshold">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.failureThreshold" :disabled="true" style="width: 40%;" placeholder="错误次数" maxlength="30" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="成功次数:" prop="successThreshold">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.successThreshold" :disabled="true" style="width: 40%;" placeholder="成功次数" maxlength="30" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="探测方式:" prop="type" style="width: auto;" label-width="100px">
                    <el-select v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.type" :disabled="true" placeholder="请选择探测方式">
                      <el-option label="tcp" value="tcp" />
                      <el-option label="httpGet" value="httpGet" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col v-show="orderDetail.formData.configuration.deployment_conf.livenessProbe.type === 'tcp'" :disabled="true" :span="6">
                  <el-form-item label="探测端口:" prop="port">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.probeType.tcp.tcpSocket.port" :disabled="true" style="width: 50%;" placeholder="探测端口" maxlength="30" />
                  </el-form-item>
                </el-col>
                <div v-show="orderDetail.formData.configuration.deployment_conf.livenessProbe.type === 'httpGet'">
                  <el-col :span="6">
                    <el-form-item label="HTTP端口:" style="margin-left:3%" prop="port">
                      <el-input v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.probeType.httpGet.port" :disabled="true" style="width: 50%;" placeholder="探测端口" maxlength="30" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="Url路径:" prop="path">
                      <el-input v-model="orderDetail.formData.configuration.deployment_conf.livenessProbe.probeType.httpGet.path" :disabled="true" style="width: 200%;" placeholder="Url路径" maxlength="30" />
                    </el-form-item>
                  </el-col>
                </div>

              </el-row>
            </div>
            <h6>就绪检测</h6>
            <el-form-item label="是否开启:" prop="enable">
              <el-switch v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.enable" :disabled="true" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <div v-show="orderDetail.formData.configuration.deployment_conf.readinessProbe.enable">
              <el-row>
                <el-col :span="6">
                  <el-form-item label="检测周期:" prop="periodSeconds">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.periodSeconds" :disabled="true" style="width: 40%;" placeholder="检测周期单位(s)" maxlength="30" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="超时时间:" prop="timeoutSeconds">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.timeoutSeconds" :disabled="true" style="width: 40%;" placeholder="超时时间(s)" maxlength="30" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="错误次数:" prop="failureThreshold">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.failureThreshold" :disabled="true" style="width: 40%;" placeholder="错误次数" maxlength="30" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="成功次数:" prop="successThreshold">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.successThreshold" :disabled="true" style="width: 40%;" placeholder="成功次数" maxlength="30" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="探测方式:" prop="type" style="width: auto;" label-width="100px">
                    <el-select v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.type" :disabled="true" placeholder="请选择探测方式">
                      <el-option label="tcp" value="tcp" />
                      <el-option label="httpGet" value="httpGet" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col v-show="orderDetail.formData.configuration.deployment_conf.readinessProbe.type === 'tcp'" :span="6" :disabled="true">
                  <el-form-item label="探测端口:" prop="port">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.probeType.tcp.tcpSocket.port" :disabled="true" style="width: 50%;" placeholder="探测端口" maxlength="30" />
                  </el-form-item>
                </el-col>
                <div v-show="orderDetail.formData.configuration.deployment_conf.readinessProbe.type === 'httpGet'">
                  <el-col :span="6">
                    <el-form-item label="HTTP端口:" style="margin-left:3%" prop="port">
                      <el-input v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.probeType.httpGet.port" :disabled="true" style="width: 50%;" placeholder="探测端口" maxlength="30" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="Url路径:" prop="path">
                      <el-input v-model="orderDetail.formData.configuration.deployment_conf.readinessProbe.probeType.httpGet.path" :disabled="true" style="width: 200%;" placeholder="Url路径" maxlength="30" />
                    </el-form-item>
                  </el-col>
                </div>
              </el-row>
            </div>
            <h6>HPA(弹性扩缩容)</h6>
            <el-form-item label="是否开启:" prop="enable" style="min-width: 250px;">
              <el-switch v-model="orderDetail.formData.configuration.deployment_conf.hpa.enable" :disabled="true" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <div v-show="orderDetail.formData.configuration.deployment_conf.hpa.enable">
              <el-row>
                <el-col :span="8">
                  <el-form-item label="cpu利用率:" prop="cpuAverageUtilization">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.hpa.cpuAverageUtilization" :disabled="true" style="width: 40%;" placeholder="Cpu平均利用率，单位为%" maxlength="100" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="pod最小数:" prop="minNumber">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.hpa.minNumber" :disabled="true" style="width: 40%;" placeholder="pod的最小数量" maxlength="100" show-word-limit />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="pod最大数:" prop="maxNumber">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.hpa.maxNumber" :disabled="true" style="width: 40%;" placeholder="pod的最大数量" maxlength="100" show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <h6>基于内存</h6>
              <el-form-item label="是否开启:" prop="memEnable" style="min-width: 250px;">
                <el-switch v-model="orderDetail.formData.configuration.deployment_conf.hpa.memEnable" :disabled="true" active-color="#13ce66" inactive-color="#ff4949" />
                <div v-show="orderDetail.formData.configuration.deployment_conf.hpa.memEnable">
                  <el-form-item label="内存利用率:" prop="memAverageUtilization">
                    <el-input v-model="orderDetail.formData.configuration.deployment_conf.hpa.memAverageUtilization" :disabled="true" style="width: 40%;" placeholder="内存平均利用率，单位为%" maxlength="100" />
                  </el-form-item>
                </div>
              </el-form-item>
            </div>
            <h6>生命周期管理</h6>
            <el-form-item label="是否开启:" prop="enable">
              <el-switch v-model="orderDetail.formData.configuration.deployment_conf.lifecycle.enable" :disabled="true" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <div v-show="orderDetail.formData.configuration.deployment_conf.lifecycle.enable">
              <el-form-item label="启动前执行:" prop="postStartExec">
                <el-input v-model="orderDetail.formData.configuration.deployment_conf.lifecycle.postStartExec" :disabled="true" type="text" style="width: 40%;" placeholder="启动前执行的命令" maxlength="100" show-word-limit />
              </el-form-item>
              <el-form-item label="停止前执行:" prop="preStopExec">
                <el-input v-model="orderDetail.formData.configuration.deployment_conf.lifecycle.preStopExec" :disabled="true" type="text" style="width: 40%;" placeholder="挺值前执行的命令" maxlength="100" show-word-limit />
              </el-form-item>
            </div>
            <h6>灰度配置</h6>
            <el-form-item label="是否开启:" prop="enable">
              <el-switch v-model="orderDetail.formData.canary.enable" :disabled="true" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <div v-show="orderDetail.formData.canary.enable">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="镜像:" prop="image">
                    <el-input v-model="orderDetail.formData.canary.image" :disabled="true" style="width: 40%;" placeholder="灰度镜像" maxlength="100" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="副本" prop="replicas">
                    <el-input v-model="orderDetail.formData.canary.replicas" :disabled="true" style="width: 40%;" placeholder="灰度副本数量" maxlength="100" show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-form>
      </div>
    </el-card>
    <el-card>
      <div class="oper-window">
        <span> 操作历史 </span>
        <hr class="divider">
        <el-table v-loading="listLoading" :data="histOperData" border stripe>
          <el-table-column prop="nodeName" label="节点名称" width="180" align="center" />
          <el-table-column prop="transfer" label="流转" width="180" align="center" />
          <el-table-column prop="handler" label="处理人" align="center" />
          <el-table-column prop="handleDuration" label="处理时长" align="center" />
          <el-table-column prop="handleTime" label="处理时间" align="center" />
          <el-table-column prop="remark" label="备注" align="center" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { orderWorkHistory, orderWorksSearch } from '@/api/smart/workOrder'

export default {
  name: 'WorkOrderDetails',
  data() {
    return {
      orderWorksStatus: [],
      orderWorksPriority: [],
      histOperData: [],
      orderDetail: {},
      listLoading: true,
      listHistor: {
        title: '',
      }
    }
  },
  async created() {
    try {
      // 先获取字典数据
      const [statusResponse, priorityResponse] = await Promise.all([
        this.getDicts('order_works_status'),
        this.getDicts('order_works_priority')
      ]);
      this.orderWorksStatus = statusResponse.data;
      this.orderWorksPriority = priorityResponse.data;

      // 再获取订单项数据
      await this.getOrderWorksSearch();
      await this.getOrderWorkHistory();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  },
  methods: {
    async getOrderWorksSearch() {
      this.listLoading = true
      try {
        await orderWorksSearch(this.$route.params.id).then(response => {
          this.orderDetail = response.data
        })
      } catch (error) {
        console.error('Failed to fetch order works:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },
    getOrderWorkHistory() {
      this.listLoading = true
      this.listHistor.title = this.$route.params.title
      try {
        orderWorkHistory(this.listHistor).then(response => {
          this.histOperData = response.data
        })
      } catch (error) {
        console.error('Failed to fetch order works:', error)
      } finally {
        this.listLoading = false // 停止加载状态
      }
    },

    getTagType(priority) {
      switch (priority) {
        case 'normal':
          return 'success'
        case 'urgent':
          return 'warning'
        case 'very-urgent':
          return 'danger'
        default:
          return ''
      }
    },
    getStatusText(status) {
      const statusItem = this.orderWorksStatus.find(item => item.value === status);
      return statusItem ? statusItem.label : status;
    },

    getPriorityText(priority) {
      const priorityItem = this.orderWorksPriority.find(item => item.value === priority);
      return priorityItem ? priorityItem.label : priority;
    }
  }
}
</script>

<style scoped>

.custmo-steps {
  border: 2px solid #eeeeee;
  padding: 20px;
  margin-bottom: 10px;
}
.baseInfo-window {
  border: 2px solid #eeeeee;
  padding: 20px;
  margin-bottom: 20px;
}
.divider {
  border: 0;
  height: 1px;
  background: #eeeeee;
  margin-top: 5px;
  margin-bottom: 20px;
}

.form-window {
  border: 2px solid #eeeeee;
  padding: 20px;
  margin-bottom: 20px;
}

.oper-window {
  border: 2px solid #eeeeee;
  padding: 10px;
  height: auto;
}

/deep/ .el-table th {
  background-color: #f5f7fa; /* 你想要的背景颜色 */
  color: #333; /* 字体颜色 */
}
.el-alert--info.is-light {
  background-color: #ecf1fd;
  color: #303133;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}
.el-alert--warning.is-light {
  background-color: #fdf6ec;
  color: #E6A23C;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

</style>
