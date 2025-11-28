// content.js
// Run check immediately on load
checkRisk();

// Also set up listener for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'showIntervention') {
      showIntervention(request.data);
      sendResponse({ success: true });
    } else if (request.action === 'analyzePageContent') {
      const analysis = analyzePageContent(request.type);
      sendResponse({ hasContent: true, ...analysis });
    }
  } catch (error) {
    console.error('Error in content script message handler:', error);
    sendResponse({ error: error.message });
  }
});

function checkRisk() {
  try {
    chrome.runtime.sendMessage(
      { action: "checkIntervention", url: window.location.href },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to check intervention:', chrome.runtime.lastError);
          return;
        }
        if (response && response.should_intervene) {
          showIntervention(response);
        }
      }
    );
  } catch (error) {
    console.error('Error checking risk:', error);
  }
}

function analyzePageContent(type) {
  // Detect impulse buy or proposal patterns
  const isImpulseBuy = type === 'shopping' && detectImpulseBuyPattern();
  const isProposal = type === 'gig' && detectProposalPattern();
  
  return { isImpulseBuy, isProposal };
}

function detectImpulseBuyPattern() {
  // Advanced heuristic: check for impulse buy signals
  const pageText = document.body.innerText.toLowerCase();
  const htmlContent = document.documentElement.innerHTML.toLowerCase();
  
  // Check for urgency signals
  const urgencySignals = [
    'limited stock', 'only', 'left in stock', 'hurry', 'today only', 
    'flash sale', 'limited time', 'expires', 'countdown', 'urgent'
  ];
  
  // Check for discount signals
  const discountSignals = [
    '% off', 'discount', 'deal', 'save', 'free shipping', 'coupon'
  ];
  
  // Check for emotional triggers
  const emotionalSignals = [
    'best seller', 'trending', 'popular', 'exclusive', 'limited edition'
  ];
  
  const combinedText = pageText + ' ' + htmlContent;
  
  const urgencyCount = urgencySignals.filter(signal => combinedText.includes(signal)).length;
  const discountCount = discountSignals.filter(s => combinedText.includes(s)).length;
  const emotionalCount = emotionalSignals.filter(s => combinedText.includes(s)).length;
  
  // Impulse buy if multiple signals detected
  return (urgencyCount + discountCount + emotionalCount) >= 2;
}

function detectProposalPattern() {
  // Check for Upwork-like proposal elements
  const pageText = document.body.innerText.toLowerCase();
  const htmlContent = document.documentElement.innerHTML.toLowerCase();
  const combinedText = pageText + ' ' + htmlContent;
  
  // Look for gig work indicators
  const gigIndicators = [
    'proposal', 'bid', 'fixed price', 'hourly rate', 'project budget',
    'your bid', 'submit proposal', 'skills required', 'job description'
  ];
  
  const matchCount = gigIndicators.filter(indicator => combinedText.includes(indicator)).length;
  
  return matchCount >= 2;
}

function showIntervention(data) {
  try {
    // 1. Try to disable "Buy" buttons immediately
    disableBuyButtons();

    // 2. Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'finsphere-overlay';
    
    // Build intervention message based on data
    let message = data.reason || "We detected high stress levels. Making financial decisions now might be risky.";
    let severity = data.severity || 'medium';
    let displayTime = data.delay_minutes || 5;
    
    // Customize message by severity
    if (severity === 'high') {
      message = '🔴 HIGH STRESS ALERT: ' + message + ' Please take a break before making this purchase.';
    } else if (severity === 'medium') {
      message = '🟡 CAUTION: ' + message + ' Consider waiting a few minutes before deciding.';
    } else {
      message = '🟢 REMINDER: ' + message;
    }
    
    overlay.innerHTML = `
      <div class="finsphere-card" style="border-left: 4px solid ${severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#22c55e'}">
        <div class="finsphere-title">Pause for a Moment</div>
        <div class="finsphere-message">${message}</div>
        <div class="finsphere-stress-info" style="background: #f1f5f9; padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #64748b;">
          ${data.userState ? `Stress Level: <strong>${data.userState.stress_level}</strong> | Spending Risk: <strong>${data.userState.spending_risk}</strong>` : 'System monitoring your financial wellness'}
        </div>
        <div class="finsphere-timer" id="fs-timer">${displayTime}:00</div>
        <div class="finsphere-actions">
          <button class="finsphere-btn finsphere-btn-secondary" id="fs-snooze">I'll wait</button>
          <button class="finsphere-btn finsphere-btn-primary" id="fs-proceed">I really need this</button>
        </div>
      </div>
    `;

    // Check for existing overlay and remove it
    const existingOverlay = document.querySelector('.finsphere-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    document.body.appendChild(overlay);
    
    // Start Timer
    startTimer(displayTime);

    // Handlers
    const snoozeBtn = document.getElementById('fs-snooze');
    const proceedBtn = document.getElementById('fs-proceed');
    
    if (snoozeBtn) {
      snoozeBtn.addEventListener('click', () => {
        logInterventionAccepted('snooze', true);
        overlay.remove();
        enableBuyButtons();
        window.location.href = "https://www.google.com/search?q=financial+wellness+tips";
      });
    }

    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (confirm("Are you sure? This purchase was flagged as high risk. Continue anyway?")) {
          logInterventionAccepted('proceed', true);
          overlay.remove();
          enableBuyButtons();
        }
      });
    }
  } catch (error) {
    console.error('Error showing intervention:', error);
  }
}

function logInterventionAccepted(action, accepted) {
  // Send log to background script
  try {
    chrome.runtime.sendMessage({
      action: 'recordIntervention',
      data: {
        url: window.location.href,
        intervention_action: action,
        accepted: accepted,
        timestamp: new Date().toISOString()
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Could not log intervention:', chrome.runtime.lastError);
      } else {
        console.log('Intervention logged:', response);
      }
    });
  } catch (error) {
    console.warn('Could not log intervention:', error);
  }
}

function startTimer(minutes) {
  let seconds = minutes * 60;
  const timerEl = document.getElementById('fs-timer');
  
  if (!timerEl) return;
  
  const interval = setInterval(() => {
    seconds--;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    timerEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    if (seconds <= 0) {
      clearInterval(interval);
      timerEl.textContent = "0:00";
      const proceedBtn = document.getElementById('fs-proceed');
      if (proceedBtn) {
        proceedBtn.textContent = "Proceed safely";
      }
    }
  }, 1000);
}

function disableBuyButtons() {
  // Common selectors for Amazon, Flipkart, Myntra
  const selectors = [
    '#buy-now-button', 
    '#add-to-cart-button',
    '.buy-now',
    'button[class*="buy"]',
    'button[class*="cart"]',
    'a[href*="buy"]',
    'a[class*="buy"]'
  ];
  
  selectors.forEach(sel => {
    const btns = document.querySelectorAll(sel);
    btns.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
      btn.dataset.originalText = btn.innerText;
      btn.innerText = "Locked by FinSphere";
    });
  });
}

function enableBuyButtons() {
  const selectors = [
    '#buy-now-button', 
    '#add-to-cart-button',
    '.buy-now',
    'button[class*="buy"]',
    'button[class*="cart"]',
    'a[href*="buy"]',
    'a[class*="buy"]'
  ];
  
  selectors.forEach(sel => {
    const btns = document.querySelectorAll(sel);
    btns.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      if (btn.dataset.originalText) {
        btn.innerText = btn.dataset.originalText;
      }
    });
  });
}
