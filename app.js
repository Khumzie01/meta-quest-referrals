// Meta Quest Referrals - Main Application JavaScript

// ============================================
// Dark Mode Management
// ============================================

class ThemeManager {
    constructor() {
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.darkModeIcon = document.getElementById('darkModeIcon');
        this.body = document.body;
        
        // Load saved theme preference
        this.loadTheme();
        
        // Set up event listener
        this.darkModeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        if (theme === 'dark') {
            this.body.classList.remove('light-mode');
            this.body.classList.add('dark-mode');
            this.darkModeIcon.textContent = '☀️';
        } else {
            this.body.classList.remove('dark-mode');
            this.body.classList.add('light-mode');
            this.darkModeIcon.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
    }
    
    toggleTheme() {
        const currentTheme = this.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Show toast notification
        showToast(
            `${newTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated!`,
            'info'
        );
    }
}

// ============================================
// Toast Notification System
// ============================================

function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, duration);
}

// ============================================
// Referral Link Management
// ============================================

class ReferralManager {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Copy link buttons
        document.querySelectorAll('[data-action="copy-link"]').forEach(button => {
            button.addEventListener('click', (e) => this.handleCopyLink(e));
        });
        
        // Visit link tracking
        document.querySelectorAll('[data-action="visit-link"]').forEach(link => {
            link.addEventListener('click', (e) => this.handleVisitLink(e));
        });
    }
    
    async handleCopyLink(event) {
        const button = event.currentTarget;
        const link = button.getAttribute('data-link');
        const device = button.getAttribute('data-device');
        
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(link);
                this.showCopySuccess(device);
            } else {
                // Fallback for older browsers
                this.fallbackCopyToClipboard(link);
                this.showCopySuccess(device);
            }
            
            // Track copy action (for future analytics)
            this.trackAction('copy_link', device);
            
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast('Failed to copy link. Please try again.', 'info');
        }
    }
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            throw new Error('Fallback copy failed');
        }
        
        document.body.removeChild(textArea);
    }
    
    showCopySuccess(device) {
        showToast(`✓ ${device} referral link copied to clipboard!`, 'success');
        
        // Optional: Play success sound
        this.playSuccessSound();
    }
    
    handleVisitLink(event) {
        const link = event.currentTarget;
        const device = link.getAttribute('data-device');
        
        // Track visit action (for future analytics)
        this.trackAction('visit_link', device);
        
        showToast(`Opening ${device} referral link...`, 'info', 2000);
    }
    
    trackAction(action, device) {
        // Store action in localStorage for future analytics
        const actions = JSON.parse(localStorage.getItem('referral_actions') || '[]');
        actions.push({
            action,
            device,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 actions
        if (actions.length > 100) {
            actions.shift();
        }
        
        localStorage.setItem('referral_actions', JSON.stringify(actions));
    }
    
    playSuccessSound() {
        // Simple beep using Web Audio API (optional, non-blocking)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (err) {
            // Silently fail if audio not supported
            console.log('Audio feedback not available');
        }
    }
}

// ============================================
// Performance Monitoring
// ============================================

class PerformanceMonitor {
    constructor() {
        this.logPerformanceMetrics();
    }
    
    logPerformanceMetrics() {
        // Wait for page load
        window.addEventListener('load', () => {
            // Use Performance API if available
            if ('performance' in window) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                console.log(`[Performance] Page loaded in ${pageLoadTime}ms`);
                
                // Store for future analytics
                localStorage.setItem('last_load_time', pageLoadTime.toString());
            }
        });
    }
}

// ============================================
// Animations and Visual Effects
// ============================================

class AnimationController {
    constructor() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
    }
    
    setupScrollAnimations() {
        // Add subtle fade-in effect for cards on scroll
        const cards = document.querySelectorAll('.card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        cards.forEach(card => observer.observe(card));
    }
    
    setupHoverEffects() {
        // Add ripple effect to buttons
        document.querySelectorAll('button, .btn-primary').forEach(button => {
            button.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    width: 100px;
                    height: 100px;
                    left: ${x - 50}px;
                    top: ${y - 50}px;
                    pointer-events: none;
                    animation: ripple 0.6s ease-out;
                `;
                
                // Add animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                
                if (!document.querySelector('style[data-ripple]')) {
                    style.setAttribute('data-ripple', 'true');
                    document.head.appendChild(style);
                }
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
}

// ============================================
// Accessibility Enhancements
// ============================================

class AccessibilityManager {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
    }
    
    setupKeyboardNavigation() {
        // Allow keyboard navigation for cards
        document.querySelectorAll('.card').forEach(card => {
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const button = card.querySelector('button');
                    if (button) button.click();
                }
            });
        });
    }
    
    setupAriaLabels() {
        // Ensure all interactive elements have proper labels
        document.querySelectorAll('[data-action]').forEach(element => {
            if (!element.hasAttribute('aria-label')) {
                const action = element.getAttribute('data-action');
                const device = element.getAttribute('data-device');
                element.setAttribute('aria-label', `${action.replace('-', ' ')} for ${device}`);
            }
        });
    }
}

// ============================================
// Console Easter Egg
// ============================================

function showConsoleWelcome() {
    const styles = [
        'color: #00e5ff',
        'font-size: 16px',
        'font-weight: bold',
        'text-shadow: 0 0 10px #00e5ff'
    ].join(';');
    
    console.log('%c> SYSTEM INITIALIZED', styles);
    console.log('%c> Welcome to Meta Quest Referrals!', 'color: #00e5ff; font-size: 14px;');
    console.log('%c> Type "help()" for available commands', 'color: #888; font-size: 12px;');
}

// Console commands for automation/testing
window.help = function() {
    console.log(`
Available Commands:
------------------
getStats()        - View usage statistics
clearStats()      - Clear all stored statistics
exportData()      - Export referral actions data
testToast()       - Test toast notification system
toggleTheme()     - Toggle dark/light mode
    `);
};

window.getStats = function() {
    const actions = JSON.parse(localStorage.getItem('referral_actions') || '[]');
    const loadTime = localStorage.getItem('last_load_time');
    
    console.log('Usage Statistics:', {
        totalActions: actions.length,
        lastLoadTime: `${loadTime}ms`,
        theme: localStorage.getItem('theme'),
        actions: actions
    });
};

window.clearStats = function() {
    localStorage.removeItem('referral_actions');
    console.log('Statistics cleared!');
};

window.exportData = function() {
    const data = {
        actions: JSON.parse(localStorage.getItem('referral_actions') || '[]'),
        theme: localStorage.getItem('theme'),
        lastLoadTime: localStorage.getItem('last_load_time')
    };
    console.log('Export Data:', JSON.stringify(data, null, 2));
    return data;
};

window.testToast = function() {
    showToast('This is a test notification!', 'success');
};

window.toggleTheme = function() {
    document.getElementById('darkModeToggle').click();
};

// ============================================
// Application Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Show console welcome
    showConsoleWelcome();
    
    // Initialize all managers
    const themeManager = new ThemeManager();
    const referralManager = new ReferralManager();
    const performanceMonitor = new PerformanceMonitor();
    const animationController = new AnimationController();
    const accessibilityManager = new AccessibilityManager();
    
    // Show welcome toast after a short delay
    setTimeout(() => {
        showToast('Welcome to Meta Quest Referrals! 🥽', 'info', 4000);
    }, 500);
    
    console.log('[App] All systems operational ✓');
});

// ============================================
// Service Worker Registration (for future PWA)
// ============================================

if ('serviceWorker' in navigator) {
    // Register service worker when available
    window.addEventListener('load', () => {
        // Placeholder for future PWA implementation
        console.log('[PWA] Service Worker support detected');
    });
}
