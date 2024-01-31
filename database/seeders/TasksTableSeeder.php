<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TasksTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Task::create([
            'title' => 'Tarea 1',
            'description' => 'Descripción de la tarea 1',
            'column' => 'por_hacer',
        ]);

        Task::create([
            'title' => 'Tarea 2',
            'description' => 'Descripción de la tarea 2',
            'column' => 'por_hacer',
        ]);

        Task::create([
            'title' => 'Tarea 3',
            'description' => 'Descripción de la tarea 3',
            'column' => 'por_hacer',
        ]);

        Task::create([
            'title' => 'Tarea 4',
            'description' => 'Descripción de la tarea 4',
            'column' => 'por_hacer',
        ]);

        Task::create([
            'title' => 'Tarea 5',
            'description' => 'Descripción de la tarea 5',
            'column' => 'por_hacer',
        ]);
    }
}
