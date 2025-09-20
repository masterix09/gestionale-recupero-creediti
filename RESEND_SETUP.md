# Configurazione Resend per Richieste Dati

## Setup Resend

1. **Registrati su Resend**: Vai su [resend.com](https://resend.com) e crea un account

2. **Ottieni API Key**:

   - Vai nella sezione "API Keys" del dashboard
   - Crea una nuova API key
   - Copia la chiave API

3. **Configura variabili d'ambiente**:
   Aggiungi al tuo file `.env.local`:

   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

4. **Verifica dominio** (opzionale ma raccomandato):
   - Aggiungi il dominio `osint.it` in Resend
   - Configura i record DNS richiesti
   - Una volta verificato, puoi usare `noreply@osint.it` come mittente

## Funzionalità Implementate

### API Route: `/api/request-data`

- **Metodo**: POST
- **Autenticazione**: Richiede sessione utente valida
- **Parametri**:
  - `category`: Categoria dei dati richiesti
  - `cf`: Codice fiscale

### Email Template

L'email inviata a `info@osint.it` include:

- Dettagli utente (email, nome)
- Categoria richiesta
- Codice fiscale
- Data e ora della richiesta
- Template HTML responsive

### Componente NoDataMessage

- Mostra messaggio quando non ci sono dati
- Pulsante "Richiedi Dati" con stato di caricamento
- Feedback visivo per successo/errore
- Icone intuitive (Mail, Loader2)

## Test

Per testare il sistema:

1. Assicurati che `RESEND_API_KEY` sia configurata
2. Vai su una categoria senza dati
3. Clicca "Richiedi Dati"
4. Verifica che l'email arrivi a `info@osint.it`

## Note di Sicurezza

- L'API route verifica l'autenticazione dell'utente
- I dati sensibili (CF) sono inclusi solo nell'email
- Nessun dato viene memorizzato permanentemente
- Rate limiting può essere aggiunto se necessario
