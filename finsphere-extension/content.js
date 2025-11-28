// content.js

// Run check immediately on load
checkRisk();

function checkRisk() {
  chrome.runtime.sendMessage(
    { action: "checkIntervention", url: window.location.href },
    (response) => {
      if (response && response.should_intervene) {
        showIntervention(response);
      }
    }
  );
}

function showIntervention(data) {
  // 1. Try to disable "Buy" buttons immediately
  disableBuyButtons();

  // 2. Create Overlay
  const overlay = document.createElement('div');
  overlay.className = 'finsphere-overlay';
  
  overlay.innerHTML = `
    <div class="finsphere-card">
      <div class="finsphere-title">Wait! Let's pause for a moment.</div>
      <div class="finsphere-message">${data.message || "We detected high stress levels. Making financial decisions now might be risky."}</div>
      <div class="finsphere-timer" id="fs-timer">10:00</div>
      <div class="finsphere-actions">
        <button class="finsphere-btn finsphere-btn-secondary" id="fs-snooze">I'll wait</button>
        <button class="finsphere-btn finsphere-btn-primary" id="fs-proceed">I really need this</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  
  // Start Timer
  startTimer(data.delay_minutes || 10);

  // Handlers
  document.getElementById('fs-snooze').addEventListener('click', () => {
    window.location.href = "https://google.com"; // Redirect away
  });

  document.getElementById('fs-proceed').addEventListener('click', () => {
    if (confirm("Are you sure? This purchase was flagged as high risk.")) {
      overlay.remove();
      enableBuyButtons();
    }
  });
}

function startTimer(minutes) {
  let seconds = minutes * 60;
  const timerEl = document.getElementById('fs-timer');
  
  const interval = setInterval(() => {
    seconds--;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    timerEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    if (seconds <= 0) {
      clearInterval(interval);
      timerEl.textContent = "0:00";
      document.getElementById('fs-proceed').textContent = "Proceed safely";
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
    'button[class*="cart"]'
  ];
  
  selectors.forEach(sel => {
    const btns = document.querySelectorAll(sel);
    btns.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
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
    'button[class*="cart"]'
  ];
  
  selectors.forEach(sel => {
    const btns = document.querySelectorAll(sel);
    btns.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      if (btn.dataset.originalText) {
        btn.innerText = btn.dataset.originalText;
      }
    });
  });
}
