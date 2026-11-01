(function () {
  const selector = '.extra-card,.shop-item,.shop-av,.bp-avatar,.subject-card,.age-card,.level-card,.bana-card,.story-card,.age-badge,.kx-word,.kx-cell,.calc-cell,.carry-cell';
  function prepare() {
    for (const el of document.querySelectorAll(selector)) {
      if (!el.onclick || el.classList.contains('locked')) continue;
      el.setAttribute('role', 'button'); el.tabIndex = 0;
      if (el.classList.contains('carry-cell')) el.setAttribute('aria-label', 'Växla minnessiffra');
      if (el.classList.contains('calc-cell')) el.setAttribute('aria-label', 'Välj siffrans ruta');
    }
  }
  new MutationObserver(prepare).observe(document.querySelector('.container'), {childList: true, subtree: true});
  prepare();
  document.addEventListener('keydown', e => {
    if(e.target.id==='brkCanvas' && ['ready','playing'].includes(brkState)){
      if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();
        if(e.key===' ')brkLaunch();else brkMouseX=Math.max(0,Math.min(brkW,brkMouseX+(e.key==='ArrowLeft'?-1:1)*brkW*.06));
      }
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"]') && e.target.tagName !== 'BUTTON') {
      e.preventDefault(); e.target.click();
    }
  });
  const style = document.createElement('style');
  style.textContent = '[role="button"]:focus-visible,button:focus-visible{outline:3px solid #ffe477;outline-offset:4px}';
  document.head.append(style);
})();
