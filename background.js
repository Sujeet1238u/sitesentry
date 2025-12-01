let timeSpent = {};
let activeTab = null;
let startTime = null;

// Load saved data from storage
chrome.storage.local.get('timeSpent', (data) => {
    if (data.timeSpent) {
        timeSpent = data.timeSpent;
    }
});

// Function to update time spent on the active tab
function updateTime() {
    if (activeTab && startTime) {
        const endTime = Date.now();
        const timeElapsed = (endTime - startTime) / 1000;
        timeSpent[activeTab] = (timeSpent[activeTab] || 0) + timeElapsed;
        chrome.storage.local.set({ timeSpent });
        startTime = Date.now();
    }
}

// Function to track the currently active tab
function trackActiveTab(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (tab && tab.url) {
            updateTime(); 
            activeTab = new URL(tab.url).hostname.replace(/^www\./, '');
            startTime = Date.now();
        }
    });
}

// When tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
    trackActiveTab(activeInfo.tabId);
});

// When a tab is updated (reload, new page)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.url) {
        trackActiveTab(tabId);
    }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        updateTime(); 
        activeTab = null;
        startTime = null;
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) trackActiveTab(tabs[0].id);
        });
    }
});

// Handle messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTimeData") {
        updateTime(); 
        sendResponse({ timeSpent, activeTab, startTime });
    } else if (request.action === "clearData") {
        timeSpent = {};
        chrome.storage.local.set({ timeSpent: {} }, () => {
            sendResponse({ success: true });
        });
        return true; 
    }
    return true;
});

// Update every second
setInterval(updateTime, 1000);