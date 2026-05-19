// Si ya hay un token guardado localmente, redirigir directamente al panel
if (localStorage.getItem('jwt_token')) {
    window.location.href = window.DASHBOARD_URL || '/';
}

// Control del interruptor para visualizar / ocultar el texto de la contraseña
const togglePwdBtn = document.getElementById('togglePwd');
if (togglePwdBtn) {
    togglePwdBtn.addEventListener('click', function () {
        const pwd = document.getElementById('password');
        const isText = pwd.type === 'text';
        pwd.type = isText ? 'password' : 'text';
        this.querySelector('i').className = isText ? 'bi bi-eye' : 'bi bi-eye-slash';
    });
}

// Gestión del envío del formulario de login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const errorDiv = document.getElementById('auth-error');
        const submitBtn = document.getElementById('submitBtn');

        // Limpiar errores previos y mostrar cargando
        errorDiv.classList.add('d-none');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Iniciando sesión...';

        try {
            const apiBase = window.API_BASE || '/api';
            const res = await fetch(`${apiBase}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas');

            // Guardar token JWT y redireccionar al panel principal
            localStorage.setItem('jwt_token', data.token);
            window.location.href = window.DASHBOARD_URL || '/';
        } catch (err) {
            // Mostrar error y restablecer el botón
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('d-none');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i> Iniciar sesión';
        }
    });
}
