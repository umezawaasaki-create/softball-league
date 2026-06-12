// ============================================================
// 対戦予定
// ============================================================

function renderSchedule() {
  const list = document.getElementById('schedule-list');

  function toSortKey(raw) {
    if (!raw) return '9999-99-99';
    const m1 = raw.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (m1) return m1[1]+'-'+m1[2]+'-'+m1[3];
    const m2 = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m2) return m2[0];
    const m4 = raw.match(/(\d{1,2})月(\d{1,2})日/);
    if (m4) return '2026-'+m4[1].padStart(2,'0')+'-'+m4[2].padStart(2,'0');
    return raw;
  }

  const groundMap = new Map(grounds.map(g => [String(g.id), g]));

  const confirmedFromApps = applications
    .filter(a => a.status === 'accepted')
    .map(a => {
      const g = groundMap.get(String(a.groundId));
      return {
        key:      'app_' + String(a.id),
        groundId: String(a.groundId),
        rawDate:  g ? (g.date || '') : '',
        date:     g ? formatDate(g.date) : '日程未定',
        ground:   g ? (g.name     || '') : '',
        location: g ? (g.location || '') : '',
        teamA:    g ? g.team : '（グランド主）',
        teamB:    a.fromTeam || '',
        message:  a.message  || '',
        ended:    g ? !!g.ended : false
      };
    })
    .filter(item => !item.ended);

  const coveredGroundIds = new Set(confirmedFromApps.map(x => x.groundId));

  const confirmedFromGrounds = grounds
    .filter(g => {
      const isConfirmed = String(g.confirmed).toUpperCase() === 'TRUE';
      return isConfirmed && !g.ended && !coveredGroundIds.has(String(g.id));
    })
    .map(g => {
      let teamA = g.team || '';
      let teamB = '';
      let message = g.note || '';
      return {
        key:      'grd_' + String(g.id),
        groundId: String(g.id),
        rawDate:  g.date || '',
        date:     formatDate(g.date),
        ground:   g.name     || '',
        location: g.location || '',
        teamA, teamB, message
      };
    });

  const allConfirmed = [...confirmedFromApps, ...confirmedFromGrounds];
  const seenKeys = new Set();
  const confirmed = allConfirmed.filter(item => {
    if (seenKeys.has(item.key)) return false;
    seenKeys.add(item.key);
    return true;
  });

  if (confirmed.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:48px 20px;color:var(--gray);font-size:14px;">
      対戦予定はまだありません。<br>
      <span style="font-size:12px;">グランド募集で応募を承諾すると表示されます。</span>
    </div>`;
    return;
  }

  const allTeams   = [...new Set(confirmed.flatMap(i => [i.teamA, i.teamB].filter(Boolean)))].sort();
  const allGrounds = [...new Set(confirmed.map(i => i.ground).filter(Boolean))].sort();

  list.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;">
      <select id="sch-sort" style="flex:1;min-width:120px;padding:6px 10px;border:1px solid #d1d9e0;border-radius:8px;font-size:13px;background:#fff;">
        <option value="date">📅 日付順</option>
        <option value="team">👥 チームごと</option>
        <option value="ground">🏟 グランドごと</option>
      </select>
      <select id="sch-team" style="flex:1;min-width:120px;padding:6px 10px;border:1px solid #d1d9e0;border-radius:8px;font-size:13px;background:#fff;">
        <option value="">チーム：すべて</option>
        ${allTeams.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select id="sch-ground" style="flex:1;min-width:120px;padding:6px 10px;border:1px solid #d1d9e0;border-radius:8px;font-size:13px;background:#fff;">
        <option value="">グランド：すべて</option>
        ${allGrounds.map(g => `<option value="${g}">${g}</option>`).join('')}
      </select>
    </div>
    <div id="sch-cards"></div>`;

  function cardHTML(item, hideDate) {
    const vsLine = item.teamB
      ? `<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:10px;">
          <span style="font-size:15px;font-weight:900;color:#1f2937;">${item.teamA}</span>
          <span style="font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;color:var(--gray);">VS</span>
          <span style="font-size:15px;font-weight:900;color:#1f2937;">${item.teamB}</span>
        </div>`
      : `<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:10px;">
          <span style="font-size:15px;font-weight:900;color:#1f2937;">${item.teamA}</span>
          <span style="font-size:13px;color:var(--gray);">（相手チーム調整中）</span>
        </div>`;
    return `
      <div style="background:#fff;border:1px solid #d1d9e0;border-left:3px solid var(--yellow);border-radius:10px;padding:14px 16px;margin-bottom:8px;">
        ${!hideDate && item.date ? `<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">📅 ${item.date}</div>` : ''}
        ${vsLine}
        ${item.ground   ? `<div style="font-size:12px;color:#6b7280;margin-bottom:2px;">🏟 ${item.ground}${item.location ? '　📍 '+item.location : ''}</div>` : ''}
        ${item.message  ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;line-height:1.5;">💬 ${item.message}</div>` : ''}
      </div>`;
  }

  function groupHeader(label, emoji, count) {
    return `
      <div style="display:flex;align-items:center;gap:10px;margin:22px 0 8px;padding-bottom:6px;border-bottom:2px solid var(--green);">
        <span style="font-size:20px;font-weight:900;color:#1f2937;">${emoji} ${label}</span>
        <span style="font-size:12px;color:var(--gray);font-weight:700;">${count}試合</span>
      </div>`;
  }

  function applyFilter() {
    const sort   = document.getElementById('sch-sort').value;
    const team   = document.getElementById('sch-team').value;
    const ground = document.getElementById('sch-ground').value;
    let items = confirmed.filter(i => {
      if (team   && i.teamA !== team && i.teamB !== team) return false;
      if (ground && i.ground !== ground) return false;
      return true;
    });
    const cards = document.getElementById('sch-cards');
    if (items.length === 0) {
      cards.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--gray);font-size:13px;">条件に合う対戦予定がありません。</div>`;
      return;
    }
    let html = '';
    if (sort === 'date') {
      items.sort((a, b) => toSortKey(a.rawDate).localeCompare(toSortKey(b.rawDate)));
      const groups = new Map();
      items.forEach(item => {
        const key = item.date || '日程未定';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      });
      groups.forEach((group, key) => {
        html += groupHeader(key, '📅', group.length);
        group.forEach(item => { html += cardHTML(item, true); });
      });
    } else if (sort === 'team') {
      const groups = new Map();
      allTeams.filter(t => !team || t === team).forEach(t => groups.set(t, []));
      items.forEach(item => {
        [item.teamA, item.teamB].filter(Boolean).forEach(t => {
          if (!team || t === team) {
            if (!groups.has(t)) groups.set(t, []);
            if (!groups.get(t).find(x => x.key === item.key)) groups.get(t).push(item);
          }
        });
      });
      [...groups.entries()]
        .filter(([, g]) => g.length > 0)
        .sort((a, b) => a[0].localeCompare(b[0], 'ja'))
        .forEach(([key, group]) => {
          html += groupHeader(key, '👥', group.length);
          group.forEach(item => { html += cardHTML(item, false); });
        });
    } else if (sort === 'ground') {
      items.sort((a, b) => (a.ground || '').localeCompare(b.ground || '', 'ja'));
      const groups = new Map();
      items.forEach(item => {
        const key = item.ground || 'グランド未定';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      });
      groups.forEach((group, key) => {
        html += groupHeader(key, '🏟', group.length);
        group.forEach(item => { html += cardHTML(item, false); });
      });
    }
    cards.innerHTML = html;
  }

  ['sch-sort','sch-team','sch-ground'].forEach(id =>
    document.getElementById(id).addEventListener('change', applyFilter)
  );
  applyFilter();
}
