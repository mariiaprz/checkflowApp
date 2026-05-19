@extends('layouts.app')

@section('title', 'CheckFlow - Dashboard')

@push('styles')
    <link rel="stylesheet" href="{{ asset('src/css/charts-layout.css') }}">
@endpush

@section('content')
    <div class="spinner-wrap">
        <div class="spinner-border text-primary spinner-lg" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
    </div>
@endsection

@push('scripts')
    <script src="{{ asset('src/js/api.js') }}"></script>
    <script src="{{ asset('src/js/spa.js') }}"></script>
@endpush
