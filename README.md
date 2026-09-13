# Krillion

Clone solo français de [krillion.io](https://krillion.io) pour s’entraîner à la culture générale. Pas de multijoueur, pas d’archives, pas de packs, pas de limite quotidienne : on plonge autant de fois qu’on veut.

Une plongée = **7 prompts**, **25 secondes** chacun. Les réponses rares rapportent plus de points et font descendre (1 point = 10 mètres). Le matching se fait uniquement contre un catalogue d’alias, sans IA.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:43217](http://localhost:43217) (le script `dev` utilise le port 43217).

```bash
npm run build
npm start
```

## Jouer

1. **Commencer la descente** depuis l’accueil.
2. Tape **une** réponse, puis **Plonger**. Une faute de frappe raisonnable est acceptée.
3. Hors catalogue : le champ se vide, un message rouge **pas dans la liste** s’affiche, et tu réessayes jusqu’à la fin du chrono.
4. Seulement si le chrono tombe à 0 sans réponse validée : **Temps écoulé**, 0 point, prompt suivant.
5. **Plonger** (réponse valide) : le cartel de la réponse apparaît et la caméra descend d’un seul trait (~1–2 s). Pendant la chute, la profondeur défile, le monde s’assombrit, le krill laisse des bulles. Le score n’augmente qu’à l’arrivée, quand le palier (Plancton, Trop malin, Banc, Rare, Coupe profonde, Un sur un krillion) s’affiche.
6. **Descendre** : bandeau court (« descente · le chrono démarre dans N »), puis le prompt suivant à la profondeur actuelle — pas une deuxième chute.
7. Après 7 prompts : **bilan** de toutes les réponses, catalogues dépliables par rareté, puis **Nouvelle plongée** ou **Surface**.

Les stats (nombre de plongées, meilleure profondeur, mute) restent dans `localStorage`.

## Déployer sur Vercel

1. Pousse le dépôt vers GitHub / GitLab / Bitbucket.
2. Sur [vercel.com](https://vercel.com) : **Add New… → Project** et importe le repo.
3. Framework preset : **Next.js** (détecté automatiquement).
4. Build command : `npm run build` · Output : `.next` · Install : `npm install`.
5. Aucune variable d’environnement n’est requise.

En CLI :

```bash
npx vercel
```

## Contenu

Plus de 150 prompts (géographie, histoire, sciences, arts, sport, cuisine, quotidien). Les catégories ouvertes (pays, villes, animaux, départements) ont souvent 30 à 80 réponses, du plancton jusqu’à un sur un krillion.

La banque éditable est `lib/data/bank.json` (copiée vers `public/bank.json` pour le jeu en local). En production le catalogue est aussi chargé depuis le dépôt public `GRatierODU/krillion-prompts` si le fichier local n’est pas déployé.

Après un changement :

```bash
python3 scripts/pack-bank.py
```
