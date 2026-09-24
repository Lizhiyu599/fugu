// 触发隐藏的文件上传框
function triggerAvatarUpload(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.click();
  }
}

// 读取用户选择的本地图片并更新头像预览
function handleAvatarChange(event, imgTargetId) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgElement = document.getElementById(imgTargetId);
      if (imgElement) {
        imgElement.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}
