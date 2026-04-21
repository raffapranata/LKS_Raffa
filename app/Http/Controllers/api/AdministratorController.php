<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Administrator;

class AdministratorController extends Controller
{
    public function getAdmin(Request $request)
    {
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                'status' => 'unauthenticated',
                'message' => 'Missing token'
            ], 401);
        }

        $isAdmin = Administrator::where('username', $authUser->username)->exists();

        if (!$isAdmin) {
            return response()->json([
                'status' => 'forbidden',
                'message' => 'You are not the administrator'
            ], 403);
        }

        $admins = Administrator::all();

        return response()->json([
            'totalElements' => $admins->count(),
            'content' => $admins->map(function ($admin) {
                return [
                    'username' => $admin->username,
                    'last_login_at' => $admin->last_login_at ?? "",
                    'created_at' => $admin->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $admin->updated_at->format('Y-m-d H:i:s'),
                ];
            })->values()
        ], 200);
    }
}