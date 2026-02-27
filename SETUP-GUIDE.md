# GOSPACE LABS — Setup Guide

## Čo potrebuješ nastaviť

### 1. Firebase (Google prihlasovanie + ukladanie checkboxov)

1. Choď na **https://console.firebase.google.com**
2. Klikni **"Add project"** → nazvi ho napr. `gospace-2026`
3. Pokračuj cez wizard (Google Analytics môžeš vypnúť)

#### Zapni Authentication:
1. V ľavom menu klikni **Authentication** → **Get started**
2. Klikni **Google** → **Enable**
3. Zadaj support email (tvoj @gospace.tech email)
4. Klikni **Save**

#### Zapni Firestore:
1. V ľavom menu klikni **Firestore Database** → **Create database**
2. Vyber **Start in production mode**
3. Vyber region: `europe-west1` (Belgium)
4. Klikni **Create**

#### Firestore pravidlá (len @gospace.tech):
V **Firestore → Rules** vlož:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checkbox_states/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.email.matches('.*@gospace\\.tech$');
    }
  }
}
```

#### Získaj Firebase config:
1. Klikni na ⚙️ **Project Settings** (vľavo hore)
2. Scroll dole na **"Your apps"** → klikni **Web** (ikona `</>`)
3. Nazvi app napr. `gospace-web` → **Register app**
4. Skopíruj `firebaseConfig` objekt

#### Pridaj doménu:
1. V **Authentication → Settings → Authorized domains**
2. Pridaj: `pavolturcina-ai.github.io`

### 2. Slack Webhook

1. Choď na **https://api.slack.com/apps**
2. Klikni **"Create New App"** → **"From scratch"**
3. Názov: `GOSPACE Scorecard`, Workspace: tvoj Slack workspace
4. V ľavom menu klikni **Incoming Webhooks** → **Activate** (ON)
5. Klikni **"Add New Webhook to Workspace"**
6. Vyber kanál (napr. `#scorecard` alebo `#general`)
7. Skopíruj **Webhook URL** (začína `https://hooks.slack.com/services/...`)

### 3. Vlož config do kódu

Otvor súbor `js/config.js` a nahraď placeholders:

```javascript
const GOSPACE_CONFIG = {
  firebase: {
    apiKey: "AIzaSy...",           // z Firebase console
    authDomain: "gospace-2026.firebaseapp.com",
    projectId: "gospace-2026",
    storageBucket: "gospace-2026.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  },
  allowedDomain: "gospace.tech",
  slackWebhookUrl: "https://hooks.slack.com/services/T.../B.../xxx...",
  slackChannel: "#scorecard",
  checkboxCollection: "checkbox_states"
};
```

### 4. Pushni zmeny a testuj

```bash
git add js/config.js
git commit -m "Add Firebase and Slack configuration"
git push
```

Potom choď na: **https://pavolturcina-ai.github.io/business_2026_dev/**

## Ako to funguje

- **Prihlásenie**: Keď otvoríš stránku, zobrazí sa login screen. Po kliknutí na "Prihlásiť sa cez Google" sa prihlási len @gospace.tech účet.
- **Checkboxy**: Keď ktokoľvek z tímu odklikne checkbox, stav sa uloží do Firestore (zdieľaný medzi všetkými) a pošle sa Slack notifikácia.
- **Notifikácia**: V Slack kanáli sa zobrazí napr.: `✅ Bohdan dokončil/a: Moderná stránka fleximodo.com`

## Cena

- **Firebase**: Zadarmo (Spark plan) — do 50k prihlásení/mesiac, 1GB Firestore
- **Slack Webhook**: Zadarmo
- **GitHub Pages**: Zadarmo
