// Configuration
let currentUser = null;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadUserFromStorage();
    if (currentUser) {
        showMainApp();
        loadStats();
    } else {
        showAuthPage();
    }
});

// Auth Functions
function toggleAuth(type) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.auth-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${type}-form`).classList.add('active');
    event.target.classList.add('active');
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    if (!username || !password) {
        errorDiv.textContent = 'Veuillez remplir tous les champs';
        return;
    }
    
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    
    if (!user || user.password !== password) {
        errorDiv.textContent = 'Identifiants incorrects';
        return;
    }
    
    currentUser = user;
    saveUserToStorage();
    showMainApp();
    loadStats();
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const errorDiv = document.getElementById('register-error');
    
    errorDiv.textContent = '';
    
    if (!username || !password || !passwordConfirm) {
        errorDiv.textContent = 'Veuillez remplir tous les champs';
        return;
    }
    
    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Les mots de passe ne correspondent pas';
        return;
    }
    
    const users = loadUsers();
    if (users.find(u => u.username === username)) {
        errorDiv.textContent = 'Cet utilisateur existe déjà';
        return;
    }
    
    // Default grade taken from grades.js if available
    const defaultGrade = (typeof getAllGrades === 'function' && getAllGrades().length) ? getAllGrades()[0].name : 'Stratege en test';

    const newUser = {
        id: Date.now(),
        username,
        password,
        grade: defaultGrade,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    errorDiv.style.color = '#51cf66';
    errorDiv.textContent = 'Inscription réussie! Connectez-vous.';
    
    setTimeout(() => {
        toggleAuth('login');
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-password-confirm').value = '';
        errorDiv.style.color = '#ff6b6b';
    }, 2000);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
    toggleAuth('login');
}

// UI Functions
function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    updateUserInfo();
    loadReports();
    
    const adminBtn = document.getElementById('admin-btn');
    // show admin button if current user has 'admin' permission on their grade
    let isAdmin = false;
    if (currentUser && typeof getGradeByName === 'function') {
        const g = getGradeByName(currentUser.grade);
        isAdmin = !!(g && g.permissions && g.permissions.includes('admin'));
    }
    if (adminBtn) adminBtn.style.display = isAdmin ? 'inline-block' : 'none';
}

function showAuthPage() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('main-container').style.display = 'none';
}

function updateUserInfo() {
    document.getElementById('user-info').innerHTML = `
        <span>${currentUser.username}</span>
        <span class="grade-badge">${currentUser.grade}</span>
    `;
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageName}-page`).classList.add('active');
    
    if (pageName === 'reports') {
        loadReports();
    } else if (pageName === 'admin') {
        loadAdmin();
    }
}

// Report Functions
function showReportForm() {
    document.getElementById('report-form-container').style.display = 'block';
    document.getElementById('report-name').focus();
}

function hideReportForm() {
    document.getElementById('report-form-container').style.display = 'none';
    document.getElementById('report-form-container').querySelector('form').reset();
}

function submitReport(event) {
    event.preventDefault();
    
    const name = document.getElementById('report-name').value;
    const firstname = document.getElementById('report-firstname').value;
    const date = document.getElementById('report-date').value;
    const content = document.getElementById('report-content').value;
    const imageFile = document.getElementById('report-image').files[0];
    
    const report = {
        id: Date.now(),
        authorId: currentUser.id,
        authorName: currentUser.username,
        name,
        firstname,
        date,
        content,
        image: null,
        createdAt: new Date().toISOString()
    };
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            report.image = e.target.result;
            saveReport(report);
            loadReports();
            hideReportForm();
            alert('Rapport créé avec succès!');
            loadStats();
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveReport(report);
        loadReports();
        hideReportForm();
        alert('Rapport créé avec succès!');
        loadStats();
    }
}

function loadReports() {
    const reports = loadAllReports();
    const reportsList = document.getElementById('reports-list');
    reportsList.innerHTML = '';
    
    const currentIsAdmin = (currentUser && typeof getGradeByName === 'function') ?
        !!(getGradeByName(currentUser.grade) && getGradeByName(currentUser.grade).permissions.includes('admin')) :
        (currentUser && currentUser.grade === 'Administrateur');

    reports.forEach(report => {
        const canDelete = currentIsAdmin || currentUser.id === report.authorId;
        const reportHtml = `
            <div class="report-card">
                <h3>
                    ${report.name} ${report.firstname}
                    ${report.authorId === currentUser.id ? '<span style="font-size: 12px; color: var(--primary-color);">✓ Votre rapport</span>' : ''}
                </h3>
                <div class="report-date">${new Date(report.date).toLocaleDateString('fr-FR')}</div>
                <div class="report-author">Par: ${report.authorName}</div>
                ${report.image ? `<img src="${report.image}" class="report-image" alt="Rapport image">` : ''}
                <div class="report-content">${report.content.substring(0, 150)}...</div>
                <div class="report-actions">
                    <button onclick="viewReport(${report.id})" class="btn-primary">Voir</button>
                    ${canDelete ? `<button onclick="deleteReport(${report.id})" class="btn-danger">Supprimer</button>` : ''}
                </div>
            </div>
        `;
        reportsList.innerHTML += reportHtml;
    });
}

function viewReport(reportId) {
    const reports = loadAllReports();
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
        const modal = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000;" onclick="t[...]
                <div style="background: var(--secondary-color); border: 2px solid var(--primary-color); border-radius: 10px; padding: 30px; max-width: 600px; max-height: 90vh; overflow: auto; col[...]
                    <h2 style="color: var(--primary-color); margin-bottom: 15px;">${report.name} ${report.firstname}</h2>
                    <p style="color: #ccc; margin-bottom: 10px;"><strong>Date:</strong> ${new Date(report.date).toLocaleDateString('fr-FR')}</p>
                    <p style="color: #ccc; margin-bottom: 15px;"><strong>Auteur:</strong> ${report.authorName}</p>
                    ${report.image ? `<img src="${report.image}" style="width: 100%; border-radius: 5px; margin-bottom: 20px; border: 1px solid var(--primary-color);">` : ''}
                    <div style="line-height: 1.8; color: #ddd; margin-bottom: 20px;">${report.content.replace(/\n/g, '<br>')}</div>
                    <button onclick="this.closest('div').parentElement.remove()" class="btn-primary" style="width: 100%;">Fermer</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modal);
    }
}

function deleteReport(reportId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport?')) {
        const reports = loadAllReports();
        const filtered = reports.filter(r => r.id !== reportId);
        saveAllReports(filtered);
        loadReports();
        alert('Rapport supprimé!');
        loadStats();
    }
}

// Stats Functions
function loadStats() {
    const reports = loadAllReports();
    const userReports = reports.filter(r => r.authorId === currentUser.id);
    
    document.getElementById('total-reports').textContent = reports.length;
    document.getElementById('user-reports').textContent = userReports.length;
}

// Admin Functions
function loadAdmin() {
    // check permission using grades definitions
    const currentGradeDef = (currentUser && typeof getGradeByName === 'function') ? getGradeByName(currentUser.grade) : null;
    if (!(currentGradeDef && currentGradeDef.permissions && currentGradeDef.permissions.includes('admin'))) {
        alert('Accès refusé!');
        showPage('home');
        return;
    }
    
    const users = loadUsers();
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    
    // get available grades from grades.js
    const allGrades = (typeof getAllGrades === 'function') ? getAllGrades() : [
        { name: 'Stratege en test' }, { name: 'Stratege' }, { name: 'Chef' }, { name: 'Administrateur' }
    ];
    
    users.forEach(user => {
        const optionsHtml = allGrades.map(g => {
            const selected = (user.grade === g.name) ? 'selected' : '';
            return `<option value="${g.name}" ${selected}>${g.name}</option>`;
        }).join('');

        const userHtml = `
            <div class="user-item">
                <div class="user-item-info">
                    <div class="user-name">${user.username}</div>
                    <div class="user-grade">Grade: ${user.grade}</div>
                    <div class="user-password">Mot de passe: <strong>${user.password}</strong></div>
                </div>
                <div class="user-actions">
                    <select onchange="changeGrade(${user.id}, this.value)" style="padding: 5px; border-radius: 3px;">
                        ${optionsHtml}
                    </select>
                    <button onclick="editUserPassword(${user.id})" class="btn-success">Modifier MDP</button>
                    <button onclick="deleteUser(${user.id})" class="btn-danger">Supprimer</button>
                </div>
            </div>
        `;
        usersList.innerHTML += userHtml;
    });
    
    const reports = loadAllReports();
    const adminReportsList = document.getElementById('admin-reports-list');
    adminReportsList.innerHTML = '';
    
    reports.forEach(report => {
        const reportHtml = `
            <div class="admin-report-item">
                <div class="admin-report-item-info">
                    <div class="user-name">${report.name} ${report.firstname}</div>
                    <div class="user-grade">Auteur: ${report.authorName} | ${new Date(report.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <div class="admin-report-item-actions">
                    <button onclick="viewReport(${report.id})" class="btn-success">Voir</button>
                    <button onclick="deleteReport(${report.id})" class="btn-danger">Supprimer</button>
                </div>
            </div>
        `;
        adminReportsList.innerHTML += reportHtml;
    });
}

function editUserPassword(userId) {
    const newPassword = prompt('Nouveau mot de passe:');
    
    if (newPassword !== null && newPassword.trim() !== '') {
        const users = loadUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.password = newPassword;
            saveUsers(users);
            alert('Mot de passe modifié avec succès!');
            loadAdmin();
        }
    }
}

function changeGrade(userId, newGrade) {
    // Coerce userId to number to avoid string/number mismatch when coming from DOM
    userId = Number(userId);
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.grade = newGrade;
        saveUsers(users);
        
        if (currentUser && user.id === currentUser.id) {
            currentUser.grade = newGrade;
            saveUserToStorage();
            updateUserInfo();
        }
        
        alert(`Grade de ${user.username} changé en ${newGrade}!`);
        loadAdmin();
    } else {
        console.error('Utilisateur introuvable pour id:', userId);
        alert("Erreur: utilisateur introuvable (voir console).");
    }
}

function deleteUser(userId) {
    if (userId === currentUser.id) {
        alert('Vous ne pouvez pas supprimer votre propre compte!');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
        const users = loadUsers();
        const filtered = users.filter(u => u.id !== userId);
        saveUsers(filtered);
        alert('Utilisateur supprimé!');
        loadAdmin();
    }
}

// Storage Functions
function loadUsers() {
    const stored = localStorage.getItem('sitenrp_users');
    if (!stored) {
        const defaultAdmin = {
            id: 1,
            username: 'admin',
            password: 'admin123',
            grade: 'Administrateur',
            createdAt: new Date().toISOString()
        };
        saveUsers([defaultAdmin]);
        return [defaultAdmin];
    }
    return JSON.parse(stored);
}

function saveUsers(users) {
    localStorage.setItem('sitenrp_users', JSON.stringify(users));
}

function loadAllReports() {
    const stored = localStorage.getItem('sitenrp_reports');
    return stored ? JSON.parse(stored) : [];
}

function saveReport(report) {
    const reports = loadAllReports();
    reports.push(report);
    saveAllReports(reports);
}

function saveAllReports(reports) {
    localStorage.setItem('sitenrp_reports', JSON.stringify(reports));
}

function saveUserToStorage() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function loadUserFromStorage() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        const users = loadUsers();
        if (!users.find(u => u.id === currentUser.id)) {
            localStorage.removeItem('currentUser');
            currentUser = null;
        }
    }
}

// Admin export function - manual download only
function exportDataAsAdmin() {
    // check using grade permissions
    const currentGradeDef = (currentUser && typeof getGradeByName === 'function') ? getGradeByName(currentUser.grade) : null;
    if (!(currentGradeDef && currentGradeDef.permissions && currentGradeDef.permissions.includes('admin'))) {
        alert('Accès refusé!');
        return;
    }
    
    const users = loadUsers();
    const reports = loadAllReports();
    
    downloadJSON('users', users);
    downloadJSON('reports', reports);
    
    alert('Fichiers JSON téléchargés avec succès!');
}

// Download JSON files function
function downloadJSON(filename, data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
