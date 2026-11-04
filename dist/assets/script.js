/* ============================================
   INKWELL BLOG — Client-Side JavaScript
   ============================================ */

// ============ THEME TOGGLE ============
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
  
  // Update theme color meta tag
  const meta = document.getElementById('theme-color-meta');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0c0a09' : '#ffffff');
  }
}

// Apply saved theme or system preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });
}

// ============ MOBILE MENU ============
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// ============ SCROLL REVEAL ANIMATION ============
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// ============ NAVBAR SHADOW ON SCROLL ============
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.add('shadow-sm');
  } else {
    navbar.classList.remove('shadow-sm');
  }
}

window.addEventListener('scroll', handleNavbarScroll);

// ============ BACK TO TOP BUTTON ============
const backToTopBtn = document.getElementById('back-to-top');

function handleBackToTop() {
  if (!backToTopBtn) return;
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

window.addEventListener('scroll', handleBackToTop);

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============ READING PROGRESS BAR ============
const readingProgress = document.getElementById('reading-progress');

function updateReadingProgress() {
  if (!readingProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  readingProgress.style.width = Math.min(progress, 100) + '%';
}

window.addEventListener('scroll', updateReadingProgress);

// ============ TABLE OF CONTENTS (for post pages) ============
function generateTOC() {
  const tocContainer = document.getElementById('post-toc');
  const article = document.querySelector('article');
  
  if (!tocContainer || !article) return;

  const headings = article.querySelectorAll('h2[id], h3[id]');
  
  if (headings.length === 0) return;

  let tocHTML = '';
  headings.forEach(heading => {
    const level = heading.tagName === 'H2' ? 'pl-4' : 'pl-8';
    const text = heading.textContent;
    const id = heading.id;
    tocHTML += `<a href="#${id}" class="toc-link block ${level} py-1 border-l-2 border-transparent text-stone-600 dark:text-stone-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">${text}</a>`;
  });

  tocContainer.innerHTML = tocHTML;

  // Add click handlers for smooth scroll
  tocContainer.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============ TOC ACTIVE STATE ON SCROLL ============
function initTOCObserver() {
  const tocLinks = document.querySelectorAll('.toc-link');
  if (tocLinks.length === 0) return;

  const headings = [];
  tocLinks.forEach(link => {
    const id = link.getAttribute('href').substring(1);
    const heading = document.getElementById(id);
    if (heading) headings.push(heading);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.toc-link[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, {
    rootMargin: '-20% 0px -80% 0px'
  });

  headings.forEach(heading => observer.observe(heading));
}

// ============ COPY CODE BUTTONS ============
function initCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.copy-code-btn')) return;
    
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    
    button.addEventListener('click', () => {
      const code = pre.querySelector('code');
      if (!code) return;
      
      navigator.clipboard.writeText(code.textContent).then(() => {
        button.textContent = 'Copied!';
        showToast('Code copied to clipboard');
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });
    
    pre.appendChild(button);
  });
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message) {
  let toast = document.getElementById('toast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('visible');
  
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// ============ INITIALIZE EVERYTHING ============
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  handleNavbarScroll();
  handleBackToTop();
  updateReadingProgress();
  generateTOC();
  initTOCObserver();
  initCopyButtons();
});