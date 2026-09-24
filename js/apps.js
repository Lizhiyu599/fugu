/**
 * 应用统一调度中心 (AppManager)
 */
const AppManager = {
  apps: {},
  activeAppId: null,

  // 1. 注册应用
  register(id, appInstance) {
    this.apps[id] = appInstance;
  },

  // 2. 启动/唤起应用 View
  launch(id) {
    if (!this.apps[id]) {
      console.error(`应用 [${id}] 未注册！`);
      return;
    }

    // 如果已有激活的应用，先关闭
    if (this.activeAppId && this.activeAppId !== id) {
      this.close(this.activeAppId);
    }

    this.activeAppId = id;
    this.apps[id].open();
  },

  // 3. 关闭应用
  close(id) {
    const appId = id || this.activeAppId;
    if (appId && this.apps[appId]) {
      this.apps[appId].close();
      if (this.activeAppId === appId) {
        this.activeAppId = null;
      }
    }
  },

  // 4. 返回桌面（通用方法）
  backToHome() {
    if (this.activeAppId) {
      this.close(this.activeAppId);
    }
  }
};

// 暴露到全局 window
window.AppManager = AppManager;
