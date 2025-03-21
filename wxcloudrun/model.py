from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from wxcloudrun import db
from sqlalchemy import func


# 用户表 - 移动到文件开头
class User(db.Model, UserMixin):
    __tablename__ = 'User'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(512))
    is_admin = db.Column(db.Boolean, default=False, comment='是否是管理员')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def __repr__(self):
        return f'<User {self.username}>'


# 课时包表
class CoursePackage(db.Model):
    __tablename__ = 'CoursePackage'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, comment='课时包名称')
    total_hours = db.Column(db.Float, default=0, comment='总课时数')
    status = db.Column(db.String(20), default='active', comment='状态：active-活跃，inactive-结束')
    notes = db.Column(db.Text, nullable=True, comment='备注')
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())


# 学生/客户表
class Student(db.Model):
    __tablename__ = 'Student'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False, comment='姓名')
    phone = db.Column(db.String(20), nullable=True, comment='联系电话')
    email = db.Column(db.String(100), nullable=True, comment='电子邮箱')
    birthdate = db.Column(db.Date, nullable=True, comment='出生日期')
    register_date = db.Column(db.Date, nullable=False, default=datetime.now().date(), comment='注册日期')
    address = db.Column(db.String(200), nullable=True, comment='地址')
    notes = db.Column(db.Text, nullable=True, comment='备注')
    status = db.Column(db.String(20), default='active', comment='状态：active-活跃，inactive-已结课，new-新客户')
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())

    # # 定义关系但不在这里级联删除
    # class_records = db.relationship('ClassRecord', backref='student', lazy=True)
    # consumption_records = db.relationship('ConsumptionRecord', backref='student', lazy=True)


# 学生课时包关联表
class StudentCoursePackage(db.Model):
    __tablename__ = 'StudentCoursePackage'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('Student.id'), nullable=False, comment='学生ID')
    course_package_id = db.Column(db.Integer, db.ForeignKey('CoursePackage.id'), nullable=False, comment='课时包ID')
    used_hours = db.Column(db.Float, default=0, comment='已消耗课时')
    remaining_hours = db.Column(db.Float, default=0, comment='剩余课时')
    purchase_date = db.Column(db.Date, nullable=False, default=datetime.now().date(), comment='购买日期')
    expire_date = db.Column(db.Date, nullable=True, comment='过期日期')
    status = db.Column(db.String(20), default='active', comment='状态：active-活跃，expired-已过期，used-已用完')
    notes = db.Column(db.Text, nullable=True, comment='备注')
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())

    # # 关联关系
    # student = db.relationship('Student', backref=db.backref('packages', lazy=True))
    # course_package = db.relationship('CoursePackage', backref=db.backref('student_packages', lazy=True))
    # consumption_records = db.relationship('ConsumptionRecord', backref='student_package', lazy=True)


# 上课记录表
class ClassRecord(db.Model):
    __tablename__ = 'ClassRecord'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('Student.id'), nullable=False, comment='学生ID')
    class_date = db.Column(db.Date, nullable=False, comment='上课日期')
    content = db.Column(db.Text, nullable=False, comment='学习内容记录')
    operator_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=True, comment='操作人ID')
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # 关联关系
    operator = db.relationship('User', backref=db.backref('class_records', lazy=True))