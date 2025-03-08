document.addEventListener('DOMContentLoaded', function() {
  
    const courses = [
      { id: 1, title: "WDD130 - Web Fundamentals", credits: 3, type: "WDD", completed: true },
      { id: 2, title: "WDD131 - Dynamic Web Fundamentals", credits: 3, type: "WDD", completed: true },
      { id: 3, title: "WDD231 - Web Frontend Development I", credits: 4, type: "WDD", completed: false },
      { id: 4, title: "CSE111 - Programming with Functions", credits: 3, type: "CSE", completed: true },
      { id: 5, title: "CSC341 - Web Services", credits: 3, type: "CSC", completed: false }
    ];
  
    let filteredCourses = courses;
    const courseCardsDiv = document.getElementById('course-cards');
    const creditsSpan = document.getElementById('credits');
  
    function renderCourses(coursesToRender) {
      courseCardsDiv.innerHTML = '';
      coursesToRender.forEach(course => {
        const card = document.createElement('div');
        card.classList.add('course-card');
        card.innerHTML = `
          <h3>${course.title}</h3>
          <p>Credits: ${course.credits}</p>
          <p>Status: ${course.completed ? 'Completed' : 'In Progress'}</p>
        `;
        if (course.completed) {
          card.classList.add('completed');
        }
        courseCardsDiv.appendChild(card);
      });
      // Calculate total credits for displayed courses
      const totalCredits = coursesToRender.reduce((sum, course) => sum + course.credits, 0);
      creditsSpan.textContent = totalCredits;
    }
  
    // Filter functionality
    document.getElementById('filter-all').addEventListener('click', function() {
      filteredCourses = courses;
      renderCourses(filteredCourses);
    });
  
    document.getElementById('filter-wdd').addEventListener('click', function() {
      filteredCourses = courses.filter(course => course.type === 'WDD');
      renderCourses(filteredCourses);
    });
  
    document.getElementById('filter-cse').addEventListener('click', function() {
      filteredCourses = courses.filter(course => course.type === 'CSE');
      renderCourses(filteredCourses);
    });
  
    // Initial render: show all courses
    renderCourses(filteredCourses);
  });
  