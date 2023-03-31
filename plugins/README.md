# Plugins

Per creare plug-ins per il bot, è necessario creare file `.js` nella cartella `plugins/` che esportino un oggetto `commands` e/o un array `keywords`.

## Commands

L'oggetto `commands` ha la seguente struttura:

```js
{
    "nome_comando_1": {
        description: "Descrizione del comando",
        syntax: "nome_comando <argomento1> <argomento2> ... [opzione1] [opzione2] ...]",
        handler: async (client, message, args, nconf) => {
            // codice del comando
        }
    },
    "nome_comando_2": {
        // vedi sopra
    },
    // ...
}
```

- `client`: oggetto `Client` di `whatsapp-web.js`
- `message`: oggetto `Message` di `whatsapp-web.js`
- `args`: array di stringhe contenente gli argomenti del comando
- `nconf`: istanza di `nconf` per accedere alle configurazioni

## Keywords

L'array `keywords` ha la seguente struttura:

```js
[
    {
        regex: /regex/, // espressione regolare da trovare nel messaggio
        handler: async (client, message, matches, nconf) => {
            // codice della keyword
        }
    }
]
```

- `client`: oggetto `Client` di `whatsapp-web.js`
- `message`: oggetto `Message` di `whatsapp-web.js`
- `matches`: array di stringhe contenente i match dell'espressione regolare
- `nconf`: istanza di `nconf` per accedere alle configurazioni

## Differenza tra Commands e Keywords

I comandi sono operazioni che il bot esegue in risposta ad un messaggio che inizia con il prefisso impostato in `data.json`. I comandi possono avere argomenti e opzioni, e quando vengono eseguiti, il bot ignora eventuali match di `keywords` per il medesimo messaggio **(hanno priorità i comandi sulle keywords)**.

Le keywords sono espressioni regolari che il bot cerca nel messaggio. Ogni keyword trovata viene eseguita, quindi è possibile avere più keywords che matchano lo stesso messaggio. Se un messaggio contiene un comando, le keywords non vengono eseguite.