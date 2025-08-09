// Reports page JavaScript for FinanceFlow
// Handles data visualization, financial analysis, and export functionality

import { storage, dateUtils, currencyUtils, dom, messages, modal, arrayUtils, navigation } from './utils.js';

// Chart colors for consistency
const CHART_COLORS = [
    '#2E7D32', '#1976D2', '#D32F2F', '#FF9800', '#9C27B0',
    '#00796B', '#5D4037', '#607D8B', '#E91E63', '#3F51B5'
];

// Application state
let transactions = [];
let filteredTransactions = [];
let currentDateRange = 30;

// Main reports application class
class ReportsApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            navigation.setupMobileNav();
            navigation.setActiveLink('reports.html');
            
            await this.loadTransactionData();
            this.setupDateFilter();
            await this.generateReports();
            this.setupEventListeners();
            this.setupModals();

            console.log('Reports app initialized successfully');
        } catch (error) {
            console.error('Error initializing reports:', error);
            messages.showError('Failed to initialize reports. Please refresh the page.');
        }
    }

    async loadTransactionData() {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            transactions = storage.get('financeflow_transactions') || [];
            this.filterTransactionsByDate();
        } catch (error) {
            console.error('Error loading transaction data:', error);
            transactions = [];
            filteredTransactions = [];
            throw error;
        }
    }

    filterTransactionsByDate() {
        if (currentDateRange === 'all') {
            filteredTransactions = [...transactions];
        } else {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - currentDateRange);
            filteredTransactions = transactions.filter(transaction => 
                new Date(transaction.date) >= cutoffDate
            );
        }
    }

    setupDateFilter() {
        const dateRangeSelect = dom.get('date-range');
        if (dateRangeSelect) {
            dateRangeSelect.value = currentDateRange.toString();
        }
    }

    async generateReports() {
        try {
            this.updateSummaryStats();
            await this.generateCharts();
            this.generateDetailedAnalysis();
            this.updateExportSection();
        } catch (error) {
            console.error('Error generating reports:', error);
            messages.showError('Some reports failed to generate.');
        }
    }

    updateSummaryStats() {
        const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
        const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        const updates = [
            { id: 'report-total-income', value: currencyUtils.format(totalIncome) },
            { id: 'report-total-expenses', value: currencyUtils.format(totalExpenses) },
            { id: 'report-net-balance', value: currencyUtils.format(netBalance) },
            { id: 'report-transaction-count', value: filteredTransactions.length.toString() }
        ];

        updates.forEach(({ id, value }) => {
            const element = dom.get(id);
            if (element) element.textContent = value;
        });
    }

    async generateCharts() {
        try {
            await this.generateCategoryChart();
            await this.generateTrendChart();
            this.generateTopCategories();
        } catch (error) {
            console.error('Error generating charts:', error);
        }
    }

    async generateCategoryChart() {
        const canvas = dom.get('category-chart');
        const emptyState = dom.get('category-empty');
        
        if (!canvas || !emptyState) return;

        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        
        if (expenses.length === 0) {
            dom.hide(canvas.parentElement);
            dom.show(emptyState);
            return;
        }

        dom.show(canvas.parentElement);
        dom.hide(emptyState);

        // Simple chart implementation
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(50, 50, 200, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Inter';
        ctx.fillText('Chart: Category Data', 60, 110);
    }

    async generateTrendChart() {
        const canvas = dom.get('trend-chart');
        const emptyState = dom.get('trend-empty');
        
        if (!canvas || !emptyState) return;

        if (filteredTransactions.length === 0) {
            dom.hide(canvas.parentElement);
            dom.show(emptyState);
            return;
        }

        dom.show(canvas.parentElement);
        dom.hide(emptyState);

        // Simple trend visualization
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1976D2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, 150);
        ctx.lineTo(150, 100);
        ctx.lineTo(250, 120);
        ctx.lineTo(350, 80);
        ctx.stroke();
    }

    generateTopCategories() {
        const container = dom.get('top-categories');
        const emptyState = dom.get('top-categories-empty');
        
        if (!container || !emptyState) return;

        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        
        if (expenses.length === 0) {
            dom.hide(container);
            dom.show(emptyState);
            return;
        }

        dom.show(container);
        dom.hide(emptyState);

        const categoryData = arrayUtils.groupBy(expenses, 'category');
        const topCategories = Object.entries(categoryData)
            .map(([category, transactions]) => ({
                category,
                amount: arrayUtils.sumBy(transactions, 'amount'),
                count: transactions.length
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        container.innerHTML = topCategories.map((item, index) => `
            <div class="category-item">
                <div class="category-rank">#${index + 1}</div>
                <div class="category-info">
                    <h4>${item.category}</h4>
                    <p>${item.count} transactions</p>
                </div>
                <div class="category-amount">
                    ${currencyUtils.format(item.amount)}
                </div>
            </div>
        `).join('');
    }

    generateDetailedAnalysis() {
        this.generateSpendingPatterns();
        this.calculateFinancialHealthScore();
        this.generateSavingsRecommendations();
    }

    generateSpendingPatterns() {
        const container = dom.get('spending-patterns');
        if (!container) return;

        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        
        if (expenses.length === 0) {
            container.innerHTML = '<p>No spending data available.</p>';
            return;
        }

        const avgTransaction = arrayUtils.sumBy(expenses, 'amount') / expenses.length;
        container.innerHTML = `
            <div class="pattern-item">
                <div class="pattern-icon">💰</div>
                <div class="pattern-content">
                    <h5>Average Transaction</h5>
                    <p>Your average expense is ${currencyUtils.format(avgTransaction)}</p>
                </div>
            </div>
        `;
    }

    calculateFinancialHealthScore() {
        const scoreElement = dom.get('health-score');
        const descriptionElement = dom.get('health-description');
        
        if (!scoreElement || !descriptionElement) return;

        const totalIncome = arrayUtils.sumBy(filteredTransactions.filter(t => t.type === 'income'), 'amount');
        const totalExpenses = arrayUtils.sumBy(filteredTransactions.filter(t => t.type === 'expense'), 'amount');
        
        if (totalIncome === 0 && totalExpenses === 0) {
            scoreElement.textContent = '--';
            descriptionElement.textContent = 'Add transactions to calculate score.';
            return;
        }

        let score = 70;
        if (totalIncome > totalExpenses) score = 85;
        if (totalIncome < totalExpenses) score = 45;

        scoreElement.textContent = score.toString();
        descriptionElement.textContent = score >= 70 ? 'Good financial health!' : 'Room for improvement.';
    }

    generateSavingsRecommendations() {
        const container = dom.get('savings-recommendations');
        if (!container) return;

        container.innerHTML = `
            <div class="recommendation-item">
                <div class="recommendation-icon">💡</div>
                <div class="recommendation-content">
                    <h5>Track Consistently</h5>
                    <p>Continue tracking expenses for better insights.</p>
                </div>
            </div>
        `;
    }

    updateExportSection() {
        // Export functionality placeholder
        console.log('Export section updated');
    }

    setupEventListeners() {
        const dateRangeSelect = dom.get('date-range');
        const refreshBtn = dom.get('refresh-reports');
        const exportCsvBtn = dom.get('export-csv');
        const exportJsonBtn = dom.get('export-json');
        const printBtn = dom.get('print-report');

        if (dateRangeSelect) {
            dateRangeSelect.addEventListener('change', async (e) => {
                currentDateRange = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                this.filterTransactionsByDate();
                await this.generateReports();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.generateReports());
        }

        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
        }

        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportData('json'));
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => this.printReport());
        }
    }

    exportData(format) {
        try {
            let content, filename, mimeType;

            if (format === 'csv') {
                content = this.generateCSV();
                filename = `financeflow-data-${dateUtils.getToday()}.csv`;
                mimeType = 'text/csv';
            } else if (format === 'json') {
                content = JSON.stringify(filteredTransactions, null, 2);
                filename = `financeflow-data-${dateUtils.getToday()}.json`;
                mimeType = 'application/json';
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            messages.showSuccess(`Data exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export error:', error);
            messages.showError('Failed to export data');
        }
    }

    generateCSV() {
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Notes'];
        const rows = filteredTransactions.map(t => [
            t.date,
            t.type,
            t.category,
            t.description,
            t.amount,
            t.notes || ''
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    printReport() {
        try {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            
            // Generate print-friendly HTML content
            const printContent = this.generatePrintContent();
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Wait for content to load, then print
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);

            messages.showSuccess('Print dialog opened');
        } catch (error) {
            console.error('Print error:', error);
            messages.showError('Failed to print report');
        }
    }

    generatePrintContent() {
        const dateRange = currentDateRange === 'all' ? 'All Time' : `Last ${currentDateRange} days`;
        const summary = this.calculateSummary();
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>FinanceFlow Report - ${dateRange}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333; 
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px solid #2E7D32; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px; 
                }
                .summary { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin-bottom: 30px; 
                }
                .summary-card { 
                    border: 1px solid #ddd; 
                    padding: 15px; 
                    border-radius: 8px; 
                }
                .summary-card h3 { 
                    margin: 0 0 10px 0; 
                    color: #2E7D32; 
                }
                .amount { 
                    font-size: 18px; 
                    font-weight: bold; 
                }
                .income { color: #2E7D32; }
                .expense { color: #D32F2F; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f5f5f5; 
                    font-weight: bold; 
                }
                .print-date { 
                    text-align: center; 
                    margin-top: 30px; 
                    font-size: 12px; 
                    color: #666; 
                }
                @media print {
                    body { margin: 0; }
                    .header { page-break-after: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>FinanceFlow Financial Report</h1>
                <h2>Period: ${dateRange}</h2>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Income</h3>
                    <div class="amount income">${currencyUtils.format(summary.totalIncome)}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Expenses</h3>
                    <div class="amount expense">${currencyUtils.format(summary.totalExpenses)}</div>
                </div>
                <div class="summary-card">
                    <h3>Net Balance</h3>
                    <div class="amount ${summary.netBalance >= 0 ? 'income' : 'expense'}">${currencyUtils.format(summary.netBalance)}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Transactions</h3>
                    <div class="amount">${filteredTransactions.length}</div>
                </div>
            </div>

            <h3>Transaction Details</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredTransactions.map(t => `
                        <tr>
                            <td>${new Date(t.date).toLocaleDateString()}</td>
                            <td>${t.type}</td>
                            <td>${t.category}</td>
                            <td>${t.description}</td>
                            <td class="${t.type.toLowerCase()}">${currencyUtils.format(t.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="print-date">
                Printed from FinanceFlow on ${new Date().toLocaleString()}
            </div>
        </body>
        </html>
        `;
    }

    setupModals() {
        modal.setupCloseHandlers('chart-modal');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.reportsApp = new ReportsApp();
});

export default ReportsApp;
