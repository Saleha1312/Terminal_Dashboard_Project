// Initialize terminal
document.addEventListener('DOMContentLoaded', function() {
    initializeTerminal();
    loadCharts();
    loadSalesData();
    startDataUpdates();
});

function initializeTerminal() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const role = urlParams.get('role');
    const sessionId = urlParams.get('sessionId');
    const terminal = urlParams.get('terminal');
    
    if (!username || !role || !sessionId) {
        // Not properly authenticated, redirect to main
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
    document.title = `${username} - Sales Analytics Terminal`;
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
    
    // Remove from active sessions in main window
    if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
            type: 'CLOSE_TERMINAL_SESSION',
            sessionId: session.sessionId
        }, '*');
    }
    
    // Clear local session
    sessionStorage.removeItem('terminalSession');
    
    // Close window
    window.close();
}

// Chart Data and Configuration
let revenuePieChart, salesBarChart, revenueLineChart, marketDonutChart, productsBarChart;

function loadCharts() {
    // 1. Revenue by Category Pie Chart
    const pieCtx = document.getElementById('revenuePieChart').getContext('2d');
    revenuePieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Electronics', 'Fashion', 'Home & Garden', 'Books', 'Sports', 'Other'],
            datasets: [{
                data: [35, 25, 15, 10, 8, 7],
                backgroundColor: [
                    '#7209b7', '#4361ee', '#4cc9f0', '#f8961e', '#f94144', '#90be6d'
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
                        color: '#94a3b8',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // 2. Monthly Sales Bar Chart
    const barCtx = document.getElementById('salesBarChart').getContext('2d');
    salesBarChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Sales ($)',
                data: [85000, 92000, 105000, 120000, 135000, 142000, 155000, 148000, 162000, 175000, 188000, 210000],
                backgroundColor: 'rgba(114, 9, 183, 0.8)',
                borderColor: '#7209b7',
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
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
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

    // 3. Revenue Trend Line Chart
    const lineCtx = document.getElementById('revenueLineChart').getContext('2d');
    revenueLineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: '2024',
                    data: [125000, 135000, 142000, 155000, 168000, 175000, 182000, 190000, 195000, 205000, 215000, 225000],
                    borderColor: '#7209b7',
                    backgroundColor: 'rgba(114, 9, 183, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '2023',
                    data: [105000, 112000, 120000, 125000, 132000, 138000, 142000, 148000, 152000, 158000, 165000, 172000],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
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
                            return '$' + value.toLocaleString();
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

    // 4. Market Share Donut Chart
    const donutCtx = document.getElementById('marketDonutChart').getContext('2d');
    marketDonutChart = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Our Company', 'Competitor A', 'Competitor B', 'Competitor C', 'Others'],
            datasets: [{
                data: [38, 22, 18, 12, 10],
                backgroundColor: [
                    '#7209b7', '#4361ee', '#4cc9f0', '#f8961e', '#90be6d'
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

    // 5. Top Products Horizontal Bar Chart
    const productsCtx = document.getElementById('productsBarChart').getContext('2d');
    productsBarChart = new Chart(productsCtx, {
        type: 'bar',
        data: {
            labels: ['Laptop Pro', 'Smartphone X', 'Wireless Headphones', 'Fitness Tracker', 'Gaming Console', '4K TV', 'Tablet Air', 'Smart Watch'],
            datasets: [{
                label: 'Sales ($)',
                data: [245000, 198000, 156000, 142000, 128000, 115000, 98000, 85000],
                backgroundColor: 'rgba(114, 9, 183, 0.8)',
                borderColor: '#7209b7',
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
                            return '$' + value.toLocaleString();
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

function updatePieChart() {
    const filter = document.getElementById('pieChartFilter').value;
    // Simulate data update based on filter
    const newData = filter === 'quarter' ? [40, 28, 12, 8, 6, 6] :
                   filter === 'year' ? [38, 26, 14, 9, 7, 6] :
                   [35, 25, 15, 10, 8, 7];
    
    revenuePieChart.data.datasets[0].data = newData;
    revenuePieChart.update();
}

function updateBarChart() {
    const year = document.getElementById('barChartFilter').value;
    // Simulate different data for different years
    const newData = year === '2023' ? 
        [75000, 82000, 95000, 105000, 120000, 125000, 135000, 128000, 142000, 155000, 168000, 175000] :
        [85000, 92000, 105000, 120000, 135000, 142000, 155000, 148000, 162000, 175000, 188000, 210000];
    
    salesBarChart.data.datasets[0].data = newData;
    salesBarChart.data.datasets[0].label = `Sales ${year} ($)`;
    salesBarChart.update();
}

// Sales Data
const salesData = [
    { id: 'S001', date: '2024-01-15', customer: 'John Smith', product: 'Laptop Pro', amount: 1299, status: 'completed' },
    { id: 'S002', date: '2024-01-16', customer: 'Emma Wilson', product: 'Smartphone X', amount: 899, status: 'completed' },
    { id: 'S003', date: '2024-01-17', customer: 'Robert Brown', product: 'Wireless Headphones', amount: 249, status: 'pending' },
    { id: 'S004', date: '2024-01-18', customer: 'Lisa Johnson', product: 'Fitness Tracker', amount: 199, status: 'completed' },
    { id: 'S005', date: '2024-01-19', customer: 'Michael Davis', product: 'Gaming Console', amount: 499, status: 'cancelled' },
    { id: 'S006', date: '2024-01-20', customer: 'Sarah Miller', product: '4K TV', amount: 899, status: 'completed' },
    { id: 'S007', date: '2024-01-21', customer: 'David Wilson', product: 'Tablet Air', amount: 649, status: 'pending' },
    { id: 'S008', date: '2024-01-22', customer: 'Jennifer Lee', product: 'Smart Watch', amount: 329, status: 'completed' },
    { id: 'S009', date: '2024-01-23', customer: 'Thomas Clark', product: 'Laptop Pro', amount: 1299, status: 'completed' },
    { id: 'S010', date: '2024-01-24', customer: 'Amanda White', product: 'Smartphone X', amount: 899, status: 'completed' }
];

function loadSalesData() {
    const tableBody = document.getElementById('salesTableBody');
    tableBody.innerHTML = salesData.map(sale => `
        <tr>
            <td>${sale.id}</td>
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>${sale.product}</td>
            <td>$${sale.amount.toLocaleString()}</td>
            <td><span class="status-badge ${sale.status}">${sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</span></td>
        </tr>
    `).join('');
}

function refreshData() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalHtml = refreshBtn.innerHTML;
    
    // Show loading state
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Update charts with new data
        updateChartsWithLiveData();
        
        // Update last updated time
        const now = new Date();
        document.getElementById('last-updated').textContent = now.toLocaleTimeString();
        
        // Restore button
        refreshBtn.innerHTML = originalHtml;
        refreshBtn.disabled = false;
        
        // Show notification
        showNotification('Data refreshed successfully!');
    }, 1500);
}

function updateChartsWithLiveData() {
    // Update pie chart with slight variations
    const newPieData = revenuePieChart.data.datasets[0].data.map(value => 
        value + Math.floor(Math.random() * 5000) - 2500
    );
    revenuePieChart.data.datasets[0].data = newPieData;
    revenuePieChart.update('none');
    
    // Update bar chart
    const newBarData = salesBarChart.data.datasets[0].data.map(value => 
        value + Math.floor(Math.random() * 10000) - 5000
    );
    salesBarChart.data.datasets[0].data = newBarData;
    salesBarChart.update('none');
    
    // Update line chart
    const newLineData = revenueLineChart.data.datasets[0].data.map(value => 
        value + Math.floor(Math.random() * 15000) - 7500
    );
    revenueLineChart.data.datasets[0].data = newLineData;
    revenueLineChart.update('none');
}

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
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function startDataUpdates() {
    // Auto-refresh data every 30 seconds
    setInterval(() => {
        updateChartsWithLiveData();
        const now = new Date();
        document.getElementById('last-updated').textContent = now.toLocaleTimeString();
    }, 30000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);