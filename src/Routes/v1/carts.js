const express = require('express');
const mysql = require('mysql2/promise');

const { dbConfig } = require('../../config');
const { isLoggedIn } = require('../../middleware');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `SELECT id, image, title, price FROM carts WHERE users_id = ${mysql.escape(
        req.user.id,
      )} AND archived = 0`,
    );
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Data was not received' });
  }
});

router.post('/addProduct/:id', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `INSERT INTO carts (users_id, image, title, price) SELECT ${mysql.escape(
        req.user.id,
      )}, image, title, price FROM products WHERE products.id = ${
        req.params.id
      }`,
    );
    await con.end();
    return res.send({ msg: data });
  } catch (err) {
    return res.status(400).send({ err: 'data was not passed.' });
  }
});

router.post('/addSet/:id', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `INSERT INTO carts (users_id, image, title, price) SELECT ${mysql.escape(
        req.user.id,
      )}, image, title, price FROM sets WHERE sets.id = ${req.params.id}`,
    );
    await con.end();
    return res.send({ msg: data });
  } catch (err) {
    return res.status(400).send({ err: 'data was not passed.' });
  }
});

router.delete('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
        UPDATE carts SET archived = true WHERE id = ${req.params.id}`);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'data not deleted' });
  }
});

router.delete('/deletecart', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `DELETE FROM carts WHERE users_id = ${mysql.escape(
        req.user.id,
      )}`,
    );
    await con.end();
    return res.send({ msg: data });
  } catch (err) {
    return res.status(500).send({ err: 'data was not deleted' });
  }
});

module.exports = router;
