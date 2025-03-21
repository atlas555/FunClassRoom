/**
 * edit-personal-modal.js - 处理编辑客户个人信息模态框的功能
 */

// 编辑个人信息模态框模块
const EditPersonalModal = {
  // 初始化模态框
  init: function() {
    // 确保模态框正确初始化
    const modalEl = document.getElementById('editPersonalModal');
    if (modalEl) {
      // 显示事件 - 修复表单可能的显示问题
      modalEl.addEventListener('shown.bs.modal', function () {
        // 强制显示表单内容 - 添加安全检查
        const formEl = document.getElementById('editPersonalForm');
        if (formEl) {
          formEl.style.display = 'block';
        }
        
        // 聚焦到名称输入框 - 添加安全检查
        const nameInput = document.getElementById('editPersonalName');
        if (nameInput) {
          nameInput.focus();
        }
      });
    }
    
    // 绑定保存按钮事件
    const saveBtn = document.getElementById('savePersonalBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.savePersonalInfo();
      });
    }
    
    // 绑定表单提交事件（防止回车提交）
    const formEl = document.getElementById('editPersonalForm');
    if (formEl) {
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        this.savePersonalInfo();
      });
    }
  },
  
  // 保存个人信息
  savePersonalInfo: function() {
    // 获取表单数据 - 添加安全检查
    const studentIdEl = document.getElementById('editPersonalId');
    const nameEl = document.getElementById('editPersonalName');
    const phoneEl = document.getElementById('editPersonalPhone');
    const emailEl = document.getElementById('editPersonalEmail');
    const birthdateEl = document.getElementById('editPersonalBirthdate');
    const addressEl = document.getElementById('editPersonalAddress');
    const notesEl = document.getElementById('editPersonalNotes');
    
    // 如果关键元素不存在，则中止操作
    if (!nameEl) {
      console.error('表单元素未找到');
      return;
    }
    
    const studentId = studentIdEl ? studentIdEl.value : '';
    const name = nameEl.value.trim();
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const birthdate = birthdateEl ? birthdateEl.value : '';
    const address = addressEl ? addressEl.value.trim() : '';
    const notes = notesEl ? notesEl.value.trim() : '';
    const status = document.querySelector('input[name="editPersonalStatus"]:checked')?.value || 'active';
    
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
        $('#editPersonalModal').modal('hide');
        
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