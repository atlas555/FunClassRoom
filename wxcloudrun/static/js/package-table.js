/**
 * package-table.js - 处理课时包表格的展示、筛选和交互
 */

// 课时包表格模块
const PackageTable = {
  // 当前分页和筛选状态
  state: {
    currentPage: 1,
    perPage: 10,
    status: 'all'
  },
  
  // 初始化课时包表格
  init: function() {
    // 绑定筛选和分页事件
    this.bindEvents();
    
    // 加载课时包数据
    this.loadData();
  },
  
  // 绑定筛选和分页事件
  bindEvents: function() {
    // 状态筛选
    $('#packageStatusFilter').on('change', () => {
      this.state.status = $('#packageStatusFilter').val();
      this.state.currentPage = 1; // 重置到第一页
      this.loadData();
    });
    
    // 每页显示数量
    $('#packagePerPageSelect').on('change', () => {
      this.state.perPage = parseInt($('#packagePerPageSelect').val());
      this.state.currentPage = 1; // 重置到第一页
      this.loadData();
    });
    
    // 删除课时包事件委托
    $(document).on('click', '.btn-delete-package', this.handleDeletePackage.bind(this));
    
    // 编辑课时包事件委托
    $(document).on('click', '.btn-edit-package', this.handleEditPackage.bind(this));
  },
  
  // 加载课时包数据
  loadData: function() {
    // 显示加载指示器
    NotificationUtils.showLoading('#packagesTable tbody', '加载课时包数据中...');
    
    // 清空现有表格内容
    $('#packagesTable tbody').empty();
    
    // 获取课时包数据
    PackageAPI.getAllPackages(this.state.currentPage, this.state.perPage, this.state.status)
      .then(response => {

        // 渲染课时包表格
        this.renderTable(response.data.items);
        
        // 更新分页控件
        this.updatePagination(response.data.pagination);
        
        // 更新总记录数显示
        $('#packageTotalRecords').text(`共 ${response.data.pagination.total_count} 条记录`);
        
        // 如果没有记录，显示空状态
        if (response.data.items.length === 0) {
          $('#packagesTable tbody').html(`
            <tr>
              <td colspan="8" class="text-center py-4">
                <div class="empty-state">
                  <i class="bi bi-box" style="font-size: 2rem; opacity: 0.5;"></i>
                  <p class="mt-2">暂无课时包记录</p>
                </div>
              </td>
            </tr>
          `);
        }
      })
      .catch(error => {
        // 显示错误信息
        NotificationUtils.clearLoading('#packagesTable tbody');
        $('#packagesTable tbody').html(`
          <tr>
            <td colspan="8" class="text-center py-4">
              <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                加载课时包数据失败: ${error.message}
              </div>
            </td>
          </tr>
        `);
      });
  },
  
  // 渲染课时包表格
  renderTable: function(packages) {
    const $tableBody = $('#packagesTable tbody');
    $tableBody.empty();
    
    packages.forEach(pkg => {
      // 确定状态文本和类名
      let statusText = '';
      let statusClass = '';
      
      if (pkg.status === 'active') {
        statusText = '有效';
        statusClass = 'status-active';
      } else if (pkg.status === 'expired') {
        statusText = '已过期';
        statusClass = 'status-expired';
      } else if (pkg.status === 'inactive') {
        statusText = '结束';
        statusClass = 'status-inactive';
      }
      
      // 创建表格行
      const $row = $(`
        <tr data-id="${pkg.id}" data-status="${pkg.status}">
          <th scope="row">${pkg.id}</th>
          <td>${pkg.name || '未命名课时包'}</td>
          <td>${pkg.totalHours}</td>
          <td><span class="${statusClass}">${statusText}</span></td>
          <td>
            <div class="btn-group" role="group" aria-label="操作按钮">
              <button type="button" class="btn btn-sm btn-edit-package btn-outline-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="编辑课时包" aria-label="编辑课时包">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button type="button" class="btn btn-sm btn-delete-package btn-outline-danger" data-bs-toggle="tooltip" data-bs-placement="top" title="删除" aria-label="删除课时包">
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
    NotificationUtils.clearLoading('#packagesTable tbody');
  },
  
  // 更新分页控件
  updatePagination: function(pagination) {
    // 使用通用分页工具更新分页控件
    PaginationUtils.updatePagination(
      pagination,
      '.pagination-packages',
      (page) => {
        this.state.currentPage = page;
        this.loadData();
      }
    );
  },
  
  // 处理删除课时包
  handleDeletePackage: function(event) {
    const $button = $(event.currentTarget);
    const $row = $button.closest('tr');
    const packageId = parseInt($row.attr('data-id'));

    // 显示确认对话框
    if (confirm(`确定要删除课时包吗？此操作不可撤销，相关的课消记录也将被删除。`)) {
      // 禁用按钮并显示加载状态
      $button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
      
      // 调用API删除课时包
      PackageAPI.deletePackage(packageId)
        .then(() => {
          // 移除表格行并显示成功消息
          $row.fadeOut(300, function() {
            $(this).remove();
            
            // 如果删除后表格为空，显示空状态
            if ($('#packagesTable tbody tr').length === 0) {
              $('#packagesTable tbody').html(`
                <tr>
                  <td colspan="8" class="text-center py-4">
                    <div class="empty-state">
                      <i class="bi bi-box" style="font-size: 2rem; opacity: 0.5;"></i>
                      <p class="mt-2">暂无课时包记录</p>
                    </div>
                  </td>
                </tr>
              `);
            }
            
            // 显示成功消息
            NotificationUtils.showAlert('success', `课时包已成功删除`);
          });
        })
        .catch(error => {
          // 恢复按钮状态
          $button.prop('disabled', false).html('<i class="bi bi-trash"></i>');
          
          // 显示错误消息
          NotificationUtils.showAlert('danger', `删除课时包失败: ${error.message}`);
        });
    }
  },
  
  // 处理编辑课时包
  handleEditPackage: function(event) {
    const $button = $(event.currentTarget);
    const $row = $button.closest('tr');
    const packageId = parseInt($row.attr('data-id'));
    
    // 显示模态框
    const editPackageModal = new bootstrap.Modal(document.getElementById('editPackageModal'));
    editPackageModal.show();
    
    // 显示加载指示器
    NotificationUtils.showLoading('#editPackageModal .modal-body', '加载课时包数据中...');
    
    // 获取课时包详情
    PackageAPI.getPackage(packageId)
      .then(packageData => {
        // 填充表单
        $('#editPackageId').val(packageData.id);
        $('#editPackageName').val(packageData.name || '');
        $('#editPackageTotalHours').val(packageData.totalHours);

        // 设置状态
        if (packageData.status === 'active') {
          $('#editPackageStatusActive').prop('checked', true);
        } else if (packageData.status === 'inactive') {
          $('#editPackageStatusInactive').prop('checked', true);
        } else if (packageData.status === 'expired') {
          $('#editPackageStatusExpired').prop('checked', true);
        } else if (packageData.status === 'used') {
          $('#editPackageStatusUsed').prop('checked', true);
        }
        
        $('#editPackageNotes').val(packageData.notes || '');
        
        // 清除加载指示器
        NotificationUtils.clearLoading('#editPackageModal .modal-body');
      })
      .catch(error => {
        // 显示错误信息
        NotificationUtils.clearLoading('#editPackageModal .modal-body');
        $('#editPackageModal .modal-body').prepend(`
          <div class="alert alert-danger" role="alert">
            加载课时包数据失败: ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `);
      });
  },
  
  // 刷新表格数据
  refresh: function() {
    this.loadData();
  },
  
  // 设置状态筛选
  setStatusFilter: function(status) {
    $('#packageStatusFilter').val(status);
    this.state.status = status;
    this.state.currentPage = 1;
    this.loadData();
  }
}; 