/**
 * Embellir 美化应用模块
 */
const EmbellirApp = {
  id: 'embellir',
  containerEl: null,

  // 预设壁纸选项（仅作供选择的项目）
  wallpapers: [
    { id: 'wp1', name: 'Rétro Gold', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
    { id: 'wp2', name: 'Paris Night', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { id: 'wp3', name: 'Minimal Fog', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' }
  ],

  currentWallpaper: '',
  isInfoBarEnabled: true,

  // 1. 渲染应用 View
  render() {
    if (this.containerEl) return;

    const appHTML = `
      <div class="app-view-embellir" id="app-view-embellir">
        <!-- 顶部导航栏 -->
        <div class="app-nav-bar">
          <button class="app-back-btn" onclick="AppManager.backToHome()" title="Retour">
            <img src="https://i.ibb.co/Kc8JLNTX/1782649743993.png" class="app-back-img" alt="Back">
          </button>
          <div class="app-page-title">
            <span class="en">Embellir</span>
          </div>
          <div style="width: 40px;"></div>
        </div>

        <!-- 内容区域 -->
        <div style="flex: 1; overflow-y: auto; padding-bottom: 20px;">
          <!-- 1. 桌面顶部信息栏控制 -->
          <div class="embellir-group">
            <div class="embellir-switch-row">
              <span class="switch-label">显示桌面顶部信息栏</span>
              <label class="custom-switch">
                <input type="checkbox" id="embellir-infobar-toggle" onchange="EmbellirApp.toggleInfoBar(this.checked)">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- 2. 壁纸更换面板 -->
          <div class="embellir-group">
            <div class="embellir-group-title">桌面壁纸</div>
            <div class="wallpaper-grid" id="wallpaper-grid">
              <!-- 自定义上传框 -->
              <div class="wallpaper-item wallpaper-upload-btn" onclick="document.getElementById('custom-wallpaper-input').click()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>自定义</span>
              </div>
              <input type="file" id="custom-wallpaper-input" accept="image/*" style="display:none;" onchange="EmbellirApp.handleCustomWallpaper(event)">
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('desktop').insertAdjacentHTML('beforeend', appHTML);
    this.containerEl = document.getElementById('app-view-embellir');
    this.renderWallpapers();
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

  // 渲染壁纸列表
  renderWallpapers() {
    const grid = document.getElementById('wallpaper-grid');
    if (!grid) return;

    const uploadBtn = grid.querySelector('.wallpaper-upload-btn');
    grid.innerHTML = '';
    grid.appendChild(uploadBtn);

    this.wallpapers.forEach(wp => {
      const item = document.createElement('div');
      item.className = `wallpaper-item ${this.currentWallpaper === wp.url ? 'active' : ''}`;
      item.style.backgroundImage = `url('${wp.url}')`;
      item.onclick = () => this.setWallpaper(wp.url);
      grid.appendChild(item);
    });
  },

  // 设置桌面背景（只有主动选择时调用）
  setWallpaper(url) {
    if (!url) return;
    this.currentWallpaper = url;
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.style.backgroundImage = `url('${url}')`;
      desktop.style.backgroundSize = 'cover';
      desktop.style.backgroundPosition = 'center';
    }

    this.renderWallpapers();

    localStorage.setItem('embellir_wallpaper', url);
    if (window.AuthManager && AuthManager.currentUser) {
      AuthManager.saveUserData('embellir_wallpaper', url);
    }
  },

  // 处理自定义图片上传
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

  // 切换顶部信息栏显示
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
    // 1. 壁纸恢复（若之前没保存过，则不修改默认背景）
    let savedWp = null;
    if (window.AuthManager && AuthManager.currentUser) {
      const userKey = `user_${AuthManager.currentUser.uid}_data`;
      try {
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        savedWp = userData['embellir_wallpaper'];
      } catch(e) {}
    }
    if (!savedWp) savedWp = localStorage.getItem('embellir_wallpaper');

    if (savedWp) {
      this.setWallpaper(savedWp);
    }

    // 2. 信息栏开关恢复
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

  // 顶栏实时时间与电量
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
      });
    }
  }
};

// 注册应用并开启顶栏服务
document.addEventListener('DOMContentLoaded', () => {
  if (window.AppManager) {
    AppManager.register('embellir', EmbellirApp);
  }
  EmbellirApp.initInfoBarService();
  setTimeout(() => {
    EmbellirApp.loadState();
  }, 100);
});
