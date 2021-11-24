const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');

const { dbConfig } = require('../../config');
const { isLoggedIn } = require('../../middleware');

const router = express.Router();

const commentSchema = Joi.object({
  comment: Joi.string().trim().required(),
});

router.get('/', (req, res) => {
  res.send({ msg: 'comments works' });
});

router.get('/comments', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      'SELECT comments.comment, users.fullname FROM comments LEFT JOIN users ON (comments.users_id = users.id) ',
    );
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Data was not passed.' });
  }
});

router.post('/add', isLoggedIn, async (req, res) => {
  let userInputs = req.body;
  try {
    userInputs = await commentSchema.validateAsync(userInputs);
  } catch (err) {
    return res
      .status(400)
      .send({ err: 'Incorrect data passed. Please try again.' });
  }

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `INSERT INTO comments (users_id, comment) VALUES ('${mysql.escape(
        req.user.id,
      )}', ${mysql.escape(userInputs.comment)})`,
    );
    await con.end();
    return res.send({ msg: data });
  } catch (err) {
    return res.status(500).send({ err: 'Data was not passed.' });
  }
});

module.exports = router;
