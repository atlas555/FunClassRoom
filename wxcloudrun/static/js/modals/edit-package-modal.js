/**
 * edit-package-modal.js - 处理编辑课时包模态框的功能
 */

// 编辑课时包模态框模块
const EditPackageModal = {
  // 初始化模态框
  init: function() {
    // 绑定保存按钮事件
    document.getElementById('savePackageBtn').addEventListener('click', () => {
      this.savePackage();
    });
    
    // 监听总课时修改，自动计算剩余课时
    document.getElementById('editPackageTotalHours').addEventListener('change', () => {
      this.recalculateRemainingHours();
    });
    
    // 绑定表单提交事件（防止回车提交）
    document.getElementById('editPackageForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePackage();
    });
  },
  
  // 重新计算剩余课时
  recalculateRemainingHours: function() {
    const totalHours = parseFloat(document.getElementById('editPackageTotalHours').value) || 0;
    const usedHours = parseFloat(document.getElementById('editPackageUsedHours').value) || 0;
    const remainingHours = Math.max(0, totalHours - usedHours);
    
    document.getElementById('editPackageRemainingHours').value = remainingHours;
  },
  
  // 保存课时包
  savePackage: function() {
    // 获取表单数据
    const packageId = document.getElementById('editPackageId').value;
    const totalHours = parseFloat(document.getElementById('editPackageTotalHours').value);
    const notes = document.getElementById('editPackageNotes').value.trim();
    const status = document.querySelector('input[name="editPackageStatus"]:checked')?.value || 'active';
    
    // 验证必填字段
    if (isNaN(totalHours) || totalHours <= 0) {
      NotificationUtils.showAlert('总课时必须大于0', 'error');
      return;
    }
    
    // if (!purchaseDate) {
    //   NotificationUtils.showAlert('请选择购买日期', 'error');
    //   return;
    // }
    
    // 构建更新数据
    const packageData = {
      totalHours,
    //   purchaseDate,
    //   expireDate: expireDate || null,
      notes,
      status
    };
    
    NotificationUtils.showLoading();
    
    // 调用API更新课时包
    StudentAPI.updatePackage(packageId, packageData)
      .then(updatedPackage => {
        NotificationUtils.showAlert('课时包更新成功', 'success');
        
        // 关闭模态框
        const editPackageModal = bootstrap.Modal.getInstance(document.getElementById('editPackageModal'));
        editPackageModal.hide();
        
        // 重新加载课时包列表
        PackageTable.loadData();
        
        // // 如果学生表格也在显示，刷新学生列表
        // if (document.querySelector('#myTab button.active')?.id === 'students-tab') {
        //   StudentTable.loadStudents();
        // }
      })
      .catch(error => {
        console.error('更新课时包失败:', error);
        NotificationUtils.showAlert(error.message || '更新课时包失败', 'error');
      })
      .finally(() => {
        NotificationUtils.clearLoading();
      });
  }
}; 