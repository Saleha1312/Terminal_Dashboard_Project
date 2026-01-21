// System Terminal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeTerminal();
    loadSystemCharts();
    loadServicesData();
    loadServerNodes();
    startSystemUpdates();
    updateUptimeCounter();
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
    document.title = `${username} - System Monitoring Terminal`;
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
let cpuLineChart, memoryPieChart, diskBarChart, networkChart, healthGauge;

function loadSystemCharts() {
    // 1. CPU Usage Line Chart
    const cpuCtx = document.getElementById('cpuLineChart').getContext('2d');
    cpuLineChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [{
                label: 'CPU Usage (%)',
                data: [45, 52, 48, 65, 78, 62, 58],
                borderColor: '#f3722c',
                backgroundColor: 'rgba(243, 114, 44, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
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
                },
                x: {
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

    // 2. Memory Pie Chart
    const memoryCtx = document.getElementById('memoryPieChart').getContext('2d');
    memoryPieChart = new Chart(memoryCtx, {
        type: 'pie',
        data: {
            labels: ['Used', 'Cached', 'Buffer', 'Free'],
            datasets: [{
                data: [52, 18, 10, 20],
                backgroundColor: [
                    '#f3722c', '#f8961e', '#f9c74f', '#90be6d'
                ],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });

    // 3. Disk Usage Bar Chart
    const diskCtx = document.getElementById('diskBarChart').getContext('2d');
    diskBarChart = new Chart(diskCtx, {
        type: 'bar',
        data: {
            labels: ['System (C:)', 'Data (D:)', 'Backup (E:)', 'Logs (F:)', 'Archive (G:)'],
            datasets: [{
                label: 'Used Space (%)',
                data: [78, 45, 32, 68, 25],
                backgroundColor: [
                    'rgba(243, 114, 44, 0.8)',
                    'rgba(248, 150, 30, 0.8)',
                    'rgba(249, 199, 79, 0.8)',
                    'rgba(144, 190, 109, 0.8)',
                    'rgba(67, 97, 238, 0.8)'
                ],
                borderColor: '#1e293b',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
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
                },
                x: {
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

    // 4. Network Traffic Chart
    const networkCtx = document.getElementById('networkChart').getContext('2d');
    networkChart = new Chart(networkCtx, {
        type: 'line',
        data: {
            labels: ['1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h'],
            datasets: [
                {
                    label: 'Upload (Mbps)',
                    data: [12, 18, 15, 22, 28, 25, 30, 32],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Download (Mbps)',
                    data: [25, 30, 28, 35, 42, 38, 45, 48],
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
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
                            return value + ' Mbps';
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
            }
        }
    });

    // 5. Health Gauge Chart (Simplified)
    const healthCtx = document.getElementById('healthGauge').getContext('2d');
    healthGauge = new Chart(healthCtx, {
        type: 'doughnut',
        data: {
            labels: ['Healthy', 'Warning', 'Critical'],
            datasets: [{
                data: [85, 10, 5],
                backgroundColor: [
                    '#43aa8b',
                    '#f8961e',
                    '#f94144'
                ],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// Services Data
const servicesData = [
    { name: 'Web Server', status: 'running', cpu: 12, memory: 256, uptime: '15d 4h', pid: 1452 },
    { name: 'Database', status: 'running', cpu: 28, memory: 1024, uptime: '15d 4h', pid: 1876 },
    { name: 'Cache Server', status: 'running', cpu: 8, memory: 512, uptime: '8d 12h', pid: 2314 },
    { name: 'Load Balancer', status: 'running', cpu: 5, memory: 128, uptime: '3d 6h', pid: 2987 },
    { name: 'Backup Service', status: 'stopped', cpu: 0, memory: 0, uptime: '0', pid: null },
    { name: 'Monitoring Agent', status: 'running', cpu: 3, memory: 64, uptime: '22d 18h', pid: 3241 },
    { name: 'API Gateway', status: 'warning', cpu: 42, memory: 768, uptime: '2d 14h', pid: 2876 },
    { name: 'Message Queue', status: 'running', cpu: 15, memory: 384, uptime: '7d 9h', pid: 2563 }
];

function loadServicesData() {
    const tableBody = document.getElementById('servicesTableBody');
    tableBody.innerHTML = servicesData.map(service => `
        <tr>
            <td>
                <div class="service-name">
                    <i class="fas fa-${getServiceIcon(service.name)}"></i>
                    ${service.name}
                </div>
            </td>
            <td>
                <span class="status-badge ${service.status}">
                    <i class="fas fa-${getStatusIcon(service.status)}"></i>
                    ${service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </span>
            </td>
            <td>${service.cpu}%</td>
            <td>${service.memory} MB</td>
            <td>${service.uptime}</td>
            <td>
                <div class="service-actions">
                    ${service.status === 'running' ? 
                        `<button class="action-btn small" onclick="restartService('${service.name}')">
                            <i class="fas fa-redo"></i>
                        </button>` : 
                        `<button class="action-btn small" onclick="startService('${service.name}')">
                            <i class="fas fa-play"></i>
                        </button>`
                    }
                    <button class="action-btn small" onclick="viewLogs('${service.name}')">
                        <i class="fas fa-file-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getServiceIcon(serviceName) {
    const icons = {
        'Web Server': 'globe',
        'Database': 'database',
        'Cache Server': 'bolt',
        'Load Balancer': 'scale-balanced',
        'Backup Service': 'save',
        'Monitoring Agent': 'eye',
        'API Gateway': 'door-open',
        'Message Queue': 'envelope'
    };
    return icons[serviceName] || 'cog';
}

function getStatusIcon(status) {
    return status === 'running' ? 'circle-check' :
           status === 'stopped' ? 'circle-stop' :
           'circle-exclamation';
}

// Server Nodes Data
const serverNodes = [
    { name: 'Web-01', status: 'online', cpu: 45, memory: 65, load: 2.4, location: 'US-East' },
    { name: 'Web-02', status: 'online', cpu: 38, memory: 58, load: 1.8, location: 'US-East' },
    { name: 'DB-01', status: 'online', cpu: 62, memory: 78, load: 3.2, location: 'US-West' },
    { name: 'DB-02', status: 'warning', cpu: 85, memory: 82, load: 4.5, location: 'US-West' },
    { name: 'Cache-01', status: 'online', cpu: 28, memory: 45, load: 1.2, location: 'EU-Central' },
    { name: 'Cache-02', status: 'offline', cpu: 0, memory: 0, load: 0, location: 'EU-Central' },
    { name: 'LB-01', status: 'online', cpu: 15, memory: 32, load: 0.8, location: 'Global' },
    { name: 'LB-02', status: 'online', cpu: 18, memory: 35, load: 0.9, location: 'Global' }
];

function loadServerNodes() {
    const nodesGrid = document.getElementById('nodesGrid');
    nodesGrid.innerHTML = serverNodes.map(node => `
        <div class="node-card ${node.status}">
            <div class="node-header">
                <h4><i class="fas fa-server"></i> ${node.name}</h4>
                <span class="node-status ${node.status}">
                    <i class="fas fa-circle"></i> ${node.status}
                </span>
            </div>
            <div class="node-stats">
                <div class="node-stat">
                    <span>CPU</span>
                    <div class="stat-value">${node.cpu}%</div>
                    <div class="stat-bar">
                        <div class="bar-fill" style="width: ${node.cpu}%"></div>
                    </div>
                </div>
                <div class="node-stat">
                    <span>Memory</span>
                    <div class="stat-value">${node.memory}%</div>
                    <div class="stat-bar">
                        <div class="bar-fill" style="width: ${node.memory}%"></div>
                    </div>
                </div>
                <div class="node-stat">
                    <span>Load</span>
                    <div class="stat-value">${node.load}</div>
                </div>
            </div>
            <div class="node-info">
                <span><i class="fas fa-location-dot"></i> ${node.location}</span>
            </div>
            <div class="node-actions">
                <button class="action-btn small" onclick="manageNode('${node.name}')">
                    <i class="fas fa-cog"></i>
                </button>
                <button class="action-btn small" onclick="viewNodeDetails('${node.name}')">
                    <i class="fas fa-chart-line"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function restartAllServices() {
    if (confirm('Are you sure you want to restart all services? Some services may experience brief downtime.')) {
        showNotification('Restarting all services...');
        
        // Simulate restart process
        setTimeout(() => {
            servicesData.forEach(service => {
                if (service.status === 'running') {
                    service.uptime = '0';
                    service.status = 'running'; // In real app, this would change to restarting then back to running
                }
            });
            loadServicesData();
            showNotification('All services restarted successfully!');
        }, 2000);
    }
}

function restartService(serviceName) {
    showNotification(`Restarting ${serviceName}...`);
    
    setTimeout(() => {
        const service = servicesData.find(s => s.name === serviceName);
        if (service) {
            service.uptime = '0';
            showNotification(`${serviceName} restarted successfully!`);
        }
    }, 1000);
}

function startService(serviceName) {
    showNotification(`Starting ${serviceName}...`);
    
    setTimeout(() => {
        const service = servicesData.find(s => s.name === serviceName);
        if (service) {
            service.status = 'running';
            service.cpu = Math.floor(Math.random() * 10) + 5;
            service.memory = Math.floor(Math.random() * 200) + 100;
            service.uptime = '0';
            loadServicesData();
            showNotification(`${serviceName} started successfully!`);
        }
    }, 1000);
}

function viewLogs(serviceName) {
    showNotification(`Opening logs for ${serviceName}...`);
    // In a real app, this would open a log viewer modal
}

function manageNode(nodeName) {
    showNotification(`Opening management console for ${nodeName}...`);
}

function viewNodeDetails(nodeName) {
    showNotification(`Showing detailed metrics for ${nodeName}...`);
}

function refreshSystemData() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalHtml = refreshBtn.innerHTML;
    
    // Show loading state
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    // Simulate data refresh
    setTimeout(() => {
        updateSystemCharts();
        updateServicesData();
        updateNodesData();
        
        // Update last updated time
        const now = new Date();
        document.getElementById('last-updated').textContent = now.toLocaleTimeString();
        
        // Restore button
        refreshBtn.innerHTML = originalHtml;
        refreshBtn.disabled = false;
        
        showNotification('System data refreshed!');
    }, 1500);
}

function updateSystemCharts() {
    // Update CPU chart with new data
    const newCpuData = cpuLineChart.data.datasets[0].data.map(value => 
        Math.max(10, Math.min(90, value + Math.floor(Math.random() * 20) - 10))
    );
    cpuLineChart.data.datasets[0].data = newCpuData;
    cpuLineChart.update('none');
    
    // Update memory chart
    const newMemoryData = memoryPieChart.data.datasets[0].data.map(value => 
        Math.max(5, Math.min(60, value + Math.floor(Math.random() * 10) - 5))
    );
    const total = newMemoryData.reduce((a, b) => a + b, 0);
    const normalizedData = newMemoryData.map(value => Math.round((value / total) * 100));
    memoryPieChart.data.datasets[0].data = normalizedData;
    memoryPieChart.update('none');
    
    // Update network chart
    networkChart.data.datasets[0].data = networkChart.data.datasets[0].data.map(() => 
        Math.floor(Math.random() * 40) + 10
    );
    networkChart.data.datasets[1].data = networkChart.data.datasets[1].data.map(() => 
        Math.floor(Math.random() * 60) + 20
    );
    networkChart.update('none');
}

function updateServicesData() {
    // Randomly update service CPU and memory usage
    servicesData.forEach(service => {
        if (service.status === 'running') {
            service.cpu = Math.max(1, Math.min(80, service.cpu + Math.floor(Math.random() * 10) - 5));
            service.memory = Math.max(64, Math.min(2048, service.memory + Math.floor(Math.random() * 50) - 25));
            
            // Update uptime (simulate)
            if (Math.random() > 0.8) {
                const days = Math.floor(Math.random() * 10);
                const hours = Math.floor(Math.random() * 24);
                service.uptime = `${days}d ${hours}h`;
            }
        }
    });
    loadServicesData();
}

function updateNodesData() {
    // Update node metrics
    serverNodes.forEach(node => {
        if (node.status !== 'offline') {
            node.cpu = Math.max(10, Math.min(90, node.cpu + Math.floor(Math.random() * 15) - 7));
            node.memory = Math.max(20, Math.min(95, node.memory + Math.floor(Math.random() * 10) - 5));
            node.load = parseFloat(Math.max(0.5, Math.min(5.0, node.load + (Math.random() * 0.5 - 0.25)).toFixed(1)));
        }
    });
    loadServerNodes();
}

function startSystemUpdates() {
    // Auto-refresh data every 20 seconds
    setInterval(() => {
        updateSystemCharts();
        updateServicesData();
        updateNodesData();
        const now = new Date();
        document.getElementById('last-updated').textContent = now.toLocaleTimeString();
    }, 20000);
}

function updateUptimeCounter() {
    // Simulate uptime counter
    let days = 15;
    let hours = 22;
    let minutes = 34;
    
    setInterval(() => {
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
            if (hours >= 24) {
                hours = 0;
                days++;
            }
        }
        document.getElementById('system-uptime').textContent = 
            `${days}d ${hours}h ${minutes}m`;
    }, 60000); // Update every minute (for demo)
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #f3722c, #f8961e);
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
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add additional CSS for system terminal
const systemStyle = document.createElement('style');
systemStyle.textContent = `
    .terminal-container[data-terminal="system"] .terminal-header {
        background: linear-gradient(90deg, #f3722c, #f8961e);
    }
    
    .service-name {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .service-actions {
        display: flex;
        gap: 8px;
    }
    
    .action-btn {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s;
    }
    
    .action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .action-btn.small {
        padding: 6px 10px;
        font-size: 0.9rem;
    }
    
    .nodes-section {
        margin-top: 30px;
    }
    
    .nodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .node-card {
        background: var(--terminal-card);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .node-card.online {
        border-left: 4px solid #43aa8b;
    }
    
    .node-card.warning {
        border-left: 4px solid #f8961e;
    }
    
    .node-card.offline {
        border-left: 4px solid #f94144;
        opacity: 0.7;
    }
    
    .node-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .node-status {
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .node-status.online {
        background: rgba(67, 170, 139, 0.1);
        color: #43aa8b;
    }
    
    .node-status.warning {
        background: rgba(248, 150, 30, 0.1);
        color: #f8961e;
    }
    
    .node-status.offline {
        background: rgba(249, 65, 68, 0.1);
        color: #f94144;
    }
    
    .node-stats {
        margin: 15px 0;
    }
    
    .node-stat {
        margin-bottom: 10px;
    }
    
    .node-stat span {
        font-size: 0.9rem;
        color: #94a3b8;
    }
    
    .stat-bar {
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        margin-top: 5px;
        overflow: hidden;
    }
    
    .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #f3722c, #f8961e);
        border-radius: 3px;
    }
    
    .node-info {
        margin: 10px 0;
        color: #94a3b8;
        font-size: 0.9rem;
    }
    
    .node-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    
    .stat-gauge {
        margin: 10px 0;
    }
    
    .gauge-bar {
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
    }
    
    .gauge-fill {
        height: 100%;
        background: linear-gradient(90deg, #f3722c, #f8961e);
        border-radius: 4px;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(systemStyle);