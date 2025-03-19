/**
 * edit-personal-modal.js - 处理编辑客户个人信息模态框的功能
 */

// 编辑个人信息模态框模块
const EditPersonalModal = {
  // 初始化模态框
  init: function() {
    // 绑定保存按钮事件
    document.getElementById('savePersonalBtn').addEventListener('click', () => {
      this.savePersonalInfo();
    });
    
    // 绑定表单提交事件（防止回车提交）
    document.getElementById('editPersonalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePersonalInfo();
    });
  },
  
  // 保存个人信息
  savePersonalInfo: function() {
    // 获取表单数据
    const studentId = document.getElementById('editId').value;
    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const birthdate = document.getElementById('editBirthdate').value;
    const address = document.getElementById('editAddress').value.trim();
    const notes = document.getElementById('editNotes').value.trim();
    const status = document.querySelector('input[name="editStatus"]:checked')?.value || 'active';
    
    // 验证必填字段
    if (!name) {
      NotificationUtils.showAlert('姓名不能为空', 'error');
      return;
    }
    
    // 构建更新数据
    const studentData = {
      name,
      phone,
      email,
      birthdate: birthdate || null,
      address,
      notes,
      status
    };
    
    NotificationUtils.showLoading();
    
    // 调用API更新学生信息
    StudentAPI.updateStudent(studentId, studentData)
      .then(() => {
        NotificationUtils.showAlert('客户信息更新成功', 'success');
        
        // 关闭模态框
        const editPersonalModal = bootstrap.Modal.getInstance(document.getElementById('editPersonalModal'));
        editPersonalModal.hide();
        
        // 重新加载学生列表
        StudentTable.refresh();
      })
      .catch(error => {
        console.error('更新客户信息失败:', error);
        NotificationUtils.showAlert(error.message || '更新客户信息失败', 'error');
      })
      .finally(() => {
        NotificationUtils.clearLoading();
      });
  }
}; 