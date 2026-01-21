// Terminal Credentials
const TERMINAL_CREDENTIALS = {
    sales: {
        name: "Sales Analytics Terminal",
        validUsers: [
            { username: "sales", password: "sales123", role: "Sales Manager" },
            { username: "sales_rep", password: "rep123", role: "Sales Representative" }
        ],
        icon: "fas fa-chart-line",
        color: "#7209b7",
        page: "terminal-sales.html"
    },
    system: {
        name: "System Monitoring Terminal",
        validUsers: [
            { username: "sysadmin", password: "sys123", role: "System Administrator" },
            { username: "devops", password: "devops123", role: "DevOps Engineer" }
        ],
        icon: "fas fa-server",
        color: "#f3722c",
        page: "terminal-system.html"
    },
    analytics: {
        name: "Business Intelligence Terminal",
        validUsers: [
            { username: "analytics", password: "analytics123", role: "Data Analyst" },
            { username: "bi_user", password: "bi123", role: "BI Specialist" }
        ],
        icon: "fas fa-chart-bar",
        color: "#43aa8b",
        page: "terminal-analytics.html"
    },
    finance: {
        name: "Financial Terminal",
        validUsers: [
            { username: "finance", password: "finance123", role: "Financial Analyst" },
            { username: "accountant", password: "acc123", role: "Accountant" }
        ],
        icon: "fas fa-coins",
        color: "#577590",
        page: "terminal-finance.html"
    }
};

// Active Sessions Store
const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');

document.addEventListener('DOMContentLoaded', function() {
    updateSessionDisplay();
    startSessionTimer();
});

function loginTerminal(terminalId) {
    const terminal = TERMINAL_CREDENTIALS[terminalId];
    const username = document.getElementById(`${terminalId}-user`).value.trim();
    const password = document.getElementById(`${terminalId}-pass`).value;
    const errorElement = document.getElementById(`error-${terminalId}`);
    
    // Clear previous error
    errorElement.style.display = 'none';
    
    // Validate inputs
    if (!username || !password) {
        showError(errorElement, 'Please enter both username and password');
        return;
    }
    
    // Validate credentials
    const validUser = terminal.validUsers.find(user => 
        user.username === username && user.password === password
    );
    
    if (validUser) {
        // Create session data
        const sessionData = {
            terminalId: terminalId,
            terminalName: terminal.name,
            username: username,
            role: validUser.role,
            loginTime: new Date().toISOString(),
            sessionId: generateSessionId()
        };
        
        // Store session
        activeSessions.push(sessionData);
        localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
        
        // Store terminal-specific session
        localStorage.setItem(`${terminalId}_session`, JSON.stringify({
            username: username,
            role: validUser.role,
            loginTime: sessionData.loginTime
        }));
        
        // Open terminal in new window
        openTerminal(terminalId, sessionData);
        
        // Update display
        updateSessionDisplay();
        
        // Show success message
        showSuccessMessage(terminal.name);
        
    } else {
        showError(errorElement, 'Invalid credentials. Try: sales/sales123');
    }
}

function openTerminal(terminalId, sessionData) {
    const terminal = TERMINAL_CREDENTIALS[terminalId];
    
    // Pass session data via URL parameters
    const params = new URLSearchParams({
        username: sessionData.username,
        role: sessionData.role,
        sessionId: sessionData.sessionId,
        terminal: terminalId
    });
    
    const url = `${terminal.page}?${params.toString()}`;
    
    // Open in new window with specific features
    const windowFeatures = 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes';
    const newWindow = window.open(url, `terminal_${terminalId}`, windowFeatures);
    
    if (!newWindow) {
        alert('Please allow pop-ups for this website to open terminals.');
        return;
    }
    
    // Focus the new window
    newWindow.focus();
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function showSuccessMessage(terminalName) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
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
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        ">
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>${terminalName} accessed successfully!</strong>
                <div style="font-size: 0.9rem;">Opening in new window...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateSessionDisplay() {
    const sessionsContainer = document.getElementById('active-sessions');
    
    if (activeSessions.length === 0) {
        sessionsContainer.innerHTML = `
            <div class="empty-sessions">
                <i class="fas fa-desktop"></i>
                <p>No active terminal sessions</p>
            </div>
        `;
        return;
    }
    
    sessionsContainer.innerHTML = activeSessions.map(session => `
        <div class="active-session" style="border-left-color: ${TERMINAL_CREDENTIALS[session.terminalId].color}">
            <div class="session-info">
                <h4>${session.terminalName}</h4>
                <p>${session.username} (${session.role})</p>
                <small>Logged in: ${formatTime(session.loginTime)}</small>
            </div>
            <button class="close-session" onclick="closeSession('${session.sessionId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function closeSession(sessionId) {
    const index = activeSessions.findIndex(s => s.sessionId === sessionId);
    if (index > -1) {
        const session = activeSessions[index];
        
        // Clear terminal-specific session
        localStorage.removeItem(`${session.terminalId}_session`);
        
        // Remove from active sessions
        activeSessions.splice(index, 1);
        localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
        
        // Update display
        updateSessionDisplay();
        
        // Try to close the window (might fail if user already closed it)
        try {
            const windowName = `terminal_${session.terminalId}`;
            const terminalWindow = window.open('', windowName);
            if (terminalWindow && !terminalWindow.closed) {
                terminalWindow.close();
            }
        } catch (e) {
            console.log('Window already closed by user');
        }
    }
}

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function startSessionTimer() {
    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('session-time').textContent = `Session: ${timeString}`;
    }, 1000);
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);