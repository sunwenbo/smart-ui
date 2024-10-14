
# Smart-API 工单系统

Smart-API 工单系统是基于 Go 语言开发的后台管理系统，前后端分离，采用 Gin 框架作为后端，Vue.js 和 Element UI 作为前端。系统旨在实现对工单管理的高效处理，支持任务分配、执行监控、实时更新等功能。


<img align="right" width="320" src="https://github.com/sunwenbo/golang/raw/master/logo.png">


[![Build Status](https://github.com/wenjianzhang/go-admin/workflows/build/badge.svg)](https://github.com/go-admin-team/go-admin)
[![Release](https://img.shields.io/github/release/go-admin-team/go-admin.svg?style=flat-square)](https://github.com/go-admin-team/go-admin/releases)
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/go-admin-team/go-admin)

[English](https://github.com/sunwenbo/smart-api/blob/main/README.md) | 简体中文

基于Gin + Vue + Element UI OR Arco Design OR Ant Design的前后端分离权限管理系统,系统初始化极度简单，只需要配置文件中，修改数据库连接，系统支持多指令操作，迁移指令可以让初始化数据库信息变得更简单，服务指令可以很简单的启动api服务

[前端项目](https://github.com/sunwenbo/smart-ui-new)

[后端项目](https://github.com/sunwenbo/smart-api)


## 🎬 在线体验

[点击访问在线演示](https://smart-api.example.com)

> 默认登录账户: `admin` / `123456`


## ✨ 架构特性

- 遵循 RESTful API 设计规范

- 基于 GIN WEB API 框架，提供了丰富的中间件支持（用户认证、跨域、访问日志、追踪ID等）

- 基于Casbin的 RBAC 访问控制模型

- JWT 认证

- 支持 Swagger 文档(基于swaggo)

- 基于 GORM 的数据库存储，可扩展多种类型数据库

- 配置文件简单的模型映射，快速能够得到想要的配置

- 代码生成工具

- 表单构建工具

- 多指令模式

- 多租户的支持

- TODO: 单元测试

## 🤩 功能特色

- **自定义工单表单**：根据实际需求自定义各种类型的工单表单结构
- **自定义审批流程**：可以灵活的设置审批节点的处理人以及多人协助审批
- **支持LDAP登陆**：兼容企业内部LDAP账号认证登陆
- **支持工单收藏**：支持多用户收藏常用的工单
- **任务工单管理**：提供任务的创建、分配、跟踪及执行状态的全面管理。
- **工单催办**：支持发送通知消息和第三方（飞书、钉钉等）消息通知。使用第三方通知时需要联动LDAP账号信息
- **实时任务监控**：通过 WebSocket 实现任务执行状态的实时更新与反馈。
- **角色权限控制**：基于 Casbin 的 RBAC 权限模型，提供细粒度的角色与权限管理。
- **评分与留言功能**：任务完成后可对工单进行评分，并支持多次留言记录。
- **日志记录**：支持详细的操作日志与任务执行日志，便于后续审计与分析。
- **图表统计**：通过图表直观展示工单的统计数据，包括周、月工单统计与个人提交排行。


## 🎁 内置

1. 多租户：系统默认支持多租户，按库分离，一个库一个租户。
1. 用户管理：用户是系统操作者，该功能主要完成系统用户配置。
2. 部门管理：配置系统组织机构（公司、部门、小组），树结构展现支持数据权限。
3. 岗位管理：配置系统用户所属担任职务。
4. 菜单管理：配置系统菜单，操作权限，按钮权限标识，接口权限等。
5. 角色管理：角色菜单权限分配、设置角色按机构进行数据范围权限划分。
6. 字典管理：对系统中经常使用的一些较为固定的数据进行维护。
7. 参数管理：对系统动态配置常用参数。
8. 操作日志：系统正常操作日志记录和查询；系统异常信息日志记录和查询。
9. 登录日志：系统登录日志记录查询包含登录异常。
1. 接口文档：根据业务代码自动生成相关的api接口文档。
1. 代码生成：根据数据表结构生成对应的增删改查相对应业务，全程可视化操作，让基本业务可以零代码实现。
1. 表单构建：自定义页面样式，拖拉拽实现页面布局。
1. 服务监控：查看一些服务器的基本信息。
1. 内容管理：demo功能，下设分类管理、内容管理。可以参考使用方便快速入门。
1. 定时任务：自动化任务，目前支持接口调用和函数调用。


## 🛰️ 系统模块

1. **用户管理**：支持用户信息的管理及权限分配。
2. **任务中心**：提供工单的分配、追踪和状态监控。
3. **工单中心**：工单申请和查看工单列表。
4. **流程中心**：自定义工单类型、工单表单、审批流程支持多个业务场景。
5. **角色管理**：通过角色实现细粒度的权限控制。
6. **日志管理**：包括系统操作日志和任务执行日志。
7. **服务监控**：实时查看服务器性能与运行状态。
8. **评分与留言**：任务结束后支持用户对工单评分并提交评价。

## 🔧 技术栈

- **后端**: Go, Gin, GORM, JWT, Casbin
- **前端**: Vue.js, Element UI, Axios, WebSocket
- **数据库**: MySQL / PostgreSQL / SQLite
- **其他工具**: Docker, Swagger, GIT
-

## 🚀 快速开始

### 准备工作

你需要在本地安装 [go] [gin] [node](http://nodejs.org/) 和 [git](https://git-scm.com/)

## 📦 环境要求

- Go 1.18 及以上版本
- Node.js v14.16.0 及以上版本
- npm版本: 6.14.11
- MySQL 或其他兼容数据库
- Docker 、Kubernetes(可选)


### 后端安装步骤

1. 克隆项目：

    ```bash
    git clone https://github.com/sunwenbo/smart-api.git
    cd smart-api
    ```

2. 安装依赖：

    ```bash
    go mod tidy
    ```

3. 配置数据库连接信息：
   ```bash
   cp config/settings.full.yml config/settings.yml
   ```
   修改 `config/settings.yml` 中的数据库连接信息，确保数据库配置正确。

4. 初始化数据库：

    ``` bash
    # 首次配置需要初始化数据库资源信息
    # macOS or linux 下使用
    $ ./smart-api migrate -c config/settings.dev.yml
   
    # ⚠️注意:windows 下使用
    $ smart-api.exe migrate -c config/settings.dev.yml
   
    
    # 启动项目，也可以用IDE进行调试
    # macOS or linux 下使用
    $ ./smart-api server -c config/settings.yml
    
    
    # ⚠️注意:windows 下使用
    $ smart-api.exe server -c config/settings.yml
    ```

5. sys_api 表的数据如何添加

   在项目启动时，使用`-a true` 系统会自动添加缺少的接口数据
   ```bash
   ./smart-api server -c config/settings.yml -a true
   ```
6. 更新Swagger文档生成

   ```bash
   go generate
   ```

7. 启动服务：

    ```bash
    ./smart-api server -c config/settings.yml
    ```

8. 本地开发
   ```
   生成迁移文件
   go run main.go migrate -g true -c config/settings.yml
   
   修改完迁移文件后，执行下面命令开始变更
   go run main.go migrate -c config/settings.yml
   
   生成迁移文件--系统相关
   go run main.go migrate -g true -a true  -c config/settings.yml
   
   接口管理生成
   go run main.go server -c config/settings.yml -a false
   ```

#### 使用docker 编译启动


#### 交叉编译

```bash
# windows
env GOOS=windows GOARCH=amd64 go build main.go

# or
# linux
env GOOS=linux GOARCH=amd64 go build main.go
```


### 前端安装步骤

1. 克隆前端项目：

    ```bash
    git clone https://github.com/sunwenbo/smart-ui-new.git
    cd smart-ui-new
    ```

2. 安装依赖：

    ```bash
    npm config set registry https://registry.npmmirror.com/  
    npm config get registry
    npm install  --legacy-peer-deps 
    ```

3. 启动开发服务器：

    ```bash
    npm run dev
    ```

4. 访问地址：

   打开浏览器并访问 `http://localhost:9527` 查看前端界面。


## 使用说明

1. **登录系统**：使用默认管理员账户 `admin` 登录系统。
2. **创建工单**：进入任务管理页面，点击“创建工单”，填写相关信息并分配处理人。
3. **任务执行监控**：通过系统内的任务执行界面，可实时查看任务的执行状态、执行结果及日志。
4. **工单评分与留言**：工单结束后，用户可以对工单进行评分，并通过留言功能记录对工单处理过程的反馈。

## 系统截图


### 登录界面
![登录界面](https://example.com/screenshot/login.png)

### 工单管理
![工单管理](https://example.com/screenshot/order-management.png)

### 实时任务监控
![实时任务监控](https://example.com/screenshot/task-monitor.png)

## 贡献指南

欢迎社区开发者贡献代码或提供意见。如果你想参与本项目，请参考以下步骤：

1. **Fork 本仓库**：点击右上角的 `Fork` 按钮将项目复制到你的 GitHub 账户。
2. **克隆你的 Fork**：在终端中运行以下命令，将项目克隆到本地：

    ```bash
    git clone https://github.com/your-username/smart-api-backend.git
    ```

3. **创建一个分支**：在克隆的项目目录下，创建一个新分支用于开发：

    ```bash
    git checkout -b feature-branch-name
    ```
4. **提交你的改动**：进行开发后，使用 `git add` 和 `git commit` 提交你的代码改动。

    ```bash
    git add .
    git commit -m "描述你的改动"
    ```

5. **发起 Pull Request**：在 GitHub 上提交 Pull Request，请确保你的代码通过了所有测试并遵循代码风格。

## 常见问题

### 如何修改数据库配置？

数据库配置存储在 `config/settings.yml` 中，你可以根据自己的需求修改其中的 `database` 配置项。

### 如何增加新的 API 接口？

在 `api` 目录下创建新的处理逻辑，并在 `router` 中注册该路由。服务层逻辑应放置在 `service` 目录中。

### 如何实现 WebSocket 实时任务监控？

在任务执行时，系统通过 WebSocket 向前端推送任务状态更新信息。前端使用 `WebSocket` 接口接收并动态展示任务执行日志。

## 开源许可

Smart-API 工单系统使用 [MIT 许可证](LICENSE) 开源，欢迎个人和企业免费使用与修改。


## 📨 互动

<table>
   <tr>
    <td><img src="https://github.com/sunwenbo/golang/raw/master/wx.jpeg" width="180px"></td>
    <td><img src="https://github.com/sunwenbo/golang/raw/master/wx.jpeg" width="180px"></td>
</tr>
  <tr>
    <td>个人微信</td>
    <td>微信群🔥🔥🔥</td>
  </tr>

</table>

## 💎 贡献者

感谢以下开发者对本项目的贡献：

- [开发者 1](https://github.com/developer1)
- [开发者 2](https://github.com/developer2)
- [开发者 3](https://github.com/developer3)


> 如果你有任何问题或建议，请通过 [issue](https://github.com/your-repo/smart-api-backend/issues) 提交。


## 🤝 特别感谢

### JetBrains 开源证书支持

`smart-api` 项目一直以来都是在 JetBrains 公司旗下的 GoLand 集成开发环境中进行开发，基于 **free JetBrains Open Source license(s)** 正版免费授权，在此表达我的谢意。

<a href="https://www.jetbrains.com/?from=kubeadm-ha" target="_blank"><img src="https://raw.githubusercontent.com/panjf2000/illustrations/master/jetbrains/jetbrains-variant-4.png" width="250" align="middle"/></a>

### 开源框架组件
1. [go-admin # 非常强大的后端开发框架、内置功能非常丰富](https://github.com/go-admin-team/go-admin)
2. [wfd-vue # 流程设计器](https://github.com/guozhaolong/wfd-vue)
3. [VForm 一款高效的Vue 2 / Vue3 的低代码表单可视化设计，一键生成源码，享受更多摸鱼时间](https://vform666.com/vform3.html)
3. [ant-design](https://github.com/ant-design/ant-design)
4. [ant-design-pro](https://github.com/ant-design/ant-design-pro)
5. [arco-design](https://github.com/arco-design/arco-design)
6. [arco-design-pro](https://github.com/arco-design/arco-design-pro)
7. [gin](https://github.com/gin-gonic/gin)
8. [casbin](https://github.com/casbin/casbin)
9. [spf13/viper](https://github.com/spf13/viper)
10. [gorm](https://github.com/jinzhu/gorm)
11. [gin-swagger](https://github.com/swaggo/gin-swagger)
12. [jwt-go](https://github.com/dgrijalva/jwt-go)
13. [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)
14. [ruoyi-vue](https://gitee.com/y_project/RuoYi-Vue)
15. [form-generator](https://github.com/JakHuang/form-generator)


## 🤟 打赏

> 如果你觉得这个项目帮助到了你，你可以帮作者买一杯☕️表示鼓励 :

<img class="no-margin" src="https://github.com/sunwenbo/golang/raw/master/wxPay.jpeg"  height="200px" >

## 🤝 链接

[Go开发者成长线路图](http://www.golangroadmap.com/)

## 🔑 License

[MIT](https://github.com/sunwenbo/smart-api/blob/main/LICENSE.md)

Copyright (c) 2022 sunwenbo
