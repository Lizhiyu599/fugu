// 触发隐藏的文件选择器
function triggerAvatarUpload(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.click();
  }
}

// 处理换头像：直接将选好的图片作为 CSS 背景图渲染到头像框上
function handleAvatarChange(event, frameId, plusId) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const frame = document.getElementById(frameId);
      const plusIcon = document.getElementById(plusId);
      
      if (frame) {
        // 设置背景图片
        frame.style.backgroundImage = `url('${e.target.result}')`;
      }
      if (plusIcon) {
        // 隐藏加号占位符
        plusIcon.style.display = 'none';
      }
    };
    reader.readAsDataURL(file);
  }
}

/**
 * ==========================================
 * 桌面小组件（头像 + 名字）本地化持久保存模块
 * ==========================================
 */
const ProfileWidgetManager = {
  // 1. 初始化小组件事件与自动加载数据
  init() {
    this.loadProfile(); // 打开/刷新页面时自动读取
    this.bindEvents();  // 绑定编辑事件
  },

  // 2. 从 localStorage 读取并恢复头像和名字
  loadProfile() {
    const savedAvatar = localStorage.getItem('widget_user_avatar');
    const savedName = localStorage.getItem('widget_user_name');

    // 恢复头像
    if (savedAvatar) {
      const avatarEl = document.getElementById('user-avatar-img'); // 请确认你头像 <img> 的 ID
      if (avatarEl) avatarEl.src = savedAvatar;
    }

    // 恢复名字
    if (savedName) {
      const nameEl = document.getElementById('user-name-text'); // 请确认你名字元素的 ID
      if (nameEl) {
        if (nameEl.tagName === 'INPUT') {
          nameEl.value = savedName;
        } else {
          nameEl.innerText = savedName;
        }
      }
    }
  },

  // 3. 保存名字
  saveName(newName) {
    const trimmed = newName.trim();
    if (trimmed) {
      localStorage.setItem('widget_user_name', trimmed);
    }
  },

  // 4. 保存头像 (转换为 Base64)
  saveAvatarFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      // 存入本地缓存
      localStorage.setItem('widget_user_avatar', base64Data);
      
      // 实时更新 DOM 显示
      const avatarEl = document.getElementById('user-avatar-img');
      if (avatarEl) avatarEl.src = base64Data;
    };
    reader.readAsDataURL(file);
  },

  // 5. 自动绑定 DOM 事件
  bindEvents() {
    // 监听名字输入框/可编辑文本
    const nameEl = document.getElementById('user-name-text');
    if (nameEl) {
      // 如果名字是 input 输入框
      nameEl.addEventListener('input', (e) => this.saveName(e.target.value));
      // 如果名字是 contenteditable 元素
      nameEl.addEventListener('blur', (e) => this.saveName(e.target.innerText));
    }

    // 监听头像文件选择框
    const avatarInput = document.getElementById('user-avatar-input'); // 请确认上传 <input type="file"> 的 ID
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.saveAvatarFile(e.target.files[0]);
        }
      });
    }
  }
};

// 页面 DOM 加载完成后自动运行小组件管理器
document.addEventListener('DOMContentLoaded', () => {
  // 延时 100ms 确保桌面 DOM 节点已完全渲染
  setTimeout(() => {
    ProfileWidgetManager.init();
  }, 100);
});
