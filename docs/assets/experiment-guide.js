/* Optional reading prompts. Navigation never changes an experiment or draws a sample. */
'use strict';
(() => {
  const fr = document.documentElement.lang === 'fr';
  const t = (en, french) => fr ? french : en;
  const guides = [
    {
      id: 'empirical-lab',
      link: 'paper-c.html#empirical-result',
      reference: t('Long runs · the empirical count law', 'Long runs · la loi empirique du total'),
      steps: [
        {
          title: t('Move the viewpoint', 'Déplacer le regard'),
          control: 'empirical-origin',
          action: t('Move the frame-origin slider u to several positions.', 'Déplacez le curseur d’origine u à plusieurs positions.'),
          fixed: t('Keep M, L and h unchanged, with the same prime signs.', 'Gardez M, L et h inchangés, avec les mêmes signes premiers.'),
          observation: t('The count in the selected frame can change. The histogram stays fixed: it already includes every possible origin.', 'Le total du cadre choisi peut changer. L’histogramme reste fixe : il inclut déjà toutes les origines possibles.')
        },
        {
          title: t('Change what you count', 'Changer ce que l’on compte'),
          control: 'empirical-window',
          action: t('Change h, the number of candidate starts inside the frame.', 'Changez h, le nombre de débuts candidats dans le cadre.'),
          fixed: t('Keep M, L and the prime signs. The same strip is observed through a different-sized frame.', 'Gardez M, L et les signes premiers. La même bande est observée avec un cadre de taille différente.'),
          observation: t('The histogram and the reference mean h2⁻ᴸ both change. A different observation can have a different law, even with the same underlying sequence.', 'L’histogramme et la moyenne de référence h2⁻ᴸ changent tous les deux. Une autre observation peut avoir une autre loi, même sur la même suite.')
        },
        {
          title: t('Distinguish the two sources of randomness', 'Distinguer les deux sources de hasard'),
          control: 'empirical-reset',
          action: t('Now use “New prime signs” once, then move the frame again.', 'Utilisez maintenant « Relancer les pièces » une fois, puis déplacez de nouveau le cadre.'),
          fixed: t('Keep M, L and h unchanged to compare two realizations at the same scale.', 'Gardez M, L et h inchangés pour comparer deux réalisations à la même échelle.'),
          observation: t('The new draw can change the strip and its histogram. The theorem instead fixes almost any one infinite realization and varies the origin at prescribed scales; these finite examples illustrate the distinction.', 'Le nouveau tirage peut changer la bande et son histogramme. Le théorème fixe, lui, presque toute réalisation infinie et fait varier l’origine aux échelles prescrites ; ces exemples finis illustrent cette distinction.')
        }
      ]
    },
    {
      id: 'compression-lab',
      link: 'flows.html#gaussian-result',
      reference: t('Records and scale flows · joint Gaussian limits', 'Records and scale flows · limites gaussiennes conjointes'),
      steps: [
        {
          title: t('Separate a finite model from its limit', 'Distinguer un modèle fini de sa limite'),
          control: 'compression-j',
          action: t('Move J from 1 towards 10.', 'Faites passer J de 1 vers 10.'),
          fixed: t('Keep the phase θ fixed. The critical survivor mean then stays fixed.', 'Gardez la phase θ fixe. La moyenne des survivants critiques reste alors fixe.'),
          observation: t('Compare “Exact finite” with “Limit”. C and D−C remain correlated at finite J; their independence belongs to the joint Gaussian limit.', 'Comparez « Fini exact » et « Limite ». C et D−C restent corrélés à J fini ; leur indépendance appartient à la limite gaussienne conjointe.')
        },
        {
          title: t('Find what the phase still changes', 'Repérer ce que la phase change encore'),
          control: 'compression-phase',
          action: t('Move the phase slider θ.', 'Déplacez le curseur de phase θ.'),
          fixed: t('Keep J fixed and watch the exact covariance table and ellipse.', 'Gardez J fixe et observez la table des covariances exactes et l’ellipse.'),
          observation: t('The covariance stays unchanged while the critical survivor mean changes. Matching second moments does not mean the full finite laws are identical.', 'La covariance reste inchangée tandis que la moyenne des survivants critiques change. Des moments d’ordre deux identiques ne signifient pas que les lois finies complètes sont identiques.')
        },
        {
          title: t('Use Monte Carlo as a comparison', 'Utiliser Monte Carlo pour comparer'),
          control: 'compression-run',
          action: t('Choose a seed and run the 400 trials.', 'Choisissez une graine et lancez les 400 tirages.'),
          fixed: t('Keep J and θ fixed. The same seed reproduces the same sample.', 'Gardez J et θ fixes. La même graine reproduit le même échantillon.'),
          observation: t('Compare the sampled moments with “Exact finite” first. Sampling error and the finite-to-limit difference are separate effects. The points sample the Poisson target; they do not prove the arithmetic theorem.', 'Comparez d’abord les moments simulés à « Fini exact ». L’erreur d’échantillonnage et l’écart à la limite sont deux effets distincts. Les points simulent le modèle de Poisson ; ils ne démontrent pas le théorème arithmétique.')
        }
      ]
    },
    {
      id: 'window-lab',
      link: 'environments.html#window-result',
      reference: t('Moving prime environments · the window criterion', 'Moving prime environments · le critère de cadrage'),
      steps: [
        {
          title: t('Same mean, different local laws', 'Même moyenne, lois locales différentes'),
          control: 'crop-example',
          action: t('Use the comparison preset a = 0.4, d = 0.2.', 'Utilisez le réglage de comparaison a = 0,4 et d = 0,2.'),
          fixed: t('Both panels use the same crop and angular step.', 'Les deux panneaux utilisent le même cadrage et le même pas angulaire.'),
          observation: t('Both means are 0.6. Read the variances: 0.6 for ratio 3, about 0.827 for ratio 3/2. The shaded crop reveals a difference that the full-prefix count law misses.', 'Les deux moyennes valent 0,6. Lisez les variances : 0,6 pour le rapport 3, environ 0,827 pour 3/2. Le cadrage coloré révèle une différence que la loi du total global ne voit pas.')
        },
        {
          title: t('Cut a cluster with space', 'Séparer un amas par le cadrage'),
          control: 'crop-a',
          action: t('Move the left edge a to 0.8.', 'Déplacez le bord gauche a à 0,8.'),
          fixed: t('Keep the angular step d = 0.2.', 'Gardez le pas angulaire d = 0,2.'),
          observation: t('Neither ratio can now fit two linked descendants inside the narrow crop. Both crop counts are Poisson with mean 0.2, although the full interval still retains clusters.', 'Aucun des deux rapports ne permet désormais de placer deux descendants liés dans ce cadrage étroit. Les deux totaux suivent Poisson de moyenne 0,2, alors que l’intervalle complet conserve des amas.')
        },
        {
          title: t('Cut a cluster with the angle', 'Séparer un amas par l’angle'),
          control: 'crop-d',
          action: t('Return a to 0.4, then increase d to 1.', 'Ramenez a à 0,4, puis augmentez d jusqu’à 1.'),
          fixed: t('Keep the same crop while changing d.', 'Gardez ce cadrage fixe pendant que d varie.'),
          observation: t('The angular intervals no longer have positive overlap, so both counts become Poisson with mean 0.6. A shared source can create a visible pair only when both the spatial and angular conditions allow it.', 'Les intervalles angulaires n’ont plus de recouvrement de masse positive : les deux totaux deviennent Poisson de moyenne 0,6. Une source commune ne crée une paire visible que si les conditions spatiale et angulaire le permettent.')
        }
      ]
    }
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  guides.forEach(guide => {
    const lab = document.getElementById(guide.id);
    const body = lab?.querySelector('.experiment-body');
    if (!body || lab.querySelector('.experiment-guide')) return;
    const panel = el('details', 'experiment-guide');
    const summary = el('summary', '', t('Guided exploration', 'Exploration guidée'));
    summary.append(el('span', 'experiment-guide-summary-meta', t('3 steps', '3 étapes')));
    const content = el('div', 'experiment-guide-content');
    const progress = el('p', 'experiment-guide-progress');
    const heading = el('h4', 'experiment-guide-title');
    const instructions = el('dl', 'experiment-guide-instructions');
    const action = el('dd'), fixed = el('dd'), observation = el('dd');
    [[t('Try', 'À essayer'), action], [t('Keep fixed', 'À garder fixe'), fixed], [t('Observe', 'À observer'), observation]].forEach(([label, value]) => {
      const row = el('div');
      row.append(el('dt', '', label), value);
      instructions.append(row);
    });
    const controlLink = el('a', 'experiment-guide-control', t('Go to this control ↓', 'Aller à ce contrôle ↓'));
    const reference = el('a', 'experiment-guide-reference', guide.reference + ' →');
    const [referencePage, referenceAnchor] = guide.link.split('#');
    reference.href = window.CorpusOfflineRoute ? window.CorpusOfflineRoute(referencePage, '#' + referenceAnchor) : guide.link;
    const navigation = el('div', 'experiment-guide-navigation');
    const previous = el('button', '', t('← Previous', '← Précédent'));
    const next = el('button', '', t('Next →', 'Suivant →'));
    previous.type = next.type = 'button';
    const status = el('span', 'experiment-guide-sr');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    let index = 0;

    function render(announce) {
      const step = guide.steps[index];
      progress.textContent = t('Step ', 'Étape ') + (index + 1) + ' / ' + guide.steps.length;
      heading.textContent = step.title;
      action.textContent = step.action;
      fixed.textContent = step.fixed;
      observation.textContent = step.observation;
      controlLink.href = '#' + step.control;
      controlLink.hidden = !document.getElementById(step.control);
      reference.hidden = index !== guide.steps.length - 1;
      previous.disabled = index === 0;
      next.textContent = index === guide.steps.length - 1 ? t('Start again ↺', 'Recommencer ↺') : t('Next →', 'Suivant →');
      if (announce) status.textContent = progress.textContent + '. ' + step.title;
    }

    previous.addEventListener('click', () => { if (index > 0) { index--; render(true); } });
    next.addEventListener('click', () => { index = (index + 1) % guide.steps.length; render(true); });
    controlLink.addEventListener('click', event => {
      const control = document.getElementById(guide.steps[index].control);
      if (!control) return;
      event.preventDefault();
      control.focus({preventScroll: true});
      control.scrollIntoView({block: 'center', behavior: 'auto'});
    });
    navigation.append(previous, next);
    content.append(progress, heading, instructions, controlLink, reference, navigation, status);
    panel.append(summary, content);
    body.prepend(panel);
    render(false);
  });
})();
