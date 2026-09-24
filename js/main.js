// 触发隐藏的文件选择器
function triggerAvatarUpload(inputId) {
  const input = document.getElementById(inputId);
  if (input) input.click();
}

// 处理换头像：渲染 + 持久化
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

    // 持久化：用 frameId 作为 key，区分左右头像
    try {
      localStorage.setItem(`widget_avatar_${frameId}`, e.target.result);
    } catch (err) {
      console.warn('头像保存失败（可能图片太大超出 localStorage 容量）:', err);
      alert('头像保存失败：图片太大，请换一张小一点的图。');
    }
  };
  reader.readAsDataURL(file);
}

// 名字持久化：给两个 .avatar-name 分别取一个稳定的 key
function getAvatarBoxKey(nameEl) {
  // 找到名字所在的 .avatar-box，再找里面的 avatar-frame 的 id
  const box = nameEl.closest('.avatar-box');
  const frame = box?.querySelector('.avatar-frame');
  return frame?.id || null; // 'left-avatar-frame' / 'right-avatar-frame'
}

function initProfilePersistence() {
  // 1. 恢复头像
  ['left-avatar-frame', 'right-avatar-frame'].forEach((frameId) => {
    const saved = localStorage.getItem(`widget_avatar_${frameId}`);
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

    // 恢复
    const savedName = localStorage.getItem(`widget_name_${key}`);
    if (savedName !== null) nameEl.textContent = savedName;

    // 保存（失焦时存，避免每次输入都写 localStorage）
    nameEl.addEventListener('blur', () => {
      localStorage.setItem(`widget_name_${key}`, nameEl.textContent.trim());
    });
  });
}

// DOM 就绪后初始化
document.addEventListener('DOMContentLoaded', () => {
  initProfilePersistence();
});
