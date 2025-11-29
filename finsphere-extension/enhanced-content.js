// Enhanced FinSphere Content Script with Universal E-commerce Integration
console.log('🚀 Loading Enhanced FinSphere Universal E-commerce Integration...');

// Global configuration
window.finSphereSiteConfig = null;
window.finSphereEnhanced = {
  isActive: true,
  currentSite: '',
  selectors: {},
  monitoring: false,
  debugMode: true // Enable debug mode
};

// Debug function - Always active for now
function debugLog(message, data = null) {
  console.log(`🔧 [FinSphere Debug] ${message}`, data || '');
}

// Helper function to format amount with commas
function formatAmount(amount) {
  if (!amount || amount === 0 || isNaN(amount)) return '0';
  return parseFloat(amount).toLocaleString('en-IN');
}

// Universal E-commerce Site Detection and Configuration
const UNIVERSAL_SITE_CONFIGS = {
  // Amazon variations
  'amazon': {
    patterns: ['amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.de', 'amazon.fr'],
    selectors: {
      buyNow: [
        '#buy-now-button', 
        '#submit.buy-now-button',
        'input[name="submit.buy-now"]',
        '#buyNow_feature_div input',
        '.a-button-input[name*="buy-now"]',
        '#turbo-checkout-pyo-button'
      ],
      addToCart: [
        '#add-to-cart-button', 
        '#submit.add-to-cart-button',
        'input[name="submit.add-to-cart"]',
        '#add-to-cart-button-ubb',
        '.a-button-input[name*="add-to-cart"]'
      ],
      checkout: [
        '#sc-buy-box-ptc-button',
        'input[name="proceedToRetailCheckout"]',
        '#hlb-ptc-btn',
        '.proceed-to-checkout-button'
      ],
      price: ['.a-price-whole', '.a-price .a-offscreen', '.a-color-price', '#priceblock_ourprice', '#priceblock_dealprice'],
      title: ['#productTitle', '#title', 'h1 span#productTitle'],
      category: ['#nav-subnav', '.a-breadcrumb a']
    }
  },
  
  // Flipkart
  'flipkart': {
    patterns: ['flipkart.com'],
    selectors: {
      buyNow: ['._2KpZ6l._2U9uOA._3v1-ww', '.btn-orange:contains("Buy Now")', 'button:contains("BUY NOW")'],
      addToCart: ['._2KpZ6l._2U9uOA._3v1-ww:contains("ADD TO CART")', '.btn-orange:contains("Add to Cart")'],
      checkout: ['._2AkmmA._29YdH8', '.checkout-button', 'button:contains("PLACE ORDER")'],
      price: ['._30jeq3', '._1_WHN1', '.selling-price'],
      title: ['.B_NuCI', '._35KyD6', '.product-title', 'h1'],
      category: ['._1QZ6fC a', '.breadcrumb a']
    }
  },
  
  // Fashion Sites (Myntra, Ajio, etc.)
  'myntra': {
    patterns: ['myntra.com'],
    selectors: {
      buyNow: ['.pdp-add-to-bag', '.product-actionsButton', 'button:contains("ADD TO BAG")'],
      addToCart: ['.pdp-add-to-bag', '.product-actionsButton:contains("ADD TO BAG")'],
      checkout: ['.checkout-button', 'button:contains("PLACE ORDER")'],
      price: ['.pdp-price', '.product-price', '.price-current'],
      title: ['.pdp-name', 'h1', '.product-name'],
      category: ['.breadcrumb a']
    }
  },
  
  'ajio': {
    patterns: ['ajio.com'],
    selectors: {
      buyNow: ['.btn-gold', '.pdp-add-to-bag-btn', 'button:contains("ADD TO BAG")'],
      addToCart: ['.pdp-add-to-bag-btn', '.btn-gold:contains("ADD TO BAG")'],
      checkout: ['.checkout-btn', 'button:contains("PLACE ORDER")'],
      price: ['.price-current', '.prod-price'],
      title: ['.prod-name', 'h1', '.product-title'],
      category: ['.breadcrumb a']
    }
  },
  
  // Food Delivery
  'swiggy': {
    patterns: ['swiggy.com'],
    selectors: {
      buyNow: ['.AddToCart_addToCartButton__3j0i5', 'button:contains("ADD")', '._3v5cC'],
      addToCart: ['.AddToCart_addToCartButton__3j0i5', 'button:contains("ADD TO CART")'],
      checkout: ['.place-order-button', 'button:contains("PLACE ORDER")', '._3uCc3'],
      price: ['.bill-total', '.total-amount', '.order-total'],
      title: ['.restaurant-name', 'h1', '.rest-name'],
      category: ['.category']
    }
  },
  
  'zomato': {
    patterns: ['zomato.com'],
    selectors: {
      buyNow: ['button:contains("Add")', '.sc-1s0saks-0', '[data-testid="add-button"]'],
      addToCart: ['button:contains("Add item")', '.item-add-button'],
      checkout: ['button:contains("Place Order")', '.place-order-btn', '[data-testid="place-order"]'],
      price: ['.total-cost', '.bill-total', '.order-amount'],
      title: ['.restaurant-name', 'h1', '.res-name'],
      category: ['.cuisine']
    }
  },
  
  // Beauty & Cosmetics
  'nykaa': {
    patterns: ['nykaa.com'],
    selectors: {
      buyNow: ['.btn-section .nykaa-btn', 'button:contains("ADD TO BAG")', '.AddToBagButton'],
      addToCart: ['.AddToBagButton', '.btn-section .nykaa-btn:contains("ADD TO BAG")'],
      checkout: ['.checkout-button', 'button:contains("PLACE ORDER")'],
      price: ['.price', '.product-price', '.final-price'],
      title: ['.product-title', 'h1', '.prod-title'],
      category: ['.breadcrumb a']
    }
  },
  
  // Electronics & Gadgets
  'croma': {
    patterns: ['croma.com', 'cromaretail.com'],
    selectors: {
      buyNow: ['.add-to-cart', 'button:contains("ADD TO CART")', '.buy-now'],
      addToCart: ['.add-to-cart', 'button:contains("ADD TO CART")'],
      checkout: ['.checkout-btn', 'button:contains("CHECKOUT")'],
      price: ['.price-current', '.final-price'],
      title: ['h1', '.product-name', '.prod-title'],
      category: ['.breadcrumb a']
    }
  },
  
  // Furniture
  'pepperfry': {
    patterns: ['pepperfry.com'],
    selectors: {
      buyNow: ['.vip-cart-button', 'button:contains("BUY NOW")', '.btn-buy-now'],
      addToCart: ['.vip-cart-button:contains("ADD TO CART")', '.pf_btn_cart'],
      checkout: ['.checkout-btn', 'button:contains("PLACE ORDER")'],
      price: ['.pf_pdp_price', '.price-current'],
      title: ['.pf_pdp_pName', 'h1', '.product-name'],
      category: ['.breadcrumb a']
    }
  },
  
  // Generic fallback for unknown sites
  'generic': {
    patterns: ['*'],
    selectors: {
      buyNow: [
        'button:contains("Buy")', 'button:contains("BUY")', '.buy-now', '.buy-button',
        '[data-testid*="buy"]', 'input[value*="Buy"]', '.purchase-button'
      ],
      addToCart: [
        'button:contains("Add to Cart")', 'button:contains("ADD TO CART")', '.add-to-cart', '.cart-button',
        '[data-testid*="cart"]', 'input[value*="Add to Cart"]', '.add-cart-btn'
      ],
      checkout: [
        'button:contains("Checkout")', 'button:contains("Place Order")', '.checkout', '.place-order',
        '[data-testid*="checkout"]', 'input[value*="Checkout"]', '.proceed-checkout'
      ],
      price: ['.price', '.cost', '.amount', '[class*="price"]', '.selling-price', '.final-price'],
      title: ['h1', '.product-title', '.product-name', '.item-title', '[class*="title"]'],
      category: ['.breadcrumb a', '.category', '[class*="category"]']
    }
  }
};

/**
 * Detect current site and get configuration
 */
function detectSiteConfiguration() {
  const hostname = window.location.hostname.toLowerCase().replace('www.', '');
  
  debugLog('Detecting site configuration', {
    hostname,
    fullUrl: window.location.href,
    availableSites: Object.keys(UNIVERSAL_SITE_CONFIGS)
  });
  
  // Check each site configuration
  for (const [siteName, config] of Object.entries(UNIVERSAL_SITE_CONFIGS)) {
    if (siteName === 'generic') continue;
    
    for (const pattern of config.patterns) {
      if (hostname.includes(pattern.toLowerCase())) {
        debugLog(`✅ Site matched: ${siteName}`, {
          matchedPattern: pattern,
          hasSelectors: Object.keys(config.selectors).length,
          selectorTypes: Object.keys(config.selectors)
        });
        
        return {
          siteName: siteName,
          config: config,
          isShoppingSite: true,
          matchedPattern: pattern
        };
      }
    }
  }
  
  debugLog('⚠️ No specific site match found, using generic config');
  
  // Return generic configuration
  return {
    siteName: 'generic',
    config: UNIVERSAL_SITE_CONFIGS.generic,
    isShoppingSite: false
  };
}

/**
 * Enhanced purchase button monitoring with universal site support
 */
function initializeUniversalMonitoring() {
  debugLog('🚀 Starting universal monitoring initialization');
  window.finSpherePageStartTime = Date.now();
  
  // Always initialize regardless of extension status (for immediate testing)
  const siteInfo = detectSiteConfiguration();
  window.finSphereSiteConfig = siteInfo;
  window.finSphereEnhanced.currentSite = siteInfo.siteName;
  window.finSphereEnhanced.selectors = siteInfo.config.selectors;
  
  debugLog(`✅ FinSphere initialized for: ${siteInfo.siteName}`, siteInfo);
  
  // Start appropriate monitoring based on site type
  if (siteInfo.isShoppingSite) {
    debugLog('🛒 E-commerce site detected - enabling purchase monitoring');
    startPurchaseMonitoring();
  } else {
    debugLog('🌐 Generic site - checking for purchase patterns');
    // Only add fallback for generic sites
    startFallbackMonitoring();
  }
  
  // Check extension status asynchronously
  chrome.runtime.sendMessage({ type: 'getExtensionStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      debugLog('⚠️ Extension status check failed, but continuing with monitoring:', chrome.runtime.lastError);
      return;
    }
    
    debugLog('📊 Extension status:', response);
  });
  
  debugLog('🎯 Universal monitoring fully initialized');
}

/**
 * Start comprehensive purchase monitoring
 */
function startPurchaseMonitoring() {
  const config = window.finSphereEnhanced;
  if (config.monitoring) return;
  
  config.monitoring = true;
  debugLog('Starting purchase monitoring for site:', config.currentSite);
  
  // Direct approach - find and attach to specific elements
  function findAndAttachListeners() {
    const selectors = config.selectors;
    let totalFound = 0;
    
    // Check each button type
    ['buyNow', 'addToCart', 'checkout'].forEach(buttonType => {
      if (!selectors[buttonType]) return;
      
      selectors[buttonType].forEach(selector => {
        try {
          // Skip :contains selectors, handle them separately
          if (selector.includes(':contains')) return;
          
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (!element.dataset.finSphereMonitored) {
              attachDirectListener(element, buttonType, selector);
              totalFound++;
            }
          });
        } catch (e) {
          debugLog('Selector error:', { selector, error: e.message });
        }
      });
    });
    
    // Also search by button text for broader coverage
    const purchaseKeywords = ['buy now', 'add to cart', 'proceed to checkout', 'place order', 'checkout'];
    document.querySelectorAll('button, input[type="submit"], input[type="button"], a.a-button-text, span.a-button-text').forEach(element => {
      const text = (element.textContent || element.value || '').toLowerCase().trim();
      if (purchaseKeywords.some(keyword => text.includes(keyword))) {
        if (!element.dataset.finSphereMonitored) {
          const buttonType = text.includes('buy') ? 'buyNow' : 
                            text.includes('cart') ? 'addToCart' : 'checkout';
          attachDirectListener(element, buttonType, 'text-match');
          totalFound++;
        }
      }
    });
    
    if (totalFound > 0) {
      debugLog(`✅ Attached listeners to ${totalFound} purchase buttons`);
    }
    
    return totalFound;
  }
  
  // Attach listener directly to element
  function attachDirectListener(element, buttonType, selector) {
    element.dataset.finSphereMonitored = 'true';
    
    // Add visual indicator (subtle)
    element.style.outline = '2px solid rgba(16, 185, 129, 0.3)';
    
    element.addEventListener('click', function(event) {
      debugLog(`🛒 ${buttonType} button clicked!`, {
        text: element.textContent || element.value,
        selector: selector
      });
      handlePurchaseClick(event, element, buttonType, selector);
    }, { capture: true, once: false });
    
    debugLog(`Attached ${buttonType} listener to:`, element.textContent || element.value || selector);
  }
  
  // Initial scan
  setTimeout(findAndAttachListeners, 500);
  setTimeout(findAndAttachListeners, 1500);
  setTimeout(findAndAttachListeners, 3000);
  
  // Watch for dynamic content
  const observer = new MutationObserver(() => {
    findAndAttachListeners();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  debugLog('Purchase monitoring active with mutation observer');
}

/**
 * Fallback monitoring with common e-commerce button patterns
 */
function startFallbackMonitoring() {
  debugLog('Starting fallback monitoring with common patterns');
  
  // Common button text patterns across all sites
  const commonPatterns = [
    'buy now', 'add to cart', 'add to bag', 'purchase', 'checkout', 'proceed to checkout',
    'place order', 'continue', 'pay now', 'order now', 'get now', 'subscribe',
    'proceed to cart', 'buy', 'cart', 'bag', 'खरीदें', 'कार्ट में डालें',
    'proceed', 'confirm', 'complete order', 'finalize', 'submit order'
  ];
  
  let fallbackCount = 0;
  
  // Function to check and attach fallback listeners
  function attachFallbackListeners() {
    const clickableElements = document.querySelectorAll('button, a[href*="cart"], a[href*="buy"], input[type="button"], input[type="submit"], [role="button"]');
    
    clickableElements.forEach(element => {
      if (element.dataset.finSphereMonitored) return;
      
      const text = element.textContent?.toLowerCase().trim() || '';
      const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
      const className = element.className?.toLowerCase() || '';
      const id = element.id?.toLowerCase() || '';
      const value = element.value?.toLowerCase() || '';
      const href = element.href?.toLowerCase() || '';
      
      // More strict pattern matching for purchase actions only
      const isPurchaseButton = commonPatterns.some(pattern => {
        const exactTextMatch = text === pattern || text.includes(pattern + ' ') || text.includes(' ' + pattern);
        const exactLabelMatch = ariaLabel.includes(pattern);
        const classMatch = className.includes(pattern.replace(' ', '-')) || className.includes(pattern.replace(' ', '_'));
        const idMatch = id.includes(pattern.replace(' ', '-')) || id.includes(pattern.replace(' ', '_'));
        const valueMatch = value.includes(pattern);
        const hrefMatch = href.includes(pattern.replace(' ', ''));
        
        return exactTextMatch || exactLabelMatch || classMatch || idMatch || valueMatch || hrefMatch;
      });
      
      // Additional filters to avoid false positives
      const isNotPurchase = text.includes('search') || text.includes('filter') || text.includes('sort') || 
                           text.includes('menu') || text.includes('close') || text.includes('back') ||
                           className.includes('search') || className.includes('filter') || className.includes('nav');
      
      if (isPurchaseButton && !isNotPurchase && text.length > 2) {
        element.dataset.finSphereMonitored = 'true';
        element.addEventListener('click', (event) => {
          debugLog('🎯 Purchase button detected via fallback', {
            text: text,
            buttonType: 'purchase',
            element: element.tagName,
            className: className
          });
          handlePurchaseClick(event, element, 'purchase', 'fallback-pattern');
        }, { capture: true });
        
        fallbackCount++;
        debugLog('Attached purchase listener', {
          text: text,
          className: className,
          tag: element.tagName
        });
      }
    });
  }
  
  // Initial attachment
  attachFallbackListeners();
  
  // Monitor for new elements
  const observer = new MutationObserver(() => {
    attachFallbackListeners();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  debugLog(`Fallback monitoring active - ${fallbackCount} buttons found`);
}

/**
 * Start basic monitoring for non-e-commerce sites
 */
function startBasicMonitoring() {
  // Minimal monitoring for generic sites
  const genericSelectors = UNIVERSAL_SITE_CONFIGS.generic.selectors;
  
  ['buyNow', 'addToCart', 'checkout'].forEach(buttonType => {
    genericSelectors[buttonType].forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!element.dataset.finSphereBasic) {
            element.dataset.finSphereBasic = 'true';
            element.addEventListener('click', (event) => {
              console.log('🔍 Generic purchase action detected:', selector);
              // Basic analysis without intervention
            });
          }
        });
      } catch (error) {
        // Ignore invalid selectors for generic monitoring
      }
    });
  });
}

/**
 * Handle purchase click with comprehensive analysis
 */
function handlePurchaseClick(event, element, buttonType, selector) {
  debugLog(`🛒 PURCHASE CLICK INTERCEPTED: ${buttonType} on ${window.finSphereEnhanced.currentSite}`);
  
  // Prevent the original click temporarily
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  
  // Show loading analysis first
  showAnalysisLoader(element);
  
  // Extract purchase details
  const purchaseDetails = extractSiteSpecificDetails();
  
  // Add click context
  const clickContext = {
    buttonType: buttonType,
    selector: selector,
    buttonText: element.textContent?.trim() || '',
    timeOnPage: Date.now() - (window.finSpherePageStartTime || Date.now()),
    clickCoordinates: { x: event.clientX, y: event.clientY },
    timestamp: new Date().toISOString()
  };
  
  debugLog('📊 Purchase analysis data:', { purchaseDetails, clickContext });
  
  // Send to background for AI analysis
  chrome.runtime.sendMessage({
    type: 'analyzePurchase',
    orderDetails: {
      ...purchaseDetails,
      ...clickContext,
      site: window.finSphereEnhanced.currentSite,
      url: window.location.href
    },
    url: window.location.href
  }, (response) => {
    // Remove loading overlay
    const loader = document.getElementById('finsphere-analysis-loader');
    if (loader) loader.remove();
    
    if (chrome.runtime.lastError) {
      debugLog('❌ Communication error with background script:', chrome.runtime.lastError);
      // Allow purchase to proceed if AI fails
      setTimeout(() => element.click(), 100);
      return;
    }
    
    debugLog('🤖 AI Analysis result:', response);
    
    if (response?.shouldIntervene) {
      showAIAnalysisIntervention(response, element);
    } else {
      debugLog('✅ AI approves purchase - proceeding');
      // Allow the purchase to proceed
      setTimeout(() => element.click(), 100);
    }
  });
}

/**
 * Show analysis loading overlay
 */
function showAnalysisLoader(buttonElement) {
  const loader = document.createElement('div');
  loader.id = 'finsphere-analysis-loader';
  loader.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 15px; animation: spin 2s linear infinite;">🤖</div>
        <h2 style="color: #1f2937; margin: 0 0 15px 0;">Analyzing Purchase</h2>
        <p style="color: #6b7280; margin-bottom: 25px;">AI is evaluating your purchase decision...</p>
        <div style="
          width: 200px;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin: 0 auto;
        ">
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #10b981);
            animation: loading 2s infinite;
          "></div>
        </div>
      </div>
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes loading {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(loader);
}

/**
 * Show AI analysis intervention with detailed reasoning
 */
function showAIAnalysisIntervention(analysisResult, buttonElement) {
  const overlay = document.createElement('div');
  overlay.id = 'finsphere-ai-intervention';
  
  const riskColor = analysisResult.riskLevel === 'high' ? '#ef4444' : 
                   analysisResult.riskLevel === 'medium' ? '#f59e0b' : '#10b981';
  
  const riskIcon = analysisResult.riskLevel === 'high' ? '🚫' : 
                  analysisResult.riskLevel === 'medium' ? '⚠️' : '✅';
  
  const eligibilityColor = analysisResult.eligibility?.includes('Not') ? '#ef4444' :
                          analysisResult.eligibility?.includes('Caution') ? '#f59e0b' : '#10b981';
  
  const modelName = analysisResult.aiModel || 'gpt-oss:20b-cloud';
  const aiPoweredBadge = analysisResult.aiPowered ? 
    `<div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 6px 12px; border-radius: 20px; font-size: 11px; margin-top: 10px; display: inline-block;">🤖 AI Powered by ${modelName}</div>` : 
    '<div style="background: #6b7280; color: white; padding: 6px 12px; border-radius: 20px; font-size: 11px; margin-top: 10px; display: inline-block;">📋 Rule-Based Analysis</div>';
  
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow-y: auto;
      padding: 20px;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 56px; margin-bottom: 10px;">${riskIcon}</div>
          <h2 style="color: #1f2937; margin: 0; font-size: 22px;">
            FinSphere Purchase Analysis
          </h2>
          ${aiPoweredBadge}
          
          <!-- Eligibility Badge -->
          <div style="
            background: ${eligibilityColor};
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            display: inline-block;
            font-size: 16px;
            font-weight: 700;
            margin-top: 15px;
            text-transform: uppercase;
          ">${analysisResult.eligibility || analysisResult.riskLevel + ' Risk'}</div>
        </div>
        
        <!-- Purchase Details -->
        <div style="
          background: #f8fafc;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Purchase Details</div>
          ${(analysisResult.orderDetails?.product_name || analysisResult.analysis?.productName) ? 
            `<div style="font-weight: 600; color: #1f2937; margin-bottom: 10px; font-size: 15px;">
              🛍️ ${analysisResult.orderDetails?.product_name || analysisResult.analysis?.productName}
            </div>` : ''}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
            <div><strong>Site:</strong> ${analysisResult.analysis?.site || analysisResult.orderDetails?.site || window.location.hostname}</div>
            <div><strong>Amount:</strong> <span style="color: #dc2626; font-weight: 600;">₹${formatAmount(analysisResult.orderDetails?.amount || analysisResult.analysis?.amount)}</span></div>
            <div><strong>Today's Purchases:</strong> ${analysisResult.analysis?.todayPurchases || 0}</div>
            <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        
        <!-- Analysis Results -->
        <div style="margin-bottom: 15px;">
          <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center;">
            📊 Why We're Asking You to Review:
          </h3>
          ${(analysisResult.reasons || []).map(reason => `
            <div style="
              background: #fef3c7;
              border-left: 3px solid #f59e0b;
              padding: 8px 12px;
              border-radius: 0 6px 6px 0;
              margin-bottom: 6px;
              font-size: 13px;
              color: #92400e;
            ">• ${reason}</div>
          `).join('')}
        </div>
        
        <!-- Recommendations -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 14px;">
            💡 Our Recommendations:
          </h3>
          ${(analysisResult.recommendations || []).map(rec => `
            <div style="
              background: #ecfdf5;
              border-left: 3px solid #10b981;
              padding: 8px 12px;
              border-radius: 0 6px 6px 0;
              margin-bottom: 6px;
              font-size: 13px;
              color: #065f46;
            ">✓ ${rec}</div>
          `).join('')}
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="finsphere-ai-cancel" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            flex: 1;
          ">🛡️ Cancel & Save Money</button>
          <button id="finsphere-ai-proceed" style="
            background: ${riskColor};
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            flex: 1;
          ">Proceed Anyway →</button>
        </div>
        
        <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 15px; margin-bottom: 0;">
          Your financial wellness is our priority. Make informed decisions.
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Event handlers
  document.getElementById('finsphere-ai-proceed').addEventListener('click', () => {
    overlay.remove();
    debugLog('✅ User proceeded despite AI warning');
    
    // Log decision
    chrome.runtime.sendMessage({
      type: 'recordAIIntervention',
      data: {
        url: window.location.href,
        intervention_action: 'ai_analysis',
        accepted: false,
        ai_analysis: analysisResult
      }
    });
    
    setTimeout(() => buttonElement.click(), 100);
  });
  
  document.getElementById('finsphere-ai-cancel').addEventListener('click', () => {
    overlay.remove();
    debugLog('💰 User made smart financial decision');
    
    // Log smart decision
    chrome.runtime.sendMessage({
      type: 'recordAIIntervention',
      data: {
        url: window.location.href,
        intervention_action: 'ai_analysis',
        accepted: true,
        ai_analysis: analysisResult
      }
    });
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

/**
 * Show basic intervention when AI analysis fails
 */
function showBasicIntervention(buttonElement, clickContext) {
  debugLog('Showing basic intervention (AI unavailable)');
  
  const overlay = document.createElement('div');
  overlay.id = 'finsphere-basic-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 15px;">🤖</div>
        <h2 style="color: #1f2937; margin: 0 0 15px 0;">FinSphere Active</h2>
        <p style="color: #6b7280; margin-bottom: 25px;">Extension is working! Purchase detected on:<br><strong>${window.location.hostname}</strong></p>
        <p style="color: #6b7280; margin-bottom: 25px; font-size: 14px;">Button: ${clickContext.buttonText || clickContext.buttonType}</p>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button id="finsphere-basic-proceed" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          ">Continue Purchase</button>
          <button id="finsphere-basic-cancel" style="
            background: #ef4444;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          ">Cancel</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Event handlers
  document.getElementById('finsphere-basic-proceed').addEventListener('click', () => {
    overlay.remove();
    debugLog('✅ User chose to proceed with purchase');
    setTimeout(() => buttonElement.click(), 100);
  });
  
  document.getElementById('finsphere-basic-cancel').addEventListener('click', () => {
    overlay.remove();
    debugLog('🚫 User cancelled purchase');
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

/**
 * Extract purchase details using site-specific logic
 */
function extractSiteSpecificDetails() {
  const siteName = window.finSphereEnhanced.currentSite;
  const selectors = window.finSphereEnhanced.selectors;
  
  const details = {
    amount: 0,
    product_name: '',
    category: 'general',
    merchant: siteName,
    currency: 'INR',
    site: siteName,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Extract price
    if (selectors.price) {
      details.amount = extractFromSelectors(selectors.price, 'price') || 0;
    }
    
    // Extract product name
    if (selectors.title) {
      details.product_name = extractFromSelectors(selectors.title, 'text') || '';
    }
    
    // Extract category
    if (selectors.category) {
      details.category = extractFromSelectors(selectors.category, 'text') || 'general';
    }
    
    // Site-specific adjustments
    switch (siteName) {
      case 'swiggy':
      case 'zomato':
        details.category = 'food';
        details.product_name = details.product_name || 'Food Order';
        break;
      case 'myntra':
      case 'ajio':
        details.category = 'fashion';
        break;
      case 'nykaa':
        details.category = 'beauty';
        break;
      case 'pepperfry':
        details.category = 'furniture';
        break;
    }
    
    console.log('📦 Extracted details:', details);
    
  } catch (error) {
    console.error('❌ Error extracting details:', error);
  }
  
  return details;
}

/**
 * Extract data from multiple selectors
 */
function extractFromSelectors(selectorList, type) {
  for (const selector of selectorList) {
    try {
      const element = document.querySelector(selector);
      if (!element) continue;
      
      if (type === 'price') {
        const text = element.textContent || element.getAttribute('content') || '';
        // Extract numeric value from price string (handles ₹1,234.56 format)
        const cleanText = text.replace(/[^\d.,]/g, '').replace(/,/g, '');
        const price = parseFloat(cleanText);
        console.log(`💰 Price extraction: selector="${selector}", text="${text}", price=${price}`);
        if (price > 0) return price;
      } else if (type === 'text') {
        const text = element.textContent?.trim();
        if (text) return text;
      }
    } catch (error) {
      console.warn('Invalid selector:', selector, error);
    }
  }
  
  // If no price found with specific selectors, try universal price detection
  if (type === 'price') {
    return extractPriceFromPage();
  }
  
  return null;
}

/**
 * Universal price extraction - tries to find price anywhere on page
 */
function extractPriceFromPage() {
  // Common price patterns on e-commerce sites
  const priceSelectors = [
    // Generic price selectors
    '[class*="price"]',
    '[class*="Price"]',
    '[class*="cost"]',
    '[class*="amount"]',
    '[data-price]',
    '[itemprop="price"]',
    // Amazon-specific
    '.a-price .a-offscreen',
    '.a-price-whole',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-color-price',
    // Flipkart-specific
    '._30jeq3',
    '._1_WHN1',
    '.CEmiEU',
    // Other common patterns
    '.product-price',
    '.selling-price',
    '.final-price',
    '.offer-price',
    'span.price'
  ];
  
  for (const selector of priceSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = el.textContent || el.getAttribute('content') || el.getAttribute('data-price') || '';
        // Match Indian Rupee format: ₹1,23,456.78 or $123.45
        const priceMatch = text.match(/[₹$€£]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1].replace(/,/g, ''));
          if (price > 0 && price < 10000000) { // Reasonable price range
            console.log(`💰 Universal price found: ${price} from ${selector}`);
            return price;
          }
        }
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  console.log('💰 No price found on page');
  return 0;
}

/**
 * Show universal intervention overlay
 */
function showUniversalIntervention(analysisResult, buttonElement) {
  // Remove existing interventions
  document.querySelectorAll('.finsphere-universal-intervention').forEach(el => el.remove());
  
  const siteName = window.finSphereEnhanced.currentSite;
  const siteDisplayName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
  
  const overlay = document.createElement('div');
  overlay.className = 'finsphere-universal-intervention';
  
  const riskColor = analysisResult.riskLevel === 'high' ? '#dc2626' : 
                   analysisResult.riskLevel === 'medium' ? '#d97706' : '#059669';
  
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 2147483647;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(3px);
      animation: finsphere-fadeIn 0.3s ease-out;
    ">
      <div style="
        background: white;
        border-radius: 20px;
        padding: 32px;
        max-width: 540px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        font-family: system-ui, -apple-system, sans-serif;
        animation: finsphere-slideUp 0.4s ease-out;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="font-size: 64px; margin-bottom: 16px; animation: finsphere-bounce 2s infinite;">🛡️</div>
          <h1 style="color: ${riskColor}; margin: 0; font-size: 28px; font-weight: 800;">
            FinSphere Alert
          </h1>
          <p style="color: #6b7280; margin: 8px 0; font-size: 16px;">
            Smart Purchase Protection for <strong>${siteDisplayName}</strong>
          </p>
        </div>
        
        <!-- Purchase Info -->
        <div style="
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 20px;
          border-radius: 16px;
          margin: 20px 0;
          border: 1px solid #e2e8f0;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 24px; margin-right: 12px;">🛍️</div>
            <div>
              <h3 style="margin: 0; color: #1f2937; font-size: 18px;">Purchase Analysis</h3>
              <p style="margin: 2px 0; color: #6b7280; font-size: 14px;">
                ${analysisResult.orderDetails?.product_name || 'Item'} • ₹${(analysisResult.orderDetails?.amount || 0).toLocaleString()}
              </p>
            </div>
          </div>
          
          ${analysisResult.investmentRecommendation ? `
            <div style="
              background: linear-gradient(135deg, #065f46 0%, #047857 100%);
              color: white;
              padding: 16px;
              border-radius: 12px;
              margin: 16px 0;
            ">
              <h4 style="margin: 0 0 8px 0; font-size: 16px;">💰 Investment Alternative</h4>
              <p style="margin: 0; font-size: 14px; opacity: 0.95;">
                Monthly SIP: <strong>₹${analysisResult.investmentRecommendation.monthly_sip_amount?.toLocaleString()}</strong><br>
                ${analysisResult.investmentRecommendation.reasoning || 'Consider investing instead of spending'}
              </p>
            </div>
          ` : ''}
        </div>
        
        <!-- Risk Analysis -->
        <div style="
          background: #fef3c7;
          border: 2px solid #f59e0b;
          padding: 20px;
          border-radius: 16px;
          margin: 20px 0;
        ">
          <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 18px;">
            ⚠️ Risk Factors Detected
          </h3>
          <div style="color: #92400e;">
            ${analysisResult.reasons?.map(reason => 
              `<div style="margin: 8px 0; display: flex; align-items: flex-start;">
                <span style="margin-right: 8px; font-size: 16px;">•</span>
                <span style="font-size: 15px; line-height: 1.4;">${reason}</span>
               </div>`
            ).join('') || '<div>Potential impulse purchase detected</div>'}
          </div>
        </div>
        
        <!-- Recommendations -->
        ${analysisResult.recommendations?.length > 0 ? `
          <div style="
            background: #d1fae5;
            border: 2px solid #10b981;
            padding: 20px;
            border-radius: 16px;
            margin: 20px 0;
          ">
            <h3 style="color: #047857; margin: 0 0 12px 0; font-size: 18px;">
              💡 Smart Recommendations
            </h3>
            <div style="color: #047857;">
              ${analysisResult.recommendations.map(rec => 
                `<div style="margin: 8px 0; display: flex; align-items: flex-start;">
                  <span style="margin-right: 8px; font-size: 16px;">✓</span>
                  <span style="font-size: 15px; line-height: 1.4;">${rec}</span>
                 </div>`
              ).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 16px; margin-top: 28px;">
          <button id="finsphere-proceed" style="
            flex: 1;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          ">
            ⚠️ Buy Anyway
          </button>
          <button id="finsphere-cancel" style="
            flex: 1;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          ">
            🛡️ Smart Decision
          </button>
        </div>
        
        <!-- Footer -->
        <div style="
          text-align: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 13px;
        ">
          AI Confidence: <strong>${(analysisResult.confidence || 85)}%</strong> • 
          Powered by FinSphere AI
        </div>
      </div>
    </div>
    
    <style>
      @keyframes finsphere-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes finsphere-slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes finsphere-bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-6px); }
        60% { transform: translateY(-3px); }
      }
      
      .finsphere-universal-intervention button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }
    </style>
  `;
  
  document.body.appendChild(overlay);
  
  // Button event handlers
  document.getElementById('finsphere-proceed').addEventListener('click', () => {
    overlay.remove();
    console.log('⚠️ User chose to proceed with purchase');
    
    // Log decision
    chrome.runtime.sendMessage({
      type: 'recordAIIntervention',
      data: {
        url: window.location.href,
        intervention_action: 'purchase_warning',
        accepted: false,
        ai_analysis: analysisResult
      }
    });
    
    // Allow original click to proceed
    setTimeout(() => buttonElement.click(), 100);
  });
  
  document.getElementById('finsphere-cancel').addEventListener('click', () => {
    overlay.remove();
    console.log('🛡️ User made smart decision to cancel purchase');
    
    // Log smart decision
    chrome.runtime.sendMessage({
      type: 'recordAIIntervention',
      data: {
        url: window.location.href,
        intervention_action: 'purchase_warning',
        accepted: true,
        ai_analysis: analysisResult
      }
    });
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// Immediate test to show extension is active
function showExtensionActiveIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'finsphere-active-indicator';
  indicator.innerHTML = '🚯 FinSphere Active';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #10b981;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: sans-serif;
    font-size: 12px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    opacity: 0;
    animation: fadeInOut 3s ease-in-out;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-20px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-20px); }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    indicator.remove();
    style.remove();
  }, 3000);
}

// Show indicator immediately
if (document.body) {
  showExtensionActiveIndicator();
} else {
  document.addEventListener('DOMContentLoaded', showExtensionActiveIndicator);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUniversalMonitoring);
} else {
  // DOM already loaded
  setTimeout(initializeUniversalMonitoring, 100);
}

// Also initialize on page load for SPA navigation
window.addEventListener('load', () => {
  setTimeout(initializeUniversalMonitoring, 500);
});

// Handle dynamic page changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    debugLog('Page changed, reinitializing...');
    setTimeout(initializeUniversalMonitoring, 1000);
  }
}).observe(document, { subtree: true, childList: true });

debugLog('Enhanced FinSphere Universal Integration loaded successfully');
console.log('✅✅✅ FINSPHERE EXTENSION LOADED - Check console for [FinSphere Debug] messages ✅✅✅');