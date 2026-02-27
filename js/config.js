// ============================================
// GOSPACE LABS — Configuration
// ============================================
// IMPORTANT: Replace these values with your own!
// See SETUP-GUIDE.md for instructions.
// ============================================

const GOSPACE_CONFIG = {

  // Firebase Configuration
  // Get this from: https://console.firebase.google.com → Project Settings → Web App
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },

  // Allowed email domain (only @gospace.tech users can log in)
  allowedDomain: "gospace.tech",

  // Slack Incoming Webhook URL
  // Get this from: https://api.slack.com/messaging/webhooks
  slackWebhookUrl: "YOUR_SLACK_WEBHOOK_URL",

  // Slack channel name (for display purposes)
  slackChannel: "#scorecard",

  // Firestore collection for storing checkbox states
  checkboxCollection: "checkbox_states"
};
