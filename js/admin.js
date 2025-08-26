// Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.sidebarCollapsed = false;
        this.charts = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.initCharts();
        this.loadDashboardData();
        this.startRealTimeUpdates();
    }

    bindEvents() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Chart controls
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChartControl(e.target);
            });
        });

        // Settings toggles
        const toggles = document.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.handleSettingChange(e.target);
            });
        });

        // Action buttons
        const actionBtns = document.querySelectorAll('.btn-icon');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleActionButton(e.target);
            });
        });

        // Responsive sidebar
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const main = document.querySelector('.admin-main');
        
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('show');
        } else {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
        }
        
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`).closest('.nav-item');
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        this.currentSection = sectionId;
        
        // Load section-specific data
        this.loadSectionData(sectionId);
    }

    initCharts() {
        // Volume Chart
        const volumeCtx = document.getElementById('volumeChart');
        if (volumeCtx) {
            this.charts.volume = new Chart(volumeCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Trading Volume',
                        data: [2100000, 2300000, 1900000, 2500000, 2200000, 2400000, 2600000],
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
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
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                callback: function(value) {
                                    return '$' + (value / 1000000).toFixed(1) + 'M';
                                }
                            }
                        }
                    }
                }
            });
        }

        // User Chart
        const userCtx = document.getElementById('userChart');
        if (userCtx) {
            this.charts.user = new Chart(userCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Pending', 'Suspended'],
                    datasets: [{
                        data: [8234, 234, 45],
                        backgroundColor: [
                            '#00d4ff',
                            '#ffc107',
                            '#ff6b6b'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }

        // Trading Chart
        const tradingCtx = document.getElementById('tradingChart');
        if (tradingCtx) {
            this.charts.trading = new Chart(tradingCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Volume',
                        data: [1200000, 1900000, 1500000, 2100000, 1800000, 2400000],
                        backgroundColor: 'rgba(0, 212, 255, 0.8)',
                        borderColor: '#00d4ff',
                        borderWidth: 1
                    }, {
                        label: 'Revenue',
                        data: [24000, 38000, 30000, 42000, 36000, 48000],
                        backgroundColor: 'rgba(255, 107, 107, 0.8)',
                        borderColor: '#ff6b6b',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        this.updateStats();
        this.updateActivity();
    }

    updateStats() {
        // Simulate real-time stat updates
        const stats = [
            { value: 12847, change: '+5.2%' },
            { value: 2400000, change: '+12.8%' },
            { value: 48392, change: '+8.1%' },
            { value: 23, change: '+3' }
        ];

        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            if (stats[index]) {
                const valueElement = card.querySelector('h3');
                const changeElement = card.querySelector('.stat-change');
                
                if (valueElement) {
                    this.animateValue(valueElement, stats[index].value);
                }
                
                if (changeElement) {
                    changeElement.textContent = stats[index].change;
                }
            }
        });
    }

    animateValue(element, targetValue) {
        const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            
            if (targetValue >= 1000000) {
                element.textContent = '$' + (currentValue / 1000000).toFixed(1) + 'M';
            } else if (targetValue >= 1000) {
                element.textContent = currentValue.toLocaleString();
            } else {
                element.textContent = currentValue;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateActivity() {
        // Simulate new activity items
        const activities = [
            {
                icon: 'fas fa-user-plus',
                text: '<strong>John Doe</strong> registered a new account',
                time: '2 minutes ago'
            },
            {
                icon: 'fas fa-chart-line',
                text: '<strong>Sarah Smith</strong> executed a trade worth $5,000',
                time: '5 minutes ago'
            },
            {
                icon: 'fas fa-exclamation-circle',
                text: '<strong>System Alert:</strong> High trading volume detected',
                time: '10 minutes ago'
            }
        ];

        // Update activity list with new items
        // This would typically come from a real-time data source
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'users':
                this.loadUserData();
                break;
            case 'trades':
                this.loadTradingData();
                break;
            case 'transactions':
                this.loadTransactionData();
                break;
            case 'support':
                this.loadSupportData();
                break;
            case 'reports':
                this.loadReportData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    loadUserData() {
        // Simulate loading user data
        console.log('Loading user management data...');
    }

    loadTradingData() {
        // Simulate loading trading data
        console.log('Loading trading analytics data...');
        
        // Update trading chart if visible
        if (this.charts.trading && this.currentSection === 'trades') {
            this.updateTradingChart();
        }
    }

    updateTradingChart() {
        // Simulate updating trading chart with new data
        const newData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Volume',
                data: [1300000, 2000000, 1600000, 2200000, 1900000, 2500000],
                backgroundColor: 'rgba(0, 212, 255, 0.8)',
                borderColor: '#00d4ff',
                borderWidth: 1
            }, {
                label: 'Revenue',
                data: [26000, 40000, 32000, 44000, 38000, 50000],
                backgroundColor: 'rgba(255, 107, 107, 0.8)',
                borderColor: '#ff6b6b',
                borderWidth: 1
            }]
        };
        
        this.charts.trading.data = newData;
        this.charts.trading.update();
    }

    loadTransactionData() {
        console.log('Loading transaction data...');
    }

    loadSupportData() {
        console.log('Loading support tickets...');
    }

    loadReportData() {
        console.log('Loading reports...');
    }

    loadSettingsData() {
        console.log('Loading settings...');
    }

    handleChartControl(button) {
        // Remove active class from all chart buttons
        const chartBtns = button.parentElement.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Update chart based on selection
        const chartType = button.textContent.toLowerCase();
        console.log(`Switching chart to: ${chartType}`);
    }

    handleSettingChange(toggle) {
        const settingName = toggle.id;
        const isEnabled = toggle.checked;
        
        console.log(`Setting ${settingName} changed to: ${isEnabled}`);
        
        // Show notification
        this.showNotification(`${settingName} has been ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    handleActionButton(button) {
        const action = button.getAttribute('title');
        const row = button.closest('tr');
        const userId = row ? row.cells[0].textContent : null;
        
        console.log(`Action: ${action} for user: ${userId}`);
        
        // Show confirmation or perform action
        this.showNotification(`${action} action triggered for user ${userId}`);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: rgba(0, 212, 255, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            backdrop-filter: blur(20px);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.updateStats();
            }
        }, 30000);
        
        // Update notification count
        setInterval(() => {
            this.updateNotificationCount();
        }, 60000);
    }

    updateNotificationCount() {
        const notificationCount = document.querySelector('.notification-count');
        if (notificationCount) {
            const currentCount = parseInt(notificationCount.textContent) || 0;
            const newCount = Math.max(0, currentCount + Math.floor(Math.random() * 3) - 1);
            notificationCount.textContent = newCount;
            
            if (newCount === 0) {
                notificationCount.style.display = 'none';
            } else {
                notificationCount.style.display = 'flex';
            }
        }
    }

    handleResize() {
        const sidebar = document.getElementById('adminSidebar');
        const main = document.querySelector('.admin-main');
        
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('collapsed');
            main.classList.remove('expanded');
            if (!sidebar.classList.contains('show')) {
                sidebar.style.transform = 'translateX(-100%)';
            }
        } else {
            sidebar.classList.remove('show');
            sidebar.style.transform = '';
        }
        
        // Resize charts
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    // Export data functionality
    exportData(type) {
        console.log(`Exporting ${type} data...`);
        
        // Simulate data export
        const data = {
            timestamp: new Date().toISOString(),
            type: type,
            records: Math.floor(Math.random() * 1000) + 100
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showNotification(`${type} data exported successfully`);
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Export functionality for buttons
function exportDashboardData() {
    if (window.adminDashboard) {
        window.adminDashboard.exportData('dashboard');
    }
}

function exportReportData() {
    if (window.adminDashboard) {
        window.adminDashboard.exportData('report');
    }
}