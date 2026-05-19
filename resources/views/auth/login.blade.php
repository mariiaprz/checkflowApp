@extends('layouts.auth')

@section('title', 'Iniciar Sesión - CheckFlow')

@section('back-link')
    <a href="{{ route('dashboard') }}" class="back-to-public">
        <i class="bi bi-arrow-left"></i> Volver al listado público
    </a>
@endsection

@section('content')
    <div class="auth-header">
        <div class="brand-logo"><i class="bi bi-check2-square"></i></div>
        <h1 class="h3 mb-2 fw-bold">¡Bienvenido de nuevo!</h1>
        <p class="text-muted">Inicia sesión en tu cuenta</p>
    </div>

    <div id="auth-error" class="alert alert-danger d-none"></div>

    <form id="loginForm" novalidate>
        <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" id="email" class="form-control" placeholder="tucorreo@ejemplo.com" required>
            </div>
        </div>
        <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label mb-0">Contraseña</label>
                <a href="{{ route('password.request') }}" class="text-decoration-none small fw-semibold" style="color: var(--indigo);">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input type="password" id="password" class="form-control" placeholder="••••••••" required>
                <button class="btn btn-outline-secondary" type="button" id="togglePwd" tabindex="-1">
                    <i class="bi bi-eye"></i>
                </button>
            </div>
        </div>
        <div class="d-grid mb-3">
            <button class="btn btn-primary btn-lg" type="submit" id="submitBtn">
                <i class="bi bi-box-arrow-in-right me-2"></i> Iniciar sesión
            </button>
        </div>
        <p class="text-center text-muted small">
            ¿No tienes cuenta?
            <a href="{{ route('register') }}" class="fw-semibold text-decoration-none" style="color: var(--indigo);">Regístrate</a>
        </p>
    </form>
@endsection

@push('scripts')
    <script src="{{ asset('src/js/login.js') }}"></script>
@endpush
