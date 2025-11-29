// content.js
// Set up buy button monitoring immediately
setupBuyButtonMonitoring();

// Also set up listener for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'showIntervention') {
      showIntervention(request.data);
      sendResponse({ success: true });
    } else if (request.action === 'analyzePageContent') {
      const analysis = analyzePageContent(request.type);
      sendResponse({ hasContent: true, ...analysis });
    } else if (request.action === 'extractOrderDetails') {
      const orderDetails = extractOrderDetails();
      sendResponse({ orderDetails });
    }
  } catch (error) {
    console.error('Error in content script message handler:', error);
    sendResponse({ error: error.message });
  }
});

/**
 * Set up monitoring for buy button clicks
 */
function setupBuyButtonMonitoring() {
  // Common buy button selectors across different sites
  const buyButtonSelectors = [
    // Amazon
    '#buy-now-button', '#add-to-cart-button', '[name="submit.buy-now"]', '[data-action="buy-now"]',
    // Flipkart  
    '._2KpZ6l._2U9uOA._3v1-ww', '.qa-add-to-cart', '._2KpZ6l._2U9uOA',
    // Myntra
    '.pdp-add-to-bag', '.buyButton', '.add-to-bag',
    // Swiggy/Zomato
    '.place-order', '.checkout-button', '[data-testid="checkout-button"]',
    // Generic
    'button[class*="buy"]', 'button[class*="cart"]', 'button[class*="checkout"]',
    'a[href*="buy"]', 'a[class*="buy"]', '.buy-now', '.add-to-cart'
  ];

  // Add click listeners to all buy buttons
  buyButtonSelectors.forEach(selector => {
    document.addEventListener('click', function(event) {
      if (event.target.matches(selector) || event.target.closest(selector)) {
        event.preventDefault(); // Prevent immediate purchase
        event.stopPropagation();
        handleBuyButtonClick(event.target);
      }
    }, true);
  });

  console.log('FinSphere: Buy button monitoring active');
}

/**
 * Handle buy button click - extract order details and check for overspending
 */
async function handleBuyButtonClick(buttonElement) {
  try {
    console.log('Buy button clicked, analyzing purchase...');
    
    // Extract order details from the page
    const orderDetails = extractOrderDetails();
    console.log('Order details:', orderDetails);

    // Send to background script for analysis
    chrome.runtime.sendMessage({
      action: 'analyzePurchase',
      orderDetails: orderDetails,
      url: window.location.href
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Failed to analyze purchase:', chrome.runtime.lastError);
        // Allow purchase to continue if analysis fails
        buttonElement.click();
        return;
      }

      if (response && response.shouldIntervene) {
        // Show spending intervention
        showSpendingIntervention(response, buttonElement);
      } else {
        // Safe to proceed with purchase
        console.log('Purchase approved, proceeding...');
        buttonElement.click();
      }
    });

  } catch (error) {
    console.error('Error handling buy button click:', error);
    // Allow purchase on error
    buttonElement.click();
  }
}

/**
 * Extract order details from various e-commerce sites
 */
function extractOrderDetails() {
  const details = {
    amount: 0,
    currency: 'INR',
    productName: '',
    category: '',
    merchant: '',
    quantity: 1
  };

  // Get merchant from URL
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('amazon')) {
    details.merchant = 'Amazon';
    details.category = extractAmazonDetails(details);
  } else if (hostname.includes('flipkart')) {
    details.merchant = 'Flipkart';
    details.category = extractFlipkartDetails(details);
  } else if (hostname.includes('myntra')) {
    details.merchant = 'Myntra';
    details.category = 'Fashion';
    extractMyntraDetails(details);
  } else if (hostname.includes('swiggy')) {
    details.merchant = 'Swiggy';
    details.category = 'Food';
    extractSwiggyDetails(details);
  } else if (hostname.includes('zomato')) {
    details.merchant = 'Zomato';
    details.category = 'Food';
    extractZomatoDetails(details);
  } else {
    details.merchant = hostname;
    extractGenericDetails(details);
  }

  return details;
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

/**
 * Extract Amazon order details
 */
function extractAmazonDetails(details) {
  // Product name
  const titleEl = document.querySelector('#productTitle, .product-title');
  if (titleEl) details.productName = titleEl.innerText.trim();

  // Price
  const priceSelectors = [
    '.a-price-whole', '.a-offscreen', '.a-price .a-offscreen',
    '[data-asin-price]', '.a-price-range .a-price .a-offscreen'
  ];
  
  for (const selector of priceSelectors) {
    const priceEl = document.querySelector(selector);
    if (priceEl) {
      const priceText = priceEl.innerText.replace(/[^\d.]/g, '');
      details.amount = parseFloat(priceText) || 0;
      break;
    }
  }

  // Category from breadcrumbs
  const breadcrumbEl = document.querySelector('#wayfinding-breadcrumbs_container');
  if (breadcrumbEl) {
    const breadcrumbs = breadcrumbEl.innerText;
    if (breadcrumbs.includes('Electronics')) return 'Electronics';
    if (breadcrumbs.includes('Clothing')) return 'Fashion';
    if (breadcrumbs.includes('Books')) return 'Books';
  }

  return 'General';
}

/**
 * Extract Flipkart order details
 */
function extractFlipkartDetails(details) {
  // Product name
  const titleEl = document.querySelector('.B_NuCI, ._35KyD6');
  if (titleEl) details.productName = titleEl.innerText.trim();

  // Price
  const priceEl = document.querySelector('._30jeq3._16Jk6d, ._3I9_wc._2p6lqe');
  if (priceEl) {
    const priceText = priceEl.innerText.replace(/[^\d]/g, '');
    details.amount = parseFloat(priceText) || 0;
  }

  return 'General';
}

/**
 * Extract Myntra order details
 */
function extractMyntraDetails(details) {
  // Product name
  const titleEl = document.querySelector('.pdp-product-name, .pdp-name');
  if (titleEl) details.productName = titleEl.innerText.trim();

  // Price
  const priceEl = document.querySelector('.pdp-price strong, .pdp-price');
  if (priceEl) {
    const priceText = priceEl.innerText.replace(/[^\d]/g, '');
    details.amount = parseFloat(priceText) || 0;
  }
}

/**
 * Extract Swiggy order details
 */
function extractSwiggyDetails(details) {
  // Total from cart
  const totalEl = document.querySelector('[data-testid="total-amount"], .total-amount');
  if (totalEl) {
    const priceText = totalEl.innerText.replace(/[^\d]/g, '');
    details.amount = parseFloat(priceText) || 0;
  }

  // Restaurant name
  const restaurantEl = document.querySelector('.restaurant-name, [data-testid="restaurant-name"]');
  if (restaurantEl) details.productName = restaurantEl.innerText.trim();
}

/**
 * Extract Zomato order details
 */
function extractZomatoDetails(details) {
  // Total from cart
  const totalEl = document.querySelector('.total, [data-testid="total"]');
  if (totalEl) {
    const priceText = totalEl.innerText.replace(/[^\d]/g, '');
    details.amount = parseFloat(priceText) || 0;
  }
}

/**
 * Generic order detail extraction
 */
function extractGenericDetails(details) {
  // Look for price patterns
  const pricePatterns = [
    /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/,
    /INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)/,
    /\$\s*(\d+(?:,\d+)*(?:\.\d{2})?)/
  ];

  const pageText = document.body.innerText;
  for (const pattern of pricePatterns) {
    const match = pageText.match(pattern);
    if (match) {
      details.amount = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Try to get product name from title or h1
  const titleEl = document.querySelector('h1, .product-title, .title');
  if (titleEl) details.productName = titleEl.innerText.trim();
}

/**
 * Show spending intervention overlay
 */
function showSpendingIntervention(analysis, buttonElement) {
  const overlay = document.createElement('div');
  overlay.className = 'finsphere-overlay';
  
  const riskColor = analysis.riskLevel === 'high' ? '#ef4444' : 
                   analysis.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';
  
  overlay.innerHTML = `
    <div class="finsphere-card" style="border-left: 4px solid ${riskColor}">
      <div class="finsphere-title">🚨 Spending Alert</div>
      <div class="finsphere-message">
        <strong>Order: ₹${analysis.orderDetails.amount} - ${analysis.orderDetails.productName}</strong>
      </div>
      
      <div class="finsphere-analysis" style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1e293b;">Analysis:</h4>
        ${analysis.reasons.map(reason => `<div style="margin: 5px 0;">• ${reason}</div>`).join('')}
        
        <div style="margin-top: 15px;">
          <strong>Risk Level: ${analysis.riskLevel.toUpperCase()}</strong>
        </div>
      </div>

      ${analysis.recommendations.length > 0 ? `
        <div class="finsphere-recommendations" style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e293b;">Recommendations:</h4>
          ${analysis.recommendations.map(rec => `<div style="margin: 5px 0;">💡 ${rec}</div>`).join('')}
        </div>
      ` : ''}
      
      <div class="finsphere-actions">
        <button class="finsphere-btn finsphere-btn-secondary" id="fs-cancel">Cancel Purchase</button>
        <button class="finsphere-btn finsphere-btn-primary" id="fs-proceed">Continue Anyway</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Event handlers
  document.getElementById('fs-cancel').addEventListener('click', () => {
    logInterventionAccepted('cancelled', true);
    overlay.remove();
    console.log('Purchase cancelled by user');
  });

  document.getElementById('fs-proceed').addEventListener('click', () => {
    logInterventionAccepted('proceeded', false);
    overlay.remove();
    // Trigger original button click
    buttonElement.click();
  });
}
