// content.js
// Initialize FinSphere AI Extension
initializeFinSphere();

/**
 * Initialize FinSphere with enhanced AI tracking
 */
function initializeFinSphere() {
  console.log('🚀 FinSphere AI Extension Initialized');
  
  // Set page start time for behavior tracking
  window.finSpherePageStartTime = Date.now();
  window.finSphereClickHistory = [];
  window.finSphereScrollData = { totalScroll: 0, scrollEvents: 0, lastScrollY: 0 };
  
  // Set up buy button monitoring immediately
  setupBuyButtonMonitoring();
  
  // Set up behavior tracking
  setupBehaviorTracking();
  
  console.log('✅ All FinSphere systems active');
}

/**
 * Set up user behavior tracking for AI analysis
 */
function setupBehaviorTracking() {
  // Track clicks for rapid clicking detection
  document.addEventListener('click', function(event) {
    window.finSphereClickHistory = window.finSphereClickHistory || [];
    window.finSphereClickHistory.push(Date.now());
    
    // Keep only last 10 clicks
    if (window.finSphereClickHistory.length > 10) {
      window.finSphereClickHistory.shift();
    }
  });
  
  // Track scroll behavior for stress analysis
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - window.finSphereScrollData.lastScrollY);
    
    window.finSphereScrollData.totalScroll += scrollDelta;
    window.finSphereScrollData.scrollEvents += 1;
    window.finSphereScrollData.lastScrollY = currentScrollY;
    
    // Debounced scroll end detection
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Scroll ended - could analyze scroll patterns here
    }, 150);
  }, { passive: true }); // Passive for better performance
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // Page became hidden
      console.log('📱 Page hidden - user may be multitasking');
    } else {
      // Page became visible
      console.log('👀 Page visible - user returned');
    }
  });
}

// Store site configuration globally
window.finSphereSiteConfig = null;

// Message listener for background script communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.action || request.type) {
      case 'showIntervention':
        showIntervention(request.data);
        sendResponse({ success: true });
        break;
        
      case 'analyzePageContent':
        const analysis = analyzePageContent(request.type);
        sendResponse({ hasContent: true, ...analysis });
        break;
        
      case 'extractOrderDetails':
        const orderDetails = extractOrderDetails();
        sendResponse({ orderDetails });
        break;
        
      case 'siteConfigUpdate':
        console.log('🌐 Received site configuration update:', request.config);
        window.finSphereSiteConfig = request.config;
        // Re-initialize with new configuration
        setupEnhancedBuyButtonMonitoring();
        sendResponse({ success: true });
        break;
        
      default:
        console.log('Unknown message:', request);
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error in content script message handler:', error);
    sendResponse({ error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

/**
 * Set up monitoring for buy button clicks with site-specific selectors
 */
function setupBuyButtonMonitoring() {
  // Request site configuration from background script
  chrome.runtime.sendMessage({
    type: 'getSiteConfig',
    url: window.location.href
  }, (response) => {
    if (response && response.isShoppingSite) {
      console.log('🛒 Shopping site detected:', response.siteName);
      window.finSphereSiteConfig = response;
      setupEnhancedBuyButtonMonitoring();
    } else {
      // Fallback to generic monitoring
      setupGenericBuyButtonMonitoring();
    }
  });
}

/**
 * Enhanced buy button monitoring with site-specific selectors
 */
function setupEnhancedBuyButtonMonitoring() {
  if (!window.finSphereSiteConfig) {
    console.warn('No site configuration available');
    return;
  }
  
  const config = window.finSphereSiteConfig;
  console.log('🔧 Setting up enhanced monitoring for:', config.siteName);
  
  // Combine all button types for monitoring
  const allSelectors = [
    ...(config.selectors.buyNow || []),
    ...(config.selectors.addToCart || []),
    ...(config.selectors.checkout || [])
  ];

  // Set up monitoring for existing and future buttons
  function attachListeners() {
    allSelectors.forEach(selector => {
      try {
        // Handle :contains selectors
        if (selector.includes(':contains')) {
          const [baseSelector, text] = selector.split(':contains');
          const elements = document.querySelectorAll(baseSelector || '*');
          elements.forEach(el => {
            if (el.textContent.toLowerCase().includes(text.replace(/[()"]/g, '').toLowerCase())) {
              attachPurchaseListener(el, 'buy', selector);
            }
          });
        } else {
          // Standard CSS selector
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => attachPurchaseListener(el, 'buy', selector));
        }
      } catch (error) {
        console.warn('Invalid selector:', selector, error);
      }
    });
  }
  
  // Initial attachment
  attachListeners();
  
  // Monitor for dynamically added buttons
  const observer = new MutationObserver(() => {
    attachListeners();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ Enhanced button monitoring active for', config.siteName);
}

/**
 * Fallback generic buy button monitoring
 */
function setupGenericBuyButtonMonitoring() {
  // Generic buy button selectors
  const genericBuyButtonSelectors = [
    // Common patterns
    'button:contains("Buy")', 'button:contains("BUY")',
    'button:contains("Add to Cart")', 'button:contains("ADD TO CART")',
    'button:contains("Checkout")', 'button:contains("Place Order")',
    '.buy-now', '.add-to-cart', '.checkout', '.buy-button',
    '[data-testid*="buy"]', '[data-testid*="cart"]', '[data-testid*="checkout"]',
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

  console.log('🛒 FinSphere: AI-powered buy button monitoring active');
  
  // Inject enhanced CSS for better intervention UI
  injectEnhancedCSS();
}

/**
 * Inject enhanced CSS for AI intervention UI
 */
function injectEnhancedCSS() {
  if (document.querySelector('#finsphere-ai-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'finsphere-ai-styles';
  style.textContent = `
    .finsphere-ai-intervention {
      backdrop-filter: blur(8px);
      animation: fadeInScale 0.3s ease-out;
    }
    
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .finsphere-card {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95);
    }
    
    .finsphere-btn {
      transition: all 0.2s ease;
      font-weight: 500;
    }
    
    .finsphere-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .finsphere-btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    .finsphere-btn-secondary {
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Handle buy button click - extract order details and check for overspending
 * Non-blocking analysis that preserves page functionality
 */
async function handleBuyButtonClick(buttonElement) {
  try {
    console.log('Buy button clicked, starting intelligent analysis...');
    
    // Show immediate loading indicator
    const originalText = buttonElement.innerText;
    buttonElement.innerHTML = '🧠 Analyzing... ' + originalText;
    buttonElement.disabled = true;
    
    // Extract comprehensive order and user context
    const orderDetails = extractOrderDetails();
    const pageContext = extractPageContext();
    const userBehaviorSignals = detectUserBehaviorSignals();
    
    console.log('Comprehensive analysis data:', {
      orderDetails,
      pageContext,
      userBehaviorSignals
    });

    // Send to background script for Ollama-powered analysis
    chrome.runtime.sendMessage({
      action: 'analyzeWithOllama',
      data: {
        orderDetails,
        pageContext,
        userBehaviorSignals,
        url: window.location.href,
        timestamp: Date.now()
      }
    }, (response) => {
      // Restore button immediately
      buttonElement.innerHTML = originalText;
      buttonElement.disabled = false;
      
      if (chrome.runtime.lastError) {
        console.warn('Analysis failed:', chrome.runtime.lastError);
        // Allow purchase to continue if analysis fails
        proceedWithPurchase(buttonElement);
        return;
      }

      if (response && response.shouldIntervene) {
        // Show intelligent intervention with Ollama insights
        showIntelligentIntervention(response, buttonElement);
      } else {
        // Safe to proceed with purchase
        console.log('✅ Purchase approved by AI analysis');
        proceedWithPurchase(buttonElement);
      }
    });

  } catch (error) {
    console.error('Error in AI analysis:', error);
    // Restore button and allow purchase on error
    buttonElement.innerHTML = buttonElement.dataset.originalText || 'Buy Now';
    buttonElement.disabled = false;
    proceedWithPurchase(buttonElement);
  }
}

/**
 * Extract comprehensive page context for AI analysis
 */
function extractPageContext() {
  const context = {
    urgencySignals: [],
    discountSignals: [],
    emotionalTriggers: [],
    pageType: 'unknown',
    scrollBehavior: getScrollBehavior(),
    timeOnPage: getTimeOnPage()
  };
  
  const pageText = document.body.innerText.toLowerCase();
  const htmlContent = document.documentElement.innerHTML.toLowerCase();
  const combinedText = pageText + ' ' + htmlContent;
  
  // Detect urgency signals
  const urgencyPatterns = [
    'limited stock', 'only.*left', 'hurry', 'today only', 'flash sale',
    'limited time', 'expires', 'countdown', 'urgent', 'last chance',
    'while supplies last', 'act fast', 'don\'t miss out'
  ];
  
  context.urgencySignals = urgencyPatterns.filter(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(combinedText);
  });
  
  // Detect discount signals
  const discountPatterns = [
    '\d+%\s*off', 'discount', 'deal of the day', 'save ₹', 'free shipping',
    'coupon', 'promo code', 'special offer', 'clearance', 'sale'
  ];
  
  context.discountSignals = discountPatterns.filter(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(combinedText);
  });
  
  // Detect emotional triggers
  const emotionalPatterns = [
    'best seller', '#1 choice', 'trending', 'popular', 'exclusive',
    'limited edition', 'premium', 'luxury', 'must have', 'essential'
  ];
  
  context.emotionalTriggers = emotionalPatterns.filter(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(combinedText);
  });
  
  // Determine page type
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('amazon') || hostname.includes('flipkart')) {
    context.pageType = 'ecommerce';
  } else if (hostname.includes('swiggy') || hostname.includes('zomato')) {
    context.pageType = 'food_delivery';
  } else if (hostname.includes('myntra') || hostname.includes('ajio')) {
    context.pageType = 'fashion';
  } else if (hostname.includes('upwork') || hostname.includes('freelancer')) {
    context.pageType = 'freelance';
  }
  
  return context;
}

/**
 * Detect user behavior signals for AI analysis
 */
function detectUserBehaviorSignals() {
  const signals = {
    rapidClicking: false,
    multipleTabsOpen: false,
    quickDecision: false,
    stressIndicators: [],
    sessionLength: getTimeOnPage()
  };
  
  // Check for rapid clicking behavior
  const clickHistory = window.finSphereClickHistory || [];
  const recentClicks = clickHistory.filter(time => Date.now() - time < 5000);
  signals.rapidClicking = recentClicks.length > 5;
  
  // Quick decision indicator (less than 30 seconds on page)
  signals.quickDecision = getTimeOnPage() < 30000;
  
  // Detect stress indicators from user interaction patterns
  if (signals.rapidClicking && signals.quickDecision) {
    signals.stressIndicators.push('impulsive_behavior');
  }
  
  if (context.urgencySignals.length > 2) {
    signals.stressIndicators.push('urgency_pressure');
  }
  
  return signals;
}

/**
 * Get scroll behavior metrics
 */
function getScrollBehavior() {
  const scrollData = window.finSphereScrollData || { totalScroll: 0, scrollEvents: 0 };
  return {
    totalScrollDistance: scrollData.totalScroll,
    scrollEvents: scrollData.scrollEvents,
    averageScrollSpeed: scrollData.scrollEvents > 0 ? scrollData.totalScroll / scrollData.scrollEvents : 0
  };
}

/**
 * Get time spent on current page
 */
function getTimeOnPage() {
  const startTime = window.finSpherePageStartTime || Date.now();
  return Date.now() - startTime;
}

/**
 * Proceed with purchase (simulate original button click)
 */
function proceedWithPurchase(buttonElement) {
  // Remove our event listener temporarily
  const newButton = buttonElement.cloneNode(true);
  buttonElement.parentNode.replaceChild(newButton, buttonElement);
  
  // Trigger the original purchase flow
  setTimeout(() => {
    newButton.click();
  }, 100);
}

/**
 * Extract comprehensive order details from various e-commerce sites
 * Enhanced for AI analysis with additional context
 */
function extractOrderDetails() {
  const details = {
    amount: 0,
    currency: 'INR',
    productName: '',
    category: '',
    merchant: '',
    quantity: 1,
    // Enhanced fields for AI analysis
    originalPrice: 0,
    discountAmount: 0,
    discountPercentage: 0,
    deliveryFee: 0,
    totalSavings: 0,
    productRating: 0,
    reviewCount: 0,
    availability: 'in_stock',
    urgencyIndicators: []
  };

  // Get merchant from URL
  const hostname = window.location.hostname.toLowerCase();
  
  try {
    if (hostname.includes('amazon')) {
      details.merchant = 'Amazon';
      details.category = extractAmazonDetailsEnhanced(details);
    } else if (hostname.includes('flipkart')) {
      details.merchant = 'Flipkart';
      details.category = extractFlipkartDetailsEnhanced(details);
    } else if (hostname.includes('myntra')) {
      details.merchant = 'Myntra';
      details.category = 'Fashion';
      extractMyntraDetailsEnhanced(details);
    } else if (hostname.includes('swiggy')) {
      details.merchant = 'Swiggy';
      details.category = 'Food';
      extractSwiggyDetailsEnhanced(details);
    } else if (hostname.includes('zomato')) {
      details.merchant = 'Zomato';
      details.category = 'Food';
      extractZomatoDetailsEnhanced(details);
    } else {
      details.merchant = hostname;
      extractGenericDetailsEnhanced(details);
    }
    
    // Calculate discount percentage if not already set
    if (details.originalPrice > 0 && details.amount > 0 && details.discountPercentage === 0) {
      details.discountPercentage = Math.round(((details.originalPrice - details.amount) / details.originalPrice) * 100);
      details.discountAmount = details.originalPrice - details.amount;
    }
    
  } catch (error) {
    console.warn('Error extracting order details:', error);
    // Fallback to basic extraction
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

function logInterventionAccepted(action, accepted, analysisData = null) {
  // Send comprehensive log to background script
  try {
    chrome.runtime.sendMessage({
      action: 'recordAIIntervention',
      data: {
        url: window.location.href,
        intervention_action: action,
        accepted: accepted,
        timestamp: new Date().toISOString(),
        ai_analysis: analysisData ? {
          riskLevel: analysisData.riskLevel,
          confidence: analysisData.confidence,
          stressLevel: analysisData.stressLevel,
          budgetImpact: analysisData.budgetImpact,
          keyFactors: analysisData.keyFactors?.length || 0,
          aiInsights: analysisData.aiInsights ? 'provided' : 'none'
        } : null,
        page_context: {
          timeOnPage: getTimeOnPage(),
          scrollBehavior: getScrollBehavior(),
          pageType: extractPageContext().pageType
        }
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Could not log AI intervention:', chrome.runtime.lastError);
      } else {
        console.log('🤖 AI Intervention logged:', response);
      }
    });
  } catch (error) {
    console.warn('Could not log AI intervention:', error);
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
 * Enhanced Amazon order details extraction
 */
function extractAmazonDetailsEnhanced(details) {
  // Product name
  const titleEl = document.querySelector('#productTitle, .product-title');
  if (titleEl) details.productName = titleEl.innerText.trim();

  // Current price
  const priceSelectors = [
    '.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen',
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
  
  // Original price (before discount)
  const originalPriceEl = document.querySelector('.a-text-strike .a-offscreen, .a-price.a-text-strike .a-offscreen');
  if (originalPriceEl) {
    const originalPriceText = originalPriceEl.innerText.replace(/[^\d.]/g, '');
    details.originalPrice = parseFloat(originalPriceText) || 0;
  }
  
  // Product rating
  const ratingEl = document.querySelector('.a-icon-alt, [data-hook="average-star-rating"] .a-icon-alt');
  if (ratingEl) {
    const ratingMatch = ratingEl.innerText.match(/(\d\.\d)/);
    if (ratingMatch) details.productRating = parseFloat(ratingMatch[1]);
  }
  
  // Review count
  const reviewEl = document.querySelector('#acrCustomerReviewText, [data-hook="total-review-count"]');
  if (reviewEl) {
    const reviewMatch = reviewEl.innerText.match(/([\d,]+)/);
    if (reviewMatch) details.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
  }
  
  // Stock availability
  const stockEl = document.querySelector('#availability span, .a-color-success, .a-color-state');
  if (stockEl) {
    const stockText = stockEl.innerText.toLowerCase();
    if (stockText.includes('only') && stockText.includes('left')) {
      details.availability = 'limited_stock';
      details.urgencyIndicators.push('limited_stock');
    } else if (stockText.includes('out of stock')) {
      details.availability = 'out_of_stock';
    }
  }
  
  // Lightning deal / limited time offer
  const dealEl = document.querySelector('.a-badge-text, .a-color-price');
  if (dealEl && dealEl.innerText.toLowerCase().includes('limited time')) {
    details.urgencyIndicators.push('limited_time_deal');
  }

  // Category from breadcrumbs
  const breadcrumbEl = document.querySelector('#wayfinding-breadcrumbs_container');
  if (breadcrumbEl) {
    const breadcrumbs = breadcrumbEl.innerText;
    if (breadcrumbs.includes('Electronics')) return 'Electronics';
    if (breadcrumbs.includes('Clothing')) return 'Fashion';
    if (breadcrumbs.includes('Books')) return 'Books';
    if (breadcrumbs.includes('Home')) return 'Home & Garden';
    if (breadcrumbs.includes('Sports')) return 'Sports';
  }

  return 'General';
}

/**
 * Enhanced Flipkart order details extraction
 */
function extractFlipkartDetailsEnhanced(details) {
  // Product name
  const titleEl = document.querySelector('.B_NuCI, ._35KyD6, .yhB1nd');
  if (titleEl) details.productName = titleEl.innerText.trim();

  // Current price
  const priceEl = document.querySelector('._30jeq3._16Jk6d, ._3I9_wc._2p6lqe, ._1_WHN1');
  if (priceEl) {
    const priceText = priceEl.innerText.replace(/[^\d]/g, '');
    details.amount = parseFloat(priceText) || 0;
  }
  
  // Original price
  const originalPriceEl = document.querySelector('._3I9_wc._27UcVY, ._2MRP4d');
  if (originalPriceEl) {
    const originalPriceText = originalPriceEl.innerText.replace(/[^\d]/g, '');
    details.originalPrice = parseFloat(originalPriceText) || 0;
  }
  
  // Discount percentage
  const discountEl = document.querySelector('._3Ay6Sb._31Dcoz, ._3xgqrA');
  if (discountEl) {
    const discountMatch = discountEl.innerText.match(/(\d+)%/);
    if (discountMatch) details.discountPercentage = parseInt(discountMatch[1]);
  }
  
  // Product rating
  const ratingEl = document.querySelector('._3LWZlK, ._1lRcqv');
  if (ratingEl) {
    const ratingText = ratingEl.innerText.trim();
    details.productRating = parseFloat(ratingText) || 0;
  }
  
  // Review count
  const reviewEl = document.querySelector('._2_R_DZ, ._13vcmD');
  if (reviewEl) {
    const reviewMatch = reviewEl.innerText.match(/([\d,]+)/);
    if (reviewMatch) details.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
  }
  
  // Check for Flipkart Plus or special offers
  const offerEl = document.querySelector('._16au11, ._1UhVsV');
  if (offerEl && offerEl.innerText.toLowerCase().includes('limited')) {
    details.urgencyIndicators.push('limited_time_offer');
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
 * Enhanced generic order detail extraction
 */
function extractGenericDetailsEnhanced(details) {
  // Look for comprehensive price patterns
  const pricePatterns = [
    /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g,
    /INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g,
    /\$\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g,
    /price[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi,
    /cost[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi
  ];

  const pageText = document.body.innerText;
  const prices = [];
  
  // Collect all prices found
  for (const pattern of pricePatterns) {
    let match;
    while ((match = pattern.exec(pageText)) !== null) {
      prices.push(parseFloat(match[1].replace(/,/g, '')));
    }
  }
  
  // Use the highest price as likely product price
  if (prices.length > 0) {
    details.amount = Math.max(...prices);
    
    // If multiple prices, second highest might be original price
    const sortedPrices = prices.sort((a, b) => b - a);
    if (sortedPrices.length > 1 && sortedPrices[0] < sortedPrices[1]) {
      details.originalPrice = sortedPrices[1];
    }
  }

  // Try to get product name from multiple sources
  const titleSelectors = [
    'h1', '.product-title', '.title', '.product-name',
    '[data-testid="product-title"]', '.item-title'
  ];
  
  for (const selector of titleSelectors) {
    const titleEl = document.querySelector(selector);
    if (titleEl && titleEl.innerText.trim()) {
      details.productName = titleEl.innerText.trim();
      break;
    }
  }
  
  // Look for urgency indicators in page content
  const urgencyTexts = pageText.toLowerCase();
  if (urgencyTexts.includes('limited stock') || urgencyTexts.includes('only') && urgencyTexts.includes('left')) {
    details.urgencyIndicators.push('limited_stock');
  }
  if (urgencyTexts.includes('flash sale') || urgencyTexts.includes('limited time')) {
    details.urgencyIndicators.push('limited_time_offer');
  }
}

// Placeholder functions for other enhanced extractors
function extractMyntraDetailsEnhanced(details) {
  extractMyntraDetails(details); // Use existing for now
}

function extractSwiggyDetailsEnhanced(details) {
  extractSwiggyDetails(details); // Use existing for now
}

function extractZomatoDetailsEnhanced(details) {
  extractZomatoDetails(details); // Use existing for now
}

/**
 * Show intelligent intervention with AI-powered insights
 */
function showIntelligentIntervention(analysis, buttonElement) {
  const overlay = document.createElement('div');
  overlay.className = 'finsphere-overlay finsphere-ai-intervention';
  
  const riskColor = analysis.riskLevel === 'high' ? '#ef4444' : 
                   analysis.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';
  
  const riskEmoji = analysis.riskLevel === 'high' ? '🚨' : 
                   analysis.riskLevel === 'medium' ? '⚠️' : '💡';
  
  overlay.innerHTML = `
    <div class="finsphere-card" style="border-left: 4px solid ${riskColor}; max-width: 500px; position: relative;">
      <div class="finsphere-title">
        ${riskEmoji} AI Financial Coach
        <div style="position: absolute; top: 10px; right: 10px; background: #f1f5f9; padding: 4px 8px; border-radius: 12px; font-size: 11px; color: #64748b;">
          Powered by Ollama GPT-OSS
        </div>
      </div>
      
      <div class="finsphere-message" style="margin-bottom: 20px;">
        <strong style="color: ${riskColor};">Analysis for: ₹${analysis.orderDetails.amount} - ${analysis.orderDetails.productName}</strong>
      </div>
      
      <!-- AI Analysis Section -->
      <div class="finsphere-ai-analysis" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 20px; border-radius: 12px; margin: 15px 0; border: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="width: 32px; height: 32px; background: ${riskColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 12px;">
            AI
          </div>
          <div>
            <h4 style="margin: 0; color: #1e293b;">Intelligent Analysis</h4>
            <div style="font-size: 12px; color: #64748b;">Based on your biometrics, spending patterns, and market conditions</div>
          </div>
        </div>
        
        ${analysis.aiInsights ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 3px solid ${riskColor};">
            <div style="font-weight: 500; margin-bottom: 8px; color: #1e293b;">🤖 AI Reasoning:</div>
            <div style="line-height: 1.5; color: #374151;">${analysis.aiInsights}</div>
          </div>
        ` : ''}
        
        <!-- Risk Factors -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
          <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">STRESS LEVEL</div>
            <div style="font-weight: bold; color: ${analysis.stressLevel > 7 ? '#ef4444' : analysis.stressLevel > 4 ? '#f59e0b' : '#22c55e'};">
              ${analysis.stressLevel}/10
            </div>
          </div>
          <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">BUDGET IMPACT</div>
            <div style="font-weight: bold; color: ${analysis.budgetImpact > 20 ? '#ef4444' : analysis.budgetImpact > 10 ? '#f59e0b' : '#22c55e'};">
              ${analysis.budgetImpact}%
            </div>
          </div>
        </div>
        
        <!-- Key Factors -->
        ${analysis.keyFactors && analysis.keyFactors.length > 0 ? `
          <div style="margin: 15px 0;">
            <div style="font-weight: 500; margin-bottom: 8px; color: #1e293b;">🎯 Key Factors:</div>
            ${analysis.keyFactors.map(factor => `
              <div style="display: flex; align-items: center; margin: 6px 0; font-size: 14px;">
                <span style="margin-right: 8px;">${factor.type === 'warning' ? '⚠️' : factor.type === 'positive' ? '✅' : '📊'}</span>
                <span style="color: #374151;">${factor.message}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Smart Recommendations -->
      ${analysis.smartRecommendations && analysis.smartRecommendations.length > 0 ? `
        <div class="finsphere-recommendations" style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
          <h4 style="margin: 0 0 10px 0; color: #166534; display: flex; align-items: center;">
            🎯 Smart Recommendations
          </h4>
          ${analysis.smartRecommendations.map(rec => `
            <div style="margin: 8px 0; display: flex; align-items: start;">
              <span style="margin-right: 8px; margin-top: 2px;">💡</span>
              <span style="color: #166534; line-height: 1.4;">${rec}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <!-- Investment Recommendation -->
      ${analysis.investmentRecommendation ? `
        <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5016 100%); color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4 style="margin: 0 0 10px 0; display: flex; align-items: center;">
            💰 Investment Insight
          </h4>
          <p style="margin: 0 0 10px 0; font-size: 13px; opacity: 0.9;">Based on your profile and current market conditions</p>
          
          <div style="background: rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; margin: 10px 0;">
            <div style="font-size: 13px; margin: 5px 0;"><strong>Recommended Monthly SIP:</strong> ₹${analysis.investmentRecommendation.monthly_sip_amount?.toLocaleString() || '5,000'}</div>
            <div style="font-size: 13px; margin: 5px 0;"><strong>Market Context:</strong> ${analysis.investmentRecommendation.market_context || 'Moderate market conditions'}</div>
          </div>
          
          ${analysis.investmentRecommendation.recommended_allocation ? `
            <div style="margin: 10px 0;">
              <div style="font-size: 13px; margin-bottom: 5px;"><strong>Portfolio Allocation:</strong></div>
              ${Object.entries(analysis.investmentRecommendation.recommended_allocation).map(([asset, percentage]) => `
                <div style="display: flex; align-items: center; margin: 4px 0; font-size: 12px;">
                  <span style="width: 50px;">${asset}:</span>
                  <div style="flex: 1; background: rgba(255,255,255,0.2); border-radius: 10px; height: 16px; margin: 0 8px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #4ade80, #22c55e); width: ${percentage * 100}%; height: 100%; border-radius: 10px;"></div>
                    <span style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); font-size: 10px; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.5);">${(percentage * 100).toFixed(0)}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${analysis.investmentRecommendation.warnings?.length > 0 ? `
            <div style="margin: 10px 0; font-size: 12px;">
              ${analysis.investmentRecommendation.warnings.slice(0, 2).map(warning => `
                <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 4px; padding: 6px; margin: 4px 0;">${warning}</div>
              `).join('')}
            </div>
          ` : ''}
          
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button style="flex: 1; background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 12px;" 
                    onclick="window.open('http://localhost:3000/dashboard', '_blank')">
              View Portfolio
            </button>
            <button style="flex: 1; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px; border-radius: 4px; cursor: pointer; font-size: 12px;" 
                    onclick="window.open('http://localhost:3000/investment/sip', '_blank')">
              Start SIP
            </button>
          </div>
        </div>
      ` : ''}
      
      <!-- Alternative Options -->
      ${analysis.alternatives && analysis.alternatives.length > 0 ? `
        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bfdbfe;">
          <h4 style="margin: 0 0 10px 0; color: #1d4ed8;">🔄 Consider These Alternatives:</h4>
          ${analysis.alternatives.map(alt => `
            <div style="margin: 6px 0; color: #1e40af; cursor: pointer; text-decoration: underline;" 
                 onclick="window.open('${alt.link}', '_blank')">
              ${alt.title} - ${alt.savings ? 'Save ' + alt.savings : 'Better option'}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="finsphere-actions" style="display: flex; gap: 10px; margin-top: 20px;">
        <button class="finsphere-btn finsphere-btn-secondary" id="fs-cancel" style="flex: 1;">
          ${analysis.riskLevel === 'high' ? '🛑 Stop Purchase' : '⏸️ Wait & Think'}
        </button>
        <button class="finsphere-btn finsphere-btn-primary" id="fs-proceed" style="flex: 1;">
          ${analysis.riskLevel === 'high' ? '⚠️ Buy Anyway' : '✅ Continue'}
        </button>
      </div>
      
      <!-- Confidence Score -->
      <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        AI Confidence: <strong>${analysis.confidence || 85}%</strong> | 
        Analysis Time: <strong>${analysis.analysisTime || '<1s'}</strong>
      </div>
    </div>
  `;

  // Add smooth animation
  overlay.style.opacity = '0';
  overlay.style.transform = 'scale(0.9)';
  overlay.style.transition = 'all 0.3s ease';
  
  document.body.appendChild(overlay);
  
  // Animate in
  setTimeout(() => {
    overlay.style.opacity = '1';
    overlay.style.transform = 'scale(1)';
  }, 10);

  // Event handlers
  document.getElementById('fs-cancel').addEventListener('click', () => {
    logInterventionAccepted('ai_cancelled', true, analysis);
    animateOut(overlay);
    console.log('💰 Purchase cancelled by AI recommendation');
  });

  document.getElementById('fs-proceed').addEventListener('click', () => {
    logInterventionAccepted('ai_proceeded', false, analysis);
    animateOut(overlay);
    // Proceed with purchase after brief delay
    setTimeout(() => proceedWithPurchase(buttonElement), 300);
  });
  
  // Auto-close for low risk after 10 seconds
  if (analysis.riskLevel === 'low') {
    setTimeout(() => {
      if (document.contains(overlay)) {
        logInterventionAccepted('ai_auto_proceed', false, analysis);
        animateOut(overlay);
        proceedWithPurchase(buttonElement);
      }
    }, 10000);
  }
}

/**
 * Animate overlay out
 */
function animateOut(overlay) {
  overlay.style.opacity = '0';
  overlay.style.transform = 'scale(0.9)';
  setTimeout(() => {
    if (document.contains(overlay)) {
      overlay.remove();
    }
  }, 300);
}
