// ============================================================
// アプリケーションメイン
// ============================================================

function render() {
  renderStandings();
  renderMatrix();
  renderGrounds();
  renderSchedule();
  renderResultsList();
}

// switchTab: ナビボタンのonclickから呼ぶ
function switchTab(name, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
  if (name === 'matrix')       renderMatrix();
  if (name === 'schedule')     renderSchedule();
  if (name === 'results-list') renderResultsList();
}

// goToTab: コードから直接タブを切り替える
function goToTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + name + "'")) {
      b.classList.add('active');
    }
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (name === 'matrix')       renderMatrix();
  if (name === 'schedule')     renderSchedule();
  if (name === 'results-list') renderResultsList();
}

// モーダル外クリックで閉じる
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// 初期化
populateTeamSelect();
loadFromSheet().then(() => render());
