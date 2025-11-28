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
  authToken: null,
};

/**
 * Get authentication token from storage
 */
async function getAuthToken() {
  try {
    const result = await chrome.storage.local.get(['authToken']);
    return result.authToken || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Set authentication token in storage
 */
async function setAuthToken(token) {
  try {
    await chrome.storage.local.set({ authToken: token });
    extensionState.authToken = token;
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('FinSphere Extension Installed');
  initializeExtension();
});

async function initializeExtension() {
  const stored = await chrome.storage.local.get(['userId', 'isActive', 'authToken']);
  
  // Check for auth token first
  if (stored.authToken) {
    extensionState.authToken = stored.authToken;
    console.log('FinSphere initialized with existing auth token');
  } else {
    console.log('No auth token found - user needs to login on frontend');
  }
  
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
 * Fetch current user financial state
 */
async function fetchUserState(userId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.warn('No auth token found');
      return getDefaultState();
    }
    
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return getDefaultState();
  } catch (error) {
    console.error('Error fetching user state:', error);
    return getDefaultState();
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
 * Log intervention for analytics
 */
async function logIntervention(url, reason, severity) {
  try {
    await fetch(`${API_URL}/intervention/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: extensionState.userId,
        url,
        reason,
        severity,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Silent fail - endpoint may not exist
    });
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
        const token = await getAuthToken();
        sendResponse({ token: token });
        break;

      case 'setAuthToken':
        await setAuthToken(request.token);
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
 * Record intervention response
 */
async function recordInterventionResponse(data) {
  try {
    await fetch(`${API_URL}/intervention/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: extensionState.userId,
        url: data.url,
        intervention_action: data.intervention_action || 'unknown',
        accepted: data.accepted || false,
        timestamp: data.timestamp || new Date().toISOString()
      })
    }).catch((err) => {
      console.warn('API not available for intervention response:', err);
    });
  } catch (error) {
    console.error('Error recording intervention response:', error);
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

