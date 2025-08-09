// Main page JavaScript for FinanceFlow
// Handles home page functionality including tips, stats, and navigation

import { storage, dateUtils, currencyUtils, dom, messages, modal, arrayUtils, navigation } from './utils.js';

// Financial tips data structure
const FINANCIAL_TIPS = [
    {
        id: 1,
        title: "Create an Emergency Fund",
        category: "Savings",
        content: "Set aside 3-6 months of expenses in a separate savings account for unexpected situations like job loss or medical emergencies.",
        difficulty: "beginner",
        timeToImplement: "1-2 months"
    },
    {
        id: 2,
        title: "Track Every Expense",
        category: "Budgeting",
        content: "Record all your spending for at least one month to understand where your money goes. Use apps or spreadsheets to categorize expenses.",
        difficulty: "beginner",
        timeToImplement: "1 week"
    },
    {
        id: 3,
        title: "Follow the 50/30/20 Rule",
        category: "Budgeting",
        content: "Allocate 50% of after-tax income to needs, 30% to wants, and 20% to savings and debt repayment.",
        difficulty: "intermediate",
        timeToImplement: "1 month"
    },
    {
        id: 4,
        title: "Pay Off High-Interest Debt First",
        category: "Debt Management",
        content: "Focus on paying off credit cards and loans with the highest interest rates first while making minimum payments on others.",
        difficulty: "intermediate",
        timeToImplement: "6-12 months"
    },
    {
        id: 5,
        title: "Automate Your Savings",
        category: "Savings",
        content: "Set up automatic transfers to savings accounts so you save money before you can spend it. Start with even small amounts.",
        difficulty: "beginner",
        timeToImplement: "1 day"
    },
    {
        id: 6,
        title: "Review Subscriptions Monthly",
        category: "Expense Reduction",
        content: "Cancel unused subscriptions and memberships. Review all recurring charges on your bank and credit card statements.",
        difficulty: "beginner",
        timeToImplement: "2 hours"
    },
    {
        id: 7,
        title: "Negotiate Your Bills",
        category: "Expense Reduction",
        content: "Call service providers to negotiate lower rates on phone, internet, insurance, and other recurring bills.",
        difficulty: "intermediate",
        timeToImplement: "3-4 hours"
    },
    {
        id: 8,
        title: "Start Investing Early",
        category: "Investment",
        content: "Begin investing as soon as possible to take advantage of compound interest. Consider low-cost index funds for beginners.",
        difficulty: "intermediate",
        timeToImplement: "1-2 weeks"
    },
    {
        id: 9,
        title: "Use the Envelope Method",
        category: "Budgeting",
        content: "Allocate cash for different spending categories in separate envelopes. When an envelope is empty, you're done spending in that category.",
        difficulty: "beginner",
        timeToImplement: "1 week"
    },
    {
        id: 10,
        title: "Build Multiple Income Streams",
        category: "Income",
        content: "Develop side hustles, freelance work, or passive income sources to reduce dependence on a single income source.",
        difficulty: "advanced",
        timeToImplement: "3-6 months"
    },
    {
        id: 11,
        title: "Plan for Major Purchases",
        category: "Planning",
        content: "Save separately for large expenses like car repairs, vacations, or home improvements instead of using credit cards.",
        difficulty: "intermediate",
        timeToImplement: "Ongoing"
    },
    {
        id: 12,
        title: "Review Your Credit Report",
        category: "Credit Management",
        content: "Check your credit report annually for errors and monitor your credit score. Dispute any inaccuracies you find.",
        difficulty: "beginner",
        timeToImplement: "1 hour"
    },
    {
        id: 13,
        title: "Set SMART Financial Goals",
        category: "Planning",
        content: "Create Specific, Measurable, Achievable, Relevant, and Time-bound financial goals like 'Save $5,000 for emergency fund by December 2025'.",
        difficulty: "beginner",
        timeToImplement: "2 hours"
    },
    {
        id: 14,
        title: "Understand Your Employee Benefits",
        category: "Benefits",
        content: "Maximize employer 401(k) matching, use HSA accounts, and understand your insurance coverage to get the most from your benefits.",
        difficulty: "intermediate",
        timeToImplement: "2-3 hours"
    },
    {
        id: 15,
        title: "Practice the 24-Hour Rule",
        category: "Spending Control",
        content: "Wait 24 hours before making non-essential purchases over $50. This helps prevent impulse buying and encourages thoughtful spending.",
        difficulty: "beginner",
        timeToImplement: "Immediate"
    },
    {
        id: 16,
        title: "Diversify Your Investments",
        category: "Investment",
        content: "Don't put all your money in one investment. Spread risk across different asset classes, sectors, and geographic regions.",
        difficulty: "advanced",
        timeToImplement: "1-3 months"
    },
    {
        id: 17,
        title: "Track Your Net Worth",
        category: "Monitoring",
        content: "Calculate your net worth (assets minus liabilities) monthly to monitor your overall financial progress and health.",
        difficulty: "intermediate",
        timeToImplement: "1 hour monthly"
    },
    {
        id: 18,
        title: "Learn About Tax Optimization",
        category: "Tax Strategy",
        content: "Understand tax deductions, credits, and tax-advantaged accounts like IRAs and 401(k)s to legally minimize your tax burden.",
        difficulty: "advanced",
        timeToImplement: "2-4 weeks"
    }
];

// Application state
let currentTipsDisplayed = 6;
let allTransactions = [];
let financialStats = {
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0
};

// Main application class
class FinanceFlowApp {
    constructor() {
        this.init();
    }

    // Initialize the application
    async init() {
        try {
            // Setup navigation
            navigation.setupMobileNav();
            navigation.setActiveLink('index.html');

            // Load financial data
            await this.loadFinancialData();
            
            // Load and display tips
            this.loadFinancialTips();
            
            // Update stats display
            this.updateStatsDisplay();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup modals
            this.setupModals();

            console.log('FinanceFlow app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            messages.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Load financial data from localStorage
    async loadFinancialData() {
        try {
            // Simulate API call with try/catch for async operations
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Get transactions from localStorage
            allTransactions = storage.get('financeflow_transactions') || [];
            
            // Calculate statistics
            this.calculateFinancialStats();
            
        } catch (error) {
            console.error('Error loading financial data:', error);
            throw error;
        }
    }

    // Calculate financial statistics using array methods
    calculateFinancialStats() {
        // Using array methods (filter, reduce, map)
        const incomeTransactions = allTransactions.filter(t => t.type === 'income');
        const expenseTransactions = allTransactions.filter(t => t.type === 'expense');
        
        financialStats.totalTransactions = allTransactions.length;
        financialStats.totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        financialStats.totalExpenses = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        financialStats.netBalance = financialStats.totalIncome - financialStats.totalExpenses;
    }

    // Load and display financial tips dynamically
    loadFinancialTips() {
        const tipsContainer = dom.get('tips-container');
        if (!tipsContainer) return;

        // Clear existing tips
        tipsContainer.innerHTML = '';

        // Get tips to display using array slice method
        const tipsToShow = FINANCIAL_TIPS.slice(0, currentTipsDisplayed);
        
        // Generate tip cards using forEach and template literals
        tipsToShow.forEach(tip => {
            const tipCard = this.createTipCard(tip);
            tipsContainer.appendChild(tipCard);
        });

        // Update load more button visibility
        const loadMoreBtn = dom.get('load-more-tips');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = currentTipsDisplayed >= FINANCIAL_TIPS.length ? 'none' : 'block';
        }
    }

    // Create individual tip card using template literals
    createTipCard(tip) {
        const card = dom.create('div', {
            class: 'tip-card',
            'data-tip-id': tip.id
        });

        // Using template literals for dynamic content generation
        card.innerHTML = `
            <h4>${tip.title}</h4>
            <p class="tip-category">${tip.category} • ${tip.difficulty}</p>
            <p>${tip.content.substring(0, 120)}${tip.content.length > 120 ? '...' : ''}</p>
            <div class="tip-meta">
                <span class="tip-time">⏱️ ${tip.timeToImplement}</span>
                <button class="btn btn-outline btn-small" onclick="window.financeApp.showTipDetails(${tip.id})">
                    Learn More
                </button>
            </div>
        `;

        return card;
    }

    // Show tip details in modal
    showTipDetails(tipId) {
        const tip = FINANCIAL_TIPS.find(t => t.id === tipId);
        if (!tip) return;

        const modalTitle = dom.get('modal-tip-title');
        const modalContent = dom.get('modal-tip-content');

        if (modalTitle && modalContent) {
            modalTitle.textContent = tip.title;
            // Using template literals for modal content
            modalContent.innerHTML = `
                <div class="tip-details">
                    <div class="tip-header">
                        <span class="tip-category-badge">${tip.category}</span>
                        <span class="tip-difficulty-badge">${tip.difficulty}</span>
                    </div>
                    <p class="tip-full-content">${tip.content}</p>
                    <div class="tip-implementation">
                        <strong>Time to implement:</strong> ${tip.timeToImplement}
                    </div>
                </div>
            `;
            
            modal.show('tip-modal');
        }
    }

    // Update statistics display
    updateStatsDisplay() {
        // Update main stats using template literals and currency formatting
        const updates = [
            { id: 'total-transactions', value: financialStats.totalTransactions },
            { id: 'total-income', value: currencyUtils.format(financialStats.totalIncome) },
            { id: 'total-expenses', value: currencyUtils.format(financialStats.totalExpenses) },
            { id: 'net-balance', value: currencyUtils.format(financialStats.netBalance) }
        ];

        updates.forEach(({ id, value }) => {
            const element = dom.get(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update balance color based on positive/negative
        const balanceElement = dom.get('net-balance');
        if (balanceElement) {
            balanceElement.style.color = financialStats.netBalance >= 0 
                ? 'var(--primary-green)' 
                : 'var(--accent-red)';
        }
    }

    // Load more tips functionality
    loadMoreTips() {
        currentTipsDisplayed += 6;
        this.loadFinancialTips();
    }

    // Setup event listeners
    setupEventListeners() {
        // Load more tips button
        const loadMoreBtn = dom.get('load-more-tips');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreTips());
        }

        // Help and privacy links
        const helpLink = dom.get('help-link');
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHelp();
            });
        }

        const privacyLink = dom.get('privacy-link');
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPrivacyInfo();
            });
        }

        // Video link
        const videoLink = dom.get('video-link');
        if (videoLink) {
            videoLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showVideoModal();
            });
        }
    }

    // Setup modal functionality
    setupModals() {
        modal.setupCloseHandlers('tip-modal');
        
        // Modal close button
        const modalCloseBtn = dom.get('modal-close-btn');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                modal.hide('tip-modal');
            });
        }
    }

    // Show help information
    showHelp() {
        const helpContent = `
            <h3>How to Use FinanceFlow</h3>
            <div class="help-content">
                <h4>Getting Started</h4>
                <p>1. Go to the <strong>Tracker</strong> page to add your income and expenses</p>
                <p>2. View your financial reports on the <strong>Reports</strong> page</p>
                <p>3. Read financial tips on this home page to improve your money management</p>
                
                <h4>Adding Transactions</h4>
                <p>• Use the Tracker page to log all your financial transactions</p>
                <p>• Choose between Income and Expense types</p>
                <p>• Select appropriate categories for better organization</p>
                
                <h4>Privacy & Data</h4>
                <p>All your data is stored locally on your device. No accounts required!</p>
            </div>
        `;
        
        this.showInfoModal('Help & Support', helpContent);
    }

    // Show privacy information
    showPrivacyInfo() {
        const privacyContent = `
            <h3>Privacy Policy</h3>
            <div class="privacy-content">
                <h4>Data Storage</h4>
                <p>FinanceFlow stores all your financial data locally on your device using browser localStorage. No data is sent to external servers.</p>
                
                <h4>No Account Required</h4>
                <p>You don't need to create an account or provide personal information to use FinanceFlow.</p>
                
                <h4>Data Control</h4>
                <p>You have complete control over your data. You can export, delete, or clear all data at any time.</p>
                
                <h4>Security</h4>
                <p>Since data never leaves your device, your financial information remains private and secure.</p>
            </div>
        `;
        
        this.showInfoModal('Privacy Policy', privacyContent);
    }

    // Show video demonstration modal
    showVideoModal() {
        const videoContent = `
            <h3>Project Video Demonstration</h3>
            <div class="video-content">
                <p>This video demonstrates the key features and JavaScript requirements of the FinanceFlow application:</p>
                <ul>
                    <li>Data fetching and API integration</li>
                    <li>Asynchronous functionality with try/catch blocks</li>
                    <li>Dynamic content generation</li>
                    <li>Local storage implementation</li>
                    <li>Modal dialogs and DOM manipulation</li>
                    <li>Array methods and ES modules</li>
                </ul>
                <p><strong>Video Link:</strong> <a href="#" target="_blank">https://youtu.be/example-video-link</a></p>
                <p class="note">Note: Replace with actual video URL when recording is complete.</p>
            </div>
        `;
        
        this.showInfoModal('Video Demonstration', videoContent);
    }

    // Generic info modal display
    showInfoModal(title, content) {
        const modalTitle = dom.get('modal-tip-title');
        const modalContent = dom.get('modal-tip-content');

        if (modalTitle && modalContent) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.show('tip-modal');
        }
    }

    // Public method to refresh data (called from other pages)
    async refreshData() {
        try {
            await this.loadFinancialData();
            this.updateStatsDisplay();
            messages.showSuccess('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            messages.showError('Failed to refresh data');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.financeApp = new FinanceFlowApp();
});

// Export for use in other modules
export default FinanceFlowApp;
