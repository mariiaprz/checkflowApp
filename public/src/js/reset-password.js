const resetForm = document.getElementById('resetPasswordForm');
if (resetForm) {
    // Mostrar / ocultar contraseñas
    document.querySelectorAll('.toggle-pwd').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const isText = input.type === 'text';
            input.type = isText ? 'password' : 'text';
            this.querySelector('i').className = isText ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
    });

    // Envío del formulario de reseteo de contraseña
    resetForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const errorDiv = document.getElementById('auth-error');
        const successDiv = document.getElementById('auth-success');
        const submitBtn = document.getElementById('submitBtn');
        const backToLoginContainer = document.getElementById('backToLoginContainer');

        // Limpiar estados de mensajes anteriores
        errorDiv.classList.add('d-none');
        successDiv.classList.add('d-none');

        const pwd = document.getElementById('password').value;
        const confirmPwd = document.getElementById('password_confirmation').value;

        // Validación
        if (pwd !== confirmPwd) {
            errorDiv.textContent = 'Las contraseñas no coinciden.';
            errorDiv.classList.remove('d-none');
            return;
        }

        // Configurar estado de cargando
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Actualizando...';

        try {
            const apiBase = window.API_BASE || '/api';
            const res = await fetch(`${apiBase}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    token: document.getElementById('token').value,
                    email: document.getElementById('email').value,
                    password: pwd,
                    password_confirmation: confirmPwd
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña');

            // Mostrar mensaje de éxito
            successDiv.textContent = data.message || 'Contraseña restablecida correctamente.';
            successDiv.classList.remove('d-none');

            // Ocultar botón y mostrar enlace
            submitBtn.classList.add('d-none');
            backToLoginContainer.classList.remove('d-none');
        } catch (err) {
            // Mostrar error y reactivar formulario
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('d-none');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i> Restablecer contraseña';
        }
    });
}
