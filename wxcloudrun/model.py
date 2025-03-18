from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from wxcloudrun import db


# 课时包表
class CoursePackage(db.Model):
    __tablename__ = 'CoursePackage'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, comment='课时包名称')
    total_hours = db.Column(db.Float, default=0, comment='总课时数')
    status = db.Column(db.String(20), default='active', comment='状态：active-活跃，inactive-结束')
    notes = db.Column(db.Text, nullable=True, comment='备注')
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, default=datetime.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, default=datetime.now())


# 学生/客户表
class Student(db.Model):
    __tablename__ = 'Student'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False, comment='姓名')
    phone = db.Column(db.String(20), nullable=True, comment='联系电话')
    email = db.Column(db.String(100), nullable=True, comment='电子邮箱')
    birthdate = db.Column(db.Date, nullable=True, comment='出生日期')
    # 保留总课时和已用课时字段作为冗余字段，方便查询统计
    total_hours = db.Column(db.Float, default=0, comment='总课时数（所有课时包总和）')
    used_hours = db.Column(db.Float, default=0, comment='已消耗课时（所有课时包总和）')
    remaining_hours = db.Column(db.Float, default=0, comment='剩余课时（所有课时包总和）')
    register_date = db.Column(db.Date, nullable=False, default=datetime.now().date(), comment='注册日期')
    last_class_date = db.Column(db.Date, nullable=True, comment='最近上课日期')
    address = db.Column(db.String(200), nullable=True, comment='地址')
    notes = db.Column(db.Text, nullable=True, comment='备注')
    status = db.Column(db.String(20), default='active', comment='状态：active-活跃，inactive-已结课，new-新客户')
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, default=datetime.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, default=datetime.now())

    # 建立与ClassRecord的一对多关系
    class_records = db.relationship('ClassRecord', backref='student', lazy=True, cascade='all, delete-orphan')
    # 建立与StudentCoursePackage的一对多关系
    student_packages = db.relationship('StudentCoursePackage', backref='student', lazy=True, cascade='all, delete-orphan')
    # 保留与ConsumptionRecord的一对多关系，但是不直接删除
    consumption_records = db.relationship('ConsumptionRecord', backref='student', lazy=True)


# 上课记录表
class ClassRecord(db.Model):
    __tablename__ = 'ClassRecord'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('Student.id'), nullable=False, comment='学生ID')
    date = db.Column(db.Date, nullable=False, comment='上课日期')
    content = db.Column(db.Text, nullable=False, comment='学习内容记录')
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, default=datetime.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, default=datetime.now())


# 课消记录表
class ConsumptionRecord(db.Model):
    __tablename__ = 'ConsumptionRecord'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('Student.id'), nullable=False, comment='学生ID')
    package_id = db.Column(db.Integer, db.ForeignKey('StudentCoursePackage.id'), nullable=False, comment='学生课时包ID')
    consumption_hours = db.Column(db.Float, nullable=False, comment='消耗课时')
    remaining_hours = db.Column(db.Float, nullable=False, comment='消耗后剩余课时')
    used_hours = db.Column(db.Float, nullable=False, comment='消耗后已用课时')
    operation_time = db.Column(db.TIMESTAMP, nullable=False, default=datetime.now(), comment='操作时间')
    operator_name = db.Column(db.String(64), nullable=True, comment='操作人')
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, default=datetime.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, default=datetime.now())


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(512))
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def validate_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def __repr__(self):
        return f'<User {self.username}>'


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
    created_at = db.Column('created_at', db.TIMESTAMP, nullable=False, default=datetime.now())
    updated_at = db.Column('updated_at', db.TIMESTAMP, nullable=False, default=datetime.now())

    # Establish relationship with ConsumptionRecord
    consumption_records = db.relationship('ConsumptionRecord', backref='student_package', lazy=True, cascade='all, delete-orphan')