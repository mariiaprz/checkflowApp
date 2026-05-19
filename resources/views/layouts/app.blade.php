<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'CheckFlow')</title>
    
    <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
    
    <!-- CSS Dependencies -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <!-- App Styles -->
    <link rel="stylesheet" href="{{ asset('src/css/app.css') }}">
    @stack('styles')
</head>
<body>

    @include('partials.sidebar')

    <div class="main-wrapper" id="mainWrapper">
        @include('partials.header')

        <!-- Content -->
        <main class="dashboard-content" id="main-content">
            @yield('content')
        </main>

        @include('partials.footer')
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const API_URL = '{{ url('/api') }}';
        const LOGIN_URL = '{{ route('login') }}';
        const REGISTER_URL = '{{ route('register') }}';
    </script>
    @stack('scripts')
</body>
</html>
