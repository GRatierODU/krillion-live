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
5. **Plonger** (réponse valide) : le cartel apparaît et le monde descend lentement (~2 s) — l’eau s’assombrit, le bateau quitte le cadre, la profondeur défile. Le palier (Plancton, Trop malin, Banc, Rare, Coupe profonde, Un sur un krillion) s’affiche seulement à l’arrivée, puis le score.
6. **Descendre** : la caméra remonte calmement à la surface (sans chrono), pause d’une seconde, puis le prompt suivant à 0 m — le chrono ne reprend qu’alors.
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

**654** prompts (géographie, histoire, sciences, arts, sport, cuisine, quotidien). Mix champion : culture G FR, pop dense (Marvel/DC, cinéma, séries, jeux, musique, anime), géo à question nette, plus les motifs Krillion (lettres, voisins, capitales). Catalogues denses : **~31 réponses en moyenne**, souvent 40–150 sur les listes ouvertes. Anti-répétition : les **175** derniers IDs restent en `localStorage` (~ 2–3 jours à 10 plongées). Au bilan, les paliers vont du plus rare (Un sur un krillion) au plancton.

La banque éditable est `lib/data/bank.json`. Elle est compressée en gzip puis découpée en petits modules TypeScript (`lib/data/chunks/`) pour passer les limites d’upload. En production le jeu charge ce bundle ; `GET /api/catalog` renvoie les 654 prompts, `GET /api/catalog?meta=1` renvoie `{ count, ids }`.

Après un changement :

```bash
python3 scripts/expand-pop.py   # vague pop / superhéros
python3 scripts/pack-bank.py
```
