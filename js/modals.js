// ============================================================
// 試合結果モーダル
// ============================================================
let currentTeamA, currentTeamB, currentGames;
let selectedWinner = [null, null];

function selectWinner(gameIdx, choice) {
  selectedWinner[gameIdx] = choice;
  const btnA    = document.getElementById('winner-' + gameIdx + '-A');
  const btnB    = document.getElementById('winner-' + gameIdx + '-B');
  const btnDraw = document.getElementById('winner-' + gameIdx + '-draw');
  if (!btnA || !btnB || !btnDraw) return;

  btnA.className    = 'winner-btn';
  btnB.className    = 'winner-btn';
  btnDraw.className = 'winner-btn';

  if (choice === 'A') {
    btnA.className = 'winner-btn selected-win';
    btnB.className = 'winner-btn selected-lose';
  } else if (choice === 'B') {
    btnB.className = 'winner-btn selected-win';
    btnA.className = 'winner-btn selected-lose';
  } else if (choice === 'draw') {
    btnDraw.className = 'winner-btn selected-draw';
  }

  const lblA = document.getElementById('outcome-' + gameIdx + '-A');
  const lblB = document.getElementById('outcome-' + gameIdx + '-B');
  if (lblA) lblA.textContent = choice === 'A' ? '🏆 勝ち' : choice === 'B' ? '💔 負け' : choice === 'draw' ? '🤝 引分' : '';
  if (lblB) lblB.textContent = choice === 'B' ? '🏆 勝ち' : choice === 'A' ? '💔 負け' : choice === 'draw' ? '🤝 引分' : '';
}

function openResultModal(teamA, teamB) {
  currentTeamA = teamA;
  currentTeamB = teamB;
  currentGames = getGames(teamA, teamB);
  selectedWinner = [null, null];

  document.getElementById('modal-pair-label').textContent = `${teamA}  vs  ${teamB}`;

  const container = document.getElementById('games-container');
  container.innerHTML = '';

  const hasAny = currentGames[0] || currentGames[1];
  document.getElementById('btn-clear').style.display = hasAny ? 'block' : 'none';

  for (let i = 0; i < 2; i++) {
    const g = currentGames[i];
    let storedWinner = null;
    let hs = '', as = '', dt = '', dtLocal = '';
    if (g) {
      hs = g.home === teamA ? g.homeScore : g.awayScore;
      as = g.home === teamA ? g.awayScore : g.homeScore;
      dt = g.date || '';
      if (dt) {
        const _m = dt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (_m && (dt.endsWith('Z') || dt.length > 19)) {
          const _d = new Date(dt);
          const _j = new Date(_d.getTime() + 9*60*60*1000);
          dtLocal = _j.getUTCFullYear() + '-'
            + String(_j.getUTCMonth()+1).padStart(2,'0') + '-'
            + String(_j.getUTCDate()).padStart(2,'0') + 'T'
            + String(_j.getUTCHours()).padStart(2,'0') + ':'
            + String(_j.getUTCMinutes()).padStart(2,'0');
        } else if (_m) {
          dtLocal = dt.substring(0,16);
        } else if (dt.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dtLocal = dt + 'T00:00';
        }
      }
      if (hs > as) storedWinner = 'A';
      else if (as > hs) storedWinner = 'B';
      else storedWinner = 'draw';
    }
    selectedWinner[i] = storedWinner;

    const winSelA = storedWinner === 'A' ? 'selected-win'  : storedWinner === 'B' ? 'selected-lose' : storedWinner === 'draw' ? 'selected-draw' : '';
    const winSelB = storedWinner === 'B' ? 'selected-win'  : storedWinner === 'A' ? 'selected-lose' : storedWinner === 'draw' ? 'selected-draw' : '';
    const winSelD = storedWinner === 'draw' ? 'selected-draw' : '';

    container.innerHTML += `
      <div style="background:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:16px 16px 14px;margin-bottom:14px;">
        <div style="font-size:12px;font-weight:700;color:var(--light);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
          <span>第${i+1}試合</span>
          ${g ? `<button onclick="clearGame(${i})" style="background:rgba(230,57,70,0.12);color:var(--red);border:1px solid rgba(230,57,70,0.3);border-radius:6px;padding:3px 10px;font-size:11px;font-family:'Zen Kaku Gothic New',sans-serif;cursor:pointer;">クリア</button>` : ''}
        </div>
        <div style="font-size:11px;color:var(--gray);margin-bottom:7px;">結果を選択</div>
        <div class="winner-selector">
          <button class="winner-btn ${winSelA}" id="winner-${i}-A" onclick="selectWinner(${i},'A')">
            <span class="team-label">${shortName(teamA)}</span>
            <span class="outcome-label" id="outcome-${i}-A">${storedWinner === 'A' ? '🏆 勝ち' : storedWinner === 'B' ? '💔 負け' : storedWinner === 'draw' ? '🤝 引分' : '　'}</span>
          </button>
          <button class="winner-btn ${winSelD}" id="winner-${i}-draw" onclick="selectWinner(${i},'draw')">
            <span class="team-label" style="font-size:12px;">引　分</span>
            <span class="outcome-label">🤝</span>
          </button>
          <button class="winner-btn ${winSelB}" id="winner-${i}-B" onclick="selectWinner(${i},'B')">
            <span class="team-label">${shortName(teamB)}</span>
            <span class="outcome-label" id="outcome-${i}-B">${storedWinner === 'B' ? '🏆 勝ち' : storedWinner === 'A' ? '💔 負け' : storedWinner === 'draw' ? '🤝 引分' : '　'}</span>
          </button>
        </div>
        <div style="font-size:11px;color:var(--gray);margin-bottom:7px;">スコア（任意）</div>
        <div class="score-row">
          <span class="score-team-name">${shortName(teamA)}</span>
          <input type="number" class="score-input-num" id="score-a-${i}" value="${hs}" placeholder="0" min="0" max="99">
          <span class="score-dash">－</span>
          <input type="number" class="score-input-num" id="score-b-${i}" value="${as}" placeholder="0" min="0" max="99">
          <span class="score-team-name" style="text-align:right">${shortName(teamB)}</span>
        </div>
        <div class="field-row" style="margin-bottom:0">
          <label>対戦日時</label>
          <input type="datetime-local" id="game-date-${i}" value="${dtLocal}"
            style="background:#f8fafc;border:1px solid var(--border);border-radius:7px;color:#1f2937;font-family:'Zen Kaku Gothic New',sans-serif;font-size:14px;padding:9px 12px;outline:none;flex:1;">
        </div>
      </div>
    `;
  }
  openModal('result-modal');
}

function saveResults() {
  const key = pairKey(currentTeamA, currentTeamB);
  const arr = [];
  for (let i = 0; i < 2; i++) {
    const winner = selectedWinner[i];
    const sa = parseInt(document.getElementById(`score-a-${i}`).value);
    const sb = parseInt(document.getElementById(`score-b-${i}`).value);
    const date = document.getElementById(`game-date-${i}`).value;

    if (!winner) { arr.push(null); continue; }

    let homeScore, awayScore;
    if (!isNaN(sa) && !isNaN(sb)) {
      homeScore = sa; awayScore = sb;
      if (winner === 'A' && homeScore <= awayScore) homeScore = awayScore + 1;
      if (winner === 'B' && awayScore <= homeScore) awayScore = homeScore + 1;
      if (winner === 'draw') { if (homeScore !== awayScore) awayScore = homeScore; }
    } else {
      homeScore = winner === 'A' ? 1 : winner === 'draw' ? 0 : 0;
      awayScore = winner === 'B' ? 1 : winner === 'draw' ? 0 : 0;
    }
    arr.push({ home: currentTeamA, away: currentTeamB, homeScore, awayScore, date });
  }
  results[key] = arr;
  save();
  closeModal('result-modal');
  render();
  showToast('結果を保存しました ✓');
}

function clearResults() {
  const key = pairKey(currentTeamA, currentTeamB);
  delete results[key];
  save();
  closeModal('result-modal');
  render();
  showToast('結果をクリアしました');
}

function clearGame(gameIdx) {
  const key = pairKey(currentTeamA, currentTeamB);
  const arr = results[key] ? [...results[key]] : [null, null];
  arr[gameIdx] = null;
  if (!arr[0] && !arr[1]) {
    delete results[key];
  } else {
    results[key] = arr;
  }
  save();
  openResultModal(currentTeamA, currentTeamB);
  showToast('第' + (gameIdx + 1) + '試合をクリアしました');
}
