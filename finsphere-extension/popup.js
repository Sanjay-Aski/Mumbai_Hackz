/**
 * FinSphere Extension - Popup Script (No Auth Required)
 * Universal e-commerce protection control panel
 */

const API_URL = 'http://localhost:8000/api/v1';
const FRONTEND_URL = 'http://localhost:3000';
const OLLAMA_API = 'http://localhost:11434';

// Load popup on open
document.addEventListener('DOMContentLoaded', async () => {
  await loadPopupData();
});

/**
 * Load extension status and stats (no auth required)
 */
async function loadPopupData() {
  try {
    // Get extension status from background script
    const extensionStatus = await getExtensionStatus();
    const aiStatus = await getAIStatus();
    
    // Update status display
    updateStatusDisplay(extensionStatus, aiStatus);
    
    // Load today's stats
    await loadTodaysStats();
    
  } catch (error) {
    console.error('Error loading popup data:', error);
  }
}

/**
 * Get extension status from background script
 */
async function getExtensionStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'extensionPing' },
      (response) => {
        resolve({
          isActive: response?.status === 'active',
          userId: response?.userId
        });
      }
    );
  });
}

/**
 * Get AI status from background script
 */
async function getAIStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'getAIStatus' },
      (response) => {
        resolve({
          aiEnabled: response?.aiEnabled || false,
          ollamaAvailable: response?.ollamaAvailable || false,
          model: response?.model || 'gpt-oss:20-cloud'
        });
      }
    );
  });
}

/**
 * Load today's intervention stats
 */
async function loadTodaysStats() {
  try {
    // Get from local storage or default values
    const stats = await chrome.storage.local.get(['todayStats']);
    const todayStats = stats.todayStats || {
      interventions: 0,
      potentialSavings: 0
    };
    
    document.getElementById('interventions-today').textContent = todayStats.interventions;
    document.getElementById('money-saved').textContent = `₹${todayStats.potentialSavings.toLocaleString()}`;
    
  } catch (error) {
    console.error('Error loading today\'s stats:', error);
  }
}

/**
 * Update status display based on extension and AI status
 */
function updateStatusDisplay(extensionStatus, aiStatus) {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const aiStatusEl = document.getElementById('ai-status');
  const toggleText = document.getElementById('toggle-text');
  const aiToggleText = document.getElementById('ai-toggle-text');
  
  // Extension status
  if (extensionStatus.isActive) {
    statusDot.className = 'dot active';
    statusText.textContent = 'Smart purchase protection active';
    toggleText.textContent = 'Disable Protection';
  } else {
    statusDot.className = 'dot inactive';
    statusText.textContent = 'Protection disabled';
    toggleText.textContent = 'Enable Protection';
  }
  
  // AI status
  if (aiStatus.aiEnabled && aiStatus.ollamaAvailable) {
    aiStatusEl.textContent = '🤖 Ready';
    aiToggleText.textContent = 'Disable AI Analysis';
  } else if (aiStatus.aiEnabled && !aiStatus.ollamaAvailable) {
    aiStatusEl.textContent = '⚠️ Offline';
    aiToggleText.textContent = 'Disable AI Analysis';
  } else {
    aiStatusEl.textContent = '❌ Disabled';
    aiToggleText.textContent = 'Enable AI Analysis';
  }
}

/**
 * Toggle AI analysis on/off
 */
async function toggleAI() {
  try {
    const aiStatus = await getAIStatus();
    const newStatus = !aiStatus.aiEnabled;
    
    chrome.runtime.sendMessage(
      { action: 'toggleAI', enabled: newStatus },
      (response) => {
        if (response && response.success) {
          const aiToggleText = document.getElementById('ai-toggle-text');
          const aiStatusEl = document.getElementById('ai-status');
          
          if (newStatus) {
            aiToggleText.textContent = 'Disable AI Analysis';
            aiStatusEl.textContent = response.ollamaAvailable ? '🤖 Ready' : '⚠️ Offline';
          } else {
            aiToggleText.textContent = 'Enable AI Analysis';
            aiStatusEl.textContent = '❌ Disabled';
          }
        }
      }
    );
  } catch (error) {
    console.error('Error toggling AI:', error);
  }
}

/**
 * Test Ollama connection
 */
async function testOllama() {
  const testButton = document.getElementById('test-ollama');
  const originalText = testButton.textContent;
  
  testButton.textContent = 'Testing...';
  testButton.disabled = true;
  
  try {
    chrome.runtime.sendMessage(
      { action: 'testOllama' },
      (response) => {
        if (response && response.available) {
          testButton.textContent = '✅ Connected';
          setTimeout(() => {
            testButton.textContent = originalText;
            testButton.disabled = false;
          }, 2000);
        } else {
          testButton.textContent = '❌ Failed';
          setTimeout(() => {
            testButton.textContent = originalText;
            testButton.disabled = false;
          }, 2000);
        }
      }
    );
  } catch (error) {
    console.error('Error testing Ollama:', error);
    testButton.textContent = '❌ Error';
    setTimeout(() => {
      testButton.textContent = originalText;
      testButton.disabled = false;
    }, 2000);
  }
}

/**
 * Toggle extension protection
 */
async function toggleExtension() {
  try {
    chrome.runtime.sendMessage(
      { action: 'toggleExtension' },
      (response) => {
        if (response && response.success) {
          const isActive = response.isActive;
          const statusDot = document.getElementById('status-dot');
          const statusText = document.getElementById('status-text');
          const toggleText = document.getElementById('toggle-text');
          
          if (isActive) {
            statusDot.className = 'dot active';
            statusText.textContent = 'Smart purchase protection active';
            toggleText.textContent = 'Disable Protection';
          } else {
            statusDot.className = 'dot inactive';
            statusText.textContent = 'Protection disabled';
            toggleText.textContent = 'Enable Protection';
          }
        }
      }
    );
  } catch (error) {
    console.error('Error toggling extension:', error);
  }
}

/**
 * Open dashboard in new tab
 */
function openDashboard() {
  chrome.tabs.create({ url: FRONTEND_URL });
}
