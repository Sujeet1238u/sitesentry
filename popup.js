document.addEventListener('DOMContentLoaded', () => {
    const timeList = document.getElementById('timeList');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const totalTimeElement = document.getElementById('totalTime');

    if (!clearDataBtn || !totalTimeElement) {
        console.error("Required elements not found!");
        return;
    }

    let activeTabTimeElement = null; 
    let activeTabInterval = null;

    function getDomainName(url) {
        try {
            const domain = new URL(`https://${url}`).hostname.replace(/^www\./, '').split('.')[0];
            return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch {
            return url;
        }
    }

    function getFavicon(url) {
        return `https://www.google.com/s2/favicons?sz=32&domain=${url}`;
    }

    function formatTime(seconds) {
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = Math.floor(seconds % 60);
        return `${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s}s`;
    }

    function updatePopup() {
        chrome.runtime.sendMessage({ action: 'getTimeData' }, (response) => {
            if (!response) return;

            const timeData = response.timeSpent || {};
            const activeTab = response.activeTab;

            // Clear the list except for the active tab's time element
            timeList.innerHTML = '';

            // Convert time data to array and sort by time spent in descending order
            let sortedEntries = Object.entries(timeData).sort((a, b) => b[1] - a[1]);

            // Calculate total time spent
            let totalTime = 0;
            sortedEntries.forEach(([site, time]) => {
                totalTime += time;
            });

            // Display total time
            totalTimeElement.textContent = `Total Time: ${formatTime(totalTime)}`;

            // Add active tab to the top if it exists
            if (activeTab && timeData[activeTab] !== undefined) {
                sortedEntries = sortedEntries.filter(([site]) => site !== activeTab);
                sortedEntries.unshift([activeTab, timeData[activeTab]]);
            }

            // Render the list
            sortedEntries.forEach(([site, time]) => {
                const div = document.createElement('div');
                div.className = 'site';

                const icon = document.createElement('img');
                icon.src = getFavicon(site);
                icon.className = 'site-icon';
                icon.onerror = () => (icon.style.display = 'none');

                const name = document.createElement('span');
                name.className = 'site-name';
                name.textContent = getDomainName(site); 

                const timeText = document.createElement('span');
                timeText.className = 'site-time';
                timeText.textContent = formatTime(time);

                div.appendChild(icon);
                div.appendChild(name);
                div.appendChild(timeText);
                timeList.appendChild(div);

                // Track the active tab's time element
                if (site === activeTab) {
                    activeTabTimeElement = timeText;
                }
            });

            // Update the active tab's time dynamically
            if (activeTab && response.startTime) {
                if (activeTabInterval) clearInterval(activeTabInterval);
                activeTabInterval = setInterval(() => {
                    if (activeTabTimeElement) {
                        const currentTime = Math.floor((Date.now() - response.startTime) / 1000);
                        const totalTimeForActiveTab = (timeData[activeTab] || 0) + currentTime; 
                        activeTabTimeElement.textContent = formatTime(totalTimeForActiveTab);

                        // Recalculate and update total time
                        let newTotalTime = 0;
                        Object.values(timeData).forEach((time) => {
                            newTotalTime += time;
                        });
                        newTotalTime += currentTime;
                        totalTimeElement.textContent = `Total Time: ${formatTime(newTotalTime)}`;
                    }
                }, 1000);
            }
        });
    }

    // Clear Data Button
    clearDataBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'clearData' }, () => {
            updatePopup();
        });
    });

    updatePopup();
});