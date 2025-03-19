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
        this.renderTable(response.items);
        
        // 更新分页控件
        this.updatePagination(response.pagination);
        
        // 更新总记录数显示
        $('#totalRecords').text(`共 ${response.pagination.total} 条记录`);
        
        // 如果没有记录，显示空状态
        if (response.items.length === 0) {
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
          <td>${student.remainingHours}</td>
          <td>${student.usedHours}</td>
          <td>${student.totalHours}</td>
          <td>${DateFormatterUtils.formatDate(student.registerDate)}</td>
          <td>${student.lastClassDate ? DateFormatterUtils.formatDate(student.lastClassDate) : '-'}</td>
          <td><span class="${statusClass}">${statusText}</span></td>
          <td>
            <div class="btn-group" role="group">
              <button type="button" class="btn btn-sm btn-outline-primary" title="编辑个人信息">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-success" title="录入上课记录">
                <i class="bi bi-journal-text"></i>
              </button>
              <button type="button" class="btn btn-sm btn-course-consumption btn-outline-info" title="课时消耗">
                <i class="bi bi-clock-history"></i>
              </button>
              <button type="button" class="btn btn-sm btn-delete-student btn-outline-danger" title="删除">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `);
      
      // 添加到表格
      $tableBody.append($row);
    });
    
    // 清除加载指示器
    NotificationUtils.clearLoading('#studentsTable tbody');
  },
  
  // 更新分页控件
  updatePagination: function(pagination) {
    // 使用通用分页工具更新分页控件
    PaginationUtils.updatePagination(
      pagination,
      '.pagination-container',
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