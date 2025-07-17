// Simple visitor tracking for MASS Consulting
// This provides basic visitor counting functionality

(function () {
  // Track page view
  function trackPageView() {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Get existing data from localStorage
    let visitData = JSON.parse(
      localStorage.getItem("massConsultingVisits") || "{}",
    );

    // Initialize today if it doesn't exist
    if (!visitData[today]) {
      visitData[today] = {
        count: 0,
        sessions: [],
      };
    }

    // Check if this is a new session (more than 30 minutes since last visit)
    const now = Date.now();
    const lastVisit = localStorage.getItem("lastVisitTime");
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    let isNewSession = !lastVisit || now - parseInt(lastVisit) > sessionTimeout;

    if (isNewSession) {
      visitData[today].count++;
      visitData[today].sessions.push({
        timestamp: now,
        userAgent: navigator.userAgent.substring(0, 100), // First 100 chars
        referrer: document.referrer || "direct",
      });
    }

    // Update localStorage
    localStorage.setItem("massConsultingVisits", JSON.stringify(visitData));
    localStorage.setItem("lastVisitTime", now.toString());

    // Clean up old data (keep only last 30 days)
    cleanupOldData(visitData);
  }

  function cleanupOldData(visitData) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0];

    Object.keys(visitData).forEach((date) => {
      if (date < cutoffDate) {
        delete visitData[date];
      }
    });

    localStorage.setItem("massConsultingVisits", JSON.stringify(visitData));
  }

  // Function to get visit statistics (for admin use)
  window.getMassConsultingStats = function () {
    const visitData = JSON.parse(
      localStorage.getItem("massConsultingVisits") || "{}",
    );
    const today = new Date().toISOString().split("T")[0];

    console.log("MASS Consulting Visit Statistics:");
    console.log(
      "Today (" + today + "):",
      visitData[today]?.count || 0,
      "unique visitors",
    );

    // Last 7 days
    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      weekTotal += visitData[dateStr]?.count || 0;
    }
    console.log("Last 7 days:", weekTotal, "unique visitors");

    // All time (last 30 days)
    const allTimeTotal = Object.values(visitData).reduce(
      (sum, day) => sum + (day.count || 0),
      0,
    );
    console.log("Last 30 days:", allTimeTotal, "unique visitors");

    return {
      today: visitData[today]?.count || 0,
      last7Days: weekTotal,
      last30Days: allTimeTotal,
      rawData: visitData,
    };
  };

  // Track this page view
  trackPageView();

  // Optional: Send data to your server (uncomment and modify URL as needed)
  /*
    function sendToServer(data) {
        fetch('/api/track-visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(err => console.log('Tracking failed:', err));
    }
    */
})();

// Admin panel function - call this in browser console to see stats
console.log("To view visit statistics, type: getMassConsultingStats()");
