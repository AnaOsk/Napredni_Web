const express = require('express');
const router = express.Router();
const Project = require('../models/project');

let projects = [];
let idCounter = 1;

// LISTA PROJEKATA (READ)
router.get('/', (req, res) => {
    res.render('projects/index', { projects });
});

// FORMA ZA NOVI PROJEKT
router.get('/new', (req, res) => {
    res.render('projects/new');
});

// DODAVANJE PROJEKTA (CREATE)
router.post('/', (req, res) => {
    const { naziv, opis, cijena, obavljeniPoslovi, datumPocetka, datumZavrsetka } = req.body;

    const project = new Project(
        idCounter++,
        naziv,
        opis,
        cijena,
        obavljeniPoslovi,
        datumPocetka,
        datumZavrsetka
    );

    projects.push(project);
    res.redirect('/projects');
});

// DETALJI PROJEKTA (READ ONE)
router.get('/:id', (req, res) => {
    const project = projects.find(p => p.id == req.params.id);
    res.render('projects/show', { project });
});

// FORMA ZA UREĐIVANJE
router.get('/:id/edit', (req, res) => {
    const project = projects.find(p => p.id == req.params.id);
    res.render('projects/edit', { project });
});

// AŽURIRANJE PROJEKTA (UPDATE)
router.post('/:id', (req, res) => {
    const project = projects.find(p => p.id == req.params.id);

    const { naziv, opis, cijena, obavljeniPoslovi, datumPocetka, datumZavrsetka } = req.body;

    project.naziv = naziv;
    project.opis = opis;
    project.cijena = cijena;
    project.obavljeniPoslovi = obavljeniPoslovi;
    project.datumPocetka = datumPocetka;
    project.datumZavrsetka = datumZavrsetka;

    res.redirect('/projects');
});

// BRISANJE PROJEKTA (DELETE)
router.post('/:id/delete', (req, res) => {
    projects = projects.filter(p => p.id != req.params.id);
    res.redirect('/projects');
});

// ➤ DODAVANJE ČLANA TIMA PROJEKTU
router.post('/:id/team', (req, res) => {
    const project = projects.find(p => p.id == req.params.id);

    if (!project) return res.status(404).send("Projekt ne postoji");

    const { ime, rola } = req.body;

    project.teamMembers.push({ ime, rola });

    res.redirect(`/projects/${project.id}`);
});


module.exports = router;
