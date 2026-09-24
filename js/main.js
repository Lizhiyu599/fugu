// 触发隐藏的文件选择器
function triggerAvatarUpload(inputId) {
  const input = document.getElementById(inputId);
  if (input) input.click();
}

// 处理换头像：渲染 + 持久化（公共存储 + 账号私有存储）
function handleAvatarChange(event, frameId, plusId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const frame = document.getElementById(frameId);
    const plusIcon = document.getElementById(plusId);

    if (frame) {
      frame.style.backgroundImage = `url('${e.target.result}')`;
      frame.style.backgroundSize = 'cover';
      frame.style.backgroundPosition = 'center';
    }
    if (plusIcon) plusIcon.style.display = 'none';

    try {
      const avatarData = e.target.result;
      const avatarKey = `widget_avatar_${frameId}`;

      // 公共存储（未登录时也能用）
      localStorage.setItem(avatarKey, avatarData);

      // 🌟 若已登录，同步写入账号私有数据库
      if (window.AuthManager && AuthManager.currentUser) {
        AuthManager.saveUserData(avatarKey, avatarData);
      }
    } catch (err) {
      console.warn('头像保存失败（可能图片太大超出 localStorage 容量）:', err);
      alert('头像保存失败：图片太大，请换一张小一点的图。');
    }
  };
  reader.readAsDataURL(file);
}

// 根据 .avatar-name 所在的 .avatar-box 反推 frameId（区分左右）
function getAvatarBoxKey(nameEl) {
  const box = nameEl.closest('.avatar-box');
  const frame = box?.querySelector('.avatar-frame');
  return frame?.id || null; // 'left-avatar-frame' / 'right-avatar-frame'
}

// 🌟 幂等标记：避免重复绑定事件
let __profileInited = false;

function initProfilePersistence() {
  // 如果已经初始化过，只做"从当前登录用户数据恢复"，不再重复绑定事件
  if (__profileInited) {
    if (window.AuthManager && AuthManager.currentUser) {
      AuthManager.applyUserData();
    }
    return;
  }
  __profileInited = true;

  // 1. 恢复头像
  ['left-avatar-frame', 'right-avatar-frame'].forEach((frameId) => {
    let saved = null;
    const avatarKey = `widget_avatar_${frameId}`;

    // 优先从账号私有数据读取
    if (window.AuthManager && AuthManager.currentUser) {
      const userKey = `user_${AuthManager.currentUser.uid}_data`;
      try {
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        saved = userData[avatarKey];
      } catch (e) {}
    }
    // 兜底：读公共存储
    if (!saved) {
      saved = localStorage.getItem(avatarKey);
    }

    if (!saved) return;
    const frame = document.getElementById(frameId);
    if (!frame) return;

    frame.style.backgroundImage = `url('${saved}')`;
    frame.style.backgroundSize = 'cover';
    frame.style.backgroundPosition = 'center';

    const plus = frame.querySelector('.avatar-plus');
    if (plus) plus.style.display = 'none';
  });

  // 2. 恢复名字 + 绑定保存事件
  document.querySelectorAll('.avatar-name').forEach((nameEl) => {
    const key = getAvatarBoxKey(nameEl);
    if (!key) return;

    const nameKey = `widget_name_${key}`;
    let savedName = null;

    // 优先从账号私有数据读取
    if (window.AuthManager && AuthManager.currentUser) {
      const userKey = `user_${AuthManager.currentUser.uid}_data`;
      try {
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        savedName = userData[nameKey];
      } catch (e) {}
    }
    // 兜底：读公共存储
    if (savedName === null || savedName === undefined) {
      savedName = localStorage.getItem(nameKey);
    }

    // 恢复名字
    if (savedName !== null && savedName !== undefined) {
      nameEl.textContent = savedName;
    }

    // 保存（失焦时存，避免每次输入都写 localStorage）
    nameEl.addEventListener('blur', () => {
      const val = nameEl.textContent.trim();

      // 公共存储
      localStorage.setItem(nameKey, val);

      // 🌟 若已登录，同步到账号私有数据库
      if (window.AuthManager && AuthManager.currentUser) {
        AuthManager.saveUserData(nameKey, val);
      }
    });
  });
}

// DOM 就绪后初始化（延后一点点，避免 AuthManager 还没恢复 currentUser）
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initProfilePersistence();
  }, 0);
});
