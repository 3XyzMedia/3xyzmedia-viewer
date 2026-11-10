                                                                              
window.xyzFxButtons = (() => {
  const names = ['BURST', 'VORTEX', 'UNVEIL', 'RAINBOW', 'SPIRAL', 'FIRE'];
  function modes(values) {
    return names.map((_, i) => i + 1).filter(id => Array.isArray(values) && values.includes(id));
  }
  function render(values, launch) {
    const bar = document.getElementById('fxShortcuts');
    bar.replaceChildren();
    for (const id of modes(values)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = names[id - 1];
      button.dataset.shortcut = String(id);
      button.onclick = () => launch(id);
      bar.appendChild(button);
    }
    bar.hidden = !bar.childElementCount;
  }
  return { render, modes };
})();
