<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Mengano',
            'email' => 'mengano@mail.com',
            'password' => '123456',
        ]);
        User::create([
            'name' => 'Sultano',
            'email' => 'sultano@mail.com',
            'password' => '123456',
        ]);
        User::create([
            'name' => 'Fulano',
            'email' => 'fulano@mail.com',
            'password' => '123456',
        ]);
    }
}
