// Preserve links to the declaration's former section on the home page.
if (document.body.dataset.page === 'home') {
  const redirectDeclaration = () => {
    if (['#declaration', '#declaration-text'].includes(location.hash)) {
      location.replace(new URL('declaration.html', location.href));
    }
  };
  redirectDeclaration();
  window.addEventListener('hashchange', redirectDeclaration);
}

// The declaration is always visible. Only its navigation folds on small screens.
const contents = document.querySelector('.contents');
if (contents) {
  const smallScreen = window.matchMedia('(max-width: 760px)');
  const adaptContents = () => { contents.open = !smallScreen.matches; };
  adaptContents();
  smallScreen.addEventListener('change', adaptContents);
  contents.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (smallScreen.matches) contents.open = false;
    });
  });
}
