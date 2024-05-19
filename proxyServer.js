const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/proxy', (req, res) => {
  const url = req.query.url;
  request(
    { url, encoding: null },
    (error, response, body) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.set(response.headers);
        res.send(body);
      }
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));