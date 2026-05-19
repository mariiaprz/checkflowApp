@extends('layouts.auth')

@section('title', 'Recuperar Contraseña - CheckFlow')

@section('back-link')
    <a href="{{ route('login') }}" class="back-to-public">
        <i class="bi bi-arrow-left"></i> Volver al inicio de sesión
    </a>
@endsection

@section('content')
    <div class="auth-header">
        <div class="brand-logo"><i class="bi bi-shield-lock"></i></div>
        <h1 class="h3 mb-2 fw-bold">¿Olvidaste tu contraseña?</h1>
        <p class="text-muted">Introduce tu correo y te enviaremos un enlace de recuperación</p>
    </div>

    <div id="auth-error" class="alert alert-danger d-none"></div>
    <div id="auth-success" class="alert alert-success d-none"></div>

    <form id="forgotPasswordForm" novalidate>
        <div class="mb-4">
            <label class="form-label">Correo electrónico</label>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" id="email" class="form-control" placeholder="tucorreo@ejemplo.com" required>
            </div>
        </div>
        <div class="d-grid">
            <button class="btn btn-primary btn-lg" type="submit" id="submitBtn">
                <i class="bi bi-send me-2"></i> Enviar enlace de recuperación
            </button>
        </div>
    </form>
@endsection

@push('scripts')
    <script src="{{ asset('src/js/forgot-password.js') }}"></script>
@endpush
