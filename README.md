# README.md

## Budget Totale - App Spese Complete

App ibrida per gestire **spese quotidiane, spese fisse e spese famiglia** con grafici, salvataggio cloud (Firebase) e backup locale.

### Funzionalità
- Menu laterale (backup JSON, reset, esempio, sincronizzazione)
- Tre tipi spesa in una sola app con form dinamico
- Tabelle separate per categoria + grafico automatico
- Salvataggio automatico su localStorage
- Sincronizzazione su Firebase Firestore (opzionale)
- Pulsanti grandi, interfaccia bianca, nessuna animazione

### Installazione e uso
1. Scarica tutti i file: `index.html`, `style.css`, `script.js`, `firebase-config.js`, `example-data.json`.
2. Apri `index.html` con un browser (Chrome, Safari, Firefox).
3. Per usare Firebase:
   - Crea progetto su [Firebase Console](https://console.firebase.google.com)
   - Attiva Firestore Database in modalità test
   - Copia `firebaseConfig` in `firebase-config.js`
4. Personalizza categorie e membri famiglia modificando gli array in `script.js`.

### Struttura file
- `index.html` – struttura e CDN
- `style.css` – layout responsive, menu laterale, footer fisso
- `script.js` – tutta la logica, grafico Chart.js, gestione spese
- `firebase-config.js` – credenziali Firebase
- `example-data.json` – dati di esempio da importare

### Come usare su telefono
- Trasferisci i file su telefono (via cavo, cloud o server locale)
- Apri `index.html` con qualsiasi browser
- Usa il menu laterale (☰) per backup / sync / reset

### Sync Firebase
Premi "Sincronizza con Cloud" dopo aver configurato Firebase.  
Tutti i dati vengono salvati in un unico documento `spese_totali/backup_unico`.

### Personalizzazione
Modifica `firebase-config.js` con i tuoi dati per abilitare cloud.  
Sostituisci `Cibo, Trasporti...` nel form daily con le tue categorie preferite.

### Requisiti
Nessuna installazione, solo browser moderno con JavaScript attivo.