# FunClassRoom

客户管理系统 (CRM) - 课程管理和客户管理应用

## 项目结构

项目采用模块化的蓝图 (Blueprint) 结构，按业务功能划分为以下几个模块：

```
wxcloudrun/
├── __init__.py              # 应用工厂和初始化
├── model.py                 # 数据库模型
├── dao.py                   # 数据访问对象
├── response.py              # 通用响应格式工具
├── blueprints/              # 蓝图模块
│   ├── __init__.py          # 蓝图注册
│   ├── auth/                # 认证模块
│   │   ├── __init__.py
│   │   └── routes.py        # 认证和用户管理相关路由
│   ├── students/            # 学生/客户管理模块
│   │   ├── __init__.py
│   │   └── routes.py        # 学生/客户管理相关路由
│   ├── packages/            # 课时包管理模块
│   │   ├── __init__.py
│   │   └── routes.py        # 课时包管理相关路由
│   ├── records/             # 课程记录管理模块
│   │   ├── __init__.py
│   │   └── routes.py        # 课程和消费记录相关路由
│   └── wechat/              # 微信集成模块
│       ├── __init__.py
│       └── routes.py        # 微信API相关路由
├── static/                  # 静态资源
│   ├── css/
│   ├── js/
│   └── img/
└── templates/               # 模板文件
    ├── includes/            # 包含文件
    └── modals/              # 模态框组件
```

## 模块说明

1. **认证模块 (auth)**：
   - 用户登录、注销
   - 用户管理（添加、删除、修改密码）

2. **学生/客户管理模块 (students)**：
   - 学生/客户信息的CRUD操作
   - 学生/客户列表显示和筛选

3. **课时包管理模块 (packages)**：
   - 课时包的CRUD操作
   - 课时包模板管理

4. **课程记录管理模块 (records)**：
   - 上课记录管理
   - 课时消耗记录管理

5. **微信集成模块 (wechat)**：
   - 微信相关API集成
   - 消息推送

## 技术栈

- 后端: Flask, SQLAlchemy
- 前端: Bootstrap, jQuery
- 数据库: MySQL

## 运行方式

本地开发环境：

```bash
python run.py
```

生产环境:

```bash
# 设置环境变量
export HOST=0.0.0.0
export PORT=80
export DEBUG=False

# 运行应用
python run.py
```

## License

[MIT](./LICENSE)
