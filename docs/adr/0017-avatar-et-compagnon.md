# Avatar humain + compagnon animal : deux personnages distincts

Chaque membre a un avatar humain mignon (style Mii, en SVG) qui le représente, et un compagnon animal (l'écureuil Rikki) qui est le pet de cet avatar. La relation est : le membre → son avatar → son Rikki.

- L'avatar accomplit les micro-étapes. Quand le membre marque « Fait », c'est l'avatar qui fait le geste à l'écran, et Rikki en profite (il est content, il grandit).
- Les émotes (câlin, bisou, pat pat) s'envoient entre avatars humains, pas entre écureuils. C'est une interaction de couple.
- Rikki réagit aux actions de l'avatar : il joue autour de lui, dort à côté, etc.
- L'avatar est créé à l'onboarding avec un éditeur aussi simple que celui des Mii (forme du visage, coiffure, couleur de peau, yeux, quelques accessoires). Modifiable à tout moment.

## Conséquences

- Deux systèmes SVG à concevoir : l'avatar (modulaire, composé de pièces interchangeables) et le compagnon (un seul design qui évolue).
- L'éditeur d'avatar ajoute un écran à l'onboarding, mais c'est un moment ludique, pas une corvée — c'est la même mécanique que les Mii qui rendait l'expérience plaisante.
- L'onboarding devient : créer le foyer → inviter → créer son avatar → nommer son Rikki → c'est parti.
- L'écran principal montre les deux personnages : l'avatar et Rikki ensemble.
