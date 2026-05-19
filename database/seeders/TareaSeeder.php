<?php

namespace Database\Seeders;

use App\Models\Tarea;
use App\Models\User;
use Illuminate\Database\Seeder;

class TareaSeeder extends Seeder
{
    public function run(): void
    {
        $erick   = User::where('email', 'erick@checkflow.test')->first();
        $marta  = User::where('email', 'marta@checkflow.test')->first();
        $carlos = User::where('email', 'carlos@checkflow.test')->first();

        if ($erick && $marta && $carlos) {
            // Vaciar para no duplicar
            Tarea::whereIn('user_id', [$erick->id, $marta->id, $carlos->id])->delete();

            $tareas = [
                // Erick Cruz (Backend)
                ['user_id' => $erick->id, 'titulo' => 'Diseñar esquema de base de datos relacional', 'descripcion' => 'Crear diagramas ER y migraciones iniciales para el módulo de usuarios.', 'completada' => true],
                ['user_id' => $erick->id, 'titulo' => 'Configurar pipeline CI/CD en GitHub Actions', 'descripcion' => 'Añadir tests automáticos y despliegue a entorno de staging.', 'completada' => true],
                ['user_id' => $erick->id, 'titulo' => 'Integrar pasarela de pago Stripe', 'descripcion' => 'Implementar webhooks para controlar las suscripciones mensuales.', 'completada' => false],
                ['user_id' => $erick->id, 'titulo' => 'Optimizar consultas a la API (N+1)', 'descripcion' => 'Revisar logs de base de datos para arreglar cargas perezosas en el feed.', 'completada' => false],
                ['user_id' => $erick->id, 'titulo' => 'Redactar documentación técnica', 'descripcion' => 'Subir al wiki del proyecto los diagramas de la arquitectura.', 'completada' => false],
                
                // Marta Gómez (Frontend)
                ['user_id' => $marta->id, 'titulo' => 'Diseño de la vista del Dashboard', 'descripcion' => 'Crear los mockups en Figma basándose en la nueva paleta de colores.', 'completada' => true],
                ['user_id' => $marta->id, 'titulo' => 'Crear sistema de diseño en React', 'descripcion' => 'Pasar los tokens de diseño de Figma a variables CSS.', 'completada' => true],
                ['user_id' => $marta->id, 'titulo' => 'Arreglar bug de renderizado en Safari', 'descripcion' => 'El navbar no colapsa correctamente en dispositivos iOS.', 'completada' => false],
                ['user_id' => $marta->id, 'titulo' => 'Implementar modo oscuro', 'descripcion' => 'Asegurar que todas las cards respetan la variable de tema dark.', 'completada' => false],
                ['user_id' => $marta->id, 'titulo' => 'Pruebas de accesibilidad (A11y)', 'descripcion' => 'Revisar contrastes y soporte para lectores de pantalla en formularios.', 'completada' => false],

                // Carlos Ruiz (Marketing)
                ['user_id' => $carlos->id, 'titulo' => 'Definir estrategia SEO Q3', 'descripcion' => 'Keyword research para las landings principales del proyecto.', 'completada' => true],
                ['user_id' => $carlos->id, 'titulo' => 'Escribir post sobre lanzamiento', 'descripcion' => 'Redactar el primer artículo para el blog contando cómo creamos la herramienta.', 'completada' => false],
                ['user_id' => $carlos->id, 'titulo' => 'Ejecutar plan de QA en staging', 'descripcion' => 'Probar los flujos críticos (registro, login, pagos) antes del pase a pro.', 'completada' => false],
                ['user_id' => $carlos->id, 'titulo' => 'Configurar Google Analytics 4', 'descripcion' => 'Medir eventos de registro y conversión en el embudo de ventas.', 'completada' => false],
                ['user_id' => $carlos->id, 'titulo' => 'Reunión de Sprint Planning', 'descripcion' => 'Preparar backlog y estimaciones para el equipo de desarrollo.', 'completada' => false],
            ];

            foreach ($tareas as $tarea) {
                Tarea::create($tarea);
            }

            $this->command->info('Creadas ' . count($tareas) . ' tareas.');
        } else {
            $this->command->error('Faltan usuarios. Ejecuta UserSeeder primero.');
        }
    }
}
