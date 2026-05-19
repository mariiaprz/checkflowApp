@extends('layouts.auth')

@section('title', 'Restablecer Contraseña - CheckFlow')

@section('content')
    <div class="auth-header">
        <div class="brand-logo"><i class="bi bi-key"></i></div>
        <h1 class="h3 mb-2 fw-bold">Nueva contraseña</h1>
        <p class="text-muted">Elige una nueva contraseña para tu cuenta</p>
    </div>

    <div id="auth-error" class="alert alert-danger d-none"></div>
    <div id="auth-success" class="alert alert-success d-none"></div>

    <form id="resetPasswordForm" novalidate>
        <input type="hidden" id="token" value="{{ $token }}">
        <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" id="email" class="form-control" value="{{ request()->get('email') }}" required readonly>
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label">Nueva contraseña</label>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input type="password" id="password" class="form-control" placeholder="Nueva contraseña" required>
                <button class="btn btn-outline-secondary toggle-pwd" type="button" tabindex="-1">
                    <i class="bi bi-eye"></i>
                </button>
            </div>
        </div>
        <div class="mb-4">
            <label class="form-label">Confirmar contraseña</label>
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                <input type="password" id="password_confirmation" class="form-control" placeholder="Confirma la contraseña" required>
                <button class="btn btn-outline-secondary toggle-pwd" type="button" tabindex="-1">
                    <i class="bi bi-eye"></i>
                </button>
            </div>
        </div>
        <div class="d-grid">
            <button class="btn btn-primary btn-lg" type="submit" id="submitBtn">
                <i class="bi bi-check2-circle me-2"></i> Restablecer contraseña
            </button>
        </div>

        <div id="backToLoginContainer" class="text-center mt-4 d-none">
            <a href="{{ route('login') }}" class="btn btn-outline-primary w-100">
                Ir al inicio de sesión
            </a>
        </div>
    </form>
@endsection

@push('scripts')
    <script src="{{ asset('src/js/reset-password.js') }}"></script>
@endpush
