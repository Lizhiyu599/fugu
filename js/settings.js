/**
 * “设置”应用独立模块 (SettingsApp)
 * 处理 API 配置保存、网络连通性测试、数据导出/导入与恢复出厂
 */

const SettingsApp = {
  // 打开设置弹窗
  open() {
    const modal = document.getElementById('settings-app-modal');
    if (modal) {
      this.loadSettings();
      modal.classList.add('active');
    }
  },

  // 关闭设置弹窗
  close() {
    const modal = document.getElementById('settings-app-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  // 切换密码可见度
  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },

  // 保存设置到 localStorage
  saveSettings() {
    const apiKey = document.getElementById('set-api-key').value.trim();
    const apiUrl = document.getElementById('set-api-url').value.trim();
    const apiModel = document.getElementById('set-api-model').value.trim();

    const data = { apiKey, apiUrl, apiModel };
    localStorage.setItem('french_desktop_settings', JSON.stringify(data));
    alert('配置已成功保存！');
    this.close();
  },

  // 读取已保存设置
  loadSettings() {
    const saved = localStorage.getItem('french_desktop_settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (document.getElementById('set-api-key')) {
          document.getElementById('set-api-key').value = data.apiKey || '';
          document.getElementById('set-api-url').value = data.apiUrl || '';
          document.getElementById('set-api-model').value = data.apiModel || '';
        }
      } catch (e) {
        console.error('读取设置失败', e);
      }
    }
  },

  // 测试 API 通畅度
  async testApiConnection() {
    const apiKey = document.getElementById('set-api-key').value.trim();
    let apiUrl = document.getElementById('set-api-url').value.trim();
    const model = document.getElementById('set-api-model').value.trim() || 'gpt-3.5-turbo';

    if (!apiKey) {
      alert('请先输入 API Key！');
      return;
    }

    if (!apiUrl) {
      apiUrl = 'https://api.openai.com/v1';
    }

    const targetUrl = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
    alert('正在测试连通性，请稍候...');

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        alert('连接成功！API 接口畅通可用。');
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`连接失败 (状态码: ${response.status})\n错误信息: ${errData.error?.message || '请求未成功'}`);
      }
    } catch (err) {
      alert(`网络错误，无法连接到该地址：\n${err.message}`);
    }
  },

  // 导出备份 JSON
  exportData() {
    const backupData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      settings: JSON.parse(localStorage.getItem('french_desktop_settings') || '{}')
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `FrenchDesktop_Backup_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  },

  // 触发导入文件选择
  triggerImport() {
    document.getElementById('set-import-file').click();
  },

  // 导入备份 JSON
  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.settings) {
          localStorage.setItem('french_desktop_settings', JSON.stringify(imported.settings));
          this.loadSettings();
          alert('数据恢复成功！');
        } else {
          alert('备份文件格式不符合规范！');
        }
      } catch (err) {
        alert('解析备份文件失败：' + err.message);
      }
    };
    reader.readAsText(file);
  },

  // 恢复出厂
  resetAll() {
    if (confirm('确定要清空所有配置并恢复出厂设置吗？此操作不可撤销。')) {
      localStorage.clear();
      location.reload();
    }
  }
};
