# Contribuie la WhatsNode.js

Îți mulțumim pentru interesul de a contribui la WhatsNode.js! Suntem deschiși la contribuții și apreciem efortul tău de a îmbunătăți acest proiect.

## Cum să contribui

### Raportarea bug-urilor

Dacă găsești un bug în WhatsNode.js, te rugăm să deschizi un issue pe GitHub cu următoarele informații:

1. Un titlu clar și descriptiv
2. Pași detaliați pentru a reproduce problema
3. Comportamentul așteptat vs comportamentul observat
4. Screenshot-uri sau înregistrări video (dacă este posibil)
5. Orice alte informații relevante (versiune Node.js, sistem de operare, etc.)

### Solicitarea de funcționalități noi

Dacă ai o idee pentru o funcționalitate nouă, deschide un issue etichetat ca "feature request" și descrie:

1. Funcționalitatea pe care ți-o dorești
2. De ce ar fi utilă pentru proiect
3. Cum ar trebui să funcționeze

### Trimiterea de Pull Requests

1. Bifurcă repository-ul
2. Creează o ramură pentru modificările tale (`git checkout -b feature/amazing-feature`)
3. Fă modificările dorite
4. Asigură-te că codul tău respectă stilul de cod existent
5. Rulează testele existente și adaugă teste noi dacă este necesar
6. Validează că toate testele trec
7. Commit modificările (`git commit -m 'Add some amazing feature'`)
8. Push la ramura ta (`git push origin feature/amazing-feature`)
9. Deschide un Pull Request

## Convenții de cod

- Folosim TypeScript pentru tipare strictă
- Adaugă comentarii JSDoc pentru toate funcțiile și clasele publice
- Indentarea se face cu 2 spații
- Utilizăm ES6+ features când este posibil
- Fiecare fișier ar trebui să aibă un comentariu de header care descrie scopul său

## Rularea testelor

```bash
npm test
```

## Set up Development Environment

1. Clonează repository-ul
2. Instalează dependențele: `npm install`
3. Construiește proiectul: `npm run build`
4. Rulează exemplele: `npm run examples`

## Structura proiectului

- `/src` - Codul sursă
  - `/lib` - Biblioteca principală WhatsNode
  - `/types` - Definiții de tipuri TypeScript
  - `/utils` - Utilități comune
- `/examples` - Exemple de utilizare
- `/tests` - Teste unitare și de integrare

## Licență

Prin contribuția la WhatsNode.js, ești de acord ca modificările tale să fie licențiate sub aceeași [Licență MIT](LICENSE) care acoperă întregul proiect.

---

Mulțumim pentru contribuțiile tale la WhatsNode.js!