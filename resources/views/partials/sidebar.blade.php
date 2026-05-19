<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="sidebar-brand">
            <a href="#dashboard" data-spa-link class="text-decoration-none text-white">
                <h5>
                    <i class="bi bi-check2-square icon-brand"></i>
                    CheckFlow
                </h5>
            </a>
            <button class="sidebar-close" id="sidebarClose">
                <i class="bi bi-x"></i>
            </button>
        </div>
    </div>

    <nav class="sidebar-nav">
        <div class="menu-section">
            <div class="menu-section-title">Explorar</div>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="#dashboard" data-spa-link>
                        <i class="bi bi-grid-1x2"></i>
                        <span>Tareas públicas</span>
                    </a>
                </li>
            </ul>
        </div>

        <!-- Solo si autenticado -->
        <div class="menu-section d-auth-hidden" id="sidebar-auth">
            <div class="menu-section-title">Mi cuenta</div>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="#tareas" data-spa-link>
                        <i class="bi bi-check2-all"></i>
                        <span>Mis Tareas</span>
                    </a>
                </li>
            </ul>
        </div>
    </nav>
</aside>

<div class="sidebar-overlay" id="sidebarOverlay"></div>
