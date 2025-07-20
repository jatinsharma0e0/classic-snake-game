/**
 * Developer Toggle System for Browser UI Restrictions
 * Ctrl + Shift + D to toggle between development and production modes
 */

class DevToggleManager {
    constructor() {
        this.restrictionsEnabled = true; // Default: restrictions ON (production mode)
        this.originalStyles = new Map(); // Store original CSS styles
        this.eventListeners = new Map(); // Store event listeners for removal
        this.notification = null; // Reference to notification element
        
        this.init();
    }
    
    init() {
        // Set up keyboard shortcut listener
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Apply initial restrictions
        this.applyRestrictions();
        
        console.log('🔒 DevToggle: Restrictions enabled by default (Production mode)');
    }
    
    handleKeyDown(e) {
        // Check for Ctrl + Shift + D
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            this.toggleRestrictions();
            return false;
        }
    }
    
    toggleRestrictions() {
        this.restrictionsEnabled = !this.restrictionsEnabled;
        
        if (this.restrictionsEnabled) {
            this.applyRestrictions();
            this.showNotification('🔒 Restrictions Enabled: Dev mode OFF', 'enabled');
        } else {
            this.removeRestrictions();
            this.showNotification('🔓 Restrictions Disabled: Dev mode ON', 'disabled');
        }
        
        console.log(`🔄 DevToggle: Restrictions ${this.restrictionsEnabled ? 'ENABLED' : 'DISABLED'}`);
    }
    
    applyRestrictions() {
        this.applyCSSRestrictions();
        this.applyJavaScriptRestrictions();
    }
    
    removeRestrictions() {
        this.removeCSSRestrictions();
        this.removeJavaScriptRestrictions();
    }
    
    applyCSSRestrictions() {
        // Apply CSS restrictions to all elements
        const style = document.createElement('style');
        style.id = 'dev-restrictions-style';
        style.textContent = `
            * {
                /* Prevent text selection and dragging on all elements */
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-user-drag: none !important;
                -khtml-user-drag: none !important;
                -moz-user-drag: none !important;
                -o-user-drag: none !important;
                user-drag: none !important;
                /* Disable touch callouts on mobile */
                -webkit-touch-callout: none !important;
                /* Prevent zooming on mobile */
                touch-action: manipulation !important;
            }
            
            html {
                overflow: hidden !important;
            }
            
            body {
                overflow: hidden !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
            }
        `;
        
        // Remove existing restrictions style if present
        const existing = document.getElementById('dev-restrictions-style');
        if (existing) existing.remove();
        
        document.head.appendChild(style);
    }
    
    removeCSSRestrictions() {
        // Remove the restrictions style sheet
        const restrictionsStyle = document.getElementById('dev-restrictions-style');
        if (restrictionsStyle) {
            restrictionsStyle.remove();
        }
        
        // Allow developers to scroll, select text, etc.
        const devStyle = document.createElement('style');
        devStyle.id = 'dev-override-style';
        devStyle.textContent = `
            * {
                -webkit-user-select: auto !important;
                -moz-user-select: auto !important;
                -ms-user-select: auto !important;
                user-select: auto !important;
                -webkit-user-drag: auto !important;
                -khtml-user-drag: auto !important;
                -moz-user-drag: auto !important;
                -o-user-drag: auto !important;
                user-drag: auto !important;
                -webkit-touch-callout: default !important;
                touch-action: auto !important;
            }
            
            html {
                overflow: auto !important;
            }
            
            body {
                overflow: auto !important;
                position: relative !important;
            }
        `;
        
        document.head.appendChild(devStyle);
    }
    
    applyJavaScriptRestrictions() {
        // Store and apply event listeners for restrictions
        this.eventListeners.clear();
        
        // Prevent right-click context menu
        const contextMenuHandler = (e) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener('contextmenu', contextMenuHandler);
        this.eventListeners.set('contextmenu', contextMenuHandler);
        
        // Prevent text selection
        const selectStartHandler = (e) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener('selectstart', selectStartHandler);
        this.eventListeners.set('selectstart', selectStartHandler);
        
        // Prevent dragging
        const dragStartHandler = (e) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener('dragstart', dragStartHandler);
        this.eventListeners.set('dragstart', dragStartHandler);
        
        // Prevent long-press on mobile
        const touchStartHandler = (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };
        document.addEventListener('touchstart', touchStartHandler);
        this.eventListeners.set('touchstart', touchStartHandler);
        
        // Prevent mobile zooming gestures
        const touchMoveHandler = (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };
        document.addEventListener('touchmove', touchMoveHandler, { passive: false });
        this.eventListeners.set('touchmove', touchMoveHandler);
        
        // Prevent double-tap zoom on iOS
        let lastTouchEnd = 0;
        const touchEndHandler = (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        };
        document.addEventListener('touchend', touchEndHandler, false);
        this.eventListeners.set('touchend', touchEndHandler);
        
        // Block developer keyboard shortcuts (except our toggle)
        const keyDownHandler = (e) => {
            // Allow our toggle shortcut
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                return true;
            }
            
            // Block F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, F5, Ctrl+R
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'u') ||
                (e.ctrlKey && e.key === 's') ||
                e.key === 'F5' ||
                (e.ctrlKey && e.key === 'r')
            ) {
                e.preventDefault();
                return false;
            }
        };
        document.addEventListener('keydown', keyDownHandler);
        this.eventListeners.set('keydown', keyDownHandler);
    }
    
    removeJavaScriptRestrictions() {
        // Remove all restriction event listeners
        this.eventListeners.forEach((handler, event) => {
            document.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
        
        // Remove the dev override style
        const devStyle = document.getElementById('dev-override-style');
        if (devStyle) {
            devStyle.remove();
        }
    }
    
    showNotification(message, type) {
        // Remove existing notification
        if (this.notification) {
            this.notification.remove();
        }
        
        // Create notification element
        this.notification = document.createElement('div');
        this.notification.className = `dev-notification ${type}`;
        this.notification.textContent = message;
        
        // Style the notification
        Object.assign(this.notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            zIndex: '999999',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(100px)',
            opacity: '0'
        });
        
        // Set background color based on type
        if (type === 'enabled') {
            this.notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        } else {
            this.notification.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
        }
        
        document.body.appendChild(this.notification);
        
        // Animate in
        requestAnimationFrame(() => {
            this.notification.style.transform = 'translateY(0)';
            this.notification.style.opacity = '1';
        });
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (this.notification) {
                this.notification.style.transform = 'translateY(100px)';
                this.notification.style.opacity = '0';
                setTimeout(() => {
                    if (this.notification) {
                        this.notification.remove();
                        this.notification = null;
                    }
                }, 300);
            }
        }, 3000);
    }
    
    createDevPanel() {
        // Create developer panel
        const devPanel = document.createElement('div');
        devPanel.id = 'dev-panel';
        devPanel.className = 'dev-panel hidden';
        devPanel.innerHTML = `
            <div class="dev-panel-header">
                <h3>🛠 Developer Panel</h3>
                <button class="dev-panel-close">×</button>
            </div>
            <div class="dev-panel-content">
                <div class="dev-section">
                    <h4>Service Worker & Cache Management</h4>
                    <div class="dev-buttons">
                        <button id="cleanSwBtn" class="dev-btn primary">🧹 Clean SW & Caches</button>
                        <button id="cleanAllBtn" class="dev-btn warning">🗑 Clean Everything</button>
                        <button id="swStatusBtn" class="dev-btn info">📊 SW Status</button>
                    </div>
                </div>
                <div class="dev-section">
                    <h4>Quick Actions</h4>
                    <div class="dev-buttons">
                        <button id="refreshBtn" class="dev-btn">🔄 Hard Refresh</button>
                        <button id="clearLocalStorageBtn" class="dev-btn">💾 Clear localStorage</button>
                    </div>
                </div>
                <div class="dev-section">
                    <h4>Debug Info</h4>
                    <div id="debugInfo" class="debug-info">
                        <p>Press Ctrl+Shift+D to toggle restrictions</p>
                        <p>Check console for detailed logs</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(devPanel);
        this.setupDevPanelEvents(devPanel);
        
        return devPanel;
    }
    
    setupDevPanelEvents(panel) {
        // Close button
        panel.querySelector('.dev-panel-close').addEventListener('click', () => {
            panel.classList.add('hidden');
        });
        
        // Clean SW & Caches
        panel.querySelector('#cleanSwBtn').addEventListener('click', async () => {
            if (window.swCleanup) {
                console.log('🧹 Starting Service Worker cleanup...');
                await window.swCleanup.performFullCleanup();
            } else {
                console.error('SW Cleanup utility not available');
            }
        });
        
        // Clean Everything
        panel.querySelector('#cleanAllBtn').addEventListener('click', async () => {
            if (confirm('This will clear all caches, service workers, and localStorage. Continue?')) {
                if (window.swCleanup) {
                    console.log('🗑 Starting complete cleanup...');
                    await window.swCleanup.performCompleteCleanup();
                    alert('Complete cleanup finished. Consider refreshing the page.');
                } else {
                    console.error('SW Cleanup utility not available');
                }
            }
        });
        
        // SW Status
        panel.querySelector('#swStatusBtn').addEventListener('click', async () => {
            if (window.swCleanup) {
                const status = await window.swCleanup.getStatus();
                console.log('📊 SW Status:', status);
                const debugInfo = panel.querySelector('#debugInfo');
                debugInfo.innerHTML = `
                    <p><strong>Service Workers:</strong> ${status.serviceWorkers}</p>
                    <p><strong>Caches:</strong> ${status.caches}</p>
                    <p><strong>SW Supported:</strong> ${status.isSupported}</p>
                    <p><em>Check console for detailed logs</em></p>
                `;
            }
        });
        
        // Hard Refresh
        panel.querySelector('#refreshBtn').addEventListener('click', () => {
            window.location.reload(true);
        });
        
        // Clear localStorage
        panel.querySelector('#clearLocalStorageBtn').addEventListener('click', () => {
            if (confirm('Clear all localStorage data?')) {
                localStorage.clear();
                console.log('💾 localStorage cleared');
                alert('localStorage cleared');
            }
        });
    }
    
    toggleDevPanel() {
        let panel = document.getElementById('dev-panel');
        if (!panel) {
            panel = this.createDevPanel();
        }
        
        panel.classList.toggle('hidden');
    }
    
    // Enhanced toggle to include dev panel
    toggleRestrictions() {
        this.restrictionsEnabled = !this.restrictionsEnabled;
        
        if (this.restrictionsEnabled) {
            this.applyRestrictions();
            this.showNotification('🔒 Restrictions Enabled: Dev mode OFF', 'enabled');
            // Hide dev panel when restrictions are enabled
            const panel = document.getElementById('dev-panel');
            if (panel) panel.classList.add('hidden');
        } else {
            this.removeRestrictions();
            this.showNotification('🔓 Restrictions Disabled: Dev mode ON', 'disabled');
            // Show dev panel when restrictions are disabled
            setTimeout(() => this.toggleDevPanel(), 500);
        }
        
        console.log(`🔄 DevToggle: Restrictions ${this.restrictionsEnabled ? 'ENABLED' : 'DISABLED'}`);
    }
    
    // Public method to get current state
    getState() {
        return {
            restrictionsEnabled: this.restrictionsEnabled,
            mode: this.restrictionsEnabled ? 'production' : 'development'
        };
    }
}

// Initialize the dev toggle manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.devToggle = new DevToggleManager();
    });
} else {
    window.devToggle = new DevToggleManager();
}