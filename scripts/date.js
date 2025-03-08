document.addEventListener('DOMContentLoaded', function() {
    // Set the current year dynamically
    const yearSpan = document.getElementById('currentyear');
    const currentYear = new Date().getFullYear();
    if (yearSpan) {
      yearSpan.textContent = currentYear;
    }
    
    // Display the last modified date
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
      lastModifiedElement.textContent = "Last Modified: " + document.lastModified;
    }
  });
  