<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Tarea extends Model
{
    use HasFactory;

    protected $table = 'tarea';

    protected $fillable = [
        'user_id',
        'titulo',
        'descripcion',
        'completada',
    ];

    protected $casts = [
        'completada' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
