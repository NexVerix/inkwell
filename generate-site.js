const fs = require('fs');
const path = require('path');
const { site, authors, posts } = require('./site-data.js');

// Create dist folder
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');
const postsDir = path.join(distDir, 'posts');
const authorsDir = path.join(distDir, 'authors');

// Clean and create directories
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
// Added { recursive: true } to prevent EEXIST errors
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(postsDir, { recursive: true });
fs.mkdirSync(authorsDir, { recursive: true });

// Helper: Escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Helper: Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Helper: Get author by ID
function getAuthor(id) {
  return authors.find(a => a.id === id);
}

// Helper: Get author initials
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

// Helper: Get related posts
function getRelatedPosts(currentPost, limit = 3) {
  return posts
    .filter(p => p.id !== currentPost.id && p.category === currentPost.category)
    .slice(0, limit);
}

// Template: HTML Head
function htmlHead(page) {
  const title = page.seoTitle || page.title || site.name;
  const description = page.metaDescription || page.excerpt || site.description;
  const url = page.url || site.url;
  const image = page.image || site.defaultImage;
  const type = page.type || 'website';

  return `
<!DOCTYPE html>
<html lang="${site.language}" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="${site.themeColor}" />
  
  <title>${escapeHtml(title)} | ${site.name}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  ${page.keywords ? `<meta name="keywords" content="${escapeHtml(page.keywords)}" />` : ''}
  <meta name="author" content="${site.name}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
  
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:site_name" content="${site.name}" />
  <meta property="og:locale" content="en_US" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${url}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:site" content="${site.twitter}" />
  
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  <link rel="stylesheet" href="/assets/style.css" />
  
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet" />
  
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['"Playfair Display"', 'serif'],
          },
          colors: {
            brand: {
              50:  '#fff4ed', 100: '#ffe6d4', 200: '#ffc8a8', 300: '#ffa270',
              400: '#ff7338', 500: '#ff4f10', 600: '#f03606', 700: '#c62608',
              800: '#9d210f', 900: '#7e1f10',
            }
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-out',
            'slide-up': 'slideUp 0.6s ease-out',
            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
          keyframes: {
            fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
            slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
          }
        }
      }
    }
  </script>
  
  ${page.jsonLd ? `<script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>` : ''}
</head>
<body class="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-300">
  `;
}

// Template: Navbar (CLEAN URLS)
function navbar() {
  return `
  <nav id="navbar" class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/60 transition-all">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <a href="/" class="flex items-center gap-2 group">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">I</div>
          <span class="font-serif text-2xl font-bold">${site.name}</span>
        </a>

        <div class="hidden lg:flex items-center gap-8">
          <a href="/" class="nav-link text-sm font-medium">Home</a>
          <a href="/blog" class="nav-link text-sm font-medium">Blog</a>
          <a href="/authors" class="nav-link text-sm font-medium">Authors</a>
          <a href="/about" class="nav-link text-sm font-medium">About</a>
          <a href="/contact" class="nav-link text-sm font-medium">Contact</a>
        </div>

        <div class="flex items-center gap-3">
          <button id="theme-toggle" class="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" aria-label="Toggle theme">
            <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>
          <button id="mobile-menu-btn" class="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div id="mobile-menu" class="hidden lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
      <div class="px-6 py-4 space-y-3">
        <a href="/" class="block py-2 font-medium">Home</a>
        <a href="/blog" class="block py-2 font-medium">Blog</a>
        <a href="/authors" class="block py-2 font-medium">Authors</a>
        <a href="/about" class="block py-2 font-medium">About</a>
        <a href="/contact" class="block py-2 font-medium">Contact</a>
      </div>
    </div>
  </nav>
  `;
}

// Template: Footer (CLEAN URLS)
function footer() {
  const year = new Date().getFullYear();
  return `
  <footer class="bg-stone-900 dark:bg-black text-stone-300 mt-20">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div class="grid md:grid-cols-4 gap-10 mb-12">
        <div class="md:col-span-2">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">I</div>
            <span class="font-serif text-2xl font-bold text-white">${site.name}</span>
          </div>
          <p class="text-sm text-stone-400 max-w-sm mb-4">${site.description}</p>
          <div class="flex gap-3">
            <a href="https://x.com/nexverix_dev" class="w-9 h-9 rounded-full bg-stone-800 hover:bg-brand-600 flex items-center justify-center transition-colors font-bold">𝕏</a>
            <a href="https://www.linkedin.com/in/mdazizdev/" class="w-9 h-9 rounded-full bg-stone-800 hover:bg-brand-600 flex items-center justify-center transition-colors font-bold">in</a>
            <a href="https://nexverix-inkwell.vercel.app/" class="w-9 h-9 rounded-full bg-stone-800 hover:bg-brand-600 flex items-center justify-center transition-colors font-bold">I</a>
          </div>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Pages</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/" class="hover:text-brand-400">Home</a></li>
            <li><a href="/blog" class="hover:text-brand-400">Blog</a></li>
            <li><a href="/authors" class="hover:text-brand-400">Authors</a></li>
            <li><a href="/about" class="hover:text-brand-400">About</a></li>
            <li><a href="/contact" class="hover:text-brand-400">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/privacy" class="hover:text-brand-400">Privacy Policy</a></li>
            <li><a href="/terms" class="hover:text-brand-400">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-stone-500">
        <p>© 2026 NexVerix Studio. All rights reserved.</p>
        <p>Made by Nexverix Studio</p>
      </div>
    </div>
  </footer>
  <script src="/assets/script.js"></script>
</body>
</html>
  `;
}

// Template: Post Card
function postCard(post) {
  const author = getAuthor(post.authorId);
  const isTrending = post.views > 2000;
  
  return `
    <article class="card-hover group cursor-pointer bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col reveal">
      <a href="/posts/${post.slug}" class="aspect-[16/10] bg-gradient-to-br ${post.color} flex items-center justify-center text-6xl relative overflow-hidden">
        ${isTrending ? '<span class="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-stone-900/90 text-xs font-bold rounded-full text-brand-600 shadow-sm">🔥 Trending</span>' : ''}
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
        <span class="relative group-hover:scale-110 transition-transform duration-300">${post.emoji}</span>
      </a>
      <div class="p-6 flex flex-col flex-1">
        <div class="flex items-center gap-3 text-xs text-stone-500 mb-3">
          <span class="px-2 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold">${post.category}</span>
          <span>•</span>
          <span>${post.readTime} min read</span>
        </div>
        <a href="/posts/${post.slug}" class="font-serif text-xl font-bold mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight">${post.title}</a>
        <p class="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2 flex-1">${post.excerpt}</p>
        <div class="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 mt-auto">
          <a href="/authors/${author.id}" class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br ${author.color} flex items-center justify-center text-[10px] text-white font-bold">${getInitials(author.name)}</div>
            <span class="text-xs text-stone-500 font-medium hover:text-brand-600 transition-colors">${author.name}</span>
          </a>
          <span class="text-xs text-stone-500 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            ${post.views > 1000 ? (post.views/1000).toFixed(1) + 'k' : post.views}
          </span>
        </div>
      </div>
    </article>`;
}

// Template: Author Card
function authorCard(author) {
  const authorPosts = posts.filter(p => p.authorId === author.id);
  
  return `
    <div class="text-center group p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all reveal">
      <a href="/authors/${author.id}" class="relative mb-4 mx-auto w-24 h-24 overflow-hidden rounded-full cursor-pointer">
        <div class="aspect-square bg-gradient-to-br ${author.color} flex items-center justify-center text-3xl text-white font-serif font-bold shadow-lg group-hover:scale-110 transition-transform">
          ${getInitials(author.name)}
        </div>
      </a>
      <h3 class="font-bold text-lg mb-1">${author.name}</h3>
      <p class="text-sm text-brand-600 dark:text-brand-400 font-medium mb-3">${author.role}</p>
      <p class="text-sm text-stone-500 mb-6 line-clamp-3">${author.bio}</p>
      <a href="/authors/${author.id}" class="w-full py-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 dark:hover:border-brand-700 text-sm font-semibold transition-all inline-block">
        View their posts →
      </a>
    </div>
  `;
}

// Generate Home Page
function generateHomePage() {
  const featured = posts.filter(p => p.featured).slice(0, 3);
  
  const page = {
    title: site.name,
    seoTitle: `${site.name} — ${site.tagline}`,
    metaDescription: site.description,
    url: site.url,
    image: site.defaultImage,
    type: 'website',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": site.name,
      "url": site.url,
      "description": site.description,
      "publisher": {
        "@type": "Organization",
        "name": site.name
      }
    }
  };

  const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <section class="relative overflow-hidden hero-pattern">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="animate-slide-up">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">
            <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            New posts every week
          </span>
          <h1 class="font-serif text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Stories, ideas & <span class="gradient-text">insights</span> worth reading.
          </h1>
          <p class="text-lg text-stone-600 dark:text-stone-400 mb-8 max-w-xl">
            ${site.description}
          </p>
          <div class="flex flex-wrap gap-4">
            <a href="/blog" class="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-105">
              Read the blog →
            </a>
            <a href="/about" class="px-6 py-3 rounded-lg border-2 border-stone-300 dark:border-stone-700 hover:border-brand-500 dark:hover:border-brand-500 font-semibold transition-all">
              About us
            </a>
          </div>
          <div class="flex items-center gap-6 mt-10 text-sm text-stone-500 reveal">
            <div><span class="font-bold text-2xl text-stone-900 dark:text-white">${posts.length}+</span><br/>Articles</div>
            <div class="w-px h-10 bg-stone-300 dark:bg-stone-700"></div>
            <div><span class="font-bold text-2xl text-stone-900 dark:text-white">${authors.length}</span><br/>Writers</div>
          </div>
        </div>
        <div class="relative animate-fade-in hidden lg:block reveal">
          <div class="absolute -inset-4 bg-gradient-to-br from-brand-500/20 to-brand-700/20 rounded-3xl blur-3xl"></div>
          <div class="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl p-8 border border-stone-200 dark:border-stone-800">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-3 h-3 rounded-full bg-red-400"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div class="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div class="space-y-3">
              <div class="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4"></div>
              <div class="h-4 bg-stone-200 dark:bg-stone-800 rounded"></div>
              <div class="h-4 bg-stone-200 dark:bg-stone-800 rounded w-5/6"></div>
              <div class="h-24 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 rounded-lg mt-4"></div>
              <div class="h-4 bg-stone-200 dark:bg-stone-800 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-20">
    <div class="flex items-end justify-between mb-12 reveal">
      <div>
        <h2 class="font-serif text-4xl lg:text-5xl font-bold mb-3">Featured stories</h2>
        <p class="text-stone-600 dark:text-stone-400">Hand-picked articles from our editors.</p>
      </div>
      <a href="/blog" class="hidden sm:flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold hover:gap-3 transition-all">
        View all <span>→</span>
      </a>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${featured.map(postCard).join('')}
    </div>
  </div>

  <div class="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800 py-20">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <h2 class="font-serif text-4xl font-bold text-center mb-12 reveal">Explore by topic</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 reveal">
        ${[...new Set(posts.map(p => p.category))].map(cat => `
          <a href="/blog?category=${encodeURIComponent(cat)}" class="group p-6 rounded-xl bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800/40 hover:scale-105 transition-transform text-left">
            <div class="text-3xl mb-2">📚</div>
            <div class="font-bold">${cat}</div>
            <div class="text-sm text-stone-500">${posts.filter(p => p.category === cat).length} articles</div>
          </a>
        `).join('')}
      </div>
    </div>
  </div>
</main>
${footer()}
  `;

  fs.writeFileSync(path.join(distDir, 'index.html'), html);
  console.log('✓ Generated home page');
}

// Generate Blog Page (CLEAN URL FOLDER)
function generateBlogPage() {
  const page = {
    title: 'Blog',
    seoTitle: 'Blog — All Articles',
    metaDescription: 'Read all articles from Inkwell. Explore technology, design, lifestyle, business, and productivity topics.',
    url: `${site.url}/blog`,
    image: site.defaultImage,
    type: 'website'
  };

  const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
    <div class="text-center mb-12 reveal">
      <h1 class="font-serif text-5xl lg:text-6xl font-bold mb-4">The Blog</h1>
      <p class="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">All our articles, essays and guides in one place.</p>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${posts.map(postCard).join('')}
    </div>
  </div>
</main>
${footer()}
  `;

  fs.mkdirSync(path.join(distDir, 'blog'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'blog', 'index.html'), html);
  console.log('✓ Generated blog page');
}

// Generate Individual Post Pages
function generatePostPages() {
  posts.forEach(post => {
    const author = getAuthor(post.authorId);
    const related = getRelatedPosts(post);
    
    const page = {
      title: post.title,
      seoTitle: post.seoTitle,
      metaDescription: post.metaDescription,
      url: `${site.url}/posts/${post.slug}`,
      image: post.image,
      type: 'article',
      keywords: post.tags.join(', '),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.image,
        "datePublished": post.date,
        "dateModified": post.updated,
        "author": {
          "@type": "Person",
          "name": author.name
        },
        "publisher": {
          "@type": "Organization",
          "name": site.name,
          "logo": {
            "@type": "ImageObject",
            "url": `${site.url}/assets/logo.png`
          }
        },
        "description": post.metaDescription
      }
    };

    const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
    <div class="grid lg:grid-cols-12 gap-12">
      <aside class="hidden lg:block lg:col-span-3">
        <div class="sticky top-24">
          <h4 class="font-bold text-sm uppercase tracking-wider text-stone-500 mb-4">Contents</h4>
          <nav id="post-toc" class="space-y-2 text-sm border-l-2 border-stone-200 dark:border-stone-800">
          </nav>
        </div>
      </aside>
      
      <article class="lg:col-span-9 max-w-3xl">
        <a href="/blog" class="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-brand-600 mb-8 font-medium transition-colors">← Back to blog</a>
        <div class="mb-6 flex flex-wrap gap-2">
          <span class="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold">${post.category}</span>
          ${post.tags.map(tag => `<span class="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-semibold">#${tag}</span>`).join('')}
        </div>
        <h1 class="font-serif text-4xl lg:text-6xl font-bold mb-6 leading-tight text-stone-900 dark:text-white">${post.title}</h1>
        <div class="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-stone-200 dark:border-stone-800">
          <div class="flex items-center gap-4">
            <a href="/authors/${author.id}" class="w-12 h-12 rounded-full bg-gradient-to-br ${author.color} flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">${getInitials(author.name)}</a>
            <div>
              <a href="/authors/${author.id}" class="font-semibold hover:text-brand-600 transition-colors text-left">${author.name}</a>
              <div class="text-sm text-stone-500">${formatDate(post.date)} · ${post.readTime} min read · ${post.views.toLocaleString()} views</div>
            </div>
          </div>
        </div>
        <div class="aspect-[16/9] rounded-2xl bg-gradient-to-br ${post.color} flex items-center justify-center text-8xl mb-10 shadow-inner">${post.emoji}</div>
        <div class="prose prose-stone dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-img:rounded-xl">
          ${post.content}
        </div>

        <div class="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
          <h3 class="font-serif text-2xl font-bold mb-6 text-stone-900 dark:text-white">Keep reading</h3>
          <div class="grid sm:grid-cols-3 gap-6">
            ${related.map(postCard).join('')}
          </div>
        </div>
      </article>
    </div>
  </div>
</main>
${footer()}
    `;

    const postDir = path.join(postsDir, post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), html);
    console.log(`✓ Generated post: ${post.slug}`);
  });
}

// Generate Author Pages
function generateAuthorPages() {
  authors.forEach(author => {
    const authorPosts = posts.filter(p => p.authorId === author.id);
    
    const page = {
      title: author.name,
      seoTitle: `${author.name} — ${author.role}`,
      metaDescription: author.longBio,
      url: `${site.url}/authors/${author.id}`,
      image: site.defaultImage,
      type: 'profile',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": author.name,
        "jobTitle": author.role,
        "description": author.longBio,
        "worksFor": {
          "@type": "Organization",
          "name": site.name
        }
      }
    };

    const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
    <a href="/authors" class="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-brand-600 mb-8 font-medium transition-colors">← Back to authors</a>
    <div class="mb-12 p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 reveal">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br ${author.color} flex items-center justify-center text-4xl text-white font-serif font-bold shadow-lg flex-shrink-0">
          ${getInitials(author.name)}
        </div>
        <div class="flex-1">
          <h1 class="font-serif text-4xl font-bold mb-2">${author.name}</h1>
          <p class="text-brand-600 dark:text-brand-400 font-medium mb-4">${author.role}</p>
          <p class="text-stone-600 dark:text-stone-400 max-w-2xl">${author.longBio}</p>
          <div class="flex gap-4 mt-4 justify-center md:justify-start text-sm text-stone-500">
            <span><strong class="text-stone-900 dark:text-white">${authorPosts.length}</strong> articles</span>
            <span>•</span>
            <span><strong class="text-stone-900 dark:text-white">${authorPosts.reduce((acc, p) => acc + p.views, 0).toLocaleString()}</strong> total views</span>
          </div>
          ${author.expertise ? `
            <div class="flex flex-wrap gap-2 mt-4">
              ${author.expertise.map(exp => `<span class="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-medium">${exp}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
    <h2 class="font-serif text-3xl font-bold mb-8 reveal">Latest articles by ${author.name.split(' ')[0]}</h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${authorPosts.map(postCard).join('')}
    </div>
  </div>
</main>
${footer()}
    `;

    const authorDir = path.join(authorsDir, author.id);
    fs.mkdirSync(authorDir, { recursive: true });
    fs.writeFileSync(path.join(authorDir, 'index.html'), html);
    console.log(`✓ Generated author: ${author.id}`);
  });
}

// Generate Authors Listing Page (CLEAN URL FOLDER)
function generateAuthorsPage() {
  const page = {
    title: 'Authors',
    seoTitle: 'Meet Our Authors',
    metaDescription: `Meet the writers behind ${site.name}. ${authors.length} authors sharing insights on technology, design, and lifestyle.`,
    url: `${site.url}/authors`,
    image: site.defaultImage,
    type: 'website'
  };

  const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
    <div class="text-center mb-16 reveal">
      <span class="inline-block px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">Our Team</span>
      <h1 class="font-serif text-5xl lg:text-6xl font-bold mb-6">Meet the <span class="gradient-text">writers</span></h1>
      <p class="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">The diverse voices behind ${site.name}. Click on any author to read their latest articles.</p>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${authors.map(authorCard).join('')}
    </div>
  </div>
</main>
${footer()}
  `;

  fs.mkdirSync(path.join(distDir, 'authors'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'authors', 'index.html'), html);
  console.log('✓ Generated authors page');
}

// Generate About Page (CLEAN URL FOLDER)
function generateAboutPage() {
  const page = {
    title: 'About',
    seoTitle: 'About Us',
    metaDescription: `Learn about ${site.name}. ${site.description}`,
    url: `${site.url}/about`,
    image: site.defaultImage,
    type: 'website'
  };

  const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
    <div class="text-center mb-16 reveal">
      <span class="inline-block px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">About us</span>
      <h1 class="font-serif text-5xl lg:text-6xl font-bold mb-6">We write about what <span class="gradient-text">matters</span>.</h1>
      <p class="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">${site.description}</p>
    </div>

    <div class="grid md:grid-cols-3 gap-6 mb-20 reveal">
      <div class="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div class="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-2xl mb-4">✍️</div>
        <h3 class="font-bold text-xl mb-2">Quality first</h3>
        <p class="text-stone-600 dark:text-stone-400 text-sm">Every article is researched, written and edited by humans. No AI slop, no clickbait.</p>
      </div>
      <div class="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div class="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-2xl mb-4">🌍</div>
        <h3 class="font-bold text-xl mb-2">Global voices</h3>
        <p class="text-stone-600 dark:text-stone-400 text-sm">Our writers come from around the world, bringing diverse perspectives to every topic.</p>
      </div>
      <div class="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div class="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-2xl mb-4">🔓</div>
        <h3 class="font-bold text-xl mb-2">Always free</h3>
        <p class="text-stone-600 dark:text-stone-400 text-sm">No paywalls, no ads. We're funded by readers who love what we do.</p>
      </div>
    </div>

    <div class="rounded-3xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-800 p-10 lg:p-16 text-center reveal">
      <h2 class="font-serif text-3xl lg:text-4xl font-bold mb-4">Our mission</h2>
      <p class="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">To create a quieter corner of the internet — a place where ideas are explored with care, where readers feel respected, and where good writing still matters.</p>
    </div>
  </div>
</main>
${footer()}
  `;

  fs.mkdirSync(path.join(distDir, 'about'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'about', 'index.html'), html);
  console.log('✓ Generated about page');
}

// Generate Contact Page (CLEAN URL FOLDER)
function generateContactPage() {
  const page = {
    title: 'Contact',
    seoTitle: 'Contact Us',
    metaDescription: `Get in touch with ${site.name}. Have a question or story idea? We'd love to hear from you.`,
    url: `${site.url}/contact`,
    image: site.defaultImage,
    type: 'website'
  };

  const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
    <div class="text-center mb-12 reveal">
      <h1 class="font-serif text-5xl lg:text-6xl font-bold mb-4">Get in touch</h1>
      <p class="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">Have a question, a story idea, or just want to say hi? We'd love to hear from you.</p>
    </div>

    <div class="grid lg:grid-cols-5 gap-10 reveal">
      <div class="lg:col-span-2 space-y-6">
        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-3">📧</div>
          <h3 class="font-bold mb-1">Email</h3>
          <p class="text-sm text-stone-500">${site.email}</p>
        </div>
        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-3">📍</div>
          <h3 class="font-bold mb-1">Office</h3>
          <p class="text-sm text-stone-500">${site.location}</p>
        </div>
        <div class="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-3">🐦</div>
          <h3 class="font-bold mb-1">Social</h3>
          <div class="flex gap-3 mt-2">
            <a href="#" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors text-sm font-bold">𝕏</a>
            <a href="#" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors text-sm font-bold">in</a>
            <a href="#" class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors text-sm font-bold">ig</a>
          </div>
        </div>
      </div>

      <form class="lg:col-span-3 p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-5">
        <div class="grid sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input type="text" required class="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500"/>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <input type="email" required class="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500"/>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Subject</label>
          <select class="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>General inquiry</option>
            <option>Story pitch</option>
            <option>Partnership</option>
            <option>Press</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Message</label>
          <textarea rows="6" required class="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"></textarea>
        </div>
        <button type="submit" class="w-full px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]">
          Send message
        </button>
      </form>
    </div>
  </div>
</main>
${footer()}
  `;

  fs.mkdirSync(path.join(distDir, 'contact'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'contact', 'index.html'), html);
  console.log('✓ Generated contact page');
}

// Generate Privacy Policy Page (CLEAN URL FOLDER)
function generatePrivacyPage() {
  const page = {
    title: 'Privacy Policy',
    seoTitle: 'Privacy Policy',
    metaDescription: 'Privacy policy for Inkwell blog.',
    url: `${site.url}/privacy`,
    image: site.defaultImage,
    type: 'website'
  };

  const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
    <a href="/" class="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-brand-600 mb-8">← Back to home</a>
    <h1 class="font-serif text-4xl lg:text-5xl font-bold mb-8">Privacy Policy</h1>
    <p class="text-sm text-stone-500 mb-8">Last updated: November 2026</p>
    
    <div class="prose prose-stone dark:prose-invert max-w-none">
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you fill out our contact form or subscribe to our newsletter. This may include your name, email address, and message content.</p>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to respond to your inquiries, send you newsletters (if subscribed), and improve our website. We do not sell or share your personal information with third parties for marketing purposes.</p>
      
      <h2>3. Cookies</h2>
      <p>Our website may use cookies to enhance your experience. You can choose to disable cookies through your browser settings, though this may affect how the site functions.</p>
      
      <h2>4. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:${site.email}">${site.email}</a>.</p>
    </div>
  </div>
</main>
${footer()}
  `;

  fs.mkdirSync(path.join(distDir, 'privacy'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'privacy', 'index.html'), html);
  console.log('✓ Generated privacy page');
}

// Generate Terms & Conditions Page (CLEAN URL FOLDER)
function generateTermsPage() {
  const page = {
    title: 'Terms and Conditions',
    seoTitle: 'Terms and Conditions',
    metaDescription: 'Terms and conditions for using Inkwell blog.',
    url: `${site.url}/terms`,
    image: site.defaultImage,
    type: 'website'
  };

  const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
    <a href="/" class="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-brand-600 mb-8">← Back to home</a>
    <h1 class="font-serif text-4xl lg:text-5xl font-bold mb-8">Terms and Conditions</h1>
    <p class="text-sm text-stone-500 mb-8">Last updated: November 2026</p>
    
    <div class="prose prose-stone dark:prose-invert max-w-none">
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h2>2. Use License</h2>
      <p>Permission is granted to temporarily download one copy of the materials on Inkwell's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
      
      <h2>3. Disclaimer</h2>
      <p>The materials on Inkwell's website are provided on an 'as is' basis. Inkwell makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p>
      
      <h2>4. Governing Law</h2>
      <p>These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
    </div>
  </div>
</main>
${footer()}
  `;

  fs.mkdirSync(path.join(distDir, 'terms'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'terms', 'index.html'), html);
  console.log('✓ Generated terms page');
}

// Generate 404 Page (Kept as 404.html for Vercel standard)
function generate404Page() {
  const page = {
    title: 'Page Not Found',
    seoTitle: '404 - Page Not Found',
    metaDescription: 'The page you are looking for does not exist.',
    url: `${site.url}/404`,
    image: site.defaultImage,
    type: 'website'
  };

  const html = `
${htmlHead(page)}
${navbar()}
<main class="pt-16">
  <div class="max-w-3xl mx-auto px-6 lg:px-8 py-20 lg:py-32 text-center">
    <div class="text-9xl font-serif font-bold gradient-text mb-6">404</div>
    <h1 class="font-serif text-4xl lg:text-5xl font-bold mb-6">Page not found</h1>
    <p class="text-lg text-stone-600 dark:text-stone-400 mb-10 max-w-md mx-auto">The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/" class="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-600/30 transition-all">
        Go back home
      </a>
      <a href="/blog" class="px-6 py-3 rounded-lg border-2 border-stone-300 dark:border-stone-700 hover:border-brand-500 dark:hover:border-brand-500 font-semibold transition-all">
        Browse all articles
      </a>
    </div>
  </div>
</main>
${footer()}
  `;

  fs.writeFileSync(path.join(distDir, '404.html'), html);
  console.log('✓ Generated 404 page');
}

// Copy Assets
function copyAssets() {
  const srcAssetsDir = path.join(__dirname, 'assets');
  if (fs.existsSync(srcAssetsDir)) {
    fs.cpSync(srcAssetsDir, assetsDir, { recursive: true });
    console.log('✓ Copied assets');
  } else {
    console.log('⚠ Assets folder not found. Creating placeholder...');
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.writeFileSync(path.join(assetsDir, 'style.css'), '/* Add your CSS here */');
    fs.writeFileSync(path.join(assetsDir, 'script.js'), '/* Add your JavaScript here */');
  }
}

// Generate Sitemap
function generateSitemap() {
  const urls = [
    { loc: site.url, priority: '1.0', changefreq: 'daily' },
    { loc: `${site.url}/blog`, priority: '0.9', changefreq: 'daily' },
    { loc: `${site.url}/authors`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${site.url}/about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${site.url}/contact`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${site.url}/privacy`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${site.url}/terms`, priority: '0.5', changefreq: 'monthly' }
  ];

  posts.forEach(post => {
    urls.push({
      loc: `${site.url}/posts/${post.slug}`,
      priority: '0.8',
      changefreq: 'weekly'
    });
  });

  authors.forEach(author => {
    urls.push({
      loc: `${site.url}/authors/${author.id}`,
      priority: '0.7',
      changefreq: 'weekly'
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
  console.log('✓ Generated sitemap.xml');
}

// Generate Robots.txt
function generateRobots() {
  const robots = `User-agent: *
Allow: /
Sitemap: ${site.url}/sitemap.xml`;

  fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);
  console.log('✓ Generated robots.txt');
}

// Run all generators
console.log('\n🚀 Generating static website...\n');
generateHomePage();
generateBlogPage();
generatePostPages();
generateAuthorsPage();
generateAuthorPages();
generateAboutPage();
generateContactPage();
generatePrivacyPage();
generateTermsPage();
generate404Page();
copyAssets();
generateSitemap();
generateRobots();
console.log('\n Website generated successfully in /dist folder!\n');