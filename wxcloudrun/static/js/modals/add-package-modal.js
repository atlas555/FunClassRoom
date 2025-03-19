/**
 * add-package-modal.js - 处理添加课时包模态框的功能
 */

// 添加课时包模态框模块
const AddPackageModal = {
  // 初始化模态框
  init: function() {
    this.bindEvents();
  },
  
  // 绑定事件
  bindEvents: function() {
    // 绑定"添加课时包"按钮点击事件
    $('#openAddPackageModalBtn').on('click', this.openModal.bind(this));
    
    // 绑定添加按钮事件
    $('#addNewPackageBtn').on('click', this.addNewPackage.bind(this));
    
    // 绑定表单提交事件（防止回车提交）
    $('#addPackageForm').on('keypress', function(e) {
      if (e.which === 13) {
        e.preventDefault();
        return false;
      }
    });
  },
  
  // 打开模态框
  openModal: function() {
    // 重置表单
    $('#addPackageForm').trigger('reset');
    
    // 设置默认值
    $('#addPackageTotalHours').val(10);
    $('#addPackageStatusActive').prop('checked', true);
    
    // 打开模态框
    const addPackageModal = new bootstrap.Modal(document.getElementById('addPackageModal'));
    addPackageModal.show();
  },
  
  // 添加新课时包
  addNewPackage: function() {
    // 获取表单数据
    const name = $('#addPackageName').val().trim();
    const totalHours = parseFloat($('#addPackageTotalHours').val());
    const notes = $('#addPackageNotes').val().trim();
    const status = $('input[name="addPackageStatus"]:checked').val() || 'active';
    
    // 验证必填字段
    if (!name) {
      NotificationUtils.showAlert('请输入课时包名称', 'error');
      return;
    }
    
    if (isNaN(totalHours) || totalHours <= 0) {
      NotificationUtils.showAlert('总课时必须大于0', 'error');
      return;
    }
    
    // 构建课时包数据
    const packageData = {
      name: name,
      totalHours: totalHours,
      notes: notes,
      status: status
    };
    
    // 显示加载指示器
    NotificationUtils.showLoading('#addPackageModal .modal-body', '添加课时包中...');
    
    // 调用API添加课时包
    PackageAPI.addPackage(packageData)
      .then(newPackage => {
        // 显示成功消息
        NotificationUtils.showAlert('课时包添加成功', 'success');
        
        // 关闭模态框
        const addPackageModal = bootstrap.Modal.getInstance(document.getElementById('addPackageModal'));
        addPackageModal.hide();
        
        // 重置表单
        $('#addPackageForm').trigger('reset');
        
        // 重新加载课时包列表
        PackageTable.loadData();
      })
      .catch(error => {
        // 显示错误信息
        NotificationUtils.showAlert('添加课时包失败: ' + error.message, 'error');
      })
      .finally(() => {
        // 清除加载指示器
        NotificationUtils.clearLoading('#addPackageModal .modal-body');
      });
  }
}; 