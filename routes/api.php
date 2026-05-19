<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TareaController;
use Illuminate\Support\Facades\Route;

// Autenticación
Route::post('register', [AuthController::class, 'register'])->name('api.register');
Route::post('login', [AuthController::class, 'login'])->name('api.login');
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('api.password.email');
Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('api.password.update');

// Tareas Globales
Route::get('tarea', [TareaController::class, 'index'])->name('api.tarea.index');
Route::get('tarea/{tarea}', [TareaController::class, 'show'])->name('api.tarea.show');

// Rutas protegidas por JWT (definidas de forma individual)
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api')->name('api.logout');
Route::get('user', [AuthController::class, 'me'])->middleware('auth:api')->name('api.user.me');
Route::put('user', [AuthController::class, 'updateProfile'])->middleware('auth:api')->name('api.user.update');
Route::get('tarea/mis-tareas/list', [TareaController::class, 'misTareas'])->middleware('auth:api')->name('api.tarea.mis-tareas');
Route::post('tarea', [TareaController::class, 'store'])->middleware('auth:api')->name('api.tarea.store');
Route::put('tarea/{tarea}', [TareaController::class, 'update'])->middleware('auth:api')->name('api.tarea.update');
Route::delete('tarea/{tarea}', [TareaController::class, 'destroy'])->middleware('auth:api')->name('api.tarea.destroy');
