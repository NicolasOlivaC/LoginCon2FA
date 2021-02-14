const express = require('express');
const router = express.Router();
const autenticacion = require('../config/autenticacion')


router.get('/', autenticacion.isLoggedIn, function (req, res) {
  res.render('index', {
    "mensaje": `Bienvenido ${req.user[0].Username}`,
  });
});

module.exports = router;
