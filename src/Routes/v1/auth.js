const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { jwtSecret, dbConfig } = require('../../config');

const router = express.Router();

const registerSchema = Joi.object({
  fullname: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(255).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(255).required(),
});

router.get('/', (req, res) => {
  res.send({ msg: 'auth work' });
});

router.post('/register', async (req, res) => {
  let userInputs = req.body;
  try {
    userInputs = await registerSchema.validateAsync(userInputs);
  } catch (err) {
    return res.status(400).send({ err: 'wrong data passed. Try again' });
  }

  const encryptedPassword = bcrypt.hashSync(userInputs.password);

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `INSERT INTO users (fullname, email, password) VALUES (${mysql.escape(
        userInputs.fullname,
      )}, ${mysql.escape(userInputs.email)}, '${encryptedPassword}')`,
    );
    await con.end();
    return res.send({ msg: data });
  } catch (err) {
    return res.status(400).send({ err: 'data was not passed.' });
  }
});

router.post('/login', async (req, res) => {
  let userInputs = req.body;
  try {
    userInputs = await loginSchema.validateAsync(userInputs);
  } catch (err) {
    return res.status(400).send({ err: 'wrong data passed. Try again.' });
  }

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `SELECT * FROM users WHERE email = ${mysql.escape(
        userInputs.email,
      )} LIMIT 1`,
    );
    await con.end();

    const answer = bcrypt.compareSync(userInputs.password, data[0].password);

    if (!answer) {
      return res.status(401).send({ err: 'Incorect email or password' });
    }
    const token = jwt.sign({ id: data[0].id, email: data[0].email }, jwtSecret);

    return res.send({ token });
  } catch (err) {
    return res.status(400).send({ err: 'data was not passed' });
  }
});

module.exports = router;
