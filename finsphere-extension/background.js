/**
 * FinSphere Extension - Background Agent
 * Autonomous purchase interception and financial wellness agent
 */

const API_URL = 'http://localhost:8000/api/v1';
const FRONTEND_URL = 'http://localhost:3000';
const OLLAMA_API = 'http://localhost:11434';

// Comprehensive shopping & e-commerce sites pattern
const SHOPPING_SITES = [
  // Indian E-commerce
  'amazon', 'flipkart', 'myntra', 'ajio', 'jabong', 'koovs', 'limeroad', 'shopclues',
  'snapdeal', 'paytmmall', 'tatacliq', 'reliancedigital', 'cromaretail', 'vijaysales',
  'shoppersstop', 'lifestyle', 'westside', 'max', 'pantaloons', 'bigbasket',
  'grofers', 'dunzo', 'blinkit', 'zepto', 'jiomart', 'naturesbasket', 'spencers',
  
  // Food Delivery
  'swiggy', 'zomato', 'ubereats', 'foodpanda', 'dominos', 'pizzahut', 'kfc',
  'mcdonalds', 'burgerking', 'subway', 'faasos', 'behrouz', 'ovenstory',
  
  // Fashion & Lifestyle
  'nykaa', 'purplle', 'beautybebo', 'vanitywagon', 'firstcry', 'hopscotch',
  'pepperfry', 'urbanladder', 'fabindia', 'biba', 'wforwoman', 'global-desi',
  
  // Electronics & Gadgets
  'croma', 'ezone', 'poorvika', 'sangeetha', 'girias', 'brandyourstore',
  'thelocalstore', 'gadgetsnow', 'smartprix', 'compuindia', 'mdcomputers',
  
  // Global E-commerce
  'ebay', 'alibaba', 'aliexpress', 'walmart', 'target', 'bestbuy', 'costco',
  'etsy', 'wish', 'shopify', 'woocommerce', 'magento', 'prestashop',
  
  // Marketplace & Classifieds
  'olx', 'quikr', 'clickindia', 'sulekha', 'indiamart', 'tradeindia',
  'exportersindia', 'justdial', '99acres', 'magicbricks', 'commonfloor',
  
  // Travel & Booking
  'makemytrip', 'goibibo', 'yatra', 'cleartrip', 'ixigo', 'booking', 'agoda',
  'expedia', 'hotels', 'oyorooms', 'treebo', 'fabhotels', 'zostel',
  
  // Subscription & Services
  'netflix', 'hotstar', 'primevideo', 'sonyliv', 'zee5', 'voot', 'altbalaji',
  'spotify', 'gaana', 'jiosaavn', 'wynk', 'hungama', 'bookmy show',
  
  // Pharmacy & Health
  'netmeds', 'pharmeasy', 'medlife', '1mg', 'apollopharmacy', 'healthkart',
  'bigbasket', 'naturesbasket'
];

const GIG_SITES = [
  'upwork', 'fiverr', 'freelancer', 'toptal', 'uber', 'ola', 'lyft', '99designs'
];

// AI Analysis Configuration
const AI_CONFIG = {
  model: 'gpt-oss:20b-cloud',
  maxTokens: 500,
  temperature: 0.3, // Lower for more consistent financial advice
  timeout: 30000 // 30 second timeout for larger model
};

// Investment Engine Constants
const RISK_LEVELS = {
  CONSERVATIVE: 'conservative',
  MODERATE: 'moderate', 
  AGGRESSIVE: 'aggressive'
};

const MARKET_CONDITIONS = {
  BULL: 'bull',
  BEAR: 'bear',
  SIDEWAYS: 'sideways',
  VOLATILE: 'volatile'
};

// Site-specific button selectors for purchase interception
const SITE_SELECTORS = {
  // Amazon selectors
  'amazon': {
    buyNow: ['#buy-now-button', '.a-button-text:contains("Buy Now")', '[name="submit.buy-now"]', '.a-button-input[aria-labelledby*="buy-now"]'],
    addToCart: ['#add-to-cart-button', '.a-button-text:contains("Add to Cart")', '[name="submit.add-to-cart"]', '.a-button-input[aria-labelledby*="add-to-cart"]'],
    checkout: ['[name="proceedToRetailCheckout"]', '.a-button-text:contains("Proceed to checkout")', '#sc-buy-box-ptc-button']
  },
  
  // Flipkart selectors
  'flipkart': {
    buyNow: ['._2KpZ6l._2U9uOA._3v1-ww', '.btn-orange:contains("Buy Now")', 'button:contains("BUY NOW")', '._2KpZ6l._2ObVJf._3v1-ww'],
    addToCart: ['._2KpZ6l._2U9uOA._3v1-ww:contains("ADD TO CART")', '.btn-orange:contains("Add to Cart")', 'button:contains("ADD TO CART")'],
    checkout: ['._2AkmmA._29YdH8', '.checkout-button', 'button:contains("PLACE ORDER")', '._7UHT_c']
  },
  
  // Myntra selectors
  'myntra': {
    buyNow: ['.pdp-add-to-bag', '.product-actionsButton', 'button:contains("ADD TO BAG")', '.myntraweb-button'],
    addToCart: ['.pdp-add-to-bag', '.product-actionsButton:contains("ADD TO BAG")', '.myntraweb-button:contains("ADD TO BAG")'],
    checkout: ['.checkout-button', 'button:contains("PLACE ORDER")', '.place-order-button']
  },
  
  // Ajio selectors
  'ajio': {
    buyNow: ['.btn-gold', '.pdp-add-to-bag-btn', 'button:contains("ADD TO BAG")', '.ic-btn-primary'],
    addToCart: ['.pdp-add-to-bag-btn', '.btn-gold:contains("ADD TO BAG")', '.ic-btn-primary:contains("ADD TO BAG")'],
    checkout: ['.checkout-btn', 'button:contains("PLACE ORDER")', '.place-order-btn']
  },
  
  // Swiggy selectors
  'swiggy': {
    buyNow: ['.AddToCart_addToCartButton__3j0i5', 'button:contains("ADD")', '._3v5cC', '._1Vdi9'],
    addToCart: ['.AddToCart_addToCartButton__3j0i5', 'button:contains("ADD TO CART")', '._1A5kE'],
    checkout: ['.place-order-button', 'button:contains("PLACE ORDER")', '._3uCc3', '._1v4n4']
  },
  
  // Zomato selectors
  'zomato': {
    buyNow: ['button:contains("Add")', '.sc-1s0saks-0', '.sc-17hyc2s-1', '[data-testid="add-button"]'],
    addToCart: ['button:contains("Add item")', '.item-add-button', '[data-testid="add-button"]'],
    checkout: ['button:contains("Place Order")', '.place-order-btn', '[data-testid="place-order"]']
  },
  
  // Nykaa selectors
  'nykaa': {
    buyNow: ['.btn-section .nykaa-btn', 'button:contains("ADD TO BAG")', '.css-xkh9ud', '.AddToBagButton'],
    addToCart: ['.AddToBagButton', '.btn-section .nykaa-btn:contains("ADD TO BAG")', '.css-xkh9ud:contains("ADD TO BAG")'],
    checkout: ['.checkout-button', 'button:contains("PLACE ORDER")', '.place-order-btn']
  },
  
  // Pepperfry selectors
  'pepperfry': {
    buyNow: ['.vip-cart-button', 'button:contains("BUY NOW")', '.pf_btn_cart', '.btn-buy-now'],
    addToCart: ['.vip-cart-button:contains("ADD TO CART")', '.pf_btn_cart', 'button:contains("ADD TO CART")'],
    checkout: ['.checkout-btn', 'button:contains("PLACE ORDER")', '.place-order-button']
  },
  
  // FirstCry selectors
  'firstcry': {
    buyNow: ['.AddToCart', 'button:contains("ADD TO CART")', '.btn-add-cart', '.fc-btn-primary'],
    addToCart: ['.AddToCart', '.btn-add-cart:contains("ADD TO CART")', '.fc-btn-primary:contains("ADD TO CART")'],
    checkout: ['.checkout-button', 'button:contains("PLACE ORDER")', '.proceed-btn']
  },
  
  // Generic selectors for other sites
  'generic': {
    buyNow: [
      'button:contains("Buy Now")', 'button:contains("BUY NOW")', 'button:contains("Buy")',
      '.buy-now', '.btn-buy-now', '.buy-button', '[data-testid="buy-now"]',
      'input[value*="Buy"]', 'a[href*="buy"]', '.purchase-button'
    ],
    addToCart: [
      'button:contains("Add to Cart")', 'button:contains("ADD TO CART")', 'button:contains("Add")',
      '.add-to-cart', '.btn-add-cart', '.cart-button', '[data-testid="add-to-cart"]',
      'input[value*="Add to Cart"]', 'a[href*="cart"]', '.add-cart-btn'
    ],
    checkout: [
      'button:contains("Checkout")', 'button:contains("Place Order")', 'button:contains("PLACE ORDER")',
      '.checkout', '.btn-checkout', '.place-order', '[data-testid="checkout"]',
      'input[value*="Checkout"]', 'a[href*="checkout"]', '.proceed-checkout'
    ]
  }
};

// Extension state with AI features
let extensionState = {
  userId: null,
  isActive: true,
  marketData: null,
  userInvestmentProfile: null,
  lastMarketUpdate: 0,
  lastCheckTime: 0,
  checkInterval: 5000, // 5 seconds
  pendingInterventions: [],
  aiAnalysisCache: new Map(), // Cache AI analysis to avoid repeated calls
  lastAIAnalysis: 0, // Timestamp of last AI analysis
  aiEnabled: true, // AI analysis enabled flag
  ollamaAvailable: false // Ollama service availability
};

// Check Ollama availability on startup
async function checkOllamaAvailability() {
  try {
    const response = await fetch(`${OLLAMA_API}/api/tags`, { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      const modelNames = models.map(m => m.name);
      
      // Check if our model is available
      const hasModel = modelNames.some(name => 
        name.includes('gpt-oss') || name.includes('20b-hub')
      );
      
      extensionState.ollamaAvailable = true;
      console.log('🤖 Ollama available. Models:', modelNames);
      console.log(`🎯 Using model: ${AI_CONFIG.model}`);
      
      if (!hasModel && modelNames.length > 0) {
        console.warn(`⚠️ Model ${AI_CONFIG.model} not found. Available: ${modelNames.join(', ')}`);
      }
    } else {
      extensionState.ollamaAvailable = false;
    }
  } catch (error) {
    extensionState.ollamaAvailable = false;
    console.log('⚠️ Ollama not available:', error.message);
  }
}

/**
 * No authentication required - Extension works independently
 */
function getAuthToken() {
  return Promise.resolve(null); // No auth needed
}

function setAuthToken(token) {
  return Promise.resolve(); // No-op
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('FinSphere Extension Installed');
  initializeExtension();
});

async function initializeExtension() {
  const stored = await chrome.storage.local.get(['userId', 'isActive', 'aiEnabled']);
  
  // Generate anonymous user ID if not exists
  if (!stored.userId) {
    extensionState.userId = 'anonymous_' + Math.random().toString(36).substr(2, 9);
    await chrome.storage.local.set({ userId: extensionState.userId });
  } else {
    extensionState.userId = stored.userId;
  }
  
  // Extension active by default
  extensionState.isActive = stored.isActive !== false;
  extensionState.aiEnabled = stored.aiEnabled !== false;
  
  // Initialize daily stats
  const today = new Date().toDateString();
  const stats = await chrome.storage.local.get(['todayStats', 'lastStatsDate']);
  if (stats.lastStatsDate !== today) {
    await chrome.storage.local.set({
      todayStats: { interventions: 0, potentialSavings: 0 },
      lastStatsDate: today
    });
  }
  
  // Check Ollama availability
  await checkOllamaAvailability();
  
  console.log('🚀 FinSphere Universal AI Extension initialized (No Auth Required):', {
    userId: extensionState.userId,
    aiEnabled: extensionState.aiEnabled,
    ollamaAvailable: extensionState.ollamaAvailable,
    version: '3.0 Universal'
  });
}

// Tab update listener - check for interventions with throttling
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && extensionState.isActive) {
    const now = Date.now();
    // Throttle: only check once per 2 minutes per tab
    if (now - extensionState.lastCheckTime > 120000) {
      extensionState.lastCheckTime = now;
      setTimeout(() => {
        checkForPurchaseOpportunity(tab);
      }, 2000); // Increased delay to 2 seconds
    }
  }
});

/**
 * Main agent function: Check current page for purchase opportunities
 */
async function checkForPurchaseOpportunity(tab) {
  try {
    const isShoppingPage = isShoppingOrSpendingSite(tab.url);
    const isGigPage = isGigWorkSite(tab.url);
    
    if (!isShoppingPage && !isGigPage) {
      return; // Not a relevant page
    }

    // Send message to content script to analyze the page
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzePageContent',
      type: isShoppingPage ? 'shopping' : 'gig'
    }, async (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Content script not available:', chrome.runtime.lastError);
        return;
      }
      
      if (response && (response.isImpulseBuy || response.isProposal)) {
        // Evaluate if intervention is needed
        await evaluateIntervention(tab, response, isShoppingPage);
      }
    });

  } catch (error) {
    console.error('Error in checkForPurchaseOpportunity:', error);
  }
}

/**
 * Evaluate if an intervention is needed based on page content
 */
async function evaluateIntervention(tab, pageData, isShoppingPage) {
  try {
    // Get user's current stress level and financial state
    const userState = await fetchUserState(extensionState.userId);
    
    // Determine intervention need
    let shouldIntervene = false;
    let interventionReason = '';
    let interventionSeverity = 'low';
    let delayMinutes = 5;

    if (isShoppingPage && pageData.isImpulseBuy) {
      // Shopping site intervention logic
      if (userState.stress_level === 'High' || userState.stress_level === 'Medium') {
        shouldIntervene = true;
        interventionReason = 'Impulse purchase detected during elevated stress';
        interventionSeverity = userState.stress_level === 'High' ? 'high' : 'medium';
        delayMinutes = userState.stress_level === 'High' ? 10 : 5;
      } else {
        shouldIntervene = true;
        interventionReason = 'Potential impulse purchase detected';
        interventionSeverity = 'low';
        delayMinutes = 3;
      }
    } else if (!isShoppingPage && pageData.isProposal) {
      // Gig work underpricing logic
      if (userState.stress_level === 'High') {
        shouldIntervene = true;
        interventionReason = 'High stress - risk of underpricing your work';
        interventionSeverity = 'high';
        delayMinutes = 10;
      } else if (userState.stress_level === 'Medium') {
        shouldIntervene = true;
        interventionReason = 'Review proposal pricing carefully';
        interventionSeverity = 'medium';
        delayMinutes = 5;
      }
    }

    if (shouldIntervene) {
      // Trigger intervention overlay
      chrome.tabs.sendMessage(tab.id, {
        action: 'showIntervention',
        data: {
          reason: interventionReason,
          severity: interventionSeverity,
          userState: userState,
          delay_minutes: delayMinutes,
          pageType: isShoppingPage ? 'shopping' : 'gig',
          timestamp: new Date().toISOString()
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to show intervention:', chrome.runtime.lastError);
        } else {
          // Log intervention
          logIntervention(tab.url, interventionReason, interventionSeverity);
        }
      });
    }
  } catch (error) {
    console.error('Error evaluating intervention:', error);
  }
}

/**
 * Send message to content script for intervention logging
 */
async function logInterventionResponse(action, accepted) {
  try {
    await fetch(`${API_URL}/intervention/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: extensionState.userId,
        action: action,
        accepted: accepted,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      console.warn('Could not log intervention response');
    });
  } catch (error) {
    console.error('Error logging intervention response:', error);
  }
}

/**
 * Fetch real-time market data for investment analysis
 */
async function fetchMarketData() {
  try {
    // Simulated market data fetching - in production, use real APIs
    const marketData = {
      timestamp: new Date().toISOString(),
      nifty_change: (Math.random() - 0.5) * 5, // -2.5% to +2.5%
      sensex_change: (Math.random() - 0.5) * 5,
      vix_level: 12 + Math.random() * 23, // 12-35 range
      gold_price: 62000 + Math.random() * 6000,
      usd_inr: 82.5 + Math.random() * 2,
      bond_yield_10y: 6.8 + Math.random() * 0.7,
      market_condition: determineMarketCondition(),
      sector_performance: {
        'IT': (Math.random() - 0.5) * 6,
        'Banking': (Math.random() - 0.5) * 6,
        'Pharma': (Math.random() - 0.5) * 6,
        'Auto': (Math.random() - 0.5) * 6
      }
    };
    
    extensionState.marketData = marketData;
    console.log('📈 Market data updated:', marketData);
    return marketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return getDefaultMarketData();
  }
}

/**
 * Determine market condition based on indicators
 */
function determineMarketCondition() {
  const conditions = Object.values(MARKET_CONDITIONS);
  return conditions[Math.floor(Math.random() * conditions.length)];
}

/**
 * Get default market data if fetch fails
 */
function getDefaultMarketData() {
  return {
    timestamp: new Date().toISOString(),
    nifty_change: 0.5,
    sensex_change: 0.4,
    vix_level: 18.0,
    gold_price: 65000,
    usd_inr: 83.2,
    bond_yield_10y: 7.1,
    market_condition: MARKET_CONDITIONS.SIDEWAYS,
    sector_performance: { 'IT': 0.5, 'Banking': 0.3, 'Pharma': -0.2 }
  };
}

/**
 * Create user investment profile based on behavior analysis
 */
async function createUserInvestmentProfile(userId, historicalData) {
  try {
    const biometrics = historicalData.biometrics || [];
    const transactions = historicalData.transactions || [];
    const interventions = historicalData.interventions || [];
    
    // Calculate behavioral metrics
    const spendingVariance = calculateSpendingVariance(transactions);
    const behavioralScore = calculateBehavioralScore(interventions, biometrics);
    const monthlysurplus = estimateMonthlySurplus(transactions);
    
    const userProfile = {
      user_id: userId,
      risk_appetite: determineRiskAppetite(spendingVariance, behavioralScore),
      investment_horizon: 'medium', // Default to medium term
      monthly_surplus: monthlysurplus,
      spending_personality: determineSpendingPersonality(transactions),
      stress_baseline: calculateStressBaseline(biometrics),
      emergency_fund_months: Math.random() * 6 + 2, // 2-8 months
      investment_goals: ['wealth_building', 'tax_saving'],
      behavioral_score: behavioralScore
    };
    
    extensionState.userProfile = userProfile;
    console.log('👤 User investment profile created:', userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return getDefaultUserProfile(userId);
  }
}

/**
 * Calculate spending variance for risk assessment
 */
function calculateSpendingVariance(transactions) {
  if (!transactions || transactions.length < 2) return 500;
  
  const amounts = transactions.map(t => t.amount || 0);
  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  
  return variance;
}

/**
 * Calculate behavioral score based on intervention history
 */
function calculateBehavioralScore(interventions, biometrics) {
  if (!interventions || interventions.length === 0) return 0.3;
  
  const ignoredInterventions = interventions.filter(i => i.user_action === 'proceeded').length;
  const ignoreRate = ignoredInterventions / interventions.length;
  
  // Factor in stress levels
  let avgStress = 0.5;
  if (biometrics && biometrics.length > 0) {
    avgStress = biometrics.reduce((sum, b) => sum + (b.stress_level || 5), 0) / (biometrics.length * 10);
  }
  
  return Math.min(1.0, ignoreRate * 0.7 + avgStress * 0.3);
}

/**
 * Estimate monthly investable surplus
 */
function estimateMonthlySurplus(transactions) {
  if (!transactions || transactions.length === 0) return 5000;
  
  // Simple estimation: 20% of recent spending could be surplus
  const recentSpending = transactions.slice(-30).reduce((sum, t) => sum + (t.amount || 0), 0);
  const estimatedSurplus = Math.max(1000, recentSpending * 0.2);
  
  return Math.min(estimatedSurplus, 50000); // Cap at 50K
}

/**
 * Determine risk appetite based on behavior
 */
function determineRiskAppetite(spendingVariance, behavioralScore) {
  if (behavioralScore > 0.7 || spendingVariance < 500) {
    return RISK_LEVELS.CONSERVATIVE;
  } else if (spendingVariance > 2000 && behavioralScore < 0.4) {
    return RISK_LEVELS.AGGRESSIVE;
  } else {
    return RISK_LEVELS.MODERATE;
  }
}

/**
 * Determine spending personality
 */
function determineSpendingPersonality(transactions) {
  if (!transactions || transactions.length === 0) return 'balanced';
  
  const discretionaryCategories = ['fashion', 'entertainment', 'dining', 'electronics'];
  const discretionaryCount = transactions.filter(t => 
    discretionaryCategories.includes(t.category?.toLowerCase())
  ).length;
  
  const discretionaryRatio = discretionaryCount / transactions.length;
  
  if (discretionaryRatio > 0.4) return 'lifestyle';
  if (discretionaryRatio < 0.2) return 'conservative';
  return 'balanced';
}

/**
 * Calculate baseline stress level
 */
function calculateStressBaseline(biometrics) {
  if (!biometrics || biometrics.length === 0) return 4.0;
  
  const stressLevels = biometrics.map(b => b.stress_level || 5);
  return stressLevels.reduce((sum, val) => sum + val, 0) / stressLevels.length;
}

/**
 * Get default user profile
 */
function getDefaultUserProfile(userId) {
  return {
    user_id: userId,
    risk_appetite: RISK_LEVELS.MODERATE,
    investment_horizon: 'medium',
    monthly_surplus: 5000,
    spending_personality: 'balanced',
    stress_baseline: 4.0,
    emergency_fund_months: 4.0,
    investment_goals: ['wealth_building'],
    behavioral_score: 0.3
  };
}

/**
 * Fetch comprehensive user financial state and transaction history from backend
 */
async function fetchUserState(userId) {
  try {
    // Fetch real-time dashboard data
    const response = await fetch(`${API_URL}/realtime/dashboard/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 User financial state fetched:', data);
      
      return {
        stress_level: data.stress_level || 'Low',
        stress_score: data.stress_score || 0.2,
        spending_risk: data.spending_risk || 'Safe',
        cognitive_load: data.cognitive_load || 'Normal',
        savings_runway: data.savings_runway || '3.5 Mo',
        heart_rate: data.heart_rate || 72,
        hrv: data.hrv || 28,
        recovery_score: data.recovery_score || 85,
        recent_emails_count: data.recent_emails_count || 0,
        stress_trigger_emails: data.stress_trigger_emails || 0,
        recent_interventions: data.recent_emails || [],
        estimated_monthly_income: 50000, // TODO: Get from user profile
        savings_current: 25000 // TODO: Get from user profile
      };
    }
    return getEnhancedDefaultState();
  } catch (error) {
    console.error('Error fetching user state:', error);
    return getEnhancedDefaultState();
  }
}

function getEnhancedDefaultState() {
  return {
    stress_level: 'Low',
    stress_score: 0.3,
    spending_risk: 'Safe',
    cognitive_load: 'Normal',
    savings_runway: '6.5 Mo',
    heart_rate: 72,
    hrv: 28,
    recovery_score: 85,
    recent_emails_count: 5,
    stress_trigger_emails: 1,
    recent_interventions: [],
    estimated_monthly_income: 50000,
    savings_current: 30000
  };
}

/**
 * Analyze purchase using Ollama AI for intelligent recommendations
 */
async function analyzeWithOllamaAI(data) {
  const startTime = Date.now();
  
  try {
    // Get user's current financial state and biometric data
    const userState = await fetchUserState(data.orderDetails?.userId || 1);
    const biometricData = await fetchRecentBiometrics(data.orderDetails?.userId || 1);
    const monthlyExpenses = await fetchMonthlyExpenses(data.orderDetails?.userId || 1);
    
    // Prepare comprehensive context for AI analysis
    const aiContext = {
      purchase: {
        amount: data.orderDetails?.amount || 0,
        productName: data.orderDetails?.productName || 'Unknown',
        category: data.orderDetails?.category || 'General',
        merchant: data.orderDetails?.merchant || 'Unknown',
        discountPercentage: data.orderDetails?.discountPercentage || 0,
        urgencyIndicators: data.orderDetails?.urgencyIndicators || []
      },
      userFinancials: {
        monthlyIncome: userState.estimated_monthly_income || 50000,
        currentSavings: userState.savings_current || 25000,
        monthlyExpenses: monthlyExpenses.total || 35000,
        spendingRisk: userState.spending_risk || 'Safe',
        savingsRunway: userState.savings_runway || '6 Mo'
      },
      biometrics: {
        currentStressLevel: biometricData.current_stress || 3,
        averageStress7Days: biometricData.avg_stress_7d || 4,
        heartRateVariability: biometricData.current_hrv || 28,
        sleepQuality: biometricData.sleep_quality || 7
      },
      behaviorSignals: data.userBehaviorSignals || {},
      pageContext: data.pageContext || {},
      timestamp: new Date().toISOString()
    };
    
    // Create AI prompt for financial analysis
    const prompt = createFinancialAnalysisPrompt(aiContext);
    
    // Get AI analysis from Ollama
    const aiResponse = await queryOllama(prompt);
    
    // Parse AI response and create structured analysis
    const analysis = parseAIAnalysis(aiResponse, aiContext);
    
    // Add timing and confidence metrics
    analysis.analysisTime = `${Date.now() - startTime}ms`;
    analysis.confidence = calculateConfidence(aiContext, analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('Error in Ollama AI analysis:', error);
    
    // Fallback to rule-based analysis
    return await fallbackRuleBasedAnalysis(data);
  }
}

/**
 * Create comprehensive prompt for Ollama financial analysis
 */
function createFinancialAnalysisPrompt(context) {
  const { purchase, userFinancials, biometrics, behaviorSignals, pageContext } = context;
  
  return `You are a financial wellness AI assistant. Analyze this purchase decision comprehensively.

PURCHASE DETAILS:
- Product: ${purchase.productName}
- Amount: ₹${purchase.amount}
- Category: ${purchase.category}
- Merchant: ${purchase.merchant}
- Discount: ${purchase.discountPercentage}% off
- Urgency signals: ${purchase.urgencyIndicators.join(', ') || 'None'}

USER FINANCIAL STATE:
- Monthly Income: ₹${userFinancials.monthlyIncome}
- Current Savings: ₹${userFinancials.currentSavings}
- Monthly Expenses: ₹${userFinancials.monthlyExpenses}
- Spending Risk: ${userFinancials.spendingRisk}
- Savings Runway: ${userFinancials.savingsRunway}

BIOMETRIC INDICATORS:
- Current Stress: ${biometrics.currentStressLevel}/10
- 7-day Avg Stress: ${biometrics.averageStress7Days}/10
- Heart Rate Variability: ${biometrics.heartRateVariability}ms
- Sleep Quality: ${biometrics.sleepQuality}/10

BEHAVIOR SIGNALS:
- Quick Decision: ${behaviorSignals.quickDecision ? 'Yes' : 'No'}
- Rapid Clicking: ${behaviorSignals.rapidClicking ? 'Yes' : 'No'}
- Stress Indicators: ${behaviorSignals.stressIndicators?.join(', ') || 'None'}

PAGE CONTEXT:
- Urgency Signals: ${pageContext.urgencySignals?.length || 0}
- Discount Signals: ${pageContext.discountSignals?.length || 0}
- Emotional Triggers: ${pageContext.emotionalTriggers?.length || 0}
- Time on Page: ${Math.round((pageContext.timeOnPage || 0) / 1000)}s

ANALYZE AND PROVIDE:
1. RISK_LEVEL: (low/medium/high)
2. SHOULD_INTERVENE: (true/false)
3. STRESS_LEVEL: (1-10)
4. BUDGET_IMPACT: (percentage of monthly income)
5. KEY_FACTORS: (3 most important factors affecting this decision)
6. AI_INSIGHTS: (personalized reasoning in 1-2 sentences)
7. SMART_RECOMMENDATIONS: (3 specific actionable recommendations)
8. ALTERNATIVES: (if applicable, suggest 2 alternatives)

Format your response as structured data with clear sections. Be concise but insightful.`;
}

/**
 * Query Ollama API for AI analysis
 */
async function queryOllama(prompt) {
  try {
    const response = await fetch(`${OLLAMA_API}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: AI_CONFIG.temperature,
          num_predict: AI_CONFIG.maxTokens
        }
      }),
      signal: AbortSignal.timeout(AI_CONFIG.timeout)
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.response;
    
  } catch (error) {
    console.error('Error querying Ollama:', error);
    throw error;
  }
}

/**
 * Parse AI response into structured analysis
 */
function parseAIAnalysis(aiResponse, context) {
  try {
    const analysis = {
      shouldIntervene: false,
      riskLevel: 'low',
      stressLevel: 3,
      budgetImpact: 0,
      keyFactors: [],
      aiInsights: '',
      smartRecommendations: [],
      alternatives: [],
      orderDetails: context.purchase
    };
    
    // Extract structured data from AI response
    const lines = aiResponse.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('RISK_LEVEL:')) {
        const risk = trimmed.split(':')[1]?.trim().toLowerCase();
        analysis.riskLevel = ['low', 'medium', 'high'].includes(risk) ? risk : 'low';
      }
      
      if (trimmed.includes('SHOULD_INTERVENE:')) {
        const shouldIntervene = trimmed.split(':')[1]?.trim().toLowerCase();
        analysis.shouldIntervene = shouldIntervene === 'true';
      }
      
      if (trimmed.includes('STRESS_LEVEL:')) {
        const stress = parseInt(trimmed.split(':')[1]?.trim());
        analysis.stressLevel = isNaN(stress) ? 3 : Math.max(1, Math.min(10, stress));
      }
      
      if (trimmed.includes('BUDGET_IMPACT:')) {
        const impact = parseFloat(trimmed.split(':')[1]?.trim());
        analysis.budgetImpact = isNaN(impact) ? 0 : Math.max(0, Math.min(100, impact));
      }
      
      if (trimmed.includes('AI_INSIGHTS:')) {
        analysis.aiInsights = trimmed.split(':')[1]?.trim() || '';
      }
      
      // Extract key factors
      if (trimmed.includes('KEY_FACTORS:')) {
        currentSection = 'factors';
        continue;
      }
      
      if (trimmed.includes('SMART_RECOMMENDATIONS:')) {
        currentSection = 'recommendations';
        continue;
      }
      
      if (trimmed.includes('ALTERNATIVES:')) {
        currentSection = 'alternatives';
        continue;
      }
      
      // Parse list items
      if (currentSection && trimmed.startsWith('-')) {
        const item = trimmed.substring(1).trim();
        if (currentSection === 'factors') {
          analysis.keyFactors.push({
            type: item.includes('warning') || item.includes('risk') ? 'warning' : 'info',
            message: item
          });
        } else if (currentSection === 'recommendations') {
          analysis.smartRecommendations.push(item);
        } else if (currentSection === 'alternatives') {
          analysis.alternatives.push({
            title: item,
            savings: '',
            link: '#'
          });
        }
      }
    }
    
    // Ensure minimum data
    if (!analysis.aiInsights) {
      analysis.aiInsights = generateFallbackInsight(context);
    }
    
    if (analysis.smartRecommendations.length === 0) {
      analysis.smartRecommendations = generateFallbackRecommendations(context);
    }
    
    return analysis;
    
  } catch (error) {
    console.error('Error parsing AI analysis:', error);
    return generateFallbackAnalysis(context);
  }
}

/**
 * Calculate confidence score based on data quality and analysis consistency
 */
function calculateConfidence(context, analysis) {
  let confidence = 70; // Base confidence
  
  // Increase confidence based on data quality
  if (context.biometrics.currentStressLevel > 0) confidence += 10;
  if (context.userFinancials.monthlyIncome > 0) confidence += 10;
  if (context.purchase.amount > 0) confidence += 5;
  if (context.behaviorSignals.stressIndicators?.length > 0) confidence += 5;
  
  // Decrease confidence for inconsistencies
  if (analysis.riskLevel === 'high' && !analysis.shouldIntervene) confidence -= 15;
  if (analysis.stressLevel > 7 && analysis.riskLevel === 'low') confidence -= 10;
  
  return Math.max(60, Math.min(95, confidence));
}

/**
 * Generate fallback insight when AI analysis fails
 */
function generateFallbackInsight(context) {
  const { purchase, biometrics } = context;
  
  if (biometrics.currentStressLevel > 6) {
    return `High stress detected (${biometrics.currentStressLevel}/10). Consider waiting before purchasing ₹${purchase.amount} item.`;
  }
  
  if (purchase.urgencyIndicators?.length > 0) {
    return `Urgency signals detected. Take time to evaluate if you truly need this ₹${purchase.amount} purchase.`;
  }
  
  return `Analyzing ₹${purchase.amount} purchase for ${purchase.category}. Consider your budget and current financial goals.`;
}

/**
 * Generate fallback recommendations
 */
function generateFallbackRecommendations(context) {
  const recommendations = [];
  const { purchase, biometrics } = context;
  
  if (biometrics.currentStressLevel > 6) {
    recommendations.push('Take 5 minutes to do breathing exercises before deciding');
  }
  
  if (purchase.amount > 1000) {
    recommendations.push('Check if this purchase fits in your monthly budget');
    recommendations.push('Consider waiting 24 hours for purchases over ₹1000');
  } else {
    recommendations.push('Evaluate if you have similar items already');
  }
  
  return recommendations.slice(0, 3);
}

/**
 * Generate complete fallback analysis when AI fails
 */
function generateFallbackAnalysis(context) {
  return {
    shouldIntervene: context.biometrics.currentStressLevel > 6 || context.purchase.amount > 2000,
    riskLevel: context.biometrics.currentStressLevel > 7 ? 'high' : context.purchase.amount > 1500 ? 'medium' : 'low',
    stressLevel: context.biometrics.currentStressLevel,
    budgetImpact: Math.round((context.purchase.amount / context.userFinancials.monthlyIncome) * 100),
    keyFactors: [
      { type: 'info', message: `Purchase amount: ₹${context.purchase.amount}` },
      { type: 'info', message: `Current stress level: ${context.biometrics.currentStressLevel}/10` }
    ],
    aiInsights: generateFallbackInsight(context),
    smartRecommendations: generateFallbackRecommendations(context),
    alternatives: [],
    orderDetails: context.purchase,
    confidence: 65
  };
}

/**
 * Fallback to rule-based analysis when AI is unavailable
 */
async function fallbackRuleBasedAnalysis(data) {
  console.log('Using fallback rule-based analysis');
  
  const orderDetails = data.orderDetails || {};
  const userState = await fetchUserState(orderDetails.userId || 1).catch(() => getDefaultState());
  
  const analysis = {
    shouldIntervene: false,
    riskLevel: 'low',
    stressLevel: 4,
    budgetImpact: 5,
    keyFactors: [],
    aiInsights: 'AI analysis unavailable. Using rule-based assessment.',
    smartRecommendations: ['Consider your budget before purchasing', 'Wait if you\'re feeling stressed'],
    alternatives: [],
    orderDetails: orderDetails,
    confidence: 60
  };
  
  // Simple rule-based logic
  if (orderDetails.amount > 2000 || userState.stress_level === 'High') {
    analysis.shouldIntervene = true;
    analysis.riskLevel = 'medium';
    analysis.keyFactors.push({ type: 'warning', message: 'High purchase amount or stress detected' });
  }
  
  return analysis;
}

/**
 * Fetch recent biometric data for user
 */
async function fetchRecentBiometrics(userId) {
  try {
    const response = await fetch(`${API_URL}/historical/biometrics/${userId}?hours=24&count=20`);
    if (response.ok) {
      const data = await response.json();
      const biometrics = data.biometrics || [];
      
      if (biometrics.length > 0) {
        const latest = biometrics[biometrics.length - 1];
        const avgStress = biometrics.reduce((sum, b) => sum + (b.stress_level || 0), 0) / biometrics.length;
        
        return {
          current_stress: latest.stress_level || 3,
          avg_stress_7d: Math.round(avgStress * 10) / 10,
          current_hrv: latest.hrv_ms || 28,
          sleep_quality: latest.sleep_quality || 7
        };
      }
    }
  } catch (error) {
    console.error('Error fetching biometrics:', error);
  }
  
  // Return mock data if API fails
  return {
    current_stress: 4,
    avg_stress_7d: 4.2,
    current_hrv: 28,
    sleep_quality: 7
  };
}

/**
 * Fetch monthly expenses summary
 */
async function fetchMonthlyExpenses(userId) {
  try {
    const response = await fetch(`${API_URL}/user/${userId}/recent-activity?limit=100`);
    if (response.ok) {
      const data = await response.json();
      const transactions = data.recent_transactions || [];
      
      const thisMonth = new Date();
      const monthlyTransactions = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return txDate.getMonth() === thisMonth.getMonth() && txDate.getFullYear() === thisMonth.getFullYear();
      });
      
      const total = monthlyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      return { total, count: monthlyTransactions.length };
    }
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
  }
  
  return { total: 35000, count: 45 };
}

/**
 * Record AI intervention response with enhanced data
 */
async function recordAIInterventionResponse(data) {
  try {
    const payload = {
      user_id: extensionState.userId,
      url: data.url || 'unknown',
      intervention_action: data.intervention_action || 'unknown',
      accepted: data.accepted || false,
      timestamp: data.timestamp || new Date().toISOString(),
      ai_analysis: data.ai_analysis || null,
      page_context: data.page_context || null,
      analysis_type: 'ollama_ai'
    };
    
    console.log('🤖 Recording AI intervention:', payload);
    
    // Update daily stats
    const amount = data.ai_analysis?.orderDetails?.amount || 0;
    await updateTodayStats({
      type: 'intervention',
      amount: amount
    });
    
    // Try to send to backend if available
    try {
      const response = await fetch(`${API_URL}/intervention/ai-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log('✅ AI intervention recorded to backend');
      } else {
        console.log('📋 AI intervention recorded locally (backend unavailable)');
      }
    } catch (error) {
      console.log('📋 AI intervention recorded locally (backend offline)');
    }
  } catch (error) {
    console.error('❌ Error recording AI intervention:', error);
  }
}

/**
 * Analyze order details and determine if user is overspending
 */
async function analyzeOrderAndSpending(orderDetails, userState) {
  try {
    const spendingAnalysis = {
      isOverspending: false,
      riskLevel: 'low',
      reasons: [],
      recommendations: []
    };

    // High-value purchase check
    if (orderDetails.amount > 5000) {
      spendingAnalysis.isOverspending = true;
      spendingAnalysis.riskLevel = 'high';
      spendingAnalysis.reasons.push(`High-value purchase: ₹${orderDetails.amount}`);
    }

    // Medium-value purchase with risk factors
    if (orderDetails.amount > 2000) {
      spendingAnalysis.riskLevel = 'medium';
      spendingAnalysis.reasons.push(`Significant purchase amount: ₹${orderDetails.amount}`);
    }

    // Stress-based spending analysis
    if (userState.stress_level === 'High') {
      spendingAnalysis.isOverspending = true;
      spendingAnalysis.riskLevel = spendingAnalysis.riskLevel === 'high' ? 'high' : 'medium';
      spendingAnalysis.reasons.push('High stress level detected - increased risk of impulse buying');
      spendingAnalysis.recommendations.push('Take 10 minutes to relax before deciding');
    }

    if (userState.stress_level === 'Medium' && orderDetails.amount > 1000) {
      spendingAnalysis.isOverspending = true;
      spendingAnalysis.reasons.push('Moderate stress with significant purchase amount');
    }

    // Spending risk analysis
    if (userState.spending_risk === 'Critical') {
      spendingAnalysis.isOverspending = true;
      spendingAnalysis.riskLevel = 'high';
      spendingAnalysis.reasons.push('Your spending risk is currently CRITICAL');
      spendingAnalysis.recommendations.push('Consider avoiding non-essential purchases today');
    }

    if (userState.spending_risk === 'Warning' && orderDetails.amount > 1500) {
      spendingAnalysis.isOverspending = true;
      spendingAnalysis.riskLevel = 'medium';
      spendingAnalysis.reasons.push('Your spending is at WARNING level');
    }

    // Category-specific analysis
    const categoryRisks = {
      'Electronics': { threshold: 3000, message: 'Electronics can be expensive impulse purchases' },
      'Fashion': { threshold: 2000, message: 'Fashion items are often impulse purchases' },
      'Food': { threshold: 500, message: 'Frequent food ordering can add up quickly' }
    };

    const categoryRisk = categoryRisks[orderDetails.category];
    if (categoryRisk && orderDetails.amount > categoryRisk.threshold) {
      spendingAnalysis.reasons.push(categoryRisk.message);
      if (spendingAnalysis.riskLevel === 'low') {
        spendingAnalysis.riskLevel = 'medium';
      }
    }

    // Generate smart recommendations
    if (spendingAnalysis.isOverspending || spendingAnalysis.riskLevel !== 'low') {
      spendingAnalysis.recommendations.push('Wait 24 hours - if you still want it, it\'s likely not impulse');
      spendingAnalysis.recommendations.push('Check if you have a similar item already');
      
      if (orderDetails.amount > 2000) {
        spendingAnalysis.recommendations.push('Research cheaper alternatives');
        spendingAnalysis.recommendations.push('Check if this fits your monthly budget');
      }

      if (userState.savings_runway && userState.savings_runway.includes('Mo')) {
        const months = parseFloat(userState.savings_runway);
        if (months < 6) {
          spendingAnalysis.recommendations.push(`Your savings runway is only ${userState.savings_runway} - prioritize essentials`);
        }
      }
    }

      // Add investment-focused recommendations for larger purchases
      if (orderDetails.amount > 2000) {
        const monthlyReturn = (orderDetails.amount * 0.12) / 12; // Assume 12% annual return
        const projectedValue = orderDetails.amount * Math.pow(1.12, 10); // 10-year projection
        spendingAnalysis.recommendations.push(
          `💡 Investment alternative: ₹${orderDetails.amount} invested could generate ₹${monthlyReturn.toFixed(0)}/month returns`
        );
        spendingAnalysis.recommendations.push(
          `📈 Long-term opportunity: This amount could grow to ₹${projectedValue.toLocaleString()} in 10 years`
        );
      }
      
      // Site-specific spending advice
      if (orderDetails.site) {
        const siteAdvice = getSiteSpecificAdvice(orderDetails.site, orderDetails.amount, orderDetails.category);
        if (siteAdvice) {
          spendingAnalysis.recommendations.push(siteAdvice);
        }
      }    // Market-aware spending advice
    if (extensionState.marketData?.market_condition === MARKET_CONDITIONS.VOLATILE && orderDetails.amount > 5000) {
      spendingAnalysis.recommendations.push(
        '📈 Market volatility detected - consider deferring large purchases and investing during dips'
      );
    }
    
    // Add wealth-building mindset recommendations
    if (orderDetails.amount > 1000) {
      spendingAnalysis.recommendations.push(
        '💰 Consider: Will this purchase contribute to your long-term wealth or deplete it?'
      );
    }

    return spendingAnalysis;
  } catch (error) {
    console.error('Error analyzing spending:', error);
    return { isOverspending: false, riskLevel: 'low', reasons: [], recommendations: [] };
  }
}

/**
 * Get site-specific spending advice
 */
function getSiteSpecificAdvice(siteName, amount, category) {
  const site = siteName.toLowerCase();
  
  if (amount < 500) return null; // Only for significant purchases
  
  switch (site) {
    case 'amazon':
    case 'flipkart':
      if (category === 'electronics' && amount > 10000) {
        return '🔧 Electronics tip: Check if you really need the latest model - previous versions often offer 80% of features at 50% cost';
      }
      return '📦 E-commerce advice: Compare prices across platforms and check for upcoming sales';
      
    case 'myntra':
    case 'ajio':
      return '👗 Fashion mindful spending: Calculate cost-per-wear and prioritize versatile pieces over trendy items';
      
    case 'swiggy':
    case 'zomato':
      if (amount > 800) {
        return '🍽️ Food delivery insight: Frequent orders add up - consider meal planning and cooking to save significantly';
      }
      return '🥘 Smart eating: Home-cooked meals cost 70% less and are usually healthier';
      
    case 'nykaa':
    case 'purplle':
      return '💄 Beauty purchases: Focus on products you\'ll actually use regularly rather than trying every trend';
      
    case 'pepperfry':
    case 'urbanladder':
      return '🪑 Furniture advice: Quality pieces last decades - invest in timeless designs rather than trendy items';
      
    case 'firstcry':
      return '👶 Parenting purchases: Children outgrow items quickly - consider second-hand or borrowing for short-term needs';
      
    default:
      if (amount > 5000) {
        return '💡 Large purchase detected: Take 24 hours to think it over - true needs remain, wants often fade';
      }
      return null;
  }
}



/**
 * Check if URL is a shopping/spending site
 */
function isShoppingOrSpendingSite(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase().replace('www.', '');
    return SHOPPING_SITES.some(site => 
      domain.includes(site.toLowerCase()) || 
      domain.startsWith(site.toLowerCase() + '.') ||
      domain.endsWith('.' + site.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * Get site-specific selectors for button detection
 */
function getSiteSelectors(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase().replace('www.', '');
    
    // Find matching site configuration
    for (const [site, selectors] of Object.entries(SITE_SELECTORS)) {
      if (site !== 'generic' && 
          (domain.includes(site) || domain.startsWith(site + '.') || domain.endsWith('.' + site))) {
        return { ...SITE_SELECTORS.generic, ...selectors }; // Merge with generic selectors
      }
    }
    
    // Return generic selectors for unknown sites
    return SITE_SELECTORS.generic;
  } catch {
    return SITE_SELECTORS.generic;
  }
}

/**
 * Extract site name from URL for contextual analysis
 */
function extractSiteName(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase().replace('www.', '');
    
    // Check for exact matches first
    for (const site of SHOPPING_SITES) {
      if (domain.includes(site.toLowerCase())) {
        return site;
      }
    }
    
    // Return domain name if no specific match
    return domain.split('.')[0];
  } catch {
    return 'unknown';
  }
}

/**
 * Check if URL is a gig work site
 */
function isGigWorkSite(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    return GIG_SITES.some(site => domain.includes(site));
  } catch {
    return false;
  }
}

/**
 * Log intervention for analytics - stores in backend
 */
async function logIntervention(url, reason, severity) {
  try {
    const payload = {
      user_id: extensionState.userId,
      url: url,
      reason: reason,
      severity: severity,
      timestamp: new Date().toISOString()
    };
    
    console.log('Logging intervention:', payload);
    
    const response = await fetch(`${API_URL}/intervention/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Intervention logged successfully:', result);
    } else {
      console.warn('Failed to log intervention:', response.status);
    }
  } catch (error) {
    console.error('Error logging intervention:', error);
  }
}

// Message listener for content script communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.type || request.action);

  switch (request.type || request.action) {
    case 'analyzePurchase':
      console.log('🔍 Analyzing purchase request:', request.orderDetails);
      analyzePurchaseRequest(request.orderDetails, request.url).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('Error analyzing purchase:', error);
        sendResponse({ error: 'Analysis failed', shouldIntervene: false });
      });
      break;

    case 'aiAnalysis':
      console.log('🤖 AI analysis requested:', request.data);
      analyzeWithOllamaAI(request.data).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('AI analysis error:', error);
        sendResponse({ error: 'AI analysis failed' });
      });
      break;
      
    case 'getSiteConfig':
      console.log('🌐 Site configuration requested for:', request.url);
      const siteConfig = {
        selectors: getSiteSelectors(request.url),
        siteName: extractSiteName(request.url),
        isShoppingSite: isShoppingOrSpendingSite(request.url)
      };
      sendResponse(siteConfig);
      break;
      
    case 'extensionPing':
      sendResponse({ status: 'active', userId: extensionState.userId });
      break;

    default:
      // Handle old message format for backward compatibility
      handleMessage(request, sender, sendResponse);
  }
  
  return true; // Keep message channel open for async response
});

// Enhanced tab update listener to inject content script on all shopping sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('🌐 Tab updated:', tab.url);
    
    // Check if it's a shopping site
    if (isShoppingOrSpendingSite(tab.url)) {
      console.log('🛒 Shopping site detected, injecting enhanced content script');
      
      // Inject content script with site-specific configuration
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: initializeSiteSpecificIntegration,
        args: [{
          selectors: getSiteSelectors(tab.url),
          siteName: extractSiteName(tab.url),
          url: tab.url
        }]
      }).catch(error => {
        console.error('Failed to inject site-specific script:', error);
      });
    }
  }
});

async function handleMessage(request, sender, sendResponse) {
  try {
    switch (request.action) {
      case 'checkIntervention':
        const intervention = await fetchUserState(extensionState.userId);
        sendResponse(intervention);
        break;

      case 'recordIntervention':
        // Record intervention response
        await recordInterventionResponse(request.data);
        sendResponse({ success: true });
        break;

      case 'analyzePurchase':
        // Analyze purchase for overspending
        const purchaseAnalysis = await analyzePurchaseRequest(request.orderDetails, request.url);
        sendResponse(purchaseAnalysis);
        break;

      case 'analyzeWithOllama':
        // New AI-powered analysis with Ollama
        const aiAnalysis = await analyzeWithOllamaAI(request.data);
        sendResponse(aiAnalysis);
        break;

      case 'recordAIIntervention':
        // Record AI intervention with enhanced data
        await recordAIInterventionResponse(request.data);
        sendResponse({ success: true });
        break;

      case 'recordPurchase':
        await recordTransaction(request.data);
        sendResponse({ success: true });
        break;

      case 'toggleExtension':
        extensionState.isActive = request.enabled;
        await chrome.storage.local.set({ isActive: extensionState.isActive });
        sendResponse({ success: true, isActive: extensionState.isActive });
        break;

      case 'getUserState':
        const state = await fetchUserState(extensionState.userId);
        sendResponse(state);
        break;

      case 'toggleAI':
        extensionState.aiEnabled = request.enabled;
        await chrome.storage.local.set({ aiEnabled: extensionState.aiEnabled });
        sendResponse({ success: true, aiEnabled: extensionState.aiEnabled });
        break;

      case 'getExtensionStatus':
        sendResponse({ 
          isActive: extensionState.isActive,
          aiEnabled: extensionState.aiEnabled,
          userId: extensionState.userId
        });
        break;

      case 'getAIStatus':
        sendResponse({ 
          aiEnabled: extensionState.aiEnabled, 
          ollamaAvailable: extensionState.ollamaAvailable,
          model: AI_CONFIG.model
        });
        break;

      case 'testOllama':
        await checkOllamaAvailability();
        sendResponse({ available: extensionState.ollamaAvailable });
        break;

      case 'getAuthToken':
        // No auth required - return null
        sendResponse({ token: null });
        break;

      case 'setAuthToken':
        // No auth required - no-op
        sendResponse({ success: true });
        break;
        
      case 'updateTodayStats':
        // Update daily intervention statistics
        updateTodayStats(request.data);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

/**
 * Record a transaction when user completes a purchase
 */
async function recordTransaction(data) {
  try {
    await fetch(`${API_URL}/ingest/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: extensionState.userId,
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        merchant: data.merchant || 'Unknown',
        category: data.category || 'Other'
      })
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
  }
}

/**
 * Record intervention response - saves user's action to backend
 */
async function recordInterventionResponse(data) {
  try {
    const payload = {
      user_id: extensionState.userId,
      url: data.url || window.location.href,
      intervention_action: data.intervention_action || 'unknown',
      accepted: data.accepted || false,
      timestamp: data.timestamp || new Date().toISOString()
    };
    
    console.log('Recording intervention response:', payload);
    
    const response = await fetch(`${API_URL}/intervention/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log('Intervention response recorded successfully');
    } else {
      console.warn('Failed to record intervention response:', response.status);
    }
  } catch (error) {
    console.error('Error recording intervention response:', error);
  }
}

/**
 * Analyze purchase request and determine if intervention needed
 */
async function analyzePurchaseRequest(orderDetails, url) {
  console.log('🚀 =====================================');
  console.log('🚀 STARTING PURCHASE ANALYSIS');
  console.log('🚀 =====================================');
  
  try {
    // Extract purchase details
    const amount = parseFloat(orderDetails.amount) || extractAmountFromText(orderDetails.buttonText) || 0;
    const buttonType = orderDetails.buttonType || 'unknown';
    const site = orderDetails.site || 'unknown';
    const productTitle = orderDetails.title || orderDetails.buttonText || 'Unknown Product';
    
    // Get user's purchase history
    const history = await chrome.storage.local.get([
      'todayStats', 'lastStatsDate', 'purchaseHistory', 
      'monthlyBudget', 'weeklySpending', 'userPreferences'
    ]);
    
    const today = new Date().toDateString();
    const todayPurchases = history.todayStats?.interventions || 0;
    const weeklySpending = history.weeklySpending || 0;
    const monthlyBudget = history.monthlyBudget || 50000;
    
    // Build purchase context for Ollama
    const purchaseContext = {
      product: productTitle,
      amount: amount,
      site: site,
      time: new Date().toLocaleTimeString(),
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      todayPurchases: todayPurchases,
      weeklySpending: weeklySpending,
      remainingBudget: monthlyBudget - weeklySpending
    };
    
    console.log('📊 Purchase context for AI:', purchaseContext);
    
    // ========== TRY AI ANALYSIS FIRST ==========
    console.log('🤖 Attempting Ollama AI Analysis with model:', AI_CONFIG.model);
    
    let aiAnalysis = null;
    let aiPowered = false;
    let aiError = null;
    
    try {
      const startTime = Date.now();
      aiAnalysis = await getOllamaAnalysis(purchaseContext);
      const endTime = Date.now();
      
      if (aiAnalysis && aiAnalysis.reason) {
        aiPowered = true;
        console.log(`✅ AI Analysis SUCCESS in ${endTime - startTime}ms:`, aiAnalysis);
      } else {
        console.warn('⚠️ AI returned empty/invalid response:', aiAnalysis);
        aiAnalysis = null;
      }
    } catch (ollamaError) {
      aiError = ollamaError.message;
      console.error('❌ Ollama AI Error:', ollamaError);
    }
    
    // ========== BUILD RESULT ==========
    let result;
    
    if (aiPowered && aiAnalysis) {
      // USE AI RESPONSE
      console.log('🎯 Using AI-POWERED analysis');
      result = {
        shouldIntervene: aiAnalysis.shouldIntervene !== false,
        riskLevel: aiAnalysis.riskLevel || 'medium',
        eligibility: aiAnalysis.shouldIntervene ? 
          (aiAnalysis.riskLevel === 'high' ? '⚠️ Not Recommended' : '🟡 Proceed with Caution') : 
          '✅ Looks Good',
        reasons: [aiAnalysis.reason || 'AI analysis completed'],
        recommendations: [aiAnalysis.recommendation || 'Consider your financial goals'],
        aiPowered: true,
        aiModel: AI_CONFIG.model,
        orderDetails: {
          ...orderDetails,
          amount: amount,
          product_name: productTitle
        },
        analysis: {
          amount: amount,
          productName: productTitle,
          site: site,
          buttonType: buttonType,
          todayPurchases: todayPurchases,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      // FALLBACK TO RULE-BASED
      console.log('📋 Using RULE-BASED analysis (AI unavailable)');
      
      let shouldIntervene = true; // Always show for purchases
      let riskLevel = 'low';
      let reasons = [];
      let recommendations = [];
      
      if (amount > 10000) {
        riskLevel = 'high';
        reasons.push(`High-value purchase: ₹${amount.toLocaleString()}`);
        recommendations.push('Consider if this fits your monthly budget');
      } else if (amount > 2000) {
        riskLevel = 'medium';
        reasons.push(`Moderate expense: ₹${amount.toLocaleString()}`);
        recommendations.push('Wait 24 hours before making this purchase');
      } else {
        reasons.push('Purchase detected for review');
        recommendations.push('Consider your financial goals');
      }
      
      if (todayPurchases >= 3) {
        riskLevel = 'high';
        reasons.push(`${todayPurchases} purchases already made today`);
        recommendations.push('Consider taking a break from shopping');
      }
      
      if (aiError) {
        reasons.push(`AI unavailable: ${aiError}`);
      }
      
      result = {
        shouldIntervene: shouldIntervene,
        riskLevel: riskLevel,
        eligibility: riskLevel === 'high' ? '⚠️ Not Recommended' : 
                    riskLevel === 'medium' ? '🟡 Proceed with Caution' : '✅ Looks Good',
        reasons: reasons,
        recommendations: recommendations,
        aiPowered: false,
        aiError: aiError,
        orderDetails: {
          ...orderDetails,
          amount: amount,
          product_name: productTitle
        },
        analysis: {
          amount: amount,
          productName: productTitle,
          site: site,
          buttonType: buttonType,
          todayPurchases: todayPurchases,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    // Update stats
    await updateTodayStats({ interventions: 1, potentialSavings: amount || 500 });
    
    console.log('🏁 FINAL RESULT:', result);
    console.log('🏁 AI Powered:', result.aiPowered);
    console.log('🚀 =====================================');
    
    return result;
    
  } catch (error) {
    console.error('❌ Critical analysis error:', error);
    return {
      shouldIntervene: true,
      riskLevel: 'medium',
      eligibility: '⚠️ Review Needed',
      reasons: ['Error during analysis - please review manually'],
      recommendations: ['Consider if this purchase is necessary'],
      aiPowered: false,
      error: error.message,
      orderDetails: orderDetails
    };
  }
}

async function getOllamaAnalysis(purchaseContext) {
  console.log('🤖 ===== CALLING OLLAMA =====');
  console.log('🤖 Model:', AI_CONFIG.model);
  console.log('🤖 Endpoint: http://localhost:11434/api/generate');
  
  const prompt = `You are FinSphere AI, a financial wellness advisor. Analyze this purchase.

PURCHASE:
- Product: ${purchaseContext.product}
- Price: ₹${purchaseContext.amount || 'Unknown'}
- Site: ${purchaseContext.site}
- Time: ${purchaseContext.time} (${purchaseContext.dayOfWeek})

USER CONTEXT:
- Today's purchases: ${purchaseContext.todayPurchases}
- Weekly spending: ₹${purchaseContext.weeklySpending}
- Budget remaining: ₹${purchaseContext.remainingBudget}

Respond with ONLY this JSON (no other text):
{"shouldIntervene": true, "riskLevel": "medium", "reason": "short reason here", "recommendation": "short advice here"}`;

  const requestBody = {
    model: AI_CONFIG.model,
    prompt: prompt,
    stream: false,
    options: {
      temperature: 0.3,
      num_predict: 200
    }
  };
  
  console.log('🤖 Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  console.log('🤖 Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('🤖 Ollama error response:', errorText);
    throw new Error(`Ollama request failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('🤖 Ollama raw response:', data);
  
  const responseText = data.response || '';
  console.log('🤖 Response text:', responseText);
  
  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('🤖 Parsed AI response:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('🤖 JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }
  }
  
  throw new Error('No valid JSON found in AI response');
}

// Helper function to extract amount from button text
function extractAmountFromText(text) {
  if (!text) return 0;
  const matches = text.match(/[₹$€£¥]?([0-9,]+\.?[0-9]*)/g);
  if (matches) {
    const cleanNumber = matches[0].replace(/[₹$€£¥,]/g, '');
    return parseFloat(cleanNumber) || 0;
  }
  return 0;
}


// Periodic check for pending interventions with AI intelligence
setInterval(() => {
  if (extensionState.isActive) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Only check if user hasn't been checked recently
        const now = Date.now();
        if (now - extensionState.lastCheckTime > 120000) { // 2 minutes minimum
          extensionState.lastCheckTime = now;
          
          // Use AI-enhanced opportunity detection
          if (extensionState.aiEnabled && extensionState.ollamaAvailable) {
            checkForAIPoweredIntervention(tabs[0]);
          } else {
            checkForPurchaseOpportunity(tabs[0]);
          }
        }
      }
    });
  }
}, 60000); // Check every 60 seconds

/**
 * Fetch real-time market data for investment analysis
 */
async function fetchMarketData() {
  try {
    // Simulated market data - in production, integrate with real market APIs
    const marketData = {
      timestamp: new Date().toISOString(),
      nifty_change: (Math.random() - 0.5) * 5, // -2.5% to +2.5%
      sensex_change: (Math.random() - 0.5) * 5,
      vix_level: 12 + Math.random() * 23, // 12-35 range
      gold_price: 62000 + Math.random() * 6000,
      usd_inr: 82.5 + Math.random() * 2,
      bond_yield_10y: 6.8 + Math.random() * 0.7,
      market_condition: determineMarketCondition(),
      sector_performance: {
        'IT': (Math.random() - 0.5) * 6,
        'Banking': (Math.random() - 0.5) * 6,
        'Pharma': (Math.random() - 0.5) * 6,
        'Auto': (Math.random() - 0.5) * 6,
        'Energy': (Math.random() - 0.5) * 6
      }
    };
    
    extensionState.marketData = marketData;
    extensionState.lastMarketUpdate = Date.now();
    console.log('📈 Market data updated:', marketData);
    return marketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return getDefaultMarketData();
  }
}

/**
 * Determine market condition based on indicators
 */
function determineMarketCondition() {
  const conditions = Object.values(MARKET_CONDITIONS);
  return conditions[Math.floor(Math.random() * conditions.length)];
}

/**
 * Get default market data if fetch fails
 */
function getDefaultMarketData() {
  return {
    timestamp: new Date().toISOString(),
    nifty_change: 0.5,
    sensex_change: 0.4,
    vix_level: 18.0,
    gold_price: 65000,
    usd_inr: 83.2,
    bond_yield_10y: 7.1,
    market_condition: MARKET_CONDITIONS.SIDEWAYS,
    sector_performance: { 'IT': 0.5, 'Banking': 0.3, 'Pharma': -0.2 }
  };
}

/**
 * Create user investment profile based on behavior analysis
 */
async function createUserInvestmentProfile(userId, historicalData) {
  try {
    const biometrics = historicalData.biometrics || [];
    const transactions = historicalData.transactions || [];
    const interventions = historicalData.interventions || [];
    
    // Calculate behavioral metrics
    const spendingVariance = calculateSpendingVariance(transactions);
    const behavioralScore = calculateBehavioralScore(interventions, biometrics);
    const monthlySurplus = estimateMonthlySurplus(transactions);
    
    const profile = {
      user_id: userId,
      risk_appetite: determineRiskAppetite(spendingVariance, behavioralScore),
      investment_horizon: 'medium',
      monthly_surplus: monthlySurplus,
      spending_personality: determineSpendingPersonality(transactions),
      stress_baseline: calculateStressBaseline(biometrics),
      emergency_fund_months: 2 + Math.random() * 6, // 2-8 months
      investment_goals: ['wealth_building', 'tax_saving'],
      behavioral_score: behavioralScore
    };
    
    extensionState.userInvestmentProfile = profile;
    console.log('👤 User investment profile created:', profile);
    return profile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return getDefaultUserProfile(userId);
  }
}

/**
 * Calculate spending variance for risk assessment
 */
function calculateSpendingVariance(transactions) {
  if (!transactions || transactions.length < 2) return 500;
  
  const amounts = transactions.map(t => t.amount || 0);
  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  
  return variance;
}

/**
 * Calculate behavioral score based on intervention history
 */
function calculateBehavioralScore(interventions, biometrics) {
  if (!interventions || interventions.length === 0) return 0.3;
  
  const ignoredCount = interventions.filter(i => i.user_action === 'proceeded').length;
  const ignoreRate = ignoredCount / interventions.length;
  
  // Factor in stress levels
  let avgStress = 0.5;
  if (biometrics && biometrics.length > 0) {
    avgStress = biometrics.reduce((sum, b) => sum + (b.stress_level || 5), 0) / (biometrics.length * 10);
  }
  
  return Math.min(1.0, ignoreRate * 0.7 + avgStress * 0.3);
}

/**
 * Estimate monthly investable surplus
 */
function estimateMonthlySurplus(transactions) {
  if (!transactions || transactions.length === 0) return 5000;
  
  const recentSpending = transactions.slice(-30).reduce((sum, t) => sum + (t.amount || 0), 0);
  const estimatedSurplus = Math.max(1000, recentSpending * 0.2);
  
  return Math.min(estimatedSurplus, 50000);
}

/**
 * Determine risk appetite based on behavior
 */
function determineRiskAppetite(spendingVariance, behavioralScore) {
  if (behavioralScore > 0.7 || spendingVariance < 500) {
    return RISK_LEVELS.CONSERVATIVE;
  } else if (spendingVariance > 2000 && behavioralScore < 0.4) {
    return RISK_LEVELS.AGGRESSIVE;
  } else {
    return RISK_LEVELS.MODERATE;
  }
}

/**
 * Determine spending personality from transaction patterns
 */
function determineSpendingPersonality(transactions) {
  if (!transactions || transactions.length === 0) return 'balanced';
  
  const discretionaryCategories = ['fashion', 'entertainment', 'dining', 'electronics'];
  const discretionaryCount = transactions.filter(t => 
    discretionaryCategories.includes(t.category?.toLowerCase())
  ).length;
  
  const ratio = discretionaryCount / transactions.length;
  return ratio > 0.4 ? 'lifestyle' : ratio < 0.2 ? 'conservative' : 'balanced';
}

/**
 * Calculate baseline stress level from biometrics
 */
function calculateStressBaseline(biometrics) {
  if (!biometrics || biometrics.length === 0) return 4.0;
  
  const levels = biometrics.map(b => b.stress_level || 5);
  return levels.reduce((sum, val) => sum + val, 0) / levels.length;
}

/**
 * Get default user profile if analysis fails
 */
function getDefaultUserProfile(userId) {
  return {
    user_id: userId,
    risk_appetite: RISK_LEVELS.MODERATE,
    investment_horizon: 'medium',
    monthly_surplus: 5000,
    spending_personality: 'balanced',
    stress_baseline: 4.0,
    emergency_fund_months: 4.0,
    investment_goals: ['wealth_building'],
    behavioral_score: 0.3
  };
}

/**
 * Generate comprehensive investment recommendation using hybrid analysis
 */
async function generateInvestmentRecommendation(userId, orderDetails, userFinancialState) {
  try {
    console.log('🔬 Generating investment recommendation for user:', userId);
    
    // Step 1: Ensure we have fresh market data (update every 5 minutes)
    const now = Date.now();
    if (!extensionState.marketData || now - extensionState.lastMarketUpdate > 300000) {
      await fetchMarketData();
    }
    
    // Step 2: Create/update user profile
    const historicalData = {
      biometrics: userFinancialState.biometrics || [],
      transactions: userFinancialState.transactions || [],
      interventions: extensionState.interventionHistory || []
    };
    
    if (!extensionState.userInvestmentProfile) {
      await createUserInvestmentProfile(userId, historicalData);
    }
    
    // Step 3: Generate base allocation
    const baseAllocation = generateBaseAllocation(extensionState.userInvestmentProfile);
    
    // Step 4: Apply market-based risk overrides
    const finalAllocation = applyRiskOverrides(
      baseAllocation, 
      extensionState.userInvestmentProfile, 
      extensionState.marketData
    );
    
    // Step 5: Generate specific instruments
    const instruments = recommendSpecificInstruments(finalAllocation, extensionState.marketData);
    
    // Step 6: Calculate optimal SIP amount
    const sipAmount = calculateOptimalSip(extensionState.userInvestmentProfile);
    
    // Step 7: Generate AI-powered reasoning
    const reasoning = await generateInvestmentReasoning(
      extensionState.userInvestmentProfile, 
      extensionState.marketData, 
      finalAllocation,
      orderDetails
    );
    
    const recommendation = {
      user_id: userId,
      recommended_allocation: finalAllocation,
      risk_level: extensionState.userInvestmentProfile.risk_appetite,
      monthly_sip_amount: sipAmount,
      specific_instruments: instruments,
      reasoning: reasoning,
      confidence_score: calculateInvestmentConfidence(),
      market_context: summarizeMarketContext(extensionState.marketData),
      warnings: generateInvestmentWarnings(),
      alternatives: generateAlternativeStrategies(),
      review_date: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('💰 Investment recommendation generated:', recommendation);
    return recommendation;
    
  } catch (error) {
    console.error('Error generating investment recommendation:', error);
    return generateFallbackInvestmentRecommendation(userId);
  }
}

/**
 * Generate base asset allocation based on user profile
 */
function generateBaseAllocation(userProfile) {
  const allocations = {
    [RISK_LEVELS.CONSERVATIVE]: { equity: 0.30, debt: 0.50, liquid: 0.15, gold: 0.05 },
    [RISK_LEVELS.MODERATE]: { equity: 0.60, debt: 0.25, liquid: 0.10, gold: 0.05 },
    [RISK_LEVELS.AGGRESSIVE]: { equity: 0.80, debt: 0.10, liquid: 0.05, gold: 0.05 }
  };
  
  let allocation = {...allocations[userProfile.risk_appetite]};
  
  // Adjust for high emotional behavior
  if (userProfile.behavioral_score > 0.7) {
    const reduction = 0.15;
    allocation.equity = Math.max(0.2, allocation.equity - reduction);
    allocation.debt += reduction * 0.7;
    allocation.liquid += reduction * 0.3;
  }
  
  return allocation;
}

/**
 * Apply risk overrides based on market conditions and user state
 */
function applyRiskOverrides(baseAllocation, userProfile, marketData) {
  let allocation = {...baseAllocation};
  const rules = [];
  
  // Market crash protection
  if (marketData.nifty_change < -3.0) {
    const reduction = allocation.equity * 0.2;
    allocation.equity -= reduction;
    allocation.debt += reduction * 0.7;
    allocation.liquid += reduction * 0.3;
    rules.push('market_crash_protection');
  }
  
  // High volatility adjustment
  if (marketData.vix_level > 25) {
    const move = allocation.equity * 0.15;
    allocation.equity -= move;
    allocation.debt += move;
    rules.push('volatility_adjustment');
  }
  
  // Emergency fund priority
  if (userProfile.emergency_fund_months < 3) {
    Object.keys(allocation).forEach(key => {
      if (key !== 'liquid') allocation[key] *= 0.7;
    });
    allocation.liquid += 0.3;
    rules.push('emergency_fund_priority');
  }
  
  // Normalize to 100%
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(allocation).forEach(key => allocation[key] /= total);
  }
  
  console.log('🛡️ Applied risk rules:', rules);
  return allocation;
}

/**
 * Recommend specific investment instruments
 */
function recommendSpecificInstruments(allocation, marketData) {
  const instruments = [];
  
  if (allocation.equity > 0) {
    instruments.push({
      type: 'equity',
      name: marketData.market_condition === MARKET_CONDITIONS.VOLATILE ? 
             'Large Cap Index Fund' : 'Nifty 50 Index Fund',
      allocation: allocation.equity,
      reason: marketData.market_condition === MARKET_CONDITIONS.VOLATILE ? 
              'Stability during volatility' : 'Broad market exposure'
    });
  }
  
  if (allocation.debt > 0) {
    instruments.push({
      type: 'debt',
      name: marketData.bond_yield_10y > 7.2 ? 'Long Duration Fund' : 'Short Duration Fund',
      allocation: allocation.debt,
      reason: marketData.bond_yield_10y > 7.2 ? 'Lock in high yields' : 'Lower rate risk'
    });
  }
  
  if (allocation.liquid > 0) {
    instruments.push({
      type: 'liquid',
      name: 'Liquid Fund',
      allocation: allocation.liquid,
      reason: 'Emergency fund and flexibility'
    });
  }
  
  if (allocation.gold > 0) {
    instruments.push({
      type: 'gold',
      name: 'Gold ETF',
      allocation: allocation.gold,
      reason: 'Inflation hedge'
    });
  }
  
  return instruments;
}

/**
 * Calculate optimal SIP amount based on user profile
 */
function calculateOptimalSip(userProfile) {
  let available = userProfile.monthly_surplus * 0.8;
  
  if (userProfile.emergency_fund_months < 6) {
    available *= 0.6; // Reserve more for emergency fund
  }
  
  return Math.max(1000, Math.min(available, 25000));
}

/**
 * Generate investment reasoning using Ollama AI
 */
async function generateInvestmentReasoning(userProfile, marketData, allocation, orderDetails) {
  try {
    const prompt = `As a financial advisor, provide a concise 2-3 sentence explanation for this investment recommendation:

User: ${userProfile.risk_appetite} risk, ₹${userProfile.monthly_surplus}/month surplus, ${userProfile.emergency_fund_months.toFixed(1)} months emergency fund
Market: Nifty ${marketData.nifty_change.toFixed(1)}%, VIX ${marketData.vix_level.toFixed(1)}, ${marketData.market_condition}
Allocation: ${(allocation.equity*100).toFixed(0)}% equity, ${(allocation.debt*100).toFixed(0)}% debt, ${(allocation.liquid*100).toFixed(0)}% liquid
Context: ${orderDetails?.product_name || 'Investment planning'}

Explain why this allocation suits the user given current conditions:`;

    const response = await queryOllamaAI(prompt);
    return response || generateFallbackReasoning(userProfile, marketData);
  } catch (error) {
    return generateFallbackReasoning(userProfile, marketData);
  }
}

/**
 * Generate fallback reasoning when AI is unavailable
 */
function generateFallbackReasoning(userProfile, marketData) {
  return `Based on your ${userProfile.risk_appetite} risk profile and ₹${userProfile.monthly_surplus} monthly surplus, this allocation balances growth and stability. Current market volatility (VIX: ${marketData.vix_level.toFixed(1)}) supports maintaining diversification across asset classes.`;
}

/**
 * Calculate confidence score for the recommendation
 */
function calculateInvestmentConfidence() {
  let confidence = 0.8;
  
  if (extensionState.marketData?.vix_level > 25) confidence -= 0.1;
  if (extensionState.userInvestmentProfile?.behavioral_score > 0.7) confidence -= 0.1;
  if (extensionState.userInvestmentProfile?.emergency_fund_months < 2) confidence -= 0.15;
  
  return Math.max(0.5, Math.min(0.95, confidence));
}

/**
 * Summarize market context for user
 */
function summarizeMarketContext(marketData) {
  const direction = marketData.nifty_change > 0 ? 'up' : 'down';
  const vixLevel = marketData.vix_level > 25 ? 'high' : marketData.vix_level > 18 ? 'moderate' : 'low';
  
  return `Nifty ${direction} ${Math.abs(marketData.nifty_change).toFixed(1)}%, volatility ${vixLevel}, condition: ${marketData.market_condition}`;
}

/**
 * Generate warnings based on user profile and market conditions
 */
function generateInvestmentWarnings() {
  const warnings = [];
  
  if (extensionState.userInvestmentProfile?.behavioral_score > 0.6) {
    warnings.push('⚠️ High emotional tendency - consider systematic investing');
  }
  
  if (extensionState.userInvestmentProfile?.emergency_fund_months < 3) {
    warnings.push('🚨 Build emergency fund before aggressive investing');
  }
  
  if (extensionState.marketData?.vix_level > 25) {
    warnings.push('⚠️ High volatility - expect short-term fluctuations');
  }
  
  return warnings;
}

/**
 * Generate alternative investment strategies
 */
function generateAlternativeStrategies() {
  return [
    {
      name: 'Conservative',
      allocation: { equity: 0.3, debt: 0.5, liquid: 0.2 },
      description: 'Lower risk, stable returns',
      expected_return: '8-10% annually'
    },
    {
      name: 'Growth Focused',
      allocation: { equity: 0.8, debt: 0.1, liquid: 0.1 },
      description: 'Higher risk, higher potential',
      expected_return: '12-15% annually'
    }
  ];
}

/**
 * Generate fallback investment recommendation
 */
function generateFallbackInvestmentRecommendation(userId) {
  return {
    user_id: userId,
    recommended_allocation: { equity: 0.6, debt: 0.3, liquid: 0.1 },
    risk_level: RISK_LEVELS.MODERATE,
    monthly_sip_amount: 5000,
    specific_instruments: [{
      type: 'equity',
      name: 'Nifty 50 Index Fund',
      allocation: 0.6,
      reason: 'Balanced market exposure'
    }],
    reasoning: 'Default recommendation due to limited data. Please consult advisor.',
    confidence_score: 0.6,
    market_context: 'Market data unavailable',
    warnings: ['⚠️ Limited data - please review'],
    alternatives: [],
    review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * AI-powered intervention detection
 */
async function checkForAIPoweredIntervention(tab) {
  try {
    const isRelevantSite = isShoppingOrSpendingSite(tab.url) || isGigWorkSite(tab.url);
    
    if (!isRelevantSite) {
      return; // Not a relevant page for financial intervention
    }
    
    console.log('🤖 Running AI-powered intervention check for:', tab.url);
    
    // Get current user financial and biometric state
    const userState = await fetchUserState(extensionState.userId);
    
    // Basic AI-driven decision: intervene if high stress + shopping site
    if (userState.stress_level === 'High' && isShoppingOrSpendingSite(tab.url)) {
      // Send preemptive intervention message
      chrome.tabs.sendMessage(tab.id, {
        action: 'showIntervention',
        data: {
          reason: '🧠 AI detected high stress levels during shopping. Consider taking a break before making purchases.',
          severity: 'high',
          userState: userState,
          delay_minutes: 10,
          pageType: 'shopping',
          timestamp: new Date().toISOString(),
          aiPowered: true
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to show AI intervention:', chrome.runtime.lastError);
        } else {
          console.log('✅ AI intervention displayed');
        }
      });
    }
    
  } catch (error) {
    console.error('Error in AI-powered intervention check:', error);
    // Fallback to regular check
    checkForPurchaseOpportunity(tab);
  }
}

/**
 * Function to be injected into shopping sites for enhanced integration
 */
function initializeSiteSpecificIntegration(siteConfig) {
  console.log('🚀 Initializing FinSphere for:', siteConfig.siteName);
  
  // Store site configuration globally
  window.finSphereSiteConfig = siteConfig;
  
  // Enhanced button detection with site-specific selectors
  function findPurchaseButtons() {
    const buttons = [];
    const selectors = siteConfig.selectors;
    
    // Check all selector types
    ['buyNow', 'addToCart', 'checkout'].forEach(type => {
      selectors[type]?.forEach(selector => {
        try {
          // Handle different selector types
          if (selector.includes(':contains')) {
            // Custom contains selector
            const [baseSelector, text] = selector.split(':contains');
            const elements = document.querySelectorAll(baseSelector || '*');
            elements.forEach(el => {
              if (el.textContent.toLowerCase().includes(text.replace(/[()"]/g, '').toLowerCase())) {
                buttons.push({ element: el, type, selector });
              }
            });
          } else {
            // Standard CSS selector
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => buttons.push({ element: el, type, selector }));
          }
        } catch (e) {
          console.warn('Invalid selector:', selector, e);
        }
      });
    });
    
    return buttons;
  }
  
  // Monitor for dynamically loaded buttons
  function setupButtonMonitoring() {
    const observer = new MutationObserver(() => {
      const buttons = findPurchaseButtons();
      buttons.forEach(({ element, type }) => {
        if (!element.dataset.finSphereIntegrated) {
          element.dataset.finSphereIntegrated = 'true';
          element.addEventListener('click', (e) => handlePurchaseClick(e, type), { capture: true });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
    
    // Initial button setup
    setTimeout(() => {
      const buttons = findPurchaseButtons();
      buttons.forEach(({ element, type }) => {
        element.dataset.finSphereIntegrated = 'true';
        element.addEventListener('click', (e) => handlePurchaseClick(e, type), { capture: true });
      });
    }, 1000);
  }
  
  // Enhanced purchase click handler
  function handlePurchaseClick(event, buttonType) {
    console.log('🛒 Purchase button clicked:', buttonType, siteConfig.siteName);
    
    // Extract purchase details using site-specific logic
    const purchaseDetails = extractPurchaseDetails(siteConfig.siteName, buttonType);
    
    // Send to background script for analysis
    chrome.runtime.sendMessage({
      type: 'analyzePurchase',
      orderDetails: purchaseDetails,
      url: window.location.href,
      buttonType: buttonType,
      siteName: siteConfig.siteName
    }, (response) => {
      if (response?.shouldIntervene) {
        event.preventDefault();
        event.stopPropagation();
        
        // Show intervention UI
        showSiteSpecificIntervention(response, event.target);
      }
    });
  }
  
  // Site-specific purchase detail extraction
  function extractPurchaseDetails(siteName, buttonType) {
    const details = {
      site: siteName,
      buttonType: buttonType,
      timestamp: new Date().toISOString(),
      amount: 0,
      product_name: '',
      category: '',
      url: window.location.href
    };
    
    try {
      switch (siteName.toLowerCase()) {
        case 'amazon':
          details.product_name = document.querySelector('#productTitle, .a-size-large')?.textContent?.trim() || '';
          details.amount = parseFloat(document.querySelector('.a-price-whole, .a-price .a-offscreen')?.textContent?.replace(/[^\d.]/g, '') || '0');
          details.category = document.querySelector('#nav-subnav [data-menu-id]')?.getAttribute('data-menu-id') || 'general';
          break;
          
        case 'flipkart':
          details.product_name = document.querySelector('.B_NuCI, ._35KyD6')?.textContent?.trim() || '';
          details.amount = parseFloat(document.querySelector('._30jeq3, ._1_WHN1')?.textContent?.replace(/[^\d.]/g, '') || '0');
          details.category = document.querySelector('._1QZ6fC a')?.textContent?.toLowerCase() || 'general';
          break;
          
        case 'myntra':
          details.product_name = document.querySelector('.pdp-name, h1')?.textContent?.trim() || '';
          details.amount = parseFloat(document.querySelector('.pdp-price, .product-price')?.textContent?.replace(/[^\d.]/g, '') || '0');
          details.category = 'fashion';
          break;
          
        case 'swiggy':
        case 'zomato':
          details.product_name = document.querySelector('h1, .restaurant-name')?.textContent?.trim() || 'Food Order';
          details.amount = parseFloat(document.querySelector('.total-amount, .bill-total')?.textContent?.replace(/[^\d.]/g, '') || '0');
          details.category = 'food';
          break;
          
        default:
          // Generic extraction
          details.product_name = document.querySelector('h1, .product-title, .item-title')?.textContent?.trim() || 
                               document.title.split('|')[0].trim();
          details.amount = parseFloat(
            (document.querySelector('.price, .cost, .amount, [class*="price"]')?.textContent || '0')
            .replace(/[^\d.]/g, '')
          );
          details.category = 'general';
      }
    } catch (error) {
      console.error('Error extracting purchase details:', error);
    }
    
    return details;
  }
  
  // Site-specific intervention display
  function showSiteSpecificIntervention(analysis, buttonElement) {
    // Remove existing interventions
    document.querySelectorAll('.finsphere-intervention').forEach(el => el.remove());
    
    // Create intervention overlay
    const overlay = document.createElement('div');
    overlay.className = 'finsphere-intervention';
    overlay.innerHTML = `
      <div class="finsphere-modal" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">🛡️</div>
          <h2 style="color: #dc2626; margin: 0; font-size: 24px;">FinSphere Smart Alert</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0;">AI-Powered Purchase Analysis for ${siteConfig.siteName}</p>
        </div>
        
        ${analysis.investmentRecommendation ? `
          <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5016 100%); color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0;">💰 Investment Opportunity</h4>
            <p style="margin: 5px 0; font-size: 14px;">Monthly SIP Alternative: ₹${analysis.investmentRecommendation.monthly_sip_amount?.toLocaleString()}</p>
            <p style="margin: 5px 0; font-size: 14px;">${analysis.investmentRecommendation.reasoning || 'Consider investing this amount for long-term wealth building'}</p>
          </div>
        ` : ''}
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b; margin: 15px 0;">
          <h4 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Purchase Analysis</h4>
          <div style="color: #92400e;">
            ${analysis.reasons?.map(reason => `<p style="margin: 5px 0;">• ${reason}</p>`).join('') || ''}
          </div>
        </div>
        
        ${analysis.recommendations?.length > 0 ? `
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #22c55e; margin: 15px 0;">
            <h4 style="color: #166534; margin: 0 0 10px 0;">💡 Smart Recommendations</h4>
            ${analysis.recommendations.map(rec => `<p style="color: #166534; margin: 5px 0;">• ${rec}</p>`).join('')}
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button id="fs-proceed-${siteConfig.siteName}" style="
            flex: 1;
            background: #ef4444;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          ">⚠️ Buy Anyway</button>
          <button id="fs-cancel-${siteConfig.siteName}" style="
            flex: 1;
            background: #10b981;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          ">🛡️ Smart Choice - Cancel</button>
        </div>
        
        <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #6b7280;">
          AI Confidence: ${(analysis.confidence || 85)}% | Powered by FinSphere
        </div>
      </div>
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
      "></div>
    `;
    
    document.body.appendChild(overlay);
    
    // Event handlers
    document.getElementById(`fs-proceed-${siteConfig.siteName}`).addEventListener('click', () => {
      document.body.removeChild(overlay);
      // Continue with original purchase
      buttonElement.click();
    });
    
    document.getElementById(`fs-cancel-${siteConfig.siteName}`).addEventListener('click', () => {
      document.body.removeChild(overlay);
      console.log('💰 Purchase cancelled by user - Smart financial decision!');
    });
  }
  
  // Initialize the monitoring
  setupButtonMonitoring();
  
  console.log('✅ FinSphere integration active for', siteConfig.siteName);
}

/**
 * Update today's intervention statistics
 */
async function updateTodayStats(data) {
  try {
    const today = new Date().toDateString();
    const stats = await chrome.storage.local.get(['todayStats', 'lastStatsDate']);
    
    // Reset stats if it's a new day
    let todayStats = stats.todayStats || { interventions: 0, potentialSavings: 0 };
    if (stats.lastStatsDate !== today) {
      todayStats = { interventions: 0, potentialSavings: 0 };
    }
    
    // Update stats
    if (data.type === 'intervention') {
      todayStats.interventions += 1;
      todayStats.potentialSavings += data.amount || 0;
    }
    
    // Save updated stats
    await chrome.storage.local.set({
      todayStats: todayStats,
      lastStatsDate: today
    });
    
    console.log('📈 Updated today\'s stats:', todayStats);
  } catch (error) {
    console.error('Error updating today\'s stats:', error);
  }
}

// Periodic Ollama availability check
setInterval(() => {
  if (extensionState.aiEnabled) {
    checkOllamaAvailability();
  }
}, 5 * 60 * 1000); // Check every 5 minutes

