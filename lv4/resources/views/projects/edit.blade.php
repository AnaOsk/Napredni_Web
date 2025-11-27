@extends('layouts.app')

@section('content')
    <h1>Uredi projekt</h1>

    @if(auth()->id() === $project->voditelj_id)
        <!-- Voditelj projekta: uređuje sve -->
        <form method="POST" action="{{ route('projects.update', $project) }}">
            @csrf
            @method('PUT')

            <div>
                <label>Naziv projekta</label>
                <input type="text" name="naziv" value="{{ $project->naziv }}" required>
            </div>
            <div>
                <label>Opis</label>
                <textarea name="opis" required>{{ $project->opis }}</textarea>
            </div>
            <div>
                <label>Cijena</label>
                <input type="number" name="cijena" step="0.01" value="{{ $project->cijena }}">
            </div>
            <div>
                <label>Obavljeni poslovi</label>
                <textarea name="obavljeni_poslovi">{{ $project->obavljeni_poslovi }}</textarea>
            </div>
            <div>
                <label>Datum početka</label>
                <input type="date" name="datum_pocetka" value="{{ $project->datum_pocetka }}" required>
            </div>
            <div>
                <label>Datum završetka</label>
                <input type="date" name="datum_zavrsetka" value="{{ $project->datum_zavrsetka }}" required>
            </div>
            <div>
                <label>Članovi tima</label>
                @foreach($users as $user)
                    <input 
                        type="checkbox" name="clanovi[]" value="{{ $user->id }}"
                        @if($project->clanovi->contains($user->id)) checked @endif
                    > {{ $user->name }}
                @endforeach
            </div>
            <button type="submit">Spremi izmjene</button>
        </form>

    @elseif($project->clanovi->contains(auth()->user()))
        <!-- Član projekta: samo "obavljeni poslovi" -->
        <form method="POST" action="{{ route('projects.update', $project) }}">
            @csrf
            @method('PUT')
            <div>
                <label>Obavljeni poslovi</label>
                <textarea name="obavljeni_poslovi">{{ $project->obavljeni_poslovi }}</textarea>
            </div>
            <button type="submit">Spremi izmjene</button>
        </form>
    @else
        <!-- Nije član projekta ni voditelj -->
        <p>Nemaš pravo uređivati ovaj projekt.</p>
    @endif
@endsection
