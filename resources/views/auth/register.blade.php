@extends('layouts.auth')

@section('title', 'Crear Cuenta - CheckFlow')

@section('back-link')
    <a href="{{ route('dashboard') }}" class="back-to-public">
        <i class="bi bi-arrow-left"></i> Volver al listado público
    </a>
@endsection

@section('content')
    <div class="auth-header">
        <div class="brand-logo"><i class="bi bi-check2-square"></i></div>
        <h1 class="h3 mb-2 fw-bold">Crear cuenta</h1>
        <p class="text-muted">Únete a la comunidad CheckFlow hoy</p>
    </div>

    <div id="auth-error" class="alert alert-danger d-none"></div>

    <form id="registerForm" novalidate>
        <div class="mb-3">
            <label class="form-label">Nombre completo</label>
            <input type="text" id="name" class="form-control" placeholder="Juan García" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" id="email" class="form-control" placeholder="tucorreo@ejemplo.com" required>
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input type="password" id="password" class="form-control" placeholder="Mínimo 8 caracteres" required minlength="8">
                <button class="btn btn-outline-secondary" type="button" id="togglePwd">
                    <i class="bi bi-eye"></i>
                </button>
            </div>
        </div>
        <div class="mb-4">
            <label class="form-label">Confirmar contraseña</label>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                <input type="password" id="password_confirmation" class="form-control" placeholder="Repite la contraseña" required>
            </div>
        </div>
        <div class="d-grid">
            <button class="btn btn-primary btn-lg" type="submit" id="submitBtn">
                <i class="bi bi-person-plus me-2"></i> Crear cuenta
            </button>
        </div>
        <p class="text-center text-muted small mt-4 mb-0">
            ¿Ya tienes cuenta?
            <a href="{{ route('login') }}" class="fw-semibold text-decoration-none" style="color: var(--indigo);">Inicia sesión</a>
        </p>
    </form>
@endsection

@push('scripts')
    <script src="{{ asset('src/js/register.js') }}"></script>
@endpush
