<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'erick@checkflow.test'],   ['name' => 'Erick Cruz', 'password' => Hash::make('password')]);
        User::firstOrCreate(['email' => 'marta@checkflow.test'],  ['name' => 'Marta Gómez', 'password' => Hash::make('password')]);
        User::firstOrCreate(['email' => 'carlos@checkflow.test'], ['name' => 'Carlos Ruiz', 'password' => Hash::make('password')]);
    }
}
