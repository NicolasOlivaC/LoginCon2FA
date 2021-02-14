var express = require('express');
var router = express.Router();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode')
let autenticacion = require('../config/autenticacion');
const connection = require('../config/mysql');
const passport = require('passport');
const { isLoggedIn } = require('../config/autenticacion');



router.get('/crear2FA', autenticacion.isLoggedIn, (req, res) => {
  const user = req.user;
  const secreto = speakeasy.generateSecret({
    'name': `USUARIO APP NICOLAS: ${user[0].Username}`
  })
  connection.query('UPDATE users SET Estado2FA = ?, Secreto = ? WHERE Username = ?', [false, secreto.ascii, user[0].Username ], (error, resultado) => {
    if (error) {
      console.log(error)
    }
    else {
      qrcode.toDataURL(secreto.otpauth_url, (error, datos) => {
        res.render('qr_code', {
          data: `${datos}`
        })
      })
    }
  })

})

router.post('/comprobar', isLoggedIn, async (req, res) => {
  const user = req.user;
  const key = req.body
  connection.query('SELECT Username, Secreto, Password Estado2FA FROM users WHERE Username = ?', [user[0].Username], (error, usuario) => {
    if (error || usuario[0] == undefined) { //si encuentra un error o no encuentra usuario
      res.redirect('/index')
    }
    else {
      const verificar = speakeasy.totp.verify({
        secret: usuario[0].Secreto,
        encoding: 'ascii',
        token: key.password
      });
      if (verificar) {
        connection.query('UPDATE users SET Estado2FA = ? WHERE Username = ?', [true, user[0].Username], (error, resultado) => {
          if (error) {
            req.flash('succes', '2FA Error al implementar 2FA, vuelva a iniciar el proceso de Configuración para volver a utilizar su clave 2FA')
            res.redirect('/')
          }
          else {
            req.flash('succes', '2FA Configurado Correctamente')
            res.redirect('/logout')
          }
        })
      }
      else {
        req.flash('succes', '2FA Error al implementar 2FA, vuelva a iniciar el proceso de Configuración para volver a utilizar su clave 2FA')
        res.redirect('/')
      }
    }
  })
})

router.post('/validar', autenticacion.isNotLoggedIn, passport.authenticate('2FA', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))



module.exports = router;