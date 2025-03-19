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
  showLoading: function(selector = 'body', message = '加载中...') {
    // 确保 selector 不是 undefined 或 null
    if (!selector) {
      selector = 'body';
    }
    
    const $el = $(selector);
    
    // 创建全局加载指示器的HTML
    const spinnerHtml = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">${message}</p>
      </div>
    `;
    
    // 检查是否是模态框内部元素
    if (typeof selector === 'string' && selector.includes('Modal')) {
      // 对于模态框，只添加加载指示器而不清空内容
      $el.html(spinnerHtml);
    } else if (selector === 'body' || selector === document.body) {
      // 如果是 body，创建全屏加载遮罩
      if (!$('#fullScreenLoader').length) {
        $('body').append(`
          <div id="fullScreenLoader" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style="z-index: 9999;">
            ${spinnerHtml}
          </div>
        `);
      }
    } else {
      // 普通元素，替换内容
      $el.html(spinnerHtml);
    }
  },
  
  // 清除加载指示器
  clearLoading: function(selector) {
    // 如果没有提供选择器，清除全屏加载器
    if (!selector) {
      $('#fullScreenLoader').remove();
      return;
    }
    
    const $el = $(selector);
    if ($el.find('.spinner-border').length > 0) {
      $el.empty();
    }
  }
}; 