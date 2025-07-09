document.addEventListener('DOMContentLoaded', () => {
  const membersContainer = document.getElementById('members');
  const gridBtn = document.getElementById('grid-view');
  const listBtn = document.getElementById('list-view');
  const currentYearSpan = document.getElementById('currentYear');
  const lastModifiedSpan = document.getElementById('lastModified');

  // Footer dynamic dates
  currentYearSpan.textContent = new Date().getFullYear();
  lastModifiedSpan.textContent = document.lastModified;

  let membersData = [];
  let currentLayout = 'grid';

  async function getMembers() {
    try {
      const response = await fetch('data/members.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      membersData = data.members;
      renderMembers();
    } catch (error) {
      console.error('Fetching members failed:', error);
      membersContainer.innerHTML = '<p class="error">Unable to load member data.</p>';
    }
  }

  function renderMembers() {
    membersContainer.innerHTML = '';
    membersContainer.className = currentLayout; // either 'grid' or 'list'

    membersData.forEach(member => {
      const card = document.createElement('div');
      card.classList.add('member-card');

      const img = document.createElement('img');
      img.src = member.image;
      img.alt = `${member.name} logo`;
      img.loading = 'lazy';

      const name = document.createElement('h3');
      name.textContent = member.name;

      const address = document.createElement('p');
      address.textContent = member.address;

      const phone = document.createElement('p');
      phone.textContent = member.phone;

      const website = document.createElement('a');
      website.href = member.website;
      website.textContent = 'Visit Website';
      website.target = '_blank';
      website.rel = 'noopener';

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(address);
      card.appendChild(phone);
      card.appendChild(website);

      membersContainer.appendChild(card);
    });
  }

  // Toggle view handlers
  gridBtn.addEventListener('click', () => {
    currentLayout = 'grid';
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
    renderMembers();
  });

  listBtn.addEventListener('click', () => {
    currentLayout = 'list';
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
    renderMembers();
  });

  getMembers();
}); 