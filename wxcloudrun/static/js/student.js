/**
 * student.js - 处理学生/客户管理系统的API请求和交互
 */

// 当前页码和状态筛选（全局变量）
let currentPage = 1;
let currentPerPage = 20;
let currentStatus = 'all';
let totalPages = 0;

// 课时包管理全局变量
let packageCurrentPage = 1;
let packageCurrentPerPage = 20;
let packageCurrentStatus = 'all';
let packageTotalPages = 0;

// API 请求函数
const StudentAPI = {
  // 获取所有学生，支持分页
  getAllStudents: function(page = 1, perPage = 20, status = 'all') {
    return new Promise((resolve, reject) => {
      // 构建带查询参数的URL
      const url = `/api/students?page=${page}&per_page=${perPage}${status !== 'all' ? `&status=${status}` : ''}`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '获取学生列表失败');
          }
          resolve(data.data || { items: [], pagination: { total: 0, page: 1, per_page: perPage, pages: 0 } });
        })
        .catch(error => {
          console.error('获取学生列表失败:', error);
          reject(error);
        });
    });
  },
  
  // 获取单个学生信息
  getStudent: function(id) {
    return new Promise((resolve, reject) => {
      fetch(`/api/students/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '获取学生信息失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error(`获取学生(ID: ${id})信息失败:`, error);
          reject(error);
        });
    });
  },
  
  // 添加新学生
  addStudent: function(studentData) {
    // 确保数值字段是数字类型
    if (studentData.packageTotalHours !== undefined) {
      studentData.totalHours = Number(studentData.packageTotalHours);
    }
    
    // 移除课时包相关字段，因为这些字段会单独处理
    delete studentData.packageTotalHours;
    delete studentData.packagePurchaseDate;
    delete studentData.packageExpireDate;
    delete studentData.packageNotes;

    return new Promise((resolve, reject) => {
      fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '添加学生失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error('添加学生失败:', error);
          reject(error);
        });
    });
  },
  
  // 更新学生信息
  updateStudent: function(id, studentData) {
    // 确保数值字段是数字类型
    if (studentData.totalHours !== undefined) {
      studentData.totalHours = Number(studentData.totalHours);
    }
    if (studentData.usedHours !== undefined) {
      studentData.usedHours = Number(studentData.usedHours);
    }
    if (studentData.remainingHours !== undefined) {
      studentData.remainingHours = Number(studentData.remainingHours);
    }

    return new Promise((resolve, reject) => {
      fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '更新学生信息失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error(`更新学生(ID: ${id})信息失败:`, error);
          reject(error);
        });
    });
  },
  
  // 删除学生
  deleteStudent: function(id) {
    return new Promise((resolve, reject) => {
      fetch(`/api/students/${id}`, {
        method: 'DELETE'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '删除学生失败');
          }
          resolve(true);
        })
        .catch(error => {
          console.error(`删除学生(ID: ${id})失败:`, error);
          reject(error);
        });
    });
  },
  
  // 获取学生的课程记录
  getStudentRecords: function(studentId) {
    return new Promise((resolve, reject) => {
      fetch(`/api/students/${studentId}/records`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '获取学生记录失败');
          }
          resolve(data.data || []);
        })
        .catch(error => {
          console.error(`获取学生(ID: ${studentId})记录失败:`, error);
          reject(error);
        });
    });
  },
  
  // 添加课程记录
  addClassRecord: function(recordData) {
    // 确保studentId是数字类型
    if (recordData.studentId !== undefined) {
      recordData.studentId = Number(recordData.studentId);
    }

    return new Promise((resolve, reject) => {
      fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '添加记录失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error('添加课程记录失败:', error);
          reject(error);
        });
    });
  },
  
  // 获取学生课消记录
  getStudentConsumptionRecords: function(studentId, packageId) {
    let url = `/api/students/${studentId}/consumption-records`;
    
    // 如果提供了packageId，添加到查询参数
    if (packageId) {
      url += `?package_id=${packageId}`;
    }
    
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '获取课消记录失败');
          }
          resolve(data.data || []);
        })
        .catch(error => {
          console.error(`获取学生(ID: ${studentId})课消记录失败:`, error);
          reject(error);
        });
    });
  },
  
  // 添加课消记录
  addConsumptionRecord: function(consumptionData) {
    return new Promise((resolve, reject) => {
      fetch('/api/consumption-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(consumptionData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '添加课消记录失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error('添加课消记录失败:', error);
          reject(error);
        });
    });
  },
  
  // 获取学生课时包
  getStudentPackages: function(studentId, activeOnly = false) {
    return new Promise((resolve, reject) => {
      fetch(`/api/students/${studentId}/packages?active_only=${activeOnly}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '获取课时包失败');
          }
          resolve(data.data || []);
        })
        .catch(error => {
          console.error(`获取学生(ID: ${studentId})课时包失败:`, error);
          reject(error);
        });
    });
  },
  
  // 获取所有课时包，支持分页和状态筛选
  getAllPackages: function(page = 1, perPage = 20, status = 'all') {
    return new Promise((resolve, reject) => {
      // 构建带查询参数的URL
      const url = `/api/packages?page=${page}&per_page=${perPage}${status !== 'all' ? `&status=${status}` : ''}`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '获取课时包列表失败');
          }
          resolve(data.data || { items: [], pagination: { total: 0, page: 1, per_page: perPage, pages: 0 } });
        })
        .catch(error => {
          console.error('获取课时包列表失败:', error);
          reject(error);
        });
    });
  },
  
  // 获取简单的学生列表（仅ID和姓名）
  getSimpleStudentsList: function() {
    return new Promise((resolve, reject) => {
      fetch('/api/students/simple')
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '获取学生列表失败');
          }
          resolve(data.data || []);
        })
        .catch(error => {
          console.error('获取学生列表失败:', error);
          reject(error);
        });
    });
  },
  
  // 获取单个课时包
  getPackage: function(packageId) {
    return new Promise((resolve, reject) => {
      fetch(`/api/packages/${packageId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '获取课时包失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error(`获取课时包(ID: ${packageId})失败:`, error);
          reject(error);
        });
    });
  },
  
  // 添加课时包
  addPackage: function(packageData) {
    return new Promise((resolve, reject) => {
      fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '添加课时包失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error('添加课时包失败:', error);
          reject(error);
        });
    });
  },
  
  // 更新课时包
  updatePackage: function(packageId, packageData) {
    return new Promise((resolve, reject) => {
      fetch(`/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '更新课时包失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error(`更新课时包(ID: ${packageId})失败:`, error);
          reject(error);
        });
    });
  },
  
  // 删除课时包
  deletePackage: function(packageId) {
    return new Promise((resolve, reject) => {
      fetch(`/api/packages/${packageId}`, {
        method: 'DELETE'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '删除课时包失败');
          }
          resolve(true);
        })
        .catch(error => {
          console.error(`删除课时包(ID: ${packageId})失败:`, error);
          reject(error);
        });
    });
  },
  
  // 重新计算学生的课时
  recalculateStudentHours: function(studentId) {
    return new Promise((resolve, reject) => {
      fetch(`/api/students/${studentId}/recalculate-hours`, {
        method: 'POST'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.code !== 0) {
            throw new Error(data.message || '重新计算课时失败');
          }
          resolve(data.data);
        })
        .catch(error => {
          console.error(`重新计算学生(ID: ${studentId})课时失败:`, error);
          reject(error);
        });
    });
  }
};

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 显示加载指示器
  showLoading('#studentsTable tbody', '加载学生数据中...');
  
  // 初始化学生表格
  initStudentTable();
  
  // 初始化Quill富文本编辑器
  const quill = new Quill('#classContentEditor', {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['clean']
      ]
    },
    placeholder: '请输入学习内容...'
  });
  
  // 每页显示数量变更
  $('#perPageSelect').on('change', function() {
    currentPerPage = parseInt($(this).val());
    currentPage = 1; // 重置到第一页
    
    // 重新加载数据
    initStudentTable();
  });
  
  // 状态筛选功能
  $('#statusFilter').on('change', function() {
    const selectedStatus = $(this).val();
    currentStatus = selectedStatus;
    currentPage = 1; // 重置到第一页
    
    // 重新加载数据
    initStudentTable();
  });
  
  // 分页点击事件
  $(document).on('click', '.pagination .page-link', function(e) {
    e.preventDefault();
    
    // 如果是禁用状态，不执行操作
    if ($(this).parent().hasClass('disabled')) {
      return;
    }
    
    // 获取页码
    const page = $(this).data('page');
    currentPage = page;
    
    // 重新加载数据
    initStudentTable();
    
    // 滚动到表格顶部
    $('html, body').animate({
      scrollTop: $('#studentsTable').offset().top - 20
    }, 200);
  });
  
  // 编辑个人按钮点击事件
  $(document).on('click', '.btn-outline-primary', function() {
    // 获取当前行
    const $row = $(this).closest('tr');
    
    // 获取学生ID
    const id = parseInt($row.find('th').text());
    
    // 保存表单原始内容
    const $modalBody = $('#editPersonalModal .modal-body');
    const originalContent = $modalBody.html();
    
    // 显示加载指示器
    showLoading('#editPersonalModal .modal-body', '加载学生信息中...');
    
    // 显示模态框
    const editModal = new bootstrap.Modal(document.getElementById('editPersonalModal'));
    editModal.show();
    
    // 从API获取学生详细信息
    StudentAPI.getStudent(id)
      .then(student => {
        // 恢复原始表单内容
        $modalBody.html(originalContent);
        
        // 填充表单
        $('#editId').val(student.id);
        $('#editName').val(student.name);
        $('#editPhone').val(student.phone);
        $('#editEmail').val(student.email);
        $('#editBirthdate').val(student.birthdate);
        $('#editAddress').val(student.address);
        $('#editNotes').val(student.notes);
        
        // 设置状态单选按钮
        $(`#editStatus${student.status.charAt(0).toUpperCase() + student.status.slice(1)}`).prop('checked', true);
      })
      .catch(error => {
        // 恢复原始表单内容
        $modalBody.html(originalContent);
        
        // 显示错误消息
        $modalBody.prepend(`
          <div class="alert alert-danger" role="alert">
            获取学生信息失败: ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `);
      });
  });
  
  // 录入上课记录按钮点击事件
  $(document).on('click', '.btn-outline-success', function() {
    // 获取当前行
    const $row = $(this).closest('tr');
    
    // 获取学生ID和姓名
    const id = parseInt($row.find('th').text());
    const name = $row.find('td:eq(0)').text();
    
    // 设置模态框标题和隐藏字段
    $('#classRecordModalLabel').text(`录入上课记录 - ${name}`);
    $('#recordStudentId').val(id);
    $('#recordStudentName').val(name);
    
    // 设置今天的日期为默认值
    const today = new Date().toISOString().split('T')[0];
    $('#classDate').val(today);
    
    // 清空编辑器内容
    quill.setText('');
    
    // 显示加载指示器
    showLoading('#recordsList', '加载历史记录中...');
    
    // 显示模态框
    const recordModal = new bootstrap.Modal(document.getElementById('classRecordModal'));
    recordModal.show();
    
    // 加载并显示该学生的历史记录
    loadStudentRecords(id);
  });
  
  // 保存记录按钮点击事件
  $('#saveRecordBtn').on('click', function() {
    const studentId = parseInt($('#recordStudentId').val());
    const classDate = $('#classDate').val();
    const content = quill.root.innerHTML;
    const contentText = quill.getText().trim();
    
    // 验证输入
    if (!classDate) {
      showAlert('danger', '请选择上课日期');
      return;
    }
    
    if (!contentText) {
      showAlert('danger', '请输入学习内容');
      return;
    }
    
    // 禁用按钮，显示加载状态
    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 保存中...');
    
    // 创建记录数据
    const recordData = {
      studentId,
      date: classDate,
      content
    };
    
    // 调用API保存记录
    StudentAPI.addClassRecord(recordData)
      .then(record => {
        // 更新表格中的最近上课日期
        const $row = $(`#studentsTable tbody tr`).filter(function() {
          return parseInt($(this).find('th').text()) === studentId;
        });
        $row.find('td:eq(6)').text(formatDate(record.date));
        
        // 重新加载记录列表
        loadStudentRecords(studentId);
        
        // 清空编辑器
        quill.setText('');
        
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示成功消息
        showAlert('success', '上课记录保存成功！');
      })
      .catch(error => {
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示错误消息
        showAlert('danger', `保存记录失败: ${error.message}`);
      });
  });
  
  // 保存个人信息按钮点击事件
  $('#savePersonalBtn').on('click', function() {
    // 获取表单数据
    const id = parseInt($('#editId').val());
    const name = $('#editName').val().trim();
    const phone = $('#editPhone').val().trim();
    const email = $('#editEmail').val().trim();
    const birthdate = $('#editBirthdate').val();
    const address = $('#editAddress').val().trim();
    const notes = $('#editNotes').val().trim();
    const status = $('input[name="editStatus"]:checked').val();
    
    // 验证必填字段
    if (!name) {
      showModalAlert('#editPersonalModal', 'danger', '姓名为必填字段！');
      return;
    }
    
    // 禁用按钮，显示加载状态
    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 保存中...');
    
    // 创建更新数据
    const studentData = {
      name,
      phone,
      email,
      birthdate,
      address,
      notes,
      status
    };
    
    // 调用API更新学生信息
    StudentAPI.updateStudent(id, studentData)
      .then(updatedStudent => {
        // 更新表格中的数据
        const $row = $(`#studentsTable tbody tr`).filter(function() {
          return parseInt($(this).find('th').text()) === id;
        });
        
        $row.find('td:eq(0)').text(updatedStudent.name);
        $row.find('td:eq(1)').text(updatedStudent.phone || '-');
        $row.find('td:eq(2)').text(updatedStudent.remainingHours);
        $row.find('td:eq(3)').text(updatedStudent.usedHours);
        $row.find('td:eq(5)').text(formatDate(updatedStudent.registerDate));
        $row.find('td:eq(6)').text(updatedStudent.lastClassDate ? formatDate(updatedStudent.lastClassDate) : '-');
        
        // 更新状态
        $row.attr('data-status', updatedStudent.status);
        let statusText = '';
        let statusClass = '';
        
        if (updatedStudent.status === 'active') {
          statusText = '活跃';
          statusClass = 'status-active';
        } else if (updatedStudent.status === 'inactive') {
          statusText = '已结课';
          statusClass = 'status-inactive';
        } else if (updatedStudent.status === 'new') {
          statusText = '新客户';
          statusClass = 'status-new';
        }
        
        $row.find('td:eq(7)').html(`<span class="${statusClass}">${statusText}</span>`);
        
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示成功消息
        showModalAlert('#editPersonalModal', 'success', '客户信息更新成功！');
        
        // 关闭模态框
        setTimeout(() => {
          const editModal = bootstrap.Modal.getInstance(document.getElementById('editPersonalModal'));
          editModal.hide();
          
          // 重新应用筛选
          $('#statusFilter').trigger('change');
        }, 1500);
      })
      .catch(error => {
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示错误消息
        showModalAlert('#editPersonalModal', 'danger', `更新学生信息失败: ${error.message}`);
      });
  });
  
  // 表单提交处理
  $('#studentForm').on('submit', function(e) {
    e.preventDefault();
    
    // 获取表单数据
    const formData = {
      name: $('#name').val().trim(),
      phone: $('#phone').val().trim(),
      email: $('#email').val().trim(),
      birthdate: $('#birthdate').val(),
      packageTotalHours: parseFloat($('#packageTotalHours').val()) || 0,
      packagePurchaseDate: $('#packagePurchaseDate').val(),
      packageExpireDate: $('#packageExpireDate').val() || null,
      packageNotes: $('#packageNotes').val().trim(),
      address: $('#address').val().trim(),
      notes: $('#notes').val().trim(),
      status: $('input[name="status"]:checked').val()
    };
    
    // 验证必填字段
    if (!formData.name) {
      showAlert('danger', '姓名为必填字段！');
      return;
    }
    
    // 禁用提交按钮，显示加载状态
    const $btn = $(this).find('button[type="submit"]');
    const originalText = $btn.text();
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 提交中...');
    
    // 调用API添加学生
    StudentAPI.addStudent(formData)
      .then(newStudent => {
        // 如果提供了课时包信息，创建课时包
        if (formData.packageTotalHours > 0) {
          const packageData = {
            studentId: newStudent.id,
            totalHours: formData.packageTotalHours,
            usedHours: 0,
            purchaseDate: formData.packagePurchaseDate || new Date().toISOString().split('T')[0],
            expireDate: formData.packageExpireDate || null,
            notes: formData.packageNotes || ''
          };
          
          return StudentAPI.addPackage(packageData)
            .then(() => newStudent);
        }
        
        return newStudent;
      })
      .then(newStudent => {
        // 显示成功消息
        showAlert('success', '客户信息添加成功！');
        
        // 重置表单
        this.reset();
        
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 切换到客户列表选项卡并刷新列表
        $('#students-tab').tab('show');
        
        // 刷新学生列表
        initStudentTable();
      })
      .catch(error => {
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示错误消息
        showAlert('danger', `添加学生失败: ${error.message}`);
      });
  });
  
  // 主页面学生信息表单也添加自动计算剩余课时功能
  $('#totalHours, #usedHours').on('input', function() {
    const totalHours = parseInt($('#totalHours').val()) || 0;
    const usedHours = parseInt($('#usedHours').val()) || 0;
    $('#remainingHours').val(totalHours - usedHours);
  });
  
  // 加载学生记录的函数
  function loadStudentRecords(studentId) {
    StudentAPI.getStudentRecords(studentId)
      .then(records => {
        const $recordsList = $('#recordsList');
        
        // 清除加载指示器
        clearLoading('#recordsList');
        
        // 清空现有记录
        $recordsList.empty();
        
        if (records.length === 0) {
          // 显示无记录消息
          $recordsList.html('<div class="text-center text-muted py-3" id="noRecordsMessage">暂无学习记录</div>');
          return;
        }
        
        // 添加记录
        records.forEach(record => {
          const formattedDate = formatDate(record.date);
          const $record = $(`
            <div class="list-group-item">
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">上课日期: ${formattedDate}</h6>
                <small class="text-muted">记录时间: ${formatDateTime(record.createdAt)}</small>
              </div>
              <div class="mt-2 record-content">${record.content}</div>
            </div>
          `);
          $recordsList.append($record);
        });
      })
      .catch(error => {
        // 清除加载指示器
        clearLoading('#recordsList');
        
        // 显示错误消息
        $('#recordsList').html(`<div class="text-center text-danger py-3">加载记录失败: ${error.message}</div>`);
      });
  }
  
  // 日期格式化函数
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  
  // 日期时间格式化函数
  function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 初始化学生表格函数
  function initStudentTable() {
    // 显示加载指示器
    showLoading('#studentsTable tbody', '加载学生数据中...');
    
    // 获取所有学生数据
    StudentAPI.getAllStudents(currentPage, currentPerPage, currentStatus)
      .then(data => {
        const $tbody = $('#studentsTable tbody');
        
        // 清除加载指示器
        clearLoading('#studentsTable tbody');
        
        // 清空表格
        $tbody.empty();
        
        // 更新分页信息
        totalPages = data.pagination.pages;
        
        // 生成分页控件
        updatePagination(data.pagination);
        
        if (data.items.length === 0) {
          $tbody.html('<tr><td colspan="9" class="text-center text-muted">暂无客户数据</td></tr>');
          return;
        }
        
        // 遍历学生数据并添加到表格
        data.items.forEach(student => {
          // 根据状态设置显示文本和样式
          let statusText = '';
          let statusClass = '';
          
          if (student.status === 'active') {
            statusText = '活跃';
            statusClass = 'status-active';
          } else if (student.status === 'inactive') {
            statusText = '已结课';
            statusClass = 'status-inactive';
          } else if (student.status === 'new') {
            statusText = '新客户';
            statusClass = 'status-new';
          }
          
          // 格式化最近上课日期
          const lastClassDate = student.lastClassDate ? formatDate(student.lastClassDate) : '-';
          
          // 创建表格行
          const $row = $(`
            <tr data-status="${student.status}">
              <th scope="row">${student.id}</th>
              <td>${student.name}</td>
              <td>${student.phone || '-'}</td>
              <td>${student.remainingHours}</td>
              <td>${student.usedHours}</td>
              <td>${formatDate(student.registerDate)}</td>
              <td>${lastClassDate}</td>
              <td><span class="${statusClass}">${statusText}</span></td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary">编辑个人</button>
                  <button class="btn btn-sm btn-outline-success">录入上课记录</button>
                  <button class="btn btn-sm btn-outline-warning btn-course-consumption">课消记录</button>
                </div>
              </td>
            </tr>
          `);
          
          $tbody.append($row);
        });
      })
      .catch(error => {
        // 清除加载指示器
        clearLoading('#studentsTable tbody');
        
        // 显示错误消息
        $('#studentsTable tbody').html(`<tr><td colspan="9" class="text-center text-danger">加载学生数据失败: ${error.message}</td></tr>`);
      });
  }
  
  // 更新分页控件
  function updatePagination(pagination) {
    const { total, page, per_page, pages } = pagination;
    currentPage = page;
    totalPages = pages;
    
    // 更新总记录数
    $('#totalRecords').text(total);
    
    // 清空现有分页
    const $pagination = $('.pagination');
    $pagination.empty();
    
    // 如果总页数为0，不显示分页
    if (pages === 0) {
      return;
    }
    
    // 添加"上一页"按钮
    const $prevButton = $(`
      <li class="page-item${page === 1 ? ' disabled' : ''}">
        <a class="page-link" href="#" data-page="${page - 1}" tabindex="-1" aria-disabled="${page === 1}">上一页</a>
      </li>
    `);
    $pagination.append($prevButton);
    
    // 最多显示5个页码
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, startPage + 4);
    
    // 添加页码
    for (let i = startPage; i <= endPage; i++) {
      const $pageItem = $(`
        <li class="page-item${i === page ? ' active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `);
      $pagination.append($pageItem);
    }
    
    // 添加"下一页"按钮
    const $nextButton = $(`
      <li class="page-item${page >= pages ? ' disabled' : ''}">
        <a class="page-link" href="#" data-page="${page + 1}" aria-disabled="${page >= pages}">下一页</a>
      </li>
    `);
    $pagination.append($nextButton);
    
    // 更新每页显示数量选择器
    $('#perPageSelect').val(per_page.toString());
  }
  
  // 显示加载指示器
  function showLoading(selector, message = '加载中...') {
    const $el = $(selector);
    
    // 检查是否是模态框内部元素
    if (selector.includes('Modal')) {
      // 对于模态框，只添加加载指示器而不清空内容
      $el.html(`
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">${message}</p>
        </div>
      `);
    } else {
      // 普通元素，替换内容
      $el.html(`
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">${message}</p>
        </div>
      `);
    }
  }
  
  // 清除加载指示器
  function clearLoading(selector) {
    const $el = $(selector);
    if ($el.find('.spinner-border').length > 0) {
      $el.empty();
    }
  }
  
  // 显示警告消息
  function showAlert(type, message) {
    const $alert = $(`
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    
    // 添加到页面
    const $container = $('.container').first();
    $container.prepend($alert);
    
    // 5秒后自动关闭
    setTimeout(() => {
      $alert.alert('close');
    }, 5000);
  }
  
  // 在模态框中显示警告消息
  function showModalAlert(modalSelector, type, message) {
    const $modalBody = $(`${modalSelector} .modal-body`);
    const $existingAlert = $modalBody.find('.alert');
    
    // 如果已经有消息，则移除
    if ($existingAlert.length > 0) {
      $existingAlert.remove();
    }
    
    // 创建新的消息
    const $alert = $(`
      <div class="alert alert-${type} alert-dismissible fade show mb-3" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    
    // 添加到模态框
    $modalBody.prepend($alert);
    
    // 5秒后自动关闭
    setTimeout(() => {
      $alert.alert('close');
    }, 5000);
  }
  
  // 课消记录按钮点击事件
  $(document).on('click', '.btn-course-consumption', function() {
    // 获取当前行
    const $row = $(this).closest('tr');
    
    // 获取学生ID和姓名
    const id = parseInt($row.find('th').text());
    const name = $row.find('td:eq(0)').text();
    const remainingHours = parseFloat($row.find('td:eq(3)').text());
    const usedHours = parseFloat($row.find('td:eq(4)').text());
    const totalHours = remainingHours + usedHours;
    
    // 设置模态框标题和表单数据
    $('#courseConsumptionModalLabel').text(`课消记录 - ${name}`);
    $('#consumptionStudentId').val(id);
    $('#consumptionStudentName').val(name);
    $('#consumptionTotalHours').val(totalHours);
    $('#consumptionUsedHours').val(usedHours);
    $('#consumptionRemainingHours').val(remainingHours);
    $('#consumptionHours').val(1);
    
    // 清空课时包选择下拉框
    $('#consumptionPackageId').empty();
    
    // 显示加载指示器
    showLoading('#packageSelector', '加载课时包中...');
    showLoading('#consumptionRecordsList', '加载课消记录中...');
    
    // 获取学生的活跃课时包
    StudentAPI.getStudentPackages(id, true)
      .then(packages => {
        clearLoading('#packageSelector');
        
        if (packages.length === 0) {
          $('#packageSelector').html(`
            <div class="alert alert-warning">
              该学生没有活跃的课时包，请先添加课时包
            </div>
          `);
          return;
        }
        
        // 填充课时包选择下拉框
        const $select = $('<select class="form-select" id="consumptionPackageId"></select>');
        packages.forEach(pkg => {
          $select.append(`<option value="${pkg.id}" 
            data-total="${pkg.totalHours}"
            data-used="${pkg.usedHours}"
            data-remaining="${pkg.remainingHours}">
            课时包 #${pkg.id} (剩余: ${pkg.remainingHours} 课时)
          </option>`);
        });
        
        $('#packageSelector').html('<label class="form-label">选择课时包</label>').append($select);
        
        // 绑定课时包选择变更事件
        $select.off('change').on('change', function() {
          const $selectedOption = $(this).find('option:selected');
          const packageId = $(this).val();
          
          if (!packageId) {
            return;
          }
          
          // 更新课时信息显示
          $('#consumptionTotalHours').val($selectedOption.data('total'));
          $('#consumptionUsedHours').val($selectedOption.data('used'));
          $('#consumptionRemainingHours').val($selectedOption.data('remaining'));
          
          // 加载选中课时包的课消记录
          loadStudentConsumptionRecords($('#consumptionStudentId').val(), packageId);
        });
        
        // 触发课时包选择事件
        $select.trigger('change');
      })
      .catch(error => {
        clearLoading('#packageSelector');
        $('#packageSelector').html(`
          <div class="alert alert-danger">
            加载课时包失败: ${error.message}
          </div>
        `);
        
        // 加载所有课消记录
        loadStudentConsumptionRecords(id);
      });
    
    // 显示模态框
    const consumptionModal = new bootstrap.Modal(document.getElementById('courseConsumptionModal'));
    consumptionModal.show();
  });
  
  // 保存课消记录按钮点击事件
  $('#saveConsumptionBtn').on('click', function() {
    const studentId = parseInt($('#consumptionStudentId').val());
    const studentName = $('#consumptionStudentName').val();
    const consumptionHours = parseFloat($('#consumptionHours').val()) || 0;
    const packageId = $('#consumptionPackageId').val();
    
    // 验证输入
    if (consumptionHours <= 0) {
      showModalAlert('#courseConsumptionModal', 'danger', '请输入有效的消耗课时');
      return;
    }
    
    if (!packageId) {
      showModalAlert('#courseConsumptionModal', 'danger', '请选择要消耗的课时包');
      return;
    }
    
    const packageRemainingHours = $(`#consumptionPackageId option[value="${packageId}"]`).data('remaining');
    
    if (consumptionHours > packageRemainingHours) {
      showModalAlert('#courseConsumptionModal', 'danger', `消耗课时不能大于所选课时包的剩余课时(${packageRemainingHours})`);
      return;
    }
    
    // 禁用按钮，显示加载状态
    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 保存中...');
    
    // 创建课消记录数据
    const consumptionData = {
      studentId,
      packageId: parseInt(packageId),
      consumptionHours,
      operationTime: new Date().toISOString()
    };
    
    // 添加课消记录
    StudentAPI.addConsumptionRecord(consumptionData)
      .then(recordData => {
        // 更新表格中的课时信息
        const $row = $(`#studentsTable tbody tr`).filter(function() {
          return parseInt($(this).find('th').text()) === studentId;
        });
        
        // 更新表格中的显示
        $row.find('td:eq(3)').text(recordData.remainingHours);
        $row.find('td:eq(4)').text(recordData.usedHours);
        
        // 将消耗记录添加到表格
        const $newRecord = $(`
          <tr>
            <td>${recordData.consumptionHours}</td>
            <td>${recordData.remainingHours}</td>
            <td>${formatDateTime(recordData.operationTime)}</td>
            <td>${recordData.operatorName || '当前用户'}</td>
          </tr>
        `);
        
        // 如果是第一条记录，移除"暂无记录"提示
        if ($('#noConsumptionRecordsMessage').length) {
          $('#noConsumptionRecordsMessage').remove();
        }
        
        // 添加到表格顶部
        $('#consumptionRecordsList').prepend($newRecord);
        
        // 更新课时包下拉框
        refreshPackageDropdown(studentId);
        
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示成功消息
        showModalAlert('#courseConsumptionModal', 'success', '课消记录保存成功！已发送通知信息。');
      })
      .catch(error => {
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示错误消息
        showModalAlert('#courseConsumptionModal', 'danger', `保存记录失败: ${error.message}`);
        
        console.error('保存课消记录失败:', error);
      });
  });
  
  // 刷新课时包下拉框
  function refreshPackageDropdown(studentId) {
    StudentAPI.getStudentPackages(studentId, true)
      .then(packages => {
        const $select = $('#consumptionPackageId');
        $select.empty();
        
        if (packages.length === 0) {
          $('#packageSelector').html(`
            <div class="alert alert-warning">
              该学生没有活跃的课时包，请先添加课时包
            </div>
          `);
          return;
        }
        
        // 填充课时包选择下拉框
        packages.forEach(pkg => {
          $select.append(`<option value="${pkg.id}" 
            data-total="${pkg.totalHours}"
            data-used="${pkg.usedHours}"
            data-remaining="${pkg.remainingHours}">
            课时包 #${pkg.id} (剩余: ${pkg.remainingHours} 课时)
          </option>`);
        });
        
        // 绑定课时包选择变更事件
        $select.off('change').on('change', function() {
          const $selectedOption = $(this).find('option:selected');
          const packageId = $(this).val();
          
          if (!packageId) {
            return;
          }
          
          // 更新课时信息显示
          $('#consumptionTotalHours').val($selectedOption.data('total'));
          $('#consumptionUsedHours').val($selectedOption.data('used'));
          $('#consumptionRemainingHours').val($selectedOption.data('remaining'));
          
          // 加载选中课时包的课消记录
          loadStudentConsumptionRecords($('#consumptionStudentId').val(), packageId);
        });
        
        // 触发课时包选择事件
        $select.trigger('change');
      })
      .catch(error => {
        console.error('刷新课时包列表失败:', error);
      });
  }
  
  // 加载学生课消记录的函数
  function loadStudentConsumptionRecords(studentId, packageId = null) {
    // 显示加载指示器
    showLoading('#consumptionRecordsList', '加载课消记录中...');
    
    // 调用API获取学生的课消记录
    StudentAPI.getStudentConsumptionRecords(studentId, packageId)
      .then(records => {
        const $recordsList = $('#consumptionRecordsList');
        
        // 清除加载指示器
        clearLoading('#consumptionRecordsList');
        
        // 清空现有记录
        $recordsList.empty();
        
        if (records.length === 0) {
          // 显示无记录消息
          $recordsList.html('<tr id="noConsumptionRecordsMessage"><td colspan="4" class="text-center text-muted py-3">暂无课消记录</td></tr>');
          return;
        }
        
        // 添加记录
        records.forEach(record => {
          const $record = $(`
            <tr>
              <td>${record.consumptionHours}</td>
              <td>${record.remainingHours}</td>
              <td>${formatDateTime(record.operationTime)}</td>
              <td>${record.operatorName}</td>
            </tr>
          `);
          $recordsList.append($record);
        });
      })
      .catch(error => {
        // 清除加载指示器
        clearLoading('#consumptionRecordsList');
        
        // 显示错误消息
        $('#consumptionRecordsList').html(`<tr><td colspan="4" class="text-center text-danger py-3">加载记录失败: ${error.message}</td></tr>`);
        
        // 由于API可能尚未实现，添加模拟数据作为备用
        console.warn('使用模拟数据作为备用');
        
        setTimeout(() => {
          const mockRecords = [
            {
              consumptionHours: 2,
              remainingHours: 8,
              operationTime: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              operatorName: '管理员'
            },
            {
              consumptionHours: 1,
              remainingHours: 10,
              operationTime: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              operatorName: '管理员'
            }
          ];
          
          // 清空现有记录
          $('#consumptionRecordsList').empty();
          
          // 添加模拟记录
          mockRecords.forEach(record => {
            const $record = $(`
              <tr>
                <td>${record.consumptionHours}</td>
                <td>${record.remainingHours}</td>
                <td>${formatDateTime(record.operationTime)}</td>
                <td>${record.operatorName}</td>
              </tr>
            `);
            $('#consumptionRecordsList').append($record);
          });
        }, 500);
      });
  }
  
  // 初始化课时包表格
  $('#packages-tab').on('click', function() {
    // 显示加载指示器
    showLoading('#packagesTable tbody', '加载课时包数据中...');
    
    // 初始化课时包表格
    initPackagesTable();
  });
  
  // 状态筛选功能
  $('#packageStatusFilter').on('change', function() {
    const selectedStatus = $(this).val();
    packageCurrentStatus = selectedStatus;
    packageCurrentPage = 1; // 重置到第一页
    
    // 重新加载数据
    initPackagesTable();
  });
  
  // 每页显示数量变更
  $('#packagePerPageSelect').on('change', function() {
    packageCurrentPerPage = parseInt($(this).val());
    packageCurrentPage = 1; // 重置到第一页
    
    // 重新加载数据
    initPackagesTable();
  });
  
  // 分页点击事件
  $(document).on('click', '.pagination-packages .page-link', function(e) {
    e.preventDefault();
    
    // 如果是禁用状态，不执行操作
    if ($(this).parent().hasClass('disabled')) {
      return;
    }
    
    // 获取页码
    const page = $(this).data('page');
    packageCurrentPage = page;
    
    // 重新加载数据
    initPackagesTable();
    
    // 滚动到表格顶部
    $('html, body').animate({
      scrollTop: $('#packagesTable').offset().top - 20
    }, 200);
  });

  // Function to load course packages into the dropdown
  function loadCoursePackages() {
    fetch('/api/course-packages')
      .then(response => response.json())
      .then(data => {
        const select = document.getElementById('coursePackageSelect');
        select.innerHTML = '<option value="">请选择课时包...</option>';
        data.forEach(package => {
          const option = document.createElement('option');
          option.value = package.id;
          option.textContent = `${package.name} - ${package.total_hours}小时`;
          select.appendChild(option);
        });
      })
      .catch(error => console.error('Error loading course packages:', error));
  }

  // Call loadCoursePackages when the modal is shown
  $('#addCustomerModal').on('show.bs.modal', function () {
    loadCoursePackages();
  });

  // Update initPackagesTable to use new models
  function initPackagesTable() {
    showLoading('#packagesTable tbody', '加载课时包数据中...');
    StudentAPI.getAllPackages()
      .then(data => {
        const tbody = document.querySelector('#packagesTable tbody');
        tbody.innerHTML = '';
        data.forEach((pkg, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${pkg.name}</td>
            <td>${pkg.total_hours}</td>
            <td>${pkg.used_hours}</td>
            <td>${pkg.remaining_hours}</td>
            <td>${pkg.purchase_date}</td>
            <td>${pkg.expire_date}</td>
            <td>${pkg.status}</td>
            <td>
              <button class="btn btn-sm btn-primary">编辑</button>
              <button class="btn btn-sm btn-danger">删除</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Error loading packages:', error);
        showError('#packagesTable tbody', '无法加载课时包数据');
      });
  }
}); 