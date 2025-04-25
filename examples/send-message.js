/**
 * WhatsNode.js - Script pentru trimiterea mesajelor pe WhatsApp
 * 
 * Acest script demonstrează cum să folosești WhatsNode.js pentru a trimite
 * un mesaj text către un număr specificat de telefon.
 * 
 * Utilizare: node send-message.js <număr_telefon> <mesaj>
 * Exemplu: node send-message.js 40722123456 "Salut, acesta este un test!"
 */

const { createClient } = require('whatsnode-js');
const fs = require('fs');
const path = require('path');

// Verifică argumentele
if (process.argv.length < 4) {
  console.log('Utilizare: node send-message.js <număr_telefon> <mesaj>');
  console.log('Exemplu: node send-message.js 40722123456 "Salut, acesta este un test!"');
  process.exit(1);
}

// Citește numărul de telefon și mesajul din argumentele liniei de comandă
const phoneNumber = process.argv[2];
const message = process.argv[3];

// Configurare client WhatsNode
const client = createClient({
  authStrategy: 'qr',
  sessionPath: path.join(__dirname, '../whatsnode_session'),
  autoReconnect: true,
  debug: true
});

console.log(`Se va trimite mesajul: "${message}" către numărul: ${phoneNumber}`);

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

client.on('ready', async () => {
  console.log('Client WhatsNode conectat și gata de utilizare!');
  
  try {
    // Formatează numărul pentru WhatsApp
    const whatsappId = `${phoneNumber}@s.whatsapp.net`;
    
    // Trimite mesajul
    console.log(`Se trimite mesaj către ${whatsappId}...`);
    await client.sendMessage(whatsappId, message);
    console.log('Mesaj trimis cu succes!');
    
    // Deconectează clientul și ieși din program
    console.log('Se deconectează clientul...');
    await client.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Eroare la trimiterea mesajului:', error);
    await client.disconnect();
    process.exit(1);
  }
});

client.on('authenticated', () => {
  console.log('Autentificare reușită!');
});

client.on('auth_failure', async (error) => {
  console.error('Autentificare eșuată:', error);
  await client.disconnect();
  process.exit(1);
});

client.on('disconnected', (reason) => {
  console.log('Client deconectat:', reason);
  process.exit(0);
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
    process.exit(1);
  });