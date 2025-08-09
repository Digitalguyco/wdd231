// Tracker page JavaScript for FinanceFlow
// Handles transaction management, form submission, and localStorage operations

import { storage, dateUtils, currencyUtils, dom, messages, modal, arrayUtils, validation, navigation } from './utils.js';

// Transaction categories
const EXPENSE_CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Personal Care',
    'Home & Garden',
    'Insurance',
    'Taxes',
    'Other'
];

const INCOME_CATEGORIES = [
    'Salary',
    'Business Income',
    'Investment Returns',
    'Rental Income',
    'Freelance Work',
    'Side Hustle',
    'Gifts',
    'Tax Refund',
    'Bonus',
    'Other Income'
];

// Application state
let transactions = [];
let filteredTransactions = [];
let currentEditingTransaction = null;
let displayedTransactions = 10;

// Main tracker application class
class TrackerApp {
    constructor() {
        this.init();
    }

    // Initialize the application
    async init() {
        try {
            // Setup navigation
            navigation.setupMobileNav();
            navigation.setActiveLink('tracker.html');

            // Load existing transactions
            await this.loadTransactions();
            
            // Setup form and categories
            this.setupForm();
            this.populateCategories();
            
            // Display transactions
            this.displayTransactions();
            
            // Update summary
            this.updateSummary();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup modals
            this.setupModals();

            console.log('Tracker app initialized successfully');
        } catch (error) {
            console.error('Error initializing tracker:', error);
            messages.showError('Failed to initialize tracker. Please refresh the page.');
        }
    }

    // Load transactions from localStorage with error handling
    async loadTransactions() {
        try {
            // Simulate async operation with try/catch
            await new Promise(resolve => setTimeout(resolve, 50));
            
            transactions = storage.get('financeflow_transactions') || [];
            filteredTransactions = [...transactions];
            
            console.log(`Loaded ${transactions.length} transactions`);
        } catch (error) {
            console.error('Error loading transactions:', error);
            transactions = [];
            filteredTransactions = [];
            throw error;
        }
    }

    // Setup form with current date
    setupForm() {
        const dateInput = dom.get('transaction-date');
        if (dateInput) {
            dateInput.value = dateUtils.getToday();
        }
    }

    // Populate category dropdown based on transaction type
    populateCategories() {
        const typeSelect = dom.get('transaction-type');
        const categorySelect = dom.get('transaction-category');
        
        if (!typeSelect || !categorySelect) return;

        // Initial population
        this.updateCategories();

        // Update categories when type changes
        typeSelect.addEventListener('change', () => {
            this.updateCategories();
        });
    }

    // Update category options using array methods
    updateCategories() {
        const typeSelect = dom.get('transaction-type');
        const categorySelect = dom.get('transaction-category');
        
        if (!typeSelect || !categorySelect) return;

        const selectedType = typeSelect.value;
        const categories = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        
        // Clear existing options except the first one
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        // Add categories using forEach array method
        categories.forEach(category => {
            const option = dom.create('option', { value: category }, category);
            categorySelect.appendChild(option);
        });
    }

    // Display transactions using dynamic content generation
    displayTransactions() {
        const listContainer = dom.get('transactions-list');
        const emptyState = dom.get('empty-state');
        
        if (!listContainer) return;

        // Clear existing content
        listContainer.innerHTML = '';

        if (filteredTransactions.length === 0) {
            dom.hide(listContainer.parentElement);
            dom.show(emptyState);
            return;
        }

        dom.show(listContainer.parentElement);
        dom.hide(emptyState);

        // Sort transactions by date (newest first) using array methods
        const sortedTransactions = arrayUtils.sortBy(filteredTransactions, 'date', 'desc');
        
        // Display limited number of transactions using slice
        const transactionsToShow = sortedTransactions.slice(0, displayedTransactions);
        
        // Generate transaction items using forEach and template literals
        transactionsToShow.forEach(transaction => {
            const transactionElement = this.createTransactionElement(transaction);
            listContainer.appendChild(transactionElement);
        });

        // Update pagination controls
        this.updatePaginationControls();
    }

    // Create individual transaction element using template literals
    createTransactionElement(transaction) {
        const item = dom.create('div', {
            class: 'transaction-item',
            'data-transaction-id': transaction.id
        });

        const formattedAmount = currencyUtils.format(transaction.amount);
        const formattedDate = dateUtils.formatDate(transaction.date);
        const typeIcon = transaction.type === 'income' ? '+' : '-';

        // Using template literals for dynamic content
        item.innerHTML = `
            <div class="transaction-type ${transaction.type}">
                ${typeIcon}
            </div>
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <p>${transaction.category}</p>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${formattedAmount}
            </div>
            <div class="transaction-date">
                ${formattedDate}
            </div>
        `;

        // Add click handler for transaction details
        item.addEventListener('click', () => {
            this.showTransactionDetails(transaction.id);
        });

        return item;
    }

    // Show transaction details in modal
    showTransactionDetails(transactionId) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const detailsContainer = dom.get('transaction-details');
        const modalTitle = dom.get('modal-transaction-title');
        
        if (!detailsContainer || !modalTitle) return;

        modalTitle.textContent = 'Transaction Details';
        
        // Using template literals for modal content
        detailsContainer.innerHTML = `
            <div class="transaction-detail-content">
                <div class="detail-row">
                    <strong>Type:</strong> 
                    <span class="transaction-type-text ${transaction.type}">
                        ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                </div>
                <div class="detail-row">
                    <strong>Amount:</strong> 
                    <span class="amount ${transaction.type}">
                        ${currencyUtils.format(transaction.amount)}
                    </span>
                </div>
                <div class="detail-row">
                    <strong>Category:</strong> ${transaction.category}
                </div>
                <div class="detail-row">
                    <strong>Description:</strong> ${transaction.description}
                </div>
                <div class="detail-row">
                    <strong>Date:</strong> ${dateUtils.formatDate(transaction.date)}
                </div>
                ${transaction.notes ? `
                    <div class="detail-row">
                        <strong>Notes:</strong> ${transaction.notes}
                    </div>
                ` : ''}
            </div>
        `;

        // Set current editing transaction for modal actions
        currentEditingTransaction = transaction;
        
        modal.show('transaction-modal');
    }

    // Add new transaction with validation
    async addTransaction(formData) {
        try {
            // Validate form data
            const validationRules = {
                type: { required: true },
                amount: { required: true, min: 0.01 },
                category: { required: true },
                description: { required: true },
                date: { required: true }
            };

            const validation = this.validateTransactionForm(formData, validationRules);
            
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join('\n');
                messages.showError(`Please fix the following errors:\n${errorMessages}`);
                return false;
            }

            // Create new transaction with unique ID
            const newTransaction = {
                id: this.generateTransactionId(),
                type: formData.type,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description.trim(),
                date: formData.date,
                notes: formData.notes ? formData.notes.trim() : '',
                createdAt: new Date().toISOString()
            };

            // Add to transactions array
            transactions.unshift(newTransaction); // Add to beginning
            
            // Save to localStorage using try/catch
            const saveSuccess = storage.set('financeflow_transactions', transactions);
            
            if (!saveSuccess) {
                throw new Error('Failed to save transaction to localStorage');
            }

            // Update displays
            await this.refreshDisplay();
            
            messages.showSuccess('Transaction added successfully!');
            return true;

        } catch (error) {
            console.error('Error adding transaction:', error);
            messages.showError('Failed to add transaction. Please try again.');
            return false;
        }
    }

    // Generate unique transaction ID
    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Validate transaction form
    validateTransactionForm(formData, rules) {
        const errors = {};

        // Check required fields
        if (!formData.type) errors.type = 'Transaction type is required';
        if (!formData.amount) {
            errors.amount = 'Amount is required';
        } else if (!currencyUtils.isValid(formData.amount)) {
            errors.amount = 'Amount must be a valid positive number';
        }
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.description || formData.description.trim() === '') {
            errors.description = 'Description is required';
        }
        if (!formData.date) errors.date = 'Date is required';

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Update summary using array methods
    updateSummary() {
        // Calculate totals using filter and reduce array methods
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        // Update display elements
        const updates = [
            { id: 'summary-income', value: currencyUtils.format(totalIncome) },
            { id: 'summary-expenses', value: currencyUtils.format(totalExpenses) },
            { id: 'summary-balance', value: currencyUtils.format(netBalance) }
        ];

        updates.forEach(({ id, value }) => {
            const element = dom.get(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update balance color
        const balanceElement = dom.get('summary-balance');
        if (balanceElement) {
            balanceElement.style.color = netBalance >= 0 
                ? 'var(--primary-green)' 
                : 'var(--accent-red)';
        }
    }

    // Filter transactions
    filterTransactions() {
        const typeFilter = dom.get('filter-type');
        const categoryFilter = dom.get('filter-category');
        
        if (!typeFilter || !categoryFilter) return;

        const filters = {
            type: typeFilter.value,
            category: categoryFilter.value
        };

        // Use arrayUtils.filterBy method
        filteredTransactions = arrayUtils.filterBy(transactions, filters);
        
        // Reset pagination
        displayedTransactions = 10;
        
        // Update display
        this.displayTransactions();
    }

    // Clear all filters
    clearFilters() {
        const typeFilter = dom.get('filter-type');
        const categoryFilter = dom.get('filter-category');
        
        if (typeFilter) typeFilter.value = 'all';
        if (categoryFilter) categoryFilter.value = 'all';
        
        filteredTransactions = [...transactions];
        displayedTransactions = 10;
        
        this.displayTransactions();
    }

    // Load more transactions
    loadMoreTransactions() {
        displayedTransactions += 10;
        this.displayTransactions();
    }

    // Update pagination controls
    updatePaginationControls() {
        const paginationControls = dom.get('pagination-controls');
        const loadMoreBtn = dom.get('load-more');
        
        if (!paginationControls || !loadMoreBtn) return;

        const hasMoreTransactions = filteredTransactions.length > displayedTransactions;
        
        if (hasMoreTransactions) {
            dom.show(paginationControls);
            loadMoreBtn.textContent = `Load More (${filteredTransactions.length - displayedTransactions} remaining)`;
        } else {
            dom.hide(paginationControls);
        }
    }

    // Populate category filter
    populateCategoryFilter() {
        const categoryFilter = dom.get('filter-category');
        if (!categoryFilter) return;

        // Get unique categories from transactions using array methods
        const allCategories = [...new Set(transactions.map(t => t.category))];
        
        // Clear existing options except "All Categories"
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        
        // Add categories
        allCategories.forEach(category => {
            const option = dom.create('option', { value: category }, category);
            categoryFilter.appendChild(option);
        });
    }

    // Delete transaction
    async deleteTransaction(transactionId) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            // Remove from array using filter
            transactions = transactions.filter(t => t.id !== transactionId);
            
            // Save to localStorage
            const saveSuccess = storage.set('financeflow_transactions', transactions);
            
            if (!saveSuccess) {
                throw new Error('Failed to save changes to localStorage');
            }

            await this.refreshDisplay();
            modal.hide('transaction-modal');
            
            messages.showSuccess('Transaction deleted successfully!');

        } catch (error) {
            console.error('Error deleting transaction:', error);
            messages.showError('Failed to delete transaction. Please try again.');
        }
    }

    // Refresh entire display
    async refreshDisplay() {
        try {
            filteredTransactions = [...transactions];
            this.displayTransactions();
            this.updateSummary();
            this.populateCategoryFilter();
        } catch (error) {
            console.error('Error refreshing display:', error);
            throw error;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Form submission
        const form = dom.get('transaction-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                const success = await this.addTransaction(data);
                if (success) {
                    form.reset();
                    this.setupForm(); // Reset date to today
                }
            });
        }

        // Clear form button
        const clearBtn = dom.get('clear-form');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const form = dom.get('transaction-form');
                if (form) {
                    form.reset();
                    this.setupForm();
                }
            });
        }

        // Filter controls
        const typeFilter = dom.get('filter-type');
        const categoryFilter = dom.get('filter-category');
        const clearFiltersBtn = dom.get('clear-filters');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterTransactions());
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterTransactions());
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Load more button
        const loadMoreBtn = dom.get('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreTransactions());
        }

        // Modal action buttons
        const editBtn = dom.get('edit-transaction-btn');
        const deleteBtn = dom.get('delete-transaction-btn');
        const closeBtn = dom.get('close-modal-btn');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (currentEditingTransaction) {
                    this.editTransaction(currentEditingTransaction.id);
                }
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (currentEditingTransaction) {
                    this.deleteTransaction(currentEditingTransaction.id);
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.hide('transaction-modal');
            });
        }
    }

    // Setup modals
    setupModals() {
        modal.setupCloseHandlers('transaction-modal');
    }

    // Edit transaction (populate form with existing data)
    editTransaction(transactionId) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        // Populate form fields
        const fields = [
            { id: 'transaction-type', value: transaction.type },
            { id: 'transaction-amount', value: transaction.amount },
            { id: 'transaction-category', value: transaction.category },
            { id: 'transaction-description', value: transaction.description },
            { id: 'transaction-date', value: transaction.date },
            { id: 'transaction-notes', value: transaction.notes || '' }
        ];

        fields.forEach(({ id, value }) => {
            const element = dom.get(id);
            if (element) {
                element.value = value;
            }
        });

        // Update categories based on type
        this.updateCategories();
        
        // Set category after updating options
        setTimeout(() => {
            const categoryElement = dom.get('transaction-category');
            if (categoryElement) {
                categoryElement.value = transaction.category;
            }
        }, 100);

        // Delete the transaction (we'll add it as new)
        this.deleteTransaction(transactionId);
        
        // Hide modal and scroll to form
        modal.hide('transaction-modal');
        document.querySelector('.transaction-form-section').scrollIntoView({ behavior: 'smooth' });
        
        messages.showSuccess('Transaction loaded for editing. Make your changes and submit.');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.trackerApp = new TrackerApp();
});

// Export for use in other modules
export default TrackerApp;
