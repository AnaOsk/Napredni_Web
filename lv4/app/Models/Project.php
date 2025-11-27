<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
     protected $fillable = [
        'naziv', 'opis', 'cijena', 'obavljeni_poslovi', 'datum_pocetka', 'datum_zavrsetka', 'voditelj_id'
    ];

    public function voditelj() {
        return $this->belongsTo(User::class, 'voditelj_id');
    }

    public function clanovi() {
        return $this->belongsToMany(User::class, 'project_user');
    }
}
