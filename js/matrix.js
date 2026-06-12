// ============================================================
// 対戦表
// ============================================================

function renderMatrix() {
  const table = document.getElementById('matrix-table');
  let html = '<thead><tr><th>←自チーム / 相手→</th>';
  TEAMS.forEach(t => { html += `<th>${t}</th>`; });
  html += '</tr></thead><tbody>';

  TEAMS.forEach(teamA => {
    html += `<tr><td class="row-header">${teamA}</td>`;
    TEAMS.forEach(teamB => {
      if (teamA === teamB) {
        html += `<td class="matrix-cell self"></td>`;
        return;
      }
      const gs = getGames(teamA, teamB);
      html += `<td class="matrix-cell">`;
      const hasResult = gs[0] || gs[1];
      if (hasResult) {
        html += `<div class="game-results">`;
        for (let i = 0; i < 2; i++) {
          const g = gs[i];
          if (g) {
            let hs = g.home === teamA ? g.homeScore : g.awayScore;
            let as = g.home === teamA ? g.awayScore : g.homeScore;
            let cls = hs > as ? 'score-win' : hs < as ? 'score-lose' : 'score-draw';
            html += `<div class="result-row">
              <span class="game-num">${i+1}</span>
              <span class="score-display ${cls}">${hs}−${as}</span>
            </div>`;
          } else {
            html += `<div class="result-row"><span class="game-num">${i+1}</span><span style="font-size:11px;color:var(--gray)">未</span></div>`;
          }
        }
        html += `</div>`;
      }
      const btnLabel = hasResult ? '編集' : '入力';
      html += `<div style="padding:${hasResult?'2px':'8px'} 4px;text-align:center;">
        <button class="enter-btn" onclick="openResultModal('${teamA}','${teamB}')">${btnLabel}</button>
      </div>`;
      html += `</td>`;
    });
    html += `</tr>`;
  });
  html += '</tbody>';
  table.innerHTML = html;
}
