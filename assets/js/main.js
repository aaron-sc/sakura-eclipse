/* ==========================================================================
   Sakura Eclipse — site behavior
   Vanilla JS only. Depends on data.js being loaded first.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Reveal-on-scroll (shared observer, reusable for dynamic content)
     ------------------------------------------------------------------ */
  var revealObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        )
      : null;

  function observeReveals(root) {
    root = root || document;
    var els = root.querySelectorAll(".reveal:not([data-reveal-bound])");
    els.forEach(function (el) {
      el.setAttribute("data-reveal-bound", "true");
      if (revealObserver) {
        revealObserver.observe(el);
      } else {
        el.classList.add("is-visible");
      }
    });
  }

  /* ------------------------------------------------------------------
     Navbar: scrolled state, mobile drawer, active-link highlighting
     ------------------------------------------------------------------ */
  function initNav() {
    var navbar = document.querySelector(".navbar");
    var hamburger = document.querySelector(".hamburger");
    var navLinks = document.querySelector(".nav-links");
    if (!navbar) return;

    function onScroll() {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (hamburger && navLinks) {
      hamburger.addEventListener("click", function () {
        var open = hamburger.classList.toggle("open");
        navLinks.classList.toggle("open", open);
        document.body.style.overflow = open ? "hidden" : "";
      });
      navLinks.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          hamburger.classList.remove("open");
          navLinks.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }

    var sections = document.querySelectorAll("main [id]");
    var links = navLinks ? navLinks.querySelectorAll('a[href*="#"]') : [];
    if (sections.length && links.length && "IntersectionObserver" in window) {
      var navIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var id = entry.target.id;
              links.forEach(function (l) {
                l.classList.toggle("active", l.getAttribute("href").indexOf("#" + id) !== -1);
              });
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach(function (s) {
        navIO.observe(s);
      });
    }
  }

  /* ------------------------------------------------------------------
     Scroll progress bar
     ------------------------------------------------------------------ */
  function initScrollProgress() {
    var bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY;
      var height = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + "%";
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ------------------------------------------------------------------
     Back to top
     ------------------------------------------------------------------ */
  function initBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      function () {
        btn.classList.toggle("visible", window.scrollY > 600);
      },
      { passive: true }
    );
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------------
     Toast + Discord link wiring
     ------------------------------------------------------------------ */
  function showToast(message) {
    var toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove("visible");
    }, 2600);
  }

  function discordUrlFor(el) {
    var which = el.getAttribute("data-discord-link") || el.getAttribute("data-copy-discord");
    return which === "community" ? DISCORD_COMMUNITY_URL : DISCORD_HQ_URL;
  }

  function initDiscordLinks() {
    document.querySelectorAll("[data-discord-link]").forEach(function (el) {
      if (el.tagName === "A") el.href = discordUrlFor(el);
    });
    document.querySelectorAll("[data-copy-discord]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var url = discordUrlFor(btn);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(url)
            .then(function () {
              showToast("Discord invite copied to clipboard");
            })
            .catch(function () {
              showToast("Copy failed — " + url);
            });
        } else {
          showToast(url);
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Stat counters
     ------------------------------------------------------------------ */
  function initStatTargets() {
    var gamesEl = document.querySelector("[data-count-games]");
    var teamsEl = document.querySelector("[data-count-teams]");
    if (gamesEl) gamesEl.setAttribute("data-count", GAMES.length);
    if (teamsEl) teamsEl.setAttribute("data-count", TOTAL_TEAMS);
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }
      var duration = 1200;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animate(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        io.observe(el);
      });
    } else {
      counters.forEach(animate);
    }
  }

  /* ------------------------------------------------------------------
     Falling sakura petals (canvas, ambient background)
     ------------------------------------------------------------------ */
  function initPetals() {
    var canvas = document.getElementById("petal-canvas");
    if (!canvas || prefersReducedMotion) {
      if (canvas) canvas.remove();
      return;
    }
    var ctx = canvas.getContext("2d");
    var w, h, petals;
    var colors = ["255,111,168", "255,45,120", "248,238,242"];

    function makePetal() {
      return {
        x: Math.random() * w,
        y: -20 - Math.random() * h,
        size: 5 + Math.random() * 7,
        speedY: 0.35 + Math.random() * 0.7,
        speedX: Math.random() * 0.5 - 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        sway: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.35,
        color: colors[(Math.random() * colors.length) | 0]
      };
    }

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      var count = Math.max(10, Math.min(26, Math.floor(w / 55)));
      petals = Array.from({ length: count }, makePetal);
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size, -p.size, p.size, p.size, 0, p.size);
      ctx.bezierCurveTo(-p.size, p.size, -p.size, -p.size, 0, -p.size);
      ctx.fillStyle = "rgba(" + p.color + "," + p.opacity + ")";
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      petals.forEach(function (p) {
        p.y += p.speedY;
        p.sway += 0.012;
        p.x += p.speedX + Math.sin(p.sway) * 0.3;
        p.rotation += p.rotationSpeed;
        if (p.y > h + 20) {
          var fresh = makePetal();
          fresh.y = -20;
          Object.assign(p, fresh);
        }
        drawPetal(p);
      });
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    tick();
  }

  /* ------------------------------------------------------------------
     Homepage: games grid
     ------------------------------------------------------------------ */
  function renderGamesGrid() {
    var grid = document.getElementById("games-grid");
    if (!grid) return;
    grid.innerHTML = GAMES.map(function (g, i) {
      return (
        '<a class="game-card reveal" style="transition-delay:' +
        i * 90 +
        'ms" href="teams.html?game=' +
        g.id +
        '">' +
        '<div class="icon-badge">' + g.badge + "</div>" +
        "<h3>" + g.name + "</h3>" +
        "<p>" + g.blurb + "</p>" +
        '<div class="rosters">' +
        g.teams.length +
        " Roster" +
        (g.teams.length > 1 ? "s" : "") +
        ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
        "</div>" +
        "</a>"
      );
    }).join("");
    observeReveals(grid);
  }

  /* ------------------------------------------------------------------
     Teams page: filterable roster listing
     ------------------------------------------------------------------ */
  function renderTeamsPage() {
    var wrap = document.getElementById("teams-content");
    var filterBar = document.getElementById("filter-bar");
    if (!wrap || !filterBar) return;

    var params = new URLSearchParams(window.location.search);
    var activeFilter = params.get("game") || "all";
    if (activeFilter !== "all" && !GAMES.some(function (g) { return g.id === activeFilter; })) {
      activeFilter = "all";
    }

    filterBar.innerHTML =
      '<button class="filter-btn" data-filter="all">All Titles</button>' +
      GAMES.map(function (g) {
        return '<button class="filter-btn" data-filter="' + g.id + '">' + g.name + "</button>";
      }).join("");

    function tierTagClass(tier) {
      return tier.toLowerCase().indexOf("main") !== -1 ? "tag tag--main" : "tag";
    }

    function playerRow(p, gameId, teamName) {
      var href = "player.html?p=" + encodeURIComponent(playerSlug(gameId, teamName, p.name));
      var handle = formatHandle(p);
      return (
        '<li class="roster-player">' +
        '<a class="roster-player-link" href="' +
        href +
        '">' +
        '<span class="player-name">' +
        escapeHtml(p.name) +
        (p.captain ? ' <span class="captain-badge" title="Captain">C</span>' : "") +
        (p.igl ? ' <span class="role-badge" title="In-Game Leader">IGL</span>' : "") +
        "</span>" +
        (handle ? '<span class="player-handle">' + escapeHtml(handle) + "</span>" : "") +
        "</a>" +
        "</li>"
      );
    }

    function rosterBody(t, gameId) {
      if (!t.roster || !t.roster.length) {
        return '<div class="roster-status"><span class="dot"></span>Roster announcement pending</div>';
      }
      var main =
        '<ul class="roster-list">' +
        t.roster
          .map(function (p) {
            return playerRow(p, gameId, t.name);
          })
          .join("") +
        "</ul>";
      var subs = "";
      if (t.subs && t.subs.length) {
        subs =
          '<div class="roster-subs">' +
          '<span class="subs-label">Subs</span>' +
          '<ul class="roster-list roster-list--subs">' +
          t.subs
            .map(function (p) {
              return playerRow(p, gameId, t.name);
            })
            .join("") +
          "</ul>" +
          "</div>";
      }
      var count = t.roster.length + (t.subs ? t.subs.length : 0);
      return (
        '<button class="btn-roster-toggle" type="button" aria-expanded="false">' +
        '<span class="roster-toggle-label">View Roster</span>' +
        '<span class="roster-toggle-count">' + count + "</span>" +
        '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' +
        "</button>" +
        '<div class="roster-panel">' +
        main +
        subs +
        "</div>"
      );
    }

    function paint() {
      filterBar.querySelectorAll(".filter-btn").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-filter") === activeFilter);
      });

      var list = activeFilter === "all" ? GAMES : GAMES.filter(function (g) { return g.id === activeFilter; });

      wrap.innerHTML = list
        .map(function (g) {
          var cards = g.teams
            .map(function (t) {
              return (
                '<div class="team-card reveal">' +
                '<div class="team-card-top"><h3>' +
                t.name +
                '</h3><span class="' +
                tierTagClass(t.tier) +
                '">' +
                t.tier +
                "</span></div>" +
                rosterBody(t, g.id) +
                "</div>"
              );
            })
            .join("");

          return (
            '<div class="game-block reveal">' +
            '<div class="game-block-head">' +
            '<div class="icon-badge icon-badge--sm">' + g.badge + "</div>" +
            "<h2>" + g.name + "</h2>" +
            "<span>" + g.teams.length + " Roster" + (g.teams.length > 1 ? "s" : "") + "</span>" +
            "</div>" +
            '<div class="roster-grid">' + cards + "</div>" +
            "</div>"
          );
        })
        .join("");

      if (!list.length) {
        wrap.innerHTML = '<p style="text-align:center;color:var(--gray-dim)">No rosters found for that filter.</p>';
      }

      observeReveals(wrap);
    }

    paint();

    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      activeFilter = btn.getAttribute("data-filter");
      var url = new URL(window.location.href);
      if (activeFilter === "all") url.searchParams.delete("game");
      else url.searchParams.set("game", activeFilter);
      history.replaceState(null, "", url);
      paint();
    });

    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-roster-toggle");
      if (!btn) return;
      var panel = btn.nextElementSibling;
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      if (open) {
        panel.style.maxHeight = "0px";
        panel.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.querySelector(".roster-toggle-label").textContent = "View Roster";
      } else {
        panel.classList.add("is-open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
        btn.querySelector(".roster-toggle-label").textContent = "Hide Roster";
      }
    });
  }

  /* ------------------------------------------------------------------
     Misc
     ------------------------------------------------------------------ */
  function initFooterYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initScrollProgress();
    initBackToTop();
    initPetals();
    initDiscordLinks();
    initFooterYear();
    initStatTargets();
    renderGamesGrid();
    renderTeamsPage();
    initCounters();
    observeReveals();
  });
})();
