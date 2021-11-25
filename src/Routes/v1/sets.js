const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');

const { dbConfig } = require('../../config');
const { isLoggedIn } = require('../../middleware');

const setSchema = Joi.object({
  image: Joi.string().trim().required(),
  title: Joi.string().trim().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().trim().required(),
});

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute('SELECT * FROM sets WHERE archived = 0');
    await con.end();
    res.send(data);
  } catch (err) {
    res.status(500).send({ err: 'Data was not received' });
  }
});

router.post('/sets', isLoggedIn, async (req, res) => {
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

router.delete('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
        UPDATE sets SET archived = true WHERE id = ${req.params.id}`);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'data not deleted' });
  }
});

module.exports = router;
