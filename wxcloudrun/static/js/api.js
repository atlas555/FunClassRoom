/**
 * api.js - 集中处理所有API请求
 * 提供统一的API调用接口，处理请求、错误和响应格式化
 */

// API基础URL配置
const API_BASE_URL = '/api';

// 通用API请求处理函数
const handleApiRequest = async (url, options = {}) => {
  try {
    // 设置默认headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // 合并选项
    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };
    
    // 发送请求
    const response = await fetch(url, requestOptions);
    
    // 检查响应状态
    if (!response.ok) {
      // 尝试解析错误消息
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // 如果无法解析JSON，使用状态文本
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }
      
      // 抛出格式化的错误
      throw new Error(errorData.message || `请求失败: ${response.status}`);
    }
    
    // 解析并返回响应数据
    return await response.json();
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 学生/客户API接口
const StudentAPI = {
  // 获取所有学生，支持分页和状态筛选
  getAllStudents: (page = 1, perPage = 10, status = 'all') => {
    const url = `${API_BASE_URL}/students?page=${page}&per_page=${perPage}${status !== 'all' ? `&status=${status}` : ''}`;
    return handleApiRequest(url);
  },
  
  // 获取单个学生信息
  getStudent: (studentId) => {
    return handleApiRequest(`${API_BASE_URL}/students/${studentId}`);
  },
  
  // 添加新学生
  addStudent: (studentData) => {
    // 处理特殊字段
    const data = { ...studentData };
    
    // 确保日期字段有值或为null
    ['birthdate'].forEach(field => {
      if (data[field] === '') {
        data[field] = null;
      }
    });
    
    return handleApiRequest(`${API_BASE_URL}/students`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 更新学生信息
  updateStudent: (studentId, studentData) => {
    // 处理特殊字段
    const data = { ...studentData };
    
    // 确保日期字段有值或为null
    ['birthdate'].forEach(field => {
      if (data[field] === '') {
        data[field] = null;
      }
    });
    
    return handleApiRequest(`${API_BASE_URL}/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // 删除学生
  deleteStudent: (studentId) => {
    return handleApiRequest(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE'
    });
  },
  
  // 获取学生的学习记录
  getStudentRecords: (studentId) => {
    return handleApiRequest(`${API_BASE_URL}/students/${studentId}/records`);
  },
  
  // 添加学习记录
  addClassRecord: (recordData) => {
    return handleApiRequest(`${API_BASE_URL}/records`, {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
  },
  
  // 获取学生的课时包
  getStudentPackages: (studentId, activeOnly = false) => {
    const url = `${API_BASE_URL}/students/${studentId}/packages${activeOnly ? '?active_only=true' : ''}`;
    return handleApiRequest(url);
  },
  
  // 获取学生的课时消耗记录
  getStudentConsumptionRecords: (studentId, packageId = null) => {
    let url = `${API_BASE_URL}/students/${studentId}/consumption`;
    if (packageId) {
      url += `?package_id=${packageId}`;
    }
    return handleApiRequest(url);
  },
  
  // 添加课时消耗记录
  addConsumptionRecord: (consumptionData) => {
    return handleApiRequest(`${API_BASE_URL}/consumption`, {
      method: 'POST',
      body: JSON.stringify(consumptionData)
    });
  }
};

// 课时包API接口
const PackageAPI = {
  // 获取所有课时包，支持分页和状态筛选
  getAllPackages: (page = 1, perPage = 10, status = 'all') => {
    const url = `${API_BASE_URL}/packages?page=${page}&per_page=${perPage}${status !== 'all' ? `&status=${status}` : ''}`;
    return handleApiRequest(url);
  },
  
  // 获取单个课时包信息
  getPackage: (packageId) => {
    return handleApiRequest(`${API_BASE_URL}/packages/${packageId}`);
  },
  
  // 添加新课时包
  addPackage: (packageData) => {
    // 处理特殊字段
    const data = { ...packageData };
    
    // 确保日期字段有值或为null
    ['purchaseDate', 'expireDate'].forEach(field => {
      if (data[field] === '') {
        data[field] = null;
      }
    });
    
    return handleApiRequest(`${API_BASE_URL}/packages`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 更新课时包信息
  updatePackage: (packageId, packageData) => {
    // 处理特殊字段
    const data = { ...packageData };
    
    // 确保日期字段有值或为null
    ['purchaseDate', 'expireDate'].forEach(field => {
      if (data[field] === '') {
        data[field] = null;
      }
    });
    
    return handleApiRequest(`${API_BASE_URL}/packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // 删除课时包
  deletePackage: (packageId) => {
    return handleApiRequest(`${API_BASE_URL}/packages/${packageId}`, {
      method: 'DELETE'
    });
  }
};

// 用户和认证API接口
const AuthAPI = {
  // 登录
  login: (username, password) => {
    return handleApiRequest(`${API_BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  // 注销
  logout: () => {
    return handleApiRequest(`${API_BASE_URL}/logout`, {
      method: 'POST'
    });
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return handleApiRequest(`${API_BASE_URL}/user`);
  }
}; 