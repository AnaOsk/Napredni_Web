@extends('layouts.app')

@section('content')
    <h1>Svi projekti</h1>
    <a href="{{ route('projects.create') }}">Novi projekt</a>
    <ul>
        @foreach($projects as $project)
            <li>
                <strong>{{ $project->naziv }}</strong><br>
                {{ $project->opis }}<br>
                Cijena: {{ $project->cijena }}<br>
                Datum početka: {{ $project->datum_pocetka }}<br>
                Datum završetka: {{ $project->datum_zavrsetka }}<br>
                <b>Obavljeni poslovi:</b> {{ $project->obavljeni_poslovi }}<br>
                <b>Voditelj:</b> {{ $project->voditelj->name }}<br>
                <b>Članovi tima:</b>
                @foreach($project->clanovi as $clan)
                    {{ $clan->name }}@if(!$loop->last), @endif
                @endforeach
                <br>
                <a href="{{ route('projects.edit', $project) }}">Uredi</a>
            </li>
        @endforeach
    </ul>
@endsection
