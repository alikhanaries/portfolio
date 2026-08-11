(function(){
  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => loader.classList.add('hidden'), 500);
  });

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  navToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  }));

  /* ---------- Nav scroll state + progress bar + scrollspy ---------- */
  const nav = document.getElementById('nav');
  const bar = document.getElementById('progressBar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let ticking = false;
  function onScrollFrame(){
    nav.classList.toggle('scrolled', window.scrollY > 20);
    const h = document.documentElement;
    const pct = (h.scrollTop) / Math.max(1, (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + '%';

    let current = sections[0];
    sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 160) current = sec; });
    navLinks.forEach(a => a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id));
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  }, { passive:true });
  onScrollFrame();

  /* ---------- Particle canvas ---------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const COUNT = window.innerWidth < 480 ? 22 : window.innerWidth < 768 ? 34 : 64;
  for(let i=0;i<COUNT;i++){
    particles.push({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.4+0.3,
      vy: -(Math.random()*0.18+0.04),
      vx: (Math.random()-0.5)*0.06,
      a: Math.random()*0.5+0.15
    });
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.y += p.vy; p.x += p.vx;
      if(p.y < -10){ p.y = H+10; p.x = Math.random()*W; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(199,201,205,${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    if(!reduced) requestAnimationFrame(tick);
  }
  tick();

  /* ---------- Torch / flashlight cursor ---------- */
  const torchGlow = document.getElementById('torch-glow');
  const torchCore = document.getElementById('torch-core');
  const hoverCapable = window.matchMedia('(hover: hover)').matches;

  if (hoverCapable) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let tx = mx, ty = my;
    let torchOn = false;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!torchOn) {
        torchOn = true;
        torchGlow.classList.add('active');
        torchCore.classList.add('active');
        tx = mx; ty = my;
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      torchOn = false;
      torchGlow.classList.remove('active');
      torchCore.classList.remove('active');
    });
    document.addEventListener('mouseenter', () => {
      if (mx !== null) { torchOn = true; torchGlow.classList.add('active'); torchCore.classList.add('active'); }
    });

    function torchTick(){
      const ease = reduced ? 1 : 0.16;
      tx += (mx - tx) * ease;
      ty += (my - ty) * ease;
      const txPx = tx.toFixed(1) + 'px';
      const tyPx = ty.toFixed(1) + 'px';
      torchGlow.style.setProperty('--tx', txPx);
      torchGlow.style.setProperty('--ty', tyPx);
      torchCore.style.setProperty('--tx', txPx);
      torchCore.style.setProperty('--ty', tyPx);
      requestAnimationFrame(torchTick);
    }
    torchTick();
  }


  /* ---------- Typing effect ---------- */
  const roles = ['Senior Software Engineer','Backend Systems Specialist','Microservices Architect','Java & Golang Developer','Cloud Engineer'];
  const typedEl = document.getElementById('typed');
  let ri = 0, ci = 0, deleting = false;
  function typeLoop(){
    const word = roles[ri];
    if(!deleting){
      ci++;
      typedEl.textContent = word.slice(0, ci);
      if(ci === word.length){ deleting = true; setTimeout(typeLoop, 1600); return; }
    } else {
      ci--;
      typedEl.textContent = word.slice(0, ci);
      if(ci === 0){ deleting = false; ri = (ri+1) % roles.length; }
    }
    setTimeout(typeLoop, deleting ? 28 : 58);
  }
  typeLoop();

  /* ---------- Scroll cue fade ---------- */
  const scrollCue = document.querySelector('.scroll-cue');
  window.addEventListener('scroll', () => {
    if (!scrollCue) return;
    const fade = Math.min(window.scrollY / 220, 1);
    scrollCue.style.opacity = String(1 - fade);
    scrollCue.style.transform = `translateX(-50%) translateY(${fade * 12}px)`;
  }, { passive:true });

  /* ---------- Magnetic buttons ---------- */
  if (!reduced && hoverCapable) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.18 - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .stagger').forEach(el=>io.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat .num');
  const cio = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        let cur = 0;
        const step = Math.max(1, Math.round(target/40));
        const iv = setInterval(()=>{
          cur += step;
          if(cur >= target){ cur = target; clearInterval(iv); }
          el.textContent = cur + '+';
        }, 30);
        cio.unobserve(el);
      }
    });
  }, { threshold:0.5 });
  counters.forEach(c=>cio.observe(c));

  /* ---------- Language bars ---------- */
  const bars = document.querySelectorAll('.lang-fill');
  const bio = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.style.width = e.target.dataset.fill + '%'; bio.unobserve(e.target); }
    });
  }, { threshold:0.4 });
  bars.forEach(b=>bio.observe(b));

  /* ---------- Timeline expand/collapse ---------- */
  document.querySelectorAll('.tl-card').forEach(card=>{
    function toggle(){
      const item = card.closest('.tl-item');
      const body = card.querySelector('.tl-body');
      const isOpen = item.classList.contains('open');
      // close all
      document.querySelectorAll('.tl-item.open').forEach(o=>{
        if(o !== item){
          o.classList.remove('open');
          o.querySelector('.tl-body').style.maxHeight = null;
          o.querySelector('.tl-card').setAttribute('aria-expanded','false');
        }
      });
      if(isOpen){
        item.classList.remove('open');
        body.style.maxHeight = null;
        card.setAttribute('aria-expanded','false');
      } else {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        card.setAttribute('aria-expanded','true');
      }
    }
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  });
  // open the first item's body height on load
  window.addEventListener('load', ()=>{
    const openItem = document.querySelector('.tl-item.open .tl-body');
    if(openItem) openItem.style.maxHeight = openItem.scrollHeight + 'px';
  });

  /* ---------- Project card 3D tilt ---------- */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-py*7).toFixed(2)}deg) rotateY(${(px*7).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(message, type){
    toastEl.textContent = message;
    toastEl.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  /* ---------- Copy email ---------- */
  const copyEmailBtn = document.getElementById('copyEmail');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'alikh4365@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.textContent = 'Copied';
        copyEmailBtn.classList.add('copied');
        showToast('Email copied to clipboard', 'ok');
        setTimeout(() => {
          copyEmailBtn.textContent = 'Copy';
          copyEmailBtn.classList.remove('copied');
        }, 1800);
      } catch (_) {
        showToast('Could not copy email', 'err');
      }
    });
  }

  /* ---------- Contact form -> email inbox (FormSubmit) ---------- */
  const contactForm = document.getElementById('contactForm');
  const sendBtn = document.getElementById('sendBtn');
  const formNote = document.getElementById('formNote');
  const formSuccess = document.getElementById('formSuccess');
  const messageField = document.getElementById('fmessage');
  const charCount = document.getElementById('charCount');
  const CONTACT_EMAIL = 'alikh4365@gmail.com';

  function updateCharCount(){
    const len = messageField.value.length;
    charCount.textContent = len + ' / 2000';
    charCount.classList.toggle('warn', len > 1800);
  }
  messageField.addEventListener('input', updateCharCount);
  updateCharCount();

  function setFieldInvalid(el, invalid){
    el.classList.toggle('invalid', !!invalid);
  }

  function validateForm(){
    const name = document.getElementById('fname');
    const email = document.getElementById('femail');
    const message = document.getElementById('fmessage');
    let ok = true;
    setFieldInvalid(name, !name.value.trim());
    if (!name.value.trim()) ok = false;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    setFieldInvalid(email, !emailOk);
    if (!emailOk) ok = false;
    setFieldInvalid(message, !message.value.trim());
    if (!message.value.trim()) ok = false;
    return ok;
  }

  ['fname','femail','fmessage'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => setFieldInvalid(e.target, false));
  });

  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    formNote.className = 'form-note';
    formNote.textContent = 'Your message is delivered straight to my email.';

    if (!validateForm()) {
      formNote.textContent = 'Please fill in the required fields correctly.';
      formNote.classList.add('err');
      return;
    }

    // Honeypot — bots fill this; humans never see it
    if (document.getElementById('fwebsite').value) {
      formSuccess.classList.add('show');
      return;
    }

    const name = document.getElementById('fname').value.trim();
    const email = document.getElementById('femail').value.trim();
    const subject = document.getElementById('fsubject').value.trim() || 'Portfolio inquiry';
    const message = document.getElementById('fmessage').value.trim();

    sendBtn.classList.add('loading');
    sendBtn.disabled = true;

    try {
      const res = await fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          _replyto: email,
          _subject: 'Portfolio contact: ' + subject,
          subject,
          message,
          _template: 'table',
          _captcha: 'false',
          _honey: ''
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.success === false)) {
        throw new Error(data.message || 'Failed to send message');
      }

      formSuccess.classList.add('show');
      contactForm.reset();
      updateCharCount();
      showToast('Message sent — check your inbox soon', 'ok');
    } catch (err) {
      formNote.textContent = 'Could not send right now. Email me directly at ' + CONTACT_EMAIL;
      formNote.classList.add('err');
      showToast('Send failed — try again or email me directly', 'err');
    } finally {
      sendBtn.classList.remove('loading');
      sendBtn.disabled = false;
    }
  });

  document.getElementById('sendAnother').addEventListener('click', () => {
    formSuccess.classList.remove('show');
    formNote.className = 'form-note';
    formNote.textContent = 'Your message is delivered straight to my email.';
    document.getElementById('fname').focus();
  });

  /* ---------- Download CV (plain text) ---------- */
  document.getElementById('downloadCv').addEventListener('click', function(e){
    e.preventDefault();
    const content = `MUHAMMAD ALI KHAN
Senior Software Engineer — Backend & Microservices Architecture
Islamabad, Pakistan | +92-315-5154186 | alikh4365@gmail.com | linkedin.com/in/alikhanaries

PROFESSIONAL SUMMARY
Senior Software Engineer with 7+ years of experience across 5 companies, building scalable backend systems and microservices for e-commerce, healthcare, and finance. Shipped 7+ production systems using Golang, Java, and Spring Boot, with strong expertise in RESTful and gRPC APIs, event-driven architecture (Kafka), cloud deployments (Docker, Kubernetes, AWS), and Agile delivery. Experienced leading teams and mentoring junior developers. Open to relocation within the EU.

CORE SKILLS
Languages: Golang, Java, C#, JavaScript, Dart, Python, SQL
Backend Frameworks: Gin, Gorilla Mux, Kratos, Spring Boot, Spring Security, GORM, Ent, JPA, Hibernate, JavaFX
APIs & Architecture: Microservices, REST, gRPC, GraphQL, JWT, Kafka, Swagger
Databases: PostgreSQL, MySQL, MS SQL Server, MongoDB, Redis
Cloud & DevOps: AWS (EC2, S3, RDS, Elastic Beanstalk, CloudFront), Azure, Docker, Kubernetes, CI/CD, Nginx
Frontend & Mobile: Flutter, Dart, Android, HTML5, CSS3, JavaScript, jQuery, WordPress, Shopify
Tools: Git, Jira, Agile/Scrum, Sprint Planning, Code Review, JUnit, Team Leadership, Mentoring

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Leading Folks — Islamabad, Pakistan | June 2026 – Present
- Lead backend engineering for Stock Connect, an e-commerce microservices platform (Spring Boot, Kafka, Docker, PostgreSQL, MongoDB, Redis).
- Design event-driven microservices using Kafka for asynchronous communication.
- Build and document RESTful APIs with JWT authentication and Swagger.
- Manage containerized deployments and coordinate cross-functional delivery.

Senior Software Engineer | Cowboy Technologies — Pakistan | October 2024 – June 2026
- Led microservice architecture using Golang, Gin, Gorilla Mux, and Kratos.
- Built 6 core e-commerce modules: user management, cart, checkout, inventory, shipping, payments.
- Integrated Stripe, Razorpay, and PayPal with JWT-authenticated transaction flows.
- Designed data models with GORM and Ent across PostgreSQL, MongoDB, and Redis.
- Managed Docker/Kubernetes deployments, CI/CD, and production monitoring.
- Mentored junior developers on Go microservices and gRPC.

Senior Software Engineer | Xpira Technologies — Pakistan | November 2022 – September 2024
- Led architecture and delivery for 3 enterprise products over 2 years.
- Built Xpira (POS & inventory) with Java, JavaFX, REST, MySQL.
- Built SOHO SORTED (housekeeping management) with Java, Spring Boot, Hibernate, Flutter.
- Built Buddy-B (finance platform, microservices) on AWS with Docker and Nginx.

Senior Java Developer | Mega Techs — Rawalpindi, Pakistan | July 2021 – September 2022
- Built Post Job (job-posting web app) with Java, Spring Boot, REST, MySQL.
- Led custom WordPress site delivery for multiple clients over 14 months.
- Built custom themes/plugins; integrated WooCommerce and REST services.
- Delivered EduLearn (LMS), a Shopify–WordPress sync plugin, and a telemedicine healthcare portal.

Associate Software Engineer | Sanctuary Techs — Islamabad, Pakistan | April 2019 – June 2021
- Managed project delivery and mentorship across healthcare and sales initiatives.
- Contributed to GlobalVPN, an iOS VPN app built with Swift.
- Contributed to Photogauge, an aviation image processing system (Java, Python, REST).

EDUCATION
Bachelor of Science in Computer Science
Allama Iqbal Open University — Islamabad, Pakistan | 2018 – 2022

LANGUAGES
English — Professional Working Proficiency
Urdu — Native Proficiency
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Muhammad-Ali-Khan-CV.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
})();
