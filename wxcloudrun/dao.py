import logging
from datetime import datetime
from sqlalchemy.exc import OperationalError
from sqlalchemy import func

from wxcloudrun import db
from wxcloudrun.model import Student, ClassRecord, ConsumptionRecord, User, CoursePackage, StudentCoursePackage

# 初始化日志
logger = logging.getLogger('log')


# Student 相关操作
def get_all_students(page=1, per_page=20, status=None):
    """
    获取学生信息，支持分页和状态筛选
    :param page: 页码（从1开始）
    :param per_page: 每页数量
    :param status: 状态筛选（可选）
    :return: 学生列表和总数
    """
    try:
        query = Student.query
        
        # 如果提供了状态筛选
        if status and status != 'all':
            query = query.filter(Student.status == status)
            
        # 计算总数
        total_count = query.count()
        
        # 进行分页
        offset = (page - 1) * per_page
        
        # 排序和分页
        students = query.order_by(Student.id.desc()).offset(offset).limit(per_page).all()
        
        return students, total_count
    except OperationalError as e:
        logger.info("get_all_students errorMsg= {} ".format(e))
        return [], 0

def get_student_by_id(student_id):
    """
    根据ID获取学生信息
    :param student_id: 学生ID
    :return: 学生信息
    """
    try:
        return Student.query.get(student_id)
    except OperationalError as e:
        logger.info("get_student_by_id errorMsg= {} ".format(e))
        return None


def add_student(student_data):
    """
    添加新学生
    :param student_data: 学生数据字典
    :return: 新添加的学生
    """
    try:
        # 处理日期格式
        birthdate = None
        if student_data.get('birthdate'):
            try:
                birthdate = datetime.strptime(student_data.get('birthdate'), '%Y-%m-%d').date()
            except ValueError:
                logger.warning("Invalid birthdate format: {}".format(student_data.get('birthdate')))
        
        # 创建学生对象
        student = Student(
            name=student_data.get('name'),
            phone=student_data.get('phone'),
            email=student_data.get('email'),
            birthdate=birthdate,
            total_hours=0,  # 默认为0，课时信息现在由课时包管理
            used_hours=0,   # 默认为0，课时信息现在由课时包管理
            remaining_hours=0,  # 默认为0，课时信息现在由课时包管理
            register_date=datetime.now().date(),
            address=student_data.get('address'),
            notes=student_data.get('notes'),
            status=student_data.get('status', 'active')
        )
        db.session.add(student)
        db.session.commit()
        return student
    except OperationalError as e:
        logger.info("add_student errorMsg= {} ".format(e))
        db.session.rollback()
        return None
    except Exception as e:
        logger.error("add_student error: {} ".format(e))
        db.session.rollback()
        return None


def update_student(student_id, student_data):
    """
    更新学生信息
    :param student_id: 学生ID
    :param student_data: 学生数据字典
    :return: 更新后的学生
    """
    try:
        student = Student.query.get(student_id)
        if not student:
            return None
            
        # 更新学生信息
        if 'name' in student_data:
            student.name = student_data['name']
        if 'phone' in student_data:
            student.phone = student_data['phone']
        if 'email' in student_data:
            student.email = student_data['email']
        if 'birthdate' in student_data and student_data['birthdate']:
            try:
                student.birthdate = datetime.strptime(student_data['birthdate'], '%Y-%m-%d').date()
            except ValueError:
                logger.warning("Invalid birthdate format: {}".format(student_data['birthdate']))
        
        # 移除课时相关字段的更新，这些信息现在由课时包管理
        
        if 'address' in student_data:
            student.address = student_data['address']
        if 'notes' in student_data:
            student.notes = student_data['notes']
        if 'status' in student_data:
            student.status = student_data['status']
        
        # 更新最后修改时间
        student.updated_at = datetime.now()
        
        db.session.commit()
        return student
    except OperationalError as e:
        logger.info("update_student errorMsg= {} ".format(e))
        db.session.rollback()
        return None
    except Exception as e:
        logger.error("update_student error: {} ".format(e))
        db.session.rollback()
        return None


def delete_student(student_id):
    """
    删除学生
    :param student_id: 学生ID
    :return: 是否成功
    """
    try:
        student = Student.query.get(student_id)
        if not student:
            return False
        db.session.delete(student)
        db.session.commit()
        return True
    except OperationalError as e:
        logger.info("delete_student errorMsg= {} ".format(e))
        db.session.rollback()
        return False


# ClassRecord 相关操作
def get_student_records(student_id):
    """
    获取学生的上课记录
    :param student_id: 学生ID
    :return: 上课记录列表
    """
    try:
        return ClassRecord.query.filter_by(student_id=student_id).order_by(ClassRecord.date.desc()).all()
    except OperationalError as e:
        logger.info("get_student_records errorMsg= {} ".format(e))
        return []


def add_class_record(record_data):
    """
    添加上课记录
    :param record_data: 记录数据字典
    :return: 新添加的记录
    """
    try:
        # 解析日期
        class_date = None
        if record_data.get('date'):
            try:
                class_date = datetime.strptime(record_data.get('date'), '%Y-%m-%d').date()
            except ValueError:
                logger.warning("Invalid date format: {}".format(record_data.get('date')))
                class_date = datetime.now().date()
        else:
            class_date = datetime.now().date()
        
        # 创建记录
        record = ClassRecord(
            student_id=record_data.get('studentId'),
            date=class_date,
            content=record_data.get('content')
        )
        db.session.add(record)
        
        # 更新学生的最后上课日期
        student = Student.query.get(record_data.get('studentId'))
        if student:
            # 只有当新记录日期更晚，或者之前没有上课记录时，才更新最后上课日期
            if not student.last_class_date or class_date > student.last_class_date:
                student.last_class_date = class_date
            student.updated_at = datetime.now()
        
        db.session.commit()
        return record
    except OperationalError as e:
        logger.info("add_class_record errorMsg= {} ".format(e))
        db.session.rollback()
        return None
    except Exception as e:
        logger.error("add_class_record error: {} ".format(e))
        db.session.rollback()
        return None


def get_student_consumption_records(student_id, package_id=None):
    """
    获取学生的课消记录
    :param student_id: 学生ID
    :param package_id: 课时包ID（可选，如果提供则只获取特定课时包的记录）
    :return: 课消记录列表
    """
    try:
        query = ConsumptionRecord.query.filter_by(student_id=student_id)
        
        if package_id is not None:
            query = query.filter_by(package_id=package_id)
            
        records = query.order_by(ConsumptionRecord.operation_time.desc()).all()
        return records
    except OperationalError as e:
        logger.info(f"get_student_consumption_records errorMsg= {e}")
        return []

def add_consumption_record(record_data):
    """
    添加课消记录
    :param record_data: 包含课消信息的字典
    :return: 新添加的课消记录对象
    """
    try:
        student_id = record_data.get('studentId')
        package_id = record_data.get('packageId')
        consumption_hours = record_data.get('consumptionHours')
        
        # 如果没有指定课时包ID，则尝试自动选择一个活跃的课时包
        if not package_id:
            active_packages = get_active_course_packages(student_id)
            if not active_packages:
                raise Exception("没有可用的活跃课时包")
            
            # 选择剩余课时最少的课时包（先用完策略）
            package = min(active_packages, key=lambda p: p.remaining_hours)
            package_id = package.id
        else:
            package = get_package_by_id(package_id)
            if not package:
                raise Exception(f"课时包 (ID: {package_id}) 不存在")
        
        # 验证课时包是否有足够的剩余课时
        if package.remaining_hours < consumption_hours:
            raise Exception(f"课时包剩余课时不足，当前剩余: {package.remaining_hours}，需要消耗: {consumption_hours}")
        
        # 更新课时包数据
        old_remaining = package.remaining_hours
        old_used = package.used_hours
        
        package.used_hours += consumption_hours
        package.remaining_hours -= consumption_hours
        
        # 如果课时包用完了，更新状态
        if package.remaining_hours <= 0:
            package.status = 'used'
        
        # 创建新的课消记录
        new_record = ConsumptionRecord(
            student_id=student_id,
            package_id=package_id,
            consumption_hours=consumption_hours,
            remaining_hours=package.remaining_hours,
            used_hours=package.used_hours,
            operation_time=datetime.fromisoformat(record_data.get('operationTime').replace('Z', '+00:00')) if 'operationTime' in record_data else datetime.now(),
            operator_name=record_data.get('operatorName', '系统')
        )
        
        db.session.add(new_record)
        
        # 不再直接更新学生的冗余课时字段
        # 这些数据现在从课时包中聚合获取
        
        db.session.commit()
        
        return new_record
    except OperationalError as e:
        db.session.rollback()
        logger.info(f"add_consumption_record errorMsg= {e}")
        raise Exception(f"添加课消记录失败: {str(e)}")
    except Exception as e:
        db.session.rollback()
        logger.info(f"add_consumption_record errorMsg= {e}")
        raise Exception(f"添加课消记录失败: {str(e)}")


# CoursePackage 相关操作
def get_student_course_packages(student_id):
    """
    获取学生的所有课时包
    :param student_id: 学生ID
    :return: 课时包列表
    """
    try:
        packages = StudentCoursePackage.query.filter_by(student_id=student_id).order_by(StudentCoursePackage.purchase_date.desc()).all()
        return packages
    except OperationalError as e:
        logger.info(f"get_student_course_packages errorMsg= {e}")
        return []

def get_active_course_packages(student_id):
    """
    获取学生的所有活跃课时包
    :param student_id: 学生ID
    :return: 活跃的课时包列表
    """
    try:
        packages = StudentCoursePackage.query.filter_by(student_id=student_id, status='active').order_by(StudentCoursePackage.purchase_date.desc()).all()
        return packages
    except OperationalError as e:
        logger.info(f"get_active_course_packages errorMsg= {e}")
        return []

def get_package_by_id(package_id):
    """
    根据ID获取课时包
    :param package_id: 课时包ID
    :return: 课时包信息
    """
    try:
        return StudentCoursePackage.query.get(package_id)
    except OperationalError as e:
        logger.info(f"get_package_by_id errorMsg= {e}")
        return None

def add_course_package(package_data):
    """
    添加新学生课时包
    :param package_data: 课时包数据字典
    :return: 新添加的课时包
    """
    try:
        # 获取基础课时包
        course_package_id = package_data.get('course_package_id')
        course_package = CoursePackage.query.get(course_package_id)
        if not course_package:
            raise Exception(f"基础课时包 (ID: {course_package_id}) 不存在")
        
        # 计算剩余课时
        total_hours = course_package.total_hours
        used_hours = package_data.get('used_hours', 0)
        remaining_hours = total_hours - used_hours
        
        # 处理日期格式
        purchase_date = datetime.now().date()
        if package_data.get('purchase_date'):
            try:
                purchase_date = datetime.strptime(package_data.get('purchase_date'), '%Y-%m-%d').date()
            except ValueError:
                logger.warning(f"Invalid purchase_date format: {package_data.get('purchase_date')}")
        
        expire_date = None
        if package_data.get('expire_date'):
            try:
                expire_date = datetime.strptime(package_data.get('expire_date'), '%Y-%m-%d').date()
            except ValueError:
                logger.warning(f"Invalid expire_date format: {package_data.get('expire_date')}")
        
        # 创建学生课时包对象
        package = StudentCoursePackage(
            student_id=package_data.get('student_id'),
            course_package_id=course_package_id,
            used_hours=used_hours,
            remaining_hours=remaining_hours,
            purchase_date=purchase_date,
            expire_date=expire_date,
            status=package_data.get('status', 'active'),
            notes=package_data.get('notes')
        )
        db.session.add(package)
        
        # 更新学生的总课时信息
        student_id = package_data.get('student_id')
        if student_id:
            student = Student.query.get(student_id)
            if student:
                # 更新总课时、已用课时和剩余课时
                student.total_hours += total_hours
                student.used_hours += used_hours
                student.remaining_hours += remaining_hours
                student.updated_at = datetime.now()
        
        db.session.commit()
        return package
    except OperationalError as e:
        logger.info(f"add_course_package errorMsg= {e}")
        db.session.rollback()
        return None
    except Exception as e:
        logger.error(f"add_course_package error: {e}")
        db.session.rollback()
        return None

def update_course_package(package_id, package_data):
    """
    更新学生课时包信息
    :param package_id: 课时包ID
    :param package_data: 课时包数据字典
    :return: 更新后的课时包
    """
    try:
        # 获取学生课时包
        package = StudentCoursePackage.query.get(package_id)
        if not package:
            return None
        
        # 获取基础课时包
        course_package = CoursePackage.query.get(package.course_package_id)
        if not course_package:
            logger.warning(f"基础课时包 (ID: {package.course_package_id}) 不存在")
            return None
        
        # 记录旧值用于更新学生总数 - 这对于监控变化仍然有用
        old_used = package.used_hours
        old_remaining = package.remaining_hours
        
        # 更新课时包信息
        if 'used_hours' in package_data:
            package.used_hours = package_data['used_hours']
            # 更新剩余课时
            package.remaining_hours = course_package.total_hours - package.used_hours
            
        if 'purchase_date' in package_data and package_data['purchase_date']:
            try:
                package.purchase_date = datetime.strptime(package_data['purchase_date'], '%Y-%m-%d').date()
            except ValueError:
                logger.warning(f"Invalid purchase_date format: {package_data['purchase_date']}")
        
        if 'expire_date' in package_data:
            if package_data['expire_date']:
                try:
                    package.expire_date = datetime.strptime(package_data['expire_date'], '%Y-%m-%d').date()
                except ValueError:
                    logger.warning(f"Invalid expire_date format: {package_data['expire_date']}")
            else:
                package.expire_date = None
        
        if 'status' in package_data:
            package.status = package_data['status']
        
        if 'notes' in package_data:
            package.notes = package_data['notes']
        
        # 更新最后修改时间
        package.updated_at = datetime.now()
        
        # 更新学生的总课时信息
        student = Student.query.get(package.student_id)
        if student:
            # 计算差值并更新
            used_diff = package.used_hours - old_used
            remaining_diff = package.remaining_hours - old_remaining
            
            student.used_hours += used_diff
            student.remaining_hours += remaining_diff
            student.updated_at = datetime.now()
        
        db.session.commit()
        return package
    except OperationalError as e:
        logger.info(f"update_course_package errorMsg= {e}")
        db.session.rollback()
        return None
    except Exception as e:
        logger.error(f"update_course_package error: {e}")
        db.session.rollback()
        return None

def delete_course_package(package_id):
    """
    删除学生课时包
    :param package_id: 课时包ID
    :return: 是否成功
    """
    try:
        # 获取学生课时包
        package = StudentCoursePackage.query.get(package_id)
        if not package:
            return False
        
        # 获取基础课时包
        course_package = CoursePackage.query.get(package.course_package_id)
        total_hours = course_package.total_hours if course_package else 0
        
        # 更新学生的总课时信息
        student = Student.query.get(package.student_id)
        if student:
            student.total_hours -= total_hours
            student.used_hours -= package.used_hours
            student.remaining_hours -= package.remaining_hours
            student.updated_at = datetime.now()
        
        db.session.delete(package)
        db.session.commit()
        return True
    except OperationalError as e:
        logger.info(f"delete_course_package errorMsg= {e}")
        db.session.rollback()
        return False

def recalculate_student_hours(student_id):
    """
    重新计算学生的总课时信息
    :param student_id: 学生ID
    :return: 是否成功
    """
    try:
        student = Student.query.get(student_id)
        if not student:
            return False
        
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
        
        # 更新学生记录
        student.total_hours = total_hours
        student.used_hours = used_hours
        student.remaining_hours = remaining_hours
        student.updated_at = datetime.now()
        
        db.session.commit()
        return True
    except OperationalError as e:
        logger.info(f"recalculate_student_hours errorMsg= {e}")
        db.session.rollback()
        return False

# CoursePackage 基础课时包模块相关操作 
def get_all_course_packages():
    """
    获取所有基础课时包
    :return: 课时包列表
    """
    try:
        return CoursePackage.query.order_by(CoursePackage.id.desc()).all()
    except OperationalError as e:
        logger.info(f"get_all_course_packages errorMsg= {e}")
        return []

def add_course_package_base(package_data):
    """
    添加新基础课时包
    :param package_data: 课时包数据字典
    :return: 新添加的课时包
    """
    try:
        package = CoursePackage(
            name=package_data.get('name'),
            total_hours=package_data.get('total_hours'),
            notes=package_data.get('notes')
        )
        db.session.add(package)
        db.session.commit()
        return package
    except OperationalError as e:
        logger.info(f"add_course_package_base errorMsg= {e}")
        db.session.rollback()
        return None
    except Exception as e:
        logger.error(f"add_course_package_base error: {e}")
        db.session.rollback()
        return None

# StudentCoursePackage 学生课时包关联相关操作
def get_student_course_packages(student_id):
    """
    获取学生的所有课时包
    :param student_id: 学生ID
    :return: 课时包列表
    """
    try:
        packages = StudentCoursePackage.query.filter_by(student_id=student_id).order_by(StudentCoursePackage.purchase_date.desc()).all()
        return packages
    except OperationalError as e:
        logger.info(f"get_student_course_packages errorMsg= {e}")
        return []

def get_active_course_packages(student_id):
    """
    获取学生的所有活跃课时包
    :param student_id: 学生ID
    :return: 活跃的课时包列表
    """
    try:
        packages = StudentCoursePackage.query.filter_by(student_id=student_id, status='active').order_by(StudentCoursePackage.purchase_date.desc()).all()
        return packages
    except OperationalError as e:
        logger.info(f"get_active_course_packages errorMsg= {e}")
        return []

def get_package_by_id(package_id):
    """
    根据ID获取课时包
    :param package_id: 课时包ID
    :return: 课时包信息
    """
    try:
        return StudentCoursePackage.query.get(package_id)
    except OperationalError as e:
        logger.info(f"get_package_by_id errorMsg= {e}")
        return None
