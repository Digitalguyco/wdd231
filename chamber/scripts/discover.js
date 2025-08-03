// Discover Page JavaScript
// Handles last visit tracking and dynamic content generation

// Last Visit Tracking using localStorage
function handleVisitMessage() {
    const visitMessageElement = document.getElementById('visit-message');
    const lastVisit = localStorage.getItem('chamberLastVisit');
    const currentTime = Date.now();
    
    if (!lastVisit) {
        // First visit
        visitMessageElement.textContent = "Welcome! Let us know if you have any questions.";
    } else {
        const lastVisitTime = parseInt(lastVisit);
        const timeDifference = currentTime - lastVisitTime;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        
        if (daysDifference < 1) {
            // Less than a day
            visitMessageElement.textContent = "Back so soon! Awesome!";
        } else if (daysDifference === 1) {
            // Exactly 1 day
            visitMessageElement.textContent = "You last visited 1 day ago.";
        } else {
            // More than 1 day
            visitMessageElement.textContent = `You last visited ${daysDifference} days ago.`;
        }
    }
    
    // Store current visit time
    localStorage.setItem('chamberLastVisit', currentTime.toString());
}

// Fetch and Display Discover Items
async function loadDiscoverItems() {
    try {
        const response = await fetch('data/discover.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayDiscoverItems(data.attractions);
    } catch (error) {
        console.error('Error loading discover items:', error);
        displayErrorMessage();
    }
}

// Display Discover Items in Grid
function displayDiscoverItems(attractions) {
    const gridContainer = document.getElementById('discover-grid');
    gridContainer.innerHTML = ''; // Clear existing content
    
    attractions.forEach(attraction => {
        const card = createDiscoverCard(attraction);
        gridContainer.appendChild(card);
    });
}

// Create Individual Discover Card
function createDiscoverCard(attraction) {
    const card = document.createElement('div');
    card.className = 'discover-card';
    
    card.innerHTML = `
        <h2>${attraction.name}</h2>
        <figure class="card-image">
            <img src="${attraction.image}" alt="${attraction.name}" loading="lazy">
        </figure>
        <address>${attraction.address}</address>
        <p>${attraction.description}</p>
        <button class="learn-more-btn" data-id="${attraction.id}">Learn More</button>
    `;
    
    return card;
}

// Handle Learn More Button Clicks
function handleLearnMoreClick(event) {
    if (event.target.classList.contains('learn-more-btn')) {
        const attractionId = event.target.getAttribute('data-id');
        // For now, just log the action - could expand to show modal or navigate
        console.log(`Learn more clicked for attraction ID: ${attractionId}`);
        alert(`More information about this attraction would be displayed here. (Attraction ID: ${attractionId})`);
    }
}

// Display Error Message
function displayErrorMessage() {
    const gridContainer = document.getElementById('discover-grid');
    gridContainer.innerHTML = `
        <div class="error-message">
            <p>Sorry, we're having trouble loading the discover content. Please try again later.</p>
        </div>
    `;
}

// Lazy Loading for Images (enhanced performance)
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Initialize Discover Page
function initDiscoverPage() {
    handleVisitMessage();
    loadDiscoverItems();
    
    // Add event listener for learn more buttons
    document.addEventListener('click', handleLearnMoreClick);
    
    // Setup lazy loading after content loads
    setTimeout(setupLazyLoading, 1000);
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', initDiscoverPage);

// Date formatting utility (for potential future use)
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Calculate days between dates utility
function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}
