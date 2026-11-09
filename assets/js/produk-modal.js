(function initProdukModal() {
  var backdrop = document.getElementById('pmBackdrop');
  var btnClose = document.getElementById('pmClose');
  var elSlides = document.getElementById('pmSlides');
  var elThumbs = document.getElementById('pmThumbs');
  var elBadge = document.getElementById('pmBadge');
  var elTitle = document.getElementById('pmTitle');
  var elTagline = document.getElementById('pmTagline');
  var elDesc = document.getElementById('pmDesc');
  var elSpecs = document.getElementById('pmSpecs');
  var btnPrev = document.getElementById('pmPrev');
  var btnNext = document.getElementById('pmNext');

  if (!backdrop) return;
  if (!window.PRODUK_DATA) return;

  var currentSlide = 0;
  var totalSlides = 0;

  function bukaModal(produkId) {
    var data = window.PRODUK_DATA[produkId];
    if (!data) return;

    elSlides.innerHTML = '';
    elThumbs.innerHTML = '';
    currentSlide = 0;

    elBadge.textContent = data.badge || '';
    elBadge.className = 'pm-badge' + (data.badgeClass ? ' ' + data.badgeClass : '');

    elTitle.textContent = data.nama || '';
    elTagline.textContent = data.tagline || '';
    elDesc.textContent = data.deskripsi || '';

    var specs = Array.isArray(data.spesifikasi) ? data.spesifikasi : [];
    var specsHTML = '<p class="pm-specs-title">Fitur & Spesifikasi</p><ul class="pm-spec-list">';
    specs.forEach(function(s) {
      var ikon = s && s.ikon ? s.ikon : '';
      var teks = s && s.teks ? s.teks : '';
      specsHTML += '<li><i class="' + ikon + '" aria-hidden="true"></i>' + teks + '</li>';
    });
    specsHTML += '</ul>';
    elSpecs.innerHTML = specsHTML;

        // ==================== TOMBOL LIHAT KATALOG ====================
    var actionsContainer = document.createElement('div');
    actionsContainer.className = 'pm-actions';

    // Tombol Hubungi Kami
    var btnHubungi = document.createElement('a');
    btnHubungi.href = "https://wa.me/6281329603048";           // atau "https://wa.me/628..."
    btnHubungi.className = 'pm-btn-primary';
    btnHubungi.innerHTML = '<i class="fas fa-phone"></i> Hubungi Kami';
    actionsContainer.appendChild(btnHubungi);

    // Tombol Lihat Katalog (dinamis sesuai produk)
    var btnKatalog = document.createElement('a');
    btnKatalog.href = data.katalogUrl || '#';   // pakai data dari produk
    btnKatalog.target = "_blank";
    btnKatalog.className = 'pm-btn-outline';
    btnKatalog.innerHTML = '<i class="fas fa-download"></i> Lihat Katalog';
    
    // Kalau tidak ada link katalog, sembunyikan tombol
    if (!data.katalogUrl) {
      btnKatalog.style.display = 'none';
    }

    actionsContainer.appendChild(btnKatalog);

    // Masukkan ke panel kanan
    var pmRight = document.querySelector('.pm-right');
    if (pmRight) {
      var oldActions = pmRight.querySelector('.pm-actions');
      if (oldActions) oldActions.remove();
      pmRight.appendChild(actionsContainer);
    }

    var validGambar = (Array.isArray(data.gambar) ? data.gambar : []).filter(function(src) {
      return src && String(src).trim();
    });

    totalSlides = validGambar.length;

    if (totalSlides === 0) {
      var ph = document.createElement('div');
      ph.className = 'pm-slide pm-slide-placeholder pm-active';
      ph.innerHTML = '<i class="' + (data.ikonPlaceholder || 'fas fa-image') + '" aria-hidden="true"></i>';
      elSlides.appendChild(ph);
      totalSlides = 1;
    } else {
      validGambar.forEach(function(src, i) {
        var slide = document.createElement('div');
        slide.className = 'pm-slide' + (i === 0 ? ' pm-active' : '');

        var img = document.createElement('img');
        img.src = src;
        img.alt = (data.nama || 'Produk') + ' ' + (i + 1);
        img.onerror = function() {
          this.parentElement.innerHTML =
            '<div class="pm-slide-placeholder"><i class="' + (data.ikonPlaceholder || 'fas fa-image') + '"></i></div>';
        };
        slide.appendChild(img);
        elSlides.appendChild(slide);

        var thumb = document.createElement('div');
        thumb.className = 'pm-thumb' + (i === 0 ? ' pm-active' : '');
        thumb.setAttribute('data-idx', i);

        var tImg = document.createElement('img');
        tImg.src = src;
        tImg.alt = 'Thumbnail ' + (i + 1);
        tImg.onerror = function() { this.parentElement.style.display = 'none'; };
        thumb.appendChild(tImg);

        thumb.addEventListener('click', function() {
          goToSlide(parseInt(this.getAttribute('data-idx')));
        });
        elThumbs.appendChild(thumb);
      });
    }

    if (totalSlides <= 1) {
      btnPrev.classList.add('pm-hidden');
      btnNext.classList.add('pm-hidden');
    } else {
      btnPrev.classList.remove('pm-hidden');
      btnNext.classList.remove('pm-hidden');
    }

    elThumbs.style.display = totalSlides <= 1 ? 'none' : '';

    backdrop.removeAttribute('hidden');
    requestAnimationFrame(function() {
      backdrop.classList.add('pm-open');
    });

    document.body.style.overflow = 'hidden';
    btnClose && btnClose.focus();
  }

  function tutupModal() {
    backdrop.classList.remove('pm-open');
    setTimeout(function() {
      backdrop.setAttribute('hidden', '');
    }, 320);
    document.body.style.overflow = '';
  }

  function goToSlide(n) {
    var slides = elSlides.querySelectorAll('.pm-slide');
    var thumbs = elThumbs.querySelectorAll('.pm-thumb');

    slides.forEach(function(s) { s.classList.remove('pm-active'); });
    thumbs.forEach(function(t) { t.classList.remove('pm-active'); });

    currentSlide = ((n % totalSlides) + totalSlides) % totalSlides;

    if (slides[currentSlide]) slides[currentSlide].classList.add('pm-active');
    if (thumbs[currentSlide]) thumbs[currentSlide].classList.add('pm-active');
  }

  btnClose && btnClose.addEventListener('click', tutupModal);

  backdrop.addEventListener('click', function(e) {
    if (e.target === backdrop) tutupModal();
  });

  btnPrev && btnPrev.addEventListener('click', function() { goToSlide(currentSlide - 1); });
  btnNext && btnNext.addEventListener('click', function() { goToSlide(currentSlide + 1); });

  document.addEventListener('keydown', function(e) {
    if (backdrop.hasAttribute('hidden')) return;
    if (e.key === 'Escape') { tutupModal(); }
    if (e.key === 'ArrowLeft') { goToSlide(currentSlide - 1); }
    if (e.key === 'ArrowRight') { goToSlide(currentSlide + 1); }
  });

  var touchStartX = 0;
  backdrop.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  backdrop.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
    }
  }, { passive: true });

  document.querySelectorAll('.layanan-card[data-produk-id]').forEach(function(card) {
    var produkId = card.getAttribute('data-produk-id');

    var btnDetail = card.querySelector('.lcard-open-modal');
    if (btnDetail) {
      btnDetail.addEventListener('click', function(e) {
        e.stopPropagation();
        bukaModal(produkId);
      });
    }

    var sliderArea = card.querySelector('.lcard-slider');
    if (sliderArea) {
      sliderArea.style.cursor = 'pointer';
      sliderArea.addEventListener('click', function(e) {
        if (e.target.classList.contains('dot')) return;
        bukaModal(produkId);
      });
    }
  });
})();
