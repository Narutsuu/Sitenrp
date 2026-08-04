// Configuration
const API_URL = 'http://localhost:3000';
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

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    if (!username || !password) {
        errorDiv.textContent = 'Veuillez remplir tous les champs';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = data.user;
            saveUserToStorage();
            showMainApp();
            loadStats();
        } else {
            errorDiv.textContent = data.error || 'Identifiants incorrects';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Erreur de connexion. Vérifiez que le serveur est démarré.';
    }
}

async function register() {
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
    
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            errorDiv.style.color = '#51cf66';
            errorDiv.textContent = 'Inscription réussie! Connectez-vous.';
            
            setTimeout(() => {
                toggleAuth('login');
                document.getElementById('register-username').value = '';
                document.getElementById('register-password').value = '';
                document.getElementById('register-password-confirm').value = '';
                errorDiv.style.color = '#ff6b6b';
            }, 2000);
        } else {
            errorDiv.textContent = data.error || 'Erreur lors de l\'inscription';
        }
    } catch (error) {
        console.error('Register error:', error);
        errorDiv.textContent = 'Erreur de connexion. Vérifiez que le serveur est démarré.';
    }
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
    
    // Show admin button if user is admin
    const adminBtn = document.getElementById('admin-btn');
    if (currentUser.grade === 'Administrateur') {
        adminBtn.style.display = 'inline-block';
    } else {
        adminBtn.style.display = 'none';
    }
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

async function submitReport(event) {
    event.preventDefault();
    
    const name = document.getElementById('report-name').value;
    const firstname = document.getElementById('report-firstname').value;
    const date = document.getElementById('report-date').value;
    const content = document.getElementById('report-content').value;
    const imageFile = document.getElementById('report-image').files[0];
    
    let image = null;
    if (imageFile) {
        image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    }
    
    try {
        const response = await fetch(`${API_URL}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authorId: currentUser.id,
                authorName: currentUser.username,
                name,
                firstname,
                date,
                content,
                image
            })
        });
        
        if (response.ok) {
            loadReports();
            hideReportForm();
            alert('Rapport créé avec succès!');
            loadStats();
        }
    } catch (error) {
        console.error('Submit report error:', error);
        alert('Erreur lors de la création du rapport');
    }
}

async function loadReports() {
    try {
        const response = await fetch(`${API_URL}/api/reports`);
        const reports = await response.json();
        
        const reportsList = document.getElementById('reports-list');
        reportsList.innerHTML = '';
        
        reports.forEach(report => {
            const canDelete = currentUser.grade === 'Administrateur' || currentUser.id === report.authorId;
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
    } catch (error) {
        console.error('Load reports error:', error);
        alert('Erreur de connexion au serveur');
    }
}

function viewReport(reportId) {
    fetch(`${API_URL}/api/reports`)
        .then(res => res.json())
        .then(reports => {
            const report = reports.find(r => r.id === reportId);
            
            if (report) {
                const modal = `
                    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000;" onclick="this.remove()">
                        <div style="background: var(--secondary-color); border: 2px solid var(--primary-color); border-radius: 10px; padding: 30px; max-width: 600px; max-height: 90vh; overflow: auto; color: var(--text-light);" onclick="event.stopPropagation()">
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
        })
        .catch(error => console.error('View report error:', error));
}

async function deleteReport(reportId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport?')) {
        try {
            const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadReports();
                alert('Rapport supprimé!');
                loadStats();
            }
        } catch (error) {
            console.error('Delete report error:', error);
            alert('Erreur lors de la suppression');
        }
    }
}

// Stats Functions
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/reports`);
        const reports = await response.json();
        const userReports = reports.filter(r => r.authorId === currentUser.id);
        
        document.getElementById('total-reports').textContent = reports.length;
        document.getElementById('user-reports').textContent = userReports.length;
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

// Admin Functions
async function loadAdmin() {
    if (currentUser.grade !== 'Administrateur') {
        alert('Accès refusé!');
        showPage('home');
        return;
    }
    
    try {
        const usersResponse = await fetch(`${API_URL}/api/users`);
        const users = await usersResponse.json();
        
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userHtml = `
                <div class="user-item">
                    <div class="user-item-info">
                        <div class="user-name">${user.username}</div>
                        <div class="user-grade">Grade: ${user.grade}</div>
                    </div>
                    <div class="user-actions">
                        <select onchange="changeGrade(${user.id}, this.value)" style="padding: 5px; border-radius: 3px;">
                            <option value="Recruté" ${user.grade === 'Recruté' ? 'selected' : ''}>Recruté</option>
                            <option value="Agent" ${user.grade === 'Agent' ? 'selected' : ''}>Agent</option>
                            <option value="Chef" ${user.grade === 'Chef' ? 'selected' : ''}>Chef</option>
                            <option value="Administrateur" ${user.grade === 'Administrateur' ? 'selected' : ''}>Administrateur</option>
                        </select>
                        <button onclick="deleteUser(${user.id})" class="btn-danger">Supprimer</button>
                    </div>
                </div>
            `;
            usersList.innerHTML += userHtml;
        });
        
        const reportsResponse = await fetch(`${API_URL}/api/reports`);
        const reports = await reportsResponse.json();
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
    } catch (error) {
        console.error('Load admin error:', error);
        alert('Erreur lors du chargement du panneau admin');
    }
}

async function changeGrade(userId, newGrade) {
    try {
        const response = await fetch(`${API_URL}/api/users/${userId}/grade`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade: newGrade })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.user.id === currentUser.id) {
                currentUser.grade = newGrade;
                saveUserToStorage();
                updateUserInfo();
            }
            
            alert(`Grade de ${data.user.username} changé en ${newGrade}!`);
            loadAdmin();
        }
    } catch (error) {
        console.error('Change grade error:', error);
        alert('Erreur lors de la modification du grade');
    }
}

async function deleteUser(userId) {
    if (userId === currentUser.id) {
        alert('Vous ne pouvez pas supprimer votre propre compte!');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Utilisateur supprimé!');
                loadAdmin();
            }
        } catch (error) {
            console.error('Delete user error:', error);
            alert('Erreur lors de la suppression de l\'utilisateur');
        }
    }
}

// Storage Functions
function saveUserToStorage() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function loadUserFromStorage() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
    }
}