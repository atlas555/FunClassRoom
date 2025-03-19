/**
 * add-customer-modal.js - 处理添加客户模态框的功能
 */

// 添加客户模态框模块
const AddCustomerModal = {
  // 初始化模态框
  init: function() {
    // 绑定表单提交事件
    document.getElementById('studentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addCustomer();
    });
    
    // 设置默认日期为今天
    DateFormatterUtils.setInputToToday('birthdate');
    
    // 绑定"添加客户"按钮点击事件
    document.getElementById('openAddCustomerModalBtn').addEventListener('click', () => {
      // 加载课时包列表到下拉菜单
      this.loadCoursePackages();
    });
  },
  
  // 加载课时包列表
  loadCoursePackages: function() {
    const selectElement = document.getElementById('coursePackageSelect');
    selectElement.innerHTML = '<option value="">正在加载课时包...</option>';
    
    StudentAPI.getCoursePackages()
      .then(packages => {
        // 清空选择框
        selectElement.innerHTML = '<option value="">请选择课时包...</option>';
        
        if (!packages || packages.length === 0) {
          const defaultOption = document.createElement('option');
          defaultOption.value = "default";
          defaultOption.textContent = '默认课时包 (10课时)';
          selectElement.appendChild(defaultOption);
          return;
        }
        
        // 添加课时包选项
        packages.forEach(pkg => {
          const option = document.createElement('option');
          option.value = pkg.id;
          option.textContent = `${pkg.name} (${pkg.total_hours}课时)`;
          selectElement.appendChild(option);
        });
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = "default";
        defaultOption.textContent = '默认课时包 (10课时)';
        selectElement.appendChild(defaultOption);
      })
      .catch(error => {
        console.error('加载课时包列表失败:', error);
        selectElement.innerHTML = '<option value="default">默认课时包 (10课时)</option>';
      });
  },
  
  // 添加客户
  addCustomer: function() {
    // 获取表单数据
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const address = document.getElementById('address').value.trim();
    const notes = document.getElementById('notes').value.trim();
    const status = document.querySelector('input[name="status"]:checked')?.value || 'active';
    
    // 获取课时包相关数据
    const packageSelect = document.getElementById('coursePackageSelect');
    const packageId = packageSelect.value;
    
    // 验证必填字段
    if (!name) {
      NotificationUtils.showAlert('姓名不能为空', 'error');
      return;
    }
    
    if (!packageId) {
      NotificationUtils.showAlert('请选择课时包', 'error');
      return;
    }
    
    // 构建学生数据
    const studentData = {
      name,
      phone,
      email,
      birthdate: birthdate || null,
      address,
      notes,
      status
    };
    
    // 如果选择了课时包，添加课时包信息
    if (packageId === 'default') {
      // 使用默认课时包
      studentData.packageTotalHours = 10;
      
      // 设置默认购买日期为今天
      studentData.packagePurchaseDate = DateFormatterUtils.getTodayFormatted();
      
      // 设置默认过期日期为一年后
      studentData.packageExpireDate = DateFormatterUtils.getOneYearLaterFormatted();
    } else {
      // 使用选定的课时包，课时数从包中获取
      const selectedOption = packageSelect.options[packageSelect.selectedIndex];
      const packageText = selectedOption.textContent;
      const hoursMatch = packageText.match(/\((\d+)课时\)/);
      
      if (hoursMatch && hoursMatch[1]) {
        studentData.packageTotalHours = parseInt(hoursMatch[1]);
      } else {
        studentData.packageTotalHours = 10; // 默认值
      }
      
      // 设置购买日期为今天
      studentData.packagePurchaseDate = DateFormatterUtils.getTodayFormatted();
      
      // 设置过期日期为一年后
      studentData.packageExpireDate = DateFormatterUtils.getOneYearLaterFormatted();
      
      // 设置课时包ID
      studentData.packageId = packageId;
    }
    
    NotificationUtils.showLoading();
    
    // 调用API添加学生
    StudentAPI.addStudent(studentData)
      .then(newStudent => {
        NotificationUtils.showAlert('客户添加成功', 'success');
        
        // 关闭模态框
        const addCustomerModal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
        addCustomerModal.hide();
        
        // 重置表单
        document.getElementById('studentForm').reset();
        
        // 重新加载学生列表
        StudentTable.loadStudents();
      })
      .catch(error => {
        console.error('添加客户失败:', error);
        NotificationUtils.showAlert(error.message || '添加客户失败', 'error');
      })
      .finally(() => {
        NotificationUtils.clearLoading();
      });
  }
}; 