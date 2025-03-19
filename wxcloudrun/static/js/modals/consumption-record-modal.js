/**
 * consumption-record-modal.js - 处理课消记录模态框的功能
 */

// 课消记录模态框模块
const ConsumptionRecordModal = {
  // 当前选中的包ID
  currentPackageId: null,
  
  // 初始化模态框
  init: function() {
    // 绑定包选择变更事件
    document.getElementById('consumptionPackageId').addEventListener('change', (e) => {
      this.currentPackageId = e.target.value;
      if (this.currentPackageId) {
        this.loadPackageDetails(this.currentPackageId);
      } else {
        // 清空包信息
        document.getElementById('consumptionTotalHours').value = '';
        document.getElementById('consumptionUsedHours').value = '';
        document.getElementById('consumptionRemainingHours').value = '';
      }
    });
    
    // 绑定保存按钮事件
    document.getElementById('saveConsumptionBtn').addEventListener('click', () => {
      this.saveConsumptionRecord();
    });
  },
  
  // 打开模态框
  open: function(studentId, studentName) {
    // 填充学生ID和姓名
    document.getElementById('consumptionStudentId').value = studentId;
    document.getElementById('consumptionStudentName').value = studentName;
    
    // 清空包信息
    document.getElementById('consumptionTotalHours').value = '';
    document.getElementById('consumptionUsedHours').value = '';
    document.getElementById('consumptionRemainingHours').value = '';
    
    // 设置默认消耗课时为1
    document.getElementById('consumptionHours').value = 1;
    
    // 加载学生的课时包
    RecordsHandler.refreshPackageDropdown(studentId);
    
    // 显示模态框
    const courseConsumptionModal = new bootstrap.Modal(document.getElementById('courseConsumptionModal'));
    courseConsumptionModal.show();
  },
  
  // 加载包详情
  loadPackageDetails: function(packageId) {
    NotificationUtils.showLoading();
    
    // 获取包详情
    StudentAPI.getPackage(packageId)
      .then(packageData => {
        // 填充包信息
        document.getElementById('consumptionTotalHours').value = packageData.total_hours;
        document.getElementById('consumptionUsedHours').value = packageData.used_hours;
        document.getElementById('consumptionRemainingHours').value = packageData.remaining_hours;
        
        // 设置默认消耗课时（如果包内剩余课时不足1小时，则使用剩余课时）
        const defaultHours = Math.min(1, packageData.remaining_hours);
        document.getElementById('consumptionHours').value = defaultHours;
        
        // 加载该包的历史课消记录
        RecordsHandler.loadStudentConsumptionRecords(packageData.student_id, packageId);
      })
      .catch(error => {
        console.error('加载课时包详情失败:', error);
        NotificationUtils.showAlert(error.message || '加载课时包详情失败', 'error');
      })
      .finally(() => {
        NotificationUtils.clearLoading();
      });
  },
  
  // 保存课消记录
  saveConsumptionRecord: function() {
    // 获取表单数据
    const studentId = document.getElementById('consumptionStudentId').value;
    const packageId = document.getElementById('consumptionPackageId').value;
    const consumedHours = parseFloat(document.getElementById('consumptionHours').value);
    const remainingHours = parseFloat(document.getElementById('consumptionRemainingHours').value);
    
    // 验证必填字段
    if (!packageId) {
      NotificationUtils.showAlert('请选择课时包', 'error');
      return;
    }
    
    if (isNaN(consumedHours) || consumedHours <= 0) {
      NotificationUtils.showAlert('请输入有效的消耗课时', 'error');
      return;
    }
    
    if (consumedHours > remainingHours) {
      NotificationUtils.showAlert('消耗课时不能大于剩余课时', 'error');
      return;
    }
    
    // 构建消费记录数据
    const consumptionData = {
      studentId: parseInt(studentId),
      packageId: parseInt(packageId),
      consumedHours
    };
    
    NotificationUtils.showLoading();
    
    // 调用API添加课消记录
    StudentAPI.addConsumptionRecord(consumptionData)
      .then(() => {
        NotificationUtils.showAlert('课消记录添加成功', 'success');
        
        // 重新加载包详情
        this.loadPackageDetails(packageId);
        
        // 刷新学生表格（更新剩余课时显示）
        StudentTable.refresh();
      })
      .catch(error => {
        console.error('添加课消记录失败:', error);
        NotificationUtils.showAlert(error.message || '添加课消记录失败', 'error');
      })
      .finally(() => {
        NotificationUtils.clearLoading();
      });
  }
}; 