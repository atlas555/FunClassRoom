from .auth import auth_bp
from .students import students_bp
from .packages import packages_bp
from .records import records_bp
from .wechat import wechat_bp

def init_app(app):
    """
    注册所有蓝图
    """
    app.register_blueprint(auth_bp)
    app.register_blueprint(students_bp)
    app.register_blueprint(packages_bp)
    app.register_blueprint(records_bp)
    app.register_blueprint(wechat_bp)
