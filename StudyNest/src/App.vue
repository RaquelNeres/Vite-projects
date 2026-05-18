<template>
  <div id="app">
    <!-- SIDEBAR -->
    <div id="sidebar">
      <div class="sidebar-header">
        <div class="logo">Study<span>Nest</span></div>
        <button class="sidebar-toggle" onclick="toggleSidebar()" title="Colapsar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/></svg>
        </button>
      </div>
      <div class="sidebar-nav">
        <div style="height:8px"></div>
        <div class="nav-item active" onclick="showPage('home')" id="nav-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Início</span>
        </div>
        <div class="nav-item" onclick="showPage('agenda')" id="nav-agenda">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Agenda</span>
        </div>
        <div class="nav-item" onclick="showPage('notes')" id="nav-notes">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span>Anotações Gerais</span>
        </div>
        <div class="nav-item" onclick="showPage('settings')" id="nav-settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
          <span>Dados & Sync</span>
        </div>

        <div class="sidebar-section">Pastas</div>
        <div id="folder-list"></div>

        <button class="add-folder-btn" onclick="openAddFolderModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Nova pasta</span>
        </button>
      </div>
    </div>

    <!-- MAIN -->
    <div id="main">
      <!-- TOPBAR -->
      <div id="topbar">
        <div id="page-title">Início</div>
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="search-input" placeholder="Buscar links..." oninput="handleSearch()" />
        </div>
        <div class="topbar-btn" style="position:relative" onclick="toggleThemeDropdown()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <div class="theme-dropdown" id="theme-dropdown">
            <div class="theme-opt" onclick="setTheme('dark')"><div class="theme-dot" style="background:#161619;border-color:#7c6ff7"></div>Noite Escura</div>
            <div class="theme-opt" onclick="setTheme('light')"><div class="theme-dot" style="background:#f7f6f3;border-color:#6b5ce7"></div>Luz do Dia</div>
            <div class="theme-opt" onclick="setTheme('sepia')"><div class="theme-dot" style="background:#f4efe8;border-color:#c07a3a"></div>Sépia</div>
            <div class="theme-opt" onclick="setTheme('forest')"><div class="theme-dot" style="background:#0d1512;border-color:#4ec97a"></div>Floresta</div>
            <div class="theme-opt" onclick="setTheme('night-blue')"><div class="theme-dot" style="background:#090c14;border-color:#4d9ef7"></div>Azul Noturno</div>
            <div class="theme-opt" onclick="setTheme('rose')"><div class="theme-dot" style="background:#fdf2f4;border-color:#d44e6e"></div>Rosé</div>
          </div>
        </div>
        <button class="topbar-btn" onclick="openAddLinkModal()" title="Adicionar link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <!-- CONTENT -->
      <div id="content">

        <!-- HOME PAGE -->
        <div class="page active" id="page-home">
          <div class="stats-row" id="home-stats"></div>
          <div class="folder-note-row">
            <div class="note-card">
              <div class="note-card-header">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span class="note-card-title">Anotação Rápida Solta</span>
              </div>
              <textarea class="note-textarea" id="home-note" placeholder="Escreva aqui pensamentos, ideias..." oninput="saveHomeNote()"></textarea>
              <div class="note-images-section">
                <div class="img-preview-grid" id="home-note-imgs"></div>
                <div class="upload-img-area" onclick="document.getElementById('home-img-upload').click()" style="margin-top:8px">
                  <p>Clique para anexar imagem</p>
                </div>
                <input type="file" id="home-img-upload" accept="image/*" multiple style="display:none" onchange="handleImageUpload(event,'home')" />
              </div>
            </div>
            <div>
              <div id="home-next-event" style="margin-bottom: 20px;"></div>
              <div class="section-title">Recentes</div>
              <div id="recent-links"></div>
            </div>
          </div>
          <div class="section-title">Todas as Pastas</div>
          <div id="home-folders-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px;"></div>
        </div>

        <!-- FOLDER PAGE -->
        <div class="page" id="page-folder">
          <div class="folder-header" id="folder-header"></div>
          <div class="folder-note-row">
            <div class="note-card">
              <div class="note-card-header">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span class="note-card-title">Nota da Pasta</span>
              </div>
              <textarea class="note-textarea" id="folder-note" placeholder="Anotações sobre esta pasta..." oninput="saveFolderNote()"></textarea>
              <div class="note-images-section">
                <div class="img-preview-grid" id="folder-note-imgs"></div>
                <div class="upload-img-area" onclick="document.getElementById('folder-img-upload').click()">
                  <p>Anexar imagem à nota</p>
                </div>
                <input type="file" id="folder-img-upload" accept="image/*" multiple style="display:none" onchange="handleImageUpload(event,'folder')" />
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px">
              <div class="note-card" style="flex:1">
                <div class="note-card-header">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span class="note-card-title">Lembrete da Pasta</span>
                </div>
                <textarea class="note-textarea" id="folder-reminder" style="min-height:80px" placeholder="Lembretes para esta pasta..." oninput="saveFolderReminder()"></textarea>
              </div>
            </div>
          </div>
          <div class="folder-body-grid">
            <div class="folder-panel">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
                <div class="section-title" style="margin-bottom:0">Notas da Pasta</div>
                <button class="btn btn-primary" style="padding:8px 12px;font-size:0.8rem" onclick="addFolderNote()">+ Nova anotação</button>
              </div>
              <div id="folder-notes-list"></div>
            </div>
            <div class="folder-panel">
              <div class="toolbar">
                <div class="section-title" style="margin-bottom:0">Links</div>
                <div class="toolbar-right">
                  <div class="view-toggle">
                    <button class="vt-btn active" id="vt-grid" onclick="setView('grid')" title="Grade"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button>
                    <button class="vt-btn" id="vt-list" onclick="setView('list')" title="Lista"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
                  </div>
                  <button class="btn btn-primary" onclick="openAddLinkModal()" style="padding:8px 12px;font-size:0.8rem">+ Novo link</button>
                </div>
              </div>
              <div id="folder-links-container"></div>
            </div>
          </div>
        </div>

        <!-- NOTES PAGE -->
        <div class="page" id="page-notes">
          <div class="section-title">Anotações Gerais</div>
          <div class="notes-topbar">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text2)">Pasta:</label>
            <select class="note-folder-select" id="notes-filter-folder" onchange="renderGeneralNotes()">
              <option value="">Todas as Anotações</option>
            </select>
            <button class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.75rem;" onclick="addNoteFolder()">+ Nova Pasta</button>
            <button class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.75rem; color:#e24b4a; margin-left:auto; display:none;" onclick="deleteCurrentNoteFolder()" id="btn-del-note-folder">Excluir Pasta</button>
          </div>

          <div id="notes-list"></div>
          <button class="btn btn-primary" onclick="addGeneralNote()" style="margin-top:8px">+ Nova anotação</button>
        </div>

        <!-- AGENDA PAGE -->
        <div class="page" id="page-agenda">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
            <div class="section-title" style="margin-bottom:0">Agenda Semanal</div>
            <button class="btn btn-ghost" onclick="prevWeek()" style="padding:5px 10px">← Anterior</button>
            <span id="agenda-week-label" style="font-size:0.82rem;color:var(--text2);min-width:160px;text-align:center"></span>
            <button class="btn btn-ghost" onclick="nextWeek()" style="padding:5px 10px">Próxima →</button>
            <button class="btn btn-primary" style="margin-left:auto;padding:6px 14px;font-size:0.8rem" onclick="openAddEventModal()">+ Evento</button>
          </div>
          <div class="agenda-grid" id="agenda-grid"></div>
          <div style="margin-top:20px">
            <div class="section-title">Notas da Agenda</div>
            <div class="note-card">
              <textarea class="note-textarea" id="agenda-note" style="min-height:100px" placeholder="Anotações gerais sobre sua semana de estudos..." oninput="saveAgendaNote()"></textarea>
            </div>
          </div>
        </div>

        <!-- SETTINGS PAGE (INTACTA) -->
        <div class="page" id="page-settings">
          <div class="section-title">Dados & Sincronização</div>
          <p style="font-size:0.85rem;color:var(--text2);margin-bottom:18px">Exporte seus dados para acessar em qualquer computador. Importe para restaurar.</p>
          <div class="export-area">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent)"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <div style="flex:1">
              <div style="font-size:0.88rem;font-weight:600">Exportar Dados</div>
              <div style="font-size:0.78rem;color:var(--text2)">Baixe um arquivo JSON com todos os seus links, anotações e eventos</div>
            </div>
            <button class="btn btn-primary" onclick="exportData()">Exportar</button>
          </div>
          <div class="export-area">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent)"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style="flex:1">
              <div style="font-size:0.88rem;font-weight:600">Importar Dados</div>
              <div style="font-size:0.78rem;color:var(--text2)">Restaure um backup exportado anteriormente (substitui dados atuais)</div>
            </div>
            <button class="btn btn-ghost" onclick="document.getElementById('import-file').click()">Importar</button>
            <input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(event)" />
          </div>
          <div style="margin-top:18px;border-top:1px solid var(--border);padding-top:18px">
            <button class="btn btn-danger" onclick="clearAllData()">Limpar todos os dados</button>
          </div>
        </div>

        <!-- SEARCH PAGE -->
        <div class="page" id="page-search">
          <div class="section-title" id="search-title">Resultados</div>
          <div id="search-results"></div>
        </div>

      </div>
    </div>

    <!-- QUICK NOTE FAB -->
    <button id="quick-note-fab" onclick="toggleQuickNote()" title="Nota rápida"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
    <div id="quick-note-panel">
      <div class="qnp-header"><span>Nota Rápida</span><button onclick="toggleQuickNote()" style="color:var(--text3)">✕</button></div>
      <textarea id="quick-note-text" placeholder="Capture uma ideia rápida..." oninput="saveQuickNote()"></textarea>
    </div>

    <!-- ADD LINK MODAL -->
    <div class="modal-overlay" id="modal-add-link">
      <div class="modal">
        <h2 id="link-modal-title">Adicionar Link</h2>
        <input type="hidden" id="edit-link-id" />
        <div class="form-group">
          <label>URL *</label>
          <input type="url" id="link-url" placeholder="https://youtube.com/..." oninput="autoFillTitle()" />
        </div>
        <div class="form-group"><label>Título</label><input type="text" id="link-title" placeholder="Nome do link" /></div>
        <div class="form-group"><label>Anotação Curta</label><textarea id="link-note" placeholder="O que é este link? Por que é útil?"></textarea></div>
        <div class="form-group"><label>Tags (separadas por vírgula)</label><input type="text" id="link-tags" placeholder="react, tutorial, importante" /></div>
        <div class="form-group">
          <label>Pasta</label>
          <select id="link-folder"><option value="">Sem pasta</option></select>
        </div>
        <div class="form-group">
          <label>Imagens Anexadas</label>
          <div class="img-preview-grid" id="link-modal-imgs"></div>
          <div class="upload-img-area" onclick="document.getElementById('link-img-upload').click()"><p>Clique para anexar imagem</p></div>
          <input type="file" id="link-img-upload" accept="image/*" multiple style="display:none" onchange="handleImageUpload(event,'link-modal')" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal('modal-add-link')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveLink()">Salvar</button>
        </div>
      </div>
    </div>

    <!-- ADD FOLDER MODAL (ORIGINAL, INTACTA) -->
    <div class="modal-overlay" id="modal-add-folder">
      <div class="modal">
        <h2 id="folder-modal-title">Nova Pasta</h2>
        <input type="hidden" id="edit-folder-id" />
        <div class="form-group"><label>Nome *</label><input type="text" id="folder-name-input" placeholder="Ex: Desenvolvimento Web" /></div>
        <div class="form-group"><label>Descrição</label><input type="text" id="folder-desc-input" placeholder="Opcional" /></div>
        <div class="form-group"><label>Emoji (ícone)</label><input type="text" id="folder-emoji-input" placeholder="📚" maxlength="4" style="width:80px" /></div>
        <div class="form-group">
          <label>Imagem da Pasta</label>
          <div id="folder-img-preview" class="img-preview-grid"></div>
          <div class="upload-img-area" onclick="document.getElementById('folder-cover-upload').click()"><p>Clique para enviar imagem de capa</p></div>
          <input type="file" id="folder-cover-upload" accept="image/*" style="display:none" onchange="handleFolderCover(event)" />
        </div>
        <div class="form-group">
          <label>Cor do tema</label>
          <div class="color-swatches" id="folder-color-swatches">
            <div class="swatch active" style="background:#7c6ff7" data-color="#7c6ff7" onclick="selectFolderColor(this)"></div>
            <div class="swatch" style="background:#4ec97a" data-color="#4ec97a" onclick="selectFolderColor(this)"></div>
            <div class="swatch" style="background:#4d9ef7" data-color="#4d9ef7" onclick="selectFolderColor(this)"></div>
            <div class="swatch" style="background:#ef9f27" data-color="#ef9f27" onclick="selectFolderColor(this)"></div>
            <div class="swatch" style="background:#d44e6e" data-color="#d44e6e" onclick="selectFolderColor(this)"></div>
            <div class="swatch" style="background:#5dcaa5" data-color="#5dcaa5" onclick="selectFolderColor(this)"></div>
            <div class="swatch" style="background:#e24b4a" data-color="#e24b4a" onclick="selectFolderColor(this)"></div>
            <div class="swatch" style="background:#888780" data-color="#888780" onclick="selectFolderColor(this)"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal('modal-add-folder')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveFolder()">Salvar</button>
        </div>
      </div>
    </div>

    <!-- ADD EVENT MODAL (ORIGINAL) -->
    <div class="modal-overlay" id="modal-add-event">
      <div class="modal">
        <h2>Novo Evento</h2>
        <input type="hidden" id="edit-event-id" />
        <div class="form-group"><label>Título *</label><input type="text" id="event-title" placeholder="Ex: Revisar capítulo 3" /></div>
        <div class="form-group"><label>Data *</label><input type="date" id="event-date" /></div>
        <div class="form-group"><label>Horário</label><input type="time" id="event-time" /></div>
        <div class="form-group"><label>Descrição</label><textarea id="event-desc" placeholder="Detalhes do evento..."></textarea></div>
        <div class="form-group">
          <label>Cor</label>
          <div class="color-swatches" id="event-color-swatches">
            <div class="swatch active" style="background:#7c6ff7" data-color="#7c6ff7" onclick="selectEventColor(this)"></div>
            <div class="swatch" style="background:#4ec97a" data-color="#4ec97a" onclick="selectEventColor(this)"></div>
            <div class="swatch" style="background:#4d9ef7" data-color="#4d9ef7" onclick="selectEventColor(this)"></div>
            <div class="swatch" style="background:#ef9f27" data-color="#ef9f27" onclick="selectEventColor(this)"></div>
            <div class="swatch" style="background:#d44e6e" data-color="#d44e6e" onclick="selectEventColor(this)"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal('modal-add-event')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveEvent()">Salvar</button>
        </div>
      </div>
    </div>

    <!-- NOVIDADE: MODAL PARA ANOTAÇÕES DO LINK ESPECÍFICO (RICH TEXT) -->
    <div class="modal-overlay" id="modal-link-note">
      <div class="modal" style="max-width: 700px;">
        <h2>Anotações do Link</h2>
        <p id="link-note-subtitle" style="font-size: 0.85rem; color: var(--text2); margin-top: -12px; margin-bottom: 16px;"></p>
        <input type="hidden" id="link-note-id" />
        <div class="editor-wrapper" style="border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;">
          <div class="editor-toolbar">
            <button class="editor-btn" onclick="execCmd('bold')" onmousedown="event.preventDefault()" title="Negrito"><b>B</b></button>
            <button class="editor-btn" onclick="execCmd('italic')" onmousedown="event.preventDefault()" title="Itálico"><i>I</i></button>
            <div style="width: 1px; background: var(--border); margin: 0 4px;"></div>
            <button class="editor-btn highlight-btn" onclick="toggleHighlight()" onmousedown="event.preventDefault()" title="Grifar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 11h-8v-2h8v2zm-10-6h12v-2h-12v2zm12 10h-12v2h12v-2z"/></svg>
            </button>
            <button class="editor-btn" onclick="execCmd('insertUnorderedList')" onmousedown="event.preventDefault()" title="Lista">ul</button>
          </div>
          <div id="link-rich-note" class="rich-editor" contenteditable="true" data-placeholder="Faça anotações detalhadas sobre este link..."></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal('modal-link-note')">Fechar</button>
          <button class="btn btn-success" onclick="saveLinkRichNote()" id="btn-save-link-note">Salvar Anotação</button>
        </div>
      </div>
    </div>

    <!-- CONFIRM DELETE (ORIGINAL) -->
    <div class="confirm-overlay" id="confirm-overlay">
      <div class="confirm-box">
        <div style="font-size:1.5rem">🗑️</div>
        <p id="confirm-message">Tem certeza que deseja excluir?</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-ghost" onclick="closeConfirm()">Cancelar</button>
          <button class="btn btn-danger" id="confirm-action-btn">Excluir</button>
        </div>
      </div>
    </div>

    <div class="img-preview-overlay" id="image-preview-overlay" onclick="closeImagePreview()">
      <div class="img-preview-modal" onclick="event.stopPropagation()">
        <button class="img-preview-close" onclick="closeImagePreview()">✕</button>
        <img id="image-preview-img" src="" alt="Visualização de imagem" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { initLegacy } from './legacy.js';

onMounted(() => {
  initLegacy();
});
</script>
