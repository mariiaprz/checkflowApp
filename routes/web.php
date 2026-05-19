<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Vistas públicas
Route::view('/', 'welcome')->name('dashboard');

// Autenticación
Route::view('login', 'auth.login')->name('login');
Route::view('register', 'auth.register')->name('register');
Route::view('forgot-password', 'auth.forgot-password')->name('password.request');
Route::get('reset-password/{token}', [AuthController::class, 'resetPasswordForm'])->name('password.reset');

