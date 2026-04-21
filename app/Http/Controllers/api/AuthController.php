<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\Administrator;

class AuthController extends Controller
{
    public function signup (Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|unique:users,username|min:4|max:60',
            'password' => 'required|min:5|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'invalid',
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $user = User::create([
                'username' => $request->username,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'token' => $token
            ], 201);
        }

    public function signin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|min:4|max:60',
            'password' => 'required|min:5|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'invalid',
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $admin = Administrator::where('username', $request->username)->first();
        if ($admin && Hash::check($request->password, $admin->password)) {

            $admin->last_login_at = now();
            $admin->save();
            
            $token = $admin->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'token' => $token
            ], 200);
        }

        $user = User::where('username', $request->username)->first();
        if ($user && Hash::check($request->password, $user->password)) {

            $user->last_login_at = now();
            $user->save();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'token' => $token
            ], 200);
        }

            return response()->json([
            'status' => 'invalid',
            'message' => 'Wrong username or password'
            ], 401);
        }

        public function signout (Request $request)
        {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                "status" => "success"
            ], 200);
        }
}
