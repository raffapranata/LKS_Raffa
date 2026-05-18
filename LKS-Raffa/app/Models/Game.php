<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'created_by'
    ];
    

    public function dev()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function versions()
    {
        return $this->hasMany(GameVersion::class, 'game_id');
    }

    public function scores()
    {
        return $this->hasManyThrough(Score::class, GameVersion::class, 'game_id', 'game_version_id', 'id', 'id');
    }
}
