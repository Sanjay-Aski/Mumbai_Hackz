/**
 * FinSphere Extension - Popup Script
 * Displays auth status, user info, and control panel
 */

const API_URL = 'http://localhost:8000/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

// Load popup on open
document.addEventListener('DOMContentLoaded', async () => {
  await loadPopupData();
});

/**
 * Load and display user auth data in popup
 */
async function loadPopupData() {
  try {
    // Get auth token from background script
    const token = await getAuthToken();
    const user = await getStoredUser();

    if (!token || !user) {
      // Not logged in
      document.getElementById('auth-status').style.display = 'block';
      document.getElementById('logged-in-section').style.display = 'none';
      return;
    }

    // Logged in - show user info and stats
    document.getElementById('auth-status').style.display = 'none';
    document.getElementById('logged-in-section').style.display = 'block';

    // Display user info
    document.getElementById('user-name').textContent = user.full_name || 'User';
    document.getElementById('user-email').textContent = user.email || 'email@example.com';

    // Fetch current user state from backend
    await loadUserStats(token);

  } catch (error) {
    console.error('Error loading popup data:', error);
  }
}

/**
 * Get auth token from background script
 */
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'getAuthToken' },
      (response) => {
        resolve(response?.token || null);
      }
    );
  });
}

/**
 * Get stored user info from chrome storage
 */
async function getStoredUser() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['user'], (result) => {
      if (result.user) {
        try {
          resolve(JSON.parse(result.user));
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Load user stats from backend
 */
async function loadUserStats(token) {
  try {
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      updateStatsDisplay(data);
    } else {
      console.warn('Failed to load user stats');
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
  }
}

/**
 * Update stats display in popup
 */
function updateStatsDisplay(data) {
  // Map stress level to display
  const stressLevelMap = {
    'Low': '😊 Low',
    'Medium': '😐 Medium',
    'High': '😰 High'
  };

  const spendingRiskMap = {
    'Safe': '✓ Safe',
    'Caution': '⚠ Caution',
    'Risk': '⛔ Risk'
  };

  document.getElementById('stress-level').textContent = 
    stressLevelMap[data.stress_level] || data.stress_level || '--';
  
  document.getElementById('spending-risk').textContent = 
    spendingRiskMap[data.spending_risk] || data.spending_risk || '--';
  
  document.getElementById('cognitive-load').textContent = 
    data.cognitive_load || '--';
  
  document.getElementById('savings-runway').textContent = 
    data.savings_runway || '--';
}

/**
 * Toggle extension monitoring
 */
async function toggleExtension() {
  try {
    const response = await chrome.runtime.sendMessage(
      { action: 'toggleExtension' },
      (response) => {
        if (response && response.success) {
          const isActive = response.isActive;
          document.getElementById('toggle-text').textContent = 
            isActive ? 'Disable Monitoring' : 'Enable Monitoring';
          
          // Show status update
          const statusText = document.getElementById('status-text');
          if (isActive) {
            statusText.textContent = 'Monitoring for financial stress.';
          } else {
            statusText.textContent = 'Monitoring is disabled.';
          }
        }
      }
    );
  } catch (error) {
    console.error('Error toggling extension:', error);
  }
}

/**
 * Logout user
 */
async function logout() {
  try {
    // Clear stored auth data
    await chrome.storage.local.remove(['authToken', 'user']);
    
    // Reload popup to show login state
    await loadPopupData();
    
    // Show confirmation
    alert('Logged out successfully. Please login again on the dashboard.');
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

/**
 * Open dashboard in new tab
 */
function openDashboard() {
  chrome.tabs.create({ url: FRONTEND_URL });
}
