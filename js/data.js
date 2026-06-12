// ============================================================
// アプリケーションデータ
// ============================================================
let results      = {};
let grounds      = [];
let applications = [];
let isSaving     = false;

// ============================================================
// GASへの保存
// ============================================================
function sendToGAS(payload) {
  return new Promise((resolve) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GAS_URL;
    form.target = '_gas_iframe';
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.appendChild(input);

    let iframe = document.getElementById('_gas_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = '_gas_iframe';
      iframe.id = '_gas_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setTimeout(resolve, 2000);
  });
}

async function save() {
  if (!GAS_URL || GAS_URL === 'YOUR_GAS_URL_HERE') {
    localStorage.setItem('softball_results',      JSON.stringify(results));
    localStorage.setItem('softball_grounds',      JSON.stringify(grounds));
    localStorage.setItem('softball_applications', JSON.stringify(applications));
    return;
  }
  if (isSaving) return;
  isSaving = true;
  showSyncStatus('saving');
  try {
    const resultsArr = [];
    Object.entries(results).forEach(([key, games]) => {
      games.forEach((g, i) => {
        if (g) resultsArr.push({ pairKey: key, gameIdx: i, ...g });
      });
    });
    const payload = {
      action: 'saveAll',
      data: {
        results:      resultsArr,
        grounds:      grounds,
        applications: applications
      }
    };
    await sendToGAS(payload);
    showSyncStatus('saved');
  } catch(e) {
    console.error('保存エラー:', e);
    showSyncStatus('error');
  } finally {
    isSaving = false;
  }
}

async function loadFromSheet() {
  if (!GAS_URL || GAS_URL === 'YOUR_GAS_URL_HERE') {
    results      = JSON.parse(localStorage.getItem('softball_results')      || '{}');
    grounds      = JSON.parse(localStorage.getItem('softball_grounds')      || '[]');
    applications = JSON.parse(localStorage.getItem('softball_applications') || '[]');
    return;
  }
  showSyncStatus('loading');
  try {
    const res  = await fetch(GAS_URL + '?action=getAll', { redirect: 'follow' });
    const data = await res.json();

    results = {};
    (data.results || []).forEach(row => {
      if (!results[row.pairKey]) results[row.pairKey] = [null, null];
      const idx = parseInt(row.gameIdx) || 0;
      results[row.pairKey][idx] = {
        home: row.home, away: row.away,
        homeScore: parseInt(row.homeScore),
        awayScore: parseInt(row.awayScore),
        date: row.date || ''
      };
    });

    grounds = (data.grounds || []).map(g => ({
      ...g,
      id:         String(g.id),
      recruiting: String(g.recruiting).toUpperCase() === 'TRUE',
      confirmed:  String(g.confirmed).toUpperCase()  === 'TRUE'
    }));

    applications = (data.applications || []).map(a => ({
      ...a,
      id:       String(a.id),
      groundId: String(a.groundId)
    }));

    showSyncStatus('loaded');
  } catch(e) {
    console.error('GAS接続エラー:', e);
    showSyncStatus('error');
    results      = JSON.parse(localStorage.getItem('softball_results')      || '{}');
    grounds      = JSON.parse(localStorage.getItem('softball_grounds')      || '[]');
    applications = JSON.parse(localStorage.getItem('softball_applications') || '[]');
  }
}

// ============================================================
// ヘルパー
// ============================================================
function pairKey(a, b) { return [a, b].sort().join('|||'); }

function getGames(teamA, teamB) {
  return results[pairKey(teamA, teamB)] || [null, null];
}
