/**
 * add-customer-modal.js - 处理添加客户模态框的功能
 */

// 添加客户模态框模块
const AddCustomerModal = {
  // 初始化模态框
  init: function() {
    // 绑定表单提交事件
    $('#studentForm').on('submit', (e) => {
      e.preventDefault();
      this.addCustomer();
    });
    
    // 设置默认日期为今天
    DateFormatterUtils.setInputToToday('birthdate');
  },
  
  // 添加客户
  addCustomer: function() {
    // 获取表单数据
    const name = $('#name').val().trim();
    const phone = $('#phone').val().trim();
    const email = $('#email').val().trim();
    const birthdate = $('#birthdate').val();
    const address = $('#address').val().trim();
    const notes = $('#notes').val().trim();
    const status = $('input[name="status"]:checked').val() || 'active';
    
    // 验证必填字段
    if (!name) {
      NotificationUtils.showAlert('姓名为必填字段！', 'error');
      return;
    }
    
    // 禁用提交按钮，显示加载状态
    const $btn = $('#submitCustomerBtn');
    const originalText = $btn.text();
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 提交中...');
    
    // 创建学生/客户数据
    const studentData = {
      name: name,
      phone: phone,
      email: email,
      birthdate: birthdate,
      address: address,
      notes: notes,
      status: status
    };
    
    // 调用API添加学生
    StudentAPI.addStudent(studentData)
      .then(newStudent => {
        // 显示成功消息
        NotificationUtils.showAlert('客户信息添加成功！', 'success');
        
        // 关闭模态框
        const addCustomerModal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
        addCustomerModal.hide();
        
        // 重置表单
        $('#studentForm').trigger('reset');
        
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 重新加载学生列表
        StudentTable.refresh();
      })
      .catch(error => {
        // 恢复按钮状态
        $btn.prop('disabled', false).text(originalText);
        
        // 显示错误消息
        NotificationUtils.showAlert(`添加客户失败: ${error.message}`, 'error');
      });
  }
}; 