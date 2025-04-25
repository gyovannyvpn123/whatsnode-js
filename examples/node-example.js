/**
 * WhatsNode.js - Exemplu de utilizare în Node.js
 * 
 * Acest exemplu demonstrează cum să folosești WhatsNode.js în mediul Node.js
 * pentru a crea un bot simplu de WhatsApp.
 * 
 * Înainte de a executa acest exemplu, asigură-te că ai instalat pachetul ws:
 * npm install ws
 */

const { createClient } = require('whatsnode-js');
const fs = require('fs');
const path = require('path');

// Configurare client WhatsNode
const client = createClient({
  authStrategy: 'qr', // Folosim autentificarea prin cod QR
  sessionPath: path.join(__dirname, '../whatsnode_session'),
  autoReconnect: true,
  debug: true // Activează logarea pentru depanare
});

// Directorul pentru salvarea codului QR generat
const qrDir = path.join(__dirname, 'qr');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir);
}

// Handler-e pentru evenimente
client.on('qr', (qrCode) => {
  console.log('Cod QR primit! Salvez imaginea...');
  
  // Dacă QR code este un data URL, salvăm imaginea
  if (qrCode.startsWith('data:image/png;base64,')) {
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
    const qrPath = path.join(qrDir, 'qr-code.png');
    
    fs.writeFileSync(qrPath, base64Data, 'base64');
    console.log(`Cod QR salvat la ${qrPath}`);
    console.log('Scanează codul QR cu aplicația WhatsApp de pe telefonul tău.');
  } else {
    console.log('Cod QR primitiv:', qrCode);
  }
});

client.on('ready', () => {
  console.log('Client WhatsNode conectat și gata de utilizare!');
  
  // Exemplu: Trimite un mesaj la un număr specific după conectare
  // Înlocuiește cu un număr real de telefon în format internațional (fără +)
  // const to = '40722123456@s.whatsapp.net'; 
  // client.sendMessage(to, 'Salut! Acesta este un mesaj automat trimis prin WhatsNode.js!');
});

client.on('authenticated', () => {
  console.log('Autentificare reușită!');
});

client.on('auth_failure', (error) => {
  console.error('Autentificare eșuată:', error);
});

client.on('disconnected', (reason) => {
  console.log('Client deconectat:', reason);
});

client.on('message', (message) => {
  console.log('Mesaj primit:', message);
  
  // Răspunde la mesaje specifice
  if (message.body === 'Ping') {
    client.sendMessage(message.from, 'Pong');
  } else if (message.body === 'Cine ești?') {
    client.sendMessage(message.from, 'Sunt un bot creat cu WhatsNode.js!');
  } else if (message.body === 'Help') {
    client.sendMessage(message.from, 
      'Comenzi disponibile:\n' +
      'Ping - Verifică dacă botul este activ\n' +
      'Cine ești? - Află informații despre bot\n' +
      'Help - Afișează acest mesaj de ajutor'
    );
  }
});

// Procesare evenimente de închidere pentru a deconecta clientul în mod corespunzător
process.on('SIGINT', async () => {
  console.log('Închidere aplicație, deconectare...');
  await client.disconnect();
  process.exit(0);
});

// Pornește clientul
console.log('Se inițializează clientul WhatsNode...');
client.connect()
  .catch(error => {
    console.error('Eroare la inițializarea clientului:', error);
  });