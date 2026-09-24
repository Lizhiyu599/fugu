/**
 * 桌面应用调度中心 (AppManager)
 * 负责统一掌控“进入应用”、“退出返回桌面”的生命周期
 */

const AppManager = {
  currentAppId: null,
  apps: {},

  // 注册新应用
  register(appId, appInstance) {
    this.apps[appId] = appInstance;
  },

  // 进入软件 View
  launch(appId) {
    if (this.apps[appId] && typeof this.apps[appId].open === 'function') {
      this.currentAppId = appId;
      this.apps[appId].open();
    } else {
      console.error(`应用 [${appId}] 未注册或无法打开`);
    }
  },

  // 点击左上角箭头返回桌面
  backToHome() {
    if (this.currentAppId && this.apps[this.currentAppId]) {
      this.apps[this.currentAppId].close();
      this.currentAppId = null;
    }
  }
};

// 页面加载完成后，注册已有的桌面应用
document.addEventListener('DOMContentLoaded', () => {
  // 注册“设置”软件
  if (typeof SettingsApp !== 'undefined') {
    AppManager.register('settings', SettingsApp);
  }
});
