/* Form kontak: validasi -> WhatsApp / Gmail + balasan bot otomatis */
(() => {
  'use strict';

  const CONFIG = {
    waNumber: '6285846964893',
    email: 'muhammadnaufalfahlevi4@gmail.com',
    subject: 'Pesan dari Website Portofolio'
  };

  const form = document.getElementById('contact-form');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const fields = {
    name:    { el: $('user-name'),    label: 'Nama' },
    phone:   { el: $('user-phone'),   label: 'Nomor telepon' },
    purpose: { el: $('user-purpose'), label: 'Keperluan' },
    message: { el: $('user-message'), label: 'Pesanan' }
  };
  const statusBox = $('contact-message');
  const botBox = $('contact-bot');

  const normalizePhone = (raw) => {
    let d = raw.replace(/[^\d+]/g, '').replace(/^\+/, '');
    if (d.startsWith('0')) d = '62' + d.slice(1);
    else if (d.startsWith('8')) d = '62' + d;
    return d;
  };

  const rules = {
    name: (v) => !v ? 'Nama wajib diisi.'
      : !/^[\p{L}\s.'-]{3,60}$/u.test(v) ? 'Nama minimal 3 huruf, tanpa angka atau simbol.' : '',
    phone: (v) => {
      if (!v) return 'Nomor telepon wajib diisi.';
      const n = normalizePhone(v);
      const ok = n.startsWith('62') ? /^628\d{7,12}$/.test(n) : /^\d{9,15}$/.test(n);
      return ok ? '' : 'Nomor telepon tidak valid. Contoh: 08123456789.';
    },
    purpose: (v) => v ? '' : 'Pilih keperluan Anda.',
    message: (v) => !v ? 'Pesanan wajib diisi.'
      : v.length < 10 ? 'Mohon input Keterangan minimal 10 karakter agar tujuan anda dapat dipahami.' : ''
  };

  const readValues = () => ({
    name: fields.name.el.value.trim().replace(/\s+/g, ' '),
    phone: fields.phone.el.value.trim(),
    purpose: fields.purpose.el.value.trim(),
    message: fields.message.el.value.trim()
  });

  const setError = (key, text) => {
    const el = fields[key].el;
    el.classList.toggle('is-invalid', !!text);
    el.setAttribute('aria-invalid', text ? 'true' : 'false');
  };

  const showStatus = (text, type) => {
    statusBox.textContent = text;
    statusBox.className = 'contact__message' + (type ? ' is-' + type : '');
  };

  const validate = () => {
    const v = readValues();
    const errors = [];
    Object.keys(rules).forEach((key) => {
      const err = rules[key](v[key]);
      setError(key, err);
      if (err) errors.push({ key, err });
    });
    if (errors.length) {
      showStatus(errors.map((e) => e.err).join(' '), 'error');
      fields[errors[0].key].el.focus();
      return null;
    }
    v.phone = '+' + normalizePhone(v.phone);
    return v;
  };

  // Format tetap supaya bot/penerima mudah membaca kriterianya
  const buildText = (d) =>
    'Halo, saya menghubungi lewat website portofolio.\n\n' +
    'Nama : ' + d.name + '\n' +
    'Nomor Telepon : ' + d.phone + '\n' +
    'Keperluan : ' + d.purpose + '\n' +
    'Pesanan : ' + d.message;

  const showBot = (d, channel) => {
    botBox.hidden = false;
    botBox.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = 'Bot otomatis';
    const intro = document.createElement('p');
    intro.textContent = 'Halo ' + d.name + ', data Anda lengkap dan sudah disiapkan untuk ' + channel +
      '. Tekan tombol kirim di jendela yang terbuka agar pesan sampai.';
    const list = document.createElement('ul');
    [['Nama', d.name], ['Nomor Telepon', d.phone], ['Keperluan', d.purpose], ['Pesanan', d.message]]
      .forEach(([k, val]) => {
        const li = document.createElement('li');
        const b = document.createElement('b');
        b.textContent = k + ' : ';
        li.append(b, document.createTextNode(val));
        list.appendChild(li);
      });
    const outro = document.createElement('p');
    outro.textContent = 'Naufal akan membalas ke nomor di atas secepatnya.';
    botBox.append(title, intro, list, outro);
  };

  // Kosongkan form sepenuhnya; kotak bot dibiarkan tetap tampil
  const resetForm = () => {
    form.reset();
    Object.keys(fields).forEach((key) => setError(key, ''));
  };

  const openUrl = (url) => {
    const w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url; // popup diblokir
  };

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const sendWhatsApp = () => {
    const d = validate();
    if (!d) return;
    openUrl('https://wa.me/' + CONFIG.waNumber + '?text=' + encodeURIComponent(buildText(d)));
    showStatus('Membuka WhatsApp...', 'ok');
    showBot(d, 'WhatsApp');
    resetForm();
  };

  const sendGmail = () => {
    const d = validate();
    if (!d) return;
    const subject = CONFIG.subject + ' - ' + d.purpose;
    const body = buildText(d);
    const url = isMobile
      ? 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
      : 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONFIG.email) +
        '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    openUrl(url);
    showStatus('Membuka Gmail...', 'ok');
    showBot(d, 'Gmail');
    resetForm();
  };

  // Fase capture: mengambil alih dari handler lama di main.js agar tidak terkirim ganda
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#send-wa');
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (form.elements.website && form.elements.website.value) return; // jebakan spam
    sendWhatsApp();
  }, true);

  document.addEventListener('submit', (e) => {
    if (e.target !== form) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (form.elements.website && form.elements.website.value) return;
    sendGmail();
  }, true);

  // Hapus tanda error saat pengguna memperbaiki isian
  Object.keys(fields).forEach((key) => {
    const el = fields[key].el;
    const handler = () => {
      if (el.classList.contains('is-invalid') && !rules[key](readValues()[key])) setError(key, '');
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });
})();