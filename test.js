const express = require('express');


app = express();

app.get("/", (req, res) => { try {res.send(undefined.hello)} catch { res.send("<html><body><marquee>FUCK OFFF</marquee></body></html>")} } );
app.listen(4000);

