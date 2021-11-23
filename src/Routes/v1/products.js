const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');

const { dbConfig } = require('../../config');

const router = express.Router();

const productSchema = Joi.object({
  image: Joi.string().trim().required(),
  title: Joi.string().trim().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().trim().required(),
  eatable: Joi.boolean().required(),
});

router.get('/', (req, res) => {
  res.send({ msg: 'products works' });
});

router.get('/products', async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute('SELECT * FROM products');
    await con.end();
    res.send(data);
  } catch (err) {
    res.status(500).send({ err: 'Data was not passed' });
  }
});

router.post('/products', async (req, res) => {
  let userInputs = req.body;
  try {
    userInputs = await productSchema.validateAsync(userInputs);
  } catch (err) {
    return res.status(400).send({ err: 'Inccorect data passed. Try again.' });
  }

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `INSERT INTO products (image, title, price, description, eatable) VALUES (${mysql.escape(
        userInputs.image,
      )}, ${mysql.escape(userInputs.title)}, ${mysql.escape(
        userInputs.price,
      )}, ${mysql.escape(userInputs.description)}, ${mysql.escape(
        userInputs.eatable,
      )})`,
    );
    await con.end();
    return res.send({ msg: data });
  } catch (err) {
    return res.status(500).send({ err: 'data was not passed' });
  }
});

module.exports = router;
