<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Game;
use App\Models\GameVersion;
use App\Models\Score;
use Illuminate\Support\Str;
use ZipArchive;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $games = Game::with('dev')->whereHas('versions')->get();

        $content = $games->map(function ($game) {
            $latestVersion = $game->versions()->latest('version')->first();

            $thumbnail = null;
            if ($latestVersion) {
                $thumbnailFile = public_path("games/{$game->slug}/{$latestVersion->version}/thumbnail.png");

                if (file_exists($thumbnailFile)) {
                    $thumbnail = "/games/{$game->slug}/{$latestVersion->version}/thumbnail.png";
                }
            }

            return [
                'slug' => $game->slug,
                'title' => $game->title,
                'description' => $game->description,
                'thumbnail' => $thumbnail,
                'uploadTimestamp' => $latestVersion ? $latestVersion->created_at : null,
                'author' => $game->dev ? $game->dev->username : null,
                'scoreCount' => $game->scores()->count(),
            ];
        });

        return response()->json([
            'page' => 0,
            'size' => $content->count(),
            'totalElements' => $content->count(),
            'content' => $content
        ], 200);
    }

    public function createGame(Request $request)
    {
        $request->validate([
            'title' => 'required|min:3|max:60',
            'description' => 'required|max:200'
        ]);

        $slug = Str::slug($request->title);

        if (Game::where('slug', $slug)->exists()) {
            return response()->json([
                "status" => "invalid",
                "slug" => "Game title already exists"
            ], 400);
        }

        $game = Game::create([
            'title' => $request->title,
            'description' => $request->description,
            'slug' => $slug,
            'created_by' => $request->user()->id
        ]);

        return response()->json([
            "status" => "success",
            "slug" => $game->slug
        ], 201);
    }

    public function detailGame(Request $request, $slug)
    {
        $game = Game::with('dev')->where('slug', $slug)->whereHas('versions')->first();

        if (!$game) {
            return response()->json([
                "status" => "not-found",
                "message" => "Not found"
            ], 404);
        }

        $latestVersion = $game->versions()->latest('version')->first();

        $thumbnail = null;
        if ($latestVersion) {
            $thumbnailFile = public_path("games/{$game->slug}/{$latestVersion->version}/thumbnail.png");

            if (file_exists($thumbnailFile)) {
                $thumbnail = "/games/{$game->slug}/{$latestVersion->version}/thumbnail.png";
            }
        }

        return response()->json([
            'slug' => $game->slug,
            'title' => $game->title,
            'description' => $game->description,
            'thumbnail' => $thumbnail,
            'uploadTimestamp' => $latestVersion ? $latestVersion->created_at : null,
            'author' => $game->dev ? $game->dev->username : null,
            'scoreCount' => $game->scores()->count(),
            'gamePath' => $latestVersion ? "/games/{$game->slug}/{$latestVersion->version}/" : null,
        ], 200);
    }

    public function updateGame(Request $request, $slug)
    {
        $request->validate([
            'title' => 'required|min:3|max:60',
            'description' => 'required|max:200'
        ]);

        $game = Game::where('slug', $slug)->first();

        if (!$game) {
            return response()->json([
                "status" => "not-found",
                "message" => "Not found"
            ], 404);
        }

        if ($game->created_by !== $request->user()->id) {
            return response()->json([
                "status" => "forbidden",
                "message" => "You are not the game author"
            ], 403);
        }

        $game->update([
            'title' => $request->title,
            'description' => $request->description
        ]);

        return response()->json([
            "status" => "success",
        ], 200);
    }

    public function deleteGame(Request $request, $slug)
    {
        $game = Game::where('slug', $slug)->first();

        if (!$game) {
            return response()->json([
                "status" => "not-found",
                "message" => "Not found"
            ], 404);
        }

        if ($game->created_by !== $request->user()->id) {
            return response()->json([
                "status" => "forbidden",
                "message" => "You are not the game author"
            ], 403);
        }

        $game->delete();

        return response()->noContent();
    }

    public function scores($slug)
    {
        $game = Game::where('slug', $slug)->first();

        if (!$game) {
            return response()->json([
                "status" => "not-found",
                "message" => "Not found"
            ], 404);
        }

        $scores = Score::whereHas('gameVersion', function ($q) use ($game) {
            $q->where('game_id', $game->id);
        })
            ->with('user')
            ->orderBy('score', 'desc')
            ->get()
            ->groupBy('user_id')
            ->map(function ($items) {
                $top = $items->sortByDesc('score')->first();

                return [
                    'username' => $top->user->username,
                    'score' => $top->score,
                    'timestamp' => $top->created_at
                ];
            })
            ->values();

        return response()->json([
            'scores' => $scores
        ]);
    }

    public function createScores(Request $request, $slug)
    {
        $request->validate([
            'score' => 'required|integer'
        ]);

        $game = Game::where('slug', $slug)->first();

        if (!$game) {
            return response()->json([
                "status" => "not-found",
                "message" => "Not found"
            ], 404);
        }

        $latestVersion = $game->versions()->latest('version')->first();

        if (!$latestVersion) {
            return response()->json([
                "status" => "not-found",
                "message" => "Not found"
            ], 404);
        }

        Score::create([
            'user_id' => $request->user()->id,
            'game_version_id' => $latestVersion->id,
            'score' => $request->score
        ]);

        return response()->json([
            "status" => "success"
        ], 201);
    }

    public function uploadGame(Request $request, $slug)
    {
        $game = Game::where('slug', $slug)->first();

        if (!$game) {
            return response('Game not found', 404);
        }

        $token = $request->input('token');

        if (!$token) {
            return response('Missing token', 401);
        }

        $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;

        if (!$user) {
            return response('Invalid token', 401);
        }

        if ($game->created_by !== $user->id) {
            return response('Forbidden', 403);
        }

        if (!$request->hasFile('zipfile')) {
            return response('No zipfile uploaded', 400);
        }

        $zipFile = $request->file('zipfile');

        if ($zipFile->getClientOriginalExtension() !== 'zip') {
            return response('Must be zip file', 400);
        }

        $version = $game->versions()->max('version') + 1;
        if (!$version) {
            $version = 1;
        }

        $targetDir = public_path("games/{$slug}/{$version}");

        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $zipPath = $targetDir . '/game.zip';
        $zipFile->move($targetDir, 'game.zip');

        $zip = new ZipArchive;
        if ($zip->open($zipPath) === true) {
            $zip->extractTo($targetDir);
            $zip->close();
        } else {
            return response('Failed to extract zip file', 400);
        }

        if ($request->hasFile('thumbnail')) {
            $thumbnailFile = $request->file('thumbnail');
            $thumbnailFile->move($targetDir, 'thumbnail.png');
        }

        GameVersion::create([
            'game_id' => $game->id,
            'version' => $version,
            'storage_path' => "games/{$slug}/{$version}/"
        ]);

        return response('Upload success', 200);
    }
}