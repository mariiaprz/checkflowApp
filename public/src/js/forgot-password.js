const forgotForm = document.getElementById('forgotPasswordForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const errorDiv = document.getElementById('auth-error');
        const successDiv = document.getElementById('auth-success');
        const submitBtn = document.getElementById('submitBtn');

        // Limpiar estados de mensajes anteriores
        errorDiv.classList.add('d-none');
        successDiv.classList.add('d-none');

        // Deshabilitar botón y mostrar cargando
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Enviando...';

        try {
            const apiBase = window.API_BASE || '/api';
            const res = await fetch(`${apiBase}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Error al enviar el correo de recuperación');

            // Mostrar mensaje de éxito y limpiar campo
            successDiv.textContent = data.message || 'Se ha enviado el enlace de recuperación a tu correo.';
            successDiv.classList.remove('d-none');
            document.getElementById('email').value = '';
        } catch (err) {
            // Mostrar mensaje de error
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('d-none');
        } finally {
            // Restablecer estado original del botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-send me-2"></i> Enviar enlace de recuperación';
        }
    });
}
