/**
 * 账号与认证管理模块 (AuthManager)
 */
const AuthManager = {
  currentUser: null,

  // 1. 系统初始化检查
  init() {
    this.renderAuthModal();
    const savedUser = localStorage.getItem('french_desktop_current_user');
    
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.applyUserData();
      } catch(e) {
        this.showAuthModal();
      }
    } else {
      this.showAuthModal();
    }
  },

  // 2. 动态注入注册/登录模态框 DOM
  renderAuthModal() {
    if (document.getElementById('auth-modal-overlay')) return;

    const modalHTML = `
      <div class="auth-modal-overlay" id="auth-modal-overlay">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Bienvenue</h2>
            <p id="auth-subtitle">请创建您的本地专属账号</p>
          </div>

          <form id="auth-form" onsubmit="AuthManager.handleSubmit(event)">
            <div class="auth-field" id="field-nickname">
              <label>昵称 / Nom</label>
              <input type="text" id="auth-nickname" placeholder="例如：黎魚" required>
            </div>

            <div class="auth-field">
              <label>账号 / Identifiant</label>
              <input type="text" id="auth-username" placeholder="请输入用户名" required autocomplete="username">
            </div>

            <div class="auth-field">
              <label>密码 / Mot de passe</label>
              <input type="password" id="auth-password" placeholder="请输入密码" required autocomplete="current-password">
            </div>

            <button type="submit" class="auth-submit-btn" id="auth-submit-btn">注册并开始使用</button>
          </form>

          <div class="auth-toggle-box">
            <span id="auth-toggle-text">已有账号？</span>
            <a href="javascript:void(0)" onclick="AuthManager.toggleMode()" id="auth-toggle-link">立即登录</a>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  isRegisterMode: true,

  // 3. 切换 注册 / 登录 模式
  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    const nicknameField = document.getElementById('field-nickname');
    const nicknameInput = document.getElementById('auth-nickname');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleLink = document.getElementById('auth-toggle-link');

    if (this.isRegisterMode) {
      nicknameField.style.display = 'block';
      nicknameInput.required = true;
      subtitle.innerText = '请创建您的本地专属账号';
      submitBtn.innerText = '注册并开始使用';
      toggleText.innerText = '已有账号？';
      toggleLink.innerText = '立即登录';
    } else {
      nicknameField.style.display = 'none';
      nicknameInput.required = false;
      subtitle.innerText = '请登录您的账号';
      submitBtn.innerText = '登录';
      toggleText.innerText = '首次使用？';
      toggleLink.innerText = '创建新账号';
    }
  },

  // 4. 显示/隐藏 弹窗
  showAuthModal() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) modal.classList.add('active');
  },

  hideAuthModal() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) modal.classList.remove('active');
  },

  // 5. 提交处理（注册 / 登录）
  handleSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const nickname = document.getElementById('auth-nickname').value.trim();

    const usersStore = JSON.parse(localStorage.getItem('french_desktop_users_db') || '{}');

    if (this.isRegisterMode) {
      // 注册逻辑
      if (usersStore[username]) {
        alert('该用户名已被注册，请直接登录！');
        return;
      }

      const newUser = {
        username: username,
        password: password, // 本地演示直接存储，生产环境建议 Hash
        nickname: nickname || username,
        createdAt: new Date().toISOString()
      };

      usersStore[username] = newUser;
      localStorage.setItem('french_desktop_users_db', JSON.stringify(usersStore));
      
      this.setCurrentUser(newUser);
      alert('注册成功！欢迎进入。');
    } else {
      // 登录逻辑
      const user = usersStore[username];
      if (!user || user.password !== password) {
        alert('账号或密码错误！');
        return;
      }

      this.setCurrentUser(user);
    }

    this.hideAuthModal();
  },

  // 6. 设置当前登录用户并广播加载数据
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('french_desktop_current_user', JSON.stringify(user));
    this.applyUserData();
  },

  // 7. 载入并应用当前账号专有数据
  applyUserData() {
    if (!this.currentUser) return;
    const userKey = `user_${this.currentUser.username}_data`;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');

    // 加载设置应用配置
    if (userData.settings) {
      localStorage.setItem('french_desktop_settings', JSON.stringify(userData.settings));
      if (window.SettingsApp && typeof SettingsApp.loadSettings === 'function') {
        SettingsApp.loadSettings();
      }
    }

    // 触发桌面数据加载事件（如有需要扩展）
    console.log(`已成功载入用户 [${this.currentUser.nickname}] 的个人数据`);
  },

  // 8. 实时保存当前用户数据的方法（供其他模块调用）
  saveUserData(categoryKey, data) {
    if (!this.currentUser) return;
    const userKey = `user_${this.currentUser.username}_data`;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
    userData[categoryKey] = data;
    localStorage.setItem(userKey, JSON.stringify(userData));
  },

  // 9. 退出登录
  logout() {
    localStorage.removeItem('french_desktop_current_user');
    location.reload();
  }
};

// 页面加载完成后启动账号检查
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
});
