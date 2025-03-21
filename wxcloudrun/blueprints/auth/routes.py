from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import func

from wxcloudrun.model import User
from wxcloudrun import db
from wxcloudrun.response import make_succ_empty_response, make_succ_response, make_err_response

# 创建蓝图
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def index():
    """
    :return: 重定向到学生页面或登录页面
    """
    if current_user.is_authenticated:
        return redirect(url_for('students.index'))
    return redirect(url_for('auth.login'))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # 如果已登录，重定向到学生页面
    if current_user.is_authenticated:
        return redirect(url_for('students.index'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            flash('请输入用户名和密码')
            return redirect(url_for('auth.login'))

        # 首次使用时，创建一个默认管理员账户
        admin_exists = User.query.filter(func.lower(User.username) == func.lower('admin')).first()
        if not admin_exists:
            default_admin = User(username='admin', is_admin=True)
            default_admin.set_password('admin')
            db.session.add(default_admin)
            db.session.commit()

        # 用户身份验证
        user = User.query.filter(func.lower(User.username) == func.lower(username)).first()
        if user and user.check_password(password):
            login_user(user)
            # 获取next参数，如果存在则跳转到指定页面
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('students.index'))
        else:
            flash('用户名或密码错误')

    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

@auth_bp.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    """
    管理员页面：用于用户管理
    """
    # 验证当前用户是否为管理员
    if not current_user.is_admin:
        flash('权限不足，您不是管理员')
        return redirect(url_for('students.index'))
    
    # 处理添加用户请求
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'add_user':
            username = request.form.get('username')
            password = request.form.get('password')
            confirm_password = request.form.get('confirm_password')
            is_admin = request.form.get('is_admin') == 'on'
            
            # 验证输入
            if not username or not password:
                flash('用户名和密码不能为空')
                return redirect(url_for('auth.admin'))
                
            if password != confirm_password:
                flash('两次输入的密码不一致')
                return redirect(url_for('auth.admin'))
                
            # 检查用户名是否已存在
            existing_user = User.query.filter(func.lower(User.username) == func.lower(username)).first()
            if existing_user:
                flash('用户名已存在')
                return redirect(url_for('auth.admin'))
                
            # 创建新用户
            new_user = User(username=username, is_admin=is_admin)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            
            flash('用户添加成功')
            return redirect(url_for('auth.admin'))
            
        elif action == 'delete_user':
            user_id = request.form.get('user_id')
            
            if not user_id:
                flash('无效的用户ID')
                return redirect(url_for('auth.admin'))
                
            # 不允许删除自己
            if int(user_id) == current_user.id:
                flash('不能删除当前登录的用户')
                return redirect(url_for('auth.admin'))
                
            user = User.query.get(user_id)
            if not user:
                flash('用户不存在')
                return redirect(url_for('auth.admin'))
                
            db.session.delete(user)
            db.session.commit()
            
            flash('用户删除成功')
            return redirect(url_for('auth.admin'))
            
        elif action == 'change_password':
            user_id = request.form.get('password_user_id')
            new_password = request.form.get('new_password')
            confirm_new_password = request.form.get('confirm_new_password')
            
            if not user_id or not new_password:
                flash('用户ID和新密码不能为空')
                return redirect(url_for('auth.admin'))
                
            if new_password != confirm_new_password:
                flash('两次输入的新密码不一致')
                return redirect(url_for('auth.admin'))
                
            user = User.query.get(user_id)
            if not user:
                flash('用户不存在')
                return redirect(url_for('auth.admin'))
                
            user.set_password(new_password)
            db.session.commit()
            
            flash('密码修改成功')
            return redirect(url_for('auth.admin'))
    
    # 获取所有用户
    users = User.query.all()
    return render_template('admin.html', users=users) 