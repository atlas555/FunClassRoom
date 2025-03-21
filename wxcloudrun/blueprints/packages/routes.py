from flask import Blueprint, request
from flask_login import login_required, current_user
from wxcloudrun.dao import (
    get_student_course_packages, get_active_course_packages,
    get_package_by_id, add_course_package, update_course_package,
    delete_course_package, get_all_course_packages
)
from wxcloudrun.response import make_succ_empty_response, make_succ_response, make_err_response

# 创建蓝图
packages_bp = Blueprint('packages', __name__)

@packages_bp.route('/api/students/<int:student_id>/packages', methods=['GET'])
@login_required
def api_get_student_packages(student_id):
    """
    获取学生的课时包
    """
    try:
        # 获取查询参数
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        
        # 获取课时包
        if active_only:
            packages = get_active_course_packages(student_id)
        else:
            packages = get_student_course_packages(student_id)
        
        # 格式化输出数据
        items = []
        for package in packages:
            items.append({
                'id': package.id,
                'studentId': package.student_id,
                'basePackageId': package.base_package_id,
                'name': package.name,
                'totalHours': package.total_hours,
                'usedHours': package.used_hours,
                'remainingHours': package.remaining_hours,
                'isActive': package.is_active,
                'startDate': package.start_date.isoformat() if package.start_date else None,
                'endDate': package.end_date.isoformat() if package.end_date else None,
                'createdAt': package.created_at.isoformat() if package.created_at else None,
                'operatorId': package.operator_id,
                'operatorName': package.operator.username if package.operator else None
            })
        
        return make_succ_response(items)
    except Exception as e:
        return make_err_response(str(e))

@packages_bp.route('/api/packages/<int:package_id>', methods=['GET'])
@login_required
def api_get_package(package_id):
    """
    获取单个课时包详情
    """
    try:
        package = get_package_by_id(package_id)
        
        if not package:
            return make_err_response('课时包不存在', 404)
        
        # 格式化输出数据
        result = {
            'id': package.id,
            'name': package.name,
            'totalHours': package.total_hours,
            'isActive': package.is_active,
            'startDate': package.start_date.isoformat() if package.start_date else None,
            'endDate': package.end_date.isoformat() if package.end_date else None,
            'createdAt': package.created_at.isoformat() if package.created_at else None
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@packages_bp.route('/api/packages/add', methods=['POST'])
@login_required
def api_add_package():
    """
    添加课时包
    """
    try:
        # 获取请求数据
        request_data = request.get_json()
        
        if request_data.get('totalHours') is None:
            return make_err_response('总课时不能为空')
        
        # 验证总课时是否为正数
        total_hours = float(request_data.get('totalHours'))
        if total_hours <= 0:
            return make_err_response('总课时必须大于0')
        
        # 添加课时包
        package = add_course_package(
            name=request_data.get('name'),
            total_hours=total_hours,
            is_active=request_data.get('isActive', True),
        )
        
        # 格式化输出数据
        result = {
            'id': package.id,
            'name': package.name,
            'totalHours': package.total_hours,
            'isActive': package.is_active,
            'createdAt': package.created_at.isoformat() if package.created_at else None
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@packages_bp.route('/api/packages', methods=['GET'])
@login_required
def api_get_packages():
    """
    获取所有课时包，支持分页和筛选
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'all')
        
        # 验证状态值
        valid_statuses = ['all', 'active', 'inactive']
        if status not in valid_statuses:
            return make_err_response('无效的状态筛选值')
        
        # 限制每页数量范围
        if per_page < 1:
            per_page = 10
        elif per_page > 100:
            per_page = 100
        
        # 获取分页数据
        pagination = get_all_course_packages(page, per_page, status)
        
        # 格式化输出数据
        items = []
        for package in pagination.items:
            items.append({
                'id': package.id,
                'name': package.name,
                'totalHours': package.total_hours,
                'isActive': package.is_active,
                'createdAt': package.created_at.isoformat() if package.created_at else None
            })
        
        # 返回结果
        result = {
            'items': items,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@packages_bp.route('/api/packages/<int:package_id>', methods=['DELETE'])
@login_required
def api_delete_package(package_id):
    """
    删除课时包
    """
    try:
        # 验证课时包是否存在
        package = get_package_by_id(package_id)
        if not package:
            return make_err_response('课时包不存在', 404)
        
        # 删除课时包
        delete_course_package(package_id)
        
        return make_succ_empty_response()
    except Exception as e:
        return make_err_response(str(e)) 