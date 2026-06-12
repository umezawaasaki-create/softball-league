// ============================================================
// 順位表
// ============================================================

function calcStandings() {
  const stats = {};
  TEAMS.forEach(t => {
    stats[t] = { games: 0, wins: 0, losses: 0, draws: 0, points: 0, concede: 0 };
  });

  TEAMS.forEach((a, i) => {
    TEAMS.forEach((b, j) => {
      if (j <= i) return;
      const games = getGames(a, b);
      games.forEach(g => {
        if (!g) return;
        stats[a].games++;
        stats[b].games++;
        const scoreA = g.home === a ? g.homeScore : g.awayScore;
        const scoreB = g.home === b ? g.homeScore : g.awayScore;
        stats[a].points  += scoreA;
        stats[b].points  += scoreB;
        stats[a].concede += scoreB;
        stats[b].concede += scoreA;
        if (scoreA > scoreB) {
          stats[a].wins++; stats[b].losses++;
        } else if (scoreA < scoreB) {
          stats[b].wins++; stats[a].losses++;
        } else {
          stats[a].draws++; stats[b].draws++;
        }
      });
    });
  });

  return TEAMS.map(t => ({ team: t, ...stats[t] })).sort((a, b) => {
    const decidedA = a.wins + a.losses;
    const decidedB = b.wins + b.losses;
    const wa = decidedA > 0 ? a.wins / decidedA : (a.games > 0 ? 1.0 : 0);
    const wb = decidedB > 0 ? b.wins / decidedB : (b.games > 0 ? 1.0 : 0);
    if (wa !== wb) return wb - wa;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.points - b.concede) - (a.points - a.concede);
  });
}

function renderStandings() {
  const rows = calcStandings();
  const tbody = document.getElementById('standings-body');
  tbody.innerHTML = '';
  rows.forEach((r, i) => {
    const totalPossible = (TEAMS.length - 1) * 2;
    const pending = totalPossible - r.games;
    const decided = r.wins + r.losses;
    const pct = decided > 0
      ? (r.wins / decided).toFixed(3).replace(/^0/, '')
      : (r.games > 0 ? '1.000' : '---');
    tbody.innerHTML += `
      <tr>
        <td><span class="rank-num">${i + 1}</span></td>
        <td>${r.team}</td>
        <td>${r.games}</td>
        <td style="color:var(--green);font-weight:700">${r.wins}</td>
        <td style="color:var(--red)">${r.losses}</td>
        <td style="color:var(--yellow)">${r.draws}</td>
        <td style="color:var(--gray)">${pending}</td>
        <td class="win-pct">${pct}</td>
        <td>${r.points}</td>
        <td>${r.concede}</td>
      </tr>
    `;
  });

  let played = 0, total = 0;
  TEAMS.forEach((a, i) => {
    TEAMS.forEach((b, j) => {
      if (j <= i) return;
      total += 2;
      const gs = getGames(a, b);
      played += (gs[0] ? 1 : 0) + (gs[1] ? 1 : 0);
    });
  });
  document.getElementById('progress-info').textContent = `実施済み ${played} / 全 ${total} 試合`;

  const rulesEl = document.getElementById('standings-rules');
  if (rulesEl) {
    rulesEl.innerHTML = `
      <div style="background:#f8fafc;border:1px solid #d1d9e0;border-radius:12px;padding:18px 20px;margin-top:18px;font-size:13px;color:#374151;line-height:1.8;">
        <div style="font-weight:900;font-size:14px;color:#1f2937;margin-bottom:10px;">📋 順位の計算方法</div>
        <div style="margin-bottom:6px;">① <strong>勝率</strong>が高い順に並べます。</div>
        <div style="margin-bottom:4px;padding-left:16px;color:#6b7280;font-size:12px;">勝率 ＝ 勝利数 ÷ （勝利数 ＋ 敗戦数）</div>
        <div style="margin-bottom:4px;padding-left:16px;color:#6b7280;font-size:12px;">※ <strong>引き分けは勝率の計算から除外</strong>されます。</div>
        <div style="margin-bottom:6px;margin-top:10px;">② 勝率が同じ場合は <strong>勝利数</strong>が多い順。</div>
        <div style="margin-bottom:6px;">③ それも同じ場合は <strong>得点差（得点−失点）</strong>が大きい順。</div>
      </div>`;
  }
}
