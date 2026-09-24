/**
 * 全局高透玻璃胶囊 Toast 消息通知系统
 * 支持手势拖拽划掉、压感反馈、物理弹簧效果
 */
const Toast = {
  containerEl: null,

  init() {
    if (this.containerEl) return;
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'glass-toast-container';
    document.body.appendChild(this.containerEl);
  },

  // 显示胶囊 Toast
  // options: { message, type: 'loading'|'success'|'error', duration: 3000 }
  show(options = {}) {
    this.init();

    const { message = '', type = 'loading', duration = 3000 } = options;

    const toastEl = document.createElement('div');
    toastEl.className = 'glass-toast';

    this.renderContent(toastEl, type, message);
    this.containerEl.appendChild(toastEl);

    // 绑定手势交互与手势划拉
    this.bindGestures(toastEl);

    let timer = null;
    if (type !== 'loading' && duration > 0) {
      timer = setTimeout(() => {
        this.dismiss(toastEl);
      }, duration);
    }

    return {
      // 用于加载完成后更新状态（如从 loading 变成 success）
      update: (newType, newMessage, newDuration = 3000) => {
        this.renderContent(toastEl, newType, newMessage);
        if (timer) clearTimeout(timer);
        if (newType !== 'loading' && newDuration > 0) {
          timer = setTimeout(() => {
            this.dismiss(toastEl);
          }, newDuration);
        }
      },
      close: () => this.dismiss(toastEl)
    };
  },

  renderContent(el, type, message) {
    if (type === 'loading') {
      el.innerHTML = `
        <div class="toast-dots-spinner">
          <span></span><span></span><span></span>
        </div>
        <span>${message || '请稍候...'}</span>
      `;
    } else if (type === 'success') {
      el.innerHTML = `
        <span class="toast-icon-success">✓</span>
        <span>${message || '操作成功'}</span>
      `;
    } else if (type === 'error') {
      el.innerHTML = `
        <span class="toast-icon-error">✕</span>
        <span>${message || '发生错误'}</span>
      `;
    } else {
      el.innerHTML = `<span>${message}</span>`;
    }
  },

  // 关闭销毁 Toast
  dismiss(toastEl) {
    if (!toastEl || toastEl.isDismissed) return;
    toastEl.isDismissed = true;
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(-20px) scale(0.8)';
    setTimeout(() => {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    }, 300);
  },

  // 手势拖拽与划掉处理
  bindGestures(el) {
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let isDragging = false;

    const onTouchStart = (e) => {
      isDragging = true;
      const touch = e.touches ? e.touches[0] : e;
      startX = touch.clientX;
      startY = touch.clientY;
      el.style.transition = 'none'; // 拖拽时关闭动画过渡，保持毫秒级跟手
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches ? e.touches[0] : e;
      currentX = touch.clientX - startX;
      currentY = touch.clientY - startY;

      // 让胶囊随手指移动，并稍微旋转带点动态感
      const rotate = currentX * 0.05;
      el.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;
    };

    const onTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';

      // 判定滑动消除阈值（上划、左划或右划超过 60px）
      if (currentY < -50 || Math.abs(currentX) > 80) {
        this.dismiss(el);
      } else {
        // 恢复弹簧回位
        el.style.transform = 'translate(0, 0) rotate(0deg)';
      }
      currentX = 0;
      currentY = 0;
    };

    el.addEventListener('mousedown', onTouchStart);
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('mouseup', onTouchEnd);

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
  }
};
