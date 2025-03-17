/**
 * student.js - 处理学生/客户管理系统的API请求和交互
 */

// 模拟数据 - 在实际应用中，这些数据会从服务器获取
const mockStudents = [
  {
    id: 1,
    name: "张三",
    phone: "13800138000",
    email: "zhangsan@example.com",
    birthdate: "1990-05-15",
    remainingHours: 15,
    usedHours: 5,
    totalHours: 20,
    registerDate: "2023-01-15",
    lastClassDate: "2023-05-20",
    address: "北京市海淀区",
    notes: "对英语很感兴趣，希望提高口语能力",
    status: "active"
  },
  {
    id: 2,
    name: "李四",
    phone: "13900139000",
    email: "lisi@example.com",
    birthdate: "1992-08-20",
    remainingHours: 8,
    usedHours: 12,
    totalHours: 20,
    registerDate: "2023-02-10",
    lastClassDate: "2023-05-18",
    address: "北京市朝阳区",
    notes: "工作需要，主要学习商务英语",
    status: "active"
  },
  {
    id: 3,
    name: "王五",
    phone: "13700137000",
    email: "wangwu@example.com",
    birthdate: "1985-12-10",
    remainingHours: 0,
    usedHours: 20,
    totalHours: 20,
    registerDate: "2022-11-05",
    lastClassDate: "2023-04-10",
    address: "北京市西城区",
    notes: "已完成所有课程",
    status: "inactive"
  },
  {
    id: 4,
    name: "赵六",
    phone: "13600136000",
    email: "zhaoliu@example.com",
    birthdate: "1995-03-25",
    remainingHours: 20,
    usedHours: 0,
    totalHours: 20,
    registerDate: "2023-05-01",
    lastClassDate: null,
    address: "北京市东城区",
    notes: "新客户，尚未开始上课",
    status: "new"
  }
];

// 模拟课程记录数据
const mockClassRecords = {
  1: [
    {
      id: 101,
      studentId: 1,
      studentName: "张三",
      date: "2023-05-20",
      content: "<p>今天学习了<strong>现在完成时</strong>的用法，学生掌握得不错。</p><p>作业：完成教材第35页的练习。</p>",
      createdAt: "2023-05-20T15:30:00Z"
    },
    {
      id: 102,
      studentId: 1,
      studentName: "张三",
      date: "2023-05-13",
      content: "<p>复习了<strong>过去时</strong>和<strong>现在时</strong>的区别。</p><ul><li>重点讲解了时态的选择</li><li>进行了口语练习</li></ul>",
      createdAt: "2023-05-13T16:00:00Z"
    }
  ],
  2: [
    {
      id: 201,
      studentId: 2,
      studentName: "李四",
      date: "2023-05-18",
      content: "<p>商务英语课程：</p><ol><li>邮件写作技巧</li><li>会议用语</li></ol><p>学生表现积极，需要加强邮件格式的练习。</p>",
      createdAt: "2023-05-18T10:15:00Z"
    }
  ],
  3: [
    {
      id: 301,
      studentId: 3,
      studentName: "王五",
      date: "2023-04-10",
      content: "<p>最后一节课，进行了<strong>总结复习</strong>。</p><p>学生已完成所有课程内容，建议后续可以参加口语角活动。</p>",
      createdAt: "2023-04-10T14:00:00Z"
    }
  ]
};

// API 请求函数 - 在实际应用中，这些函数会发送真实的AJAX请求
const StudentAPI = {
  // 获取所有学生
  getAllStudents: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockStudents);
      }, 300); // 模拟网络延迟
    });
  },
  
  // 获取单个学生信息
  getStudent: function(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = mockStudents.find(s => s.id === parseInt(id));
        if (student) {
          resolve(student);
        } else {
          reject(new Error('学生不存在'));
        }
      }, 200);
    });
  },
  
  // 添加新学生
  addStudent: function(studentData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = mockStudents.length > 0 ? Math.max(...mockStudents.map(s => s.id)) + 1 : 1;
        const newStudent = {
          id: newId,
          ...studentData,
          registerDate: new Date().toISOString().split('T')[0],
          lastClassDate: null
        };
        mockStudents.push(newStudent);
        resolve(newStudent);
      }, 300);
    });
  },
  
  // 更新学生信息
  updateStudent: function(id, studentData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockStudents.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
          mockStudents[index] = { ...mockStudents[index], ...studentData };
          resolve(mockStudents[index]);
        } else {
          reject(new Error('学生不存在'));
        }
      }, 300);
    });
  },
  
  // 获取学生的课程记录
  getStudentRecords: function(studentId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = mockClassRecords[studentId] || [];
        resolve(records);
      }, 200);
    });
  },
  
  // 添加课程记录
  addClassRecord: function(recordData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const studentId = parseInt(recordData.studentId);
        if (!mockClassRecords[studentId]) {
          mockClassRecords[studentId] = [];
        }
        
        const newId = Date.now();
        const newRecord = {
          id: newId,
          ...recordData,
          createdAt: new Date().toISOString()
        };
        
        // 添加到记录开头（最新的记录在前）
        mockClassRecords[studentId].unshift(newRecord);
        
        // 更新学生的最后上课日期
        const studentIndex = mockStudents.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
          mockStudents[studentIndex].lastClassDate = recordData.date;
        }
        
        resolve(newRecord);
      }, 300);
    });
  }
};

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化学生表格
  initStudentTable();
  
  // 初始化Quill富文本编辑器
  const quill = new Quill('#classContentEditor', {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['clean']
      ]
    },
    placeholder: '请输入学习内容...'
  });
  
  // 状态筛选功能
  $('#statusFilter').on('change', function() {
    const selectedStatus = $(this).val();
    
    if (selectedStatus === 'all') {
      // 显示所有行
      $('#studentsTable tbody tr').show();
    } else {
      // 隐藏所有行，然后只显示匹配的行
      $('#studentsTable tbody tr').hide();
      $('#studentsTable tbody tr[data-status="' + selectedStatus + '"]').show();
    }
  });
  
  // 编辑个人按钮点击事件
  $(document).on('click', '.btn-outline-primary', function() {
    // 获取当前行
    const $row = $(this).closest('tr');
    
    // 获取学生ID
    const id = parseInt($row.find('th').text());
    
    // 从API获取学生详细信息
    StudentAPI.getStudent(id)
      .then(student => {
        // 填充表单
        $('#editId').val(student.id);
        $('#editName').val(student.name);
        $('#editPhone').val(student.phone);
        $('#editBirthdate').val(student.birthdate);
        $('#editTotalHours').val(student.totalHours);
        $('#editUsedHours').val(student.usedHours);
        $('#editAddress').val(student.address);
        $('#editNotes').val(student.notes);
        
        // 设置状态单选按钮
        $(`#editStatus${student.status.charAt(0).toUpperCase() + student.status.slice(1)}`).prop('checked', true);
        
        // 显示模态框
        const editModal = new bootstrap.Modal(document.getElementById('editPersonalModal'));
        editModal.show();
      })
      .catch(error => {
        console.error('获取学生信息失败:', error);
        alert('获取学生信息失败，请重试');
      });
  });
  
  // 录入上课记录按钮点击事件
  $(document).on('click', '.btn-outline-success', function() {
    // 获取当前行
    const $row = $(this).closest('tr');
    
    // 获取学生ID和姓名
    const id = parseInt($row.find('th').text());
    const name = $row.find('td:eq(0)').text();
    
    // 设置模态框标题和隐藏字段
    $('#classRecordModalLabel').text(`录入上课记录 - ${name}`);
    $('#recordStudentId').val(id);
    $('#recordStudentName').val(name);
    
    // 设置今天的日期为默认值
    const today = new Date().toISOString().split('T')[0];
    $('#classDate').val(today);
    
    // 清空编辑器内容
    quill.setText('');
    
    // 加载并显示该学生的历史记录
    loadStudentRecords(id);
    
    // 显示模态框
    const recordModal = new bootstrap.Modal(document.getElementById('classRecordModal'));
    recordModal.show();
  });
  
  // 保存记录按钮点击事件
  $('#saveRecordBtn').on('click', function() {
    const studentId = parseInt($('#recordStudentId').val());
    const studentName = $('#recordStudentName').val();
    const classDate = $('#classDate').val();
    const content = quill.root.innerHTML;
    const contentText = quill.getText().trim();
    
    // 验证输入
    if (!classDate) {
      alert('请选择上课日期');
      return;
    }
    
    if (!contentText) {
      alert('请输入学习内容');
      return;
    }
    
    // 创建记录数据
    const recordData = {
      studentId,
      studentName,
      date: classDate,
      content
    };
    
    // 调用API保存记录
    StudentAPI.addClassRecord(recordData)
      .then(() => {
        // 更新表格中的最近上课日期
        const $row = $(`#studentsTable tbody tr:nth-child(${studentId})`);
        $row.find('td:eq(5)').text(formatDate(classDate));
        
        // 重新加载记录列表
        loadStudentRecords(studentId);
        
        // 清空编辑器
        quill.setText('');
        
        // 显示成功消息
        alert('上课记录保存成功！');
      })
      .catch(error => {
        console.error('保存记录失败:', error);
        alert('保存记录失败，请重试');
      });
  });
  
  // 保存个人信息按钮点击事件
  $('#savePersonalBtn').on('click', function() {
    // 获取表单数据
    const id = parseInt($('#editId').val());
    const name = $('#editName').val();
    const phone = $('#editPhone').val();
    const birthdate = $('#editBirthdate').val();
    const totalHours = parseInt($('#editTotalHours').val());
    const usedHours = parseInt($('#editUsedHours').val());
    const remainingHours = totalHours - usedHours;
    const address = $('#editAddress').val();
    const notes = $('#editNotes').val();
    const status = $('input[name="editStatus"]:checked').val();
    
    // 验证必填字段
    if (!name || !phone || isNaN(totalHours) || isNaN(usedHours)) {
      alert('请填写必填字段！');
      return;
    }
    
    // 创建更新数据
    const studentData = {
      name,
      phone,
      birthdate,
      totalHours,
      usedHours,
      remainingHours,
      address,
      notes,
      status
    };
    
    // 调用API更新学生信息
    StudentAPI.updateStudent(id, studentData)
      .then(updatedStudent => {
        // 更新表格中的数据
        const $row = $(`#studentsTable tbody tr:nth-child(${id})`);
        $row.find('td:eq(0)').text(updatedStudent.name);
        $row.find('td:eq(1)').text(updatedStudent.phone);
        $row.find('td:eq(2)').text(updatedStudent.remainingHours);
        $row.find('td:eq(3)').text(updatedStudent.usedHours);
        
        // 更新状态
        $row.attr('data-status', updatedStudent.status);
        let statusText = '';
        let statusClass = '';
        
        if (updatedStudent.status === 'active') {
          statusText = '活跃';
          statusClass = 'status-active';
        } else if (updatedStudent.status === 'inactive') {
          statusText = '已结课';
          statusClass = 'status-inactive';
        } else if (updatedStudent.status === 'new') {
          statusText = '新客户';
          statusClass = 'status-new';
        }
        
        $row.find('td:eq(6)').html(`<span class="${statusClass}">${statusText}</span>`);
        
        // 显示成功消息
        alert('客户信息更新成功！');
        
        // 关闭模态框
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editPersonalModal'));
        editModal.hide();
        
        // 重新应用筛选
        $('#statusFilter').trigger('change');
      })
      .catch(error => {
        console.error('更新学生信息失败:', error);
        alert('更新学生信息失败，请重试');
      });
  });
  
  // 表单提交处理
  $('#studentForm').on('submit', function(e) {
    e.preventDefault();
    
    // 获取表单数据
    const formData = {
      name: $('#name').val(),
      phone: $('#phone').val(),
      email: $('#email').val(),
      birthdate: $('#birthdate').val(),
      totalHours: parseInt($('#totalHours').val()),
      usedHours: parseInt($('#usedHours').val()) || 0,
      remainingHours: parseInt($('#totalHours').val()) - (parseInt($('#usedHours').val()) || 0),
      address: $('#address').val(),
      notes: $('#notes').val(),
      status: $('input[name="status"]:checked').val()
    };
    
    // 调用API添加学生
    StudentAPI.addStudent(formData)
      .then(() => {
        // 显示成功消息
        alert('客户信息添加成功！');
        
        // 重置表单
        this.reset();
        
        // 切换到客户列表选项卡
        $('#students-tab').tab('show');
        
        // 刷新学生列表（在实际应用中，这里应该重新加载学生列表）
        // 为简化演示，这里不实现刷新功能
      })
      .catch(error => {
        console.error('添加学生失败:', error);
        alert('添加学生失败，请重试');
      });
  });
  
  // 加载学生记录的函数
  function loadStudentRecords(studentId) {
    StudentAPI.getStudentRecords(studentId)
      .then(records => {
        const $recordsList = $('#recordsList');
        
        // 清空现有记录
        $recordsList.empty();
        
        if (records.length === 0) {
          // 显示无记录消息
          $recordsList.html('<div class="text-center text-muted py-3" id="noRecordsMessage">暂无学习记录</div>');
          return;
        }
        
        // 添加记录
        records.forEach(record => {
          const formattedDate = formatDate(record.date);
          const $record = $(`
            <div class="list-group-item">
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">上课日期: ${formattedDate}</h6>
                <small class="text-muted">记录时间: ${formatDateTime(record.createdAt)}</small>
              </div>
              <div class="mt-2 record-content">${record.content}</div>
            </div>
          `);
          $recordsList.append($record);
        });
      })
      .catch(error => {
        console.error('获取学生记录失败:', error);
        $('#recordsList').html('<div class="text-center text-danger py-3">加载记录失败，请重试</div>');
      });
  }
  
  // 日期格式化函数
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  
  // 日期时间格式化函数
  function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 初始化学生表格函数
  function initStudentTable() {
    // 获取所有学生数据
    StudentAPI.getAllStudents()
      .then(students => {
        const $tbody = $('#studentsTable tbody');
        $tbody.empty();
        
        // 遍历学生数据并添加到表格
        students.forEach(student => {
          // 根据状态设置显示文本和样式
          let statusText = '';
          let statusClass = '';
          
          if (student.status === 'active') {
            statusText = '活跃';
            statusClass = 'status-active';
          } else if (student.status === 'inactive') {
            statusText = '已结课';
            statusClass = 'status-inactive';
          } else if (student.status === 'new') {
            statusText = '新客户';
            statusClass = 'status-new';
          }
          
          // 格式化最近上课日期
          const lastClassDate = student.lastClassDate ? formatDate(student.lastClassDate) : '-';
          
          // 创建表格行
          const $row = $(`
            <tr data-status="${student.status}">
              <th scope="row">${student.id}</th>
              <td>${student.name}</td>
              <td>${student.phone}</td>
              <td>${student.remainingHours}</td>
              <td>${student.usedHours}</td>
              <td>${formatDate(student.registerDate)}</td>
              <td>${lastClassDate}</td>
              <td><span class="${statusClass}">${statusText}</span></td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary">编辑个人</button>
                  <button class="btn btn-sm btn-outline-success">录入上课记录</button>
                </div>
              </td>
            </tr>
          `);
          
          $tbody.append($row);
        });
      })
      .catch(error => {
        console.error('加载学生数据失败:', error);
        $('#studentsTable tbody').html('<tr><td colspan="9" class="text-center text-danger">加载学生数据失败，请刷新页面重试</td></tr>');
      });
  }
}); 