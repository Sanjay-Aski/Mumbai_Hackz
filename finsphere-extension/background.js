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

// Tab update listener - check for interventions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && extensionState.isActive) {
    setTimeout(() => {
      checkForPurchaseOpportunity(tab);
    }, 1000);
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
    chrome.tabs.sendMessage(tabId, {
      action: 'analyzePageContent',
      type: isShoppingPage ? 'shopping' : 'gig'
    }, (response) => {
      if (response && response.hasContent) {
        evaluateIntervention(tab, response, isShoppingPage);
      }
    }).catch(() => {
      // Content script not ready yet
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

    if (isShoppingPage) {
      // Shopping site intervention logic
      if (userState.stress_level === 'High') {
        shouldIntervene = true;
        interventionReason = 'High stress detected - impulse buying risk';
        interventionSeverity = 'high';
      } else if (userState.stress_level === 'Medium') {
        if (pageData.isImpulseBuy) {
          shouldIntervene = true;
          interventionReason = 'Potential impulse purchase detected';
          interventionSeverity = 'medium';
        }
      }
    } else {
      // Gig work underpricing logic
      if (userState.stress_level === 'High' && pageData.isProposal) {
        shouldIntervene = true;
        interventionReason = 'High stress - risk of underpricing your work';
        interventionSeverity = 'high';
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
          pageType: isShoppingPage ? 'shopping' : 'gig',
          timestamp: new Date().toISOString()
        }
      });

      // Log intervention
      logIntervention(tab.url, interventionReason, interventionSeverity);
    }
  } catch (error) {
    console.error('Error evaluating intervention:', error);
  }
}

/**
 * Fetch current user financial state
 */
async function fetchUserState(userId) {
  try {
    const response = await fetch(`${API_URL}/dashboard/${userId}`);
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

// Periodic check for pending interventions
setInterval(() => {
  if (extensionState.isActive) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        checkForPurchaseOpportunity(tabs[0]);
      }
    });
  }
}, 30000); // Check every 30 seconds

