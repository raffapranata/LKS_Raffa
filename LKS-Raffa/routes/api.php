<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\api\AdministratorController;
use App\Http\Controllers\api\GameController;

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/signin', [AuthController::class, 'signin']);
Route::middleware('auth:sanctum')->post('/signout', [AuthController::class, 'signout']);

Route::middleware('auth:sanctum')->post('/users', [UserController::class, 'createUser']);
Route::middleware('auth:sanctum')->get('/users', [UserController::class, 'getUser']);
Route::get('/users/{username}', [UserController::class, 'detailUser']);
Route::middleware('auth:sanctum')->put('/users/{id}', [UserController::class, 'updateUser']);
Route::middleware('auth:sanctum')->delete('/users/{id}', [UserController::class, 'deleteUser']);

Route::middleware('auth:sanctum')->get('/admins', [AdministratorController::class, 'getAdmin']);

Route::get('/games', [GameController::class, 'index']);
Route::get('/games/{slug}', [GameController::class, 'detailGame']);
Route::get('/games/{slug}/scores', [GameController::class, 'scores']);

Route::middleware('auth:sanctum')->post('/games', [GameController::class, 'createGame']);
Route::middleware('auth:sanctum')->put('/games/{slug}', [GameController::class, 'updateGame']);
Route::middleware('auth:sanctum')->delete('/games/{slug}', [GameController::class, 'deleteGame']);
Route::middleware('auth:sanctum')->post('/games/{slug}/scores', [GameController::class, 'createScores']);

Route::post('/games/{slug}/upload', [GameController::class, 'uploadGame']);