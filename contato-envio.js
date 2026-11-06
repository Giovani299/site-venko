/* Envio do formul\u00e1rio de Contato por e-mail (FormSubmit). */
(function () {
  var EMAIL = 'wiliam.souza@construtoravenko.com.br';
  var URL_ENVIO = 'https://formsubmit.co/ajax/' + EMAIL;
  function texto(el, s) { el.textContent = s; return el; }
  function aviso(form, msg) {
    var p = form.querySelector('.envio-erro');
    if (!p) { p = document.createElement('p'); p.className = 'envio-erro'; p.setAttribute('role', 'alert');
      p.style.cssText = 'color:#ff8a7a;margin:8px 0 0;font-size:14px;'; form.appendChild(p); }
    p.textContent = msg;
  }
  function sucesso(form, nome) {
    var box = document.createElement('div');
    box.className = 'success'; box.setAttribute('role', 'status');
    box.appendChild(texto(document.createElement('span'), '\u2713'));
    box.appendChild(texto(document.createElement('h3'), 'Mensagem enviada'));
    box.appendChild(texto(document.createElement('p'), 'Obrigado' + (nome ? ', ' + nome.split(' ')[0] : '') + '. Recebemos seu contato e responderemos pelo e-mail informado.'));
    form.style.display = 'none';
    form.parentNode.insertBefore(box, form.nextSibling);
  }
  window.addEventListener('submit', function (ev) {
    var form = ev.target;
    if (!form || !form.querySelector || !form.querySelector('[name="mensagem"]')) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    if (form.dataset.enviando === '1') return;
    var d = {}; new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    var btn = form.querySelector('button[type="submit"]');
    form.dataset.enviando = '1'; if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
    var corpo = {
      _subject: 'Site VENKO \u2014 ' + (d.assunto || 'Contato') + ' \u2014 ' + (d.nome || ''),
      _template: 'table', _replyto: d.email, _captcha: 'false',
      'Nome': d.nome, 'Empresa': d.empresa, 'Cargo': d.cargo || '\u2014', 'Telefone': d.telefone || '\u2014',
      'E-mail': d.email, 'Assunto': d.assunto, 'Mensagem': d.mensagem
    };
    fetch(URL_ENVIO, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(corpo) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (j) {
        if (String(j.success) === 'true') { sucesso(form, d.nome); return; }
        throw new Error(j.message || 'falha');
      })
      .catch(function () {
        aviso(form, 'N\u00e3o foi poss\u00edvel enviar agora. Tente de novo em instantes ou escreva para ' + EMAIL + '.');
      })
      .then(function () { form.dataset.enviando = ''; if (btn) { btn.disabled = false; btn.style.opacity = ''; } });
  }, true);
})();
