/**
 * “设置”软件独立模块 (SettingsApp)
 * 支持 3 套 API 配置管理（当前使用 + 2个预设备用），并自动绑定 AuthManager
 */

const SettingsApp = {
  id: 'settings',
  containerEl: null,
  activeSlot: 1, // 当前正在编辑/查看的配置槽位 (1, 2, 3)

  // 1. 初始化并注入应用 HTML DOM 结构
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
          <!-- API 接口配置（支持3套预设） -->
          <div class="settings-group">
            <div class="settings-group-title" style="display: flex; justify-content: space-between; align-items: center;">
              <span>API 接口配置</span>
              <span style="font-size: 12px; color: #666;">（最多保存 3 套）</span>
            </div>

            <!-- 槽位切换 selector -->
            <div class="settings-field">
              <label>选择配置预设槽位</label>
              <select id="set-api-slot-select" style="height:38px; border-radius:8px; border:1px solid rgba(0,0,0,0.15); padding:0 10px; outline:none; background:#fff; font-size:13px;" onchange="SettingsApp.switchSlot(this.value)">
                <option value="1">配置 1 (当前主配置)</option>
                <option value="2">配置 2 (备用预设)</option>
                <option value="3">配置 3 (备用预设)</option>
              </select>
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

            <div class="settings-field">
              <label for="set-api-model">Model 模型名称</label>
              <input type="text" id="set-api-model" placeholder="gpt-4o / deepseek-chat">
            </div>

            <button class="st-btn" onclick="SettingsApp.testApiConnection()">测试当前测试槽位 API 连通性</button>
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

          <!-- 保存按钮 -->
          <div style="margin-top: auto; padding-top: 10px;">
            <button class="st-btn primary" style="width: 100%; height: 46px;" onclick="SettingsApp.saveSettings()">保存全部配置</button>
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

  // 4. 密码可见性切换
  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  },

  // 临时缓存 3 个槽位的数据结构
  apiSlots: {
    1: { apiUrl: '', apiKey: '', apiModel: '' },
    2: { apiUrl: '', apiKey: '', apiModel: '' },
    3: { apiUrl: '', apiKey: '', apiModel: '' }
  },

  // 切换槽位时先暂存当前输入框，再载入新槽位
  switchSlot(newSlot) {
    this.saveCurrentInputsToSlot(this.activeSlot);
    this.activeSlot = parseInt(newSlot);
    this.fillInputsFromSlot(this.activeSlot);
  },

  saveCurrentInputsToSlot(slotNum) {
    const key = document.getElementById('set-api-key').value.trim();
    const url = document.getElementById('set-api-url').value.trim();
    const model = document.getElementById('set-api-model').value.trim();
    this.apiSlots[slotNum] = { apiUrl: url, apiKey: key, apiModel: model };
  },

  fillInputsFromSlot(slotNum) {
    const data = this.apiSlots[slotNum] || { apiUrl: '', apiKey: '', apiModel: '' };
    document.getElementById('set-api-url').value = data.apiUrl || '';
    document.getElementById('set-api-key').value = data.apiKey || '';
    document.getElementById('set-api-model').value = data.apiModel || '';
  },

  // 5. 保存全部 3 套配置
  saveSettings() {
    this.saveCurrentInputsToSlot(this.activeSlot);

    const activeSlotSelect = document.getElementById('set-api-slot-select');
    const selectedActive = parseInt(activeSlotSelect ? activeSlotSelect.value : 1);

    const fullConfig = {
      activeSlot: selectedActive,
      slots: this.apiSlots,
      // 兼容旧接口：当前生效的核心配置即为选中的槽位配置
      apiKey: this.apiSlots[selectedActive].apiKey,
      apiUrl: this.apiSlots[selectedActive].apiUrl,
      apiModel: this.apiSlots[selectedActive].apiModel
    };

    // 本地存储
    localStorage.setItem('french_desktop_settings', JSON.stringify(fullConfig));

    // 绑定当前登录账号并持久化保存
    if (window.AuthManager && AuthManager.currentUser) {
      AuthManager.saveUserData('settings', fullConfig);
    }

    alert('3 套 API 配置已全部成功保存！');
    AppManager.backToHome();
  },

  // 6. 读取配置
  loadSettings() {
    const saved = localStorage.getItem('french_desktop_settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.slots) {
          this.apiSlots = data.slots;
          this.activeSlot = data.activeSlot || 1;
        } else {
          // 向下兼容单配置结构
          this.apiSlots[1] = {
            apiUrl: data.apiUrl || '',
            apiKey: data.apiKey || '',
            apiModel: data.apiModel || ''
          };
          this.activeSlot = 1;
        }

        const slotSelect = document.getElementById('set-api-slot-select');
        if (slotSelect) slotSelect.value = this.activeSlot;

        this.fillInputsFromSlot(this.activeSlot);
      } catch (e) {}
    }
  },

  // 7. 测试连通性
  async testApiConnection() {
    const apiKey = document.getElementById('set-api-key').value.trim();
    let apiUrl = document.getElementById('set-api-url').value.trim() || 'https://api.openai.com/v1';
    const model = document.getElementById('set-api-model').value.trim() || 'gpt-3.5-turbo';

    if (!apiKey) return alert('请先输入当前槽位的 API Key！');

    const targetUrl = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
    alert(`正在测试 [配置槽位 ${this.activeSlot}] 连通性，请稍候...`);

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

  // 8. 导出数据备份
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

  // 9. 恢复出厂设置
  resetAll() {
    if (confirm('确定要清空所有配置并恢复出厂设置吗？此操作不可撤销。')) {
      localStorage.clear();
      location.reload();
    }
  }
};

// 自动向全局调度中心注册
if (window.AppManager) {
  AppManager.register('settings', SettingsApp);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.AppManager) {
      AppManager.register('settings', SettingsApp);
    }
  });
}
