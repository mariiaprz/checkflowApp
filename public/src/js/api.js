// Las variables globales API_URL, LOGIN_URL y REGISTER_URL son inyectadas por layouts/app.blade.php

window.api = {
    // Realiza una petición HTTP fetch genérica configurada para JSON y con el token JWT si existe
    async request(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('jwt_token');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Adjuntar token de autenticación JWT si está en almacenamiento local
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        // Serializar cuerpo si se han proporcionado datos
        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}${endpoint}`, config);
        const result = await response.json();

        // Controlar si la sesión ha expirado en el servidor
        if (response.status === 401) {
            localStorage.removeItem('jwt_token');
            window.location.hash = '#login';
            throw new Error('Sesión expirada');
        }

        // Si la petición no se completó con éxito, lanzar error con el mensaje devuelto
        if (!response.ok) {
            throw new Error(result.message || 'Error en la petición');
        }

        return result;
    },

    // Inicia sesión de usuario para obtener un token JWT
    login(email, password) {
        return this.request('/login', 'POST', { email, password });
    },

    // Registra un nuevo usuario en el sistema
    register(name, email, password, password_confirmation) {
        return this.request('/register', 'POST', { name, email, password, password_confirmation });
    },

    // Cierra la sesión del usuario actual invalidando el token JWT
    logout() {
        return this.request('/logout', 'POST');
    },

    // Obtiene el listado público de tareas
    getTareas(page = 1, filter = '') {
        const params = new URLSearchParams({ page });
        if (filter !== '') params.set('completada', filter);
        return this.request(`/tarea?${params}`, 'GET');
    },

    // Obtiene el listado de tareas creadas por el usuario autenticado
    getMisTareas(page = 1, filter = '') {
        const params = new URLSearchParams({ page });
        if (filter !== '') params.set('completada', filter);
        return this.request(`/tarea/mis-tareas/list?${params}`, 'GET');
    },

    // Obtiene el perfil de usuario actual
    getProfile() {
        return this.request('/user', 'GET');
    },

    // Actualiza el perfil de usuario actual
    updateProfile(data) {
        return this.request('/user', 'PUT', data);
    },

    // Crea una nueva tarea asociada al usuario
    createTarea(titulo, descripcion) {
        return this.request('/tarea', 'POST', { titulo, descripcion });
    },

    // Alterna o modifica el estado/campos de una tarea existente
    updateTarea(id, completada) {
        return this.request(`/tarea/${id}`, 'PUT', { completada });
    },

    // Elimina una tarea de forma permanente
    deleteTarea(id) {
        return this.request(`/tarea/${id}`, 'DELETE');
    }
};
