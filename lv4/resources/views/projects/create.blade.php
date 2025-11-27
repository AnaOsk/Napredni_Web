@extends('layouts.app')

@section('content')
    <h1>Novi projekt</h1>
    <form method="POST" action="{{ route('projects.store') }}">
        @csrf
        <div>
            <label>Naziv projekta</label>
            <input type="text" name="naziv" required>
        </div>
        <div>
            <label>Opis</label>
            <textarea name="opis" required></textarea>
        </div>
        <div>
            <label>Cijena</label>
            <input type="number" name="cijena" step="0.01">
        </div>
        <div>
            <label>Obavljeni poslovi</label>
            <textarea name="obavljeni_poslovi"></textarea>
        </div>
        <div>
            <label>Datum početka</label>
            <input type="date" name="datum_pocetka" required>
        </div>
        <div>
            <label>Datum završetka</label>
            <input type="date" name="datum_zavrsetka" required>
        </div>
        <div>
            <label>Članovi tima</label>
            @foreach($users as $user)
                <input type="checkbox" name="clanovi[]" value="{{ $user->id }}"> {{ $user->name }}
            @endforeach
        </div>
        <button type="submit">Spremi projekt</button>
    </form>
@endsection
