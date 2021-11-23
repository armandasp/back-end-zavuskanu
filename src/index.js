const express = require('express');
const cors = require('cors');

const { port } = require('./config');

const auth = require('./Routes/v1/auth');
const products = require('./Routes/v1/products');
const sets = require('./Routes/v1/sets');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/v1/auth', auth);
app.use('/v1/list', products);
app.use('/v1/sets', sets);

app.get('/', (req, res) => {
  res.send({ msg: 'Server is working succesfully' });
});

app.all('*', (req, res) => {
  res.status(400).send({ err: 'Page not found' });
});

app.listen(port, console.log(`Server is running on port ${port}`));
