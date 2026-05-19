<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    // REGISTER
    // Registra un nuevo usuario y devuelve su token JWT
    public function register(Request $request): JsonResponse
    {
        // Validamos los datos de entrada
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        // Creamos la instancia del usuario con los campos correspondientes
        $user   = new User($request->only('name', 'email'));
        $result = false;

        try {
            // Encriptamos la contraseña y guardamos el usuario en BD
            $user->password = Hash::make($request->password);
            $result         = $user->save();
            $txtmessage     = 'Usuario registrado correctamente.';
        } catch (QueryException $e) {
            $txtmessage = 'Error en base de datos al registrar el usuario.';
        } catch (\Exception $e) {
            $txtmessage = 'Error inesperado al registrar el usuario.';
        }

        // Si se guardó con éxito, iniciamos sesión y devolvemos el token JWT generado
        if ($result) {
            $token = Auth::guard('api')->login($user);
            return response()->json([
                'success' => true,
                'message' => $txtmessage,
                'user'    => $user,
                'token'   => $token,
            ], 201);
        }

        return response()->json(['success' => false, 'message' => $txtmessage], 500);
    }

    // LOGIN
    // Autentica al usuario y devuelve el token JWT
    public function login(Request $request): JsonResponse
    {
        // Validamos el email y contraseña de la petición
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        // Intentamos autenticar y si falla devolvemos error 401
        $token = Auth::guard('api')->attempt($credentials);

        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Credenciales inválidas'], 401);
        }

        // Si es exitoso, devolvemos el token junto al perfil de usuario
        return response()->json([
            'success' => true,
            'message' => 'Login exitoso',
            'user'    => Auth::guard('api')->user(),
            'token'   => $token,
        ]);
    }

    // LOGOUT
    // Invalida el token JWT del usuario autenticado
    public function logout(): JsonResponse
    {
        // Invalidamos la sesión JWT actual en el servidor
        Auth::guard('api')->logout();

        return response()->json(['success' => true, 'message' => 'Sesión cerrada correctamente.']);
    }

    // ME
    // Devuelve los datos del usuario autenticado
    public function me(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Auth::guard('api')->user()]);
    }

    // UPDATE PROFILE
    // Actualiza los datos del perfil del usuario autenticado
    public function updateProfile(Request $request): JsonResponse
    {
        // Recuperamos el usuario autenticado actualmente
        $user = Auth::guard('api')->user();

        // Validamos los datos
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
        ]);

        $result = false;

        try {
            $user->name  = $request->name;
            $user->email = $request->email;

            // Solo actualizamos la contraseña si se ha proporcionado una nueva
            if (!empty($request->password)) {
                $user->password = Hash::make($request->password);
            }

            $result     = $user->save();
            $txtmessage = 'Perfil actualizado correctamente.';
        } catch (QueryException $e) {
            $txtmessage = 'Error en base de datos al actualizar el perfil.';
        } catch (\Exception $e) {
            $txtmessage = 'Error inesperado al actualizar el perfil.';
        }

        if ($result) {
            return response()->json(['success' => true, 'message' => $txtmessage]);
        }

        return response()->json(['success' => false, 'message' => $txtmessage], 500);
    }

    // FORGOT PASSWORD
    // Envía un enlace de restablecimiento de contraseña al correo electrónico del usuario
    public function forgotPassword(Request $request): JsonResponse
    {
        // Validamos la dirección de correo
        $request->validate(['email' => 'required|email']);

        // Enviamos el token de recuperación mediante el broker de contraseñas de Laravel
        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['success' => true, 'message' => 'Se ha enviado el enlace de recuperación a tu correo.'])
            : response()->json(['success' => false, 'message' => 'No se pudo enviar el correo de recuperación. Verifica la dirección.'], 400);
    }

    // RESET PASSWORD
    // Restablece la contraseña del usuario utilizando el token enviado al correo electrónico
    public function resetPassword(Request $request): JsonResponse
    {
        // Validamos los campos obligatorios y confirmación de contraseña
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        // Restablecemos la contraseña si el token coincide con el correo
        $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function ($user, $password) {
            $user->password = Hash::make($password);
            $user->save();
            event(new PasswordReset($user));
        });

        return $status === Password::PASSWORD_RESET
            ? response()->json(['success' => true, 'message' => 'Contraseña restablecida correctamente.'])
            : response()->json(['success' => false, 'message' => 'El token es inválido o ha expirado.'], 400);
    }

    // RESET PASSWORD FORM
    // Muestra el formulario para restablecer la contraseña
    public function resetPasswordForm($token) : View
    {
        return view('auth.reset-password', ['token' => $token]);
    }
}
