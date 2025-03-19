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
    
    // 绑定"添加客户"按钮点击事件
    $('#openAddCustomerModalBtn').on('click', this.loadCoursePackages.bind(this));
  },
  
  // 加载课时包列表
  loadCoursePackages: function() {
    const $select = $('#coursePackageSelect');
    $select.html('<option value="">正在加载课时包...</option>');
    
    StudentAPI.getCoursePackages()
      .then(packages => {
        if (packages.length === 0) {
          $select.html('<option value="">暂无可用的课时包</option>');
        } else {
          $select.empty();
          $select.append('<option value="">请选择课时包</option>');
          packages.forEach(pkg => {
            $select.append(`<option value="${pkg.id}">${pkg.name} (${pkg.totalHours}课时)</option>`);
          });
        }
      })
      .catch(error => {
        $select.html('<option value="">加载失败，请重试</option>');
        console.error('加载课时包失败:', error);
      });
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
    
    // 获取课时包相关数据
    const packageSelect = $('#coursePackageSelect');
    const packageId = packageSelect.val();
    
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
    
    let totalHours = 0;
    
    // 判断是否使用默认课时包
    if (!packageId || packageId === "default") {
      // 使用默认课时包，10课时
      totalHours = 10;
    } else {
      // 使用选定的课时包，课时数从包中获取
      const selectedOption = packageSelect.find('option:selected');
      const packageText = selectedOption.text();
      const hoursMatch = packageText.match(/\((\d+)课时\)/);
      
      if (hoursMatch && hoursMatch[1]) {
        totalHours = parseInt(hoursMatch[1]);
      } else {
        totalHours = 10; // 默认10课时
      }
    }
    
    // 添加课时包相关字段
    studentData.packageTotalHours = totalHours;
    studentData.packagePurchaseDate = DateFormatterUtils.getTodayFormatted();
    
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