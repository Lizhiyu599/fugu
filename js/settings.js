/**
 * “设置”软件独立模块 (SettingsApp)
 * HTML 完全由 JS 动态生成注入，无需在 index.html 预载任何代码
 */

const SettingsApp = {
  id: 'settings',
  containerEl: null,

  // 1. 初始化并注入应用 HTML DOM 结构
  render() {
    if (this.containerEl) return; // 避免重复注入

    const appHTML = `
      <div class="app-view-settings" id="app-view-settings">
        <!-- 顶部返回导航栏 -->
        <div class="app-nav-bar">
          <button class="app-back-btn" onclick="AppManager.backToHome()" title="返回桌面">←</button>
          <div class="app-page-title">
            <span class="en">Réglages</span>
            <span class="cn">系统设置</span>
          </div>
          <div style="width: 40px;"></div> <!-- 占位保持标题居中 -->
        </div>

        <!-- 设置面板主体 -->
        <div class="settings-panel">
          <!-- API 配置 -->
          <div class="settings-group">
            <div class="settings-group-title">API 接口配置</div>
            <div class="settings-field">
              <label for="set-api-key">API Key</label>
              <div class="input-row">
                <input type="password" id="set-api-key" placeholder="sk-..." autocomplete="off">
                <button type="button" class="st-btn" style="padding:0 12px; font-size:12px;" onclick="SettingsApp.togglePasswordVisibility('set-api-key')">显示</button>
              </div>
            </div>
            <div class="settings-field">
              <label for="set-api-url">API Base URL</label>
              <input type="text" id="set-api-url" placeholder="https://api.openai.com/v1">
            </div>
            <div class="settings-field">
              <label for="set-api-model">默认 Model 名称</label>
              <input type="text" id="set-api-model" placeholder="gpt-4o / deepseek-chat">
            </div>
            <button class="st-btn" onclick="SettingsApp.testApiConnection()">测试 API 连通性</button>
          </div>

          <!-- 数据管理 -->
          <div class="settings-group">
            <div class="settings-group-title">数据管理</div>
            <div class="st-grid-2">
              <button class="st-btn" onclick="SettingsApp.exportData()">导出数据备份</button>
              <button class="st-btn" onclick="SettingsApp.triggerImport()">导入数据备份</button>
              <input type="file" id="set-import-file" accept=".json" style="display: none;" onchange="SettingsApp.importData(event)">
            </div>
            <button class="st-btn danger" onclick="SettingsApp.resetAll()">恢复出厂默认</button>
          </div>

          <!-- 保存按钮 -->
          <div style="margin-top: auto; padding-top: 10px;">
            <button class="st-btn primary" style="width: 100%; height: 46px;" onclick="SettingsApp.saveSettings()">保存配置</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('desktop').insertAdjacentHTML('beforeend', appHTML);
    this.containerEl = document.getElementById('app-view-settings');
  },

  // 2. 打开应用
  open() {
    this.render();
    this.loadSettings();
    setTimeout(() => {
      if (this.containerEl) this.containerEl.classList.add('active');
    }, 10);
  },

  // 3. 退出应用
  close() {
    if (this.containerEl) {
      this.containerEl.classList.remove('active');
    }
  },

  // 4. 辅助功能函数
  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  },

  saveSettings() {
    const apiKey = document.getElementById('set-api-key').value.trim();
    const apiUrl = document.getElementById('set-api-url').value.trim();
    const apiModel = document.getElementById('set-api-model').value.trim();

    localStorage.setItem('french_desktop_settings', JSON.stringify({ apiKey, apiUrl, apiModel }));
    alert('配置已成功保存！');
    AppManager.backToHome();
  },

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
      } catch (e) {}
    }
  },

  async testApiConnection() {
    const apiKey = document.getElementById('set-api-key').value.trim();
    let apiUrl = document.getElementById('set-api-url').value.trim() || 'https://api.openai.com/v1';
    const model = document.getElementById('set-api-model').value.trim() || 'gpt-3.5-turbo';

    if (!apiKey) return alert('请先输入 API Key！');

    const targetUrl = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
    alert('正在测试连通性，请稍候...');

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
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

  triggerImport() {
    document.getElementById('set-import-file').click();
  },

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

  resetAll() {
    if (confirm('确定要清空所有配置并恢复出厂设置吗？此操作不可撤销。')) {
      localStorage.clear();
      location.reload();
    }
  }
};

// 确保在 AppManager 加载完毕后将当前应用注册进去
if (window.AppManager) {
  AppManager.register('settings', SettingsApp);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.AppManager) {
      AppManager.register('settings', SettingsApp);
    }
  });
}
