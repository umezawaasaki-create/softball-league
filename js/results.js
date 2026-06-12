// ============================================================
// 対戦結果一覧
// ============================================================

function renderResultsList() {
  const list = document.getElementById('results-list');
  if (!list) return;

  function toSortKeyR(raw) {
    if (!raw) return '0000-00-00';
    const m1 = raw.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (m1) return m1[1]+'-'+m1[2]+'-'+m1[3];
    const m2 = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m2) return m2[0];
    const m4 = raw.match(/(\d{1,2})月(\d{1,2})日/);
    if (m4) return '2026-'+m4[1].padStart(2,'0')+'-'+m4[2].padStart(2,'0');
    return raw;
  }

  const played = [];
  TEAMS.forEach((a, i) => {
    TEAMS.forEach((b, j) => {
      if (j <= i) return;
      const games = getGames(a, b);
      games.forEach((g, gi) => {
        if (!g) return;
        const scoreA = g.home === a ? g.homeScore : g.awayScore;
        const scoreB = g.home === b ? g.homeScore : g.awayScore;
        const winner = scoreA > scoreB ? a : scoreB > scoreA ? b : null;
        played.push({
          rawDate: g.date || '',
          date:    formatDate(g.date),
          teamA: a, teamB: b,
          scoreA, scoreB, winner,
          gameNum: gi + 1
        });
      });
    });
  });

  if (played.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:48px 20px;color:var(--gray);font-size:14px;">
      試合結果はまだありません。<br>
      <span style="font-size:12px;">対戦表にスコアを入力すると表示されます。</span>
    </div>`;
    return;
  }

  const allTeams = [...new Set(played.flatMap(i => [i.teamA, i.teamB]))].sort();

  list.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;">
      <select id="res-sort" style="flex:1;min-width:120px;padding:6px 10px;border:1px solid #d1d9e0;border-radius:8px;font-size:13px;background:#fff;">
        <option value="date-desc">📅 新しい順</option>
        <option value="date-asc">📅 古い順</option>
        <option value="team">👥 チームごと</option>
      </select>
      <select id="res-team" style="flex:1;min-width:120px;padding:6px 10px;border:1px solid #d1d9e0;border-radius:8px;font-size:13px;background:#fff;">
        <option value="">チーム：すべて</option>
        ${allTeams.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
    </div>
    <div id="res-cards"></div>`;

  function cardHTML(item) {
    const winColor    = item.winner ? 'var(--green)' : 'var(--yellow)';
    const resultLabel = item.winner ? item.winner + ' 勝利' : '引分';
    return `
    <div style="background:#fff;border:1px solid #d1d9e0;border-left:3px solid var(--green);border-radius:10px;padding:16px 18px;margin-bottom:10px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="font-size:11px;font-weight:700;background:rgba(29,185,84,0.12);color:var(--green);border:1px solid rgba(29,185,84,0.3);border-radius:10px;padding:2px 10px;">✅ 第${item.gameNum}試合</span>
        <span style="font-size:13px;font-weight:700;color:${winColor};">${resultLabel}</span>
      </div>
      <div style="font-size:13px;font-weight:700;color:#374151;margin-bottom:12px;">${item.date}</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;">
        <span style="font-size:17px;font-weight:900;color:#1f2937;min-width:80px;text-align:right;">${item.teamA}</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:800;color:#1f2937;letter-spacing:2px;white-space:nowrap;">${item.scoreA}<span style="color:#9ca3af;font-size:22px;margin:0 6px;">−</span>${item.scoreB}</span>
        <span style="font-size:17px;font-weight:900;color:#1f2937;min-width:80px;text-align:left;">${item.teamB}</span>
      </div>
    </div>`;
  }

  function groupHeader(label, emoji, count) {
    return `
      <div style="display:flex;align-items:center;gap:10px;margin:22px 0 8px;padding-bottom:6px;border-bottom:2px solid var(--green);">
        <span style="font-size:20px;font-weight:900;color:#1f2937;">${emoji} ${label}</span>
        <span style="font-size:12px;color:var(--gray);font-weight:700;">${count}試合</span>
      </div>`;
  }

  function applyResFilter() {
    const sort = document.getElementById('res-sort').value;
    const team = document.getElementById('res-team').value;
    let items = played.filter(i => {
      if (team && i.teamA !== team && i.teamB !== team) return false;
      return true;
    });
    const cards = document.getElementById('res-cards');
    if (items.length === 0) {
      cards.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--gray);font-size:13px;">条件に合う試合結果がありません。</div>`;
      return;
    }
    let html = '';
    if (sort === 'date-desc' || sort === 'date-asc') {
      const dir = sort === 'date-desc' ? -1 : 1;
      items.sort((a, b) => toSortKeyR(a.rawDate).localeCompare(toSortKeyR(b.rawDate)) * dir);
      const groups = new Map();
      items.forEach(item => {
        const key = item.date || '日程未定';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      });
      groups.forEach((group, key) => {
        html += groupHeader(key, '📅', group.length);
        group.forEach(item => { html += cardHTML(item); });
      });
    } else if (sort === 'team') {
      const targetTeams = team ? [team] : allTeams;
      const groups = new Map();
      targetTeams.forEach(t => groups.set(t, []));
      items.forEach(item => {
        [item.teamA, item.teamB].forEach(t => {
          if (!team || t === team) {
            if (!groups.has(t)) groups.set(t, []);
            if (!groups.get(t).includes(item)) groups.get(t).push(item);
          }
        });
      });
      [...groups.entries()]
        .filter(([, g]) => g.length > 0)
        .sort((a, b) => a[0].localeCompare(b[0], 'ja'))
        .forEach(([key, group]) => {
          html += groupHeader(key, '👥', group.length);
          group.forEach(item => { html += cardHTML(item); });
        });
    }
    cards.innerHTML = html;
  }

  ['res-sort','res-team'].forEach(id =>
    document.getElementById(id).addEventListener('change', applyResFilter)
  );
  applyResFilter();
}
