# Smart-API Work Order System

The Smart-API Work Order System is a backend management system developed in Go, with a frontend-backend separation architecture. It uses the Gin framework for the backend and Vue.js with Element UI for the frontend. The system aims to efficiently manage work orders, supporting task assignment, execution monitoring, real-time updates, and more.

<img align="right" width="320" src="https://github.com/sunwenbo/golang/raw/master/logo.png">

[![Build Status](https://github.com/wenjianzhang/go-admin/workflows/build/badge.svg)](https://github.com/go-admin-team/go-admin)
[![Release](https://img.shields.io/github/release/go-admin-team/go-admin.svg?style=flat-square)](https://github.com/go-admin-team/go-admin/releases)
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/go-admin-team/go-admin)

[English](https://github.com/sunwenbo/smart-api/blob/main/README.md) | 简体中文

This is a front-end and back-end separated permission management system based on Gin + Vue + Element UI OR Arco Design OR Ant Design. The system setup is extremely simple, requiring only the configuration of the database connection in the settings file. The system supports multiple commands for operations, and migration commands make it easier to initialize database information. Service commands simplify starting the API service.

[Frontend Project](https://github.com/sunwenbo/smart-ui-new)

[Backend Project](https://github.com/sunwenbo/smart-api)

## 🎬 Live Demo

[Click here to visit the live demo](https://smart-api.example.com)

> Default login account: `admin` / `123456`

## ✨ Features

- Follows RESTful API design principles
- Based on the GIN web API framework with rich middleware support (user authentication, CORS, access logs, trace ID, etc.)
- RBAC access control model based on Casbin
- JWT authentication
- Supports Swagger documentation (via swaggo)
- Database storage based on GORM, with support for various database types
- Simple configuration file model mapping for quick setup
- Code generation tools
- Form building tools
- Multi-tenant support
- TODO: Unit testing

## 🤩 Key Features

- **Custom Work Order Forms**: Customize work order form structures as needed.
- **Custom Approval Workflows**: Flexibly set the approvers for each node and allow multiple approvers to assist.
- **LDAP Login Support**: Integrates with enterprise LDAP accounts for authentication.
- **Work Order Bookmarking**: Supports bookmarking frequently used work orders.
- **Task and Work Order Management**: Provides comprehensive management of task creation, assignment, tracking, and execution status.
- **Work Order Reminder**: Sends reminder notifications, including third-party notifications (e.g., Feishu, DingTalk), requiring LDAP account integration.
- **Real-time Task Monitoring**: Real-time updates and feedback on task execution status via WebSocket.
- **Role-based Access Control**: Fine-grained role and permission management based on the Casbin RBAC model.
- **Rating and Comments**: After task completion, users can rate the work order and leave multiple comments.
- **Log Management**: Detailed operational and task execution logs for auditing and analysis.
- **Charts and Statistics**: Visualize work order statistics with charts, including weekly/monthly work order stats and personal submission rankings.

## 🎁 Built-in Features

1. **Multi-tenant Support**: The system supports multi-tenant architecture with database separation (one database per tenant).
2. **User Management**: Configures system user information and permissions.
3. **Department Management**: Configures system organizational structure (company, department, team) with support for data permissions.
4. **Position Management**: Configures the positions held by system users.
5. **Menu Management**: Configures system menus, operation permissions, button permissions, and API permissions.
6. **Role Management**: Assigns role menu permissions and defines data range permissions by organization.
7. **Dictionary Management**: Maintains frequently used fixed data within the system.
8. **Parameter Management**: Dynamically configures common parameters for the system.
9. **Operation Logs**: Records and queries normal operation logs as well as abnormal system logs.
10. **Login Logs**: Logs and queries login information, including abnormal login attempts.
11. **API Documentation**: Automatically generates API documentation based on business code.
12. **Code Generation**: Generates business logic (CRUD) based on table structure with visual operations.
13. **Form Builder**: Drag-and-drop interface for customizing page layouts.
14. **Service Monitoring**: Monitors basic server information.
15. **Content Management**: Demo feature with category and content management, providing a quick entry point.
16. **Scheduled Tasks**: Supports automated tasks, including API and function calls.

## 🛰️ System Modules

1. **User Management**: Manages user information and assigns permissions.
2. **Task Center**: Provides assignment, tracking, and status monitoring of work orders.
3. **Work Order Center**: Allows work order requests and views of work order lists.
4. **Workflow Center**: Customizable work order types, forms, and approval workflows for multiple business scenarios.
5. **Role Management**: Fine-grained role-based permission control.
6. **Log Management**: Includes system operation logs and task execution logs.
7. **Service Monitoring**: Real-time monitoring of server performance and status.
8. **Rating and Comments**: Allows users to rate and comment after task completion.

## 🔧 Tech Stack

- **Backend**: Go, Gin, GORM, JWT, Casbin
- **Frontend**: Vue.js, Element UI, Axios, WebSocket
- **Database**: MySQL / PostgreSQL / SQLite
- **Other Tools**: Docker, Swagger, GIT

## 🚀 Getting Started

### Prerequisites

You need to install [Go], [Gin], [Node.js](http://nodejs.org/), and [Git](https://git-scm.com/) locally.

## 📦 System Requirements

- Go 1.18 or later
- Node.js v14.16.0 or later
- npm version: 6.14.11
- MySQL or other compatible databases
- Docker, Kubernetes (optional)

### Backend Installation Steps

1. Clone the project:

    ```bash
    git clone https://github.com/sunwenbo/smart-api.git
    cd smart-api
    ```

2. Install dependencies:

    ```bash
    go mod tidy
    ```

3. Configure the database connection:

   ```bash
   cp config/settings.full.yml config/settings.yml
   ```

   Modify the database connection information in `config/settings.yml` and ensure the configuration is correct.

4. Initialize the database:

    ```bash
    # For macOS or Linux:
    $ ./smart-api migrate -c config/settings.dev.yml
   
    # ⚠️ For Windows:
    $ smart-api.exe migrate -c config/settings.dev.yml
   
    # Start the project (or use an IDE to debug):
    $ ./smart-api server -c config/settings.yml
   
    # ⚠️ For Windows:
    $ smart-api.exe server -c config/settings.yml
    ```

5. Add data to the `sys_api` table:

   Use the `-a true` flag to automatically add missing API data when starting the project:

   ```bash
   ./smart-api server -c config/settings.yml -a true

6. Document generation:
   ```bash
   go generate
   ```
7. Start the service:
   ```
   ./smart-api server -c config/settings.yml
   ```

#### Using Docker for Compilation and Start

```azure

```

#### Cross Compilation
   ```bash
   # windows
   env GOOS=windows GOARCH=amd64 go build main.go
   
   # or
   # linux
   env GOOS=linux GOARCH=amd64 go build main.go
   ```

### Frontend Installation Steps

1. Clone the frontend project:

    ```bash
    git clone https://github.com/sunwenbo/smart-ui-new.git
    cd smart-ui-new
    ```

2. Install dependencies:

    ```bash
    npm config set registry https://registry.npmmirror.com/  
    npm config get registry
    npm install --legacy-peer-deps 
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Access the address:

   Open your browser and go to `http://localhost:9527` to view the frontend interface.


## Usage Instructions

1. **Login to the system**: Use the default administrator account `admin` to log in.
2. **Create Work Orders**: Go to the task management page, click "Create Work Order", fill in the relevant information, and assign a handler.
3. **Task Execution Monitoring**: You can view the execution status, results, and logs of tasks in real-time through the task execution interface in the system.
4. **Work Order Rating and Comments**: After a work order is completed, users can rate the work order and use the comment feature to provide feedback on the handling process.

## System Screenshots


### Login Interface
![Login Interface](https://example.com/screenshot/login.png)

### Work Order Management
![Work Order Management](https://example.com/screenshot/order-management.png)

### Real-time Task Monitoring
![Real-time Task Monitoring](https://example.com/screenshot/task-monitor.png)

## Contribution Guidelines

Contributions from the community developers are welcome. If you want to participate in this project, please follow these steps:

1. **Fork this repository**: Click the `Fork` button at the top right to copy the project to your GitHub account.
2. **Clone your Fork**: Run the following command in your terminal to clone the project to your local machine:

    ```bash
    git clone https://github.com/your-username/smart-api-backend.git
    ```

3. **Create a branch**: In the cloned project directory, create a new branch for development:

    ```bash
    git checkout -b feature-branch-name
    ```
4. **Commit your changes**: After development, use `git add` and `git commit` to submit your code changes.

    ```bash
    git add .
    git commit -m "Describe your changes"
    ```

5. **Submit a Pull Request**: On GitHub, submit a Pull Request, ensuring your code passes all tests and adheres to coding standards.

## Frequently Asked Questions

### How to modify the database configuration?

The database configuration is stored in `config/settings.yml`, where you can modify the `database` configuration item according to your needs.

### How to add a new API interface?

Create new handling logic in the `api` directory and register the route in `router`. The service layer logic should be placed in the `service` directory.

### How to implement WebSocket real-time task monitoring?

During task execution, the system pushes task status update information to the frontend via WebSocket. The frontend uses the `WebSocket` interface to receive and dynamically display task execution logs.

## Open Source License

The Smart-API Work Order System is open-sourced under the [MIT License](LICENSE), allowing individuals and organizations to use and modify it for free.


## 📨 Interaction

<table>
   <tr>
    <td><img src="https://github.com/sunwenbo/golang/raw/master/wx.jpeg" width="180px"></td>
  </tr>
  <tr>
    <td>WeChat</td>
  </tr>
</table>

## 💎 Contributors

Thanks to the following developers for their contributions to this project:

- [Developer 1](https://github.com/developer1)
- [Developer 2](https://github.com/developer2)
- [Developer 3](https://github.com/developer3)


> If you have any questions or suggestions, please submit an [issue](https://github.com/your-repo/smart-api-backend/issues).

## 🤝 Special Thanks
###  JetBrains Open Source License Support

The `smart-api` project has always been developed using JetBrains' GoLand IDE, based on **free JetBrains Open Source license(s)**, expressing my gratitude for their support.

<a href="https://www.jetbrains.com/?from=kubeadm-ha" target="_blank"><img src="https://raw.githubusercontent.com/panjf2000/illustrations/master/jetbrains/jetbrains-variant-4.png" width="250" align="middle"/></a>

1. [ant-design](https://github.com/ant-design/ant-design)
2. [ant-design-pro](https://github.com/ant-design/ant-design-pro)
3. [arco-design](https://github.com/arco-design/arco-design)
4. [arco-design-pro](https://github.com/arco-design/arco-design-pro)
5. [gin](https://github.com/gin-gonic/gin)
6. [casbin](https://github.com/casbin/casbin)
7. [spf13/viper](https://github.com/spf13/viper)
8. [gorm](https://github.com/jinzhu/gorm)
9. [gin-swagger](https://github.com/swaggo/gin-swagger)
10. [jwt-go](https://github.com/dgrijalva/jwt-go)
11. [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)
12. [ruoyi-vue](https://gitee.com/y_project/RuoYi-Vue)
13. [form-generator](https://github.com/JakHuang/form-generator)


## 🤟 Donation

> If you find this project helpful, you can buy the author a drink to show your encouragement :tropical_drink:

<img class="no-margin" src="https://github.com/sunwenbo/golang/raw/master/wxPay.jpeg"  height="200px" >

## 🤝 Links

[Go Developer Growth Roadmap](http://www.golangroadmap.com/)

## 🔑 License

[MIT](https://github.com/sunwenbo/smart-api/blob/main/LICENSE.md)

Copyright (c) 2022 sunwenbo
