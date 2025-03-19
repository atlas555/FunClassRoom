/**
 * utils.js - 通用工具函数集合
 * 提供全局可用的辅助函数
 */

// 表单处理工具
const FormUtils = {
  // 序列化表单为对象
  serializeForm: function(formElement) {
    const formData = new FormData(formElement);
    const result = {};
    
    for (const [key, value] of formData.entries()) {
      result[key] = value;
    }
    
    return result;
  },
  
  // 设置表单值
  setFormValues: function(formElement, values) {
    for (const [key, value] of Object.entries(values)) {
      const field = formElement.elements[key];
      
      if (field) {
        if (field.type === 'radio') {
          const radio = formElement.querySelector(`input[name="${key}"][value="${value}"]`);
          if (radio) radio.checked = true;
        } else if (field.type === 'checkbox') {
          field.checked = !!value;
        } else {
          field.value = value || '';
        }
      }
    }
  },
  
  // 验证表单必填字段
  validateRequiredFields: function(formElement, requiredFields) {
    let isValid = true;
    const errors = {};
    
    requiredFields.forEach(field => {
      const element = formElement.elements[field.name];
      let value = element ? element.value : null;
      
      if (element && element.type === 'checkbox') {
        value = element.checked;
      }
      
      if (!value) {
        isValid = false;
        errors[field.name] = field.message || '此字段为必填项';
        
        // 添加错误样式
        element.classList.add('is-invalid');
        
        // 添加错误提示
        let feedbackElement = element.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
          feedbackElement = document.createElement('div');
          feedbackElement.className = 'invalid-feedback';
          element.parentNode.insertBefore(feedbackElement, element.nextSibling);
        }
        feedbackElement.textContent = errors[field.name];
      } else {
        // 移除错误样式
        element.classList.remove('is-invalid');
      }
    });
    
    return { isValid, errors };
  },
  
  // 清空表单验证状态
  clearValidation: function(formElement) {
    const invalidFields = formElement.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
      field.classList.remove('is-invalid');
      
      // 移除错误提示
      const feedbackElement = field.nextElementSibling;
      if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
        feedbackElement.textContent = '';
      }
    });
  },
  
  // 重置表单
  resetForm: function(formElement) {
    formElement.reset();
    this.clearValidation(formElement);
    
    // 清除表单中的自定义内容
    formElement.querySelectorAll('.custom-content').forEach(element => {
      element.innerHTML = '';
    });
  }
};

// 字符串处理工具
const StringUtils = {
  // 安全地获取嵌套对象的属性
  getProperty: function(obj, path, defaultValue = '') {
    return path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), obj);
  },
  
  // 截断字符串到指定长度
  truncate: function(str, maxLength, suffix = '...') {
    if (!str || str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength) + suffix;
  },
  
  // 将字符串转换为安全的ID
  toSafeId: function(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '_');
  },
  
  // 将数字格式化为带有千位分隔符的字符串
  formatNumber: function(num) {
    return new Intl.NumberFormat('zh-CN').format(num);
  },
  
  // 格式化金额
  formatCurrency: function(amount) {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
  }
};

// 数组与对象处理工具
const ArrayUtils = {
  // 通过ID查找数组中的对象
  findById: function(array, id) {
    return array.find(item => item.id === id);
  },
  
  // 将数组按指定字段分组
  groupBy: function(array, key) {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },
  
  // 排序数组
  sortBy: function(array, key, ascending = true) {
    return [...array].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      
      if (valueA < valueB) {
        return ascending ? -1 : 1;
      }
      if (valueA > valueB) {
        return ascending ? 1 : -1;
      }
      return 0;
    });
  },
  
  // 从数组中删除指定索引的元素
  removeAtIndex: function(array, index) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  },
  
  // 从数组中删除具有指定ID的元素
  removeById: function(array, id) {
    const index = array.findIndex(item => item.id === id);
    return index !== -1 ? this.removeAtIndex(array, index) : [...array];
  }
};

// DOM操作工具
const DOMUtils = {
  // 创建元素并设置属性和内容
  createElement: function(tag, options = {}) {
    const element = document.createElement(tag);
    
    // 设置属性
    if (options.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        element.setAttribute(key, value);
      }
    }
    
    // 设置类名
    if (options.classes) {
      if (Array.isArray(options.classes)) {
        element.classList.add(...options.classes);
      } else {
        element.className = options.classes;
      }
    }
    
    // 设置文本内容
    if (options.text) {
      element.textContent = options.text;
    }
    
    // 设置HTML内容
    if (options.html) {
      element.innerHTML = options.html;
    }
    
    // 添加子元素
    if (options.children) {
      options.children.forEach(child => {
        element.appendChild(child);
      });
    }
    
    return element;
  },
  
  // 显示元素
  showElement: function(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.style.display = '';
    }
  },
  
  // 隐藏元素
  hideElement: function(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.style.display = 'none';
    }
  },
  
  // 切换元素可见性
  toggleElement: function(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      if (element.style.display === 'none') {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    }
  },
  
  // 滚动到指定元素
  scrollToElement: function(element, options = {}) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      };
      element.scrollIntoView({ ...defaultOptions, ...options });
    }
  },
  
  // 获取URL参数
  getUrlParameter: function(name) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(name);
  }
};

// 本地存储工具
const StorageUtils = {
  // 保存数据到localStorage
  saveData: function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('保存到localStorage失败:', error);
      return false;
    }
  },
  
  // 从localStorage获取数据
  getData: function(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('从localStorage获取数据失败:', error);
      return defaultValue;
    }
  },
  
  // 从localStorage删除数据
  removeData: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('从localStorage删除数据失败:', error);
      return false;
    }
  },
  
  // 清空localStorage
  clearAll: function() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空localStorage失败:', error);
      return false;
    }
  }
};

// 日期格式化工具
const DateUtils = {
  // 格式化日期为本地日期字符串（YYYY-MM-DD）
  formatDate: function(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  },
  
  // 格式化日期时间为本地日期时间字符串（YYYY-MM-DD HH:MM:SS）
  formatDateTime: function(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  },
  
  // 设置日期输入字段的默认值为今天
  setDateInputToToday: function(inputId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    document.getElementById(inputId).value = `${year}-${month}-${day}`;
  },
  
  // 设置日期输入字段的值
  setDateInputValue: function(inputId, dateStr) {
    if (!dateStr) {
      document.getElementById(inputId).value = '';
      return;
    }
    
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    document.getElementById(inputId).value = `${year}-${month}-${day}`;
  },
  
  // 计算默认的过期日期（今天 + 1年）
  calculateDefaultExpireDate: function() {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    const year = nextYear.getFullYear();
    const month = String(nextYear.getMonth() + 1).padStart(2, '0');
    const day = String(nextYear.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
};

// UI工具
const UIUtils = {
  // 创建分页控件
  createPagination: function(paginationData, elementSelector, onPageChange) {
    const { page, pages, total } = paginationData;
    const paginationElement = document.querySelector(elementSelector);
    
    if (!paginationElement) return;
    
    // 总记录数显示
    const totalRecordsElement = document.getElementById(elementSelector === '.pagination' ? 'totalRecords' : 'totalPackages');
    if (totalRecordsElement) {
      totalRecordsElement.textContent = total;
    }
    
    // 清空现有分页控件
    paginationElement.innerHTML = '';
    
    // 添加"上一页"按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${page <= 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.textContent = '上一页';
    if (page > 1) {
      prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        onPageChange(page - 1);
      });
    } else {
      prevLink.setAttribute('tabindex', '-1');
      prevLink.setAttribute('aria-disabled', 'true');
    }
    prevLi.appendChild(prevLink);
    paginationElement.appendChild(prevLi);
    
    // 计算需要显示的页码范围
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(pages, startPage + 4);
    
    // 如果页码范围不够5个，重新调整
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
      const pageLi = document.createElement('li');
      pageLi.className = `page-item ${i === page ? 'active' : ''}`;
      const pageLink = document.createElement('a');
      pageLink.className = 'page-link';
      pageLink.href = '#';
      pageLink.textContent = i;
      if (i === page) {
        pageLink.setAttribute('aria-current', 'page');
      } else {
        pageLink.addEventListener('click', (e) => {
          e.preventDefault();
          onPageChange(i);
        });
      }
      pageLi.appendChild(pageLink);
      paginationElement.appendChild(pageLi);
    }
    
    // 添加"下一页"按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${page >= pages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.textContent = '下一页';
    if (page < pages) {
      nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        onPageChange(page + 1);
      });
    } else {
      nextLink.setAttribute('tabindex', '-1');
      nextLink.setAttribute('aria-disabled', 'true');
    }
    nextLi.appendChild(nextLink);
    paginationElement.appendChild(nextLi);
  },
  
  // 显示提示消息
  showToast: function(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      // 创建一个toast容器
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(container);
    }
    
    const toastId = `toast-${Date.now()}`;
    const toastHtml = `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} text-white">
          <strong class="me-auto">${type === 'success' ? '成功' : type === 'error' ? '错误' : '提示'}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    
    document.getElementById('toastContainer').insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();
    
    // 自动删除toast元素
    toastElement.addEventListener('hidden.bs.toast', function() {
      toastElement.remove();
    });
  },
  
  // 设置状态标签内容和样式
  setStatusBadge: function(statusText, type = 'student') {
    let badgeClass = '';
    let text = statusText;
    
    if (type === 'student') {
      // 学生状态
      switch (statusText) {
        case 'active':
          badgeClass = 'bg-success';
          text = '活跃';
          break;
        case 'inactive':
          badgeClass = 'bg-secondary';
          text = '已结课';
          break;
        case 'new':
          badgeClass = 'bg-primary';
          text = '新客户';
          break;
        default:
          badgeClass = 'bg-info';
          text = statusText;
      }
    } else if (type === 'package') {
      // 课时包状态
      switch (statusText) {
        case 'active':
          badgeClass = 'bg-success';
          text = '活跃';
          break;
        case 'expired':
          badgeClass = 'bg-warning text-dark';
          text = '已过期';
          break;
        case 'used':
          badgeClass = 'bg-secondary';
          text = '已用完';
          break;
        default:
          badgeClass = 'bg-info';
          text = statusText;
      }
    }
    
    return `<span class="badge ${badgeClass}">${text}</span>`;
  },
  
  // 显示加载中遮罩
  showLoading: function() {
    // 检查是否已存在加载遮罩
    if (document.getElementById('loadingSpinner')) {
      return;
    }
    
    const spinnerHtml = `
      <div id="loadingSpinner" class="loading-spinner">
        <div class="spinner-overlay"></div>
        <div class="spinner-content">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">加载中...</span>
          </div>
          <div class="mt-2">加载中...</div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', spinnerHtml);
  },
  
  // 隐藏加载中遮罩
  hideLoading: function() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.remove();
    }
  },
  
  // 展示确认对话框
  showConfirm: function(title, message, onConfirm, onCancel) {
    // 检查是否已存在确认框
    if (document.getElementById('confirmModal')) {
      document.getElementById('confirmModal').remove();
    }
    
    const modalHtml = `
      <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="confirmModalLabel">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${message}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="confirmCancelBtn" data-bs-dismiss="modal">取消</button>
              <button type="button" class="btn btn-primary" id="confirmOkBtn">确认</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModal.show();
    
    // 绑定确认按钮事件
    document.getElementById('confirmOkBtn').addEventListener('click', function() {
      confirmModal.hide();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
    
    // 绑定取消按钮事件
    document.getElementById('confirmCancelBtn').addEventListener('click', function() {
      if (typeof onCancel === 'function') {
        onCancel();
      }
    });
    
    // 模态框关闭后自动删除
    document.getElementById('confirmModal').addEventListener('hidden.bs.modal', function() {
      document.getElementById('confirmModal').remove();
    });
  }
}; 