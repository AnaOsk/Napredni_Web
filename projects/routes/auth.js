var express = require('express');
var router = express.Router();
var User = require('../model/user');

// GET /auth/register - Prikaz forme za registraciju
router.get('/register', function(req, res) {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('register', { title: 'Registracija', error: null });
});

// POST /auth/register - Registracija korisnika
router.post('/register', async function(req, res) {
    try {
        var { username, email, password, confirmPassword } = req.body;

        // Provjera da li su sva polja popunjena
        if (!username || !email || !password || !confirmPassword) {
            return res.render('register', {
                title: 'Registracija',
                error: 'Sva polja su obavezna'
            });
        }

        // Provjera da li se lozinke podudaraju
        if (password !== confirmPassword) {
            return res.render('register', {
                title: 'Registracija',
                error: 'Lozinke se ne podudaraju'
            });
        }

        // Provjera da li korisnik već postoji
        var existingUser = await User.findOne({
            $or: [{ email: email }, { username: username }]
        });

        if (existingUser) {
            return res.render('register', {
                title: 'Registracija',
                error: 'Korisnik s tim emailom ili korisničkim imenom već postoji'
            });
        }

        // Kreiranje novog korisnika
        var user = new User({ username, email, password });
        await user.save();

        // Automatska prijava nakon registracije
        req.session.userId = user._id;
        req.session.username = user.username;

        res.redirect('/');
    } catch (err) {
        console.error('Registration error:', err);
        res.render('register', {
            title: 'Registracija',
            error: 'Greška prilikom registracije: ' + err.message
        });
    }
});

// GET /auth/login - Prikaz forme za prijavu
router.get('/login', function(req, res) {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Prijava', error: null });
});

// POST /auth/login - Prijava korisnika
router.post('/login', async function(req, res) {
    try {
        var { email, password } = req.body;

        // Provjera da li su sva polja popunjena
        if (!email || !password) {
            return res.render('login', {
                title: 'Prijava',
                error: 'Email i lozinka su obavezni'
            });
        }

        // Pronalazak korisnika
        var user = await User.findOne({ email: email });

        if (!user) {
            return res.render('login', {
                title: 'Prijava',
                error: 'Pogrešan email ili lozinka'
            });
        }

        // Provjera lozinke
        var isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.render('login', {
                title: 'Prijava',
                error: 'Pogrešan email ili lozinka'
            });
        }

        // Spremanje korisnika u sesiju
        req.session.userId = user._id;
        req.session.username = user.username;

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('login', {
            title: 'Prijava',
            error: 'Greška prilikom prijave'
        });
    }
});

// GET /auth/logout - Odjava korisnika
router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
