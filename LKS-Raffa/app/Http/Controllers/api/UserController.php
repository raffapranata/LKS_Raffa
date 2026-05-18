<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Administrator;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function createUser(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                "status" => "forbidden",
                "message" => "You are not the administrator"
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'required|unique:users,username|min:4|max:60',
            'password' => 'required|min:5|max:10',
        ], [
            'username.unique' => 'Username already exists',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "status" => "invalid",
                "message"=> $validator->errors()->first()
            ], 400);
        }

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            "status" => "success",
            "username" => $user->username,
        ], 201);
    }

    public function getUser(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                "status" => "forbidden",
                "message" => "You are not the administrator"
            ], 403);
        }

        $users = User::all();

        return response()->json([
            'totalElements' => $users->count(),
            "content" => $users->map(function ($u) {
            return [
                "id" => $u->id,
                "username" => $u->username,
                "last_login_at" => $u->last_login_at ?? "",
                "created_at" => $u->created_at->format('Y-m-d H:i:s'),
                "updated_at" => $u->updated_at->format('Y-m-d H:i:s'),
            ];
            })
        ], 200);
    }

    public function detailUser($username)
    {
        $user = User::where('username', $username)->first();

        if (!$user) {
            return response()->json([
                "status" => "not-found",
                "message" => "Not found"
        ], 404);
    }

        return response()->json([
            "username" => $user->username,
            "last_login_at" => $user->last_login_at ?? "",
            "created_at" => $user->created_at->format('Y-m-d H:i:s'),
            "updated_at" => $user->updated_at->format('Y-m-d H:i:s'),
        ], 200);
    }

    public function updateUser(Request $request, $id)
    {
        if (!Auth::check()) {
            return response()->json([
                "status" => "forbidden",
                "message" => "You are not the administrator"
            ], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json([
                "status" => "not-found",
                "message" => "User Not found"
            ], 403);    
        } 

        $validator = Validator::make($request->all(), [
            'username' => 'required|min:4|max:60|unique:users,username,' . $id,
            'password' => 'required|min:5|max:10',
        ], [
            'username.unique' => 'Username already exists',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "status" => "invalid",
                "message"=> $validator->errors()->first()
            ], 400);
        }

        $user->update([
            'username' => $request->username,
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            "status" => "success",
            "username" => $user->username,
        ], 201);
    }

    public function deleteUser(Request $request, $id)
    {
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                "status" => "unauthenticated",
                "message" => "Missing token"
            ], 401);
        }

        $isAdmin = \App\Models\Administrator::where('username', $authUser->username)->exists();

        if (!$isAdmin) {
            return response()->json([
                "status" => "forbidden",
                "message" => "You are not the administrator"
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                "status" => "not-found",
                "message" => "User Not found"
            ], 403);
        }

        $user->delete();

        return response()->noContent();
    }
}
