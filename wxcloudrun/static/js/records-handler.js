/**
 * records-handler.js - 处理学生学习记录和课消记录功能
 */

// 学习记录处理模块
const RecordsHandler = {
  // 加载学生学习记录的函数
  loadStudentRecords: function(studentId) {
    NotificationUtils.showLoading('#recordsList', '加载历史记录中...');
    
    StudentAPI.getStudentRecords(studentId)
      .then(records => {
        const $recordsList = $('#recordsList');
        
        // 清除加载指示器
        NotificationUtils.clearLoading('#recordsList');
        
        // 清空现有记录
        $recordsList.empty();
        
        if (records.length === 0) {
          // 显示无记录消息
          $recordsList.html('<div class="text-center text-muted py-3" id="noRecordsMessage">暂无学习记录</div>');
          return;
        }
        
        // 添加记录
        records.forEach(record => {
          const formattedDate = DateFormatterUtils.formatDate(record.date);
          const $record = $(`
            <div class="list-group-item">
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">上课日期: ${formattedDate}</h6>
                <small class="text-muted">记录时间: ${DateFormatterUtils.formatDateTime(record.createdAt)}</small>
              </div>
              <div class="mt-2 record-content">${record.content}</div>
            </div>
          `);
          $recordsList.append($record);
        });
      })
      .catch(error => {
        // 清除加载指示器
        NotificationUtils.clearLoading('#recordsList');
        
        // 显示错误消息
        $('#recordsList').html(`<div class="text-center text-danger py-3">加载记录失败: ${error.message}</div>`);
      });
  },
  
  // 加载学生课消记录的函数
  loadStudentConsumptionRecords: function(studentId, packageId = null) {
    // 显示加载指示器
    NotificationUtils.showLoading('#consumptionRecordsList', '加载课消记录中...');
    
    // 调用API获取学生的课消记录
    StudentAPI.getStudentConsumptionRecords(studentId, packageId)
      .then(records => {
        const $recordsList = $('#consumptionRecordsList');
        
        // 清除加载指示器
        NotificationUtils.clearLoading('#consumptionRecordsList');
        
        // 清空现有记录
        $recordsList.empty();
        
        if (records.length === 0) {
          // 显示无记录消息
          $recordsList.html('<tr id="noConsumptionRecordsMessage"><td colspan="4" class="text-center text-muted py-3">暂无课消记录</td></tr>');
          return;
        }
        
        // 添加记录
        records.forEach(record => {
          const $record = $(`
            <tr>
              <td>${record.consumptionHours}</td>
              <td>${record.remainingHours}</td>
              <td>${DateFormatterUtils.formatDateTime(record.operationTime)}</td>
              <td>${record.operatorName || '系统'}</td>
            </tr>
          `);
          $recordsList.append($record);
        });
      })
      .catch(error => {
        // 清除加载指示器
        NotificationUtils.clearLoading('#consumptionRecordsList');
        
        // 显示错误消息
        $('#consumptionRecordsList').html(`<tr><td colspan="4" class="text-center text-danger py-3">加载记录失败: ${error.message}</td></tr>`);
      });
  },
  
  // 刷新课时包下拉框
  refreshPackageDropdown: function(studentId) {
    StudentAPI.getStudentPackages(studentId, true)
      .then(packages => {
        const $select = $('#consumptionPackageId');
        $select.empty();
        
        if (packages.length === 0) {
          $('#packageSelector').html(`
            <div class="alert alert-warning">
              该学生没有活跃的课时包，请先添加课时包
            </div>
          `);
          return;
        }
        
        // 填充课时包选择下拉框
        packages.forEach(pkg => {
          $select.append(`<option value="${pkg.id}" 
            data-total="${pkg.totalHours}"
            data-used="${pkg.usedHours}"
            data-remaining="${pkg.remainingHours}">
            课时包 #${pkg.id} (剩余: ${pkg.remainingHours} 课时)
          </option>`);
        });
        
        // 绑定课时包选择变更事件
        $select.off('change').on('change', function() {
          const $selectedOption = $(this).find('option:selected');
          const packageId = $(this).val();
          
          if (!packageId) {
            return;
          }
          
          // 更新课时信息显示
          $('#consumptionTotalHours').val($selectedOption.data('total'));
          $('#consumptionUsedHours').val($selectedOption.data('used'));
          $('#consumptionRemainingHours').val($selectedOption.data('remaining'));
          
          // 加载选中课时包的课消记录
          RecordsHandler.loadStudentConsumptionRecords($('#consumptionStudentId').val(), packageId);
        });
        
        // 触发课时包选择事件
        $select.trigger('change');
      })
      .catch(error => {
        console.error('刷新课时包列表失败:', error);
      });
  }
}; 