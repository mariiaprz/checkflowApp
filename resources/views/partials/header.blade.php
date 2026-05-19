<nav class="navbar top-navbar">
    <div class="container-fluid d-flex align-items-center h-100">

        <button class="sidebar-toggle d-lg-none me-2" id="sidebarToggle">
            <i class="bi bi-list fs-5"></i>
        </button>

        <nav aria-label="breadcrumb" class="d-none d-lg-block ms-2">
            <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Inicio</a></li>
                <li class="breadcrumb-item active" id="breadcrumb-current">Panel</li>
            </ol>
        </nav>

        <div class="navbar-brand d-lg-none fw-bold ms-2">
            <i class="bi bi-check2-square me-1 icon-brand"></i>CheckFlow
        </div>

        <div class="flex-grow-1 d-none d-lg-block"></div>

        <div class="d-flex align-items-center gap-2">

            <div class="d-flex gap-2 d-none" id="nav-guest">
                <a href="{{ route('login') }}" class="btn btn-light btn-sm">
                    <i class="bi bi-box-arrow-in-right me-1"></i><span class="d-none d-sm-inline">Iniciar sesión</span>
                </a>
                <a href="{{ route('register') }}" class="btn btn-primary btn-sm">
                    <i class="bi bi-person-plus me-1"></i><span class="d-none d-sm-inline">Registrarse</span>
                </a>
            </div>

            <div class="d-flex align-items-center gap-3 d-none" id="nav-auth">

                <div class="dropdown">
                    <button class="nav-user-btn" data-bs-toggle="dropdown">
                        <div id="nav-avatar-initial" class="nav-avatar">
                            U
                        </div>
                        <span class="d-none d-md-inline fw-medium" id="nav-username">Usuario</span>
                        <i class="bi bi-chevron-down text-muted nav-chevron"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">

                        <li>
                            <a class="dropdown-item py-2" href="#perfil" data-spa-link>
                                <i class="bi bi-person me-2 text-muted"></i>Mi Perfil
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <button class="dropdown-item text-danger py-2" id="headerLogoutBtn">
                                <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    </div>
</nav>
