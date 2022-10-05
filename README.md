# PoliMi WA Bot

Un bot *utilissimo* per tutti gli amiœ di Informatica 2022-*2025* (si spera almeno). Basato (basato) su [whatsapp-web.js](https://wwebjs.dev/).

Pull request con funzioni o anche minchiate inutili sono benvenute al progetto!

## Installazione

Sono richiesti Node.js (versione minima: ) ed `npm` sul sistema. Se sei su un sistema senza interfaccia grafica/headless (ad esempio un Linux Server), devi prima installare [alcuni pacchetti](https://wwebjs.dev/guide/#installation-on-no-gui-systems) — esempio per Ubuntu Linux:

```sh
sudo apt update
sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

Puoi procedere dunque a clonare il repo e installare le dipendenze con `npm`

```sh
git clone TheManchineel/polimi-wabot
cd polimi-wabot
npm install
```

Devi copiare il file `example-data.json` con nome `data.json` ed impostare alcuni parametri:

```sh
cp example-data.json data-json
vim data.json
```

In particolare:
  * Una volta identificato l'ID delle chat/gruppi in cui intendi usarlo dai log dopo il primo avvio, inserisci tale ID nell'array `"CHAT_WHITELIST"`. Se il campo è vuoto, tutti i gruppi possono usare il bot (devi creare un gruppo per il testing, non puoi usare la chat diretta!)
  * Aggiusta `"COMMAND_PREFIX"` per non entrare in conflitto con altri bot
  * In `"groups"`, crea i gruppi desiderati (usa il modello esistente EXAMPLE). I nomi dei gruppi devono essere in MAIUSCOLO!

Infine, aggiusta i permessi su `start.sh` ed eseguilo per avviare il server:

```sh
chmod +x ./start.sh
. start.sh
```

Nel terminale dovrebbe apparire un QR code da scannerizzare con il tuo telefono usando WhatsApp Web. Attendi il messaggio `Client is ready!`, e procedi ad aggiungere il numero del bot ai gruppi in cui lo vuoi usare. Puoi vedere il `wid` delle chat con i messaggi in arrivo (es. `120363046745856669@g.us`) e aggiungerle come stringhe in `"CHAT_WHITELIST"` sul file di configurazione.

Esempio di setup per uso come daemon (SystemD):

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