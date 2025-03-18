from datetime import datetime
from flask_login import login_user, LoginManager, logout_user, login_required, current_user
from flask import render_template, request, jsonify, redirect, url_for, flash
import requests
from run import app
from wxcloudrun import db, login_manager
from wxcloudrun.dao import (
    get_all_students, get_student_by_id, add_student, update_student, delete_student,
    get_student_records, add_class_record, get_student_consumption_records, add_consumption_record,
    get_student_course_packages, get_active_course_packages, get_package_by_id,
    add_course_package, update_course_package, delete_course_package, recalculate_student_hours,
    get_all_course_packages, add_course_package_base
)
from wxcloudrun.model import Student, ClassRecord, User, ConsumptionRecord, CoursePackage, StudentCoursePackage
from wxcloudrun.response import make_succ_empty_response, make_succ_response, make_err_response
from sqlalchemy import func


login_manager = LoginManager(app)  # 实例化扩展类
login_manager.login_view = 'login'  # 设置登录页面的视图函数
login_manager.login_message = '请先登录'  # 设置未登录时的提示消息

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    """
    :return: 重定向到学生页面或登录页面
    """
    if current_user.is_authenticated:
        return redirect(url_for('students'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    # 如果已登录，重定向到学生页面
    if current_user.is_authenticated:
        return redirect(url_for('students'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            flash('请输入用户名和密码')
            return redirect(url_for('login'))

        # 首次使用时，创建一个默认管理员账户
        user = User.query.filter_by(username=username).first()
        if not user and username == 'admin':
            user = User(username='admin')
            user.set_password('admin123')  # 设置默认密码
            db.session.add(user)
            db.session.commit()
            
        # 验证用户
        if user and user.validate_password(password):
            login_user(user)
            flash('登录成功')
            return redirect(url_for('students'))

        flash('用户名或密码错误')
        return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('您已退出登录')
    return redirect(url_for('login'))

@app.route('/students')
@login_required
def students():
    """
    :return: 返回students页面
    """
    return render_template('students.html')

# 学生/客户管理相关API端点
@app.route('/api/students', methods=['GET'])
@login_required
def api_get_all_students():
    """获取所有学生信息，支持分页"""
    try:
        # 获取分页参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', 'all')
        
        # 验证参数
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:  # 限制每页最大数量为100
            per_page = 20
        
        # 获取学生数据和总数
        students, total_count = get_all_students(page, per_page, status)
        
        # 计算总页数
        total_pages = (total_count + per_page - 1) // per_page
        
        # 转换为JSON格式
        result = []
        for student in students:
            # 获取学生关联的所有课时包
            student_packages = StudentCoursePackage.query.filter_by(student_id=student.id).all()
            
            # 计算总课时、已用课时和剩余课时
            total_hours = 0
            used_hours = 0
            remaining_hours = 0
            
            for package in student_packages:
                # 获取基础课时包总课时
                course_package = CoursePackage.query.get(package.course_package_id)
                if course_package:
                    total_hours += course_package.total_hours
                    used_hours += package.used_hours
                    remaining_hours += package.remaining_hours
            
            result.append({
                'id': student.id,
                'name': student.name,
                'phone': student.phone or '',
                'email': student.email or '',
                'birthdate': student.birthdate.strftime('%Y-%m-%d') if student.birthdate else '',
                'remainingHours': remaining_hours,
                'usedHours': used_hours,
                'totalHours': total_hours,
                'registerDate': student.register_date.strftime('%Y-%m-%d') if student.register_date else datetime.now().strftime('%Y-%m-%d'),
                'lastClassDate': student.last_class_date.strftime('%Y-%m-%d') if student.last_class_date else '',
                'address': student.address or '',
                'notes': student.notes or '',
                'status': student.status,
                'createdAt': student.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updatedAt': student.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # 返回数据，包括分页信息
        response_data = {
            'items': result,
            'pagination': {
                'total': total_count,
                'page': page,
                'per_page': per_page,
                'pages': total_pages
            }
        }
        
        return make_succ_response(response_data)
    except Exception as e:
        return make_err_response(f'获取学生列表失败: {str(e)}')


@app.route('/api/students/<int:student_id>', methods=['GET'])
def api_get_student(student_id):
    """获取单个学生信息"""
    try:
        student = get_student_by_id(student_id)
        
        if not student:
            return make_err_response('学生不存在')
        
        # 获取学生关联的所有课时包
        student_packages = StudentCoursePackage.query.filter_by(student_id=student_id).all()
        
        # 计算总课时、已用课时和剩余课时
        total_hours = 0
        used_hours = 0
        remaining_hours = 0
        
        for package in student_packages:
            # 获取基础课时包总课时
            course_package = CoursePackage.query.get(package.course_package_id)
            if course_package:
                total_hours += course_package.total_hours
                used_hours += package.used_hours
                remaining_hours += package.remaining_hours
        
        # 转换为JSON格式
        result = {
            'id': student.id,
            'name': student.name,
            'phone': student.phone or '',
            'email': student.email or '',
            'birthdate': student.birthdate.strftime('%Y-%m-%d') if student.birthdate else '',
            'remainingHours': remaining_hours,
            'usedHours': used_hours,
            'totalHours': total_hours,
            'registerDate': student.register_date.strftime('%Y-%m-%d') if student.register_date else datetime.now().strftime('%Y-%m-%d'),
            'lastClassDate': student.last_class_date.strftime('%Y-%m-%d') if student.last_class_date else '',
            'address': student.address or '',
            'notes': student.notes or '',
            'status': student.status,
            'createdAt': student.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updatedAt': student.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f'获取学生信息失败: {str(e)}')


@app.route('/api/students', methods=['POST'])
@login_required
def api_add_student():
    """添加新学生"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return make_err_response('无效的请求数据')
            
        # 验证必填字段
        if 'name' not in data or not data['name']:
            return make_err_response('姓名为必填项')
        
        # 转换前端驼峰命名为后端下划线命名
        student_data = {
            'name': data.get('name'),
            'phone': data.get('phone'),
            'email': data.get('email'),
            'birthdate': data.get('birthdate'),
            'address': data.get('address'),
            'notes': data.get('notes'),
            'status': data.get('status', 'active')
        }
            
        # 添加学生
        student = add_student(student_data)
        
        if not student:
            return make_err_response('添加学生失败')
            
        # 如果提供了课时包ID，为新学生关联课时包
        package = None
        if 'coursePackageId' in data and data['coursePackageId']:
            course_package = CoursePackage.query.get(data['coursePackageId'])
            if course_package:
                # 创建学生课时包关联
                student_package = StudentCoursePackage(
                    student_id=student.id,
                    course_package_id=course_package.id,
                    used_hours=0,
                    remaining_hours=course_package.total_hours,
                    purchase_date=datetime.now().date(),
                    expire_date=None,  # 默认无过期日期
                    status='active',
                    notes=''
                )
                db.session.add(student_package)
                db.session.commit()
                package = student_package
        
        # 计算课时信息
        total_hours = 0
        used_hours = 0
        remaining_hours = 0
        
        if package:
            course_package = CoursePackage.query.get(package.course_package_id)
            total_hours = course_package.total_hours
            used_hours = package.used_hours
            remaining_hours = package.remaining_hours
            
        # 转换为JSON格式
        result = {
            'id': student.id,
            'name': student.name,
            'phone': student.phone or '',
            'email': student.email or '',
            'birthdate': student.birthdate.strftime('%Y-%m-%d') if student.birthdate else '',
            'remainingHours': remaining_hours,
            'usedHours': used_hours,
            'totalHours': total_hours,
            'registerDate': student.register_date.strftime('%Y-%m-%d') if student.register_date else datetime.now().strftime('%Y-%m-%d'),
            'lastClassDate': student.last_class_date.strftime('%Y-%m-%d') if student.last_class_date else '',
            'address': student.address or '',
            'notes': student.notes or '',
            'status': student.status,
            'createdAt': student.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updatedAt': student.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return make_succ_response(result)
    except Exception as e:
        db.session.rollback()
        return make_err_response(f'添加学生失败: {str(e)}')


@app.route('/api/students/<int:student_id>', methods=['PUT'])
@login_required
def api_update_student(student_id):
    """更新学生信息"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return make_err_response('无效的请求数据')
        
        # 验证必填字段
        if 'name' in data and not data['name']:
            return make_err_response('姓名不能为空')
        
        # 注意：不再从API直接更新课时信息，这些数据现在从课时包中获取
        # 移除与课时有关的验证逻辑
        
        # 转换前端驼峰命名为后端下划线命名
        student_data = {}
        if 'name' in data:
            student_data['name'] = data['name']
        if 'phone' in data:
            student_data['phone'] = data['phone']
        if 'email' in data:
            student_data['email'] = data['email']
        if 'birthdate' in data:
            student_data['birthdate'] = data['birthdate']
        if 'address' in data:
            student_data['address'] = data['address']
        if 'notes' in data:
            student_data['notes'] = data['notes']
        if 'status' in data:
            student_data['status'] = data['status']
            
        # 更新学生
        student = update_student(student_id, student_data)
        
        if not student:
            return make_err_response('学生不存在或更新失败')
        
        # 从CoursePackage模型中获取课时信息
        total_hours = db.session.query(func.sum(CoursePackage.total_hours))\
            .filter(CoursePackage.student_id == student_id).scalar() or 0
        
        used_hours = db.session.query(func.sum(CoursePackage.used_hours))\
            .filter(CoursePackage.student_id == student_id).scalar() or 0
        
        remaining_hours = db.session.query(func.sum(CoursePackage.remaining_hours))\
            .filter(CoursePackage.student_id == student_id).scalar() or 0
            
        # 转换为JSON格式
        result = {
            'id': student.id,
            'name': student.name,
            'phone': student.phone or '',
            'email': student.email or '',
            'birthdate': student.birthdate.strftime('%Y-%m-%d') if student.birthdate else '',
            'remainingHours': remaining_hours,
            'usedHours': used_hours,
            'totalHours': total_hours,
            'registerDate': student.register_date.strftime('%Y-%m-%d') if student.register_date else datetime.now().strftime('%Y-%m-%d'),
            'lastClassDate': student.last_class_date.strftime('%Y-%m-%d') if student.last_class_date else '',
            'address': student.address or '',
            'notes': student.notes or '',
            'status': student.status,
            'createdAt': student.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updatedAt': student.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f'更新学生信息失败: {str(e)}')


@app.route('/api/students/<int:student_id>', methods=['DELETE'])
@login_required
def api_delete_student(student_id):
    """删除学生"""
    try:
        # 检查学生是否存在
        student = get_student_by_id(student_id)
        if not student:
            return make_err_response('学生不存在')
            
        # 删除学生
        success = delete_student(student_id)
        
        if not success:
            return make_err_response('删除学生失败')
            
        return make_succ_empty_response()
    except Exception as e:
        return make_err_response(f'删除学生失败: {str(e)}')


@app.route('/api/students/<int:student_id>/records', methods=['GET'])
@login_required
def api_get_student_records(student_id):
    """获取学生的上课记录"""
    try:
        # 检查学生是否存在
        student = get_student_by_id(student_id)
        if not student:
            return make_err_response('学生不存在')
            
        # 获取记录
        records = get_student_records(student_id)
        
        # 转换为JSON格式
        result = []
        for record in records:
            result.append({
                'id': record.id,
                'studentId': record.student_id,
                'studentName': student.name,  # 添加学生姓名，方便前端显示
                'date': record.date.strftime('%Y-%m-%d'),
                'content': record.content,
                'createdAt': record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updatedAt': record.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f'获取学生记录失败: {str(e)}')


@app.route('/api/records', methods=['POST'])
@login_required
def api_add_class_record():
    """添加上课记录"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return make_err_response('无效的请求数据')
            
        # 验证必填字段
        if 'studentId' not in data or not data['studentId']:
            return make_err_response('学生ID为必填项')
            
        if 'content' not in data or not data['content']:
            return make_err_response('学习内容为必填项')
            
        # 确保studentId是整数
        try:
            student_id = int(data['studentId'])
            data['studentId'] = student_id
        except (ValueError, TypeError):
            return make_err_response('学生ID必须是整数')
            
        # 检查学生是否存在
        student = get_student_by_id(data['studentId'])
        if not student:
            return make_err_response('学生不存在')
            
        # 如果没有提供日期，使用今天的日期
        if 'date' not in data or not data['date']:
            data['date'] = datetime.now().strftime('%Y-%m-%d')
            
        # 添加记录
        record = add_class_record(data)
        
        if not record:
            return make_err_response('添加记录失败')
            
        # 转换为JSON格式
        result = {
            'id': record.id,
            'studentId': record.student_id,
            'studentName': student.name,
            'date': record.date.strftime('%Y-%m-%d'),
            'content': record.content,
            'createdAt': record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updatedAt': record.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f'添加记录失败: {str(e)}')

@app.route('/wx/info/gettoken', methods=['GET'])
@login_required
def get_token():
    """
    :return: 获取 token
    """
    appid = request.args.get('appid')
    appsecret = request.args.get('appsecret')
    url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={}&secret={}".format(appid, appsecret)
    response = requests.get(url)
    return make_succ_response(response.json()) 

@app.route('/wx/info/getopenid', methods=['GET'])
def get_openid():
    """
    :return: 获取 openid
    """
    token = request.args.get('token')
    url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token={}".format(token)
    response = requests.get(url)
    return make_succ_response(response.json()) 

@app.route('/wx/info/getuserinfo', methods=['GET'])
def get_userinfo():
    """
    :return: 获取用户信息
    """
    token = request.args.get('token')
    openid = request.args.get('openid') 
    url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token={}&openid={}&lang=zh_CN".format(token, openid)
    response = requests.get(url)
    return make_succ_response(response.json()) 

@app.route('/wx/act/sendmessage', methods=['POST'])
def send_message():
    """
    :return: 发送消息的结果
    """
    # 获取请求体参数
    params = request.get_json()
    
    # 检查必要参数
    if 'token' not in params:
        return make_err_response('缺少token参数')
    if 'touser' not in params:
        return make_err_response('缺少touser参数')
    if 'template_id' not in params:
        return make_err_response('缺少template_id参数')
    if 'data' not in params:
        return make_err_response('缺少data参数')
    
    # 构建推送消息的JSON对象
    message_data = {
        "touser": params['touser'],
        "template_id": params['template_id'],
        "data": params['data']
    }
    
    # 如果有跳转URL，添加到消息数据中
    if 'url' in params:
        message_data["url"] = params['url']
    
    print(message_data)

    # 发送消息请求
    url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={}".format(params['token'])
    response = requests.post(url, json=message_data)
    
    return make_succ_response(response.json())

@app.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    """管理员面板，用于用户管理"""
    # 只允许admin用户访问此页面
    if current_user.username != 'admin':
        flash('您没有权限访问此页面')
        return redirect(url_for('students'))
        
    # 获取所有用户
    users = User.query.all()
    
    if request.method == 'POST':
        action = request.form.get('action')
        
        # 添加用户
        if action == 'add':
            username = request.form.get('username')
            password = request.form.get('password')
            
            if not username or not password:
                flash('用户名和密码不能为空')
                return redirect(url_for('admin'))
                
            # 检查用户是否已存在
            if User.query.filter_by(username=username).first():
                flash(f'用户名 {username} 已存在')
                return redirect(url_for('admin'))
                
            # 创建新用户
            user = User(username=username)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            flash(f'用户 {username} 创建成功')
            
        # 删除用户
        elif action == 'delete':
            user_id = request.form.get('user_id')
            
            if not user_id:
                flash('用户ID不能为空')
                return redirect(url_for('admin'))
                
            # 不能删除当前登录用户
            if int(user_id) == current_user.id:
                flash('不能删除当前登录用户')
                return redirect(url_for('admin'))
                
            # 删除用户
            user = User.query.get(user_id)
            if user:
                db.session.delete(user)
                db.session.commit()
                flash(f'用户 {user.username} 删除成功')
            else:
                flash('用户不存在')
                
        # 修改密码
        elif action == 'change_password':
            user_id = request.form.get('user_id')
            new_password = request.form.get('new_password')
            
            if not user_id or not new_password:
                flash('用户ID和新密码不能为空')
                return redirect(url_for('admin'))
                
            # 修改密码
            user = User.query.get(user_id)
            if user:
                user.set_password(new_password)
                db.session.commit()
                flash(f'用户 {user.username} 密码修改成功')
            else:
                flash('用户不存在')
        
        return redirect(url_for('admin'))
        
    return render_template('admin.html', users=users)

# 获取学生课消记录
@app.route('/api/students/<int:student_id>/consumption-records', methods=['GET'])
@login_required
def get_student_consumption_records_api(student_id):
    """获取学生的课消记录"""
    try:
        # 验证学生是否存在
        student = get_student_by_id(student_id)
        if not student:
            return make_err_response('学生不存在')
            
        # 获取查询参数
        package_id = request.args.get('package_id', type=int)
        
        # 查询条件
        query = ConsumptionRecord.query.filter_by(student_id=student_id)
        
        # 如果指定了课时包ID，添加过滤条件
        if package_id:
            query = query.filter_by(package_id=package_id)
            
        # 执行查询，按操作时间倒序排列
        records = query.order_by(ConsumptionRecord.operation_time.desc()).all()
        
        # 转换为JSON格式
        result = []
        for record in records:
            # 获取学生课时包信息
            student_package = StudentCoursePackage.query.get(record.package_id)
            
            # 获取基础课时包信息
            course_package_id = student_package.course_package_id if student_package else None
            course_package = CoursePackage.query.get(course_package_id) if course_package_id else None
            package_name = course_package.name if course_package else "未知课时包"
            
            result.append({
                'id': record.id,
                'studentId': record.student_id,
                'packageId': record.package_id,
                'packageName': package_name,
                'consumptionHours': record.consumption_hours,
                'remainingHours': record.remaining_hours,
                'usedHours': record.used_hours,
                'operationTime': record.operation_time.isoformat(),
                'operatorName': record.operator_name,
                'createdAt': record.created_at.isoformat()
            })
            
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f"获取课消记录失败: {str(e)}")
        
@app.route('/api/consumption-records', methods=['POST'])
@login_required
def add_consumption_record_api():
    """添加课消记录"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return make_err_response('无效的请求数据')
            
        # 验证必填字段
        if 'studentId' not in data or not data['studentId']:
            return make_err_response('学生ID为必填项')
            
        if 'packageId' not in data or not data['packageId']:
            return make_err_response('课时包ID为必填项')
            
        if 'consumptionHours' not in data or data['consumptionHours'] <= 0:
            return make_err_response('消耗课时必须大于0')
            
        # 验证学生是否存在
        student = get_student_by_id(data['studentId'])
        if not student:
            return make_err_response('学生不存在')
            
        # 验证学生课时包是否存在
        student_package = StudentCoursePackage.query.get(data['packageId'])
        if not student_package:
            return make_err_response('课时包不存在')
            
        # 验证该课时包是否属于该学生
        if student_package.student_id != data['studentId']:
            return make_err_response('该课时包不属于该学生')
            
        # 验证课时包是否有足够的剩余课时
        if student_package.remaining_hours < data['consumptionHours']:
            return make_err_response(f"课时包剩余课时不足，当前剩余: {student_package.remaining_hours}，需要消耗: {data['consumptionHours']}")
            
        # 更新学生课时包数据
        student_package.used_hours += data['consumptionHours']
        student_package.remaining_hours -= data['consumptionHours']
        
        # 如果课时包用完了，更新状态
        if student_package.remaining_hours <= 0:
            student_package.status = 'used'
            
        # 创建课消记录
        consumption_record = ConsumptionRecord(
            student_id=data['studentId'],
            package_id=data['packageId'],
            consumption_hours=data['consumptionHours'],
            remaining_hours=student_package.remaining_hours,
            used_hours=student_package.used_hours,
            operation_time=datetime.now(),
            operator_name=data.get('operatorName', '系统')
        )
        
        db.session.add(consumption_record)
        db.session.commit()
        
        # 获取基础课时包信息
        course_package = CoursePackage.query.get(student_package.course_package_id)
        package_name = course_package.name if course_package else "未知课时包"
        
        # 转换为JSON格式
        result = {
            'id': consumption_record.id,
            'studentId': consumption_record.student_id,
            'packageId': consumption_record.package_id,
            'packageName': package_name,
            'consumptionHours': consumption_record.consumption_hours,
            'remainingHours': consumption_record.remaining_hours,
            'usedHours': consumption_record.used_hours,
            'operationTime': consumption_record.operation_time.isoformat(),
            'operatorName': consumption_record.operator_name,
            'createdAt': consumption_record.created_at.isoformat()
        }
        
        return make_succ_response(result)
    except Exception as e:
        db.session.rollback()
        return make_err_response(f"添加课消记录失败: {str(e)}")

# 课时包相关API
@app.route('/api/students/<int:student_id>/packages', methods=['GET'])
@login_required
def get_student_packages_api(student_id):
    """获取学生的课时包列表"""
    try:
        # 检查学生是否存在
        student = get_student_by_id(student_id)
        if not student:
            return make_err_response('学生不存在')
        
        # 获取参数：是否只获取活跃的课时包
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        
        # 获取课时包
        if active_only:
            packages = get_active_course_packages(student_id)
        else:
            packages = get_student_course_packages(student_id)
        
        # 转换为JSON格式
        result = []
        for package in packages:
            result.append({
                'id': package.id,
                'studentId': package.student_id,
                'totalHours': package.total_hours,
                'usedHours': package.used_hours,
                'remainingHours': package.remaining_hours,
                'purchaseDate': package.purchase_date.strftime('%Y-%m-%d'),
                'expireDate': package.expire_date.strftime('%Y-%m-%d') if package.expire_date else None,
                'status': package.status,
                'notes': package.notes or '',
                'createdAt': package.created_at.isoformat(),
                'updatedAt': package.updated_at.isoformat()
            })
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f"获取课时包失败: {str(e)}")

@app.route('/api/packages/<int:package_id>', methods=['GET'])
@login_required
def get_package_api(package_id):
    """获取单个课时包信息"""
    try:
        package = get_package_by_id(package_id)
        
        if not package:
            return make_err_response('课时包不存在')
        
        # 转换为JSON格式
        result = {
            'id': package.id,
            'studentId': package.student_id,
            'totalHours': package.total_hours,
            'usedHours': package.used_hours,
            'remainingHours': package.remaining_hours,
            'purchaseDate': package.purchase_date.strftime('%Y-%m-%d'),
            'expireDate': package.expire_date.strftime('%Y-%m-%d') if package.expire_date else None,
            'status': package.status,
            'notes': package.notes or '',
            'createdAt': package.created_at.isoformat(),
            'updatedAt': package.updated_at.isoformat()
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f"获取课时包信息失败: {str(e)}")

@app.route('/api/packages', methods=['POST'])
@login_required
def add_package_api():
    """添加新课时包"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return make_err_response('无效的请求数据')
        
        # 验证必填字段
        if 'studentId' not in data or not data['studentId']:
            return make_err_response('学生ID为必填项')
        
        if 'coursePackageId' not in data or not data['coursePackageId']:
            return make_err_response('课时包ID为必填项')
        
        # 验证学生是否存在
        student = get_student_by_id(data['studentId'])
        if not student:
            return make_err_response('学生不存在')
            
        # 验证课时包是否存在
        course_package = CoursePackage.query.get(data['coursePackageId'])
        if not course_package:
            return make_err_response('课时包不存在')
        
        # 准备学生课时包数据
        total_hours = course_package.total_hours
        student_package_data = {
            'student_id': data['studentId'],
            'course_package_id': data['coursePackageId'],
            'used_hours': 0,
            'remaining_hours': total_hours,
            'purchase_date': data.get('purchaseDate', datetime.now().strftime('%Y-%m-%d')),
            'expire_date': data.get('expireDate'),
            'status': 'active',
            'notes': data.get('notes', '')
        }
        
        # 添加学生课时包
        student_package = StudentCoursePackage(
            student_id=student_package_data['student_id'],
            course_package_id=student_package_data['course_package_id'],
            used_hours=student_package_data['used_hours'],
            remaining_hours=student_package_data['remaining_hours'],
            purchase_date=datetime.strptime(student_package_data['purchase_date'], '%Y-%m-%d').date(),
            expire_date=datetime.strptime(student_package_data['expire_date'], '%Y-%m-%d').date() if student_package_data['expire_date'] else None,
            status=student_package_data['status'],
            notes=student_package_data['notes']
        )
        
        db.session.add(student_package)
        db.session.commit()
        
        # 转换为JSON格式
        result = {
            'id': student_package.id,
            'studentId': student_package.student_id,
            'name': course_package.name,
            'total_hours': total_hours,
            'used_hours': student_package.used_hours,
            'remaining_hours': student_package.remaining_hours,
            'purchase_date': student_package.purchase_date.strftime('%Y-%m-%d'),
            'expire_date': student_package.expire_date.strftime('%Y-%m-%d') if student_package.expire_date else None,
            'status': student_package.status,
            'notes': student_package.notes or '',
            'created_at': student_package.created_at.isoformat(),
            'updated_at': student_package.updated_at.isoformat()
        }
        
        return make_succ_response(result)
    except Exception as e:
        db.session.rollback()
        return make_err_response(f"添加课时包失败: {str(e)}")

@app.route('/api/packages', methods=['GET'])
@login_required
def get_all_packages_api():
    """获取所有课时包列表，支持分页和状态筛选"""
    try:
        # 获取分页参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 验证分页参数
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:
            per_page = 20
        
        # 获取状态筛选参数
        status = request.args.get('status', 'all')
        
        # 构建查询
        packages_query = get_all_course_packages()
        
        # 执行查询，获取总数和分页数据
        total_count = packages_query.count()
        total_pages = (total_count + per_page - 1) // per_page
        
        # 分页
        packages = packages_query.offset((page - 1) * per_page).limit(per_page).all()
        
        # 转换为JSON格式
        result = []
        for package in packages:
            result.append({
                'id': package.id,
                'name': package.name,
                'total_hours': package.total_hours,
                'status': package.status,
                'notes': package.notes or '',
                'created_at': package.created_at.isoformat(),
                'updated_at': package.updated_at.isoformat()
            })
        
        # 返回数据，包括分页信息
        response_data = {
            'items': result,
            'pagination': {
                'total': total_count,
                'page': page,
                'per_page': per_page,
                'pages': total_pages
            }
        }
        
        return make_succ_response(response_data)
    except Exception as e:
        return make_err_response(f"获取课时包列表失败: {str(e)}")

@app.route('/api/students/simple', methods=['GET'])
@login_required
def get_simple_students_list_api():
    """获取简单的学生列表（仅ID和姓名）用于下拉菜单"""
    try:
        # 获取所有学生
        students = get_all_students()
        
        # 转换为简单的JSON格式
        result = []
        for student in students:
            result.append({
                'id': student.id,
                'name': student.name
            })
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f"获取学生列表失败: {str(e)}")

@app.route('/api/course-packages', methods=['GET'])
@login_required
def get_course_packages_api():
    """获取所有课时包基础信息，用于选择列表"""
    try:
        packages = get_all_course_packages()
        result = []
        for package in packages:
            result.append({
                'id': package.id,
                'name': package.name,
                'total_hours': package.total_hours,
                'notes': package.notes or ''
            })
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f"获取课时包失败: {str(e)}")

@app.route('/api/course-packages', methods=['POST'])
@login_required
def add_course_package_api():
    """添加新课时包基础信息"""
    try:
        data = request.get_json()
        
        if not data:
            return make_err_response('无效的请求数据')
        
        if 'name' not in data or not data['name']:
            return make_err_response('课时包名称为必填项')
        
        if 'total_hours' not in data or data['total_hours'] <= 0:
            return make_err_response('总课时必须大于0')
        
        package_data = {
            'name': data['name'],
            'total_hours': data['total_hours'],
            'notes': data.get('notes', '')
        }
        
        new_package = add_course_package_base(package_data)
        
        if not new_package:
            return make_err_response('添加课时包失败')
        
        result = {
            'id': new_package.id,
            'name': new_package.name,
            'total_hours': new_package.total_hours,
            'notes': new_package.notes or '',
            'created_at': new_package.created_at.isoformat(),
            'updated_at': new_package.updated_at.isoformat()
        }
        
        return make_succ_response(result)
    except Exception as e:
        db.session.rollback()
        return make_err_response(f"添加课时包失败: {str(e)}")

@app.route('/api/packages/<int:package_id>', methods=['PUT'])
@login_required
def update_package_api(package_id):
    """更新学生课时包信息"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return make_err_response('无效的请求数据')
        
        # 获取课时包
        student_package = StudentCoursePackage.query.get(package_id)
        if not student_package:
            return make_err_response('课时包不存在')
            
        # 获取基础课时包
        course_package = CoursePackage.query.get(student_package.course_package_id)
        if not course_package:
            return make_err_response('基础课时包不存在')
        
        # 更新课时包数据
        if 'used_hours' in data:
            if data['used_hours'] < 0:
                return make_err_response('已用课时不能为负数')
            student_package.used_hours = data['used_hours']
            student_package.remaining_hours = course_package.total_hours - student_package.used_hours
            
        if 'purchase_date' in data and data['purchase_date']:
            try:
                student_package.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
            except ValueError:
                return make_err_response('购买日期格式无效')
                
        if 'expire_date' in data:
            if data['expire_date']:
                try:
                    student_package.expire_date = datetime.strptime(data['expire_date'], '%Y-%m-%d').date()
                except ValueError:
                    return make_err_response('过期日期格式无效')
            else:
                student_package.expire_date = None
                
        if 'status' in data:
            student_package.status = data['status']
            
        if 'notes' in data:
            student_package.notes = data['notes']
            
        # 更新时间戳
        student_package.updated_at = datetime.now()
        
        db.session.commit()
        
        # 转换为JSON格式
        result = {
            'id': student_package.id,
            'studentId': student_package.student_id,
            'name': course_package.name,
            'total_hours': course_package.total_hours,
            'used_hours': student_package.used_hours,
            'remaining_hours': student_package.remaining_hours,
            'purchase_date': student_package.purchase_date.strftime('%Y-%m-%d'),
            'expire_date': student_package.expire_date.strftime('%Y-%m-%d') if student_package.expire_date else None,
            'status': student_package.status,
            'notes': student_package.notes or '',
            'created_at': student_package.created_at.isoformat(),
            'updated_at': student_package.updated_at.isoformat()
        }
        
        return make_succ_response(result)
    except Exception as e:
        db.session.rollback()
        return make_err_response(f"更新课时包失败: {str(e)}")

@app.route('/api/packages/<int:package_id>', methods=['DELETE'])
@login_required
def delete_package_api(package_id):
    """删除学生课时包"""
    try:
        # 获取课时包
        student_package = StudentCoursePackage.query.get(package_id)
        if not student_package:
            return make_err_response('课时包不存在')
            
        # 删除课时包
        db.session.delete(student_package)
        db.session.commit()
        
        return make_succ_empty_response()
    except Exception as e:
        db.session.rollback()
        return make_err_response(f"删除课时包失败: {str(e)}")

@app.route('/api/students/<int:student_id>/recalculate-hours', methods=['POST'])
@login_required
def recalculate_student_hours_api(student_id):
    """重新计算学生的总课时信息"""
    try:
        # 检查学生是否存在
        student = get_student_by_id(student_id)
        if not student:
            return make_err_response('学生不存在')
        
        # 获取学生的所有课时包
        student_packages = StudentCoursePackage.query.filter_by(student_id=student_id).all()
        
        # 计算总课时、已用课时和剩余课时
        total_hours = 0
        used_hours = 0
        remaining_hours = 0
        
        for package in student_packages:
            # 获取基础课时包总课时
            course_package = CoursePackage.query.get(package.course_package_id)
            if course_package:
                total_hours += course_package.total_hours
                used_hours += package.used_hours
                remaining_hours += package.remaining_hours
        
        # 返回更新后的课时信息
        result = {
            'id': student.id,
            'totalHours': total_hours,
            'usedHours': used_hours,
            'remainingHours': remaining_hours
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(f"重新计算课时失败: {str(e)}")

