/**
 * Embellir 美化应用模块
 */
const EmbellirApp = {
  id: 'embellir',
  containerEl: null,
  isInfoBarEnabled: true,

  // 1. 渲染应用 View
  render() {
    if (this.containerEl) return;

    const appHTML = `
      <div class="app-view-embellir" id="app-view-embellir">
        <!-- 顶部导航栏（已留出顶栏高度） -->
        <div class="app-nav-bar">
          <button class="app-back-btn" onclick="AppManager.backToHome()" title="Retour">
            <img src="https://i.ibb.co/Kc8JLNTX/1782649743993.png" class="app-back-img" alt="Back">
          </button>
          <div class="app-page-title">
            <span>Embellir</span>
          </div>
          <div style="width: 24px;"></div>
        </div>

        <!-- 内容区域 -->
        <div style="flex: 1; overflow-y: auto; padding-bottom: 30px;">
          <!-- 1. 桌面顶部信息栏开关 -->
          <div class="embellir-group">
            <div class="embellir-switch-row">
              <span class="switch-label">显示顶部信息栏</span>
              <label class="custom-switch">
                <input type="checkbox" id="embellir-infobar-toggle" onchange="EmbellirApp.toggleInfoBar(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- 2. 自定义桌面壁纸 -->
          <div class="embellir-group">
            <div class="embellir-group-title">桌面壁纸</div>
            
            <!-- 上传大卡片 -->
            <div class="wallpaper-upload-card" onclick="EmbellirApp.triggerWallpaperUpload()">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="4"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <div class="upload-title">从相册选择壁纸</div>
              <div class="upload-sub">点击打开相册更换桌面背景</div>
            </div>

            <input type="file" id="embellir-wallpaper-input" accept="image/*" style="display:none;" onchange="EmbellirApp.handleCustomWallpaper(event)">

            <button class="wallpaper-reset-btn" onclick="EmbellirApp.resetToDefaultWallpaper()">恢复默认初始壁纸</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('desktop').insertAdjacentHTML('beforeend', appHTML);
    this.containerEl = document.getElementById('app-view-embellir');
  },

  open() {
    this.render();
    this.loadState();
    setTimeout(() => {
      if (this.containerEl) this.containerEl.classList.add('active');
    }, 10);
  },

  close() {
    if (this.containerEl) {
      this.containerEl.classList.remove('active');
    }
  },

  // 触发相册/图库选择
  triggerWallpaperUpload() {
    const input = document.getElementById('embellir-wallpaper-input');
    if (input) {
      input.click();
    }
  },

  // 处理图库图片选择
  handleCustomWallpaper(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target.result;
      this.setWallpaper(base64Url);
    };
    reader.readAsDataURL(file);
  },

  // 设置壁纸
  setWallpaper(url) {
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.style.backgroundImage = `url('${url}')`;
      desktop.style.backgroundSize = 'cover';
      desktop.style.backgroundPosition = 'center';
    }

    localStorage.setItem('embellir_custom_wallpaper', url);
    if (window.AuthManager && AuthManager.currentUser) {
      AuthManager.saveUserData('embellir_custom_wallpaper', url);
    }
  },

  // 重置回初始默认壁纸
  resetToDefaultWallpaper() {
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.style.backgroundImage = ''; // 清除内联样式，还原 CSS 中最开始设置的原始背景
    }

    localStorage.removeItem('embellir_custom_wallpaper');
    if (window.AuthManager && AuthManager.currentUser) {
      AuthManager.saveUserData('embellir_custom_wallpaper', null);
    }
  },

  // 切换顶部信息栏显示状态
  toggleInfoBar(enabled) {
    this.isInfoBarEnabled = enabled;
    const infoBar = document.getElementById('top-info-bar');
    if (infoBar) {
      if (enabled) infoBar.classList.remove('hidden');
      else infoBar.classList.add('hidden');
    }

    localStorage.setItem('embellir_infobar_enabled', enabled ? 'true' : 'false');
    if (window.AuthManager && AuthManager.currentUser) {
      AuthManager.saveUserData('embellir_infobar_enabled', enabled);
    }
  },

  // 恢复状态
  loadState() {
    // 1. 壁纸恢复（如果用户没上传过自定义壁纸，绝不覆盖初始壁纸）
    let savedWp = null;
    if (window.AuthManager && AuthManager.currentUser) {
      const userKey = `user_${AuthManager.currentUser.uid}_data`;
      try {
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        savedWp = userData['embellir_custom_wallpaper'];
      } catch(e) {}
    }
    if (!savedWp) savedWp = localStorage.getItem('embellir_custom_wallpaper');

    if (savedWp) {
      this.setWallpaper(savedWp);
    }

    // 2. 信息栏开关状态恢复
    let savedBarState = null;
    if (window.AuthManager && AuthManager.currentUser) {
      const userKey = `user_${AuthManager.currentUser.uid}_data`;
      try {
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        savedBarState = userData['embellir_infobar_enabled'];
      } catch(e) {}
    }
    if (savedBarState === null || savedBarState === undefined) {
      const localVal = localStorage.getItem('embellir_infobar_enabled');
      savedBarState = localVal === null ? true : (localVal === 'true');
    }

    this.isInfoBarEnabled = !!savedBarState;
    const toggleEl = document.getElementById('embellir-infobar-toggle');
    if (toggleEl) toggleEl.checked = this.isInfoBarEnabled;
    this.toggleInfoBar(this.isInfoBarEnabled);
  },

  // 实时更新顶部信息栏时间和电量
  initInfoBarService() {
    const updateTime = () => {
      const timeEl = document.getElementById('info-time-text');
      if (!timeEl) return;
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      timeEl.textContent = `${hours}:${minutes}`;
    };

    updateTime();
    setInterval(updateTime, 1000);

    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        const updateBattery = () => {
          const levelEl = document.getElementById('info-battery-level');
          if (levelEl) {
            levelEl.textContent = `${Math.round(battery.level * 100)}%`;
          }
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
      }).catch(() => {});
    }
  }
};

// 初始化注册
document.addEventListener('DOMContentLoaded', () => {
  if (window.AppManager) {
    AppManager.register('embellir', EmbellirApp);
  }
  EmbellirApp.initInfoBarService();
  setTimeout(() => {
    EmbellirApp.loadState();
  }, 100);
});
