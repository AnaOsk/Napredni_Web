<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('naziv');
        $table->text('opis');
        $table->decimal('cijena', 10, 2)->nullable();
        $table->text('obavljeni_poslovi')->nullable();
        $table->date('datum_pocetka');
        $table->date('datum_zavrsetka');
        $table->foreignId('voditelj_id')->constrained('users');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
