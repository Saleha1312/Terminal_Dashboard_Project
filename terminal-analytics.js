// Analytics Terminal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeTerminal();
    loadAnalyticsCharts();
    loadRealtimeCharts();
    startAnalyticsUpdates();
    startRealtimeData();
});

function initializeTerminal() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const role = urlParams.get('role');
    const sessionId = urlParams.get('sessionId');
    const terminal = urlParams.get('terminal');
    
    if (!username || !role || !sessionId) {
        alert('Invalid terminal access. Redirecting to main page.');
        window.close();
        return;
    }
    
    // Update UI with user info
    document.getElementById('current-user').textContent = username;
    document.getElementById('current-role').textContent = role;
    
    // Store session info
    sessionStorage.setItem('terminalSession', JSON.stringify({
        username: username,
        role: role,
        sessionId: sessionId,
        terminal: terminal,
        loginTime: new Date().toISOString()
    }));
    
    // Update page title
    document.title = `${username} - Business Intelligence Terminal`;
}

function goBackToMain() {
    if (window.opener && !window.opener.closed) {
        window.close();
    } else {
        window.location.href = 'index.html';
    }
}

function logoutTerminal() {
    const session = JSON.parse(sessionStorage.getItem('terminalSession') || '{}');
    
    if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
            type: 'CLOSE_TERMINAL_SESSION',
            sessionId: session.sessionId
        }, '*');
    }
    
    sessionStorage.removeItem('terminalSession');
    window.close();
}

// Chart Variables
let trafficDonutChart, growthAreaChart, deviceStackedChart, funnelChart;
let activeUsersChart, sessionsChart, pageviewsChart;

// Analytics Data
const analyticsData = {
    trafficSources: {
        labels: ['Organic Search', 'Direct', 'Social Media', 'Email', 'Referral', 'Paid Ads'],
        datasets: [{
            data: [35, 25, 18, 12, 6, 4],
            backgroundColor: [
                '#43aa8b', '#577590', '#f8961e', '#f3722c', '#7209b7', '#4361ee'
            ]
        }]
    },
    
    userGrowth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'New Users',
                data: [12500, 14200, 15800, 17500, 19200, 21000, 22800, 24500, 26300, 28200, 30100, 32000],
                borderColor: '#43aa8b',
                backgroundColor: 'rgba(67, 170, 139, 0.2)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Returning Users',
                data: [85000, 88000, 91000, 94000, 97000, 100000, 103000, 106000, 109000, 112000, 115000, 118000],
                borderColor: '#577590',
                backgroundColor: 'rgba(87, 117, 144, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    },
    
    deviceUsage: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Desktop',
                data: [45, 42, 40, 38, 36, 34],
                backgroundColor: '#43aa8b'
            },
            {
                label: 'Mobile',
                data: [35, 38, 40, 42, 44, 46],
                backgroundColor: '#f8961e'
            },
            {
                label: 'Tablet',
                data: [20, 20, 20, 20, 20, 20],
                backgroundColor: '#f3722c'
            }
        ]
    },
    
    conversionFunnel: {
        labels: ['Visitors', 'Engaged', 'Sign-ups', 'Trials', 'Customers'],
        datasets: [{
            data: [100000, 45000, 15000, 8000, 3500],
            backgroundColor: [
                'rgba(67, 170, 139, 0.8)',
                'rgba(87, 117, 144, 0.8)',
                'rgba(248, 150, 30, 0.8)',
                'rgba(243, 114, 44, 0.8)',
                'rgba(114, 9, 183, 0.8)'
            ],
            borderWidth: 2,
            borderColor: '#1e293b'
        }]
    }
};

function loadAnalyticsCharts() {
    // 1. Traffic Sources Donut Chart
    const trafficCtx = document.getElementById('trafficDonutChart').getContext('2d');
    trafficDonutChart = new Chart(trafficCtx, {
        type: 'doughnut',
        data: analyticsData.trafficSources,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${percentage}% (${value.toLocaleString()})`;
                        }
                    }
                }
            }
        }
    });

    // 2. User Growth Area Chart
    const growthCtx = document.getElementById('growthAreaChart').getContext('2d');
    growthAreaChart = new Chart(growthCtx, {
        type: 'line',
        data: analyticsData.userGrowth,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#94a3b8'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'k';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // 3. Device Usage Stacked Bar Chart
    const deviceCtx = document.getElementById('deviceStackedChart').getContext('2d');
    deviceStackedChart = new Chart(deviceCtx, {
        type: 'bar',
        data: analyticsData.deviceUsage,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#94a3b8'
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                y: {
                    stacked: true,
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    // 4. Conversion Funnel Chart (Horizontal Bar for funnel visualization)
    const funnelCtx = document.getElementById('funnelChart').getContext('2d');
    funnelChart = new Chart(funnelCtx, {
        type: 'bar',
        data: {
            labels: analyticsData.conversionFunnel.labels,
            datasets: [{
                label: 'Conversion Funnel',
                data: analyticsData.conversionFunnel.datasets[0].data,
                backgroundColor: analyticsData.conversionFunnel.datasets[0].backgroundColor,
                borderColor: '#1e293b',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            let conversionRate = '100%';
                            if (context.dataIndex > 0) {
                                const prevValue = context.dataset.data[context.dataIndex - 1];
                                conversionRate = Math.round((value / prevValue) * 100) + '%';
                            }
                            return `${context.label}: ${value.toLocaleString()} (Conversion: ${conversionRate})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'k';
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

function loadRealtimeCharts() {
    // Mini chart for Active Users
    const activeUsersCtx = document.getElementById('activeUsersChart').getContext('2d');
    activeUsersChart = new Chart(activeUsersCtx, {
        type: 'line',
        data: {
            labels: ['-4m', '-3m', '-2m', '-1m', 'Now'],
            datasets: [{
                data: [1120, 1180, 1240, 1280, 1345],
                borderColor: '#43aa8b',
                backgroundColor: 'rgba(67, 170, 139, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });

    // Mini chart for Current Sessions
    const sessionsCtx = document.getElementById('sessionsChart').getContext('2d');
    sessionsChart = new Chart(sessionsCtx, {
        type: 'line',
        data: {
            labels: ['-4m', '-3m', '-2m', '-1m', 'Now'],
            datasets: [{
                data: [780, 810, 835, 845, 856],
                borderColor: '#577590',
                backgroundColor: 'rgba(87, 117, 144, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });

    // Mini chart for Pageviews per minute
    const pageviewsCtx = document.getElementById('pageviewsChart').getContext('2d');
    pageviewsChart = new Chart(pageviewsCtx, {
        type: 'line',
        data: {
            labels: ['-4m', '-3m', '-2m', '-1m', 'Now'],
            datasets: [{
                data: [210, 225, 235, 240, 245],
                borderColor: '#f8961e',
                backgroundColor: 'rgba(248, 150, 30, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
}

function updateTrafficChart() {
    const filter = document.getElementById('trafficFilter').value;
    
    // Simulate different data based on filter
    let newData;
    if (filter === 'week') {
        newData = [40, 20, 15, 10, 8, 7]; // This week
    } else {
        newData = [35, 25, 18, 12, 6, 4]; // This month
    }
    
    trafficDonutChart.data.datasets[0].data = newData;
    trafficDonutChart.update();
}

function setRealtimeRange(range) {
    // Update active button
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update real-time data based on range
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleTimeString();
    
    showNotification(`Viewing real-time data for last ${range}`);
}

function updateRealtimeData() {
    // Update active users with random variation
    const currentActive = parseInt(document.getElementById('active-users').textContent.replace(/,/g, ''));
    const newActive = Math.max(800, Math.min(2000, currentActive + Math.floor(Math.random() * 100) - 50));
    document.getElementById('active-users').textContent = newActive.toLocaleString();
    
    // Update current sessions
    const currentSessions = parseInt(document.getElementById('current-sessions').textContent.replace(/,/g, ''));
    const newSessions = Math.max(600, Math.min(1200, currentSessions + Math.floor(Math.random() * 80) - 40));
    document.getElementById('current-sessions').textContent = newSessions.toLocaleString();
    
    // Update pageviews rate
    const currentRate = parseInt(document.getElementById('pageviews-rate').textContent.replace(/,/g, ''));
    const newRate = Math.max(150, Math.min(400, currentRate + Math.floor(Math.random() * 60) - 30));
    document.getElementById('pageviews-rate').textContent = newRate.toLocaleString();
    
    // Update mini charts
    updateMiniCharts(newActive, newSessions, newRate);
}

function updateMiniCharts(activeUsers, sessions, pageviews) {
    // Shift data left and add new value
    const shiftData = (chart, newValue) => {
        const data = chart.data.datasets[0].data;
        data.shift(); // Remove first element
        data.push(newValue); // Add new value at end
        chart.update();
    };
    
    // Add some random variation to make charts more realistic
    const activeVariation = activeUsers + Math.floor(Math.random() * 80) - 40;
    const sessionsVariation = sessions + Math.floor(Math.random() * 60) - 30;
    const pageviewsVariation = pageviews + Math.floor(Math.random() * 40) - 20;
    
    shiftData(activeUsersChart, activeVariation);
    shiftData(sessionsChart, sessionsVariation);
    shiftData(pageviewsChart, pageviewsVariation);
}

function exportData(format) {
    const formats = {
        pdf: 'PDF Report',
        csv: 'CSV Data',
        excel: 'Excel Spreadsheet',
        json: 'JSON Data'
    };
    
    showNotification(`Preparing ${formats[format]} for download...`);
    
    // Simulate export process
    setTimeout(() => {
        // In a real app, this would generate and download the file
        // For demo, we'll just show a success message
        showNotification(`${formats[format]} downloaded successfully!`);
        
        // Simulate file download
        if (format === 'json') {
            const analyticsExport = {
                timestamp: new Date().toISOString(),
                metrics: {
                    totalUsers: 245821,
                    pageViews: 4200000,
                    bounceRate: 32.4,
                    avgSessionDuration: '4m 38s'
                },
                trafficSources: analyticsData.trafficSources,
                userGrowth: analyticsData.userGrowth
            };
            
            const dataStr = JSON.stringify(analyticsExport, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `analytics-export-${new Date().getTime()}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }
    }, 1500);
}

function startAnalyticsUpdates() {
    // Update processing count every 10 seconds
    setInterval(() => {
        const count = Math.floor(Math.random() * 50000) + 200000;
        document.getElementById('processing-count').textContent = 
            `${count.toLocaleString()} events`;
        
        // Update last updated time
        const now = new Date();
        document.getElementById('last-updated').textContent = now.toLocaleTimeString();
        
        // Update charts with new data
        updateChartsWithNewData();
    }, 10000);
}

function startRealtimeData() {
    // Update real-time data every 5 seconds
    setInterval(updateRealtimeData, 5000);
    
    // Initial update
    updateRealtimeData();
}

function updateChartsWithNewData() {
    // Update traffic sources with slight variations
    const newTrafficData = trafficDonutChart.data.datasets[0].data.map(value => 
        Math.max(1, value + Math.floor(Math.random() * 5) - 2)
    );
    const trafficTotal = newTrafficData.reduce((a, b) => a + b, 0);
    const normalizedTraffic = newTrafficData.map(value => 
        Math.round((value / trafficTotal) * 100)
    );
    trafficDonutChart.data.datasets[0].data = normalizedTraffic;
    trafficDonutChart.update('none');
    
    // Update user growth chart
    const lastMonthValue = growthAreaChart.data.datasets[0].data[growthAreaChart.data.datasets[0].data.length - 1];
    const newMonthValue = lastMonthValue + Math.floor(Math.random() * 2000) - 1000;
    growthAreaChart.data.datasets[0].data.push(newMonthValue);
    growthAreaChart.data.datasets[0].data.shift();
    
    const lastReturningValue = growthAreaChart.data.datasets[1].data[growthAreaChart.data.datasets[1].data.length - 1];
    const newReturningValue = lastReturningValue + Math.floor(Math.random() * 5000) - 2500;
    growthAreaChart.data.datasets[1].data.push(newReturningValue);
    growthAreaChart.data.datasets[1].data.shift();
    
    // Update labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const newLabels = [];
    for (let i = 0; i < 12; i++) {
        const monthIndex = (currentMonth - 11 + i + 12) % 12;
        newLabels.push(months[monthIndex]);
    }
    growthAreaChart.data.labels = newLabels;
    
    growthAreaChart.update('none');
    
    // Update device usage chart
    deviceStackedChart.data.datasets.forEach((dataset, index) => {
        const lastValue = dataset.data[dataset.data.length - 1];
        const newValue = Math.max(10, Math.min(50, lastValue + (Math.random() * 4 - 2)));
        dataset.data.push(newValue);
        dataset.data.shift();
    });
    
    // Update device labels
    const currentLabels = deviceStackedChart.data.labels;
    const newDeviceLabels = [];
    for (let i = 0; i < 6; i++) {
        const monthIndex = (currentMonth - 5 + i + 12) % 12;
        newDeviceLabels.push(months[monthIndex]);
    }
    deviceStackedChart.data.labels = newDeviceLabels;
    
    deviceStackedChart.update('none');
}

// Geographic distribution data
const geographicData = {
    'NA': { name: 'North America', percentage: 42, color: '#4361ee' },
    'EU': { name: 'Europe', percentage: 28, color: '#43aa8b' },
    'AP': { name: 'Asia Pacific', percentage: 18, color: '#f8961e' },
    'SA': { name: 'South America', percentage: 8, color: '#f3722c' },
    'AF': { name: 'Africa', percentage: 4, color: '#7209b7' }
};

function updateGeographicData() {
    // Add interactivity to geographic regions
    document.querySelectorAll('.region').forEach(region => {
        const regionCode = region.getAttribute('data-region');
        const regionData = geographicData[regionCode];
        
        region.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.zIndex = '10';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
            
            // Show tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'region-tooltip';
            tooltip.innerHTML = `
                <strong>${regionData.name}</strong><br>
                ${regionData.percentage}% of traffic<br>
                ${Math.round(245821 * regionData.percentage / 100).toLocaleString()} users
            `;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 10px;
                border-radius: 6px;
                z-index: 1000;
                white-space: nowrap;
                pointer-events: none;
                transform: translate(-50%, -120%);
            `;
            this.appendChild(tooltip);
        });
        
        region.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.zIndex = '';
            this.style.boxShadow = '';
            const tooltip = this.querySelector('.region-tooltip');
            if (tooltip) tooltip.remove();
        });
        
        region.addEventListener('click', function() {
            showNotification(`Showing detailed analytics for ${regionData.name}`);
            // In a real app, this would filter the dashboard to show region-specific data
        });
    });
}

// Call this after the page loads
setTimeout(updateGeographicData, 1000);

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #43aa8b, #90be6d);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        ">
            <i class="fas fa-chart-line"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for analytics-specific styles
const analyticsStyle = document.createElement('style');
analyticsStyle.textContent = `
    .terminal-container[data-terminal="analytics"] .terminal-header {
        background: linear-gradient(90deg, #43aa8b, #90be6d);
    }
    
    .realtime-section {
        background: var(--terminal-card);
        border-radius: 12px;
        padding: 25px;
        margin: 30px 0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .realtime-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .realtime-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 20px;
        text-align: center;
    }
    
    .realtime-card h4 {
        color: #94a3b8;
        margin-bottom: 15px;
        font-size: 1rem;
    }
    
    .realtime-value {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 15px 0;
        background: linear-gradient(45deg, #43aa8b, #4cc9f0);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }
    
    .realtime-chart.mini {
        height: 60px;
        margin-top: 15px;
    }
    
    .timeframe-selector {
        display: flex;
        gap: 10px;
    }
    
    .time-btn {
        background: rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .time-btn:hover {
        background: rgba(255, 255, 255, 0.15);
    }
    
    .time-btn.active {
        background: #43aa8b;
        color: white;
        border-color: #43aa8b;
    }
    
    .export-section {
        background: var(--terminal-card);
        border-radius: 12px;
        padding: 25px;
        margin: 30px 0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .export-options {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-top: 20px;
    }
    
    .export-btn {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s;
    }
    
    .export-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }
    
    .geo-map {
        height: 100%;
        position: relative;
    }
    
    .map-container {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        position: relative;
    }
    
    .region {
        position: absolute;
        padding: 10px;
        background: rgba(67, 97, 238, 0.2);
        border: 2px solid #4361ee;
        border-radius: 8px;
        min-width: 120px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .region-label {
        font-weight: 600;
        font-size: 12px;
    }
    
    .region-value {
        font-size: 14px;
        font-weight: 700;
        color: #4cc9f0;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    /* KPI Cards Specific */
    .stat-card:nth-child(1) {
        border-left-color: #43aa8b;
    }
    
    .stat-card:nth-child(2) {
        border-left-color: #577590;
    }
    
    .stat-card:nth-child(3) {
        border-left-color: #f8961e;
    }
    
    .stat-card:nth-child(4) {
        border-left-color: #f3722c;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .realtime-grid {
            grid-template-columns: 1fr;
        }
        
        .export-options {
            justify-content: center;
        }
        
        .export-btn {
            flex: 1;
            min-width: 150px;
            justify-content: center;
        }
    }
`;
document.head.appendChild(analyticsStyle);