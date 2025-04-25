/**
 * WhatsNode.js - Exemplu de utilizare de bază
 * 
 * Acest exemplu demonstrează cum să folosești WhatsNode.js pentru a crea
 * un client WhatsApp Web simplu care răspunde la anumite comenzi.
 */

import { createClient } from '../client/src/lib/whatsnode';

// Creează un nou client WhatsNode
const client = createClient({
  authStrategy: 'qr', // 'qr' sau 'association-code'
  debug: true,        // afișează mesaje de debug
  autoReconnect: true // reconectare automată în caz de deconectare
});

// Eveniment emis când este generat un cod QR pentru autentificare
client.on('qr', (qrCode: string) => {
  console.log('Scanează acest cod QR cu aplicația WhatsApp de pe telefonul tău:');
  console.log(qrCode);
  
  // În aplicații reale, ai putea afișa codul QR într-o interfață web
  // sau îl poți salva ca imagine utilizând biblioteca 'qrcode-terminal'
});

// Eveniment emis când conexiunea este deschisă
client.on('open', () => {
  console.log('Conexiune deschisă cu serverele WhatsApp Web');
});

// Eveniment emis când autentificarea este reușită
client.on('authenticated', () => {
  console.log('Autentificare reușită!');
});

// Eveniment emis când clientul este gata de utilizare
client.on('ready', () => {
  console.log('Client gata de utilizare!');
  console.log('Acum poți trimite și primi mesaje');
});

// Eveniment emis când se primește un mesaj nou
client.on('message', async (message: any) => {
  console.log(`Mesaj primit de la ${message.from}: ${message.body}`);
  
  // Implementăm un sistem simplu de comenzi
  if (message.body.startsWith('!')) {
    const command = message.body.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'ping':
        await client.sendMessage(message.from, 'pong');
        break;
        
      case 'salut':
        await client.sendMessage(message.from, `Salut, ${message.pushName || 'utilizatorule'}! Cum te pot ajuta?`);
        break;
        
      case 'echo':
        const content = message.body.slice(6); // Eliminăm "!echo "
        await client.sendMessage(message.from, content || 'Nu ai specificat niciun text pentru echo');
        break;
        
      case 'ajutor':
        const helpMessage = `
*Comenzi disponibile:*
!ping - Verifică dacă botul este activ
!salut - Primește un salut personalizat
!echo [text] - Botul va repeta textul tău
!ajutor - Afișează acest mesaj de ajutor
        `.trim();
        await client.sendMessage(message.from, helpMessage);
        break;
        
      default:
        await client.sendMessage(message.from, `Comandă necunoscută: ${command}. Încearcă !ajutor pentru a vedea comenzile disponibile.`);
    }
  }
});

// Eveniment emis când conexiunea este închisă
client.on('close', () => {
  console.log('Conexiunea cu WhatsApp Web a fost închisă');
});

// Eveniment emis în caz de eroare
client.on('error', (error: Error) => {
  console.error('A apărut o eroare:', error);
});

// Conectare la WhatsApp Web
client.connect()
  .then(() => {
    console.log('Proces de conectare inițiat');
  })
  .catch((error: Error) => {
    console.error('Eroare la inițierea conectării:', error);
  });

// Ascultăm semnalele de oprire pentru a închide conexiunea în mod corespunzător
process.on('SIGINT', async () => {
  console.log('Închidere conexiune...');
  await client.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Închidere conexiune...');
  await client.disconnect();
  process.exit(0);
});