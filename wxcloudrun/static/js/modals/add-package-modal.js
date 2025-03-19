/**
 * add-package-modal.js - 处理添加课时包模态框的功能
 */

// 添加课时包模态框模块
const AddPackageModal = {
  // 初始化模态框
  init: function() {
    // 绑定"添加课时包"按钮点击事件
    document.getElementById('openAddPackageModalBtn')?.addEventListener('click', () => {
      this.openModal();
    });
    
    // 绑定添加按钮事件
    document.getElementById('addNewPackageBtn').addEventListener('click', () => {
      this.addNewPackage();
    });
    
    // 绑定表单提交事件（防止回车提交）
    document.getElementById('addPackageForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addNewPackage();
    });
  },
  
  // 打开模态框
  openModal: function() {
    // 重置表单
    document.getElementById('addPackageForm')?.reset();
    
    // 打开模态框
    const addPackageModal = new bootstrap.Modal(document.getElementById('addPackageModal'));
    addPackageModal.show();
  },
  
  // 添加新课时包
  addNewPackage: function() {
    // 获取表单数据
    const totalHours = parseFloat(document.getElementById('addPackageTotalHours').value);
    const notes = document.getElementById('addPackageNotes').value.trim();
    
    if (isNaN(totalHours) || totalHours <= 0) {
      NotificationUtils.showAlert('总课时必须大于0', 'error');
      return;
    }
    
    // 构建课时包数据
    const packageData = {
    //   studentId: parseInt(studentId),
      totalHours,
      notes,
      status: 'active'
    };
    
    NotificationUtils.showLoading();
    
    // 调用API添加课时包
    StudentAPI.addPackage(packageData)
      .then(newPackage => {
        NotificationUtils.showAlert('课时包添加成功', 'success');
        
        // 关闭模态框
        const addPackageModal = bootstrap.Modal.getInstance(document.getElementById('addPackageModal'));
        addPackageModal.hide();
        
        // 重置表单
        document.getElementById('addPackageForm').reset();
        
        // 重新加载课时包列表
        PackageTable.loadData();
        
      })
      .catch(error => {
        console.error('添加课时包失败:', error);
        NotificationUtils.showAlert(error.message || '添加课时包失败', 'error');
      })
      .finally(() => {
        NotificationUtils.clearLoading();
      });
  }
}; 