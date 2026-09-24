/**
 * “设置”软件独立模块 (SettingsApp)
 * 支持 3 套 API 预设管理（合并预设与模型名称），优化保存按钮布局与 Toast 集成
 */

const SettingsApp = {
  id: 'settings',
  containerEl: null,
  activeSlot: 1,

  // 默认预设数据结构
  apiSlots: {
    1: { name: 'gpt-4o', apiUrl: '', apiKey: '' },
    2: { name: 'deepseek-chat', apiUrl: '', apiKey: '' },
    3: { name: 'claude-3-5-sonnet', apiUrl: '', apiKey: '' }
  },

  // 1. 初始化并注入应用 DOM
  render() {
    if (this.containerEl) return;

    const appHTML = `
      <div class="app-view-settings" id="app-view-settings">
        <!-- 顶部返回导航栏 -->
        <div class="app-nav-bar">
          <button class="app-back-btn" onclick="AppManager.backToHome()" title="Retour">
            <img src="https://i.ibb.co/Kc8JLNTX/1782649743993.png" class="app-back-img" alt="Back">
          </button>
          <div class="app-page-title">
            <span class="en">Réglages</span>
          </div>
          <div style="width: 40px;"></div>
        </div>

        <!-- 设置面板主体 -->
        <div class="settings-panel">
          <!-- API 接口配置 -->
          <div class="settings-group">
            <div class="settings-group-title" style="display: flex; justify-content: space-between; align-items: center;">
              <span>API 接口配置</span>
              <span style="font-size: 12px; color: #666;">（最多 3 套预设）</span>
            </div>

            <!-- 槽位切换选择器 -->
            <div class="settings-field">
              <label>切换 API 预设</label>
              <div class="custom-glass-select-wrapper">
                <select id="set-api-slot-select" class="custom-glass-select" onchange="SettingsApp.switchSlot(this.value)">
                  <!-- 动态渲染 -->
                </select>
              </div>
            </div>

            <!-- 统一后的：预设 / 模型名称 -->
            <div class="settings-field">
              <label for="set-slot-name">预设 / 模型名称 (Model Name)</label>
              <input type="text" id="set-slot-name" placeholder="如：gpt-4o / deepseek-chat" oninput="SettingsApp.handleNameInput(this.value)">
            </div>
            
            <div class="settings-field">
              <label for="set-api-url">API Base URL</label>
              <input type="text" id="set-api-url" placeholder="https://api.openai.com/v1">
            </div>

            <div class="settings-field">
              <label for="set-api-key">API Key</label>
              <div class="input-row">
                <input type="password" id="set-api-key" placeholder="sk-..." autocomplete="off">
                <button type="button" class="st-btn" style="padding:0 12px; font-size:12px;" onclick="SettingsApp.togglePasswordVisibility('set-api-key')">显示</button>
              </div>
            </div>

            <!-- 按钮组：测试 API + 保存本模块配置 -->
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
              <button class="st-btn" onclick="SettingsApp.testApiConnection()">测试当前配置连通性</button>
              <button class="st-btn primary" style="height: 42px;" onclick="SettingsApp.saveSettings()">保存 API 配置</button>
            </div>
          </div>

          <!-- 数据管理 -->
          <div class="settings-group">
            <div class="settings-group-title">数据管理</div>
            <div class="st-grid-2">
              <button class="st-btn" onclick="SettingsApp.exportData()">导出数据备份</button>
              <button class="st-btn" onclick="SettingsApp.triggerImport()">导入数据备份</button>
              <input type="file" id="set-import-file" accept=".json" style="display: none;" onchange="SettingsApp.importData(event)">
            </div>
            <button class="st-btn danger" style="margin-top: 8px;" onclick="AuthManager.logout()">退出当前账号</button>
            <button class="st-btn danger" style="margin-top: 8px;" onclick="SettingsApp.resetAll()">恢复出厂默认</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('desktop').insertAdjacentHTML('beforeend', appHTML);
    this.containerEl = document.getElementById('app-view-settings');
  },

  open() {
    this.render();
    this.loadSettings();
    setTimeout(() => {
      if (this.containerEl) this.containerEl.classList.add('active');
    }, 10);
  },

  close() {
    if (this.containerEl) {
      this.containerEl.classList.remove('active');
    }
  },

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  },

  // 刷新下拉菜单的选项（使用统一后的模型/预设名称）
  renderSelectOptions() {
    const selectEl = document.getElementById('set-api-slot-select');
    if (!selectEl) return;

    selectEl.innerHTML = `
      <option value="1">${this.apiSlots[1].name || '配置 1'}</option>
      <option value="2">${this.apiSlots[2].name || '配置 2'}</option>
      <option value="3">${this.apiSlots[3].name || '配置 3'}</option>
    `;
    selectEl.value = this.activeSlot;
  },

  // 实时同步输入框名称到下拉选项
  handleNameInput(val) {
    this.apiSlots[this.activeSlot].name = val.trim() || `配置 ${this.activeSlot}`;
    this.renderSelectOptions();
  },

  // 切换槽位
  switchSlot(newSlot) {
    this.saveCurrentInputsToSlot(this.activeSlot);
    this.activeSlot = parseInt(newSlot);
    this.fillInputsFromSlot(this.activeSlot);
  },

  saveCurrentInputsToSlot(slotNum) {
    const name = document.getElementById('set-slot-name').value.trim() || `配置 ${slotNum}`;
    const key = document.getElementById('set-api-key').value.trim();
    const url = document.getElementById('set-api-url').value.trim();
    
    this.apiSlots[slotNum] = { name, apiUrl: url, apiKey: key, apiModel: name };
  },

  fillInputsFromSlot(slotNum) {
    const data = this.apiSlots[slotNum] || { name: `配置 ${slotNum}`, apiUrl: '', apiKey: '' };
    document.getElementById('set-slot-name').value = data.name || '';
    document.getElementById('set-api-url').value = data.apiUrl || '';
    document.getElementById('set-api-key').value = data.apiKey || '';
    this.renderSelectOptions();
  },

  // 保存全部 API 配置
  saveSettings() {
    this.saveCurrentInputsToSlot(this.activeSlot);

    const fullConfig = {
      activeSlot: this.activeSlot,
      slots: this.apiSlots,
      apiKey: this.apiSlots[this.activeSlot].apiKey,
      apiUrl: this.apiSlots[this.activeSlot].apiUrl,
      apiModel: this.apiSlots[this.activeSlot].name // 使用统一的模型名称
    };

    localStorage.setItem('french_desktop_settings', JSON.stringify(fullConfig));

    if (window.AuthManager && AuthManager.currentUser) {
      AuthManager.saveUserData('settings', fullConfig);
    }

    if (window.Toast) {
      Toast.show({ message: 'API 配置已成功保存', type: 'success', duration: 2000 });
    } else {
      alert('API 配置已成功保存！');
    }
  },

  // 读取配置
  loadSettings() {
    const saved = localStorage.getItem('french_desktop_settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.slots) {
          this.apiSlots = data.slots;
          this.activeSlot = data.activeSlot || 1;
        } else {
          this.apiSlots[1] = {
            name: data.apiModel || 'gpt-4o',
            apiUrl: data.apiUrl || '',
            apiKey: data.apiKey || ''
          };
          this.activeSlot = 1;
        }
        this.fillInputsFromSlot(this.activeSlot);
      } catch (e) {}
    } else {
      this.renderSelectOptions();
    }
  },

  // 测试 API 连通性
  async testApiConnection() {
    const apiKey = document.getElementById('set-api-key').value.trim();
    let apiUrl = document.getElementById('set-api-url').value.trim() || 'https://api.openai.com/v1';
    const model = document.getElementById('set-slot-name').value.trim() || 'gpt-3.5-turbo';

    if (!apiKey) {
      if (window.Toast) Toast.show({ message: '请先输入 API Key', type: 'error', duration: 2500 });
      else alert('请先输入 API Key！');
      return;
    }

    const toastHandle = window.Toast 
      ? Toast.show({ message: '测试中...', type: 'loading' }) 
      : null;

    const targetUrl = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;

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
        if (toastHandle) toastHandle.update('success', '测试成功', 3000);
        else alert('测试成功！');
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error?.message || `错误码: ${response.status}`;
        if (toastHandle) toastHandle.update('error', `测试失败: ${msg}`, 4000);
        else alert(`测试失败: ${msg}`);
      }
    } catch (err) {
      if (toastHandle) toastHandle.update('error', '网络连接失败', 4000);
      else alert(`网络错误: ${err.message}`);
    }
  },

  exportData() {
    try {
      this.saveCurrentInputsToSlot(this.activeSlot);
      const settingsData = JSON.parse(localStorage.getItem('french_desktop_settings') || '{}');
      const backupData = {
        version: '1.0',
        exportTime: new Date().toLocaleString(),
        settings: settingsData
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `FrenchDesktop_Backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      alert('导出备份失败：' + e.message);
    }
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
          if (window.AuthManager && AuthManager.currentUser) {
            AuthManager.saveUserData('settings', imported.settings);
          }
          this.loadSettings();
          if (window.Toast) Toast.show({ message: '数据恢复成功', type: 'success', duration: 2000 });
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

// 注册应用
if (window.AppManager) {
  AppManager.register('settings', SettingsApp);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.AppManager) {
      AppManager.register('settings', SettingsApp);
    }
  });
}

/**
 * 1. 头像上传与 Base64 本地化存储函数
 */
SettingsApp.handleAvatarUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 使用 FileReader 将图片文件转换为 Base64 编码字符串
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Avatar = e.target.result; // 获取到的 Base64 文本数据

    // 1. 实时更新页面上所有头像 <img> 标签的显示
    const avatarImgs = document.querySelectorAll('.user-avatar-img');
    avatarImgs.forEach(img => img.src = base64Avatar);

    // 2. 存入公共缓存
    localStorage.setItem('french_desktop_avatar', base64Avatar);

    // 3. 同步保存到当前登录用户的数据空间中（只要不手动退出登录，刷新后依然存在）
    if (window.AuthManager && AuthManager.currentUser) {
      AuthManager.saveUserData('avatar', base64Avatar);
    }

    // 弹出成功提示
    if (window.Toast) {
      Toast.show({ message: '头像已保存', type: 'success', duration: 2000 });
    }
  };

  reader.readAsDataURL(file);
};
