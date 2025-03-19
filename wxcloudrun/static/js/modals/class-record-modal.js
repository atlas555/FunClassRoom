/**
 * class-record-modal.js - 处理上课记录模态框的功能
 */

// 上课记录模态框模块
const ClassRecordModal = {
  // 富文本编辑器实例
  editor: null,
  
  // 初始化模态框
  init: function() {
    // 初始化富文本编辑器
    this.initQuillEditor();
    
    // 绑定保存按钮事件
    document.getElementById('saveRecordBtn').addEventListener('click', () => {
      this.saveClassRecord();
    });
    
    // 设置默认日期为今天
    DateFormatterUtils.setInputToToday('classDate');
  },
  
  // 初始化富文本编辑器
  initQuillEditor: function() {
    // 创建Quill工具栏选项
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ];
    
    // 初始化Quill编辑器
    this.editor = new Quill('#classContentEditor', {
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: '请输入学习内容记录...',
      theme: 'snow'
    });
  },
  
  // 打开模态框
  open: function(studentId, studentName) {
    // 填充学生ID和姓名
    document.getElementById('recordStudentId').value = studentId;
    document.getElementById('recordStudentName').value = studentName;
    
    // 清空编辑器内容
    if (this.editor) {
      this.editor.root.innerHTML = '';
    }
    
    // 重新设置默认日期为今天
    DateFormatterUtils.setInputToToday('classDate');
    
    // 加载学生的学习记录 - 使用RecordsHandler
    RecordsHandler.loadStudentRecords(studentId);
    
    // 显示模态框
    const classRecordModal = new bootstrap.Modal(document.getElementById('classRecordModal'));
    classRecordModal.show();
  },
  
  // 加载学生学习记录方法已移动到RecordsHandler
  // 此处删除loadStudentRecords方法
  
  // 保存上课记录
  saveClassRecord: function() {
    // 获取表单数据
    const studentId = document.getElementById('recordStudentId').value;
    const classDate = document.getElementById('classDate').value;
    const content = this.editor.root.innerHTML;
    
    // 验证必填字段
    if (!classDate) {
      NotificationUtils.showAlert('请选择上课日期', 'error');
      return;
    }
    
    if (!content || content.trim() === '<p><br></p>') {
      NotificationUtils.showAlert('请输入学习内容记录', 'error');
      return;
    }
    
    // 构建记录数据
    const recordData = {
      studentId: parseInt(studentId),
      classDate,
      content
    };
    
    NotificationUtils.showLoading();
    
    // 调用API添加学习记录
    StudentAPI.addClassRecord(recordData)
      .then(() => {
        NotificationUtils.showAlert('上课记录保存成功', 'success');
        
        // 清空编辑器内容
        this.editor.root.innerHTML = '';
        
        // 重新加载学生的学习记录 - 使用RecordsHandler
        RecordsHandler.loadStudentRecords(studentId);
      })
      .catch(error => {
        console.error('保存上课记录失败:', error);
        NotificationUtils.showAlert(error.message || '保存上课记录失败', 'error');
      })
      .finally(() => {
        NotificationUtils.clearLoading();
      });
  }
}; 