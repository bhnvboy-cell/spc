/* Auth UI for SPC Trainer — user bar, logout, change password, admin link */
(function () {
  var userChip = document.getElementById('userChip');
  var btnLogout = document.getElementById('btnLogout');
  var btnChangePw = document.getElementById('btnChangePw');
  var btnAdmin = document.getElementById('btnAdmin');
  var pwModal = document.getElementById('pwModal');
  var appToast = document.getElementById('appToast');
  var toastTimer = null;

  function T(key) { return (typeof t === 'function') ? t(key) : key; }

  function toast(msg, isErr) {
    if (!appToast) return;
    appToast.textContent = msg;
    appToast.style.display = 'block';
    appToast.className = 'toast-msg show' + (isErr ? ' err' : '');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { appToast.style.display = 'none'; }, 2800);
  }

  function show(el) { if (el) el.hidden = false; }

  function loadMe() {
    return fetch('/api/me', { credentials: 'same-origin' })
      .then(function (r) {
        if (r.status === 401) { location.href = '/login'; return null; }
        return r.json();
      })
      .then(function (me) {
        if (!me) return;
        userChip.textContent = me.username + (me.role === 'admin' ? ' · ' + (typeof t === 'function' ? t('u.admin') : 'admin') : '');
        show(userChip);
        show(btnLogout);
        show(btnChangePw);
        if (me.role === 'admin') show(btnAdmin);
      })
      .catch(function () {});
  }

  btnLogout.addEventListener('click', function () {
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: '{}'
    }).finally(function () { location.href = '/login'; });
  });

  btnChangePw.addEventListener('click', function () {
    pwModal.style.display = 'flex';
    document.getElementById('cpCurrent').value = '';
    document.getElementById('cpNew').value = '';
    document.getElementById('cpNew2').value = '';
    document.getElementById('cpCurrent').focus();
  });
  document.getElementById('cpCancel').addEventListener('click', function () {
    pwModal.style.display = 'none';
  });
  document.getElementById('cpSave').addEventListener('click', function () {
    var c = document.getElementById('cpCurrent').value;
    var n = document.getElementById('cpNew').value;
    var n2 = document.getElementById('cpNew2').value;
    if (n !== n2) { toast(T('auth.mismatch'), true); return; }
    if (!n || n.length < 6) { toast(T('auth.min6'), true); return; }
    fetch('/api/change-password', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ current: c, new: n })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) { toast(res.d.error || T('auth.failed'), true); return; }
        toast(T('auth.updated'));
        pwModal.style.display = 'none';
      })
      .catch(function () { toast(T('auth.neterr'), true); });
  });

  loadMe();
})();
