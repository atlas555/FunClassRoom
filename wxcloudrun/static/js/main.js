/**
 * main.js - 主入口文件，初始化所有模块并处理页面级功能
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 创建Toast容器
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toastContainer';
  toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
  document.body.appendChild(toastContainer);
  
  // 初始化所有模块
  initializeModules();
  
  // 绑定标签页切换事件
  initializeTabSwitching();
});

// 初始化所有模块
function initializeModules() {
  // 初始化学生表格
  StudentTable.init();
  
  // 初始化课时包表格
  PackageTable.init();

  // 初始化各个模态框
  EditPersonalModal.init();
  ClassRecordModal.init();
  ConsumptionRecordModal.init();
  EditPackageModal.init();
  AddPackageModal.init();
  AddCustomerModal.init();
}

// 初始化标签页切换功能
function initializeTabSwitching() {
  // 切换到"客户信息"标签页
  document.getElementById('students-tab').addEventListener('click', function(e) {
    e.preventDefault();
    StudentTable.loadStudents();
  });
  
  // 切换到"课时包管理"标签页
  document.getElementById('packages-tab').addEventListener('click', function(e) {
    e.preventDefault();
    PackageTable.loadData();
  });
} 