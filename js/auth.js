// ============================================
// GOSPACE LABS — Firebase Google Authentication
// Restricted to @gospace.tech domain
// ============================================

(function () {
  "use strict";

  let currentUser = null;

  // Initialize Firebase
  function initFirebase() {
    if (!firebase.apps.length) {
      firebase.initializeApp(GOSPACE_CONFIG.firebase);
    }
  }

  // Create login overlay
  function createLoginOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "gospace-login-overlay";
    overlay.innerHTML = `
      <div class="gospace-login-card">
        <div class="gospace-login-logo">GOSPACE</div>
        <h2>Prihlásenie</h2>
        <p>Použi svoj firemný Google účet<br><strong>@gospace.tech</strong></p>
        <button id="gospace-google-login" class="gospace-login-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" style="margin-right:10px">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Prihlásiť sa cez Google
        </button>
        <div id="gospace-login-error" class="gospace-login-error"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("gospace-google-login").addEventListener("click", handleGoogleLogin);
  }

  // Create user bar (shown when logged in)
  function createUserBar(user) {
    // Remove existing bar if any
    const existing = document.getElementById("gospace-user-bar");
    if (existing) existing.remove();

    const bar = document.createElement("div");
    bar.id = "gospace-user-bar";
    bar.innerHTML = `
      <div class="gospace-user-info">
        <img src="${user.photoURL || ""}" alt="" class="gospace-user-avatar"
             onerror="this.style.display='none'">
        <span class="gospace-user-name">${user.displayName || user.email}</span>
      </div>
      <button id="gospace-logout-btn" class="gospace-logout-btn">Odhlásiť sa</button>
    `;
    document.body.appendChild(bar);

    document.getElementById("gospace-logout-btn").addEventListener("click", handleLogout);
  }

  // Handle Google Login
  async function handleGoogleLogin() {
    const errorEl = document.getElementById("gospace-login-error");
    errorEl.textContent = "";

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ hd: GOSPACE_CONFIG.allowedDomain });

      const result = await firebase.auth().signInWithPopup(provider);
      const email = result.user.email;

      // Verify domain
      if (!email.endsWith("@" + GOSPACE_CONFIG.allowedDomain)) {
        await firebase.auth().signOut();
        errorEl.textContent = `Prístup povolený len pre @${GOSPACE_CONFIG.allowedDomain}`;
        return;
      }
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        return;
      }
      errorEl.textContent = "Chyba prihlásenia: " + error.message;
    }
  }

  // Handle Logout
  async function handleLogout() {
    await firebase.auth().signOut();
    window.location.reload();
  }

  // Auth state listener
  function setupAuthListener() {
    firebase.auth().onAuthStateChanged(function (user) {
      const overlay = document.getElementById("gospace-login-overlay");

      if (user && user.email.endsWith("@" + GOSPACE_CONFIG.allowedDomain)) {
        currentUser = user;
        if (overlay) overlay.style.display = "none";
        document.body.classList.add("gospace-authenticated");
        createUserBar(user);

        // Dispatch custom event for other modules
        window.dispatchEvent(new CustomEvent("gospace-auth-ready", { detail: { user } }));
      } else {
        currentUser = null;
        if (overlay) overlay.style.display = "flex";
        document.body.classList.remove("gospace-authenticated");
        if (user) {
          firebase.auth().signOut();
        }
      }
    });
  }

  // Get current user (public API)
  window.gospace = window.gospace || {};
  window.gospace.getCurrentUser = function () {
    return currentUser;
  };

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    initFirebase();
    createLoginOverlay();
    setupAuthListener();
  });
})();
