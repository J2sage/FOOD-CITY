const sidebar = document.getElementById('sidebar');
const toggle = document.querySelector('.sidebar-toggle');
const closeBtn = document.querySelector('.sidebar-close');
const overlay = document.querySelector('.sidebar-overlay');

const toggleSidebar = () => {
  sidebar?.classList.toggle('active');
  overlay?.classList.toggle('show');
  document.body.classList.toggle('sidebar-open');
};

toggle?.addEventListener('click', toggleSidebar);
closeBtn?.addEventListener('click', toggleSidebar);
overlay?.addEventListener('click', toggleSidebar);
