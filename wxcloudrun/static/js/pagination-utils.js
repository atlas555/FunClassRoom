/**
 * pagination-utils.js - 处理表格分页功能
 */

// 分页控件模块
const PaginationUtils = {
  // 更新分页控件
  updatePagination: function(pagination, containerSelector, onPageChange) {
    const { total, page, per_page, pages } = pagination;
    
    // 更新总记录数
    if (containerSelector === '.pagination') {
      $('#totalRecords').text(total);
    } else if (containerSelector === '.pagination-packages') {
      $('#totalPackages').text(total);
    }
    
    // 清空现有分页
    const $pagination = $(containerSelector);
    $pagination.empty();
    
    // 如果总页数为0，不显示分页
    if (pages === 0) {
      return;
    }
    
    // 添加"上一页"按钮
    const $prevButton = $(`
      <li class="page-item${page === 1 ? ' disabled' : ''}">
        <a class="page-link" href="#" data-page="${page - 1}" tabindex="-1" aria-disabled="${page === 1}">上一页</a>
      </li>
    `);
    $pagination.append($prevButton);
    
    // 最多显示5个页码
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, startPage + 4);
    
    // 添加页码
    for (let i = startPage; i <= endPage; i++) {
      const $pageItem = $(`
        <li class="page-item${i === page ? ' active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `);
      $pagination.append($pageItem);
    }
    
    // 添加"下一页"按钮
    const $nextButton = $(`
      <li class="page-item${page >= pages ? ' disabled' : ''}">
        <a class="page-link" href="#" data-page="${page + 1}" aria-disabled="${page >= pages}">下一页</a>
      </li>
    `);
    $pagination.append($nextButton);
    
    // 绑定页码点击事件
    $pagination.find('.page-link').on('click', function(e) {
      e.preventDefault();
      
      // 如果是禁用状态，不执行操作
      if ($(this).parent().hasClass('disabled')) {
        return;
      }
      
      // 获取页码
      const clickedPage = $(this).data('page');
      
      // 调用页码变更回调函数
      if (typeof onPageChange === 'function') {
        onPageChange(clickedPage);
      }
      
      // 滚动到表格顶部
      $('html, body').animate({
        scrollTop: $(containerSelector).closest('table').offset().top - 20
      }, 200);
    });
    
    // 更新每页显示数量选择器
    if (containerSelector === '.pagination') {
      $('#perPageSelect').val(per_page.toString());
    } else if (containerSelector === '.pagination-packages') {
      $('#packagePerPageSelect').val(per_page.toString());
    }
  }
}; 