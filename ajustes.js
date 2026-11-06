/* Troca o verde-limao por um verde escuro quando o texto esta sobre fundo claro (senao nao da para ler). */
(function () {
  function rgb(s) { var m = s && s.match(/[\d.]+/g); return m ? m.map(Number) : null; }
  function lum(c) {
    var a = c.slice(0, 3).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function camadaEscura(a, el) {
    /* fundo feito por uma camada posicionada (foto/degrade) atras do conteudo, como no topo das paginas */
    for (var k = a.firstElementChild; k; k = k.nextElementSibling) {
      if (k.contains(el)) continue;
      var ks = getComputedStyle(k);
      if ((ks.position === 'absolute' || ks.position === 'fixed') && ks.backgroundImage && ks.backgroundImage !== 'none') return true;
    }
    return false;
  }
  function fundoClaro(el) {
    for (var a = el; a && a !== document.documentElement; a = a.parentElement) {
      var cs = getComputedStyle(a);
      if (cs.position === 'fixed') return false;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return false;
      if (a !== el && camadaEscura(a, el)) return false;
      var c = rgb(cs.backgroundColor);
      if (c && (c.length < 4 || c[3] > 0.5)) return lum(c) > 0.5;
    }
    return lum(rgb(getComputedStyle(document.body).backgroundColor) || [255, 255, 255]) > 0.5;
  }
  function ajustar() {
    var els = document.querySelectorAll('h1 em, h2 em, h3 em, blockquote em, p em, strong em, em, span, small, b');
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; if (el.classList.contains('vk-lime-claro')) continue;
      var c = rgb(getComputedStyle(el).color);
      if (!c || !(c[0] > 180 && c[1] > 230 && c[2] < 120)) continue;
      if (fundoClaro(el)) el.classList.add('vk-lime-claro');
    }
  }
  var t;
  function agendar() { clearTimeout(t); t = setTimeout(ajustar, 60); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ajustar); else ajustar();
  new MutationObserver(agendar).observe(document.documentElement, { childList: true, subtree: true });
})();
