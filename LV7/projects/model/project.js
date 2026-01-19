var mongoose = require('mongoose');

// Definirane uloge za članove tima
var ULOGE = ['Voditelj', 'Dizajner', 'Developer', 'Tester', 'Analyst', 'DevOps'];

var projectSchema = new mongoose.Schema({
    naziv: String,
    opis: String,
    cijena: Number,
    obavljeniPoslovi: String,
    datumPocetka: { type: Date, default: Date.now },
    datumZavrsetka: Date,
    voditelj: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clanoviTima: [{
        korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uloga: { type: String, enum: ULOGE }
    }],
    arhiviran: { type: Boolean, default: false }
});

// Exportaj uloge za korištenje u drugim dijelovima aplikacije
module.exports.ULOGE = ULOGE;

mongoose.model('Project', projectSchema);
