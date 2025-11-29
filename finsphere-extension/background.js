/**
 * FinSphere Extension - Background Agent
 * Autonomous purchase interception and financial wellness agent
 */

const API_URL = 'http://localhost:8000/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

// Shopping & spending sites pattern
const SHOPPING_SITES = [
  'amazon', 'myntra', 'flipkart', 'swiggy', 'zomato', 'olx', 'ebay', 'alibaba',
  'walmart', 'target', 'etsy', 'bestbuy', 'aliexpress', 'wish'
];

const GIG_SITES = [
  'upwork', 'fiverr', 'freelancer', 'toptal', 'uber', 'ola', 'lyft'
];

// Extension state
let extensionState = {
  userId: null,
  isActive: true,
  lastCheckTime: 0,
  checkInterval: 5000, // 5 seconds
  pendingInterventions: [],
};

/**
 * Get authentication token from storage
 */
async function getAuthToken() {
  return null; // Auth disabled
}

/**
 * Set authentication token in storage
 */
async function setAuthToken(token) {
  // Auth disabled - no-op
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('FinSphere Extension Installed');
  initializeExtension();
});

async function initializeExtension() {
  const stored = await chrome.storage.local.get(['userId', 'isActive']);
  
  if (!stored.userId) {
    extensionState.userId = 'ext_user_' + Math.random().toString(36).substr(2, 9);
    await chrome.storage.local.set({ userId: extensionState.userId });
  } else {
    extensionState.userId = stored.userId;
  }
  extensionState.isActive = stored.isActive !== false;
  console.log('FinSphere initialized with userId:', extensionState.userId);
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
 * Fetch current user financial state and transaction history from backend
 */
async function fetchUserState(userId) {
  try {
    const response = await fetch(`${API_URL}/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('User state fetched:', data);
      return {
        stress_level: data.stress_level || 'Low',
        stress_score: data.stress_score || 0.2,
        spending_risk: data.spending_risk || 'Safe',
        cognitive_load: data.cognitive_load || 'Normal',
        savings_runway: data.savings_runway || '3.5 Mo',
        recent_interventions: data.recent_interventions || []
      };
    }
    return getDefaultState();
  } catch (error) {
    console.error('Error fetching user state:', error);
    return getDefaultState();
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

    return spendingAnalysis;
  } catch (error) {
    console.error('Error analyzing spending:', error);
    return { isOverspending: false, riskLevel: 'low', reasons: [], recommendations: [] };
  }
}

function getDefaultState() {
  return {
    stress_level: 'Low',
    stress_score: 0.2,
    spending_risk: 'Safe',
    cognitive_load: 'Normal',
    savings_runway: '3.5 Mo'
  };
}

/**
 * Check if URL is a shopping/spending site
 */
function isShoppingOrSpendingSite(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    return SHOPPING_SITES.some(site => domain.includes(site));
  } catch {
    return false;
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

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true;
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

      case 'getAuthToken':
        // Auth disabled - return null
        sendResponse({ token: null });
        break;

      case 'setAuthToken':
        // Auth disabled - no-op
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
  try {
    console.log('Analyzing purchase:', orderDetails);
    
    // Get user's current financial state
    const userState = await fetchUserState(extensionState.userId);
    
    // Analyze the order and spending patterns
    const spendingAnalysis = await analyzeOrderAndSpending(orderDetails, userState);
    
    // Determine if intervention is needed
    const shouldIntervene = spendingAnalysis.isOverspending || 
                           spendingAnalysis.riskLevel === 'high' ||
                           (userState.stress_level === 'High' && orderDetails.amount > 500);

    const result = {
      shouldIntervene: shouldIntervene,
      riskLevel: spendingAnalysis.riskLevel,
      reasons: spendingAnalysis.reasons,
      recommendations: spendingAnalysis.recommendations,
      orderDetails: orderDetails,
      userState: userState
    };

    // Log the intervention if needed
    if (shouldIntervene) {
      await logIntervention(url, `Potential overspending: ₹${orderDetails.amount}`, spendingAnalysis.riskLevel);
    }

    return result;
  } catch (error) {
    console.error('Error analyzing purchase:', error);
    return { shouldIntervene: false, riskLevel: 'low', reasons: [], recommendations: [] };
  }
}

// Periodic check for pending interventions - REDUCED FREQUENCY
setInterval(() => {
  if (extensionState.isActive) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Only check if user hasn't been checked recently
        const now = Date.now();
        if (now - extensionState.lastCheckTime > 120000) { // 2 minutes minimum
          extensionState.lastCheckTime = now;
          checkForPurchaseOpportunity(tabs[0]);
        }
      }
    });
  }
}, 60000); // Check every 60 seconds instead of 30

