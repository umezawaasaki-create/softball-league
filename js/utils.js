// ============================================================
// ユーティリティ関数
// ============================================================

function formatDate(raw) {
  if (!raw) return '日程未定';
  const s = String(raw).trim();
  const isoT = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (isoT) {
    const yr = parseInt(isoT[1]), mo = parseInt(isoT[2]), dy = parseInt(isoT[3]);
    const hh = isoT[4], mm = isoT[5];
    if (s.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(s)) {
      const d = new Date(s);
      const jst = new Date(d.getTime() + 9*60*60*1000);
      const wd = ['日','月','火','水','木','金','土'][jst.getUTCDay()];
      return (jst.getUTCMonth()+1) + '月' + jst.getUTCDate() + '日(' + wd + ') '
        + String(jst.getUTCHours()).padStart(2,'0') + ':' + String(jst.getUTCMinutes()).padStart(2,'0');
    } else {
      const d = new Date(yr, mo-1, dy);
      const wd = ['日','月','火','水','木','金','土'][d.getDay()];
      return mo + '月' + dy + '日(' + wd + ') ' + hh + ':' + mm;
    }
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(parseInt(iso[1]), parseInt(iso[2])-1, parseInt(iso[3]));
    const wd = ['日','月','火','水','木','金','土'][d.getDay()];
    return parseInt(iso[2]) + '月' + parseInt(iso[3]) + '日(' + wd + ')';
  }
  return s;
}

function shortName(name) {
  if (name.length <= 5) return name;
  return name.replace('/','/<br>');
}

function showSyncStatus(state) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  const map = {
    loading: { text: '⟳ 読み込み中...', color: 'var(--gray)' },
    saving:  { text: '⟳ 保存中...',     color: 'var(--yellow)' },
    saved:   { text: '✓ 保存済み',       color: 'var(--green)' },
    loaded:  { text: '✓ 最新データ',     color: 'var(--green)' },
    error:   { text: '⚠ 通信エラー',     color: 'var(--red)' },
  };
  const s = map[state] || {};
  el.textContent = s.text;
  el.style.color = s.color;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

const WEEKDAYS = ['日','月','火','水','木','金','土'];
