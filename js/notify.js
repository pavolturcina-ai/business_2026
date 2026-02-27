// ============================================
// GOSPACE LABS — Slack Notifications on Checkbox
// ============================================

(function () {
  "use strict";

  // Get page title for notifications
  function getPageTitle() {
    const h1 = document.querySelector("h1");
    if (h1) return h1.textContent.trim();
    return document.title || "GOSPACE";
  }

  // Get checkbox label text
  function getCheckboxLabel(checkbox) {
    // Try parent label
    const label = checkbox.closest("label");
    if (label) return label.textContent.trim();

    // Try next sibling text
    const parent = checkbox.parentElement;
    if (parent) {
      const text = parent.textContent.trim();
      if (text) return text;
    }

    // Try nearby text content
    const nextSibling = checkbox.nextSibling;
    if (nextSibling && nextSibling.textContent) {
      return nextSibling.textContent.trim();
    }

    return "Unknown task";
  }

  // Get section heading for context
  function getSectionHeading(checkbox) {
    let el = checkbox.parentElement;
    while (el) {
      const heading = el.querySelector("h2, h3, h4");
      if (heading && !heading.contains(checkbox)) {
        return heading.textContent.trim();
      }
      el = el.parentElement;
    }
    return "";
  }

  // Send Slack notification via webhook
  async function sendSlackNotification(user, checkboxLabel, isChecked, section) {
    const webhookUrl = GOSPACE_CONFIG.slackWebhookUrl;

    if (!webhookUrl || webhookUrl === "YOUR_SLACK_WEBHOOK_URL") {
      console.warn("GOSPACE: Slack webhook not configured. See config.js");
      return;
    }

    const status = isChecked ? "✅" : "⬜";
    const action = isChecked ? "dokončil/a" : "zrušil/a";
    const userName = user.displayName || user.email.split("@")[0];
    const pageTitle = getPageTitle();

    let text = `${status} *${userName}* ${action}: _${checkboxLabel}_`;
    if (section) {
      text += `\n📂 ${section}`;
    }
    text += `\n📄 ${pageTitle}`;

    const payload = {
      text: text,
      unfurl_links: false,
      unfurl_media: false
    };

    try {
      // Use no-cors mode since Slack webhooks don't support CORS from browsers
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("GOSPACE: Failed to send Slack notification:", error);
    }
  }

  // Save checkbox state to Firestore
  async function saveCheckboxState(checkboxId, isChecked, user) {
    try {
      const db = firebase.firestore();
      const page = window.location.pathname.split("/").pop() || "index";
      await db.collection(GOSPACE_CONFIG.checkboxCollection).doc(page + "__" + checkboxId).set({
        checked: isChecked,
        updatedBy: user.email,
        updatedByName: user.displayName || user.email,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        page: page
      });
    } catch (error) {
      console.error("GOSPACE: Failed to save checkbox state:", error);
    }
  }

  // Load checkbox states from Firestore
  async function loadCheckboxStates() {
    try {
      const db = firebase.firestore();
      const page = window.location.pathname.split("/").pop() || "index";
      const snapshot = await db.collection(GOSPACE_CONFIG.checkboxCollection)
        .where("page", "==", page)
        .get();

      snapshot.forEach(function (doc) {
        const data = doc.data();
        const checkboxId = doc.id.replace(page + "__", "");
        const checkbox = document.querySelector(`input[type="checkbox"][data-gospace-id="${checkboxId}"]`);
        if (checkbox) {
          checkbox.checked = data.checked;
        }
      });
    } catch (error) {
      console.error("GOSPACE: Failed to load checkbox states:", error);
    }
  }

  // Assign unique IDs to all checkboxes
  function assignCheckboxIds() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (cb, index) {
      if (!cb.dataset.gospaceId) {
        cb.dataset.gospaceId = "cb-" + index;
      }
    });
  }

  // Attach listeners to all checkboxes
  function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function (e) {
        const user = window.gospace.getCurrentUser();
        if (!user) return;

        const label = getCheckboxLabel(checkbox);
        const section = getSectionHeading(checkbox);
        const isChecked = checkbox.checked;
        const checkboxId = checkbox.dataset.gospaceId;

        // Send Slack notification
        sendSlackNotification(user, label, isChecked, section);

        // Save state to Firestore
        saveCheckboxState(checkboxId, isChecked, user);
      });
    });
  }

  // Initialize when auth is ready
  window.addEventListener("gospace-auth-ready", function () {
    assignCheckboxIds();
    attachCheckboxListeners();
    loadCheckboxStates();
  });
})();
