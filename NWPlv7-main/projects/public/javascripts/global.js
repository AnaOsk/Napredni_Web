// Lista projekata za prikaz detalja
var projectListData = [];
// Lista korisnika za dodavanje u tim
var userListData = [];
// Lista uloga
var ulogeListData = [];

// DOM Ready
$(document).ready(function() {
    // Ucitaj projekte samo ako je korisnik prijavljen i postoji tablica
    var isAuthenticated = $('body').data('authenticated') === true || $('body').data('authenticated') === 'true';
    if (isAuthenticated && $('#projectList').length > 0) {
        populateTable();
        loadUsers();
        loadUloge();
    }

    // Klik na naziv projekta - prikazi detalje
    $('#projectList table tbody').on('click', 'td a.linkshowproject', showProjectInfo);

    // Klik na gumb za dodavanje projekta
    $('#btnAddProject').on('click', addProject);

    // Klik na link za brisanje projekta
    $('#projectList table tbody').on('click', 'td a.linkdeleteproject', deleteProject);

    // Klik na link za uredivanje projekta
    $('#projectList table tbody').on('click', 'td a.linkeditproject', showEditForm);

    // Klik na gumb za spremanje promjena
    $('#btnUpdateProject').on('click', updateProject);

    // Klik na gumb za odustajanje od uredivanja
    $('#btnCancelEdit').on('click', hideEditForm);

    // Klik na gumb za dodavanje clana tima
    $('#btnAddMember').on('click', addMember);

    // Klik na link za brisanje clana tima
    $('#teamList tbody').on('click', 'a.linkdeletemember', deleteMember);
});

// Funkcija za popunjavanje tablice
function populateTable() {
    var tableContent = '';
    var endpoint = window.projectListEndpoint || '/projects/projectlist';

    $.getJSON(endpoint, function(data) {
        projectListData = data;

        $.each(data, function() {
            var datumPocetka = this.datumPocetka ? new Date(this.datumPocetka).toLocaleDateString('hr-HR') : '-';
            var datumZavrsetka = this.datumZavrsetka ? new Date(this.datumZavrsetka).toLocaleDateString('hr-HR') : '-';

            tableContent += '<tr class="hover:bg-gray-50">';
            tableContent += '<td class="px-4 py-3"><a href="#" class="linkshowproject text-blue-600 hover:text-blue-800 font-medium" rel="' + this._id + '">' + this.naziv + '</a></td>';
            tableContent += '<td class="px-4 py-3 text-gray-600">' + (this.cijena || 0) + ' EUR</td>';
            tableContent += '<td class="px-4 py-3 text-gray-600">' + datumPocetka + '</td>';
            tableContent += '<td class="px-4 py-3 text-gray-600">' + datumZavrsetka + '</td>';
            tableContent += '<td class="px-4 py-3"><a href="#" class="linkeditproject text-green-600 hover:text-green-800 mr-3" rel="' + this._id + '">uredi</a>';
            tableContent += '<a href="#" class="linkdeleteproject text-red-600 hover:text-red-800" rel="' + this._id + '">obrisi</a></td>';
            tableContent += '</tr>';
        });

        if (data.length === 0) {
            tableContent = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Nema projekata. Dodajte prvi projekt!</td></tr>';
        }

        $('#projectList table tbody').html(tableContent);
    });
}

// Ucitaj korisnike za dropdown
function loadUsers() {
    $.getJSON('/projects/users', function(data) {
        userListData = data;
        var options = '<option value="">-- Odaberi korisnika --</option>';
        $.each(data, function() {
            options += '<option value="' + this._id + '">' + this.username + ' (' + this.email + ')</option>';
        });
        $('#memberKorisnik').html(options);
    });
}

// Ucitaj uloge za dropdown
function loadUloge() {
    $.getJSON('/projects/uloge', function(data) {
        ulogeListData = data;
        var options = '<option value="">-- Odaberi ulogu --</option>';
        $.each(data, function(index, uloga) {
            options += '<option value="' + uloga + '">' + uloga + '</option>';
        });
        $('#memberUloga').html(options);
    });
}

// Prikazi detalje projekta
function showProjectInfo(event) {
    event.preventDefault();

    var thisProjectId = $(this).attr('rel');

    var arrayPosition = projectListData.map(function(item) {
        return item._id;
    }).indexOf(thisProjectId);

    var thisProject = projectListData[arrayPosition];

    var datumPocetka = thisProject.datumPocetka ? new Date(thisProject.datumPocetka).toLocaleDateString('hr-HR') : '-';
    var datumZavrsetka = thisProject.datumZavrsetka ? new Date(thisProject.datumZavrsetka).toLocaleDateString('hr-HR') : '-';

    $('#projectInfoNaziv').text(thisProject.naziv || '-');
    $('#projectInfoOpis').text(thisProject.opis || '-');
    $('#projectInfoCijena').text(thisProject.cijena || '0');
    $('#projectInfoPoslovi').text(thisProject.obavljeniPoslovi || '-');
    $('#projectInfoPocetak').text(datumPocetka);
    $('#projectInfoZavrsetak').text(datumZavrsetka);
    $('#projectInfoArhiviran').text(thisProject.arhiviran ? 'Da' : 'Ne');

    // Spremi trenutni projekt ID i prikazi sekciju za clanove tima
    $('#currentProjectId').val(thisProjectId);
    $('#teamSection').show();

    // Prikazi clanove tima
    populateTeamTable(thisProject.clanoviTima || []);
}

// Popuni tablicu clanova tima
function populateTeamTable(members) {
    var tableContent = '';

    $.each(members, function(index, member) {
        var username = member.korisnik ? member.korisnik.username : '-';
        var email = member.korisnik ? member.korisnik.email : '-';
        tableContent += '<tr class="hover:bg-gray-50">';
        tableContent += '<td class="px-4 py-2 text-gray-800">' + username + '</td>';
        tableContent += '<td class="px-4 py-2 text-gray-600">' + (member.uloga || '-') + '</td>';
        tableContent += '<td class="px-4 py-2 text-gray-600">' + email + '</td>';
        tableContent += '<td class="px-4 py-2"><a href="#" class="linkdeletemember text-red-600 hover:text-red-800" rel="' + index + '">obrisi</a></td>';
        tableContent += '</tr>';
    });

    if (members.length === 0) {
        tableContent = '<tr><td colspan="4" class="px-4 py-4 text-center text-gray-500">Nema clanova tima</td></tr>';
    }

    $('#teamList tbody').html(tableContent);
}

// Dodaj clana tima
function addMember(event) {
    event.preventDefault();

    var projectId = $('#currentProjectId').val();
    var odabraniKorisnik = $('#memberKorisnik').val();
    var uloga = $('#memberUloga').val();

    if (odabraniKorisnik === '') {
        alert('Molimo odaberite korisnika!');
        return false;
    }

    if (uloga === '') {
        alert('Molimo odaberite ulogu!');
        return false;
    }

    var newMember = {
        'odabraniKorisnik': odabraniKorisnik,
        'uloga': uloga
    };

    $.ajax({
        type: 'POST',
        data: newMember,
        url: '/projects/addmember/' + projectId,
        dataType: 'JSON'
    }).done(function(response) {
        if (response.msg === '') {
            // Ocisti formu
            $('#memberKorisnik').val('');
            $('#memberUloga').val('');

            // Osvjezi podatke i tablicu
            refreshProjectData(projectId);
        } else {
            alert('Greska: ' + response.msg);
        }
    });
}

// Obrisi clana tima
function deleteMember(event) {
    event.preventDefault();

    var memberIndex = $(this).attr('rel');
    var projectId = $('#currentProjectId').val();

    var confirmation = confirm('Jeste li sigurni da zelite obrisati ovog clana tima?');

    if (confirmation === true) {
        $.ajax({
            type: 'DELETE',
            url: '/projects/deletemember/' + projectId + '/' + memberIndex
        }).done(function(response) {
            if (response.msg === '') {
                refreshProjectData(projectId);
            } else {
                alert('Greska: ' + response.msg);
            }
        });
    }
}

// Osvjezi podatke projekta nakon izmjene clanova tima
function refreshProjectData(projectId, callback) {
    var endpoint = window.projectListEndpoint || '/projects/projectlist';
    $.getJSON(endpoint, function(data) {
        projectListData = data;

        var arrayPosition = projectListData.map(function(item) {
            return item._id;
        }).indexOf(projectId);

        var thisProject = projectListData[arrayPosition];
        populateTeamTable(thisProject.clanoviTima || []);

        // Pozovi callback ako postoji
        if (callback && typeof callback === 'function') {
            callback(thisProject);
        }
    });
}

// Dodaj novi projekt
function addProject(event) {
    event.preventDefault();

    var errorCount = 0;

    // Provjeri samo naziv (obavezan)
    if ($('#inputNaziv').val() === '') {
        errorCount++;
    }

    if (errorCount === 0) {
        var newProject = {
            'naziv': $('#inputNaziv').val(),
            'opis': $('#inputOpis').val(),
            'cijena': $('#inputCijena').val(),
            'obavljeniPoslovi': $('#inputPoslovi').val(),
            'datumPocetka': $('#inputDatumPocetka').val(),
            'datumZavrsetka': $('#inputDatumZavrsetka').val(),
            'arhiviran': $('#inputArhiviran').is(':checked')
        };

        $.ajax({
            type: 'POST',
            data: newProject,
            url: '/projects/addproject',
            dataType: 'JSON'
        }).done(function(response) {
            if (response.msg === '') {
                // Ocisti formu
                $('#inputNaziv').val('');
                $('#inputOpis').val('');
                $('#inputCijena').val('');
                $('#inputPoslovi').val('');
                $('#inputDatumPocetka').val('');
                $('#inputDatumZavrsetka').val('');
                $('#inputArhiviran').prop('checked', false);

                // Osvjezi tablicu
                populateTable();
            } else {
                alert('Greska: ' + response.msg);
            }
        });
    } else {
        alert('Molimo unesite naziv projekta!');
        return false;
    }
}

// Obrisi projekt
function deleteProject(event) {
    event.preventDefault();

    var deletedProjectId = $(this).attr('rel');
    var currentProjectId = $('#currentProjectId').val();
    var confirmation = confirm('Jeste li sigurni da zelite obrisati ovaj projekt?');

    if (confirmation === true) {
        $.ajax({
            type: 'DELETE',
            url: '/projects/deleteproject/' + deletedProjectId
        }).done(function(response) {
            if (response.msg === '') {
                populateTable();

                // Ako je obrisan trenutno odabrani projekt, resetiraj detalje
                if (deletedProjectId === currentProjectId) {
                    $('#projectInfoNaziv').text('-');
                    $('#projectInfoOpis').text('-');
                    $('#projectInfoCijena').text('-');
                    $('#projectInfoPoslovi').text('-');
                    $('#projectInfoPocetak').text('-');
                    $('#projectInfoZavrsetak').text('-');
                    $('#currentProjectId').val('');
                    $('#teamSection').hide();
                }
            } else {
                alert('Greska: ' + response.msg);
            }
        });
    } else {
        return false;
    }
}

// Prikazi formu za uredivanje
function showEditForm(event) {
    event.preventDefault();

    var thisProjectId = $(this).attr('rel');

    var arrayPosition = projectListData.map(function(item) {
        return item._id;
    }).indexOf(thisProjectId);

    var thisProject = projectListData[arrayPosition];

    // Formatiraj datume za input polja
    var datumPocetka = thisProject.datumPocetka ? thisProject.datumPocetka.substring(0, 10) : '';
    var datumZavrsetka = thisProject.datumZavrsetka ? thisProject.datumZavrsetka.substring(0, 10) : '';

    // Popuni formu za uredivanje
    $('#editProjectId').val(thisProject._id);
    $('#editNaziv').val(thisProject.naziv);
    $('#editOpis').val(thisProject.opis);
    $('#editCijena').val(thisProject.cijena);
    $('#editPoslovi').val(thisProject.obavljeniPoslovi);
    $('#editDatumPocetka').val(datumPocetka);
    $('#editDatumZavrsetka').val(datumZavrsetka);
    $('#editArhiviran').prop('checked', thisProject.arhiviran);

    // Prikazi formu za uredivanje
    $('#editProject').show();
    $('#addProject').hide();
}

// Sakrij formu za uredivanje
function hideEditForm() {
    $('#editProject').hide();
    $('#addProject').show();
}

// Azuriraj projekt
function updateProject(event) {
    event.preventDefault();

    var projectId = $('#editProjectId').val();

    var updatedProject = {
        'naziv': $('#editNaziv').val(),
        'opis': $('#editOpis').val(),
        'cijena': $('#editCijena').val(),
        'obavljeniPoslovi': $('#editPoslovi').val(),
        'datumPocetka': $('#editDatumPocetka').val(),
        'datumZavrsetka': $('#editDatumZavrsetka').val(),
        'arhiviran': $('#editArhiviran').is(':checked')
    };

    $.ajax({
        type: 'PUT',
        data: updatedProject,
        url: '/projects/updateproject/' + projectId,
        dataType: 'JSON'
    }).done(function(response) {
        if (response.msg === '') {
            hideEditForm();
            populateTable();

            // Osvjezi detalje projekta
            refreshProjectData(projectId, function(project) {
                var datumPocetka = project.datumPocetka ? new Date(project.datumPocetka).toLocaleDateString('hr-HR') : '-';
                var datumZavrsetka = project.datumZavrsetka ? new Date(project.datumZavrsetka).toLocaleDateString('hr-HR') : '-';

                $('#projectInfoNaziv').text(project.naziv || '-');
                $('#projectInfoOpis').text(project.opis || '-');
                $('#projectInfoCijena').text(project.cijena || '0');
                $('#projectInfoPoslovi').text(project.obavljeniPoslovi || '-');
                $('#projectInfoPocetak').text(datumPocetka);
                $('#projectInfoZavrsetak').text(datumZavrsetka);
                $('#projectInfoArhiviran').text(project.arhiviran ? 'Da' : 'Ne');
            });
        } else {
            alert('Greska: ' + response.msg);
        }
    });
}
