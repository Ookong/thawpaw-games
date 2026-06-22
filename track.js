/**
 * 🐾 Thawpaw Games — 浏览追踪共享脚本
 * 在每个页面引入：<script src="track.js" defer></script>
 * 自动记录：玩家 ID + 当前页面 + 事件类型
 * 调用方式：window.thawpawTrack('view') 或 window.thawpawTrack('play')
 */
(function () {
  // GAS URL 由 admin.html 部署时填入（通过 localStorage 共享）
  function getGasUrl() {
    try { return localStorage.getItem('thawpawGasUrl') || ''; } catch (e) { return ''; }
  }

  function getPlayerId() {
    try {
      var id = localStorage.getItem('thawpawPlayerId');
      if (!id) {
        id = String(Math.floor(10000000 + Math.random() * 89999999));
        localStorage.setItem('thawpawPlayerId', id);
      }
      return id;
    } catch (e) { return 'anonymous'; }
  }

  function getSessionId() {
    try {
      var sid = sessionStorage.getItem('thawpawSessionId');
      if (!sid) {
        sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem('thawpawSessionId', sid);
      }
      return sid;
    } catch (e) { return 'sess_' + Date.now(); }
  }

  function getPageName() {
    var path = window.location.pathname;
    if (path.endsWith('/') || path.endsWith('/index.html')) return 'portal';
    if (path.indexOf('snake') >= 0) return 'snake';
    if (path.indexOf('moonstone') >= 0) return 'moonstone';
    if (path.indexOf('dungeon') >= 0) return 'dungeon';
    if (path.indexOf('starclan') >= 0) return 'starclan';
    if (path.indexOf('warrior') >= 0) return 'warrior';
    if (path.indexOf('admin') >= 0) return 'admin';
    return path.split('/').pop() || 'unknown';
  }

  function send(evType) {
    var url = getGasUrl();
    if (!url) return; // GAS 未配置时不发请求
    var payload = {
      action: 'track',
      id: getPlayerId(),
      page: getPageName(),
      event: evType,
      sessionId: getSessionId()
    };
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  // 自动追踪 view（页面加载时）
  window.thawpawTrack = function (evType) { send(evType || 'view'); };
  if (document.readyState === 'complete') {
    send('view');
  } else {
    window.addEventListener('load', function () { send('view'); });
  }
})();