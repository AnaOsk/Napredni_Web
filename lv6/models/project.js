class Project {
    constructor(id, naziv, opis, cijena, obavljeniPoslovi, datumPocetka, datumZavrsetka) {
        this.id = id;
        this.naziv = naziv;
        this.opis = opis;
        this.cijena = cijena;
        this.obavljeniPoslovi = obavljeniPoslovi;
        this.datumPocetka = datumPocetka;
        this.datumZavrsetka = datumZavrsetka;
        this.teamMembers = []; // ⬅ novo
    }
}

module.exports = Project;
