<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\User;

class ProjectController extends Controller
{
    // Prikaz svih projekata
    public function index()
    {
        $projects = Project::with('voditelj')->get();
        return view('projects.index', compact('projects'));
    }

    // Forma za novi projekt
    public function create()
    {
        $users = User::all();
        return view('projects.create', compact('users'));
    }

    // Spremanje novog projekta
    public function store(Request $request)
    {
        $project = Project::create([
            'naziv' => $request->naziv,
            'opis' => $request->opis,
            'cijena' => $request->cijena,
            'obavljeni_poslovi' => $request->obavljeni_poslovi,
            'datum_pocetka' => $request->datum_pocetka,
            'datum_zavrsetka' => $request->datum_zavrsetka,
            'voditelj_id' => auth()->id(),
        ]);
        $project->clanovi()->attach($request->clanovi);
        return redirect()->route('projects.index');
    }

    // Forma za editiranje projekta
    public function edit(Project $project)
    {
        $users = User::all();
        $project->load('clanovi');
        return view('projects.edit', compact('project', 'users'));
    }

    // Spremanje izmjena
    public function update(Request $request, Project $project)
{
    // Provjera je li trenutni korisnik voditelj projekta
    if (auth()->id() === $project->voditelj_id) {
        // Voditelj može mijenjati sve podatke i članove tima
        $project->update($request->only([
            'naziv',
            'opis',
            'cijena',
            'obavljeni_poslovi',
            'datum_pocetka',
            'datum_zavrsetka'
        ]));
        // Ažuriraj članove tima, ako su poslani
        if($request->has('clanovi')) {
            $project->clanovi()->sync($request->clanovi);
        }
    }
    // Ako je trenutni korisnik član tima, smije mijenjati samo "obavljeni_poslovi"
    elseif ($project->clanovi->contains(auth()->user())) {
        $project->update($request->only(['obavljeni_poslovi']));
        // Nema sync članova!
    }
    // Svi ostali ne smiju uređivati ništa
    else {
        abort(403, 'Nedozvoljen pristup');
    }

    return redirect()->route('projects.index');
}

}

