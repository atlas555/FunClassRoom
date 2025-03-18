from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import pymysql
import config
import os

# 因MySQLDB不支持Python3，使用pymysql扩展库代替MySQLDB库
pymysql.install_as_MySQLdb()

# 初始化web应用
app = Flask(__name__, instance_relative_config=True)
app.config['DEBUG'] = config.DEBUG

# 设置密钥，用于会话加密
app.secret_key = os.environ.get('SECRET_KEY', 'dev-key-for-testing-only')

# 设定数据库链接
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{}:{}@{}/{}'.format(config.username, config.password,
                                                                             config.db_address, config.db)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化DB操作对象
db = SQLAlchemy(app)

# 初始化LoginManager
login_manager = LoginManager(app)
login_manager.login_view = 'login'  # 设置登录页面的视图函数
login_manager.login_message = '请先登录'  # 设置未登录时的提示消息

# 加载控制器
from wxcloudrun import views

# 加载配置
app.config.from_object('config')
