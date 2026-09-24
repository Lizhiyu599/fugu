/**
 * 桌面应用调度中心 (App Manager)
 * 后续所有新增加的软件都在此处统一注册与唤起
 */

const AppManager = {
  // 当前已注册的应用列表
  apps: {},

  // 注册新应用
  register(appId, appConfig) {
    this.apps[appId] = appConfig;
  },

  // 唤起打开应用
  open(appId) {
    if (this.apps[appId] && typeof this.apps[appId].open === 'function') {
      this.apps[appId].open();
    } else {
      console.error(`应用 [${appId}] 未注册或无法打开`);
    }
  },

  // 关闭应用
  close(appId) {
    if (this.apps[appId] && typeof this.apps[appId].close === 'function') {
      this.apps[appId].close();
    }
  }
};

// 初始化桌面所有应用的点击监听
document.addEventListener('DOMContentLoaded', () => {
  // 注册【设置】应用
  AppManager.register('settings', {
    open: () => typeof SettingsApp !== 'undefined' && SettingsApp.open(),
    close: () => typeof SettingsApp !== 'undefined' && SettingsApp.close()
  });
});
