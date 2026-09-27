# Numéro → מילים

Petit site statique qui chiffre un numéro de téléphone en mots hébreux, et le déchiffre.

- Chaque chiffre (0–9) et le `+` international ont **8 mots hébreux possibles** ; au chiffrement un mot est tiré au hasard, donc le même numéro produit un texte différent à chaque fois.
- **Déchiffrement** : collez les mots (séparés par espaces, virgules ou tirets, niqqud toléré) pour retrouver le numéro.
- **Clé secrète facultative** : elle mélange la répartition des mots entre les chiffres ; la même clé est nécessaire pour déchiffrer.
- Tout fonctionne dans le navigateur, sans serveur.

## Utilisation

Ouvrez `index.html` dans un navigateur, ou servez le dossier :

```sh
python3 -m http.server 8000
```

## Fichiers

- `cipher.js` — logique de chiffrement/déchiffrement (utilisable aussi sous Node).
- `app.js` — interface.
- `index.html`, `style.css` — page.
