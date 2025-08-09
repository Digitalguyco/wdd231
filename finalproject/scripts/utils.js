// Shared Utilities for FinanceFlow
// This module contains utility functions used across the application

// LocalStorage management
export const storage = {
    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Set data to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all data
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Date utilities
export const dateUtils = {
    // Format date for display
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return new Date(date).toLocaleDateString('en-US', options);
    },

    // Format date for input fields
    formatDateInput(date) {
        return new Date(date).toISOString().split('T')[0];
    },

    // Get today's date
    getToday() {
        return this.formatDateInput(new Date());
    },

    // Get date range (days ago)
    getDateRange(days) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return {
            start: this.formatDateInput(start),
            end: this.formatDateInput(end)
        };
    },

    // Check if date is within range
    isWithinRange(date, days) {
        const targetDate = new Date(date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return targetDate >= cutoffDate;
    }
};

// Number/Currency utilities
export const currencyUtils = {
    // Format number as currency
    format(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Parse currency string to number
    parse(currencyString) {
        const numStr = currencyString.replace(/[$,]/g, '');
        return parseFloat(numStr) || 0;
    },

    // Validate if string is valid currency
    isValid(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
    }
};

// DOM manipulation utilities
export const dom = {
    // Get element by ID
    get(id) {
        return document.getElementById(id);
    },

    // Get elements by class
    getByClass(className) {
        return document.getElementsByClassName(className);
    },

    // Query selector
    query(selector) {
        return document.querySelector(selector);
    },

    // Query all selectors
    queryAll(selector) {
        return document.querySelectorAll(selector);
    },

    // Create element
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        // Set content
        if (content) {
            element.innerHTML = content;
        }
        
        return element;
    },

    // Show element
    show(element) {
        element.style.display = 'block';
    },

    // Hide element
    hide(element) {
        element.style.display = 'none';
    },

    // Toggle element visibility
    toggle(element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
};

// Message/notification utilities
export const messages = {
    // Show success message
    showSuccess(message, duration = 3000) {
        this.showMessage(message, 'success', duration);
    },

    // Show error message
    showError(message, duration = 5000) {
        this.showMessage(message, 'error', duration);
    },

    // Show warning message
    showWarning(message, duration = 4000) {
        this.showMessage(message, 'warning', duration);
    },

    // Show generic message
    showMessage(message, type = 'info', duration = 3000) {
        const container = dom.get('message-container') || this.createMessageContainer();
        
        const messageEl = dom.create('div', {
            class: `message ${type}`
        }, message);
        
        container.appendChild(messageEl);
        
        // Auto remove after duration
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, duration);
    },

    // Create message container if it doesn't exist
    createMessageContainer() {
        const container = dom.create('div', {
            id: 'message-container',
            class: 'message-container'
        });
        
        document.body.appendChild(container);
        return container;
    }
};

// Modal utilities
export const modal = {
    // Show modal
    show(modalId) {
        const modal = dom.get(modalId);
        if (modal) {
            modal.style.display = 'block';
            
            // Add click handler to close on backdrop click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.hide(modalId);
                }
            };
        }
    },

    // Hide modal
    hide(modalId) {
        const modal = dom.get(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Setup modal close handlers
    setupCloseHandlers(modalId) {
        const modal = dom.get(modalId);
        if (!modal) return;
        
        // Close button handler
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hide(modalId);
        }
        
        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                this.hide(modalId);
            }
        });
    }
};

// Array utility functions
export const arrayUtils = {
    // Filter array by multiple criteria
    filterBy(array, filters) {
        return array.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === 'all' || value === '') return true;
                return item[key] === value;
            });
        });
    },

    // Sort array by property
    sortBy(array, property, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    },

    // Group array by property
    groupBy(array, property) {
        return array.reduce((groups, item) => {
            const key = item[property];
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    },

    // Sum array by property
    sumBy(array, property) {
        return array.reduce((sum, item) => sum + (item[property] || 0), 0);
    }
};

// Validation utilities
export const validation = {
    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate required field
    isRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    // Validate number range
    isInRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    // Validate form
    validateForm(formData, rules) {
        const errors = {};
        
        Object.entries(rules).forEach(([field, fieldRules]) => {
            const value = formData[field];
            
            if (fieldRules.required && !this.isRequired(value)) {
                errors[field] = `${field} is required`;
            } else if (value && fieldRules.type === 'email' && !this.isValidEmail(value)) {
                errors[field] = `${field} must be a valid email`;
            } else if (value && fieldRules.min !== undefined && parseFloat(value) < fieldRules.min) {
                errors[field] = `${field} must be at least ${fieldRules.min}`;
            } else if (value && fieldRules.max !== undefined && parseFloat(value) > fieldRules.max) {
                errors[field] = `${field} must be no more than ${fieldRules.max}`;
            }
        });
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// Navigation utilities
export const navigation = {
    // Setup mobile navigation toggle
    setupMobileNav() {
        const navToggle = dom.get('nav-toggle');
        const navMenu = dom.get('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    },

    // Set active navigation link
    setActiveLink(currentPage) {
        const navLinks = dom.queryAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
};

// Animation utilities
export const animations = {
    // Fade in element
    fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.min(progress / duration, 1);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    // Slide down element
    slideDown(element, duration = 300) {
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            const currentHeight = (targetHeight * progress) / duration;
            element.style.height = Math.min(currentHeight, targetHeight) + 'px';
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Export all utilities as default
export default {
    storage,
    dateUtils,
    currencyUtils,
    dom,
    messages,
    modal,
    arrayUtils,
    validation,
    navigation,
    animations
};
