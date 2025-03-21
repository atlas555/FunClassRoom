from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from wxcloudrun.dao import (
    get_all_students, get_student_by_id, add_student, update_student, delete_student,
    recalculate_student_hours
)
from wxcloudrun.model import Student
from wxcloudrun.response import make_succ_empty_response, make_succ_response, make_err_response

# 创建蓝图
students_bp = Blueprint('students', __name__)

@students_bp.route('/students')
@login_required
def index():
    """
    学生管理页面：用于显示和管理学生/客户
    """
    return render_template('students.html')

@students_bp.route('/api/students', methods=['GET'])
@login_required
def api_get_students():
    """
    获取学生列表，支持分页和筛选
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'all')
        
        # 验证状态值
        valid_statuses = ['all', 'active', 'inactive', 'new']
        if status not in valid_statuses:
            return make_err_response('无效的状态筛选值')
        
        # 限制每页数量范围
        if per_page < 1:
            per_page = 10
        elif per_page > 100:
            per_page = 100
        
        # 获取分页数据
        students,total_count = get_all_students(page, per_page, status)
        
        # 格式化输出数据
        items = []
        for student in students:
            items.append({
                'id': student.id,
                'name': student.name,
                'phone': student.phone,
                'email': student.email,
                'birthdate': student.birthdate.isoformat() if student.birthdate else None,
                'address': student.address,
                'notes': student.notes,
                'status': student.status,
                'registerDate': student.register_date.isoformat() if student.register_date else None
            })
        
        # 返回结果
        result = {
            'items': items,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'pages': total_count / per_page
            }
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@students_bp.route('/api/students/<int:student_id>', methods=['GET'])
@login_required
def api_get_student(student_id):
    """
    获取单个学生详情
    """
    try:
        student = get_student_by_id(student_id)
        
        if not student:
            return make_err_response('学生不存在', 404)
        
        # 格式化输出数据
        result = {
            'id': student.id,
            'name': student.name,
            'phone': student.phone,
            'email': student.email,
            'birthdate': student.birthdate.isoformat() if student.birthdate else None,
            'address': student.address,
            'notes': student.notes,
            'status': student.status,
            'registerDate': student.register_date.isoformat() if student.register_date else None,
         }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@students_bp.route('/api/students/add', methods=['POST'])
@login_required
def api_add_student():
    """
    添加新学生
    """
    try:
        # 获取请求数据
        request_data = request.get_json()
        
        # 验证必填字段
        if not request_data.get('name'):
            return make_err_response('姓名不能为空')
        
        # 添加学生
        student = add_student(
            name=request_data.get('name'),
            phone=request_data.get('phone'),
            email=request_data.get('email'),
            birthdate=request_data.get('birthdate'),
            address=request_data.get('address'),
            notes=request_data.get('notes'),
            status=request_data.get('status', 'new'),  # 默认为新客户
            operator_id=current_user.id,
            total_hours=request_data.get('totalHours', 0),
            used_hours=request_data.get('usedHours', 0),
            remaining_hours=request_data.get('remainingHours', 0)
        )
        
        # 格式化输出数据
        result = {
            'id': student.id,
            'name': student.name,
            'phone': student.phone,
            'email': student.email,
            'birthdate': student.birthdate.isoformat() if student.birthdate else None,
            'address': student.address,
            'notes': student.notes,
            'status': student.status,
            'registerDate': student.register_date.isoformat() if student.register_date else None,
            'lastClassDate': student.last_class_date.isoformat() if student.last_class_date else None,
            'remainingHours': student.remaining_hours,
            'usedHours': student.used_hours
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@students_bp.route('/api/students/<int:student_id>', methods=['PUT'])
@login_required
def api_update_student(student_id):
    """
    更新学生信息
    """
    try:
        # 获取请求数据
        request_data = request.get_json()
        
        # 验证学生是否存在
        student = get_student_by_id(student_id)
        if not student:
            return make_err_response('学生不存在', 404)
        
        # 更新学生信息
        updated_student = update_student(
            student_id=student_id,
            name=request_data.get('name'),
            phone=request_data.get('phone'),
            email=request_data.get('email'),
            birthdate=request_data.get('birthdate'),
            address=request_data.get('address'),
            notes=request_data.get('notes'),
            status=request_data.get('status'),
            remaining_hours=request_data.get('remainingHours'),
            used_hours=request_data.get('usedHours')
        )
        
        # 格式化输出数据
        result = {
            'id': updated_student.id,
            'name': updated_student.name,
            'phone': updated_student.phone,
            'email': updated_student.email,
            'birthdate': updated_student.birthdate.isoformat() if updated_student.birthdate else None,
            'address': updated_student.address,
            'notes': updated_student.notes,
            'status': updated_student.status,
            'registerDate': updated_student.register_date.isoformat() if updated_student.register_date else None,
            'lastClassDate': updated_student.last_class_date.isoformat() if updated_student.last_class_date else None,
            'remainingHours': updated_student.remaining_hours,
            'usedHours': updated_student.used_hours
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@students_bp.route('/api/students/<int:student_id>', methods=['DELETE'])
@login_required
def api_delete_student(student_id):
    """
    删除学生
    """
    try:
        # 验证学生是否存在
        student = get_student_by_id(student_id)
        if not student:
            return make_err_response('学生不存在', 404)
        
        # 删除学生
        delete_student(student_id)
        
        return make_succ_empty_response()
    except Exception as e:
        return make_err_response(str(e))

@students_bp.route('/api/students/<int:student_id>/recalculate-hours', methods=['POST'])
@login_required
def recalculate_student_hours_api(student_id):
    """
    重新计算学生的课时统计
    """
    try:
        # 验证学生是否存在
        student = get_student_by_id(student_id)
        if not student:
            return make_err_response('学生不存在', 404)
        
        # 重新计算课时
        updated_student = recalculate_student_hours(student_id)
        
        # 返回更新后的课时信息
        result = {
            'id': updated_student.id,
            'name': updated_student.name,
            'remainingHours': updated_student.remaining_hours,
            'usedHours': updated_student.used_hours
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e)) 