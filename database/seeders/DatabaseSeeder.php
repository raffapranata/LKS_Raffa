<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Administrator;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
    Administrator::create([
        'username' => 'admin1',
        'password' => Hash::make('hello1!')
    ]);

    Administrator::create([
        'username' => 'admin2',
        'password' => Hash::make('hello2!')
    ]);
    }
}
