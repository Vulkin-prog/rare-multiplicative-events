'use strict';
// Contextual definitions: no network, no storage, no automatic text replacement.
(() => {
  function init() {
    if (document.querySelector('[data-quick-glossary-ready]')) return;
    const fr = document.documentElement.lang.toLowerCase().startsWith('fr');
    const t = (en, french) => fr ? french : en;
    const make = (tag, className, text) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text) el.textContent = text;
      return el;
    };
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const definitions = [
      ['primes', 'Random choices at primes', 'Choix aléatoires aux nombres premiers',
        'In the random-sign model, toss an independent fair coin for each prime: +1 or −1. Multiplication then determines every other value. For example, f(12) = f(2)²f(3) = f(3); integer values are not independent.',
        'Dans le modèle de signes aléatoires, on lance une pièce équilibrée et indépendante pour chaque nombre premier : +1 ou −1. La multiplication fixe ensuite toutes les autres valeurs. Par exemple, f(12) = f(2)²f(3) = f(3) ; les valeurs aux entiers ne sont pas indépendantes.'],
      ['rare', 'Rare event and run start', 'Événement rare et début de série',
        'A rare event has a small probability; in these limit theorems its probability decreases as the scale grows. A run is a sequence of identical consecutive signs. Counting its start, preceded by the opposite sign, avoids counting overlapping windows within the same run. The initial run is treated separately.',
        'Un événement rare a une faible probabilité ; dans ces théorèmes limites, cette probabilité diminue quand l’échelle grandit. Une série réunit des signes consécutifs identiques. Compter son début, précédé du signe opposé, évite de recompter les fenêtres d’une même série. La série initiale est traitée séparément.'],
      ['mean', 'Mean, intensity and observed count', 'Moyenne, intensité et nombre observé',
        'The mean is an average over the random model; the observed count is the result of one draw. A mean of 2 does not mean every draw contains two events. For a point process, the intensity measure gives the expected count in a region. With clusters, the mean number of points can differ from the mean number of sources.',
        'La moyenne porte sur les tirages du modèle ; le nombre observé est le résultat d’un seul tirage. Une moyenne de 2 ne signifie pas deux apparitions à chaque fois. Pour un processus de points, la mesure d’intensité donne le nombre moyen dans une région. Avec des amas, le nombre moyen de points peut différer du nombre moyen de sources.'],
      ['law', 'Probability law', 'Loi de probabilité',
        'A law assigns probabilities to possible observations. For a count, it gives the chances of seeing 0, 1, 2, … events. A histogram estimates a law from repeated simulations; a single draw is one observation, not a law.',
        'Une loi attribue des probabilités aux observations possibles. Pour un comptage, elle donne les chances d’observer 0, 1, 2, … apparitions. Un histogramme estime une loi à partir de simulations répétées ; un tirage unique est une observation, pas une loi.'],
      ['poisson', 'Poisson and compound Poisson', 'Poisson et Poisson composée',
        'A Poisson count has a parameter λ equal to both its mean and variance. A compound Poisson count adds the sizes of a Poisson number of clusters. If each source produces two points, the count is always even and is generally not Poisson. Rarity alone does not establish either law.',
        'Un comptage de Poisson a un paramètre λ égal à sa moyenne et à sa variance. Un comptage de Poisson composé additionne les tailles d’un nombre poissonien d’amas. Si chaque source produit deux points, le total est toujours pair et n’est en général pas poissonien. La rareté seule ne suffit à établir aucune de ces lois.'],
      ['cluster', 'Source and cluster', 'Source et amas',
        'A source is a shared random cause. Several linked appearances produced by that source form a cluster. The source may be visible in a detailed observation even when the total count alone hides how the appearances are connected.',
        'Une source est une cause aléatoire commune. Plusieurs apparitions liées produites par cette source forment un amas. Une observation détaillée peut révéler la source, alors que le seul total masque les liens entre les apparitions.'],
      ['window', 'Observation window', 'Fenêtre d’observation',
        'A window selects a region to inspect, such as an interval of integers. The observation also specifies what is retained: a total, positions, signs or a history. Two observations of the same underlying random object can retain different dependencies.',
        'Une fenêtre sélectionne une région à examiner, par exemple un intervalle d’entiers. Il faut aussi préciser ce que l’on retient : un total, les positions, les signes ou une histoire. Deux observations du même objet aléatoire peuvent conserver des dépendances différentes.'],
      ['covariance', 'Covariance', 'Covariance',
        'Cov(X, Y) = E[(X − E[X])(Y − E[Y])] measures how two quantities fluctuate together. A positive value means their deviations tend to have the same sign; a negative value means opposite signs. Zero covariance does not, in general, imply independence.',
        'Cov(X, Y) = E[(X − E[X])(Y − E[Y])] mesure comment deux quantités fluctuent ensemble. Une valeur positive indique des écarts à leurs moyennes qui tendent à avoir le même signe ; une valeur négative, des signes opposés. Une covariance nulle n’implique pas, en général, l’indépendance.'],
      ['tv', 'Total variation distance (TV)', 'Distance en variation totale (TV)',
        'A number between 0 and 1: the largest difference in probability that two laws assign to the same observable event. A small TV distance controls every event on that observation space. Changing from a count to an entire configuration changes the space being compared.',
        'Un nombre entre 0 et 1 : le plus grand écart entre les probabilités que deux lois attribuent au même événement observable. Une petite distance TV contrôle tous les événements sur cet espace d’observation. Passer d’un total à une configuration entière change l’espace comparé.'],
      ['conditioning', 'Conditioning', 'Conditionnement',
        'Study the random model after specified information is known, for example after fixing the signs of small primes. Only the remaining uncertainty is random. Conditioning on a very rare event can magnify an approximation error, so a theorem must control that error at the appropriate scale.',
        'On étudie le modèle après avoir appris une information, par exemple les signes des petits nombres premiers. Seule l’incertitude restante est aléatoire. Conditionner sur un événement très rare peut amplifier une erreur d’approximation : le théorème doit la contrôler à la bonne échelle.'],
      ['limit', 'Asymptotic limit', 'Limite asymptotique',
        'A theorem describes what approaches what as a scale tends to infinity, under stated assumptions. The notation o(1) means a quantity tends to zero; it need not be small at the settings of a browser simulation. Visual agreement illustrates a theorem but does not prove it.',
        'Un théorème décrit ce qui se rapproche de quoi lorsque l’échelle tend vers l’infini, sous des hypothèses précises. La notation o(1) signifie qu’une quantité tend vers zéro ; elle n’est pas forcément petite aux réglages d’une simulation. Un accord visuel illustre un théorème sans le démontrer.'],
      ['fixed', 'Fixed realization, random observation', 'Réalisation fixée, observation aléatoire',
        'Choose the random function once, then keep it fixed. Randomly moving the observation window explores that same realization without tossing the prime coins again. This empirical law differs from the law obtained by redrawing the function; their comparison requires its own theorem.',
        'On choisit la fonction aléatoire une seule fois, puis on la garde fixée. Déplacer la fenêtre au hasard explore cette même réalisation sans relancer les pièces des nombres premiers. Cette loi empirique diffère de la loi obtenue en tirant à nouveau la fonction ; leur comparaison demande un théorème spécifique.']
    ];

    const existingDialog = document.getElementById('glossary-dialog');
    const existingSection = document.getElementById('glossary');
    let host, list, entries, dialog = existingDialog, opener = null;
    if (existingDialog) {
      host = existingDialog;
      list = existingDialog.querySelector('#glossary-content');
      if (!list) return;
      entries = [...list.querySelectorAll('.glossary-entry')];
    } else if (existingSection) {
      host = existingSection;
      list = existingSection.querySelector('.glossary-grid');
      if (!list) return;
      entries = [...list.querySelectorAll('details')];
    } else {
      const controls = document.querySelector('.corpus-read-controls');
      if (!controls || typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') return;
      dialog = make('dialog', 'quick-glossary-dialog');
      dialog.id = 'quick-glossary-dialog';
      dialog.setAttribute('aria-labelledby', 'quick-glossary-title');
      const heading = make('div', 'quick-glossary-heading');
      const title = make('h2', '', t('Glossary', 'Les mots utiles'));
      title.id = 'quick-glossary-title';
      const close = make('button', 'quick-glossary-close', t('Close ×', 'Fermer ×'));
      close.type = 'button';
      close.addEventListener('click', () => dialog.close());
      heading.append(title, close);
      dialog.append(heading, make('p', 'quick-glossary-intro', t('Look up a term, then return to the same experiment.', 'Consultez un mot, puis retrouvez la même expérience.')));
      list = make('div', 'quick-glossary-list');
      entries = definitions.map(([key, en, french, enText, frenchText]) => {
        const entry = make('article', 'quick-glossary-entry');
        entry.dataset.glossaryKey = key;
        entry.append(make('h3', '', t(en, french)), make('p', '', t(enText, frenchText)));
        list.append(entry);
        return entry;
      });
      dialog.append(list); document.body.append(dialog); host = dialog;
      const button = make('button', 'quick-glossary-open', t('Glossary', 'Les mots utiles'));
      button.type = 'button';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', dialog.id);
      button.addEventListener('click', () => open(button));
      controls.append(button);
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const r = dialog.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
      });
      dialog.addEventListener('close', () => {
        reset();
        if (opener && opener.isConnected) opener.focus({ preventScroll: true });
      });
    }
    if (!entries.length) return;
    host.dataset.quickGlossaryReady = 'true';
    host.classList.add('quick-glossary-host');
    list.id = list.id || 'quick-glossary-entries';
    const search = make('div', 'quick-glossary-search');
    const label = make('label', '', t('Find a term or an idea', 'Chercher un mot ou une idée'));
    label.htmlFor = 'quick-glossary-search';
    const row = make('div', 'quick-glossary-search-row');
    const input = make('input'); input.type = 'search'; input.id = 'quick-glossary-search';
    input.autocomplete = 'off'; input.spellcheck = false;
    input.setAttribute('aria-controls', list.id);
    const clear = make('button', 'quick-glossary-clear', t('Clear', 'Effacer'));
    clear.type = 'button'; clear.disabled = true;
    const count = make('p', 'quick-glossary-count');
    count.setAttribute('role', 'status'); count.setAttribute('aria-live', 'polite');
    count.setAttribute('aria-atomic', 'true');
    row.append(input, clear); search.append(label, row, count); list.before(search);
    const texts = entries.map(entry => normalize(entry.textContent));
    function applyFilter() {
      const words = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
      let found = 0;
      entries.forEach((entry, index) => {
        entry.hidden = !words.every(word => texts[index].includes(word));
        if (!entry.hidden) found++;
      });
      clear.disabled = !input.value;
      count.textContent = found ? (fr ? `${found} définition${found === 1 ? '' : 's'} sur ${entries.length}` : `${found} of ${entries.length} definitions`) : t('No match. Try a shorter word or clear the search.', 'Aucun résultat. Essayez un mot plus court ou effacez la recherche.');
    }
    function reset() { input.value = ''; applyFilter(); }
    input.addEventListener('input', applyFilter);
    input.addEventListener('search', applyFilter);
    clear.addEventListener('click', () => { reset(); input.focus(); });
    function open(button, term) {
      opener = button; reset();
      if (term) {
        const entry = entries.find(el => el.dataset.glossaryKey === term);
        input.value = entry ? entry.querySelector('h3').textContent : term;
        applyFilter();
      }
      if (dialog && !dialog.open) dialog.showModal();
      input.focus({ preventScroll: true });
      if (!dialog) search.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    // Capture precedes the older guide's own term handler: a filtered-out term
    // must be visible before its existing focus/highlight/scroll behavior runs.
    if (existingDialog) {
      document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-term],[data-open-glossary]');
        if (trigger) reset();
      }, true);
      existingDialog.addEventListener('close', reset);
    }
    // Explicit future links can opt in. No arbitrary inline words are changed.
    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-glossary-term]');
      if (!trigger) return;
      event.preventDefault(); open(trigger, trigger.dataset.glossaryTerm);
    });
    applyFilter();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
