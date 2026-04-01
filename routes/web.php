<?php

use Illuminate\Support\Facades\Route;

Route::get('/login', function () {
        return view('app');
    })->name('login');

//Route::middleware('auth:api')->group(function () {
    Route::get('/', function () {
        return view('app');
    });
    Route::get('/{any}', function () {
        return view('app');
    });
    Route::get('/master/{any}', function () {
        return view('app');
    });
//});