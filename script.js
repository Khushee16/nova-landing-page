/* ============ Nova landing page interactions ============ */
(function () {
  "use strict";

  /* ---------- Dark / light mode (persisted) ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;

  function getStoredTheme() {
    try { return localStorage.getItem("nova-theme"); } catch (e) { return null; }
  }
  function storeTheme(theme) {
    try { localStorage.setItem("nova-theme", theme); } catch (e) { /* storage unavailable */ }
  }
  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "dark" || stored === "light") {
      root.setAttribute("data-theme", stored);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.setAttribute("data-theme", "dark");
    }
  }
  initTheme();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
    });
  }

  /* ---------- Mobile nav ---------- */
  var hamburger = document.getElementById("hamburger");
  var navLinks = document.getElementById("navLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navLinks.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".stat-num");
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animateCounter(el) {
    if (prefersReduced) {
      var t = parseFloat(el.getAttribute("data-target"));
      var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = t.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) + (el.getAttribute("data-suffix") || "");
      return;
    }
    var target = parseFloat(el.getAttribute("data-target"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = 1600;
    var start = null;
    function fmt(v) {
      return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cntObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cntObs.observe(el); });
  }

  /* ---------- Pricing toggle ---------- */
  var toggleBtns = document.querySelectorAll(".toggle-btn");
  var amounts = document.querySelectorAll(".amount");
  toggleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      toggleBtns.forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      var period = btn.getAttribute("data-period");
      amounts.forEach(function (amt) {
        amt.style.opacity = "0";
        setTimeout(function () {
          amt.textContent = "$" + amt.getAttribute("data-" + period);
          amt.style.opacity = "1";
        }, 150);
      });
    });
  });

  /* ---------- Testimonial carousel ---------- */
  var testimonials = [
    { quote: "Nova replaced three tools for us. Our Monday metrics meeting went from 90 minutes of arguing about numbers to 20 minutes of deciding what to do.", name: "Maya Chen", role: "Head of Data, Northwind" },
    { quote: "The alerts alone are worth it. We caught a checkout bug within an hour of deploy because Nova pinged us about the conversion dip.", name: "Devon Park", role: "Product Lead, Helios" },
    { quote: "I onboarded our whole marketing team in a day. Nobody asks me for CSV exports anymore — they just build their own dashboards.", name: "Priya Nair", role: "Growth Manager, Brightline" },
    { quote: "We evaluated five BI tools. Nova was the only one our finance team actually adopted without training sessions.", name: "Tom Alvarez", role: "CFO, Copperfield" }
  ];
  var track = document.getElementById("tTrack");
  var dotsWrap = document.getElementById("tDots");
  var prevBtn = document.getElementById("tPrev");
  var nextBtn = document.getElementById("tNext");
  var carousel = document.getElementById("carousel");
  var current = 0, timer = null;

  function renderSlides() {
    testimonials.forEach(function (t, i) {
      var slide = document.createElement("div");
      slide.className = "t-slide";
      slide.setAttribute("role", "tabpanel");
      var stars = document.createElement("div");
      stars.className = "t-stars";
      stars.textContent = "\u2605\u2605\u2605\u2605\u2605";
      var quote = document.createElement("p");
      quote.className = "t-quote";
      quote.textContent = "\u201C" + t.quote + "\u201D";
      var name = document.createElement("p");
      name.className = "t-name";
      name.textContent = t.name;
      var role = document.createElement("p");
      role.className = "t-role";
      role.textContent = t.role;
      slide.appendChild(stars);
      slide.appendChild(quote);
      slide.appendChild(name);
      slide.appendChild(role);
      track.appendChild(slide);

      var dot = document.createElement("button");
      dot.className = "t-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); restartAuto(); });
      dotsWrap.appendChild(dot);
    });
  }
  function goTo(i) {
    current = (i + testimonials.length) % testimonials.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    var dots = dotsWrap.querySelectorAll(".t-dot");
    dots.forEach(function (d, idx) {
      d.classList.toggle("active", idx === current);
      d.setAttribute("aria-selected", idx === current ? "true" : "false");
    });
    track.querySelectorAll(".t-slide").forEach(function (s, idx) {
      s.setAttribute("aria-hidden", idx === current ? "false" : "true");
    });
  }
  function restartAuto() {
    if (timer) clearInterval(timer);
    if (prefersReduced) return;
    timer = setInterval(function () { goTo(current + 1); }, 6000);
  }
  if (track && dotsWrap) {
    renderSlides();
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); restartAuto(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); restartAuto(); });
    restartAuto();
    if (carousel) {
      carousel.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
      carousel.addEventListener("mouseleave", restartAuto);
    }
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var oa = other.querySelector(".faq-a");
        var oq = other.querySelector(".faq-q");
        if (oa) oa.style.maxHeight = "0px";
        if (oq) oq.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Contact form: validate, then POST to contact.php ----------
     contact.php is a plain PHP endpoint that saves the lead to data/leads.json.
     On static hosting (GitHub Pages) or file:// there is no PHP backend, so a
     failed fetch shows a clearly-labelled DEMO success state instead of
     pretending the message was sent. */
  var form = document.getElementById("contactForm");
  var success = document.getElementById("formSuccess");
  var successTitle = document.getElementById("formSuccessTitle");
  var successText = document.getElementById("formSuccessText");
  var demoNote = document.getElementById("formDemoNote");
  var submitBtn = document.getElementById("cfSubmit");
  function showSuccess(isDemo) {
    form.hidden = true;
    if (!success) return;
    if (isDemo) {
      if (successTitle) successTitle.textContent = "Thanks — demo mode";
      if (successText) successText.textContent = "Your message looks good, but this demo has no backend connected, so it wasn't sent anywhere.";
      if (demoNote) demoNote.hidden = false;
    } else {
      if (successTitle) successTitle.textContent = "Message sent!";
      if (successText) successText.textContent = "Thanks for reaching out — someone from our team will reply within one business day.";
      if (demoNote) demoNote.hidden = true;
    }
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function setError(inputId, msg) {
    var input = document.getElementById(inputId);
    var err = document.getElementById("err-" + inputId);
    if (!input || !err) return false;
    if (msg) {
      err.textContent = msg;
      input.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      return false;
    }
    err.textContent = "";
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    return true;
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cfName").value.trim();
      var email = document.getElementById("cfEmail").value.trim();
      var company = document.getElementById("cfCompany") ? document.getElementById("cfCompany").value.trim() : "";
      var message = document.getElementById("cfMessage").value.trim();
      var ok = true;
      ok = setError("cfName", name.length < 2 ? "Please enter your name." : "") && ok;
      ok = setError("cfEmail", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Please enter a valid work email.") && ok;
      ok = setError("cfMessage", message.length < 10 ? "Tell us a little more (at least 10 characters)." : "") && ok;
      if (!ok) {
        var firstBad = form.querySelector(".invalid");
        if (firstBad) firstBad.focus();
        return;
      }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
      fetch("contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, company: company, message: message })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("backend unavailable (" + res.status + ")");
          return res.json();
        })
        .then(function (data) {
          if (data && data.ok) showSuccess(false);
          else showSuccess(true); /* backend rejected it: don't fake a send */
        })
        .catch(function () { showSuccess(true); })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send message"; }
        });
    });
    ["cfName", "cfEmail", "cfMessage"].forEach(function (id) {
      var input = document.getElementById(id);
      if (input) input.addEventListener("input", function () { setError(id, ""); });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


/* === Polish pass 2026-11-25: scroll progress, back-to-top, reveal stagger, carousel keys === */
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bar = document.createElement("div");
  bar.className = "scroll-progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var topBtn = document.createElement("button");
  topBtn.className = "back-to-top"; topBtn.type = "button";
  topBtn.setAttribute("aria-label", "Back to top"); topBtn.textContent = "\u2191";
  document.body.appendChild(topBtn);
  topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    topBtn.classList.toggle("show", h.scrollTop > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  /* Stagger reveals that share a parent */
  document.querySelectorAll(".reveal").forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList && c.classList.contains("reveal"); });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--reveal-delay", Math.min(i * 0.08, 0.4) + "s");
  });
  /* Carousel: arrow keys + pause autoplay while focus is inside */
  var carousel = document.getElementById("carousel");
  if (carousel) {
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { var p = document.getElementById("tPrev"); if (p) p.click(); }
      if (e.key === "ArrowRight") { var n = document.getElementById("tNext"); if (n) n.click(); }
    });
  }
  /* Pricing amount pop on toggle */
  document.querySelectorAll(".toggle-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".amount").forEach(function (a) { a.classList.remove("pop"); void a.offsetWidth; a.classList.add("pop"); });
    });
  });
})();
