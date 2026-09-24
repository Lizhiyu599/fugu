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
