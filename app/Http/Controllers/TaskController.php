<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with('user')->orderBy('column', 'asc')->get();

        return response()->json(['tasks' => $tasks], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'column' => 'required|in:por_hacer,en_progreso,hecho',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $task = Task::create($request->all());

        return response()->json(['task' => $task], 201);
    }

    public function update(Request $request, Task $task)
    {
        $request->validate([
            'column' => 'required|in:por_hacer,en_progreso,hecho',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $task->update($request->only('column', 'user_id'));

        return response()->json(['task' => $task], 200);
    }
}
