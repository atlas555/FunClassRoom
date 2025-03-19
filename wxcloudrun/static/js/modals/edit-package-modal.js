/**
 * edit-package-modal.js - 处理编辑课时包模态框的功能
 */

// 编辑课时包模态框模块
const EditPackageModal = {
  init: function() {
    this.bindEvents();
  },
  
  bindEvents: function() {
    // 保存课时包信息
    $('#savePackageBtn').on('click', this.savePackage.bind(this));
    
    // 更新总课时时，重新计算剩余课时
    $('#editPackageTotalHours').on('change', this.recalculateRemainingHours);
    
    // 阻止回车提交表单
    $('#editPackageForm').on('keypress', function(e) {
      if (e.which === 13) {
        e.preventDefault();
        return false;
      }
    });
  },
  
  // 根据总课时和已用课时重新计算剩余课时
  recalculateRemainingHours: function() {
    const totalHours = parseFloat($('#editPackageTotalHours').val()) || 0;
    const usedHours = parseFloat($('#editPackageUsedHours').val()) || 0;
    const remainingHours = totalHours - usedHours;
    
    $('#editPackageRemainingHours').val(remainingHours.toFixed(1));
  },
  
  // 保存课时包
  savePackage: function() {
    // 获取表单数据
    const id = $('#editPackageId').val();
    const name = $('#editPackageName').val().trim();
    const totalHours = parseFloat($('#editPackageTotalHours').val());
    const purchaseDate = $('#editPackagePurchaseDate').val();
    const expireDate = $('#editPackageExpireDate').val() || null;
    const status = $('input[name="editPackageStatus"]:checked').val() || 'active';
    const notes = $('#editPackageNotes').val().trim();
    
    // 验证必填字段
    if (!name) {
      NotificationUtils.showAlert('请输入课时包名称', 'error');
      return;
    }
    
    if (isNaN(totalHours) || totalHours <= 0) {
      NotificationUtils.showAlert('请输入有效的总课时数', 'error');
      return;
    }
    
    if (!purchaseDate) {
      NotificationUtils.showAlert('请选择购买日期', 'error');
      return;
    }
    
    // 构造数据对象
    const packageData = {
      name: name,
      totalHours: totalHours,
      purchaseDate: purchaseDate,
      expireDate: expireDate,
      status: status,
      notes: notes
    };
    
    // 显示加载指示器
    NotificationUtils.showLoading('#editPackageModal .modal-body', '保存课时包数据中...');
    
    // 调用API更新课时包
    PackageAPI.updatePackage(id, packageData)
      .then(() => {
        // 关闭模态框
        const editPackageModal = bootstrap.Modal.getInstance(document.getElementById('editPackageModal'));
        editPackageModal.hide();
        
        // 显示成功消息
        NotificationUtils.showAlert('课时包已成功更新', 'success');
        
        // 重新加载课时包列表
        PackageTable.loadData();
      })
      .catch(error => {
        // 显示错误信息
        NotificationUtils.showAlert('更新课时包失败: ' + error.message, 'error');
      })
      .finally(() => {
        // 清除加载指示器
        NotificationUtils.clearLoading('#editPackageModal .modal-body');
      });
  }
}; 