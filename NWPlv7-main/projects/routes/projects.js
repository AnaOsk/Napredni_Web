var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var User = require('../model/user');
var { ULOGE } = require('../model/project');

// Middleware za provjeru autentikacije
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ msg: 'Niste prijavljeni' });
}

// Primijeni middleware na sve rute
router.use(isAuthenticated);

// GET - dohvati sve projekte (JSON)
router.get('/projectlist', async function(req, res) {
    try {
        var projects = await Project.find({})
            .populate('voditelj', 'username email')
            .populate('clanoviTima.korisnik', 'username email');
        res.json(projects);
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// GET - stranica: projekti gdje sam voditelj
router.get('/moji-projekti', async function(req, res) {
    res.render('moji-projekti', { title: 'Moji projekti' });
});

// GET - JSON: projekti gdje sam voditelj
router.get('/moji-projekti-list', async function(req, res) {
    try {
        var projects = await Project.find({ voditelj: req.session.userId })
            .populate('voditelj', 'username email')
            .populate('clanoviTima.korisnik', 'username email');
        res.json(projects);
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// GET - stranica: projekti gdje sam član
router.get('/projekti-clan', async function(req, res) {
    res.render('projekti-clan', { title: 'Projekti - Član tima' });
});

// GET - JSON: projekti gdje sam član (ali ne voditelj)
router.get('/projekti-clan-list', async function(req, res) {
    try {
        var projects = await Project.find({
            'clanoviTima.korisnik': req.session.userId,
            voditelj: { $ne: req.session.userId }
        })
            .populate('voditelj', 'username email')
            .populate('clanoviTima.korisnik', 'username email');
        res.json(projects);
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// GET - stranica: arhiva projekata
router.get('/arhiva', async function(req, res) {
    res.render('arhiva', { title: 'Arhiva projekata' });
});

// GET - JSON: arhivirani projekti gdje sam voditelj ili član
router.get('/arhiva-list', async function(req, res) {
    try {
        var projects = await Project.find({
            arhiviran: true,
            $or: [
                { voditelj: req.session.userId },
                { 'clanoviTima.korisnik': req.session.userId }
            ]
        })
            .populate('voditelj', 'username email')
            .populate('clanoviTima.korisnik', 'username email');
        res.json(projects);
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// PUT - ažuriraj samo obavljene poslove (za članove)
router.put('/updateobavljeniposlovi/:id', async function(req, res) {
    try {
        var project = await Project.findById(req.params.id);

        // Provjeri da je korisnik član tima
        var jeClan = project.clanoviTima.some(function(clan) {
            return clan.korisnik && clan.korisnik.toString() === req.session.userId;
        });

        if (!jeClan) {
            return res.status(403).json({ msg: 'Nemate pristup ovom projektu' });
        }

        await Project.findByIdAndUpdate(req.params.id, {
            obavljeniPoslovi: req.body.obavljeniPoslovi
        });
        res.json({ msg: '' });
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// GET - dohvati sve korisnike za dodavanje u tim
router.get('/users', async function(req, res) {
    try {
        var users = await User.find({}, 'username email');
        res.json(users);
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// GET - dohvati dostupne uloge
router.get('/uloge', function(req, res) {
    res.json(ULOGE);
});

// GET - dohvati pojedinačni projekt
router.get('/project/:id', async function(req, res) {
    try {
        var project = await Project.findById(req.params.id);
        res.json(project);
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// POST - dodaj novi projekt
router.post('/addproject', async function(req, res) {
    try {
        await Project.create({
            naziv: req.body.naziv,
            opis: req.body.opis,
            cijena: req.body.cijena,
            obavljeniPoslovi: req.body.obavljeniPoslovi,
            datumPocetka: req.body.datumPocetka,
            datumZavrsetka: req.body.datumZavrsetka,
            voditelj: req.session.userId,
            clanoviTima: [{
                korisnik: req.session.userId,
                uloga: 'Voditelj'
            }],
            arhiviran: req.body.arhiviran === 'true' || req.body.arhiviran === true
        });
        res.json({ msg: '' });
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// PUT - ažuriraj projekt
router.put('/updateproject/:id', async function(req, res) {
    try {
        await Project.findByIdAndUpdate(req.params.id, {
            naziv: req.body.naziv,
            opis: req.body.opis,
            cijena: req.body.cijena,
            obavljeniPoslovi: req.body.obavljeniPoslovi,
            datumPocetka: req.body.datumPocetka,
            datumZavrsetka: req.body.datumZavrsetka,
            arhiviran: req.body.arhiviran === 'true' || req.body.arhiviran === true
        });
        res.json({ msg: '' });
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// DELETE - obriši projekt
router.delete('/deleteproject/:id', async function(req, res) {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ msg: '' });
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// POST - dodaj člana tima na projekt
router.post('/addmember/:id', async function(req, res) {
    try {
        var project = await Project.findById(req.params.id);

        // Provjeri da korisnik već nije član tima
        var vecPostoji = project.clanoviTima.some(function(clan) {
            return clan.korisnik && clan.korisnik.toString() === req.body.odabraniKorisnik;
        });

        if (vecPostoji) {
            return res.json({ msg: 'Korisnik je već član tima' });
        }

        project.clanoviTima.push({
            korisnik: req.body.odabraniKorisnik,
            uloga: req.body.uloga
        });
        await project.save();
        res.json({ msg: '' });
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

// DELETE - obriši člana tima s projekta
router.delete('/deletemember/:projectId/:memberIndex', async function(req, res) {
    try {
        var project = await Project.findById(req.params.projectId);
        project.clanoviTima.splice(req.params.memberIndex, 1);
        await project.save();
        res.json({ msg: '' });
    } catch (err) {
        res.json({ msg: 'Error: ' + err });
    }
});

module.exports = router;
