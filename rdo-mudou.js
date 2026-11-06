(function () {
  var NOVO = 'https://rdo.construtoravenko.com.br';
  var CHAVES = /^(sb-[a-z0-9]+-auth-token|rdoVenkoTheme|vkPushSugestao|vkBackupUltimo)$/;
  var instalado = false, usava = false;
  try { instalado = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch (e) {}
  try { for (var i = 0; i < localStorage.length; i++) { if (CHAVES.test(localStorage.key(i))) { usava = true; break; } } } catch (e) {}
  if (!instalado && !usava) return;
  var root = document.documentElement; root.style.visibility = 'hidden';
  function limpar() {
    try { var ks = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (CHAVES.test(k)) ks.push(k); } ks.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
  }
  function ir() { limpar(); window.location.replace(NOVO + '/'); }
  function lerPendentes() {
    return new Promise(function (ok) {
      if (!window.indexedDB) return ok({ itens: [] });
      var r; try { r = indexedDB.open('rdoVenkoOffline'); } catch (e) { return ok({ itens: [] }); }
      r.onupgradeneeded = function () { try { r.transaction.abort(); } catch (e) {} };
      r.onerror = function () { ok({ itens: [] }); };
      r.onsuccess = function () {
        var db = r.result;
        if (!db.objectStoreNames.contains('pendingRdos')) { db.close(); return ok({ itens: [] }); }
        var q = db.transaction('pendingRdos', 'readonly').objectStore('pendingRdos').getAll();
        q.onsuccess = function () { db.close(); ok({ itens: q.result || [] }); };
        q.onerror = function () { db.close(); ok({ itens: [], erro: true }); };
      };
    });
  }
  function transferir(itens) {
    return new Promise(function (ok, falha) {
      var f = document.createElement('iframe'); f.style.display = 'none'; f.src = NOVO + '/migrar.html';
      var t = setTimeout(function () { removeEventListener('message', h); falha(); }, 25000);
      function h(ev) {
        if (ev.origin !== NOVO || !ev.data) return;
        if (ev.data.tipo === 'vk-migrar-pronto') f.contentWindow.postMessage({ tipo: 'vk-migrar-pendentes', itens: itens }, NOVO);
        else if (ev.data.tipo === 'vk-migrar-ok' && ev.data.n === itens.length) { clearTimeout(t); removeEventListener('message', h); ok(); }
        else if (ev.data.tipo === 'vk-migrar-erro') { clearTimeout(t); removeEventListener('message', h); falha(); }
      }
      addEventListener('message', h);
      (document.body || root).appendChild(f);
    });
  }
  function aviso(n) {
    root.style.visibility = '';
    var d = document.createElement('div');
    d.setAttribute('role', 'alert');
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0b0f0c;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font:16px/1.5 system-ui,sans-serif;text-align:center';
    d.innerHTML = '<div style="max-width:420px"><h2 style="margin:0 0 12px;font-size:22px">O RDO mudou de endere\u00e7o</h2>' +
      '<p style="margin:0 0 20px">Este aparelho tem ' + n + ' RDO' + (n > 1 ? 's' : '') + ' salvo' + (n > 1 ? 's' : '') + ' que ainda n\u00e3o ' + (n > 1 ? 'foram enviados' : 'foi enviado') +
      '. Conecte-se \u00e0 internet e toque em "Tentar de novo" para lev\u00e1-' + (n > 1 ? 'los' : 'lo') + ' ao endere\u00e7o novo sem perder nada.</p>' +
      '<button type="button" style="background:#c6f432;color:#0b0f0c;border:0;border-radius:8px;padding:12px 20px;font-weight:700;font-size:16px;cursor:pointer">Tentar de novo</button></div>';
    d.querySelector('button').onclick = function () { window.location.reload(); };
    (document.body || root).appendChild(d);
  }
  function seguir() {
    lerPendentes().then(function (r) {
      if (r.erro) return aviso(1);
      if (!r.itens.length) return ir();
      transferir(r.itens).then(function () {
        try { indexedDB.deleteDatabase('rdoVenkoOffline'); } catch (e) {}
        ir();
      }, function () { aviso(r.itens.length); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', seguir); else seguir();
})();
