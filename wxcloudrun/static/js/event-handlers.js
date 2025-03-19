/**
 * event-handlers.js - 处理页面事件绑定和事件处理函数
 */

// 事件处理模块
const EventHandlers = {
  // 初始化页面事件监听
  init: function() {
    // 初始化Quill富文本编辑器
    this.initRichTextEditor();
    
    // 绑定各类点击事件和表单事件
    this.bindButtonEvents();
    this.bindFormEvents();
    this.bindTabEvents();
    this.bindFilterEvents();
  },
  
  // 初始化富文本编辑器
  initRichTextEditor: function() {
    // 检查是否存在编辑器元素
    if (!document.getElementById('classContentEditor')) return;
    
    // 初始化Quill富文本编辑器
    window.quillEditor = new Quill('#classContentEditor', {
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
  },
  
  // 绑定按钮点击事件
  bindButtonEvents: function() {
    // 保存课程记录按钮事件
    $('#saveRecordBtn').on('click', this.handleSaveClassRecord);
    
    // 保存个人信息按钮事件
    $('#savePersonalBtn').on('click', this.handleSavePersonalInfo);
    
    // 保存课消记录按钮事件
    $('#saveConsumptionBtn').on('click', this.handleSaveConsumptionRecord);
    
    // 录入上课记录按钮委托事件
    $(document).on('click', '.btn-outline-success', this.handleOpenClassRecordModal);
    
    // 编辑个人信息按钮委托事件
    $(document).on('click', '.btn-outline-primary', this.handleOpenEditPersonalModal);
    
    // 课消记录按钮委托事件
    $(document).on('click', '.btn-course-consumption', this.handleOpenConsumptionModal);
  },
  
  // 绑定表单提交事件
  bindFormEvents: function() {
    // 学生表单提交事件
    $('#studentForm').on('submit', this.handleStudentFormSubmit);
    
    // 课时自动计算
    $('#totalHours, #usedHours').on('input', function() {
      const totalHours = parseInt($('#totalHours').val()) || 0;
      const usedHours = parseInt($('#usedHours').val()) || 0;
      $('#remainingHours').val(totalHours - usedHours);
    });
  },
  
  // 绑定标签页切换事件
  bindTabEvents: function() {
    // 课时包标签页切换事件
    $('#packages-tab').on('click', function() {
      // 显示加载指示器
      NotificationUtils.showLoading('#packagesTable tbody', '加载课时包数据中...');
      
      // 初始化课时包表格
      PackageTable.init();
    });
  },
  
  // 绑定过滤和分页事件
  bindFilterEvents: function() {
    // 每页显示数量变更
    $('#perPageSelect').on('change', function() {
      currentPerPage = parseInt($(this).val());
      currentPage = 1; // 重置到第一页
      
      // 重新加载数据
      StudentTable.init();
    });
    
    // 状态筛选功能
    $('#statusFilter').on('change', function() {
      currentStatus = $(this).val();
      currentPage = 1; // 重置到第一页
      
      // 重新加载数据
      StudentTable.init();
    });
    
    // 课时包每页显示数量变更
    $('#packagePerPageSelect').on('change', function() {
      packageCurrentPerPage = parseInt($(this).val());
      packageCurrentPage = 1; // 重置到第一页
      
      // 重新加载数据
      PackageTable.init();
    });
    
    // 课时包状态筛选功能
    $('#packageStatusFilter').on('change', function() {
      packageCurrentStatus = $(this).val();
      packageCurrentPage = 1; // 重置到第一页
      
      // 重新加载数据
      PackageTable.init();
    });
    
    // 分页点击事件委托
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
      StudentTable.init();
      
      // 滚动到表格顶部
      $('html, body').animate({
        scrollTop: $('#studentsTable').offset().top - 20
      }, 200);
    });
    
    // 课时包分页点击事件委托
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
      PackageTable.init();
      
      // 滚动到表格顶部
      $('html, body').animate({
        scrollTop: $('#packagesTable').offset().top - 20
      }, 200);
    });
  },
  
  // === 事件处理函数 ===
  
  // 处理保存课程记录
  handleSaveClassRecord: function() {
    const studentId = parseInt($('#recordStudentId').val());
    const classDate = $('#classDate').val();
    const content = window.quillEditor.root.innerHTML;
    const contentText = window.quillEditor.getText().trim();
    
    // 验证输入
    if (!classDate) {
      NotificationUtils.showAlert('danger', '请选择上课日期');
      return;
    }
    
    if (!contentText) {
      NotificationUtils.showAlert('danger', '请输入学习内容');
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
        $row.find('td:eq(6)').text(DateFormatterUtils.formatDate(record.date));
        
        // 重新加载记录列表
        RecordsHandler.loadStudentRecords(studentId);
        
        // 清空编辑器
        window.quillEditor.setText('');
        
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示成功消息
        NotificationUtils.showAlert('success', '上课记录保存成功！');
      })
      .catch(error => {
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示错误消息
        NotificationUtils.showAlert('danger', `保存记录失败: ${error.message}`);
      });
  },
  
  // 处理保存个人信息
  handleSavePersonalInfo: function() {
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
      NotificationUtils.showModalAlert('#editPersonalModal', 'danger', '姓名为必填字段！');
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
        $row.find('td:eq(5)').text(DateFormatterUtils.formatDate(updatedStudent.registerDate));
        $row.find('td:eq(6)').text(updatedStudent.lastClassDate ? DateFormatterUtils.formatDate(updatedStudent.lastClassDate) : '-');
        
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
        NotificationUtils.showModalAlert('#editPersonalModal', 'success', '客户信息更新成功！');
        
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
        NotificationUtils.showModalAlert('#editPersonalModal', 'danger', `更新学生信息失败: ${error.message}`);
      });
  },
  
  // 处理保存课消记录
  handleSaveConsumptionRecord: function() {
    const studentId = parseInt($('#consumptionStudentId').val());
    const consumptionHours = parseFloat($('#consumptionHours').val()) || 0;
    const packageId = $('#consumptionPackageId').val();
    
    // 验证输入
    if (consumptionHours <= 0) {
      NotificationUtils.showModalAlert('#courseConsumptionModal', 'danger', '请输入有效的消耗课时');
      return;
    }
    
    if (!packageId) {
      NotificationUtils.showModalAlert('#courseConsumptionModal', 'danger', '请选择要消耗的课时包');
      return;
    }
    
    const packageRemainingHours = $(`#consumptionPackageId option[value="${packageId}"]`).data('remaining');
    
    if (consumptionHours > packageRemainingHours) {
      NotificationUtils.showModalAlert('#courseConsumptionModal', 'danger', `消耗课时不能大于所选课时包的剩余课时(${packageRemainingHours})`);
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
            <td>${DateFormatterUtils.formatDateTime(recordData.operationTime)}</td>
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
        RecordsHandler.refreshPackageDropdown(studentId);
        
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示成功消息
        NotificationUtils.showModalAlert('#courseConsumptionModal', 'success', '课消记录保存成功！已发送通知信息。');
      })
      .catch(error => {
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示错误消息
        NotificationUtils.showModalAlert('#courseConsumptionModal', 'danger', `保存记录失败: ${error.message}`);
        
        console.error('保存课消记录失败:', error);
      });
  },
  
  // 处理学生表单提交
  handleStudentFormSubmit: function(e) {
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
      NotificationUtils.showAlert('danger', '姓名为必填字段！');
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
          
          return PackageAPI.addPackage(packageData)
            .then(() => newStudent);
        }
        
        return newStudent;
      })
      .then(newStudent => {
        // 显示成功消息
        NotificationUtils.showAlert('success', '客户信息添加成功！');
        
        // 重置表单
        this.reset();
        
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 切换到客户列表选项卡并刷新列表
        $('#students-tab').tab('show');
        
        // 刷新学生列表
        StudentTable.refresh();
      })
      .catch(error => {
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示错误消息
        NotificationUtils.showAlert('danger', `添加学生失败: ${error.message}`);
      });
  },
  
  // 处理打开录入上课记录模态框
  handleOpenClassRecordModal: function() {
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
    const today = DateFormatterUtils.getTodayFormatted();
    $('#classDate').val(today);
    
    // 清空编辑器内容
    if (window.quillEditor) {
      window.quillEditor.setText('');
    }
    
    // 显示加载指示器
    NotificationUtils.showLoading('#recordsList', '加载历史记录中...');
    
    // 显示模态框
    const recordModal = new bootstrap.Modal(document.getElementById('classRecordModal'));
    recordModal.show();
    
    // 加载并显示该学生的历史记录
    RecordsHandler.loadStudentRecords(id);
  },
  
  // 处理打开编辑个人信息模态框
  handleOpenEditPersonalModal: function() {
    // 获取当前行
    const $row = $(this).closest('tr');
    
    // 获取学生ID
    const id = parseInt($row.find('th').text());
    
    // 保存表单原始内容
    const $modalBody = $('#editPersonalModal .modal-body');
    const originalContent = $modalBody.html();
    
    // 显示加载指示器
    NotificationUtils.showLoading('#editPersonalModal .modal-body', '加载学生信息中...');
    
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
  },
  
  // 处理打开课消记录模态框
  handleOpenConsumptionModal: function() {
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
    NotificationUtils.showLoading('#packageSelector', '加载课时包中...');
    NotificationUtils.showLoading('#consumptionRecordsList', '加载课消记录中...');
    
    // 获取学生的活跃课时包
    StudentAPI.getStudentPackages(id, true)
      .then(packages => {
        NotificationUtils.clearLoading('#packageSelector');
        
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
          RecordsHandler.loadStudentConsumptionRecords($('#consumptionStudentId').val(), packageId);
        });
        
        // 触发课时包选择事件
        $select.trigger('change');
      })
      .catch(error => {
        NotificationUtils.clearLoading('#packageSelector');
        $('#packageSelector').html(`
          <div class="alert alert-danger">
            加载课时包失败: ${error.message}
          </div>
        `);
        
        // 加载所有课消记录
        RecordsHandler.loadStudentConsumptionRecords(id);
      });
    
    // 显示模态框
    const consumptionModal = new bootstrap.Modal(document.getElementById('courseConsumptionModal'));
    consumptionModal.show();
  }
}; 