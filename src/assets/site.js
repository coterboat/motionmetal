(function () {
  'use strict';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  // ---- mobile menu ------------------------------------------------------
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    var menuIcon = menuBtn.innerHTML;
    var closeIcon = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menuBtn.innerHTML = open ? closeIcon : menuIcon;
    };
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); }
    });
  }

  // ---- placeholder highlight toggle ------------------------------------
  var tbdBtn = document.querySelector('.tbd-toggle');
  var showTbd = store('mmw-show-tbd') !== 'off';
  var applyTbd = function () {
    root.classList.toggle('show-tbd', showTbd);
    var pr = document.querySelector('.page-root');
    if (pr) pr.classList.toggle('show-tbd', showTbd);
    if (tbdBtn) tbdBtn.setAttribute('aria-pressed', String(showTbd));
  };
  applyTbd();
  if (tbdBtn) {
    tbdBtn.addEventListener('click', function () {
      showTbd = !showTbd;
      store('mmw-show-tbd', showTbd ? 'on' : 'off');
      applyTbd();
    });
  }

  // ---- hero: laser cutting a nest of parts ------------------------------
  var canvas = document.getElementById('laser');
  if (canvas && canvas.getContext) laser(canvas, document.getElementById('laser-pct'));

  function laser(cv, pctEl) {
    var ctx = cv.getContext('2d');
    var css = getComputedStyle(root);
    var col = {
      sheet: css.getPropertyValue('--raised').trim() || '#1d2125',
      grid: css.getPropertyValue('--line').trim() || '#2b3035',
      edge: css.getPropertyValue('--line-strong').trim() || '#3a4046',
      cut: css.getPropertyValue('--fg-2').trim() || '#c2c6ca',
      hot: css.getPropertyValue('--arc').trim() || '#ff6a13',
    };
    var W = 400, H = 300; // sheet units; canvas is 4:3

    function circle(cx, cy, r, n) {
      var pts = [];
      n = n || Math.max(16, Math.round(r * 1.6));
      for (var i = 0; i <= n; i++) {
        var a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return pts;
    }
    function rect(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; }
    function slot(x, y, len, r) {
      var pts = [], i, a;
      for (i = 0; i <= 10; i++) { a = -Math.PI / 2 + (i / 10) * Math.PI; pts.push([x + len + Math.cos(a) * r, y + Math.sin(a) * r]); }
      for (i = 0; i <= 10; i++) { a = Math.PI / 2 + (i / 10) * Math.PI; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      pts.push(pts[0]);
      return pts;
    }

    // Inner features first, then the outer profile: the order a real program cuts.
    var contours = [
      circle(38, 38, 7), circle(132, 38, 7), circle(38, 102, 7), circle(132, 102, 7), circle(85, 70, 16),
      rect(20, 20, 130, 100),
      circle(190, 120, 6), circle(230, 40, 6), circle(268, 40, 6),
      [[172, 20], [290, 20], [290, 60], [212, 60], [212, 142], [172, 142], [172, 20]],
      circle(326, 46, 7),
      [[304, 20], [382, 20], [304, 122], [304, 20]],
    ];
    var bolts = [];
    for (var b = 0; b < 6; b++) {
      var ang = (b / 6) * Math.PI * 2;
      bolts.push(circle(85 + Math.cos(ang) * 42, 212 + Math.sin(ang) * 42, 5));
    }
    contours = contours.concat(bolts, [circle(85, 212, 22), circle(85, 212, 60, 64)]);
    contours = contours.concat([
      slot(200, 180, 30, 7), slot(262, 180, 30, 7), slot(324, 180, 30, 7),
      rect(172, 160, 208, 40),
      rect(198, 228, 62, 36), circle(326, 246, 14),
      rect(172, 214, 208, 66),
    ]);

    // Flatten into segments with cumulative distance so progress maps to a point.
    var segs = [], total = 0, pen = [6, 6];
    contours.forEach(function (c) {
      var start = c[0];
      var travel = Math.hypot(start[0] - pen[0], start[1] - pen[1]);
      segs.push({ a: pen, b: start, len: travel, cut: false, at: total });
      total += travel / 6; // rapid moves are faster than cutting
      segs[segs.length - 1].cost = travel / 6;
      for (var i = 1; i < c.length; i++) {
        var l = Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]);
        segs.push({ a: c[i - 1], b: c[i], len: l, cut: true, at: total, cost: l });
        total += l;
      }
      pen = c[c.length - 1];
    });
    var cutTotal = segs.reduce(function (s, g) { return s + (g.cut ? g.len : 0); }, 0);

    var scale = 1, ox = 0, oy = 0, dpr = 1, last = total;
    function resize() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      var pad = 24 * dpr, hud = 36 * dpr;
      scale = Math.min((cv.width - pad * 2) / W, (cv.height - pad * 2 - hud) / H);
      ox = (cv.width - W * scale) / 2;
      oy = (cv.height - hud - H * scale) / 2;
    }
    function X(p) { return ox + p[0] * scale; }
    function Y(p) { return oy + p[1] * scale; }

    var sparks = [];
    function frame(progress) {
      last = progress;
      ctx.clearRect(0, 0, cv.width, cv.height);
      // sheet
      ctx.fillStyle = col.sheet;
      ctx.fillRect(ox - 6 * scale, oy - 6 * scale, (W + 12) * scale, (H + 12) * scale);
      ctx.strokeStyle = col.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var gx = 0; gx <= W; gx += 25) { ctx.moveTo(ox + gx * scale, oy - 6 * scale); ctx.lineTo(ox + gx * scale, oy + (H + 6) * scale); }
      for (var gy = 0; gy <= H; gy += 25) { ctx.moveTo(ox - 6 * scale, oy + gy * scale); ctx.lineTo(ox + (W + 6) * scale, oy + gy * scale); }
      ctx.stroke();

      var done = 0, head = null, recent = [];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = col.cut;
      ctx.lineWidth = Math.max(1.5, 1.4 * dpr);
      ctx.beginPath();
      for (var i = 0; i < segs.length; i++) {
        var s = segs[i];
        if (progress <= s.at) break;
        var f = Math.min(1, (progress - s.at) / s.cost);
        var px = s.a[0] + (s.b[0] - s.a[0]) * f;
        var py = s.a[1] + (s.b[1] - s.a[1]) * f;
        if (s.cut) {
          ctx.moveTo(X(s.a), Y(s.a));
          ctx.lineTo(ox + px * scale, oy + py * scale);
          done += s.len * f;
          if (progress - s.at < 40) recent.push([s.a, [px, py]]);
        }
        head = { x: ox + px * scale, y: oy + py * scale, cutting: s.cut && f < 1 };
      }
      ctx.stroke();

      // the last few millimetres of kerf are still hot
      if (recent.length) {
        ctx.strokeStyle = col.hot;
        ctx.lineWidth = Math.max(2, 2 * dpr);
        ctx.beginPath();
        recent.forEach(function (r) { ctx.moveTo(X(r[0]), Y(r[0])); ctx.lineTo(X(r[1]), Y(r[1])); });
        ctx.stroke();
      }

      if (head && progress < total) {
        if (head.cutting) {
          for (var k = 0; k < 3; k++) {
            sparks.push({ x: head.x, y: head.y, vx: (Math.random() - 0.5) * 3 * dpr, vy: (Math.random() * 2.5 + 0.5) * dpr, life: 1 });
          }
        }
        ctx.fillStyle = col.hot;
        ctx.shadowColor = col.hot;
        ctx.shadowBlur = 16 * dpr;
        ctx.beginPath();
        ctx.arc(head.x, head.y, (head.cutting ? 3.5 : 2) * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = col.edge;
        ctx.lineWidth = dpr;
        ctx.strokeRect(head.x - 9 * dpr, head.y - 9 * dpr, 18 * dpr, 18 * dpr);
      }
      sparks = sparks.filter(function (p) { return p.life > 0; });
      ctx.fillStyle = col.hot;
      sparks.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15 * dpr; p.life -= 0.05;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x, p.y, 1.6 * dpr, 1.6 * dpr);
      });
      ctx.globalAlpha = 1;

      if (pctEl) pctEl.textContent = 'Cut ' + Math.min(100, Math.round((done / cutTotal) * 100)) + '%';
    }

    resize();
    // Resizing clears the canvas, so always repaint the current frame.
    if (window.ResizeObserver) new ResizeObserver(function () { resize(); frame(last); }).observe(cv);

    if (reduceMotion) { frame(total); return; }

    // Start from a mostly-cut sheet so the first still frame shows finished parts.
    var speed = 120; // sheet units per second
    var hold = 2.5; // seconds to rest on the finished sheet
    var t0 = null, offset = total * 0.55, visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
    }
    function tick(now) {
      if (t0 === null) t0 = now;
      if (visible && !document.hidden) {
        var cycle = total / speed + hold;
        var tsec = ((now - t0) / 1000 + offset / speed) % cycle;
        frame(Math.min(total, tsec * speed));
      }
      requestAnimationFrame(tick);
    }
    frame(offset);
    requestAnimationFrame(tick);
  }

  // ---- work filter -------------------------------------------------------
  // The filter lives in the URL hash (work.html#waterjet), so capability pages
  // and the tags on each card can link straight to a filtered list.
  var filters = document.querySelectorAll('.filters .chip');
  if (filters.length) {
    var cards = document.querySelectorAll('.work-card');
    var empty = document.querySelector('.empty');
    var count = document.querySelector('.result-count');
    var names = {};
    filters.forEach(function (c) { names[c.getAttribute('data-filter')] = c.childNodes[0].textContent.trim(); });

    var applyFilter = function (f) {
      if (!names[f]) f = 'all';
      filters.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === f)); });
      var shown = 0;
      cards.forEach(function (card) {
        var match = f === 'all' || card.getAttribute('data-caps').split(' ').indexOf(f) !== -1;
        card.hidden = !match;
        if (match) shown++;
        card.querySelectorAll('.tags a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-cap') === f); });
      });
      if (empty) empty.hidden = shown > 0;
      if (count) {
        count.textContent = f === 'all'
          ? 'Showing all ' + shown + ' part families'
          : shown + (shown === 1 ? ' part family uses ' : ' part families use ') + names[f].toLowerCase();
      }
    };
    var setHash = function (f) {
      var url = location.pathname + location.search + (f === 'all' ? '' : '#' + f);
      try { history.replaceState(null, '', url); } catch (e) { location.hash = f === 'all' ? '' : f; }
      applyFilter(f);
    };

    filters.forEach(function (chip) {
      chip.addEventListener('click', function () { setHash(chip.getAttribute('data-filter')); });
    });
    document.querySelectorAll('.work-card .tags a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        setHash(a.getAttribute('data-cap'));
        var bar = document.querySelector('.filters');
        if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
    window.addEventListener('hashchange', function () { applyFilter(location.hash.slice(1)); });
    applyFilter(location.hash.slice(1));
  }

  // ---- forms -------------------------------------------------------------
  function validate(form) {
    var firstBad = null;
    form.querySelectorAll('.field-error').forEach(function (e) { e.remove(); });
    form.querySelectorAll('[required]').forEach(function (input) {
      var bad = !input.value.trim() || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
      input.setAttribute('aria-invalid', String(bad));
      if (bad) {
        var label = form.querySelector('label[for="' + input.id + '"]');
        var name = label ? label.childNodes[0].textContent.trim().toLowerCase() : 'this field';
        var msg = document.createElement('p');
        msg.className = 'field-error';
        msg.id = input.id + '-err';
        msg.textContent = input.type === 'email' && input.value.trim() ? 'Enter an email like name@company.com.' : 'Enter your ' + name + '.';
        input.setAttribute('aria-describedby', msg.id);
        input.parentNode.appendChild(msg);
        if (!firstBad) firstBad = input;
      } else {
        input.removeAttribute('aria-describedby');
      }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  var quote = document.getElementById('quote-form');
  if (quote) {
    // capability pages link here as quote.html#<capability>
    var pre = (location.hash || '').replace('#', '');
    if (pre) {
      var box = quote.querySelector('input[name="process"][value="' + pre + '"]');
      if (box) box.checked = true;
    }

    var files = [];
    var input = document.getElementById('q-files');
    var list = document.getElementById('file-list');
    var drop = document.getElementById('drop');
    var renderFiles = function () {
      list.innerHTML = '';
      files.forEach(function (f, i) {
        var li = document.createElement('li');
        var name = document.createElement('span');
        name.textContent = f.name;
        var right = document.createElement('span');
        right.textContent = fmtSize(f.size);
        var rm = document.createElement('button');
        rm.type = 'button';
        rm.textContent = 'Remove';
        rm.setAttribute('aria-label', 'Remove ' + f.name);
        rm.addEventListener('click', function () { files.splice(i, 1); renderFiles(); });
        right.appendChild(rm);
        li.appendChild(name);
        li.appendChild(right);
        list.appendChild(li);
      });
    };
    var addFiles = function (fl) { Array.prototype.forEach.call(fl, function (f) { files.push(f); }); renderFiles(); };
    input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (e) { if (e.dataTransfer) addFiles(e.dataTransfer.files); });

    quote.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = quote.querySelector('.form-status');
      if (!validate(quote)) {
        status.className = 'form-status err';
        status.textContent = 'Fill in the highlighted fields, then send again.';
        return;
      }
      var data = new FormData(quote);
      var procs = data.getAll('process').map(function (v) {
        var l = quote.querySelector('input[value="' + v + '"]');
        return l ? l.nextElementSibling.textContent : v;
      });
      var rows = [
        ['Name', data.get('name')],
        ['Company', data.get('company')],
        ['Email', data.get('email')],
        ['Part', data.get('part') || '—'],
        ['Quantity', data.get('qty') || '—'],
        ['Processes', procs.join(', ') || 'Not specified'],
        ['Files', files.length ? files.map(function (f) { return f.name; }).join(', ') : 'None attached'],
      ];
      var receipt = document.createElement('div');
      receipt.className = 'receipt';
      receipt.setAttribute('tabindex', '-1');
      var h = document.createElement('h2');
      h.className = 'h3';
      h.textContent = 'Request received';
      var p = document.createElement('p');
      p.textContent = 'This is a sample site, so nothing was sent. On the live site, this request would go to the estimating inbox and the customer would see this summary.';
      var dl = document.createElement('dl');
      rows.forEach(function (r) {
        var d = document.createElement('div');
        var dt = document.createElement('dt'); dt.textContent = r[0];
        var dd = document.createElement('dd'); dd.textContent = r[1];
        d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
      });
      var again = document.createElement('button');
      again.type = 'button';
      again.className = 'btn btn-ghost';
      again.textContent = 'Start another quote';
      again.addEventListener('click', function () {
        receipt.remove();
        quote.hidden = false;
        quote.reset();
        files = []; renderFiles();
        status.textContent = '';
        document.getElementById('q-name').focus();
      });
      receipt.appendChild(h); receipt.appendChild(p); receipt.appendChild(dl); receipt.appendChild(again);
      receipt.classList.add('panel');
      quote.hidden = true;
      quote.parentNode.insertBefore(receipt, quote);
      receipt.focus();
    });
  }

  var apply = document.getElementById('apply-form');
  if (apply) {
    apply.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = apply.querySelector('.form-status');
      if (!validate(apply)) {
        status.className = 'form-status err';
        status.textContent = 'Add your name and phone so we can call you back.';
        return;
      }
      status.className = 'form-status ok';
      status.textContent = 'Thanks. This sample site does not send anything; on the live site, the plant would call you back.';
      apply.reset();
    });
  }
})();
