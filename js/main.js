// 触发上传
function triggerAvatarUpload(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.click();
  }
}

// 处理换头像：隐藏加号空白图标，显示新上传的图片
function handleAvatarChange(event, imgTargetId, placeholderId) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgElement = document.getElementById(imgTargetId);
      const placeholder = document.getElementById(placeholderId);
      
      if (imgElement) {
        imgElement.src = e.target.result;
        imgElement.style.display = 'block'; // 显示图片
      }
      if (placeholder) {
        placeholder.style.display = 'none'; // 隐藏加号占位图标
      }
    };
    reader.readAsDataURL(file);
  }
}
