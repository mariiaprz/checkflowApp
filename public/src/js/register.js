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

// Gestión del envío del formulario de registro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const errorDiv = document.getElementById('auth-error');
        const submitBtn = document.getElementById('submitBtn');
        errorDiv.classList.add('d-none');

        const password = document.getElementById('password').value;
        const confirm = document.getElementById('password_confirmation').value;

        // Validación de coincidencia de claves
        if (password !== confirm) {
            errorDiv.textContent = 'Las contraseñas no coinciden.';
            errorDiv.classList.remove('d-none');
            return;
        }

        // Mostrar cargando
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creando cuenta...';

        try {
            const apiBase = window.API_BASE || '/api';
            const res = await fetch(`${apiBase}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: password,
                    password_confirmation: confirm,
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Error al crear la cuenta');

            // Guardar token y redireccionar al panel tras registro exitoso
            localStorage.setItem('jwt_token', data.token);
            window.location.href = window.DASHBOARD_URL || '/';
        } catch (err) {
            // Mostrar error y restablecer el botón
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('d-none');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i> Crear cuenta';
        }
    });
}
