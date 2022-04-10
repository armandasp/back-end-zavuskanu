const express = require('express');
const Joi = require('joi');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.API_KEY);

const router = express.Router();

const emailSchema = Joi.object({
  products: Joi.array().items(Joi.string()).required(),
  totalPrice: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  phone: Joi.string().lowercase().trim().required(),
  address: Joi.string().trim().required(),
  email: Joi.string().lowercase().trim().required(),
});

const sendEmail = (to, from, subject, text) => {
  const msg = {
    to,
    from,
    subject,
    html: text,
  };

  sgMail.send(msg, (err, res) => {
    if (err) {
      console.log('email not sent');
    } else {
      console.log('email was sent');
    }
  });
};
router.get('/', (req, res) => {
  res.send('veikia');
});

router.post('/sendEmail', async (req, res) => {
  let userInputs = req.body;
  try {
    userInputs = await emailSchema.validateAsync(userInputs);
  } catch (err) {
    return res.status(400).send({ err: 'Inccorect data passed. Try again.' });
  }
  try {
    const to = 'zavuskanutest@gmail.com';
    const from = 'ziezdriote@gmail.com';
    const subject = 'Naujas užsakymas';

    const output = `
      <h2>Turite naują užsakymą</h2>
      <p>Kliento duomenys:</p>
      <ul>
          <li>${userInputs.name}</li>
          <li>${userInputs.phone}</li>
          <li>${userInputs.address}</li>
          <li>${userInputs.email}</li>
      </ul>
      <p>Užsakymo duomenys:</p>
      <ul>
          <li>${userInputs.products}</li>
          <li>Bendra suma: ${userInputs.totalPrice}</li> 
      </ul>
    `;
    sendEmail(to, from, subject, output);
    return res.send({
      msg: 'užklausa išsiusta. Susisieksime su jumis, kai paruošime užsakymą.',
    });
  } catch (err) {
    return res
      .status(500)
      .send({ err: 'Išsiusti nepavyko. Bandykite dar kartą.' });
  }
});

module.exports = router;
