const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');

const { dbConfig } = require('../../config');

const router = express.Router();

const setSchema = Joi.object({
  image: Joi.string().trim().required(),
  title: Joi.string().trim().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().trim().required(),
});

router.get('/', (req, res) => {
  res.send({ msg: 'sets works' });
});

router.get('/sets', async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute('SELECT * FROM sets');
    await con.end();
    res.send(data);
  } catch (err) {
    res.status(500).send({ err: 'Data was not passed' });
  }
});

router.post('/sets', async (req, res) => {
  let userInputs = req.body;
  try {
    userInputs = await setSchema.validateAsync(userInputs);
  } catch (err) {
    return res.status(400).send({ err: 'Inccorect data passed. Try again.' });
  }

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `INSERT INTO sets (image, title, price, description) VALUES (${mysql.escape(
        userInputs.image,
      )}, ${mysql.escape(userInputs.title)}, ${mysql.escape(
        userInputs.price,
      )}, ${mysql.escape(userInputs.description)})`,
    );
    await con.end();
    return res.send({ msg: data });
  } catch (err) {
    return res.status(500).send({ err: 'data was not passed' });
  }
});

module.exports = router;
