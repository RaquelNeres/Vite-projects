import { reactive } from 'vue';

export const state = reactive({
  folders: [],
  links: [],
  noteFolders: [],
  notes: [],
  folderNotes: [],
  events: [],
  homeNote: '',
  homeNoteImgs: [],
  quickNote: '',
  agendaNote: '',
  theme: 'dark',
});

export let currentFolder = null;
export let currentView = 'grid';
export let currentWeekOffset = 0;
export let editingNoteId = null;
export let editingFolderNoteId = null;
export let tempImages = [];
export let folderCoverImg = '';
export let selectedFolderColor = '#7c6ff7';
export let selectedEventColor = '#7c6ff7';
export let confirmCallback = null;

export function loadState() {
  try {
    const s = localStorage.getItem('studynest');
    if (s) {
      const parsed = JSON.parse(s);
      Object.assign(state, {
        folders: parsed.folders || [],
        links: parsed.links || [],
        noteFolders: parsed.noteFolders || [],
        notes: parsed.notes || [],
        folderNotes: parsed.folderNotes || [],
        events: parsed.events || [],
        homeNote: parsed.homeNote || '',
        homeNoteImgs: parsed.homeNoteImgs || [],
        quickNote: parsed.quickNote || '',
        agendaNote: parsed.agendaNote || '',
        theme: parsed.theme || 'dark',
      });
    }
  } catch (e) {
    console.warn('Falha ao carregar estado:', e);
  }
}

export function saveState() {
  localStorage.setItem('studynest', JSON.stringify(state));
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function init() {
  loadState();
  setTheme(state.theme || 'dark', false);
  const homeNote = document.getElementById('home-note');
  if (homeNote) homeNote.value = state.homeNote || '';
  const quickNoteText = document.getElementById('quick-note-text');
  if (quickNoteText) quickNoteText.value = state.quickNote || '';
  const agendaNote = document.getElementById('agenda-note');
  if (agendaNote) agendaNote.value = state.agendaNote || '';
  renderSidebar();
  renderHomePage();
  renderAgenda();
  updateNoteFolderSelects();
  renderGeneralNotes();
}

export function setTheme(t, save = true) {
  document.body.setAttribute('data-theme', t);
  state.theme = t;
  if (save) saveState();
  const themeDropdown = document.getElementById('theme-dropdown');
  if (themeDropdown) themeDropdown.classList.remove('open');
}

export function toggleThemeDropdown() {
  const dropdown = document.getElementById('theme-dropdown');
  if (dropdown) dropdown.classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.topbar-btn')) {
    const dropdown = document.getElementById('theme-dropdown');
    if (dropdown) dropdown.classList.remove('open');
  }
});

export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('collapsed');
}

export function renderSidebar() {
  const list = document.getElementById('folder-list');
  if (!list) return;
  list.innerHTML = state.folders
    .map(f => `
      <div class="folder-item ${currentFolder === f.id ? 'active' : ''}" onclick="openFolder('${f.id}')">
        <div class="folder-icon" style="background:${f.color}22;border:1px solid ${f.color}44">
          ${f.coverImg ? `<img src="${f.coverImg}" alt="">` : `<span>${f.emoji || '📁'}</span>`}
        </div>
        <div class="folder-info">
          <div class="folder-name" style="color:${currentFolder === f.id ? f.color : ''}">${f.name}</div>
          <div class="folder-count">${state.links.filter(l => l.folderId === f.id).length} links</div>
        </div>
      </div>
    `)
    .join('');

  const sel = document.getElementById('link-folder');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML =
      '<option value="">Sem pasta</option>' +
      state.folders
        .map(f => `<option value="${f.id}" ${cur === f.id ? 'selected' : ''}>${f.emoji || '📁'} ${f.name}</option>`)
        .join('');
  }
}

export function showPage(page, title) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');
  const titleEl = document.getElementById('page-title');
  if (titleEl)
    titleEl.textContent =
      title ||
      {
        home: 'Início',
        agenda: 'Agenda',
        notes: 'Anotações',
        settings: 'Dados & Sync',
        search: 'Busca',
      }[page] ||
      page;
  currentFolder = page === 'folder' ? currentFolder : null;
}

export function openFolder(id) {
  currentFolder = id;
  const f = state.folders.find(x => x.id === id);
  if (!f) return;
  showPage('folder', f.name);
  renderSidebar();
  renderFolderPage(f);
  const folderNote = document.getElementById('folder-note');
  if (folderNote) folderNote.value = f.note || '';
  const folderReminder = document.getElementById('folder-reminder');
  if (folderReminder) folderReminder.value = f.reminder || '';
  renderNoteImages('folder-note-imgs', f.noteImgs || []);
}

export function renderHomePage() {
  const totalLinks = state.links.length;
  const totalFolders = state.folders.length;
  const totalNotes = state.notes.length;
  const totalEvents = state.events.length;
  const homeStats = document.getElementById('home-stats');
  if (homeStats)
    homeStats.innerHTML = `
    <div class="stat-card"><div class="stat-value">${totalLinks}</div><div class="stat-label">Links Salvos</div></div>
    <div class="stat-card"><div class="stat-value">${totalFolders}</div><div class="stat-label">Pastas</div></div>
    <div class="stat-card"><div class="stat-value">${totalNotes}</div><div class="stat-label">Anotações</div></div>
    <div class="stat-card"><div class="stat-value">${totalEvents}</div><div class="stat-label">Eventos</div></div>
  `;

  const recent = [...state.links].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  const recentEl = document.getElementById('recent-links');
  if (recentEl) {
    if (recent.length === 0) {
      recentEl.innerHTML = '<p style="font-size:0.8rem;color:var(--text3)">Nenhum link ainda.</p>';
    } else {
      recentEl.innerHTML = '<div class="links-list">' + recent.map(l => renderLinkListItem(l)).join('') + '</div>';
    }
  }

  const now = new Date();
  const futureEvents = state.events
    .map(e => ({ ...e, dt: new Date(e.date + (e.time ? 'T' + e.time : '')) }))
    .filter(e => e.dt >= now)
    .sort((a, b) => a.dt - b.dt);
  const evContainer = document.getElementById('home-next-event');
  if (evContainer) {
    if (futureEvents.length > 0) {
      const next = futureEvents[0];
      evContainer.innerHTML = `
      <div style="background:var(--bg2); border-left:4px solid ${next.color || 'var(--accent)'}; padding:14px; border-radius:var(--radius-sm); border-top:1px solid var(--border); border-right:1px solid var(--border); border-bottom:1px solid var(--border);">
        <div style="font-size:0.75rem; color:var(--text3); text-transform:uppercase; font-weight:600; margin-bottom:4px">Próximo na Agenda</div>
        <div style="font-weight:600">${next.title}</div>
        <div style="font-size:0.8rem; color:var(--accent); margin-top:4px">⏰ ${next.dt.toLocaleString('pt-BR')}</div>
      </div>
      `;
    } else {
      evContainer.innerHTML = '';
    }
  }

  const fgrid = document.getElementById('home-folders-grid');
  if (fgrid) {
    if (state.folders.length === 0) {
      fgrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        <h3>Nenhuma pasta ainda</h3><p>Crie pastas para organizar seus links</p></div>`;
    } else {
      fgrid.innerHTML = state.folders
        .map(f => {
          const count = state.links.filter(l => l.folderId === f.id).length;
          return `
            <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:24px;cursor:pointer;transition:all 0.2s;border-top:4px solid ${f.color}"
              onclick="openFolder('${f.id}')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
              <div style="width:64px;height:64px;border-radius:16px;background:${f.color}22;display:flex;align-items:center;justify-content:center;font-size:1.85rem;margin-bottom:16px;overflow:hidden">
                ${f.coverImg ? `<img src="${f.coverImg}" style="width:100%;height:100%;object-fit:cover;border-radius:14px">` : f.emoji || '📁'}
              </div>
              <div style="font-weight:600;font-size:1.12rem;margin-bottom:4px">${f.name}</div>
              <div style="font-size:0.82rem;color:var(--text2)">${count} link${count !== 1 ? 's' : ''}</div>
              ${f.desc ? `<div style="font-size:0.75rem;color:var(--text3);margin-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.desc}</div>` : ''}
            </div>
          `;
        })
        .join('');
    }
  }
  renderNoteImages('home-note-imgs', state.homeNoteImgs || []);
}

export function renderFolderNotes() {
  const list = document.getElementById('folder-notes-list');
  if (!list) {
    return;
  }
  if (!currentFolder) {
    list.innerHTML = '';
    return;
  }
  const notes = state.folderNotes.filter(n => n.folderId === currentFolder).sort((a, b) => b.createdAt - a.createdAt);
  if (notes.length === 0) {
    list.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 10h16M4 14h10"/></svg><h3>Nenhuma anotação na pasta</h3><p>Use o botão acima para criar uma nota rápida.</p></div>`;
    return;
  }
  list.innerHTML = notes
    .map(n => {
      const isEditing = n.id === editingFolderNoteId;
      const titleHtml = isEditing
        ? `<input type="text" value="${escapeHtml(n.title)}" id="folder-note-title-${n.id}" placeholder="Título da nota..." style="background:none;border:none;outline:none;font-size:0.95rem;font-weight:600;color:var(--text);flex:1;">`
        : `<div class="note-card-title">${escapeHtml(n.title) || '<em style="color:var(--text3)">Sem título</em>'}</div>`;
      const contentHtml = isEditing
        ? `<textarea id="folder-note-content-${n.id}" class="note-textarea" style="min-height:100px">${escapeHtml(n.content)}</textarea>`
        : `<div class="note-card-note-view">${escapeHtml(n.content) || '<em style="color:var(--text3)">Sem conteúdo...</em>'}</div>`;
      const actionsHtml = isEditing
        ? `<div class="note-card-actions"><button class="btn btn-success" title="Salvar" onclick="saveFolderNoteItem('${n.id}')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg></button><button class="btn btn-ghost" title="Cancelar" onclick="cancelEditFolderNote()"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><button class="btn btn-danger" title="Excluir" onclick="confirmDelete('folder-note','${n.id}')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button></div>`
        : `<div class="note-card-actions"><button class="btn btn-ghost" title="Editar" onclick="editFolderNoteItem('${n.id}')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="btn btn-danger" title="Excluir" onclick="confirmDelete('folder-note','${n.id}')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button></div>`;
      return `<div class="note-card">
        <div class="note-card-header">${titleHtml}${actionsHtml}</div>
        <div class="note-card-body"><div class="note-card-main">${contentHtml}</div></div>
      </div>`;
    })
    .join('');
}

export function addFolderNote() {
  if (!currentFolder) return;
  const note = { id: 'fn' + Date.now(), folderId: currentFolder, title: '', content: '', createdAt: Date.now() };
  state.folderNotes.unshift(note);
  editingFolderNoteId = note.id;
  saveState();
  renderFolderNotes();
}

export function editFolderNoteItem(id) {
  editingFolderNoteId = id;
  renderFolderNotes();
}

export function cancelEditFolderNote() {
  editingFolderNoteId = null;
  renderFolderNotes();
}

export function saveFolderNoteItem(id) {
  const note = state.folderNotes.find(n => n.id === id);
  if (!note) return;
  const titleField = document.getElementById(`folder-note-title-${id}`);
  const contentField = document.getElementById(`folder-note-content-${id}`);
  note.title = titleField ? titleField.value : note.title;
  note.content = contentField ? contentField.value : note.content;
  editingFolderNoteId = null;
  saveState();
  renderFolderNotes();
}

export function renderFolderPage(f) {
  const links = state.links.filter(l => l.folderId === f.id);
  const header = document.getElementById('folder-header');
  if (header)
    header.innerHTML = `
      <div class="folder-header-icon" style="border-color:${f.color}44">
        ${f.coverImg ? `<img src="${f.coverImg}" alt="">` : `<span style="font-size:1.5rem">${f.emoji || '📁'}</span>`}
      </div>
      <div class="folder-header-info">
        <div class="folder-header-name">${f.name}</div>
        ${f.desc ? `<div class="folder-header-desc">${f.desc}</div>` : ''}
      </div>
      <div class="folder-header-actions">
        <button class="btn btn-ghost" onclick="openEditFolderModal('${f.id}')" style="padding:6px 12px;font-size:0.8rem">✏️ Editar</button>
        <button class="btn btn-danger" onclick="confirmDelete('pasta','${f.id}')" style="padding:6px 12px;font-size:0.8rem">🗑️</button>
      </div>
    `;
  const container = document.getElementById('folder-links-container');
  if (container) {
    if (links.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        <h3>Nenhum link nesta pasta</h3>
        <p>Adicione links para começar</p>
      </div>`;
    } else {
      renderLinks(links, container);
    }
  }
  renderFolderNotes();
}

export function renderLinks(links, container) {
  if (!container) return;
  if (currentView === 'grid') container.innerHTML = `<div class="links-grid fade-in">${links.map(l => renderLinkCard(l)).join('')}</div>`;
  else container.innerHTML = `<div class="links-list fade-in">${links.map(l => renderLinkListItem(l)).join('')}</div>`;
}

export function transformarParaEmbed(url) {
  if (!url) return null;
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.includes('linkedin.com')) {
      const id = decodeURIComponent(url).match(/activity-(\d{10,20})/)?.[1];
      return id ? `https://www.linkedin.com/embed/feed/update/urn:li:activity:${id}` : null;
    }
    if (url.includes('spotify.com')) {
      return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }
    if (url.includes('instagram.com/p/')) {
      const cleanUrl = url.split('?')[0];
      return `${cleanUrl}embed`;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export function renderLinkCard(l) {
  const favicon = getFavicon(l.url);
  const tagsHtml = l.tags
    ? l.tags
        .split(',')
        .filter(t => t.trim())
        .map(t => `<span class="tag">${t.trim()}</span>`)
        .join('')
    : '';
  const hasImgs = l.images && l.images.length > 0;
  const embedUrl = transformarParaEmbed(l.url);
  const hasRichNote = l.richNote && l.richNote.trim() !== '';

  return `<div class="link-card fade-in">
    ${embedUrl ? `
      <div class="embed-container">
        <iframe src="${embedUrl}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    ` : hasImgs ? `<img src="${l.images[0]}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:14px">` : ''}
    
    <div class="link-card-header">
      <div class="link-favicon">${favicon ? `<img src="${favicon}" alt="">` : getDomainInitial(l.url)}</div>
      <div class="link-title-area">
        <div class="link-title">${l.title || getDomain(l.url)}</div>
        <div class="link-url">${getDomain(l.url)}</div>
      </div>
    </div>
    ${l.note ? `<div class="link-desc">${l.note}</div>` : ''}
    ${tagsHtml ? `<div class="link-tags">${tagsHtml}</div>` : ''}

    <div class="link-card-btns">
      <a href="${l.url}" target="_blank" class="link-card-btn primary" title="Abrir"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
      <button class="link-card-btn" title="Editar" onclick="openEditLinkModal('${l.id}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="link-card-btn danger" title="Excluir" onclick="confirmDelete('link','${l.id}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
      <button class="link-card-btn" title="Notas" onclick="openLinkNoteModal('${l.id}')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M8 9h8m-8 4h5"/></svg></button>
    </div>

    <div class="link-footer">
      <span class="link-date">${formatDate(l.createdAt)}</span>
      <div class="link-actions">
        ${hasRichNote ? `<span style="font-size:0.78rem;color:var(--accent)">Notas salvas</span>` : `<span style="font-size:0.78rem;color:var(--text3)">Sem notas ainda</span>`}
      </div>
    </div>
  </div>`;
}

export function renderLinkListItem(l) {
  const favicon = getFavicon(l.url);
  return `<div class="link-list-item fade-in">
    <div class="link-list-main">
      <div class="link-favicon">${favicon ? `<img src="${favicon}" alt="">` : getDomainInitial(l.url)}</div>
      <div class="link-list-text">
        <div class="lli-title">${l.title || getDomain(l.url)}</div>
        <div class="lli-url">${getDomain(l.url)}</div>
      </div>
    </div>
    ${l.note ? `<div class="lli-note">${l.note}</div>` : ''}
    <div class="link-list-actions">
      <a href="${l.url}" target="_blank" class="link-action-btn" title="Abrir"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
      <button class="link-action-btn" title="Editar" onclick="openEditLinkModal('${l.id}')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="link-action-btn del" title="Excluir" onclick="confirmDelete('link','${l.id}')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
      <button class="link-action-btn" title="Notas" onclick="openLinkNoteModal('${l.id}')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M8 9h8m-8 4h5"/></svg></button>
    </div>
  </div>`;
}

export function execCmd(command, value = null) {
  const editor = document.getElementById('link-rich-note');
  if (editor) editor.focus();
  document.execCommand(command, false, value);
}

export function toggleHighlight() {
  const editor = document.getElementById('link-rich-note');
  if (editor) editor.focus();
  const accentBg = getComputedStyle(document.documentElement).getPropertyValue('--accent-bg').trim() || '#f7f6f3';
  document.execCommand('hiliteColor', false, accentBg);
}

export function updateNoteFolderSelects() {
  const sel = document.getElementById('notes-filter-folder');
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = '<option value="">Todas as Anotações</option>' +
    state.noteFolders.map(nf => `<option value="${nf.id}">${nf.name}</option>`).join('');
  sel.value = currentVal;

  const btnDel = document.getElementById('btn-del-note-folder');
  if (btnDel) btnDel.style.display = sel.value ? 'block' : 'none';
}

export function addNoteFolder() {
  const name = prompt('Nome da nova pasta de anotações:');
  if (name) {
    state.noteFolders.push({ id: 'nf' + Date.now(), name });
    saveState();
    updateNoteFolderSelects();
  }
}

export function deleteCurrentNoteFolder() {
  const sel = document.getElementById('notes-filter-folder');
  if (!sel) return;
  const id = sel.value;
  if (id && confirm('Excluir esta pasta? As notas não serão apagadas, mas ficarão sem pasta.')) {
    state.noteFolders = state.noteFolders.filter(x => x.id !== id);
    state.notes.forEach(n => {
      if (n.folderId === id) n.folderId = null;
    });
    sel.value = '';
    saveState();
    updateNoteFolderSelects();
    renderGeneralNotes();
  }
}

export function addGeneralNote() {
  const currentFolderId = document.getElementById('notes-filter-folder')?.value || null;
  const note = { id: 'n' + Date.now(), title: '', content: '', images: [], folderId: currentFolderId };
  state.notes.unshift(note);
  editingNoteId = note.id;
  saveState();
  renderGeneralNotes();
}

export function editGeneralNote(id) {
  editingNoteId = id;
  renderGeneralNotes();
}

export function cancelEditGeneralNote() {
  editingNoteId = null;
  renderGeneralNotes();
}

export function renderGeneralNotes() {
  const list = document.getElementById('notes-list');
  if (!list) return;
  const currentFolderId = document.getElementById('notes-filter-folder')?.value;
  const btnDel = document.getElementById('btn-del-note-folder');
  if (btnDel) btnDel.style.display = currentFolderId ? 'block' : 'none';

  let filteredNotes = state.notes;
  if (currentFolderId) {
    filteredNotes = state.notes.filter(n => n.folderId === currentFolderId);
  }

  if (filteredNotes.length === 0) {
    list.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <h3>Nenhuma anotação</h3><p>Crie notas de estudo, resumos...</p></div>`;
    return;
  }

  list.innerHTML = filteredNotes
    .map(n => {
      const isEditing = editingNoteId === n.id;
      const folderName = n.folderId ? (state.noteFolders.find(f => f.id === n.folderId)?.name || 'Sem pasta') : 'Sem pasta';
      const titleValue = n.title || '';
      const contentValue = n.content || '<em>Sem conteúdo...</em>';
      const titleHtml = isEditing
        ? `<input type="text" value="${titleValue}" id="note-title-${n.id}" placeholder="Título da nota..." style="background:none;border:none;outline:none;font-size:0.95rem;font-weight:600;color:var(--text);flex:1;">`
        : `<div class="note-card-title">${titleValue || '<em style="color:var(--text3)">Sem título</em>'}</div>`;
      const folderHtml = isEditing
        ? `<select id="note-folder-sel-${n.id}" style="background:var(--bg2); border:1px solid var(--border); border-radius:4px; font-size:0.75rem; color:var(--text2); padding:4px 6px; margin-right:8px; outline:none"><option value="">Sem pasta</option>${state.noteFolders
            .map(nf => `<option value="${nf.id}" ${nf.id === n.folderId ? 'selected' : ''}>${nf.name}</option>`)
            .join('')}</select>`
        : `<div style="font-size:0.78rem;color:var(--text3);margin-left:auto;white-space:nowrap">${folderName}</div>`;
      const actionsHtml = isEditing
        ? `<div class="note-card-actions"><button class="btn btn-success" onclick="saveSpecificGeneralNote('${n.id}')">Salvar</button><button class="btn btn-ghost" onclick="cancelEditGeneralNote()">Cancelar</button><button class="btn btn-ghost" onclick="confirmDelete('note','${n.id}')">✕</button></div>`
        : `<div class="note-card-actions"><button class="btn btn-ghost" onclick="editGeneralNote('${n.id}')">Editar</button><button class="btn btn-ghost" onclick="confirmDelete('note','${n.id}')">✕</button></div>`;
      const editorArea = isEditing
        ? `
        <div class="editor-wrapper" style="border:none; border-radius:0">
          <div class="editor-toolbar">
            <button class="editor-btn" onclick="execCmd('bold')" title="Negrito"><b>B</b></button>
            <button class="editor-btn" onclick="execCmd('italic')" title="Itálico"><i>I</i></button>
            <div style="width: 1px; background: var(--border); margin: 0 4px;"></div>
            <button class="editor-btn highlight-btn" onclick="toggleHighlight()" title="Grifar"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 11h-8v-2h8v2zm-10-6h12v-2h-12v2zm12 10h-12v2h12v-2z"/></svg></button>
            <button class="editor-btn" onclick="execCmd('insertUnorderedList')" title="Lista">ul</button>
          </div>
          <div class="rich-editor" id="note-content-${n.id}" contenteditable="true" data-placeholder="Escreva aqui...">${n.content || ''}</div>
        </div>
      `
        : `<div class="note-card-note-view">${contentValue}</div>`;
      const imageSection = `<div class="note-card-images">
          <div class="img-preview-grid" id="note-imgs-${n.id}"></div>
          ${isEditing ? `<div class="upload-img-area" onclick="document.getElementById('note-img-${n.id}').click()" style="margin-top:6px; padding:8px"><p style="font-size:0.75rem">+ Anexar imagem</p></div><input type="file" id="note-img-${n.id}" accept="image/*" multiple style="display:none" onchange="handleImageUpload(event,'general-note','${n.id}')">` : ''}
        </div>`;

      return `
      <div class="note-card" style="margin-bottom:12px">
        <div class="note-card-header">
          ${titleHtml}
          ${folderHtml}
          ${actionsHtml}
        </div>
        <div class="note-card-body">
          <div class="note-card-main">${editorArea}</div>
          ${isEditing || (n.images && n.images.length) ? imageSection : ''}
        </div>
      </div>
    `;
    })
    .join('');

  filteredNotes.forEach(n => renderNoteImages(`note-imgs-${n.id}`, n.images || [], false, n.id));
}

export function saveSpecificGeneralNote(id) {
  const n = state.notes.find(x => x.id === id);
  if (n) {
    const titleInput = document.getElementById(`note-title-${id}`);
    const contentEditor = document.getElementById(`note-content-${id}`);
    const folderSel = document.getElementById(`note-folder-sel-${id}`);
    n.title = titleInput ? titleInput.value : n.title;
    n.content = contentEditor ? contentEditor.innerHTML : n.content;
    n.folderId = folderSel ? folderSel.value || null : n.folderId;
    saveState();
    editingNoteId = null;
    renderGeneralNotes();
  }
}

export function openLinkNoteModal(linkId) {
  const link = state.links.find(l => l.id === linkId);
  if (!link) return;
  const subtitle = document.getElementById('link-note-subtitle');
  const hidden = document.getElementById('link-note-id');
  const editor = document.getElementById('link-rich-note');
  if (subtitle) subtitle.textContent = `Referente a: ${link.title}`;
  if (hidden) hidden.value = linkId;
  if (editor) editor.innerHTML = link.richNote || '';
  const btn = document.getElementById('btn-save-link-note');
  if (btn) btn.textContent = 'Salvar Anotação';
  openModal('modal-link-note');
}

export function saveLinkRichNote() {
  const linkId = document.getElementById('link-note-id')?.value;
  const content = document.getElementById('link-rich-note')?.innerHTML;
  const link = state.links.find(l => l.id === linkId);
  if (link && content !== undefined) {
    link.richNote = content;
    saveState();
    const btn = document.getElementById('btn-save-link-note');
    if (btn) btn.textContent = '✓ Salvo!';
    if (currentFolder) {
      const f = state.folders.find(x => x.id === currentFolder);
      if (f) renderLinks(state.links.filter(l => l.folderId === f.id), document.getElementById('folder-links-container'));
    } else {
      renderHomePage();
    }
    setTimeout(() => {
      closeModal('modal-link-note');
    }, 800);
  }
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function getWeekDates(offset = 0) {
  const today = new Date();
  const day = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - day + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function renderAgenda() {
  const dates = getWeekDates(currentWeekOffset);
  const start = dates[0];
  const end = dates[6];
  const label = document.getElementById('agenda-week-label');
  if (label)
    label.textContent = `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const grid = document.getElementById('agenda-grid');
  if (!grid) return;
  grid.innerHTML = dates
    .map(d => {
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = d.getTime() === today.getTime();
      const events = state.events.filter(e => e.date === dateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      return `<div class="agenda-day">
        <div class="agenda-day-header ${isToday ? 'today' : ''}">
          <span>${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}</span>
          ${isToday ? '<span style="font-size:0.65rem">Hoje</span>' : ''}
        </div>
        <div class="agenda-events" id="day-${dateStr}">
          ${events
            .map(
              ev => `
            <div class="agenda-event" onclick="deleteEvent('${ev.id}')">
              <div class="agenda-event-dot" style="background:${ev.color || '#7c6ff7'}"></div>
              <div class="agenda-event-text">
                ${ev.time ? `<span style="font-size:0.7rem;opacity:0.6">${ev.time} </span>` : ''}${ev.title}
              </div>
            </div>
          `,
            )
            .join('')}
          <button class="agenda-add-btn" onclick="openAddEventModalDate('${dateStr}')">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Adicionar
          </button>
        </div>
      </div>`;
    })
    .join('');
  const agendaNote = document.getElementById('agenda-note');
  if (agendaNote) agendaNote.value = state.agendaNote || '';
}

export function prevWeek() {
  currentWeekOffset -= 1;
  renderAgenda();
}

export function nextWeek() {
  currentWeekOffset += 1;
  renderAgenda();
}

export function openAddEventModal() {
  const editEvt = document.getElementById('edit-event-id');
  const titleEl = document.getElementById('event-title');
  const dateEl = document.getElementById('event-date');
  const timeEl = document.getElementById('event-time');
  const descEl = document.getElementById('event-desc');
  if (editEvt) editEvt.value = '';
  if (titleEl) titleEl.value = '';
  if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
  if (timeEl) timeEl.value = '';
  if (descEl) descEl.value = '';
  selectedEventColor = '#7c6ff7';
  const swatches = document.querySelectorAll('#event-color-swatches .swatch');
  swatches.forEach(s => s.classList.remove('active'));
  if (swatches[0]) swatches[0].classList.add('active');
  openModal('modal-add-event');
}

export function openAddEventModalDate(dateStr) {
  openAddEventModal();
  const dateEl = document.getElementById('event-date');
  if (dateEl) dateEl.value = dateStr;
}

export function saveEvent() {
  const title = document.getElementById('event-title')?.value.trim();
  const date = document.getElementById('event-date')?.value;
  if (!title || !date) {
    alert('Título e data são obrigatórios');
    return;
  }
  const editId = document.getElementById('edit-event-id')?.value;
  const data = {
    id: editId || 'e' + Date.now(),
    title,
    date,
    time: document.getElementById('event-time')?.value,
    desc: document.getElementById('event-desc')?.value.trim(),
    color: selectedEventColor,
  };
  if (editId) state.events = state.events.map(e => (e.id === editId ? data : e));
  else state.events.push(data);
  saveState();
  closeModal('modal-add-event');
  renderAgenda();
  if (currentFolder === null) renderHomePage();
}

export function deleteEvent(id) {
  if (!confirm('Excluir evento?')) return;
  state.events = state.events.filter(e => e.id !== id);
  saveState();
  renderAgenda();
  if (currentFolder === null) renderHomePage();
}

export function selectEventColor(el) {
  document.querySelectorAll('#event-color-swatches .swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  selectedEventColor = el.dataset.color;
}

export function setView(v) {
  currentView = v;
  const gridBtn = document.getElementById('vt-grid');
  const listBtn = document.getElementById('vt-list');
  if (gridBtn) gridBtn.classList.toggle('active', v === 'grid');
  if (listBtn) listBtn.classList.toggle('active', v === 'list');
  if (currentFolder) {
    const f = state.folders.find(x => x.id === currentFolder);
    if (f) renderLinks(state.links.filter(l => l.folderId === f.id), document.getElementById('folder-links-container'));
  }
}

export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

export function openAddLinkModal() {
  const title = document.getElementById('link-modal-title');
  if (title) title.textContent = 'Adicionar Link';
  const editId = document.getElementById('edit-link-id');
  const url = document.getElementById('link-url');
  const linkTitle = document.getElementById('link-title');
  const note = document.getElementById('link-note');
  const tags = document.getElementById('link-tags');
  if (editId) editId.value = '';
  if (url) url.value = '';
  if (linkTitle) linkTitle.value = '';
  if (note) note.value = '';
  if (tags) tags.value = '';
  tempImages = [];
  const imgs = document.getElementById('link-modal-imgs');
  if (imgs) imgs.innerHTML = '';
  const sel = document.getElementById('link-folder');
  if (sel)
    sel.innerHTML =
      '<option value="">Sem pasta</option>' +
      state.folders.map(f => `<option value="${f.id}" ${f.id === currentFolder ? 'selected' : ''}>${f.emoji || '📁'} ${f.name}</option>`).join('');
  openModal('modal-add-link');
}

export function openEditLinkModal(id) {
  const l = state.links.find(x => x.id === id);
  if (!l) return;
  const title = document.getElementById('link-modal-title');
  const editId = document.getElementById('edit-link-id');
  const url = document.getElementById('link-url');
  const linkTitle = document.getElementById('link-title');
  const note = document.getElementById('link-note');
  const tags = document.getElementById('link-tags');
  if (title) title.textContent = 'Editar Link';
  if (editId) editId.value = id;
  if (url) url.value = l.url;
  if (linkTitle) linkTitle.value = l.title || '';
  if (note) note.value = l.note || '';
  if (tags) tags.value = l.tags || '';
  tempImages = [...(l.images || [])];
  renderNoteImages('link-modal-imgs', tempImages, true);
  const sel = document.getElementById('link-folder');
  if (sel)
    sel.innerHTML =
      '<option value="">Sem pasta</option>' +
      state.folders.map(f => `<option value="${f.id}" ${f.id === l.folderId ? 'selected' : ''}>${f.emoji || '📁'} ${f.name}</option>`).join('');
  openModal('modal-add-link');
}

export function saveLink() {
  const urlInput = document.getElementById('link-url');
  const url = urlInput?.value.trim();
  if (!url) {
    alert('URL é obrigatória');
    return;
  }
  const editId = document.getElementById('edit-link-id')?.value;
  const prevLink = state.links.find(x => x.id === editId) || {};
  const data = {
    url,
    id: editId || 'l' + Date.now(),
    title: document.getElementById('link-title')?.value.trim() || getDomain(url),
    note: document.getElementById('link-note')?.value.trim(),
    tags: document.getElementById('link-tags')?.value.trim(),
    folderId: document.getElementById('link-folder')?.value,
    images: [...tempImages],
    richNote: prevLink.richNote || '',
    createdAt: prevLink.createdAt || Date.now(),
  };
  if (editId) state.links = state.links.map(l => (l.id === editId ? data : l));
  else state.links.push(data);
  saveState();
  closeModal('modal-add-link');
  refreshCurrentView();
}

export function autoFillTitle() {
  const url = document.getElementById('link-url')?.value.trim();
  const title = document.getElementById('link-title');
  if (url && title && !title.value) title.value = getDomain(url);
}

export function openAddFolderModal() {
  const title = document.getElementById('folder-modal-title');
  const editId = document.getElementById('edit-folder-id');
  const name = document.getElementById('folder-name-input');
  const desc = document.getElementById('folder-desc-input');
  const emoji = document.getElementById('folder-emoji-input');
  const preview = document.getElementById('folder-img-preview');
  if (title) title.textContent = 'Nova Pasta';
  if (editId) editId.value = '';
  if (name) name.value = '';
  if (desc) desc.value = '';
  if (emoji) emoji.value = '';
  if (preview) preview.innerHTML = '';
  folderCoverImg = '';
  selectedFolderColor = '#7c6ff7';
  document.querySelectorAll('#folder-color-swatches .swatch').forEach(s => s.classList.remove('active'));
  document.querySelector('#folder-color-swatches .swatch')?.classList.add('active');
  openModal('modal-add-folder');
}

export function openEditFolderModal(id) {
  const f = state.folders.find(x => x.id === id);
  if (!f) return;
  const title = document.getElementById('folder-modal-title');
  const editId = document.getElementById('edit-folder-id');
  const name = document.getElementById('folder-name-input');
  const desc = document.getElementById('folder-desc-input');
  const emoji = document.getElementById('folder-emoji-input');
  const preview = document.getElementById('folder-img-preview');
  if (title) title.textContent = 'Editar Pasta';
  if (editId) editId.value = id;
  if (name) name.value = f.name;
  if (desc) desc.value = f.desc || '';
  if (emoji) emoji.value = f.emoji || '';
  folderCoverImg = f.coverImg || '';
  selectedFolderColor = f.color || '#7c6ff7';
  if (preview) preview.innerHTML = folderCoverImg ? `<div class="img-preview-item"><img src="${folderCoverImg}" alt=""></div>` : '';
  document.querySelectorAll('#folder-color-swatches .swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === selectedFolderColor);
  });
  openModal('modal-add-folder');
}

export function saveFolder() {
  const name = document.getElementById('folder-name-input')?.value.trim();
  if (!name) {
    alert('Nome é obrigatório');
    return;
  }
  const editId = document.getElementById('edit-folder-id')?.value;
  const prevFolder = state.folders.find(x => x.id === editId) || {};
  const data = {
    id: editId || 'f' + Date.now(),
    name,
    desc: document.getElementById('folder-desc-input')?.value.trim(),
    emoji: document.getElementById('folder-emoji-input')?.value.trim() || '📁',
    color: selectedFolderColor,
    coverImg: folderCoverImg,
    note: prevFolder.note || '',
    noteImgs: prevFolder.noteImgs || [],
    reminder: prevFolder.reminder || '',
  };
  if (editId) state.folders = state.folders.map(f => (f.id === editId ? data : f));
  else state.folders.push(data);
  saveState();
  closeModal('modal-add-folder');
  renderSidebar();
  renderHomePage();
  if (editId && currentFolder === editId) openFolder(editId);
}

export function selectFolderColor(el) {
  document.querySelectorAll('#folder-color-swatches .swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  selectedFolderColor = el.dataset.color;
}

export function handleFolderCover(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    folderCoverImg = ev.target.result;
    const preview = document.getElementById('folder-img-preview');
    if (preview) preview.innerHTML = `<div class="img-preview-item"><img src="${folderCoverImg}" alt=""></div>`;
  };
  reader.readAsDataURL(file);
}

export function saveHomeNote() {
  state.homeNote = document.getElementById('home-note')?.value || '';
  saveState();
}

export function saveFolderNote() {
  const f = state.folders.find(x => x.id === currentFolder);
  if (f) {
    f.note = document.getElementById('folder-note')?.value || '';
    saveState();
  }
}

export function saveFolderReminder() {
  const f = state.folders.find(x => x.id === currentFolder);
  if (f) {
    f.reminder = document.getElementById('folder-reminder')?.value || '';
    saveState();
  }
}

export function saveQuickNote() {
  state.quickNote = document.getElementById('quick-note-text')?.value || '';
  saveState();
}

export function saveAgendaNote() {
  state.agendaNote = document.getElementById('agenda-note')?.value || '';
  saveState();
}

export function toggleQuickNote() {
  const panel = document.getElementById('quick-note-panel');
  if (panel) panel.classList.toggle('open');
}

export function handleImageUpload(e, ctx, noteId) {
  const files = Array.from(e.target.files || []);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target.result;
      if (ctx === 'home') {
        state.homeNoteImgs = state.homeNoteImgs || [];
        state.homeNoteImgs.push(src);
        saveState();
        renderNoteImages('home-note-imgs', state.homeNoteImgs);
      } else if (ctx === 'folder') {
        const f = state.folders.find(x => x.id === currentFolder);
        if (f) {
          f.noteImgs = f.noteImgs || [];
          f.noteImgs.push(src);
          saveState();
          renderNoteImages('folder-note-imgs', f.noteImgs);
        }
      } else if (ctx === 'link-modal') {
        tempImages.push(src);
        renderNoteImages('link-modal-imgs', tempImages, true);
      } else if (ctx === 'general-note') {
        const n = state.notes.find(x => x.id === noteId);
        if (n) {
          n.images = n.images || [];
          n.images.push(src);
          saveState();
          renderNoteImages('note-imgs-' + noteId, n.images, false, noteId);
        }
      }
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

export function renderNoteImages(containerId, imgs, isModal = false, noteId = null) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!imgs || imgs.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = imgs
    .map(
      (src, i) => `<div class="img-preview-item"><img src="${src}" alt="" onclick="openImagePreview('${encodeURIComponent(src)}')"><div class="remove-img" onclick="removeImage('${containerId}',${i},'${isModal ? 'modal' : ''}','${noteId || ''}')">✕</div></div>`,
    )
    .join('');
}

export function openImagePreview(encodedSrc) {
  const src = decodeURIComponent(encodedSrc);
  const preview = document.getElementById('image-preview-img');
  const overlay = document.getElementById('image-preview-overlay');
  if (preview) preview.src = src;
  if (overlay) overlay.classList.add('open');
}

export function closeImagePreview() {
  const overlay = document.getElementById('image-preview-overlay');
  const preview = document.getElementById('image-preview-img');
  if (overlay) overlay.classList.remove('open');
  if (preview) preview.src = '';
}

export function removeImage(containerId, idx, ctx, noteId) {
  if (ctx === 'modal') {
    tempImages.splice(idx, 1);
    renderNoteImages(containerId, tempImages, true);
  } else if (containerId === 'home-note-imgs') {
    state.homeNoteImgs.splice(idx, 1);
    saveState();
    renderNoteImages(containerId, state.homeNoteImgs);
  } else if (containerId === 'folder-note-imgs') {
    const f = state.folders.find(x => x.id === currentFolder);
    if (f) {
      f.noteImgs.splice(idx, 1);
      saveState();
      renderNoteImages(containerId, f.noteImgs);
    }
  } else if (noteId) {
    const n = state.notes.find(x => x.id === noteId);
    if (n) {
      n.images.splice(idx, 1);
      saveState();
      renderNoteImages(containerId, n.images, false, noteId);
    }
  }
}

export function confirmDelete(type, id) {
  if (type === 'folder-note') {
    confirmCallback = () => {
      state.folderNotes = state.folderNotes.filter(n => n.id !== id);
      saveState();
      renderFolderNotes();
      closeConfirm();
    };
    openConfirm('Tem certeza que deseja excluir esta anotação da pasta?', confirmCallback);
    return;
  }
  const msgs = {
    link: 'Excluir este link?',
    pasta: 'Excluir esta pasta e todos os seus links?',
    note: 'Excluir esta anotação?',
  };
  const actionBtn = document.getElementById('confirm-action-btn');
  document.getElementById('confirm-message').textContent = msgs[type] || 'Confirmar exclusão?';
  confirmCallback = () => {
    if (type === 'link') state.links = state.links.filter(l => l.id !== id);
    else if (type === 'pasta') {
      state.links = state.links.filter(l => l.folderId !== id);
      state.folders = state.folders.filter(f => f.id !== id);
      currentFolder = null;
      showPage('home');
      renderHomePage();
    } else if (type === 'note') state.notes = state.notes.filter(n => n.id !== id);
    saveState();
    renderSidebar();
    renderHomePage();
    refreshCurrentView();
    if (type === 'note') renderGeneralNotes();
    closeConfirm();
  };
  if (actionBtn) actionBtn.onclick = confirmCallback;
  const overlay = document.getElementById('confirm-overlay');
  if (overlay) overlay.classList.add('open');
}

export function closeConfirm() {
  const overlay = document.getElementById('confirm-overlay');
  if (overlay) overlay.classList.remove('open');
}

export function handleSearch() {
  const q = document.getElementById('search-input')?.value.trim().toLowerCase();
  if (!q) {
    if (document.getElementById('page-search')?.classList.contains('active')) {
      showPage('home');
      renderHomePage();
    }
    return;
  }
  showPage('search', `Busca: ${q}`);
  const results = state.links.filter(
    l =>
      (l.title || '').toLowerCase().includes(q) ||
      (l.url || '').toLowerCase().includes(q) ||
      (l.note || '').toLowerCase().includes(q) ||
      (l.tags || '').toLowerCase().includes(q),
  );
  const searchTitle = document.getElementById('search-title');
  if (searchTitle) searchTitle.textContent = `${results.length} resultado(s) para "${q}"`;
  const container = document.getElementById('search-results');
  if (container) {
    if (results.length === 0) {
      container.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><h3>Nenhum resultado</h3><p>Tente outras palavras-chave</p></div>`;
    } else {
      container.innerHTML = `<div class="links-grid">${results.map(l => renderLinkCard(l)).join('')}</div>`;
    }
  }
}

export function exportData() {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `studynest-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

export function importData(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      if (!confirm('Substituir todos os dados atuais pelo backup?')) return;
      Object.assign(state, {
        folders: d.folders || [],
        links: d.links || [],
        noteFolders: d.noteFolders || [],
        notes: d.notes || [],
        folderNotes: d.folderNotes || [],
        events: d.events || [],
        homeNote: d.homeNote || '',
        homeNoteImgs: d.homeNoteImgs || [],
        quickNote: d.quickNote || '',
        agendaNote: d.agendaNote || '',
        theme: d.theme || state.theme,
      });
      saveState();
      init();
      alert('Dados importados com sucesso!');
    } catch {
      alert('Arquivo inválido.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

export function clearAllData() {
  if (!confirm('ATENÇÃO: Isso apagará TODOS os seus dados. Tem certeza?')) return;
  Object.assign(state, {
    folders: [],
    links: [],
    noteFolders: [],
    notes: [],
    folderNotes: [],
    events: [],
    homeNote: '',
    homeNoteImgs: [],
    quickNote: '',
    agendaNote: '',
    theme: state.theme,
  });
  saveState();
  init();
}

export function refreshCurrentView() {
  if (currentFolder) {
    const f = state.folders.find(x => x.id === currentFolder);
    if (f) renderFolderPage(f);
  } else renderHomePage();
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function getFavicon(url) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return null;
  }
}

export function getDomainInitial(url) {
  const d = getDomain(url);
  return d ? d[0].toUpperCase() : '?';
}

export function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR');
}

export function openConfirm(message, callback) {
  const overlay = document.getElementById('confirm-overlay');
  const messageEl = document.getElementById('confirm-message');
  const actionBtn = document.getElementById('confirm-action-btn');
  if (messageEl) messageEl.textContent = message;
  if (actionBtn) actionBtn.onclick = callback;
  if (overlay) overlay.classList.add('open');
}

export function initLegacy() {
  init();
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('open');
    });
  });
  const confirmOverlay = document.getElementById('confirm-overlay');
  if (confirmOverlay) {
    confirmOverlay.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeConfirm();
    });
  }
}

const legacyGlobals = {
  state,
  loadState,
  saveState,
  escapeHtml,
  setTheme,
  toggleThemeDropdown,
  toggleSidebar,
  renderSidebar,
  showPage,
  openFolder,
  renderHomePage,
  renderFolderNotes,
  addFolderNote,
  editFolderNoteItem,
  cancelEditFolderNote,
  saveFolderNoteItem,
  renderFolderPage,
  renderLinks,
  transformarParaEmbed,
  renderLinkCard,
  renderLinkListItem,
  execCmd,
  toggleHighlight,
  updateNoteFolderSelects,
  addNoteFolder,
  deleteCurrentNoteFolder,
  addGeneralNote,
  editGeneralNote,
  cancelEditGeneralNote,
  renderGeneralNotes,
  saveSpecificGeneralNote,
  openLinkNoteModal,
  saveLinkRichNote,
  getWeekDates,
  renderAgenda,
  prevWeek,
  nextWeek,
  openAddEventModal,
  openAddEventModalDate,
  saveEvent,
  deleteEvent,
  selectEventColor,
  setView,
  openModal,
  closeModal,
  openAddLinkModal,
  openEditLinkModal,
  saveLink,
  autoFillTitle,
  openAddFolderModal,
  openEditFolderModal,
  saveFolder,
  selectFolderColor,
  handleFolderCover,
  saveHomeNote,
  saveFolderNote,
  saveFolderReminder,
  saveQuickNote,
  saveAgendaNote,
  toggleQuickNote,
  handleImageUpload,
  renderNoteImages,
  removeImage,
  openImagePreview,
  closeImagePreview,
  confirmDelete,
  closeConfirm,
  handleSearch,
  exportData,
  importData,
  clearAllData,
  refreshCurrentView,
  getDomain,
  getFavicon,
  getDomainInitial,
  formatDate,
  openConfirm,
  initLegacy,
};

Object.assign(window, legacyGlobals);
