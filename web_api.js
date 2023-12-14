const express = require('express');

class WebAPI {
    constructor(client, nconf) {
        this.client = client;
        this.nconf = nconf;
        this.app = express();

        this.app.use(express.json());

        this.app.use((req, res, next) => {
            const apiKey = req.headers['x-api-key'];
            if (apiKey === this.nconf.get("API_KEY")) {
                next();
            } else {
                res.status(401).send({ "error": "Unauthorized" });
            }
        });

        this.app.post('/message', async (req, res) => {
            const { message, recipient } = req.body;
            this.client.getChatById(recipient)
                .then(chat => chat.sendMessage(message))
                .then(message => res.send(message.id))
                .catch(error => res.send({ "error": error.message.split("\n")[0] }));
        });
        this.app.get('/', (req, res) => {
            try {
                res.send(this.client.info);
            }
            catch (err) {
                console.error(err);
                res.send({ "error": err.message.split("\n")[0] });
            }
        });
        const api_port = nconf.get("API_PORT");
        this.app.listen(api_port, () => {
            console.log(`API listening on port ${api_port}`);
        });
    }
}

module.exports = {
    WebAPI: WebAPI,
};