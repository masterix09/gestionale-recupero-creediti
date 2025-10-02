# Sistema di Notifiche per Admin

## Funzionalità Implementate

### 1. Database Schema
- Aggiunto modello `Notification` al database
- Campi: `id`, `userId`, `category`, `cf`, `message`, `isRead`, `createdAt`, `updatedAt`

### 2. API Endpoints

#### `/api/notifications` (GET)
- Ottiene tutte le notifiche non lette per gli admin
- Restituisce: `{ notifications: [], count: number }`

#### `/api/notifications` (PUT)
- Marca tutte le notifiche come lette
- Accessibile solo agli admin

### 3. Componenti

#### `NotificationBell`
- Campanella con badge del contatore
- Popup con lista notifiche
- Auto-refresh ogni 30 secondi
- Reset contatore quando si apre il popup

### 4. Logica di Business

#### Creazione Notifiche
- Quando un utente non-admin richiede dati tramite `NoDataMessage`
- L'API `/api/request-data` crea automaticamente una notifica
- Solo per utenti con ruolo diverso da "admin"

#### Visualizzazione
- Solo gli admin vedono la campanella nella navbar
- Badge rosso con numero di notifiche non lette
- Popup con lista completa delle notifiche

### 5. Flusso Utente

1. **Utente normale** richiede dati → Notifica creata
2. **Admin** vede badge rosso sulla campanella
3. **Admin** clicca campanella → Popup si apre + contatore si azzera
4. **Admin** può vedere tutte le notifiche e marcarle come lette

## File Modificati

- `prisma/schema.prisma` - Aggiunto modello Notification
- `app/api/request-data/route.ts` - Logica creazione notifiche
- `app/api/notifications/route.ts` - API per gestire notifiche
- `components/common/NotificationBell.tsx` - Componente campanella
- `components/common/Navbar.tsx` - Integrazione campanella
- `actions/notifications.ts` - Server actions per notifiche

## Test

Per testare il sistema:

1. **Login come utente normale**
2. **Vai su una categoria senza dati**
3. **Clicca "Richiedi Dati"**
4. **Login come admin**
5. **Verifica che appaia il badge rosso sulla campanella**
6. **Clicca la campanella per vedere le notifiche**

## Note Tecniche

- Polling automatico ogni 30 secondi
- Notifiche marcate come lette quando si apre il popup
- Sistema basato su database PostgreSQL
- Integrazione con sistema di autenticazione esistente
