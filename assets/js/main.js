/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

/* Menu show */
if (navToggle) {
   navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu')
   })
}

/* Menu hidden */
if (navClose) {
   navClose.addEventListener('click', () => {
      navMenu.classList.remove('show-menu')
   })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () => {
   // When we click on each nav__link, we remove the show-menu class
   navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== ADD BLUR HEADER ===============*/
const blurHeader = () => {
   const header = document.getElementById('header')
   // When the scroll is greater than 50 viewport height, add the blur-header class
   window.scrollY >= 50 ? header.classList.add('blur-header')
                        : header.classList.remove('blur-header')
}
window.addEventListener('scroll', blurHeader)

/*=============== CONTACT FORM (WhatsApp + Gmail) ===============*/
// ---- DATA PEMILIK ----
const OWNER = {
   whatsapp: '6285846964893',                    // 0858-4696-4893 -> format internasional (62...)
   email:    'muhammadnaufalfahlevi4@gmail.com'
}

// ---- EmailJS (opsional, agar email masuk OTOMATIS ke Gmail tanpa membuka Gmail) ----
// Daftar gratis di emailjs.com, lalu ganti 3 nilai di bawah. Selama masih 'YOUR_...',
// tombol Gmail akan membuka Gmail dengan pesan yang sudah terisi.
const EMAILJS = {
   serviceID:  'YOUR_SERVICE_ID',
   templateID: 'YOUR_TEMPLATE_ID',
   publicKey:  'YOUR_PUBLIC_KEY'
}

const contactForm    = document.getElementById('contact-form'),
      contactMessage = document.getElementById('contact-message'),
      contactBot     = document.getElementById('contact-bot')

if (contactForm) {
   const sendWaBtn   = document.getElementById('send-wa'),
         sendMailBtn = document.getElementById('send-mail')

   const emailjsReady = () =>
      typeof emailjs !== 'undefined' &&
      Object.values(EMAILJS).every(v => v && !v.startsWith('YOUR_'))

   // Ambil & bersihkan data form
   const readForm = () => ({
      name:    contactForm.user_name.value.trim().replace(/\s+/g, ' '),
      phone:   contactForm.user_phone.value.trim(),
      purpose: contactForm.user_purpose.value,
      message: contactForm.user_message.value.trim()
   })

   // Validasi: kembalikan teks error, atau '' jika valid
   const validate = (d) => {
      if (d.name.length < 2)                         return 'Nama wajib diisi (minimal 2 huruf).'
      const digits = d.phone.replace(/\D/g, '')
      if (!/^[0-9+\s().-]+$/.test(d.phone) || digits.length < 9 || digits.length > 15)
                                                     return 'Nomor telepon tidak valid (9–15 angka).'
      if (!d.purpose)                                return 'Pilih keperluan Anda.'
      if (d.message.length < 5)                      return 'Pesanan wajib diisi (minimal 5 karakter).'
      return ''
   }

   // Format pesan otomatis (nama, nomor telepon, keperluan, pesanan)
   const buildText = (d, bold = false) => {
      const b = (t) => bold ? `*${t}*` : t
      return `Halo, saya mengirim pesan dari website portofolio Anda.\n\n` +
             `${b('Nama')}: ${d.name}\n` +
             `${b('Nomor Telepon')}: ${d.phone}\n` +
             `${b('Keperluan')}: ${d.purpose}\n` +
             `${b('Pesanan')}: ${d.message}`
   }

   const subjectOf = (d) => `Pesan baru dari ${d.name} - ${d.purpose}`

   // Buka link di tab baru (aman, tidak diblokir popup karena dipicu klik)
   const openLink = (url) => {
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      a.remove()
   }

   const showMessage = (text, type) => {
      contactMessage.textContent = text
      contactMessage.dataset.type = type || ''
   }

   // Balasan bot otomatis (memakai textContent -> aman dari XSS)
   const showBot = (d, statusText) => {
      contactBot.replaceChildren()

      const title = document.createElement('strong')
      title.textContent = '🤖 Bot Otomatis'

      const hello = document.createElement('p')
      hello.textContent = `Halo ${d.name}! ${statusText}`

      const list = document.createElement('ul')
      list.className = 'contact__bot-list'
      ;[['Nama', d.name], ['Nomor Telepon', d.phone], ['Keperluan', d.purpose], ['Pesanan', d.message]]
         .forEach(([label, value]) => {
            const li = document.createElement('li')
            const l = document.createElement('span')
            l.textContent = label + ':'
            li.append(l, ' ' + value)
            list.appendChild(li)
         })

      const bye = document.createElement('p')
      bye.textContent = 'Terima kasih, kami akan segera menghubungi Anda.'

      contactBot.append(title, hello, list, bye)
      contactBot.hidden = false
   }

   // Pengecekan bersama untuk kedua tombol
   const getValidData = () => {
      if (contactForm.website.value) return null            // bot spam terdeteksi -> abaikan diam-diam
      const data = readForm()
      const error = validate(data)
      if (error) { showMessage(error, 'error'); contactBot.hidden = true; return null }
      return data
   }

   // ---- Kirim ke WhatsApp ----
   sendWaBtn.addEventListener('click', () => {
      const data = getValidData()
      if (!data) return

      const url = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(buildText(data, true))}`
      openLink(url)
      showMessage('WhatsApp dibuka ✅', 'ok')
      showBot(data, 'WhatsApp sudah terbuka dengan pesan Anda. Tekan tombol Kirim di WhatsApp untuk menyelesaikannya.')
   })

   // ---- Kirim ke Gmail ----
   contactForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const data = getValidData()
      if (!data) return

      // A) Email otomatis lewat EmailJS (jika sudah dikonfigurasi)
      if (emailjsReady()) {
         sendMailBtn.disabled = true
         showMessage('Mengirim pesan...', '')

         emailjs.send(EMAILJS.serviceID, EMAILJS.templateID, {
            to_email:      OWNER.email,
            subject:       subjectOf(data),
            user_name:     data.name,
            user_phone:    data.phone,
            user_purpose:  data.purpose,
            user_message:  data.message
         }, { publicKey: EMAILJS.publicKey })
            .then(() => {
               showMessage('Pesan berhasil dikirim ✅', 'ok')
               showBot(data, 'Pesan Anda sudah masuk ke email kami.')
               contactForm.reset()
            })
            .catch(() => {
               showMessage('Pesan gagal dikirim ❌ Coba lagi atau gunakan tombol WhatsApp.', 'error')
            })
            .finally(() => { sendMailBtn.disabled = false })
         return
      }

      // B) Cadangan: buka Gmail dengan pesan yang sudah terisi
      const url = 'https://mail.google.com/mail/?view=cm&fs=1' +
                  `&to=${encodeURIComponent(OWNER.email)}` +
                  `&su=${encodeURIComponent(subjectOf(data))}` +
                  `&body=${encodeURIComponent(buildText(data))}`
      openLink(url)
      showMessage('Gmail dibuka ✅', 'ok')
      showBot(data, 'Gmail sudah terbuka dengan pesan Anda. Tekan tombol Kirim di Gmail untuk menyelesaikannya.')
   })
}

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
   const scrollUp = document.getElementById('scroll-up')
   // When the scroll is higher than 350 viewport height, add the show-scroll class
   window.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
                         : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () => {
   const scrollDown = window.scrollY

   sections.forEach(current => {
      const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 58,
            sectionId = current.getAttribute('id'),
            sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

      if (!sectionsClass) return

      if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
         sectionsClass.classList.add('active-link')
      } else {
         sectionsClass.classList.remove('active-link')
      }
   })
}
window.addEventListener('scroll', scrollActive)

/*=============== IMAGE SLIDER (detail pages) ===============*/
/*=============== IMAGE SLIDER (detail pages, boleh lebih dari satu) ===============*/
document.querySelectorAll('.slider').forEach((slider) => {
   const wrap    = slider.parentElement,
         track   = slider.querySelector('.slider__track'),
         dotsBox = wrap.querySelector('.slider__dots'),
         counter = wrap.querySelector('.slider__counter'),
         prevBtn = slider.querySelector('.slider__btn--prev'),
         nextBtn = slider.querySelector('.slider__btn--next'),
         delay   = 4000

   // ---- Buat slide otomatis dari data-* di HTML ----
   const { folder, prefix, ext, count, alt } = slider.dataset
   const imageFiles = slider.dataset.images
      ? slider.dataset.images.split(',').map(file => file.trim()).filter(Boolean)
      : []
   const total = Math.min(imageFiles.length || parseInt(count, 10) || 0, 100)

   for (let n = 1; n <= total; n++) {
      const fig = document.createElement('figure')
      fig.className = 'slider__slide'
      fig.setAttribute('role', 'group')
      fig.setAttribute('aria-roledescription', 'slide')
      fig.setAttribute('aria-label', `${n} / ${total}`)

      const img = document.createElement('img')
      img.className = 'slider__img'
      img.src = imageFiles.length
         ? `${folder}${imageFiles[n - 1]}`
         : `${folder}${prefix}${n}.${ext}`
      img.alt = `${alt} - gambar ${n}`
      img.decoding = 'async'
      if (n > 2) img.loading = 'lazy'

      fig.appendChild(img)
      track.appendChild(fig)
   }

   // Titik hanya untuk 10 gambar atau kurang
   if (dotsBox && total <= 10) {
      for (let n = 1; n <= total; n++) {
         const dot = document.createElement('button')
         dot.type = 'button'
         dot.className = 'slider__dot'
         dot.setAttribute('aria-label', `Gambar ${n}`)
         dotsBox.appendChild(dot)
      }
   }

   const slides = slider.querySelectorAll('.slider__slide'),
         dots   = dotsBox ? dotsBox.querySelectorAll('.slider__dot') : []

   if (total <= 1) { prevBtn.hidden = true; nextBtn.hidden = true }

   const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
   let index = 0, timer = null, visible = true

   const goTo = (i) => {
      if (!total) return
      index = (i + total) % total
      track.style.transform = `translateX(-${index * 100}%)`
      dots.forEach((dot, n) => {
         dot.classList.toggle('active', n === index)
         dot.toggleAttribute('aria-current', n === index)
      })
      if (counter) counter.textContent = `${index + 1} / ${total}`

      // Muat gambar sebelum & sesudahnya supaya tidak kosong saat digeser
      ;[index - 1, index, index + 1].forEach(k => {
         slides[(k + total) % total].querySelector('img').loading = 'eager'
      })
   }

   const stop  = () => { clearInterval(timer); timer = null }
   const start = () => {
      stop()
      if (!reduceMotion && total > 1 && visible) timer = setInterval(() => goTo(index + 1), delay)
   }

   // Dipakai oleh lightbox
   slider.goTo   = goTo
   slider.pause  = stop
   slider.resume = start

   prevBtn.addEventListener('click', () => { goTo(index - 1); start() })
   nextBtn.addEventListener('click', () => { goTo(index + 1); start() })
   dots.forEach((dot, n) => dot.addEventListener('click', () => { goTo(n); start() }))

   slider.addEventListener('mouseenter', stop)
   slider.addEventListener('mouseleave', start)
   slider.addEventListener('focusin', stop)
   slider.addEventListener('focusout', start)

   slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goTo(index - 1); start() }
      if (e.key === 'ArrowRight') { goTo(index + 1); start() }
   })

   let startX = 0
   slider.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop() }, { passive: true })
   slider.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - startX
      if (Math.abs(diff) > 40) goTo(diff < 0 ? index + 1 : index - 1)
      start()
   })

   document.addEventListener('visibilitychange', () => document.hidden ? stop() : start())

   // Geser otomatis hanya saat slider terlihat di layar (hemat tenaga untuk 3 slider)
   if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
         visible = entry.isIntersecting
         visible ? start() : stop()
      }, { threshold: 0.25 }).observe(slider)
   }

   goTo(0)
   start()
})
/*=============== SCROLL REVEAL ANIMATION ===============*/
if (typeof ScrollReveal !== 'undefined') {
   const sr = ScrollReveal({
      origin: 'top',
      distance: '60px',
      duration: 2500,
      delay: 300,
      // reset: true, // Animations repeat
   })

   sr.reveal('.home__data, .home__scroll')
   sr.reveal('.home__image', { origin: 'bottom', delay: 600 })
   sr.reveal('.work__card', { interval: 100 })
   sr.reveal('.about__img-box', { origin: 'left' })
   sr.reveal('.about__data', { origin: 'right' })
   sr.reveal('.experience, .skills', { interval: 100 })
   sr.reveal('.services__card', { interval: 100 })
   sr.reveal('.contact__form', { origin: 'left' })
   sr.reveal('.contact__social', { origin: 'right' })

   // Project detail pages
   sr.reveal('.project__head')
   sr.reveal('.slider', { origin: 'bottom', delay: 400 })
   sr.reveal('.project__intro', { delay: 500 })
   sr.reveal('.features__card', { interval: 100 })
   sr.reveal('.tech__tag', { interval: 60 })
   sr.reveal('.project-nav')
}


/*=============== LIGHTBOX (detail pages, galeri per slider) ===============*/
const lightbox = document.getElementById('lightbox')
if (lightbox) {
   const lightboxImg = document.getElementById('lightbox-img'),
         countEl     = document.getElementById('lightbox-count'),
         closeBtn    = lightbox.querySelector('.lightbox-close'),
         prevBtn     = lightbox.querySelector('.lightbox-prev'),
         nextBtn     = lightbox.querySelector('.lightbox-next')

   let images = [], current = 0, activeSlider = null
   const isOpen = () => lightbox.classList.contains('active')

   const show = (i) => {
      current = (i + images.length) % images.length
      const img = images[current]
      lightboxImg.src = img.currentSrc || img.src
      lightboxImg.alt = img.alt
      countEl.textContent = `${current + 1} / ${images.length}`
   }

   const openLightbox = (list, i, sliderEl) => {
      images = list
      activeSlider = sliderEl || null
      const multi = images.length > 1
      prevBtn.hidden = !multi
      nextBtn.hidden = !multi
      countEl.hidden = !multi
      show(i)
      lightbox.classList.add('active')
      document.body.style.overflow = 'hidden'
      if (activeSlider && activeSlider.pause) activeSlider.pause()
   }

   const closeLightbox = () => {
      lightbox.classList.remove('active')
      lightboxImg.src = ''
      document.body.style.overflow = ''
      if (activeSlider && activeSlider.goTo) { activeSlider.goTo(current); activeSlider.resume() }
      activeSlider = null
   }

   // Klik gambar slider mana pun -> buka galeri milik slider itu saja
   document.addEventListener('click', (e) => {
      const img = e.target.closest('.slider__img')
      if (img) {
         const sliderEl = img.closest('.slider')
         const list = Array.from(sliderEl.querySelectorAll('.slider__img'))
         openLightbox(list, list.indexOf(img), sliderEl)
         return
      }
      const single = e.target.closest('.project__image, .project__screenshot')
      if (single) openLightbox([single], 0, null)
   })

   closeBtn.addEventListener('click', closeLightbox)
   prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(current - 1) })
   nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(current + 1) })
   lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox() })

   document.addEventListener('keydown', (e) => {
      if (!isOpen()) return
      if (e.key === 'Escape')     closeLightbox()
      if (e.key === 'ArrowLeft')  show(current - 1)
      if (e.key === 'ArrowRight') show(current + 1)
   })

   let touchX = 0
   lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX }, { passive: true })
   lightbox.addEventListener('touchend', (e) => {
      if (images.length < 2) return
      const diff = e.changedTouches[0].clientX - touchX
      if (Math.abs(diff) > 50) show(diff < 0 ? current + 1 : current - 1)
   })
}