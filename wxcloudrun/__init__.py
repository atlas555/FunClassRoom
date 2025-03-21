import pymysql
import os
import config

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# 使Python能够兼容MySQL模块的API
pymysql.install_as_MySQLdb()

# 初始化数据库
db = SQLAlchemy()

# 初始化登录管理器
login_manager = LoginManager()

def create_app():
    """
    创建并配置Flask应用
    """
    app = Flask(__name__, instance_relative_config=True)
    
    # 配置数据库
    app.config['DEBUG'] = config.DEBUG
    app.secret_key = os.environ.get('SECRET_KEY', 'dev-key-for-testing-only')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{}:{}@{}/{}'.format(
        config.username, config.password, config.db_address, config.db)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 初始化扩展
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = '请先登录'
    
    # 注册蓝图
    from wxcloudrun.blueprints import init_app
    init_app(app)
    
    # 用户加载回调
    @login_manager.user_loader
    def load_user(user_id):
        from wxcloudrun.model import User
        return User.query.get(int(user_id))
    
    # 确保数据库表已创建
    with app.app_context():
        db.create_all()
    
    return app
