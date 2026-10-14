# AIART Studio — weboldal

Egyedi, fiatalos, interaktív és reszponzív bemutatkozó oldal egy mesterséges intelligenciával foglalkozó ügynökség számára.

## Funkciók

- **Interaktív hero** – egérre reagáló „neurális háló” canvas animáció, betűnként beúszó címsor
- **Görgetésre mozgó elemek** – parallax, felbukkanó szekciók, szavanként kivilágosodó manifesztó, idővonal-kitöltés
- **Vízszintes görgetésű szolgáltatás-sáv** (asztali nézetben rögzített, mobilon függőleges lista)
- **Görgetési sebességre reagáló futószalag** (marquee)
- **Élő demó** – promptból a böngészőben generált egyedi kép „diffúziós” animációval
- Egyedi kurzor, mágneses gombok, 3D-ben dőlő kártyák
- Animált GYIK, lebegő címkés kapcsolati űrlap validációval
- Teljesen reszponzív, és tiszteletben tartja a `prefers-reduced-motion` beállítást

## Technológia

Tiszta HTML + CSS + JavaScript — nincs build lépés és nincs függőség.

```
index.html
assets/
  css/style.css
  js/main.js
  favicon.svg
```

## Futtatás helyben

```bash
python3 -m http.server 8080
# majd: http://localhost:8080
```

Bármilyen statikus tárhelyre (GitHub Pages, Netlify, Vercel) közvetlenül feltölthető.
