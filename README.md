# WhatsNode.js

O bibliotecă JavaScript robustă pentru interacțiunea cu WhatsApp Web. WhatsNode.js permite dezvoltatorilor să construiască boți de WhatsApp cu autentificare prin cod QR și cod de asociere.

## Instalare

### În browser
```bash
npm install whatsnode-js
```

### În Node.js
```bash
npm install whatsnode-js ws
```

## Caracteristici

- Autentificare prin cod QR sau cod de asociere
- Trimitere și primire de mesaje text
- Suport pentru media (imagini, video, documente, audio)
- Gestionare contacte și grupuri
- Conectivitate robustă și autoreconectare
- Salvarea și restaurarea sesiunilor

## Utilizare de bază

```javascript
const { createClient } = require('whatsnode-js');

// Creează un client WhatsNode
const client = createClient({
  authStrategy: 'qr', // sau 'association-code'
  sessionPath: './whatsnode_session',
  autoReconnect: true
});

// Gestionează evenimentele
client.on('qr', (qr) => {
  console.log('Scanează acest cod QR:', qr);
});

client.on('ready', () => {
  console.log('Client conectat și gata de utilizare!');
  
  // Trimite un mesaj
  client.sendMessage('40722123456@s.whatsapp.net', 'Salut de la WhatsNode.js!');
});

client.on('message', (message) => {
  console.log('Mesaj primit:', message.body);
  
  // Răspunde la mesaje
  if (message.body === 'Ping') {
    client.sendMessage(message.from, 'Pong');
  }
});

// Conectează clientul
client.connect();
```

## Autentificare prin cod de asociere

```javascript
const { createClient } = require('whatsnode-js');

const client = createClient({
  authStrategy: 'association-code',
  sessionPath: './whatsnode_session'
});

// Solicită un cod de asociere
client.requestAssociationCode('40722123456');

client.on('association_code_sending', (phoneNumber) => {
  console.log(`Codul de asociere a fost trimis la ${phoneNumber}`);
  
  // În aplicație, ai solicita utilizatorului să introducă codul
  const code = prompt('Introdu codul de 8 cifre primit pe WhatsApp:');
  
  // Autentifică cu codul introdus
  client.authenticateWithAssociationCode(code);
});

client.on('ready', () => {
  console.log('Client conectat și gata de utilizare!');
});

// Conectează clientul
client.connect();
```

## Utilizare în Node.js

Pentru a utiliza WhatsNode.js în Node.js, trebuie să instalezi pachetul `ws` pentru funcționalitatea WebSocket:

```bash
npm install whatsnode-js ws
```

### Exemplu Node.js

```javascript
const { createClient } = require('whatsnode-js');
const fs = require('fs');
const path = require('path');

// Configurare client WhatsNode
const client = createClient({
  authStrategy: 'qr',
  sessionPath: './whatsnode_session',
  autoReconnect: true,
  debug: true
});

// Salvăm codul QR ca imagine pentru a-l putea scana
client.on('qr', (qrCode) => {
  // Dacă QR code este un data URL, salvăm imaginea
  if (qrCode.startsWith('data:image/png;base64,')) {
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('qr-code.png', base64Data, 'base64');
    console.log('Cod QR salvat în qr-code.png');
    console.log('Scanează codul QR cu aplicația WhatsApp de pe telefonul tău.');
  }
});

client.on('ready', () => {
  console.log('Client conectat și gata de utilizare!');
  
  // Trimite un mesaj la un număr specific
  // client.sendMessage('40722123456@s.whatsapp.net', 'Salut!');
});

client.on('message', (message) => {
  console.log('Mesaj primit:', message.body);
  
  // Răspunde la mesaje
  if (message.body === 'Ping') {
    client.sendMessage(message.from, 'Pong');
  }
});

// Pornește clientul
client.connect().catch(err => console.error('Eroare:', err));
```

Un exemplu mai complex poate fi găsit în directorul `examples/` al pachetului.

## API

### Client

- `createClient(options)` - Creează un client WhatsNode
- `client.connect()` - Conectează clientul la WhatsApp Web
- `client.disconnect()` - Deconectează clientul
- `client.isClientConnected()` - Verifică dacă clientul este conectat
- `client.isClientReady()` - Verifică dacă clientul este gata de utilizare

### Mesaje

- `client.sendMessage(to, content)` - Trimite un mesaj text
- `client.sendImage(to, imagePath, caption)` - Trimite o imagine
- `client.sendImageFromUrl(to, url, caption)` - Trimite o imagine de la URL
- `client.sendVideo(to, videoPath, caption)` - Trimite un video
- `client.sendDocument(to, documentPath, filename)` - Trimite un document
- `client.sendLocation(to, latitude, longitude, name)` - Trimite o locație
- `client.sendContact(to, contactId)` - Trimite un contact

### Grupuri

- `client.createGroup(name, participants)` - Creează un grup
- `client.getGroup(groupId)` - Obține informații despre un grup
- `client.getGroups()` - Obține lista de grupuri
- `client.addParticipants(groupId, participants)` - Adaugă participanți în grup
- `client.removeParticipants(groupId, participants)` - Elimină participanți din grup
- `client.promoteParticipants(groupId, participants)` - Promovează participanți la admin
- `client.demoteParticipants(groupId, participants)` - Retrogradează participanți de la admin
- `client.getGroupInviteCode(groupId)` - Obține codul de invitație al grupului

### Contacte și chat-uri

- `client.getChat(chatId)` - Obține informații despre un chat
- `client.getChats()` - Obține lista de chat-uri
- `client.getContact(contactId)` - Obține informații despre un contact
- `client.getContacts()` - Obține lista de contacte

### Evenimente

- `client.on('qr', (qrCode) => {})` - Când se generează un cod QR
- `client.on('ready', () => {})` - Când clientul este gata de utilizare
- `client.on('authenticated', () => {})` - Când autentificarea a reușit
- `client.on('auth_failure', (error) => {})` - Când autentificarea a eșuat
- `client.on('disconnected', (reason) => {})` - Când conexiunea s-a închis
- `client.on('message', (message) => {})` - Când se primește un mesaj

## Licență

MIT