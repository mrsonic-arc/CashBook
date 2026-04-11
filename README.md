# Mrsonic Finance 💰

Personal cashbook app — synced via Firebase, deployed via GitHub Pages.

## Setup

### 1. Add GitHub Secrets
Go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret Name | Description |
|---|---|
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_DB_URL` | Realtime Database URL |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `FIREBASE_SENDER_ID` | Messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |

### 2. Enable GitHub Pages
Go to **Settings → Pages → Source → GitHub Actions**

### 3. Push to main
Every push to `main` automatically deploys with real keys injected — keys never appear in your repo history.

## Security
- Firebase keys are injected at deploy time via GitHub Secrets
- Firebase Security Rules require authentication (only logged-in users can access their own data)
- No real keys are stored in this repository
