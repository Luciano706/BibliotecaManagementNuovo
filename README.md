# Gestione Biblioteche - Web App

## Descrizione

Questa applicazione web e mobile è stata sviluppata come progetto per il corso di "Programmazione Web e Mobile". Si tratta di un sistema di gestione per una catena di biblioteche con più sedi, progettato per essere utilizzato da diverse tipologie di utenti con ruoli e permessi specifici: Amministratore, Bibliotecario e Utente.

L'applicazione consente agli utenti di cercare libri all'interno del catalogo, richiederli in prestito o prenotarli. I bibliotecari e gli amministratori hanno funzionalità aggiuntive per la gestione dell'inventario, come l'aggiunta di nuove copie di libri esistenti o l'inserimento di nuovi titoli nel catalogo.

L'architettura del progetto si basa su un'applicazione frontend sviluppata con il framework **Ionic**, che comunica con un backend basato su **Flask**. Il backend espone una serie di API REST ed è containerizzato tramite **Docker** per garantire una maggiore portabilità e facilità di deployment.

## Funzionalità

### Utente Semplice
*   **Ricerca libri:** Cerca libri nel catalogo per titolo, autore o genere.
*   **Visualizzazione dettagli:** Accedi alla scheda dettagliata di un libro per vedere la trama, l'autore e le copie disponibili nelle varie sedi.
*   **Prestito:** Richiedi in prestito una copia di un libro disponibile in una determinata biblioteca.
*   **Prenotazione:** Prenota un libro nel caso in cui non ci siano copie disponibili per il prestito.
*   **Visualizzazione prestiti:** Tieni traccia dei libri presi in prestito e della data di scadenza.

### Bibliotecario
*   **Gestione prestiti:** Registra la consegna e la restituzione dei libri da parte degli utenti.
*   **Aggiunta copie:** Aggiungi nuove copie di un libro già presente nel catalogo a una specifica biblioteca.
*   **Gestione inventario di sede:** Visualizza e gestisci l'inventario dei libri della propria biblioteca.

### Amministratore (Admin)
*   **Gestione libri:** Aggiungi nuovi libri al catalogo centrale, modificane i dettagli o rimuovili.
*   **Gestione biblioteche:** Aggiungi nuove sedi della biblioteca al sistema.
*   **Gestione utenti:** Crea, modifica o elimina gli account dei bibliotecari e degli utenti.
*   **Dashboard generale:** Visualizza statistiche sull'andamento dei prestiti e sulla disponibilità dei libri in tutte le sedi.

## Tecnologie Utilizzate

### Frontend
*   **Ionic:** Framework per lo sviluppo di applicazioni cross-platform (iOS, Android, Web) a partire da un'unica codebase.
*   **Angular:** Framework su cui si basa Ionic per la creazione dell'interfaccia utente.
*   **HTML5, CSS3, TypeScript:** Tecnologie standard per lo sviluppo web.

### Backend
*   **Flask:** Micro-framework Python per la creazione di API RESTful.
*   **Python:** Linguaggio di programmazione utilizzato per il backend.

### Database & Deployment
*   **Docker:** Piattaforma per la containerizzazione del backend, che permette di eseguire l'applicazione in un ambiente isolato e consistente.
*   **SQLite:** (o specificare il database utilizzato, es. PostgreSQL, MySQL) Database relazionale per la persistenza dei dati.

## Architettura del Sistema

L'applicazione segue un'architettura client-server:

*   **Client (Frontend):** L'applicazione Ionic agisce da client e viene eseguita sul dispositivo dell'utente (browser web o dispositivo mobile).
*   **Server (Backend):** Il server Flask, in esecuzione all'interno di un container Docker, espone le API necessarie al frontend per interagire con il database e la logica di business.

Questa separazione permette di sviluppare e mantenere le due parti dell'applicazione in modo indipendente.

## Team di Sviluppo

*   **Luciano Allegra**
*   **Francesco Patti**
*   **Gabriele De Biasio**
