# Section Stratégique de Suna - Système de Gestion des Rapports

## Description
Application web complète de gestion des rapports stratégiques pour la section de Suna.
Désignée pour un Naruto RP avec système d'authentification, grades et permissions.

## Fonctionnalités

### 🔐 Authentification
- Inscription et connexion des utilisateurs
- Système de mots de passe
- Sauvegarde sécurisée des données

### 📊 Gestion des Rapports
- Créer de nouveaux rapports avec :
  - Nom et prénom
  - Date du rapport
  - Contenu détaillé
  - Image facultative
- Consulter les rapports en grille
- Voir le détail complet d'un rapport
- Supprimer ses propres rapports (ou tous si administrateur)

### 👥 Système de Grades
- **Recruté** : Grade par défaut pour les nouveaux utilisateurs
- **Agent** : Accès complet aux rapports
- **Chef** : Gestion avancée
- **Administrateur** : Accès complet, gestion des utilisateurs et rapports

### ⚙️ Panneau d'Administration
- Gestion des utilisateurs (modification des grades, suppression)
- Gestion complète des rapports
- Vue d'ensemble des statistiques

### 🎨 Design
- Thème noir et orange (couleurs de Suna)
- Interface responsive
- Animations fluides
- Thème sombre optimisé

## Installation

1. Télécharger ou cloner le repository
2. Ouvrir `index.html` dans un navigateur web

## Utilisation

### Premier Accès
- **Identifiant par défaut** : `admin`
- **Mot de passe par défaut** : `admin123`

### Créer un Compte
1. Cliquer sur "Inscription"
2. Entrer un nom d'utilisateur et mot de passe
3. Confirmer le mot de passe
4. Cliquer sur "S'inscrire"
5. Se connecter avec vos identifiants

### Créer un Rapport
1. Aller dans l'onglet "Rapports"
2. Cliquer sur "+ Nouveau Rapport"
3. Remplir les champs obligatoires :
   - Nom
   - Prénom
   - Date
   - Contenu
4. Optionnel : Ajouter une image
5. Cliquer sur "Soumettre"

### Gestion Admin
1. Se connecter en tant qu'administrateur
2. Cliquer sur "Administration" (visible pour les admins)
3. Gérer les utilisateurs et leurs grades
4. Supprimer les utilisateurs ou rapports si nécessaire

## Structure des Données

Toutes les données sont stockées localement dans le navigateur (localStorage).

### Utilisateurs
```json
{
  "id": 1,
  "username": "username",
  "password": "password",
  "grade": "Administrateur",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Rapports
```json
{
  "id": 1,
  "authorId": 1,
  "authorName": "username",
  "name": "nom",
  "firstname": "prenom",
  "date": "2024-01-01",
  "content": "contenu du rapport",
  "image": "data:image/...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Permissions par Grade

| Action | Recruté | Agent | Chef | Admin |
|--------|---------|-------|------|-------|
| Créer un rapport | ✓ | ✓ | ✓ | ✓ |
| Voir tous les rapports | ✓ | ✓ | ✓ | ✓ |
| Supprimer ses rapports | ✓ | ✓ | ✓ | ✓ |
| Supprimer tous les rapports | ✗ | ✗ | ✗ | ✓ |
| Accéder à l'admin | ✗ | ✗ | ✗ | ✓ |
| Gérer les grades | ✗ | ✗ | ✗ | ✓ |
| Supprimer des utilisateurs | ✗ | ✗ | ✗ | ✓ |

## Notes Importantes

- Les données sont sauvegardées dans le **localStorage** du navigateur
- Les données persisteront tant que vous ne videz pas le cache du navigateur
- Pour exporter les données, ouvrez les outils de développement (F12) et consultez le localStorage
- Les mots de passe sont en texte brut (pour un vrai système, utilisez du chiffrement)

## Futures Améliorations

- Backend Node.js/Express pour une vraie base de données
- Chiffrement des mots de passe (bcrypt)
- Authentification JWT
- Export des rapports en PDF
- Recherche et filtrage avancés
- Système de notifications
- Gestion des permissions plus granulaires

## Support

Pour toute question ou problème, veuillez contacter l'administrateur.
