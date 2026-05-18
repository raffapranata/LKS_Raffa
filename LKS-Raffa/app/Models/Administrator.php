<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Administrator extends Model
{
    use HasApiTokens;

    protected $fillable = [
        'username',
        'password',
        'last_login_at'
    ];
}
