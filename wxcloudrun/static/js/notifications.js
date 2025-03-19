/**
 * notifications.js - 处理通知、警告和提示消息
 */

// 通知和警告消息模块
const NotificationUtils = {
  // 显示警告消息
  showAlert: function(type, message) {
    const $alert = $(`
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    
    // 添加到页面
    const $container = $('.container').first();
    $container.prepend($alert);
    
    // 5秒后自动关闭
    setTimeout(() => {
      $alert.alert('close');
    }, 5000);
  },
  
  // 在模态框中显示警告消息
  showModalAlert: function(modalSelector, type, message) {
    const $modalBody = $(`${modalSelector} .modal-body`);
    const $existingAlert = $modalBody.find('.alert');
    
    // 如果已经有消息，则移除
    if ($existingAlert.length > 0) {
      $existingAlert.remove();
    }
    
    // 创建新的消息
    const $alert = $(`
      <div class="alert alert-${type} alert-dismissible fade show mb-3" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    
    // 添加到模态框
    $modalBody.prepend($alert);
    
    // 5秒后自动关闭
    setTimeout(() => {
      $alert.alert('close');
    }, 5000);
  },
  
  // 显示加载指示器
  showLoading: function(selector, message = '加载中...') {
    const $el = $(selector);
    
    // 检查是否是模态框内部元素
    if (selector.includes('Modal')) {
      // 对于模态框，只添加加载指示器而不清空内容
      $el.html(`
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">${message}</p>
        </div>
      `);
    } else {
      // 普通元素，替换内容
      $el.html(`
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">${message}</p>
        </div>
      `);
    }
  },
  
  // 清除加载指示器
  clearLoading: function(selector) {
    const $el = $(selector);
    if ($el.find('.spinner-border').length > 0) {
      $el.empty();
    }
  }
}; 