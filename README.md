# PoliMi WA Bot

Un bot *utilissimo* per tutti gli amiœ di Informatica 2022-*2025* (si spera almeno). Basato (basato) su [whatsapp-web.js](https://wwebjs.dev/).

Pull request con funzioni o anche minchiate inutili sono benvenute al progetto!

## Installazione (Manuale)

**NOTA:** è consigliato usare Docker per l'installazione. Vedi [Installazione (Docker)](#installazione-docker).

Per l'installazione manuale sono richiesti Node.js (v18+), [Google Chrome](https://www.google.com/chrome/) (*NON* Chromium), [`ffmpeg`](https://ffmpeg.org/) ed [`npm`](https://www.npmjs.com/) sul sistema. Se sei su un sistema senza interfaccia grafica/headless (ad esempio un Linux Server), devi prima installare [alcuni pacchetti](https://wwebjs.dev/guide/#installation-on-no-gui-systems) — esempio per Ubuntu Linux:

```shell
sudo apt update
sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

Puoi procedere dunque a clonare il repo e installare le dipendenze con `npm`

```sh
git clone https://github.com/titilda/polimi-wabot.git
cd polimi-wabot
npm install
```

Devi copiare il file `data.json.example` presente in `data` con il nome `data.json` ed impostare alcuni parametri:

```sh
cp data/data.json.example data/data.json
vim data/data.json
```

In particolare:
  * Una volta identificato l'ID delle chat/gruppi in cui intendi usarlo dai log dopo il primo avvio, inserisci tale ID nell'array `"CHAT_WHITELIST"`. Se il campo è vuoto, tutti i gruppi possono usare il bot (devi creare un gruppo per il testing, non puoi usare la chat diretta!)
  * Aggiusta `"COMMAND_PREFIX"` per non entrare in conflitto con altri bot
  * In `"groups"`, crea i gruppi desiderati (usa il modello esistente EXAMPLE). I nomi dei gruppi devono essere in MAIUSCOLO!
  * Inserisci il tuo numero di telefono preceduto dal prefisso internazionale senza spazi o simboli (es. `393333333333`) in `"BOT_ADMINS"` per avere accesso ai comandi di amministrazione

Infine, aggiusta i permessi su `start.sh` ed eseguilo per avviare il server:

```sh
chmod +x ./start.sh
. start.sh
```

Nel terminale dovrebbe apparire un QR code da scannerizzare con il tuo telefono usando WhatsApp Web. Attendi il messaggio `Client is ready!`, e procedi ad aggiungere il numero del bot ai gruppi in cui lo vuoi usare. Puoi vedere il `wid` delle chat con i messaggi in arrivo (es. `960323646540956661@g.us`) e aggiungerle come stringhe in `"CHAT_WHITELIST"` sul file di configurazione.

**NOTA:** senza Google Chrome installato, il bot proverà a usare Chromium. Chromium non supporta l'elaborazione di video (vedi [qui](https://wwebjs.dev/guide/handling-attachments.html#caveat-for-sending-videos-and-gifs)), peranto compariranno dei messaggi di errore se si tentano di eseguire comandi su video.

### Esempio di setup per uso come daemon (SystemD):

```ini
[Unit]
Description = PoliMi WhatsApp Bot
After = network.target

[Service]
User = user
ExecStart = /home/user/polimi-wabot/start.sh
WorkingDirectory = /home/user/polimi-wabot/

[Install]
WantedBy = default.target
```

## Installazione (Docker)

Puoi installare il bot facilmente usando Docker. Per prima cosa, crea una cartella per i dati persistenti:

```sh
mkdir -p /path/to/data/
```

Crea un file `data.json` come descritto nella sezione [Installazione (Manuale)](#installazione-manuale) ([link al template](data/data.json.example)) e copialo nella cartella dei dati persistenti.

Infine esegui il container:

```sh
docker run -d
    --name polimi-wabot \ 
    -v /path/to/data/:/app/data \
    -e NODE_ENV=production \
    --restart unless-stopped \
    titilda/polimi-wabot
```

Consigliamo di usare Docker Compose anziché il comando `docker run` in produzione.

Puoi creare un file `docker-compose.yml` nella cartella dei dati persistenti.

Esempio di `docker-compose.yml`:
```yaml
version: "3.9"
services:
  polimi-wabot:
    container_name: polimi-wabot
    image: titilda/polimi-wabot
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - /path/to/data/:/app/data
```

Dopodiché puoi eseguire il container con `docker-compose up -d`.