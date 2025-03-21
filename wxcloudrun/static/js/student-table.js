/**
 * student-table.js - 处理学生/客户表格的展示、筛选和交互
 */

// 学生表格模块
const StudentTable = {
  // 当前分页和筛选状态
  state: {
    currentPage: 1,
    perPage: 10,
    status: 'all'
  },
  
  // 初始化学生表格
  init: function() {
    // 绑定筛选和分页事件
    this.bindEvents();
    
    // 加载学生数据
    this.loadData();
  },
  
  // 绑定筛选和分页事件
  bindEvents: function() {
    // 状态筛选
    $('#statusFilter').on('change', () => {
      this.state.status = $('#statusFilter').val();
      this.state.currentPage = 1; // 重置到第一页
      this.loadData();
    });
    
    // 每页显示数量
    $('#perPageSelect').on('change', () => {
      this.state.perPage = parseInt($('#perPageSelect').val());
      this.state.currentPage = 1; // 重置到第一页
      this.loadData();
    });
    
    // 删除学生事件委托
    $(document).on('click', '.btn-delete-student', this.handleDeleteStudent.bind(this));
    
    // 编辑个人信息按钮
    $(document).on('click', '.btn-edit-personal', this.handleEditPersonal.bind(this));
    
    // 录入上课记录按钮
    $(document).on('click', '.btn-add-class-record', this.handleAddClassRecord.bind(this));
    
    // 课消记录按钮
    $(document).on('click', '.btn-course-consumption', this.handleCourseConsumption.bind(this));
  },
  
  // 加载学生数据
  loadData: function() {
    // 显示加载指示器
    NotificationUtils.showLoading('#studentsTable tbody', '加载客户数据中...');
    
    // 清空现有表格内容
    $('#studentsTable tbody').empty();
    
    // 获取学生数据
    StudentAPI.getAllStudents(this.state.currentPage, this.state.perPage, this.state.status)
      .then(response => {
          // 渲染学生表格
          this.renderTable(response.data.items);
          
          // 更新分页控件
          this.updatePagination(response.data.pagination);
        
          // 更新总记录数显示
          $('#totalRecords').text(response.data.pagination.total);
          
          // 如果没有记录，显示空状态
          if (response.data.items.length === 0) {
            $('#studentsTable tbody').html(`
              <tr>
                <td colspan="9" class="text-center py-4">
                  <div class="empty-state">
                    <i class="bi bi-people" style="font-size: 2rem; opacity: 0.5;"></i>
                    <p class="mt-2">暂无客户记录</p>
                  </div>
                </td>
              </tr>
            `);
          }
        })
      .catch(error => {
        // 显示错误信息
        NotificationUtils.clearLoading('#studentsTable tbody');
        $('#studentsTable tbody').html(`
          <tr>
            <td colspan="9" class="text-center py-4">
              <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                加载客户数据失败: ${error.message}
              </div>
            </td>
          </tr>
        `);
      });
  },
  
  // 渲染学生表格
  renderTable: function(students) {
    const $tableBody = $('#studentsTable tbody');
    $tableBody.empty();
    
    console.log("students:" + JSON.stringify(students, null, 2));

    students.forEach(student => {
      // 确定状态文本和类名
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
      
      // 创建表格行
      const $row = $(`
        <tr data-id="${student.id}" data-status="${student.status}">
          <th scope="row">${student.id}</th>
          <td>${student.name}</td>
          <td>${student.phone || '-'}</td>
          <td>${DateFormatterUtils.formatDate(student.registerDate)}</td>
          <td><span class="${statusClass}">${statusText}</span></td>
          <td>
            <div class="btn-group" role="group" aria-label="操作按钮">
              <button type="button" class="btn btn-sm btn-edit-personal btn-outline-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="编辑个人信息" aria-label="编辑个人信息">
                <i class="bi bi-person-gear"></i>
              </button>
              <button type="button" class="btn btn-sm btn-add-class-record btn-outline-success" data-bs-toggle="tooltip" data-bs-placement="top" title="录入上课记录" aria-label="录入上课记录">
                <i class="bi bi-journal-plus"></i>
              </button>
              <button type="button" class="btn btn-sm btn-course-consumption btn-outline-warning" data-bs-toggle="tooltip" data-bs-placement="top" title="课消记录" aria-label="课消记录">
                <i class="bi bi-clock-history"></i>
              </button>
              <button type="button" class="btn btn-sm btn-delete-student btn-outline-danger" data-bs-toggle="tooltip" data-bs-placement="top" title="删除客户" aria-label="删除客户">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `);
      
      // 添加到表格
      $tableBody.append($row);
    });
    
    // 初始化工具提示
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // 清除加载指示器
    NotificationUtils.clearLoading('#studentsTable tbody');
  },
  
  // 更新分页控件
  updatePagination: function(pagination) {
    // 使用通用分页工具更新分页控件
    PaginationUtils.updatePagination(
      pagination,
      '.pagination',
      (page) => {
        this.state.currentPage = page;
        this.loadData();
      }
    );
  },
  
  // 处理删除学生
  handleDeleteStudent: function(event) {
    const $button = $(event.currentTarget);
    const $row = $button.closest('tr');
    const studentId = parseInt($row.attr('data-id'));
    const studentName = $row.find('td:eq(0)').text();
    
    // 显示确认对话框
    if (confirm(`确定要删除客户 "${studentName}" 吗？此操作不可撤销，相关的课时包和记录也将被删除。`)) {
      // 禁用按钮并显示加载状态
      $button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
      
      // 调用API删除学生
      StudentAPI.deleteStudent(studentId)
        .then(() => {
          // 移除表格行并显示成功消息
          $row.fadeOut(300, function() {
            $(this).remove();
            
            // 如果删除后表格为空，显示空状态
            if ($('#studentsTable tbody tr').length === 0) {
              $('#studentsTable tbody').html(`
                <tr>
                  <td colspan="9" class="text-center py-4">
                    <div class="empty-state">
                      <i class="bi bi-people" style="font-size: 2rem; opacity: 0.5;"></i>
                      <p class="mt-2">暂无客户记录</p>
                    </div>
                  </td>
                </tr>
              `);
            }
            
            // 显示成功消息
            NotificationUtils.showAlert('success', `客户 "${studentName}" 已成功删除`);
          });
        })
        .catch(error => {
          // 恢复按钮状态
          $button.prop('disabled', false).html('<i class="bi bi-trash"></i>');
          
          // 显示错误消息
          NotificationUtils.showAlert('danger', `删除客户失败: ${error.message}`);
        });
    }
  },
  
  // 处理编辑个人信息
  handleEditPersonal: function(event) {
    // const $button = $(event.currentTarget);
    // const $row = $button.closest('tr');
    // const studentId = parseInt($row.attr('data-id'));
    // const studentName = $row.find('td:eq(1)').text();  // 假设姓名在第二列
    
    // console.log(`正在加载学生信息，ID: ${studentId}, 姓名: ${studentName}`);
    
    // 确保模态框元素存在
    const $modal = $('#editPersonalModal');
    // if ($modal.length === 0) {
    //   console.error('模态框元素未找到');
    //   NotificationUtils.showAlert('danger', '系统错误: 模态框元素未找到');
    //   return;
    // }

    // 在显示模态框之前进行重置
    try {
      // 清空表单数据，避免显示旧数据
      // $('#editPersonalId').val('');
      // $('#editPersonalName').val('');
      // $('#editPersonalPhone').val('');
      // $('#editPersonalEmail').val('');
      // $('#editPersonalBirthdate').val('');
      // $('#editPersonalAddress').val('');
      // $('#editPersonalNotes').val('');
      // $('input[name="editPersonalStatus"]').prop('checked', false);
      
      // 先显示一个加载指示器在模态框标题中
      // $modal.find('.modal-title').html(`编辑客户信息: <small class="text-muted">${studentName}</small> <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
    
      // 在DOM加载完毕后再显示模态框
      $(document).ready(function() {
        $modal.modal('show');
        
        // 只有在模态框显示后才加载数据
        $modal.on('shown.bs.modal', function() {
          // 显示加载指示器
          NotificationUtils.showLoading('#editPersonalModal .modal-body', '加载客户信息中...');
          
          // 加载学生数据
          StudentAPI.getStudent(studentId)
            .then(response => {
              // 填充表单数据
              try {
                const student = response.data;
                console.log("student:" + JSON.stringify(student, null, 2));
                $('#editPersonalId').val(student.id);
                $('#editPersonalName').val(student.name);
                $('#editPersonalPhone').val(student.phone || '');
                $('#editPersonalEmail').val(student.email || '');
                $('#editPersonalBirthdate').val(student.birthdate || '');
                $('#editPersonalAddress').val(student.address || '');
                $('#editPersonalNotes').val(student.notes || '');
                
                // 设置状态单选按钮
                $(`input[name="editPersonalStatus"][value="${student.status || 'active'}"]`).prop('checked', true);
                
                // 更新模态框标题
                $modal.find('.modal-title').text(`编辑客户信息: ${student.name}`);
                
                // 清除加载指示器
                NotificationUtils.clearLoading('#editPersonalModal .modal-body');
              } catch (e) {
                console.error('填充表单数据时出错:', e);
                NotificationUtils.clearLoading('#editPersonalModal .modal-body');
                NotificationUtils.showAlert('danger', '填充表单数据时出错');
              }
            })
            .catch(error => {
              // 显示错误信息
              console.error('加载客户信息失败:', error);
              NotificationUtils.clearLoading('#editPersonalModal .modal-body');
              NotificationUtils.showAlert('danger', `加载客户信息失败: ${error.message}`);
            });
        });
        
        // 移除事件监听器，避免重复加载
        $modal.off('shown.bs.modal');
      });
    } catch (e) {
      console.error('准备模态框时出错:', e);
      NotificationUtils.showAlert('danger', '系统错误: 准备模态框时出错');
    }
  },
  
  // 处理录入上课记录
  handleAddClassRecord: function(event) {
    const $button = $(event.currentTarget);
    const $row = $button.closest('tr');
    const studentId = parseInt($row.attr('data-id'));
    const studentName = $row.find('td:eq(0)').text();
    
    // 显示添加上课记录模态框
    $('#addClassRecordModal').modal('show');
    
    // 填充学生ID和姓名
    $('#classRecordStudentId').val(studentId);
    $('#classRecordStudentName').val(studentName);
    
    // 设置日期为今天
    const today = new Date().toISOString().split('T')[0];
    $('#classRecordDate').val(today);
    
    // 清空内容
    $('#classRecordContent').val('');
    
    // 加载学生的上课记录
    this.loadStudentRecords(studentId);
  },
  
  // 加载学生的上课记录
  loadStudentRecords: function(studentId) {
    // 显示加载指示器
    NotificationUtils.showLoading('#studentRecordsTable tbody', '加载上课记录中...');
    
    // 获取学生的上课记录
    StudentAPI.getStudentRecords(studentId)
      .then(response => {
        const records = response.data;
        const $tableBody = $('#studentRecordsTable tbody');
        $tableBody.empty();
        
        if (records.length === 0) {
          $tableBody.html(`
            <tr>
              <td colspan="3" class="text-center py-4">
                <div class="empty-state">
                  <i class="bi bi-journal" style="font-size: 2rem; opacity: 0.5;"></i>
                  <p class="mt-2">暂无上课记录</p>
                </div>
              </td>
            </tr>
          `);
        } else {
          records.forEach(record => {
            const $row = $(`
              <tr>
                <td>${DateFormatterUtils.formatDate(record.date)}</td>
                <td>${record.content}</td>
                <td>${DateFormatterUtils.formatDateTime(record.createdAt)}</td>
              </tr>
            `);
            $tableBody.append($row);
          });
        }
        
        // 清除加载指示器
        NotificationUtils.clearLoading('#studentRecordsTable tbody');
      })
      .catch(error => {
        // 显示错误信息
        NotificationUtils.clearLoading('#studentRecordsTable tbody');
        $('#studentRecordsTable tbody').html(`
          <tr>
            <td colspan="3" class="text-center py-4">
              <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                加载上课记录失败: ${error.message}
              </div>
            </td>
          </tr>
        `);
      });
  },
  
  // 处理课消记录
  handleCourseConsumption: function(event) {
    const $button = $(event.currentTarget);
    const $row = $button.closest('tr');
    const studentId = parseInt($row.attr('data-id'));
    const studentName = $row.find('td:eq(0)').text();
    
    // 显示课消记录模态框
    $('#consumptionRecordModal').modal('show');
    
    // 填充学生信息
    $('#consumptionStudentId').val(studentId);
    $('#consumptionStudentName').val(studentName);
    
    // 重置表单
    $('#addConsumptionForm')[0].reset();
    
    // 加载学生课时包和课消记录
    this.loadStudentPackages(studentId);
    this.loadConsumptionRecords(studentId);
  },
  
  // 加载学生的课时包
  loadStudentPackages: function(studentId) {
    // 显示加载指示器
    NotificationUtils.showLoading('#packageSelector', '加载课时包中...');
    
    // 获取学生的活跃课时包
    StudentAPI.getStudentPackages(studentId, true)
      .then(response => {
        const packages = response.data;
        const $selector = $('#packageSelector');
        $selector.empty();
        
        if (packages.length === 0) {
          $selector.html('<option value="">-- 无可用课时包 --</option>');
          $('#consumptionHours, #consumptionSubmit').prop('disabled', true);
        } else {
          $selector.append('<option value="">-- 请选择课时包 --</option>');
          packages.forEach(pkg => {
            $selector.append(`<option value="${pkg.id}" data-remaining="${pkg.remainingHours}" data-used="${pkg.usedHours}">${pkg.name || '课时包 #' + pkg.id} (剩余: ${pkg.remainingHours})</option>`);
          });
          $('#consumptionHours, #consumptionSubmit').prop('disabled', false);
        }
        
        // 清除加载指示器
        NotificationUtils.clearLoading('#packageSelector');
      })
      .catch(error => {
        // 显示错误信息
        NotificationUtils.clearLoading('#packageSelector');
        $('#packageSelector').html('<option value="">-- 加载失败 --</option>');
        $('#consumptionHours, #consumptionSubmit').prop('disabled', true);
        NotificationUtils.showAlert('danger', `加载课时包失败: ${error.message}`);
      });
  },
  
  // 加载学生的课消记录
  loadConsumptionRecords: function(studentId) {
    // 显示加载指示器
    NotificationUtils.showLoading('#consumptionRecordsTable tbody', '加载课消记录中...');
    
    // 获取学生的课消记录
    StudentAPI.getConsumptionRecords(studentId)
      .then(response => {
        const records = response.data;
        const $tableBody = $('#consumptionRecordsTable tbody');
        $tableBody.empty();
        
        if (records.length === 0) {
          $tableBody.html(`
            <tr>
              <td colspan="5" class="text-center py-4">
                <div class="empty-state">
                  <i class="bi bi-clock-history" style="font-size: 2rem; opacity: 0.5;"></i>
                  <p class="mt-2">暂无课消记录</p>
                </div>
              </td>
            </tr>
          `);
        } else {
          records.forEach(record => {
            const $row = $(`
              <tr>
                <td>${record.packageName}</td>
                <td>${record.consumptionHours}</td>
                <td>${record.remainingHours}</td>
                <td>${DateFormatterUtils.formatDateTime(record.operationTime)}</td>
                <td>${record.operatorName}</td>
              </tr>
            `);
            $tableBody.append($row);
          });
        }
        
        // 清除加载指示器
        NotificationUtils.clearLoading('#consumptionRecordsTable tbody');
      })
      .catch(error => {
        // 显示错误信息
        NotificationUtils.clearLoading('#consumptionRecordsTable tbody');
        $('#consumptionRecordsTable tbody').html(`
          <tr>
            <td colspan="5" class="text-center py-4">
              <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                加载课消记录失败: ${error.message}
              </div>
            </td>
          </tr>
        `);
      });
  },
  
  // 刷新表格数据
  refresh: function() {
    this.loadData();
  },
  
  // 设置状态筛选
  setStatusFilter: function(status) {
    $('#statusFilter').val(status);
    this.state.status = status;
    this.state.currentPage = 1;
    this.loadData();
  }
}; 