// Gestion des Grades
let grades = JSON.parse(localStorage.getItem('grades')) || [
    { id: 1, name: 'Stratege en test', rank: 1, permissions: ['read', 'write_report'] },
    { id: 2, name: 'Stratege', rank: 1, permissions: ['read', 'write_report'] },
    { id: 3, name: 'Stratege confirmé', rank: 1, permissions: ['read', 'write_report'] },
    { id: 4, name: 'Stratege en chef', rank: 2, permissions: ['read', 'write_report', 'moderate'] },
    { id: 6, name: 'Co-gerant', rank: 3, permissions: ['read', 'write_report', 'moderate', 'manage_users'] },
    { id: 7, name: 'Gerant', rank: 4, permissions: ['read', 'write_report', 'moderate', 'manage_users'] },
    { id: 8, name: 'Dirigeant', rank: 4, permissions: ['read', 'write_report', 'moderate', 'manage_users', 'admin'] },
    // Administrateur: accès complet et toutes les permissions
    { id: 5, name: 'Administrateur', rank: 5, permissions: ['read', 'write_report', 'moderate', 'manage_users', 'admin'] }
];

function saveGrades() {
    localStorage.setItem('grades', JSON.stringify(grades));
}

function addGrade(name, rank, permissions) {
    const id = Math.max(...grades.map(g => g.id), 0) + 1;
    const newGrade = { id, name, rank, permissions };
    grades.push(newGrade);
    saveGrades();
    return newGrade;
}

function updateGrade(id, name, rank, permissions) {
    const grade = grades.find(g => g.id === id);
    if (grade) {
        grade.name = name;
        grade.rank = rank;
        grade.permissions = permissions;
        saveGrades();
        return grade;
    }
    return null;
}

function deleteGrade(id) {
    const index = grades.findIndex(g => g.id === id);
    if (index !== -1) {
        grades.splice(index, 1);
        saveGrades();
        return true;
    }
    return false;
}

function getGrade(id) {
    return grades.find(g => g.id === id);
}

function getGradeByName(name) {
    return grades.find(g => g.name === name);
}

function getAllGrades() {
    return grades.sort((a, b) => a.rank - b.rank);
}

function assignGradeToUser(userId, gradeId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    if (user) {
        user.gradeId = gradeId;
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }
    return null;
}

function getUserGrade(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    if (user && user.gradeId) {
        return getGrade(user.gradeId);
    }
    return null;
}

function hasPermission(userId, permission) {
    const grade = getUserGrade(userId);
    return grade && grade.permissions.includes(permission);
}

function renderGradesList() {
    const container = document.getElementById('grades-list');
    if (!container) return;

    const allGrades = getAllGrades();
    container.innerHTML = '';

    if (allGrades.length === 0) {
        container.innerHTML = '<p class="no-data">Aucun grade disponible</p>';
        return;
    }

    allGrades.forEach(grade => {
        const gradeCard = document.createElement('div');
        gradeCard.className = 'grade-card';
        gradeCard.innerHTML = `
            <div class="grade-header">
                <h3>${grade.name}</h3>
                <span class="grade-rank">Rang: ${grade.rank}</span>
            </div>
            <div class="grade-permissions">
                <strong>Permissions:</strong>
                <ul>
                    ${grade.permissions.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
            <div class="grade-actions">
                <button onclick="editGradeModal(${grade.id})" class="btn-secondary">Modifier</button>
                <button onclick="deleteGradeConfirm(${grade.id})" class="btn-danger">Supprimer</button>
            </div>
        `;
        container.appendChild(gradeCard);
    });
}

function editGradeModal(gradeId) {
    const grade = getGrade(gradeId);
    if (!grade) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'edit-grade-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('edit-grade-modal')">&times;</span>
            <h2>Modifier le Grade</h2>
            <form onsubmit="saveGradeEdit(event, ${gradeId})">
                <input type="text" id="edit-grade-name" value="${grade.name}" placeholder="Nom du grade" required />
                <input type="number" id="edit-grade-rank" value="${grade.rank}" min="1" placeholder="Rang" required />
                
                <div class="permissions-list">
                    <label><input type="checkbox" value="read" ${grade.permissions.includes('read') ? 'checked' : ''} /> Lecture</label>
                    <label><input type="checkbox" value="write_report" ${grade.permissions.includes('write_report') ? 'checked' : ''} /> Écrire rapports</label>
                    <label><input type="checkbox" value="moderate" ${grade.permissions.includes('moderate') ? 'checked' : ''} /> Modération</label>
                    <label><input type="checkbox" value="manage_users" ${grade.permissions.includes('manage_users') ? 'checked' : ''} /> Gérer utilisateurs</label>
                    <label><input type="checkbox" value="admin" ${grade.permissions.includes('admin') ? 'checked' : ''} /> Admin</label>
                </div>
                
                <button type="submit" class="btn-primary">Sauvegarder</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function saveGradeEdit(event, gradeId) {
    event.preventDefault();
    
    const name = document.getElementById('edit-grade-name').value;
    const rank = parseInt(document.getElementById('edit-grade-rank').value);
    const checkboxes = document.querySelectorAll('#edit-grade-modal .permissions-list input[type="checkbox"]:checked');
    const permissions = Array.from(checkboxes).map(cb => cb.value);
    
    updateGrade(gradeId, name, rank, permissions);
    closeModal('edit-grade-modal');
    renderGradesList();
}

function deleteGradeConfirm(gradeId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce grade?')) {
        deleteGrade(gradeId);
        renderGradesList();
    }
}

function showAddGradeForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'add-grade-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('add-grade-modal')">&times;</span>
            <h2>Ajouter un Grade</h2>
            <form onsubmit="saveNewGrade(event)">
                <input type="text" id="new-grade-name" placeholder="Nom du grade" required />
                <input type="number" id="new-grade-rank" min="1" placeholder="Rang" required />
                
                <div class="permissions-list">
                    <label><input type="checkbox" value="read" /> Lecture</label>
                    <label><input type="checkbox" value="write_report" /> Écrire rapports</label>
                    <label><input type="checkbox" value="moderate" /> Modération</label>
                    <label><input type="checkbox" value="manage_users" /> Gérer utilisateurs</label>
                    <label><input type="checkbox" value="admin" /> Admin</label>
                </div>
                
                <button type="submit" class="btn-primary">Créer</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function saveNewGrade(event) {
    event.preventDefault();
    
    const name = document.getElementById('new-grade-name').value;
    const rank = parseInt(document.getElementById('new-grade-rank').value);
    const checkboxes = document.querySelectorAll('#add-grade-modal .permissions-list input[type="checkbox"]:checked');
    const permissions = Array.from(checkboxes).map(cb => cb.value);
    
    addGrade(name, rank, permissions);
    closeModal('add-grade-modal');
    renderGradesList();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}
