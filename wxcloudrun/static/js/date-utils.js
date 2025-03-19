/**
 * date-utils.js - 处理日期格式化和日期相关工具函数
 */

// 日期工具模块
const DateFormatterUtils = {
  // 日期格式化函数
  formatDate: function(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  },
  
  // 日期时间格式化函数
  formatDateTime: function(dateTimeString) {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // 获取今天的日期，格式为 YYYY-MM-DD
  getTodayFormatted: function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 获取一年后的日期，格式为 YYYY-MM-DD
  getOneYearLaterFormatted: function() {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 设置日期输入控件的默认值为今天
  setInputToToday: function(inputSelector) {
    const today = this.getTodayFormatted();
    
    // 确保选择器是有效的，如果传入的只是ID，添加#前缀
    let selector = inputSelector;
    if (!selector.startsWith('#') && !selector.startsWith('.') && !selector.includes('[')) {
      selector = '#' + selector;
    }
    
    // 查找元素并安全地设置值
    const inputElement = document.querySelector(selector);
    if (inputElement) {
      inputElement.value = today;
    } else {
      console.warn(`日期设置警告: 未找到元素 "${selector}"`);
    }
  }
}; 