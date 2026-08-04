const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(__dirname));

const dataDir = path.join(__dirname, 'data');
const usersPath = path.join(dataDir, 'users.json');
const reportsPath = path.join(dataDir, 'reports.json');

// Helper functions
function readUsers() {
    try {
        if (fs.existsSync(usersPath)) {
            return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

function writeUsers(users) {
    try {
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing users:', error);
    }
}

function readReports() {
    try {
        if (fs.existsSync(reportsPath)) {
            return JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Error reading reports:', error);
        return [];
    }
}

function writeReports(reports) {
    try {
        fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing reports:', error);
    }
}

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function initializeDefaults() {
    let users = readUsers();
    if (users.length === 0) {
        users.push({
            id: 1,
            username: 'admin',
            password: 'admin123',
            grade: 'Administrateur',
            createdAt: new Date().toISOString()
        });
        writeUsers(users);
    }
}

initializeDefaults();

// Routes - Users
app.get('/api/users', (req, res) => {
    try {
        const users = readUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const users = readUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, error: 'Identifiants incorrects' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/register', (req, res) => {
    try {
        const { username, password } = req.body;
        const users = readUsers();
        
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
        }
        
        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            username,
            password,
            grade: 'Recruté',
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        writeUsers(users);
        
        res.json({ success: true, user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id/grade', (req, res) => {
    try {
        const { id } = req.params;
        const { grade } = req.body;
        const users = readUsers();
        
        const user = users.find(u => u.id === parseInt(id));
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        user.grade = grade;
        writeUsers(users);
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id/password', (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const users = readUsers();
        
        const user = users.find(u => u.id === parseInt(id));
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        user.password = password;
        writeUsers(users);
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const users = readUsers();
        
        const filtered = users.filter(u => u.id !== parseInt(id));
        writeUsers(filtered);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Routes - Reports
app.get('/api/reports', (req, res) => {
    try {
        const reports = readReports();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reports', (req, res) => {
    try {
        const { authorId, authorName, name, firstname, date, content, image } = req.body;
        const reports = readReports();
        
        const newReport = {
            id: Date.now(),
            authorId,
            authorName,
            name,
            firstname,
            date,
            content,
            image: image || null,
            createdAt: new Date().toISOString()
        };
        
        reports.push(newReport);
        writeReports(reports);
        
        res.json({ success: true, report: newReport });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/reports/:id', (req, res) => {
    try {
        const { id } = req.params;
        const reports = readReports();
        
        const filtered = reports.filter(r => r.id !== parseInt(id));
        writeReports(filtered);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Serveur Sitenrp démarré sur http://localhost:${PORT}`);
    console.log(`📁 Dossier data: ${dataDir}`);
    console.log(`👤 Admin: admin / admin123\n`);
});