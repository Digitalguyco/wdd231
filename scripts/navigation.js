document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navList = document.querySelector('nav ul');
  
    navToggle.addEventListener('click', function() {
      navList.classList.toggle('active');
    });
  });
  