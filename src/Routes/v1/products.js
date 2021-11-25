const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');

const { dbConfig } = require('../../config');
const { isLoggedIn } = require('../../middleware');

const router = express.Router();

const productSchema = Joi.object({
  image: Joi.string().trim().required(),
  title: Joi.string().trim().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().trim().required(),
  eatable: Joi.boolean().required(),
});

router.get('/', async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute('SELECT * FROM products WHERE archived = 0');
    await con.end();
    res.send(data);
  } catch (err) {
    res.status(500).send({ err: 'Data was not passed' });
  }
});

router.post('/products', isLoggedIn, async (req, res) => {
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

router.delete('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
        UPDATE products SET archived = true WHERE id = ${req.params.id}`);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'data not deleted' });
  }
});

module.exports = router;
