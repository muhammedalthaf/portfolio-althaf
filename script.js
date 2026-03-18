/* ============================================
   Preloader
   ============================================ */
(function initPreloader() {
  window.addEventListener('load', function () {
    var preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(function () {
        preloader.classList.add('fade-out');
        setTimeout(function () {
          preloader.style.display = 'none';
        }, 500);
      }, 600);
    }
  });
})();

/* ============================================
   Particle Canvas Background (Enhanced)
   ============================================ */
(function initParticles() {
  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouse = { x: null, y: null };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  canvas.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
  });

  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.15;
    this.color = Math.random() > 0.5 ? '0, 212, 255' : '124, 58, 237';
  }

  Particle.prototype.update = function () {
    this.x += this.speedX;
    this.y += this.speedY;

    // Mouse repulsion
    if (mouse.x !== null && mouse.y !== null) {
      var dx = this.x - mouse.x;
      var dy = this.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        var force = (100 - dist) / 100;
        this.x += (dx / dist) * force * 1.5;
        this.y += (dy / dist) * force * 1.5;
      }
    }

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  };

  Particle.prototype.draw = function () {
    ctx.fillStyle = 'rgba(' + this.color + ', ' + this.opacity + ')';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  };

  function createParticles() {
    var count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 180);
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  createParticles();
  window.addEventListener('resize', createParticles);

  function connectParticles() {
    var maxDist = 130;
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          var opacity = (1 - dist / maxDist) * 0.15;
          ctx.strokeStyle = 'rgba(0, 212, 255, ' + opacity + ')';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }

      // Connect to mouse
      if (mouse.x !== null && mouse.y !== null) {
        var mdx = particles[a].x - mouse.x;
        var mdy = particles[a].y - mouse.y;
        var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 180) {
          var mopacity = (1 - mdist / 180) * 0.35;
          ctx.strokeStyle = 'rgba(124, 58, 237, ' + mopacity + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();
})();

/* ============================================
   Typewriter Effect
   ============================================ */
(function initTypewriter() {
  var element = document.getElementById('typewriter');
  if (!element) return;

  var roles = [
    'Full Stack Developer',
    'AI Engineer',
    'System Architect',
    'Mobile Developer'
  ];

  var roleIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typeSpeed = 80;

  function type() {
    var current = roles[roleIndex];

    if (isDeleting) {
      element.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      element.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80;
    }

    if (!isDeleting && charIndex === current.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
  }

  type();
})();

/* ============================================
   Intersection Observer — Scroll Animations with Stagger
   ============================================ */
(function initScrollAnimations() {
  var elements = document.querySelectorAll('.animate-on-scroll');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () {
          el.classList.add('in-view');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ============================================
   Circular Progress Rings Animation
   ============================================ */
(function initSkillRings() {
  var circumference = 2 * Math.PI * 34; // r=34

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var rings = entry.target.querySelectorAll('.skill-ring-progress');
        rings.forEach(function (ring, index) {
          var percent = parseInt(ring.getAttribute('data-percent') || '0', 10);
          var offset = circumference - (percent / 100) * circumference;

          // Set the label
          var item = ring.closest('.skill-ring-item');
          if (item) {
            item.setAttribute('data-label', percent + '%');
          }

          setTimeout(function () {
            ring.style.strokeDashoffset = offset;
            ring.classList.add('animated');
          }, index * 80);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skill-ring-card').forEach(function (card) {
    observer.observe(card);
  });
})();

/* ============================================
   Navbar Scroll Effect & Active Link
   ============================================ */
(function initNavbar() {
  var navbar = document.getElementById('navbar');
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('section[id]');

  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    var current = '';
    sections.forEach(function (section) {
      var sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================
   Smooth Scroll for Nav Links
   ============================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });

        // Close mobile menu if open
        var navLinks = document.getElementById('navLinks');
        var hamburger = document.getElementById('hamburger');
        if (navLinks && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          hamburger.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  });
})();

/* ============================================
   Mobile Menu Toggle
   ============================================ */
(function initMobileMenu() {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    if (navLinks.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
})();

/* ============================================
   Count-Up Animation for Stats
   ============================================ */
(function initCountUp() {
  var statNumbers = document.querySelectorAll('.stat-number');
  var animated = false;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(function (el) {
          var target = parseInt(el.getAttribute('data-target'), 10);
          var duration = 2000;
          var step = target / (duration / 16);
          var current = 0;

          function updateCount() {
            current += step;
            if (current < target) {
              el.textContent = Math.floor(current);
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = target;
            }
          }

          updateCount();
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  var statsParent = document.querySelector('.stat-number');
  if (statsParent) {
    var statsSection = statsParent.closest('section') || statsParent.parentElement;
    observer.observe(statsSection);
  }
})();

/* ============================================
   Back to Top Button
   ============================================ */
(function initBackToTop() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================
   Contact Form Handler
   ============================================ */
(function initContactForm() {
  var form = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.style.display = 'none';
    success.classList.remove('hidden');
    success.style.display = 'block';
  });
})();

/* ============================================
   Custom Cursor Glow
   ============================================ */
(function initCursorGlow() {
  var cursor = document.getElementById('cursorGlow');
  if (!cursor) return;

  var posX = 0, posY = 0;
  var mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', function () {
    cursor.classList.remove('visible');
  });

  function updateCursor() {
    posX += (mouseX - posX) * 0.1;
    posY += (mouseY - posY) * 0.1;
    cursor.style.left = posX + 'px';
    cursor.style.top = posY + 'px';
    requestAnimationFrame(updateCursor);
  }

  updateCursor();
})();

/* ============================================
   Tool Cards - Brand Color Hover Glow
   ============================================ */
(function initToolCards() {
  var toolCards = document.querySelectorAll('.tool-card');

  toolCards.forEach(function (card) {
    var brandColor = card.getAttribute('data-brand-color');
    if (!brandColor) return;

    card.addEventListener('mouseenter', function () {
      card.style.borderColor = brandColor + '55';
      card.style.boxShadow = '0 0 25px ' + brandColor + '22, 0 0 50px ' + brandColor + '11';
      card.style.color = brandColor;
    });

    card.addEventListener('mouseleave', function () {
      card.style.borderColor = '';
      card.style.boxShadow = '';
      card.style.color = '';
    });
  });
})();

/* ============================================
   Tools Section — Category Filter & Brand Hover
   ============================================ */
(function initToolsFilter() {
  var tabs = document.querySelectorAll('.tools-tab');
  var cards = document.querySelectorAll('.tool-card-new');
  if (!tabs.length || !cards.length) return;

  // Brand color hover for new tool cards
  cards.forEach(function (card) {
    var brandColor = card.getAttribute('data-brand-color');
    if (!brandColor) return;

    card.addEventListener('mouseenter', function () {
      card.style.borderColor = brandColor + '55';
      card.style.boxShadow = '0 0 25px ' + brandColor + '22, 0 0 50px ' + brandColor + '11';
      var icon = card.querySelector('.tool-card-icon');
      if (icon) icon.style.color = brandColor;
      var name = card.querySelector('.tool-card-name');
      if (name) name.style.color = brandColor;
    });

    card.addEventListener('mouseleave', function () {
      card.style.borderColor = '';
      card.style.boxShadow = '';
      var icon = card.querySelector('.tool-card-icon');
      if (icon) icon.style.color = '';
      var name = card.querySelector('.tool-card-name');
      if (name) name.style.color = '';
    });
  });

  // Tab click handler
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // Update active tab
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var filter = tab.getAttribute('data-filter');

      // Hide all cards first
      cards.forEach(function (card) {
        card.classList.add('hiding');
        card.classList.remove('showing');
      });

      // After hide animation, toggle display and show matching cards
      setTimeout(function () {
        var showIndex = 0;
        cards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden-card');
            // Stagger the show animation
            (function (idx) {
              setTimeout(function () {
                card.classList.remove('hiding');
                card.classList.add('showing');
              }, idx * 50);
            })(showIndex);
            showIndex++;
          } else {
            card.classList.add('hidden-card');
          }
        });
      }, 300);
    });
  });
})();
