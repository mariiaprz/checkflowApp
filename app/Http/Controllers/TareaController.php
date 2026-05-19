<?php

namespace App\Http\Controllers;

use App\Models\Tarea;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TareaController extends Controller
{
    // INDEX
    // Devuelve el listado público paginado de tareas + totales globales del proyecto
    public function index(Request $request): JsonResponse
    {
        // Totales globales del proyecto para estadísticas
        $totalAll         = Tarea::count();
        $totalCompletadas = Tarea::where('completada', true)->count();
        $totalPendientes  = Tarea::where('completada', false)->count();

        // Iniciamos la consulta cargando el creador de cada tarea
        $query = Tarea::with('user:id,name');

        // Filtro opcional por estado
        if ($request->has('completada') && $request->completada !== '') {
            $query->where('completada', filter_var($request->completada, FILTER_VALIDATE_BOOLEAN));
        }

        // Paginamos los resultados a 8 por página
        $tareas = $query->paginate(8);

        return response()->json([
            'success' => true,
            'data'    => $tareas,
            'totals'  => [
                'total'       => $totalAll,
                'completadas' => $totalCompletadas,
                'pendientes'  => $totalPendientes,
                'pct'         => $totalAll ? round(($totalCompletadas / $totalAll) * 100) : 0,
            ],
        ]);
    }

    // MIS TAREAS
    // Devuelve las tareas del usuario autenticado
    public function misTareas(Request $request): JsonResponse
    {
        // Filtramos las tareas para que solo devuelva las que pertenecen al usuario autenticado
        $query = Tarea::where('user_id', Auth::id());

        // Filtro opcional por estado
        if ($request->has('completada') && $request->completada !== '') {
            $query->where('completada', filter_var($request->completada, FILTER_VALIDATE_BOOLEAN));
        }

        // Paginamos las tareas privadas
        $tareas = $query->paginate(8);

        return response()->json(['success' => true, 'data' => $tareas]);
    }

    // SHOW
    // Devuelve el detalle de una tarea por ID
    public function show($id): JsonResponse
    {
        // Cargamos la tarea con su creador, si no existe devolvemos error 404
        $tarea = Tarea::with('user:id,name')->find($id);

        if (!$tarea) {
            return response()->json(['success' => false, 'message' => 'Tarea no encontrada'], 404);
        }

        return response()->json(['success' => true, 'data' => $tarea]);
    }

    // STORE
    // Crea una nueva tarea y la asocia al usuario autenticado
    public function store(Request $request): JsonResponse
    {
        // Validamos datos de entrada
        $request->validate([
            'titulo'      => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'completada'  => 'nullable|boolean',
        ]);

        // Creamos la instancia asociándola al ID del usuario de la API
        $tarea = new Tarea($request->only('titulo', 'descripcion', 'completada'));
        $tarea->user_id = Auth::guard('api')->id();
        $result = false;

        try {
            // Intentamos guardar el registro en la base de datos
            $result      = $tarea->save();
            $txtmessage  = 'Tarea creada correctamente.';
        } catch (QueryException $e) {
            $txtmessage = 'Error en base de datos al crear la tarea.';
        } catch (\Exception $e) {
            $txtmessage = 'Error inesperado al crear la tarea.';
        }

        if ($result) {
            return response()->json(['success' => true, 'message' => $txtmessage, 'data' => $tarea], 201);
        }

        return response()->json(['success' => false, 'message' => $txtmessage], 500);
    }

    // UPDATE
    // Actualiza una tarea si pertenece al usuario autenticado
    public function update(Request $request, $id): JsonResponse
    {
        // Buscamos la tarea por ID
        $tarea = Tarea::find($id);

        // Si no existe, lanzamos error 404
        if (!$tarea) {
            return response()->json(['success' => false, 'message' => 'Tarea no encontrada'], 404);
        }

        // Comprobamos que el usuario autenticado sea el dueño de la tarea
        if ($tarea->user_id !== Auth::guard('api')->id()) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para editar esta tarea'], 403);
        }

        // Validamos los parámetros recibidos
        $request->validate([
            'titulo'      => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'completada'  => 'sometimes|required|boolean',
        ]);

        $result = false;

        try {
            // Rellenamos y guardamos la tarea con los nuevos valores
            $tarea->fill($request->only('titulo', 'descripcion', 'completada'));
            $result     = $tarea->save();
            $txtmessage = 'Tarea actualizada correctamente.';
        } catch (QueryException $e) {
            $txtmessage = 'Error en base de datos al actualizar la tarea.';
        } catch (\Exception $e) {
            $txtmessage = 'Error inesperado al actualizar la tarea.';
        }

        if ($result) {
            return response()->json(['success' => true, 'message' => $txtmessage, 'data' => $tarea]);
        }

        return response()->json(['success' => false, 'message' => $txtmessage], 500);
    }

    // DESTROY
    // Elimina una tarea si pertenece al usuario autenticado
    public function destroy($id): JsonResponse
    {
        // Buscamos la tarea por ID
        $tarea = Tarea::find($id);

        // Si no se encuentra, devolvemos error 404
        if (!$tarea) {
            return response()->json(['success' => false, 'message' => 'Tarea no encontrada'], 404);
        }

        // Comprobamos que el usuario autenticado sea el dueño
        if ($tarea->user_id !== Auth::guard('api')->id()) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para eliminar esta tarea'], 403);
        }

        $result = false;

        try {
            // Intentamos eliminar el registro físicamente
            $result     = $tarea->delete();
            $txtmessage = 'Tarea registrada eliminada.';
        } catch (\Exception $e) {
            $txtmessage = 'No se ha podido eliminar la tarea.';
        }

        if ($result) {
            return response()->json(['success' => true, 'message' => $txtmessage]);
        }

        return response()->json(['success' => false, 'message' => $txtmessage], 500);
    }
}
