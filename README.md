# WhatsNode.js

![WhatsNode.js Logo](https://img.shields.io/badge/WhatsNode-JS-brightgreen)
![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

**O bibliotecă JavaScript robustă pentru interacțiunea cu WhatsApp Web**

WhatsNode.js este o bibliotecă complet funcțională care permite dezvoltatorilor să creeze roboți WhatsApp și aplicații automatizate folosind JavaScript/TypeScript. Biblioteca se conectează direct la serverele oficiale WhatsApp Web și implementează protocoalele necesare pentru autentificare și comunicare.

## Caracteristici

- ✅ **Conectare directă la WhatsApp Web** - Folosește WebSocket pentru a comunica direct cu serverele WhatsApp
- ✅ **Autentificare multiplă** - Suport pentru scanare cod QR și cod de asociere
- ✅ **API Complet** - Trimitere și primire de mesaje, imagini, video, audio, documente, locații
- ✅ **Gestionare Grupuri** - Creare grupuri, adăugare/eliminare participanți, promovare/retrogradare administratori
- ✅ **Gestionare Sesiuni** - Salvare și restaurare sesiuni pentru conectare rapidă
- ✅ **Sigur și Fiabil** - Implementare robustă bazată pe principiile Baileys.js
- ✅ **Complet Tipizat** - Suport TypeScript complet cu definiții de tip pentru toate funcțiile

## Instalare

```bash
npm install whatsnode-js
```

## Utilizare Rapidă

```javascript
import { createClient } from 'whatsnode-js';

// Creează un client WhatsNode
const client = createClient({
  authStrategy: 'qr', // sau 'association-code'
  debug: true
});

// Ascultă evenimentul de primire cod QR
client.on('qr', (qr) => {
  console.log('Scanează codul QR:', qr);
});

// Ascultă evenimentul de autentificare reușită
client.on('authenticated', () => {
  console.log('Autentificare reușită!');
});

// Ascultă evenimentul ready
client.on('ready', () => {
  console.log('Client gata de utilizare!');
  
  // Trimite un mesaj
  client.sendMessage('123456789@c.us', 'Salut de la WhatsNode.js!');
});

// Ascultă mesaje noi
client.on('message', (message) => {
  console.log(`Mesaj nou de la ${message.from}: ${message.body}`);
  
  // Răspunde la mesaje
  if (message.body === '!ping') {
    client.sendMessage(message.from, 'pong');
  }
});

// Conectează la WhatsApp
client.connect();
```

## Autentificare

### Utilizând Cod QR

```javascript
const client = createClient({ 
  authStrategy: 'qr' 
});

client.on('qr', (qr) => {
  // Afișează codul QR în terminal sau pe interfața web
  console.log('Scanează codul QR:', qr);
});

client.connect();
```

### Utilizând Cod de Asociere

```javascript
const client = createClient({ 
  authStrategy: 'association-code' 
});

// Solicită codul de asociere pentru un număr de telefon
await client.requestAssociationCode('4012345678');

// Autentifică-te cu codul primit pe telefon
await client.authenticateWithAssociationCode('1-2-3-4-5-6');
```

## Exemple Avansate

### Trimitere Imagine

```javascript
// Trimite o imagine locală
await client.sendImage('123456789@c.us', '/path/to/image.jpg', 'Descriere imagine');

// Trimite o imagine de la URL
await client.sendImageFromUrl('123456789@c.us', 'https://example.com/image.jpg', 'Descriere imagine');
```

### Creare Grup

```javascript
// Creează un grup nou cu participanți
const group = await client.createGroup('Nume Grup', ['123456789@c.us', '987654321@c.us']);

// Adaugă participanți la un grup
await client.addParticipants(group.id, ['111111111@c.us']);

// Promovează participanți la admin
await client.promoteParticipants(group.id, ['123456789@c.us']);
```

## Documentație API Completă

Pentru documentația API completă, consultați [documentația completă](https://github.com/gyovannyvpn123/whatsnode-js/wiki).

## Comparație cu Alternative

| Funcționalitate | WhatsNode.js | Baileys | Whatsapp-web.js |
|----------------|:------------:|:-------:|:---------------:|
| Autentificare QR | ✅ | ✅ | ✅ |
| Autentificare Cod Asociere | ✅ | ❌ | ❌ |
| Suport TypeScript | ✅ | ✅ | ✅ |
| Gestionare Media | ✅ | ✅ | ✅ |
| Gestionare Grupuri | ✅ | ✅ | ✅ |
| Restaurare Sesiune | ✅ | ✅ | ✅ |
| Arhitectură Modulară | ✅ | ❌ | ❌ |
| Multi-device Support | ✅ | ✅ | ❌ |

## Licență

Acest proiect este licențiat sub [Licența MIT](LICENSE).

## Contribuții

Contribuțiile sunt binevenite! Vă rugăm să consultați [ghidul de contribuție](CONTRIBUTING.md) pentru mai multe detalii.

## Disclaimer

Acest proiect nu este afiliat, asociat, autorizat, aprobat de, sau în vreun fel conectat oficial cu WhatsApp sau oricare dintre subsidiarele sau afiliații săi. Site-ul oficial al WhatsApp poate fi găsit la https://whatsapp.com. "WhatsApp" precum și numele și mărcile asociate sunt mărci comerciale înregistrate ale proprietarilor respectivi.

---

Realizat cu ❤️ de [gyovannyvpn123](https://github.com/gyovannyvpn123)