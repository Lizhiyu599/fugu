/**
 * 账号与认证管理模块 (AuthManager)
 */
const AuthManager = {
  currentUser: null,

  // ⚠️【授权白名单】允许注册的 UID 列表（最多11位数字）
  // 当有新用户需要注册时，请在这里加入他的 UID
  allowedUIDs: [
    '2608489391',
    '12345678901'
  ],

  // ⚠️ 超级管理员密码（用于帮用户重置密码）
  adminSecret: 'admin123',

  // 1. 初始化检查
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

  // 2. 注入 Modal 结构
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
            <!-- 昵称 -->
            <div class="auth-field" id="field-nickname">
              <label>昵称 / Nom</label>
              <input type="text" id="auth-nickname" placeholder="例如：用户" required>
            </div>

            <!-- UID 输入框（限制11位数字） -->
            <div class="auth-field">
              <label id="label-uid">账号 UID (数字)</label>
              <input 
                type="text" 
                id="auth-uid" 
                placeholder="请输入您的 11 位以内授权 UID" 
                maxlength="11"
                pattern="[0-9]*"
                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                required 
                autocomplete="username"
              >
            </div>

            <!-- 密码 -->
            <div class="auth-field">
              <label>密码 / Mot de passe</label>
              <input type="password" id="auth-password" placeholder="请输入密码" required autocomplete="current-password">
            </div>

            <!-- 提交通用按钮 -->
            <button type="submit" class="auth-submit-btn" id="auth-submit-btn">注册</button>
          </form>

          <div class="auth-toggle-box">
            <div>
              <span id="auth-toggle-text">已有账号？</span>
              <a href="javascript:void(0)" onclick="AuthManager.toggleMode()" id="auth-toggle-link">立即登录</a>
            </div>
            <a href="javascript:void(0)" class="forgot-pwd-link" id="forgot-pwd-btn" style="display:none;" onclick="AuthManager.handleForgotPassword()">忘记密码？</a>
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
    const forgotBtn = document.getElementById('forgot-pwd-btn');
    const uidInput = document.getElementById('auth-uid');

    if (this.isRegisterMode) {
      nicknameField.style.display = 'flex';
      nicknameInput.required = true;
      subtitle.innerText = '请创建您的本地专属账号';
      submitBtn.innerText = '注册';
      toggleText.innerText = '已有账号？';
      toggleLink.innerText = '立即登录';
      forgotBtn.style.display = 'none';
      uidInput.placeholder = '请输入您的 11 位以内授权 UID';
    } else {
      nicknameField.style.display = 'none';
      nicknameInput.required = false;
      subtitle.innerText = '请登录您的账号';
      submitBtn.innerText = '登录';
      toggleText.innerText = '首次使用？';
      toggleLink.innerText = '注册账号';
      forgotBtn.style.display = 'inline';
      uidInput.placeholder = '请输入 UID';
    }
  },

  showAuthModal() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) modal.classList.add('active');
  },

  hideAuthModal() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) modal.classList.remove('active');
  },

  // 4. 表单提交（注册与登录校验）
  handleSubmit(event) {
    event.preventDefault();
    const uid = document.getElementById('auth-uid').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const nickname = document.getElementById('auth-nickname').value.trim();

    if (!uid) return alert('请输入 UID！');

    const usersStore = JSON.parse(localStorage.getItem('french_desktop_users_db') || '{}');

    if (this.isRegisterMode) {
      // 校验 1：是否在管理员授权白名单中
      if (!this.allowedUIDs.includes(uid)) {
        alert(`UID [${uid}] 未获授权注册！\n请联系管理员录入您的 UID 后再试。`);
        return;
      }

      // 校验 2：是否已经被注册
      if (usersStore[uid]) {
        alert(`UID [${uid}] 已经被注册过，请直接登录！`);
        this.toggleMode();
        return;
      }

      const newUser = {
        uid: uid,
        username: uid,
        password: password,
        nickname: nickname || '用户',
        createdAt: new Date().toISOString()
      };

      usersStore[uid] = newUser;
      localStorage.setItem('french_desktop_users_db', JSON.stringify(usersStore));
      
      this.setCurrentUser(newUser);
      alert('注册成功！欢迎使用。');
    } else {
      // 登录模式
      const user = usersStore[uid];
      if (!user || user.password !== password) {
        alert('UID 或密码错误！');
        return;
      }

      this.setCurrentUser(user);
    }

    this.hideAuthModal();
  },

  // 5. 忘记密码重置通道（管理员模式）
  handleForgotPassword() {
    const uid = prompt('请输入您需要找回密码的 UID：');
    if (!uid) return;

    const usersStore = JSON.parse(localStorage.getItem('french_desktop_users_db') || '{}');
    if (!usersStore[uid]) {
      alert('未找到该 UID 对应的账户记录！');
      return;
    }

    const adminKey = prompt('为了安全，请输入【管理员重置密钥】：\n（提示：初始密钥为 admin123）');
    if (adminKey !== this.adminSecret) {
      alert('密钥校验失败，无法重置密码！');
      return;
    }

    const newPwd = prompt(`验证成功！请输入 UID [${uid}] 的新密码：`);
    if (!newPwd || !newPwd.trim()) {
      alert('密码不能为空！');
      return;
    }

    usersStore[uid].password = newPwd.trim();
    localStorage.setItem('french_desktop_users_db', JSON.stringify(usersStore));
    alert(`UID [${uid}] 的密码已成功修改为新密码！现在可以使用新密码登录了。`);
  },

  // 6. 设为当前登录用户并加载其数据
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('french_desktop_current_user', JSON.stringify(user));
    this.applyUserData();
  },

  // 渲染并应用用户绑定的数据（API配置、头像、名字）
  applyUserData() {
    if (!this.currentUser) return;
    const userKey = `user_${this.currentUser.uid}_data`;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');

    // 1. 加载 API 设置
    if (userData.settings) {
      localStorage.setItem('french_desktop_settings', JSON.stringify(userData.settings));
      if (window.SettingsApp && typeof SettingsApp.loadSettings === 'function') {
        SettingsApp.loadSettings();
      }
    }

    // 2. 加载用户头像
    const userAvatar = userData.avatar || localStorage.getItem('widget_user_avatar');
    if (userAvatar) {
      const avatarImgs = document.querySelectorAll('#user-avatar-img, .user-avatar-img');
      avatarImgs.forEach(img => img.src = userAvatar);
    }

    // 3. 加载用户名字
    const userName = userData.name || userData.nickname || this.currentUser.nickname || localStorage.getItem('widget_user_name');
    if (userName) {
      const nameEl = document.getElementById('user-name-text');
      if (nameEl) {
        if (nameEl.tagName === 'INPUT') {
          nameEl.value = userName;
        } else {
          nameEl.innerText = userName;
        }
      }
    }
  },

  // 保存当前用户的专项数据
  saveUserData(categoryKey, data) {
    if (!this.currentUser) return;
    const userKey = `user_${this.currentUser.uid}_data`;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
    userData[categoryKey] = data;
    localStorage.setItem(userKey, JSON.stringify(userData));
  },

  logout() {
    localStorage.removeItem('french_desktop_current_user');
    location.reload();
  }
};

// 启动执行
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
});
