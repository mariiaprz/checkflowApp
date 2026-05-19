class SPA {
    constructor() {
        try {
            // Elementos principales
            this.mainContent = document.getElementById('main-content');
            this.token = localStorage.getItem('jwt_token');
            this.activeFilter = '';   // '' = todas | '1' = completadas | '0' = pendientes
            this.lastPageDashboard = 1;
            this.lastPageTareas = 1;
            this.init();
        } catch (e) {
            alert("Error al iniciar SPA: " + e.message);
            console.error(e);
        }
    }

    // INICIALIZACIÓN Y CONFIGURACIÓN
    init() {
        this.applyAuthUI();
        this.wireLogout();
        this.wireNavLinks();
        this.wireSidebarToggle();

        // Carga la información del usuario autenticado en segundo plano
        this.loadUserInfo().catch(() => { });

        // Control del hash para el cambio de vista
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    // Visibilidad de los elementos del Header y Sidebar según el usuario
    applyAuthUI() {
        const navGuest = document.getElementById('nav-guest');
        const navAuth = document.getElementById('nav-auth');
        const sideAuth = document.getElementById('sidebar-auth');

        if (this.token) {
            navGuest?.classList.add('d-none');
            navAuth?.classList.remove('d-none');
            sideAuth?.classList.remove('d-auth-hidden');
            this.loadUserInfo();
        } else {
            navGuest?.classList.remove('d-none');
            navAuth?.classList.add('d-none');
            sideAuth?.classList.add('d-auth-hidden');
        }
    }

    // Recupera y carga la información de perfil del usuario a partir del token JWT actual
    async loadUserInfo() {
        if (!this.token) return;
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            this.userId = payload.sub;

            const res = await api.getProfile();
            const user = res.data;
            const name = user.name;
            this.userEmail = user.email;

            document.querySelectorAll('#nav-username, #nav-username-menu')
                .forEach(el => { if (el) el.textContent = name; });

            const initial = name.charAt(0).toUpperCase();
            const avatarDiv = document.getElementById('nav-avatar-initial');
            if (avatarDiv) {
                avatarDiv.textContent = initial;
            }
        } catch (_) { }
    }

    // Cierre de sesión tanto en Sidebar como en Header
    wireLogout() {
        const doLogout = () => {
            this.confirmAction(
                'Cerrar sesión',
                '¿Estás seguro de que quieres salir?',
                'Salir',
                'btn-danger',
                async () => {
                    try { await api.logout(); } catch (_) { }
                    localStorage.removeItem('jwt_token');
                    this.showToast('Sesión cerrada correctamente', 'success');
                    setTimeout(() => {
                        window.location.href = typeof LOGIN_URL !== 'undefined' ? LOGIN_URL : '/login';
                    }, 1200);
                }
            );
        };
        document.getElementById('headerLogoutBtn')?.addEventListener('click', doLogout);
        document.getElementById('sidebarLogoutBtn')?.addEventListener('click', doLogout);
    }

    // Enlaces marcados para navegación SPA interna que actualicen el hash del navegador
    wireNavLinks() {
        document.querySelectorAll('[data-spa-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = link.getAttribute('href');
            });
        });
    }

    // Control del interruptor del sidebar móvil y la visibilidad de los paneles emergentes
    wireSidebarToggle() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        const open = () => { sidebar?.classList.add('active'); overlay?.classList.add('active'); };
        const close = () => { sidebar?.classList.remove('active'); overlay?.classList.remove('active'); };

        document.getElementById('sidebarToggle')?.addEventListener('click', open);
        document.getElementById('sidebarClose')?.addEventListener('click', close);
        overlay?.addEventListener('click', close);
    }

    // CONTROL DE RUTAS
    handleRoute() {
        const hash = window.location.hash || '#dashboard';
        const detailMatch = hash.match(/^#tarea-(\d+)$/);

        this.updateActiveNav(hash);

        if (detailMatch) {
            this.updateBreadcrumb('Detalle de Tarea');
            return this.renderDetalle(detailMatch[1]);
        }

        switch (hash) {
            case '#tareas':
                if (!this.token) { window.location.href = LOGIN_URL; return; }
                this.updateBreadcrumb('Mis Tareas');
                return this.renderTareas();
            case '#perfil':
                if (!this.token) { window.location.href = LOGIN_URL; return; }
                this.updateBreadcrumb('Mi Perfil');
                return this.renderProfile();
            default:
                this.updateBreadcrumb('Tareas Públicas');
                return this.renderDashboard();
        }
    }

    // Actualiza las clases activas en los menús de navegación lateral
    updateActiveNav(hash) {
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            const h = link.getAttribute('href');
            const active = h === hash || (hash.startsWith('#tarea-') && h === '#tareas');
            link.classList.toggle('active', active);
        });
    }

    // Actualiza el indicador del breadcrumb superior según la sección actual
    updateBreadcrumb(page) {
        const el = document.getElementById('breadcrumb-current');
        if (el) el.textContent = page;
    }

    // COMPONENTES COMUNES
    // Muestra el indicador de carga
    showLoading() {
        this.mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
            </div>`;
    }

    // Enlaces dinámicos
    wireDynamicLinks() {
        this.mainContent.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = a.getAttribute('href');
            });
        });
    }

    // Filtros de tareas
    filterBar() {
        return `
        <div class="d-flex gap-2 mb-3">
            <button class="filter-btn ${this.activeFilter === '' ? 'active-all' : ''}" data-filter="">
                <i class="bi bi-list-ul"></i> Todas
            </button>
            <button class="filter-btn ${this.activeFilter === '0' ? 'active-pending' : ''}" data-filter="0">
                <i class="bi bi-clock"></i> Pendientes
            </button>
            <button class="filter-btn ${this.activeFilter === '1' ? 'active-completed' : ''}" data-filter="1">
                <i class="bi bi-check-circle"></i> Completadas
            </button>
        </div>`;
    }

    // Botones de filtro
    wireFilterBtns(rerenderFn) {
        this.mainContent.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const scrollY = window.scrollY;
                const currentHeight = this.mainContent.offsetHeight;

                // Mantiene el scroll evitando saltos visuales
                if (currentHeight > 0) this.mainContent.style.minHeight = currentHeight + 'px';

                this.activeFilter = btn.dataset.filter;
                try {
                    await rerenderFn(1);
                } finally {
                    this.mainContent.style.minHeight = '';
                    window.scrollTo(0, scrollY);
                }
            });
        });
    }

    // Paginación
    paginationHtml(meta) {
        if ((meta.last_page ?? 1) <= 1) return '';
        const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1);
        return `
        <div class="d-flex justify-content-between align-items-center pt-3 border-top">
            <small class="text-muted">Página ${meta.current_page} de ${meta.last_page}</small>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    ${meta.current_page > 1
                ? `<li class="page-item"><button class="page-link page-btn" data-page="${meta.current_page - 1}"><i class="bi bi-chevron-left"></i></button></li>`
                : ''}
                    ${pages.map(p => `
                        <li class="page-item ${p === meta.current_page ? 'active' : ''}">
                            <button class="page-link page-btn" data-page="${p}">${p}</button>
                        </li>`).join('')}
                    ${meta.current_page < meta.last_page
                ? `<li class="page-item"><button class="page-link page-btn" data-page="${meta.current_page + 1}"><i class="bi bi-chevron-right"></i></button></li>`
                : ''}
                </ul>
            </nav>
        </div>`;
    }

    // Badge
    badgeHtml(completada) {
        return completada
            ? `<span class="badge-completada"><i class="bi bi-check-lg me-1"></i>Completada</span>`
            : `<span class="badge-pendiente"><i class="bi bi-clock me-1"></i>Pendiente</span>`;
    }

    // Notificación Toast
    showToast(message, type = 'success') {
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            document.body.insertAdjacentHTML('beforeend', `
            <div id="toastContainer" class="toast-container toast-container-spa position-fixed bottom-0 end-0 p-3"></div>
            `);
            toastContainer = document.getElementById('toastContainer');
        }

        const icon = type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger';
        const title = type === 'success' ? 'Éxito' : 'Error';

        const toastHtml = `
        <div class="toast align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header border-0 pb-0">
                <i class="bi ${icon} me-2 fs-5"></i>
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body pt-1 pb-3 px-4">
                ${message}
            </div>
        </div>`;

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
        toast.show();

        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }

    // Modal genérico para confirmar operaciones
    confirmAction(title, message, btnText, btnClass, onConfirm) {
        let modalEl = document.getElementById('genericConfirmModal');
        if (!modalEl) {
            document.body.insertAdjacentHTML('beforeend', `
            <div class="modal fade" id="genericConfirmModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="confirmModalTitle"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="mb-0" id="confirmModalMessage"></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn" id="confirmModalBtn"></button>
                        </div>
                    </div>
                </div>
            </div>`);
            modalEl = document.getElementById('genericConfirmModal');
        }

        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;

        const btn = document.getElementById('confirmModalBtn');
        btn.textContent = btnText;
        btn.className = `btn ${btnClass}`;

        const modal = new bootstrap.Modal(modalEl);

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            modal.hide();
            onConfirm();
        });

        modal.show();
    }

    // VISTA: TAREAS PÚBLICAS
    async renderDashboard(page = null) {
        // Guardar o restaurar la última página navegada en el Dashboard
        if (page !== null) {
            this.lastPageDashboard = page;
        } else {
            page = this.lastPageDashboard;
        }

        this.showLoading();

        try {
            // Obtener listado de tareas públicas paginadas desde la API
            const res = await api.getTareas(page, this.activeFilter);
            const tareas = res.data.data;
            const meta = res.data;
            const totals = res.totals ?? { total: meta.total, completadas: 0, pendientes: 0, pct: 0 };

            // Estructura del Dashboard, tarjetas de estadísticas y tabla de tareas
            this.mainContent.innerHTML = `
            <div class="page-heading">
                <h1>Tareas Públicas</h1>
                <p>Listado público · ${totals.total} tareas en el proyecto</p>
            </div>

            <div class="dashboard-grid grid-cols-4 mb-4">
                <div class="stats-card stats-total">
                    <div class="stats-card-main">
                        <div>
                            <div class="stats-card-label">Total proyecto</div>
                            <div class="stats-card-value">${totals.total}</div>
                        </div>
                        <div class="stats-card-icon">
                            <i class="bi bi-list-task"></i>
                        </div>
                    </div>
                    <div class="stats-card-footer">
                        <span class="text-muted small">Todas las tareas</span>
                    </div>
                </div>
                <div class="stats-card stats-completed">
                    <div class="stats-card-main">
                        <div>
                            <div class="stats-card-label">Completadas</div>
                            <div class="stats-card-value">${totals.completadas}</div>
                        </div>
                        <div class="stats-card-icon">
                            <i class="bi bi-check2-circle"></i>
                        </div>
                    </div>
                    <div class="stats-card-footer">
                        <span class="text-success small">Listas</span>
                    </div>
                </div>
                <div class="stats-card stats-pending">
                    <div class="stats-card-main">
                        <div>
                            <div class="stats-card-label">Pendientes</div>
                            <div class="stats-card-value">${totals.pendientes}</div>
                        </div>
                        <div class="stats-card-icon">
                            <i class="bi bi-hourglass-split"></i>
                        </div>
                    </div>
                    <div class="stats-card-footer">
                        <span class="text-warning small">Por hacer</span>
                    </div>
                </div>
                <div class="stats-card stats-progress">
                    <div class="stats-card-main">
                        <div>
                            <div class="stats-card-label">Progreso global</div>
                            <div class="stats-card-value">${totals.pct}%</div>
                        </div>
                        <div class="stats-card-icon">
                            <i class="bi bi-graph-up-arrow"></i>
                        </div>
                    </div>
                    <div class="stats-card-footer flex-column align-items-stretch">
                        <div class="progress-custom w-100 mb-1">
                            <div class="progress-bar-custom bg-info" style="width: ${totals.pct}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            ${this.filterBar()}

            <div class="dashboard-card shadow-sm">
                <div class="dashboard-card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th class="ps-5 col-tarea">Tarea</th>
                                    <th class="d-none d-md-table-cell col-desc">Descripción</th>
                                    <th class="text-center col-acciones">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${tareas.length === 0
                    ? `<tr><td colspan="3" class="text-center text-muted py-5">
                                       <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                                       No hay tareas con el filtro seleccionado.
                                   </td></tr>`
                    : tareas.map((t, i) => `
                                <tr class="${t.completada ? 'tr-completed' : ''}">
                                    <td class="py-3 ps-5">
                                        <div class="d-flex align-items-center gap-3">
                                            ${this.token && String(this.userId) === String(t.user_id)
                            ? `<input class="task-toggle shadow-sm" type="checkbox"
                                                       data-id="${t.id}" data-titulo="${t.titulo}" data-desc="${t.descripcion || ''}"
                                                       ${t.completada ? 'checked' : ''} title="Alternar estado">`
                            : `<div class="task-bullet ${t.completada ? 'completed' : 'pending'}"></div>`
                        }
                                            <span class="fw-semibold task-title-text">${t.titulo}</span>
                                        </div>
                                    </td>
                                    <td class="text-muted small d-none d-md-table-cell py-3 task-desc">${t.descripcion || '—'}</td>
                                    <td class="py-3 text-center">
                                        <div class="d-flex gap-1 justify-content-center">
                                            <a href="#tarea-${t.id}" class="btn-icon" title="Ver detalle">
                                                <i class="bi bi-eye"></i>
                                            </a>
                                            ${(this.token && t.user_id == this.userId) ? `
                                            <button class="btn-icon edit-btn"
                                                data-id="${t.id}"
                                                data-titulo="${t.titulo}"
                                                data-desc="${t.descripcion || ''}"
                                                data-completada="${t.completada}"
                                                title="Editar tarea">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn-icon delete-btn"
                                                data-id="${t.id}" title="Eliminar tarea">
                                                <i class="bi bi-trash"></i>
                                            </button>` : ''}
                                        </div>
                                    </td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${(meta.last_page ?? 1) > 1 ? `<div class="px-4 pb-3">${this.paginationHtml(meta)}</div>` : ''}
                </div>
            </div>
            
            <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar tarea</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="editId">
                            <div class="mb-3">
                                <label class="form-label fw-medium">Título <span class="text-danger">*</span></label>
                                <input type="text" id="editTitulo" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-medium">Descripción</label>
                                <textarea id="editDesc" class="form-control" rows="4"></textarea>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="editCompletada">
                                <label class="form-check-label" for="editCompletada">Marcar como completada</label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="saveEditBtn">
                                <i class="bi bi-save me-1"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

            // Vincular los eventos interactivos de la vista
            this.wireDynamicLinks();
            this.wireFilterBtns((p) => this.renderDashboard(p));

            // Evento para cambiar de página en la paginación del Dashboard
            this.mainContent.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const scrollY = window.scrollY;
                    const currentHeight = this.mainContent.offsetHeight;
                    if (currentHeight > 0) this.mainContent.style.minHeight = currentHeight + 'px';
                    try {
                        await this.renderDashboard(parseInt(btn.dataset.page));
                    } finally {
                        this.mainContent.style.minHeight = '';
                        window.scrollTo(0, scrollY);
                    }
                });
            });

            // Evento checkbox para marcar tarea como completada/pendiente al instante
            this.mainContent.querySelectorAll('.task-toggle').forEach(checkbox => {
                checkbox.addEventListener('change', async (e) => {
                    const el = e.currentTarget;
                    const completada = el.checked;
                    try {
                        await api.request(`/tarea/${el.dataset.id}`, 'PUT', {
                            titulo: el.dataset.titulo,
                            descripcion: el.dataset.desc,
                            completada: completada
                        });
                        const scrollY = window.scrollY;
                        const currentHeight = this.mainContent.offsetHeight;
                        if (currentHeight > 0) this.mainContent.style.minHeight = currentHeight + 'px';
                        await this.renderDashboard(meta.current_page ?? 1);
                        this.mainContent.style.minHeight = '';
                        window.scrollTo(0, scrollY);
                    } catch (err) {
                        el.checked = !completada;
                        this.showToast(err.message, "error");
                    }
                });
            });

            // Evento botón Editar: abre el Modal de edición y precarga campos
            this.mainContent.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('editId').value = btn.dataset.id;
                    document.getElementById('editTitulo').value = btn.dataset.titulo;
                    document.getElementById('editDesc').value = btn.dataset.desc;
                    document.getElementById('editCompletada').checked = btn.dataset.completada === 'true';
                    new bootstrap.Modal(document.getElementById('editModal')).show();
                });
            });

            // Evento Guardar
            const saveEditBtn = document.getElementById('saveEditBtn');
            if (saveEditBtn) {
                saveEditBtn.addEventListener('click', async () => {
                    const id = document.getElementById('editId').value;
                    const data = {
                        titulo: document.getElementById('editTitulo').value.trim(),
                        descripcion: document.getElementById('editDesc').value.trim(),
                        completada: document.getElementById('editCompletada').checked,
                    };
                    if (!data.titulo) return;
                    try {
                        await api.request(`/tarea/${id}`, 'PUT', data);
                        this.showToast('Tarea actualizada correctamente');
                        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                        this.renderDashboard(meta.current_page ?? 1);
                    } catch (err) { this.showToast(err.message, "error"); }
                });
            }

            // Evento Eliminar: abre ventana de confirmación antes de llamar a la API
            this.mainContent.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.confirmAction(
                        'Eliminar tarea',
                        'Esta acción no se puede deshacer. ¿Continuar?',
                        'Eliminar',
                        'btn-danger',
                        async () => {
                            try {
                                await api.deleteTarea(btn.dataset.id);
                                this.showToast('Tarea eliminada correctamente');
                                this.renderDashboard(meta.current_page ?? 1);
                            } catch (err) { this.showToast(err.message, "error"); }
                        }
                    );
                });
            });

        } catch (err) {
            this.mainContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    // VISTA: MIS TAREAS
    async renderTareas(page = null) {
        // Guardar o restaurar la última página de navegación de Mis Tareas
        if (page !== null) {
            this.lastPageTareas = page;
        } else {
            page = this.lastPageTareas;
        }

        this.showLoading();

        try {
            // Obtener listado de tareas del usuario autenticado desde la API
            const res = await api.getMisTareas(page, this.activeFilter);
            const tareas = res.data.data;
            const meta = res.data;

            // Estructura de Mis Tareas, formulario de creación y tabla
            this.mainContent.innerHTML = `
            <div class="page-heading d-flex justify-content-between align-items-center">
                <div>
                    <h1>Mis Tareas</h1>
                    <p>${meta.total} tareas en total</p>
                </div>
                <button class="btn btn-primary" id="btnNueva">
                    <i class="bi bi-plus-lg me-1"></i> Nueva tarea
                </button>
            </div>

            <div class="dashboard-card mb-4 form-nueva" id="formNueva">
                <div class="dashboard-card-header bg-light">
                    <h3 class="dashboard-card-title">
                        <i class="bi bi-plus-circle text-primary me-2"></i>Crear nueva tarea
                    </h3>
                </div>
                <div class="dashboard-card-body">
                    <form id="addForm">
                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label text-muted fw-semibold small mb-1">Título de la tarea <span class="text-danger">*</span></label>
                                <input type="text" id="nuevoTitulo" class="form-control" placeholder="Ej. Actualizar dependencias" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label text-muted fw-semibold small mb-1">Descripción (opcional)</label>
                                <textarea id="nuevaDesc" class="form-control" rows="2" placeholder="Agrega más detalles sobre esta tarea..."></textarea>
                            </div>
                            <div class="col-12 d-flex justify-content-end gap-2 mt-2">
                                <button type="button" class="btn btn-light px-4" id="btnCancelar">Cancelar</button>
                                <button type="submit" class="btn btn-primary px-4">
                                    <i class="bi bi-plus-circle me-1"></i> Crear Tarea
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            ${this.filterBar()}

            <div class="dashboard-card shadow-sm">
                <div class="dashboard-card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th class="ps-5 col-tarea">Tarea</th>
                                    <th class="d-none d-md-table-cell col-desc">Descripción</th>
                                    <th class="text-center col-acciones">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${tareas.length === 0
                    ? `<tr><td colspan="3" class="text-center text-muted py-5">
                                       <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                                       No hay tareas con el filtro seleccionado.
                                   </td></tr>`
                    : tareas.map((t, i) => `
                                <tr class="${t.completada ? 'tr-completed' : ''}">
                                    <td class="py-3 ps-5">
                                        <div class="d-flex align-items-center gap-3">
                                            <input class="task-toggle shadow-sm" type="checkbox"
                                                data-id="${t.id}" data-titulo="${t.titulo}" data-desc="${t.descripcion || ''}"
                                                ${t.completada ? 'checked' : ''} title="Alternar estado">
                                            <span class="fw-semibold task-title-text">
                                                ${t.titulo}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="text-muted small d-none d-md-table-cell task-desc">${t.descripcion || '—'}</td>
                                    <td class="py-3 text-center">
                                        <div class="d-flex gap-1 justify-content-center">
                                            <a href="#tarea-${t.id}" class="btn-icon" title="Ver detalle">
                                                <i class="bi bi-eye"></i>
                                            </a>
                                            <button class="btn-icon edit-btn"
                                                data-id="${t.id}"
                                                data-titulo="${t.titulo}"
                                                data-desc="${t.descripcion || ''}"
                                                data-completada="${t.completada}"
                                                title="Editar tarea">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn-icon delete-btn"
                                                data-id="${t.id}" title="Eliminar tarea">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${(meta.last_page ?? 1) > 1 ? `<div class="px-4 pb-3">${this.paginationHtml(meta)}</div>` : ''}
                </div>
            </div>

            <!-- Modal Bootstrap -->
            <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editModalLabel">Editar tarea</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="editId">
                            <div class="mb-3">
                                <label class="form-label fw-medium">Título <span class="text-danger">*</span></label>
                                <input type="text" id="editTitulo" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-medium">Descripción</label>
                                <textarea id="editDesc" class="form-control" rows="4"></textarea>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="editCompletada">
                                <label class="form-check-label" for="editCompletada">
                                    Marcar como completada
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="saveEditBtn">
                                <i class="bi bi-save me-1"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

            // Vincular los eventos de la vista
            this.wireDynamicLinks();
            this.wireFilterBtns((p) => this.renderTareas(p));

            // Evento para cambiar de página en Mis Tareas
            this.mainContent.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', () => this.renderTareas(parseInt(btn.dataset.page)));
            });

            // Apertura/Cierre del formulario para crear nueva tarea
            document.getElementById('btnNueva').addEventListener('click', () => {
                const f = document.getElementById('formNueva');
                f.classList.add('open');
                document.getElementById('nuevoTitulo').focus();
            });
            document.getElementById('btnCancelar').addEventListener('click', () => {
                document.getElementById('formNueva').classList.remove('open');
            });

            // Gestión del envío del formulario para crear nueva tarea
            document.getElementById('addForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const titulo = document.getElementById('nuevoTitulo').value.trim();
                const desc = document.getElementById('nuevaDesc').value.trim();
                if (!titulo) return;
                try {
                    await api.createTarea(titulo, desc);
                    this.renderTareas(meta.current_page ?? 1);
                } catch (err) { this.showToast(err.message, "error"); }
            });

            // Carga los campos de la tarea en el modal al hacer clic en Editar
            this.mainContent.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('editId').value = btn.dataset.id;
                    document.getElementById('editTitulo').value = btn.dataset.titulo;
                    document.getElementById('editDesc').value = btn.dataset.desc;
                    document.getElementById('editCompletada').checked = btn.dataset.completada === 'true';
                    new bootstrap.Modal(document.getElementById('editModal')).show();
                });
            });

            // Envía la actualización de la tarea al pulsar Guardar en el modal
            document.getElementById('saveEditBtn').addEventListener('click', async () => {
                const id = document.getElementById('editId').value;
                const data = {
                    titulo: document.getElementById('editTitulo').value.trim(),
                    descripcion: document.getElementById('editDesc').value.trim(),
                    completada: document.getElementById('editCompletada').checked,
                };
                if (!data.titulo) return;
                try {
                    await api.request(`/tarea/${id}`, 'PUT', data);
                    this.showToast('Tarea actualizada correctamente');
                    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                    this.renderTareas(meta.current_page ?? 1);
                } catch (err) { this.showToast(err.message, "error"); }
            });

            // Modal de confirmación antes de eliminar una tarea del listado privado
            this.mainContent.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.confirmAction(
                        'Eliminar tarea',
                        'Esta acción no se puede deshacer. ¿Continuar?',
                        'Eliminar',
                        'btn-danger',
                        async () => {
                            try {
                                await api.deleteTarea(btn.dataset.id);
                                this.showToast('Tarea eliminada correctamente');
                                this.renderTareas(meta.current_page ?? 1);
                            } catch (err) { this.showToast(err.message, "error"); }
                        }
                    );
                });
            });

            // Cambia el estado completada/pendiente inmediatamente desde el checkbox
            this.mainContent.querySelectorAll('.task-toggle').forEach(checkbox => {
                checkbox.addEventListener('change', async (e) => {
                    const el = e.currentTarget;
                    const completada = el.checked;
                    try {
                        await api.request(`/tarea/${el.dataset.id}`, 'PUT', {
                            titulo: el.dataset.titulo,
                            descripcion: el.dataset.desc,
                            completada: completada
                        });
                        this.renderTareas(meta.current_page ?? 1);
                    } catch (err) {
                        el.checked = !completada;
                        this.showToast(err.message, "error");
                    }
                });
            });

        } catch (err) {
            this.mainContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    // VISTA: DETALLE DE TAREA
    async renderDetalle(id) {
        this.showLoading();

        try {
            // Obtener la información completa de la tarea seleccionada por ID
            const res = await api.request(`/tarea/${id}`, 'GET');
            const tarea = res.data;

            // Renderizar la vista de detalle con toda su información relacionada
            this.mainContent.innerHTML = `
            <div class="mb-3">
                <button class="btn btn-outline-secondary btn-sm btn-back-custom" id="backBtn">
                    <i class="bi bi-arrow-left me-1"></i> Volver
                </button>
            </div>

            <div class="page-heading">
                <h1>Detalle de tarea</h1>
                <p>Visualiza y administra los detalles específicos de esta tarea</p>
            </div>

            <div class="dashboard-card shadow-sm">
                <div class="dashboard-card-header d-flex align-items-center gap-3 py-3 px-4 border-bottom bg-light bg-opacity-50">
                    <div class="task-bullet ${tarea.completada ? 'completed' : 'pending'}"></div>
                    <h2 class="dashboard-card-title mb-0 fs-5 fw-bold text-dark">${tarea.titulo}</h2>
                </div>
                <div class="dashboard-card-body p-4">
                    <dl class="row mb-0 gy-3">
                        <dt class="col-sm-3 text-muted fw-semibold">Descripción</dt>
                        <dd class="col-sm-9">${tarea.descripcion || '<span class="text-muted fst-italic">Sin descripción</span>'}</dd>
                        <dt class="col-sm-3 text-muted">Creada por</dt>
                        <dd class="col-sm-9 d-flex align-items-center gap-2">
                            <div class="avatar-sm shadow-sm">
                                ${(tarea.user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            ${tarea.user?.name || '—'}
                        </dd>
                        <dt class="col-sm-3 text-muted">Fecha creación</dt>
                        <dd class="col-sm-9">${new Date(tarea.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</dd>
                        <dt class="col-sm-3 text-muted">Última actualización</dt>
                        <dd class="col-sm-9">${new Date(tarea.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</dd>
                    </dl>
                </div>

                ${this.token && String(this.userId) === String(tarea.user_id) ? `
                <div class="dashboard-card-body border-top bg-light bg-opacity-50 d-flex gap-2 px-4 py-3 rounded-bottom">
                    <button class="btn btn-primary btn-edit-detail"
                        data-id="${tarea.id}"
                        data-titulo="${tarea.titulo}"
                        data-desc="${tarea.descripcion || ''}"
                        data-completada="${tarea.completada}">
                        <i class="bi bi-pencil me-1"></i> Editar tarea
                    </button>
                    <button class="btn btn-outline-danger btn-delete-detail" data-id="${tarea.id}">
                        <i class="bi bi-trash me-1"></i> Eliminar
                    </button>
                </div>` : `
                <div class="dashboard-card-body border-top bg-light bg-opacity-50 px-4 py-3 rounded-bottom">
                    <div class="d-flex align-items-center gap-3">
                        <i class="bi bi-info-circle text-muted fs-4"></i>
                        <div>
                            ${this.token
                    ? `<p class="text-muted small mb-0">Esta tarea pertenece a otro miembro del equipo. Solo puedes visualizarla.</p>`
                    : `<p class="text-muted small mb-0">Inicia sesión para poder editar o eliminar esta tarea si te pertenece.</p>`
                }
                        </div>
                    </div>
                </div>`}
            </div>`;

            // Vincular los eventos de volver atrás y de edición/borrado rápido
            document.getElementById('backBtn').addEventListener('click', () => window.history.back());

            if (this.token) {
                // Evento para eliminar la tarea directamente desde la ficha de detalle
                this.mainContent.querySelector('.btn-delete-detail')?.addEventListener('click', () => {
                    this.confirmAction(
                        'Eliminar tarea',
                        '¿Estás seguro de que deseas eliminar esta tarea?',
                        'Eliminar',
                        'btn-danger',
                        async () => {
                            try {
                                await api.deleteTarea(tarea.id);
                                this.showToast('Tarea eliminada correctamente');
                                window.location.hash = '#tareas';
                            } catch (err) { this.showToast(err.message, "error"); }
                        }
                    );
                });

                // Redirige al listado de tareas personales y abre el formulario de edición de forma simulada
                this.mainContent.querySelector('.btn-edit-detail')?.addEventListener('click', (e) => {
                    const btn = e.currentTarget;
                    window.location.hash = '#tareas';
                    setTimeout(() => {
                        this.mainContent.querySelector(`.edit-btn[data-id="${btn.dataset.id}"]`)?.click();
                    }, 500);
                });
            }

        } catch (err) {
            this.mainContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    // VISTA: MI PERFIL
    async renderProfile() {
        this.showLoading();

        try {
            // Obtener la información del perfil del usuario actual desde la API
            const res = await api.getProfile();
            const user = res.data;

            // Renderizar el formulario con la información del usuario
            this.mainContent.innerHTML = `
            <div class="page-heading mb-4">
                <h1>Mi Perfil</h1>
                <p>Configura tu información personal y credenciales</p>
            </div>
            <div class="row justify-content-center">
                <div class="col-12 col-lg-8 col-xl-6">
                    <div class="dashboard-card shadow-sm border-0">
                        <div class="dashboard-card-body p-4">
                            <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                                <div class="nav-avatar fs-3 rounded-circle me-3 profile-avatar-custom">
                                    ${user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 class="mb-1">${user.name}</h4>
                                    <p class="text-muted mb-0 small">${user.email}</p>
                                </div>
                            </div>
                            <form id="profileForm">
                                <div class="mb-4">
                                    <label class="form-label text-muted small fw-semibold">Nombre Completo</label>
                                    <input type="text" id="profileName" class="form-control" value="${user.name}" required>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label text-muted small fw-semibold">Correo Electrónico</label>
                                    <input type="email" id="profileEmail" class="form-control" value="${user.email}" required>
                                </div>
                                <div class="mb-4 pb-2">
                                    <label class="form-label text-muted small fw-semibold">Nueva Contraseña <span class="fw-normal text-secondary ms-1">(dejar en blanco para no cambiar)</span></label>
                                    <input type="password" id="profilePassword" class="form-control" placeholder="******">
                                </div>
                                <div class="d-flex justify-content-end">
                                    <button type="submit" class="btn btn-primary px-4">
                                        <i class="bi bi-save me-2"></i> Guardar cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;

            // Vincular evento submit del formulario de perfil
            document.getElementById('profileForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button');
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

                try {
                    // Petición PUT para actualizar los campos modificados en la API
                    await api.updateProfile({
                        name: document.getElementById('profileName').value,
                        email: document.getElementById('profileEmail').value,
                        password: document.getElementById('profilePassword').value
                    });

                    // Refrescar el nombre en el menú superior del Dashboard y recargar la vista
                    await this.loadUserInfo();
                    this.showToast('Tu perfil ha sido actualizado correctamente.', 'success');
                    this.renderProfile();
                } catch (err) {
                    this.showToast(err.message, "error");
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Guardar cambios';
                }
            });

        } catch (err) {
            this.mainContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }
}

new SPA();
