// ============================================================
// グランド募集
// ============================================================
let editingGroundId = null;

function populateTeamSelect() {
  const sel = document.getElementById('g-team');
  TEAMS.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
}

function buildGDate() {
  const dp = document.getElementById('g-date-picker').value;
  const ts = document.getElementById('g-time-start').value;
  const te = document.getElementById('g-time-end').value;
  if (!dp) return '';
  const d = new Date(dp + 'T00:00:00');
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const wd = WEEKDAYS[d.getDay()];
  let str = mm + '月' + dd + '日(' + wd + ')';
  if (ts) str += ' ' + ts;
  if (ts && te) str += '〜' + te;
  else if (te) str += '〜' + te;
  return str;
}

function updateGDateDisplay() {
  const preview = document.getElementById('g-date-preview');
  const val = buildGDate();
  preview.textContent = val ? '📅 ' + val : '';
}

function openGroundModal(id) {
  editingGroundId = id ? String(id) : null;
  const g = id ? grounds.find(x => String(x.id) === String(id)) : null;

  document.getElementById('g-team').value     = g ? g.team : '';
  document.getElementById('g-name').value     = g ? g.name : '';
  document.getElementById('g-location').value = g ? g.location : '';
  document.getElementById('g-note').value     = g ? g.note : '';

  document.getElementById('g-date-picker').value = '';
  document.getElementById('g-time-start').value  = '';
  document.getElementById('g-time-end').value    = '';
  if (g && g.date) {
    document.getElementById('g-date-preview').textContent = '📅 ' + g.date;
    const dateMatch = g.date.match(/(\d+)月(\d+)日/);
    const timeMatch = g.date.match(/(\d{1,2}:\d{2})〜(\d{1,2}:\d{2})/);
    if (dateMatch) {
      const now = new Date();
      const mm = String(dateMatch[1]).padStart(2,'0');
      const dd = String(dateMatch[2]).padStart(2,'0');
      let yr = now.getFullYear();
      if (parseInt(dateMatch[1]) < now.getMonth()+1) yr++;
      document.getElementById('g-date-picker').value = yr + '-' + mm + '-' + dd;
    }
    if (timeMatch) {
      document.getElementById('g-time-start').value = timeMatch[1].padStart(5,'0');
      document.getElementById('g-time-end').value   = timeMatch[2].padStart(5,'0');
    }
  } else {
    document.getElementById('g-date-preview').textContent = '';
  }

  document.querySelector('#ground-modal h3').textContent = g ? 'グランドを編集する' : 'グランドを登録する';
  document.querySelector('#ground-modal .btn-save').textContent = g ? '更新する' : '登録する';

  const extra  = document.getElementById('ground-modal-extra');
  const delBtn = document.getElementById('btn-delete-ground');
  if (g) { extra.style.display = 'none'; delBtn.style.display = 'block'; }
  else   { extra.style.display = 'none'; delBtn.style.display = 'none';  }

  openModal('ground-modal');
}

function saveGround() {
  const team     = document.getElementById('g-team').value;
  const name     = document.getElementById('g-name').value.trim();
  const date     = buildGDate() || (editingGroundId ? (grounds.find(x=>x.id===editingGroundId)||{}).date : '');
  const location = document.getElementById('g-location').value.trim();
  const note     = document.getElementById('g-note').value.trim();
  if (!team || !name) { alert('チーム名とグランド名は必須です'); return; }

  if (editingGroundId) {
    const g = grounds.find(x => String(x.id) === String(editingGroundId));
    if (g) { g.team = team; g.name = name; g.date = date; g.location = location; g.note = note; }
    save();
    closeModal('ground-modal');
    renderGrounds();
    showToast('グランドを更新しました ✓');
  } else {
    grounds.push({ id: String(Date.now()), team, name, date, location, note, recruiting: true, confirmed: false });
    save();
    closeModal('ground-modal');
    renderGrounds();
    showToast('グランドを登録しました ✓');
  }
}

function deleteGroundFromModal() {
  if (!confirm('この登録を削除しますか？')) return;
  grounds = grounds.filter(x => String(x.id) !== String(editingGroundId));
  save();
  closeModal('ground-modal');
  renderGrounds();
  showToast('削除しました');
}

function deleteGround(id) {
  if (!confirm('この登録を削除しますか？')) return;
  grounds = grounds.filter(x => String(x.id) !== String(id));
  save();
  renderGrounds();
  showToast('削除しました');
}

function toggleRecruit(id) {
  const g = grounds.find(x => String(x.id) === String(id));
  if (g) { g.recruiting = !g.recruiting; save(); renderGrounds(); }
}

function toggleRecruitInModal() {
  const g = grounds.find(x => x.id === editingGroundId);
  if (!g) return;
  g.recruiting = !g.recruiting;
  save();
  renderGrounds();
  const btn = document.getElementById('btn-toggle-recruit');
  btn.textContent = g.recruiting ? '✅ 募集中（解除する）' : '⚡ 対戦相手を募集する';
  btn.style.background = g.recruiting ? 'rgba(245,197,24,0.25)' : 'rgba(245,197,24,0.12)';
  showToast(g.recruiting ? '募集を開始しました' : '募集を解除しました');
}

function renderGrounds() {
  const grid = document.getElementById('ground-grid');
  const activeGrounds = grounds.filter(g => !g.confirmed);

  if (activeGrounds.length === 0) {
    grid.innerHTML = '<div class="no-ground">まだグランドが登録されていません。<br>上のボタンから登録してください。</div>';
    return;
  }
  grid.innerHTML = '';
  const sortKey = (document.getElementById('ground-sort') || {}).value || 'date';
  const getMonthDay = d => {
    if (!d) return 9999;
    const m = d.match(/(\d+)月(\d+)日/);
    return m ? parseInt(m[1]) * 100 + parseInt(m[2]) : 9999;
  };
  const sortedGrounds = [...activeGrounds].sort((a, b) => {
    if (sortKey === 'date')    return getMonthDay(a.date) - getMonthDay(b.date);
    if (sortKey === 'name')    return (a.name || '').localeCompare(b.name || '', 'ja');
    if (sortKey === 'created') return a.id - b.id;
    return 0;
  });

  sortedGrounds.forEach(g => {
    const apps = applications.filter(a => String(a.groundId) === String(g.id));
    const hasApp = apps.some(a => a.status === 'pending');

    const applyBtn = g.recruiting
      ? (hasApp
          ? `<button class="btn-apply-badge" onclick="openAppListModal('${g.id}')">📋 応募あり（${apps.filter(a=>a.status==='pending').length}件）</button>`
          : `<button class="btn-recruit" style="background:var(--green);color:#ffffff;border:none;width:100%;" onclick="openApplyModal('${g.id}')">📩 対戦に応募する</button>`)
      : '';

    grid.innerHTML += `
      <div class="ground-card">
        <div class="ground-card-top">
          <div class="ground-name" style="color:#1f2937;">${g.name}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="ground-team-badge">${g.team}</span>
            <button class="pencil-btn" onclick="openGroundModal('${g.id}')" title="編集">✏️</button>
          </div>
        </div>
        ${g.date     ? `<div class="ground-info" style="color:#374151;">📅 <span>${g.date}</span></div>` : ''}
        ${g.location ? `<div class="ground-info">📍 <span>${g.location}</span></div>` : ''}
        <div class="ground-note" style="min-height:36px;">${g.note || ''}</div>
        ${applyBtn ? `<div class="ground-actions" style="margin-top:12px;">${applyBtn}</div>` : ''}
      </div>
    `;
  });
}

// ============================================================
// 応募モーダル
// ============================================================
let currentApplyGroundId = null;
let currentAppListGroundId = null;

function openApplyModal(groundId) {
  currentApplyGroundId = String(groundId);
  const g = grounds.find(x => String(x.id) === String(groundId));
  document.getElementById('apply-modal-subtitle').textContent = g.name + '（' + g.team + '）への申し込み';
  document.getElementById('apply-team').value = '';
  document.getElementById('apply-message').value = '';
  const sel = document.getElementById('apply-team');
  sel.innerHTML = '<option value="">選択してください</option>';
  TEAMS.filter(t => t !== g.team).forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    sel.appendChild(opt);
  });
  openModal('apply-modal');
}

function submitApply() {
  const team = document.getElementById('apply-team').value;
  const message = document.getElementById('apply-message').value.trim();
  if (!team) { alert('チームを選択してください'); return; }

  const g = grounds.find(x => String(x.id) === String(currentApplyGroundId));
  if (g && g.team && team) {
    const games = getGames(g.team, team);
    const filledCount = games.filter(x => x !== null).length;
    if (filledCount >= 2) {
      alert(`${g.team} と ${team} はすでに2試合完了しているため、対戦できません。`);
      return;
    }
  }

  const existing = applications.find(a => String(a.groundId) === String(currentApplyGroundId) && a.status === 'pending');
  if (existing) { alert('すでに応募があります。'); return; }
  applications.push({
    id: String(Date.now()),
    groundId: String(currentApplyGroundId),
    fromTeam: team,
    message,
    date: new Date().toLocaleDateString('ja-JP'),
    status: 'pending'
  });
  save();
  closeModal('apply-modal');
  renderGrounds();
  showToast('申し込みを送りました ✓');
}

function openAppListModal(groundId) {
  currentAppListGroundId = String(groundId);
  const g = grounds.find(x => String(x.id) === String(groundId));
  document.getElementById('applist-subtitle').textContent = g.name + ' の応募一覧';
  renderAppList();
  openModal('applist-modal');
}

function renderAppList() {
  const apps = applications.filter(a => String(a.groundId) === String(currentAppListGroundId));
  const container = document.getElementById('applist-container');
  if (apps.length === 0) {
    container.innerHTML = '<p style="color:var(--gray);font-size:13px;text-align:center;padding:24px 0;">まだ応募はありません</p>';
    return;
  }
  const statusLabel = { pending: '⏳ 検討中', accepted: '✅ 承諾', declined: '❌ 辞退' };
  const statusColor = { pending: 'var(--yellow)', accepted: 'var(--green)', declined: 'var(--red)' };
  container.innerHTML = apps.map(a => `
    <div style="background:#f0f4f8;border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:10px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span style="font-weight:700;font-size:14px;color:#1f2937;">${a.fromTeam}</span>
        <span style="font-size:12px;font-weight:700;color:${statusColor[a.status]};">${statusLabel[a.status]}</span>
      </div>
      ${a.message ? `<div style="font-size:12px;color:var(--gray);margin-bottom:10px;line-height:1.5;">${a.message}</div>` : ''}
      <div style="font-size:11px;color:var(--gray);margin-bottom:10px;">申込日：${a.date}</div>
      ${a.status === 'pending' ? `
      <div style="display:flex;gap:8px;">
        <button onclick="updateAppStatus('${a.id}','accepted')" style="flex:1;background:rgba(29,185,84,0.15);color:var(--green);border:1px solid rgba(29,185,84,0.4);border-radius:7px;padding:8px;font-family:'Zen Kaku Gothic New',sans-serif;font-size:12px;font-weight:700;cursor:pointer;">✅ 承諾する</button>
        <button onclick="updateAppStatus('${a.id}','declined')" style="flex:1;background:rgba(230,57,70,0.1);color:var(--red);border:1px solid rgba(230,57,70,0.3);border-radius:7px;padding:8px;font-family:'Zen Kaku Gothic New',sans-serif;font-size:12px;font-weight:700;cursor:pointer;">❌ 辞退する</button>
      </div>` : ''}
    </div>
  `).join('');
}

function updateAppStatus(appId, status) {
  const a = applications.find(x => String(x.id) === String(appId));
  if (!a) return;
  a.status = status;
  if (status === 'accepted') {
    const g = grounds.find(x => String(x.id) === String(a.groundId));
    if (g) {
      g.recruiting = false;
      g.confirmed  = true;
    }
    save();
    closeModal('applist-modal');
    render();
    goToTab('schedule');
    showToast('対戦が確定しました ✓');
  } else {
    save();
    renderAppList();
    renderGrounds();
    showToast('辞退しました');
  }
}
