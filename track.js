/**
 * 🐾 Thawpaw Games — 浏览追踪共享脚本
 * 在每个页面引入：<script src="track.js" defer></script>
 * 自动记录：玩家 ID + 当前页面 + 事件类型
 * 调用方式：window.thawpawTrack('view') 或 window.thawpawTrack('play')
 *
 * 后端：Cloudflare Worker (https://tpg-hq.wangjieqi.workers.dev/track)
 * URL 配置在 localStorage key 'tpgCfBackendUrl'
 */
(function () {
  var CF_BACKEND_KEY = 'tpgCfBackendUrl';
  var DEFAULT_CF_URL = 'https://tpg-hq.wangjieqi.workers.dev';

  function getBackendBase() {
    try {
      var u = localStorage.getItem(CF_BACKEND_KEY) || DEFAULT_CF_URL;
      return u.replace(/\/+$/, '');
    } catch (e) {
      return DEFAULT_CF_URL;
    }
  }

  function getPlayerId() {
    try {
      var id = localStorage.getItem('thawpawActiveId');
      if (!id) {
        // 老代码兼容：尝试 thawpawPlayerId
        id = localStorage.getItem('thawpawPlayerId');
      }
      if (!id) {
        // 没有活动 ID，生成一个（不应该发生在新版 portal 里）
        id = String(Math.floor(10000000 + Math.random() * 90000000));
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
    if (path.indexOf('admin') >= 0 || path.indexOf('hq') >= 0) return 'admin';
    return path.split('/').pop() || 'unknown';
  }

  function send(evType) {
    var url = getBackendBase() + '/track';
    var payload = {
      id: getPlayerId(),
      page: getPageName(),
      event: evType || 'view',
      sessionId: getSessionId()
    };
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors',
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
