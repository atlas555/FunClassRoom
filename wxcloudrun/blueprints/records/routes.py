from flask import Blueprint, request
from flask_login import login_required, current_user
from wxcloudrun.dao import (
    get_student_records, add_class_record,
    get_student_consumption_records, add_consumption_record
)
from wxcloudrun.response import make_succ_empty_response, make_succ_response, make_err_response

# 创建蓝图
records_bp = Blueprint('records', __name__)

@records_bp.route('/api/students/<int:student_id>/records', methods=['GET'])
@login_required
def api_get_student_records(student_id):
    """
    获取学生的学习记录
    """
    try:
        records = get_student_records(student_id)
        
        # 格式化输出数据
        result = []
        for record in records:
            result.append({
                'id': record.id,
                'studentId': record.student_id,
                'date': record.class_date.isoformat() if record.class_date else None,
                'content': record.content,
                'createdAt': record.created_at.isoformat() if record.created_at else None,
                'operatorId': record.operator_id,
                'operatorName': record.operator.username if record.operator else None
            })
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@records_bp.route('/api/records', methods=['POST'])
@login_required
def api_add_class_record():
    """
    添加上课记录
    """
    try:
        # 获取请求数据
        request_data = request.get_json()
        
        # 验证必填字段
        if not request_data.get('studentId'):
            return make_err_response('学生ID不能为空')
        
        if not request_data.get('date'):
            return make_err_response('上课日期不能为空')
        
        if not request_data.get('content'):
            return make_err_response('上课内容不能为空')
        
        # 添加上课记录
        record = add_class_record(
            student_id=request_data.get('studentId'),
            class_date=request_data.get('date'),
            content=request_data.get('content'),
            operator_id=current_user.id
        )
        
        # 格式化输出数据
        result = {
            'id': record.id,
            'studentId': record.student_id,
            'date': record.class_date.isoformat() if record.class_date else None,
            'content': record.content,
            'createdAt': record.created_at.isoformat() if record.created_at else None,
            'operatorId': record.operator_id,
            'operatorName': record.operator.username if record.operator else None
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@records_bp.route('/api/students/<int:student_id>/consumption-records', methods=['GET'])
@login_required
def api_get_student_consumption_records(student_id):
    """
    获取学生的课时消耗记录
    """
    try:
        # 获取查询参数
        package_id = request.args.get('package_id', type=int)
        
        # 获取消耗记录
        records = get_student_consumption_records(student_id, package_id)
        
        # 格式化输出数据
        result = []
        for record in records:
            result.append({
                'id': record.id,
                'studentId': record.student_id,
                'packageId': record.package_id,
                'packageName': record.package.name if record.package else f'课时包 #{record.package_id}',
                'consumptionHours': record.consumption_hours,
                'remainingHours': record.remaining_hours,
                'operationTime': record.operation_time.isoformat() if record.operation_time else None,
                'operatorId': record.operator_id,
                'operatorName': record.operator.username if record.operator else None
            })
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e))

@records_bp.route('/api/consumption-records', methods=['POST'])
@login_required
def api_add_consumption_record():
    """
    添加课时消耗记录
    """
    try:
        # 获取请求数据
        request_data = request.get_json()
        
        # 验证必填字段
        if not request_data.get('studentId'):
            return make_err_response('学生ID不能为空')
        
        if request_data.get('packageId') is None:
            return make_err_response('课时包ID不能为空')
        
        if request_data.get('consumptionHours') is None:
            return make_err_response('消耗课时不能为空')
        
        # 验证消耗课时是否为正数
        consumption_hours = float(request_data.get('consumptionHours'))
        if consumption_hours <= 0:
            return make_err_response('消耗课时必须大于0')
        
        # 添加消耗记录
        record = add_consumption_record(
            student_id=request_data.get('studentId'),
            package_id=request_data.get('packageId'),
            consumption_hours=consumption_hours,
            operator_id=current_user.id
        )
        
        # 格式化输出数据
        result = {
            'id': record.id,
            'studentId': record.student_id,
            'packageId': record.package_id,
            'packageName': record.package.name if record.package else f'课时包 #{record.package_id}',
            'consumptionHours': record.consumption_hours,
            'remainingHours': record.remaining_hours,
            'operationTime': record.operation_time.isoformat() if record.operation_time else None,
            'operatorId': record.operator_id,
            'operatorName': record.operator.username if record.operator else None
        }
        
        return make_succ_response(result)
    except Exception as e:
        return make_err_response(str(e)) 