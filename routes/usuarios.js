const express = require('express');
const router = express.Router();
const passport = require('passport')
let autenticacion = require('../config/autenticacion');
const connection = require('../config/mysql');



router.get('/login', autenticacion.isNotLoggedIn, (req, res) => {
  res.render('login', {
    mensaje: req.flash('succes')
  })
})

router.post('/login1', autenticacion.isNotLoggedIn, async (req, res, next) => {
  let data = req.body;
  connection.query('SELECT Username, Password, Estado2FA FROM users WHERE Username = ?', [data.username], (error, [userData]) => {

    if (userData == undefined || error) { //no encuentra usuario
      req.flash('succes', 'Error al Iniciar Sesion')
      res.redirect('/login');
    }
    else if (userData.Estado2FA == false) {
      next();  //sgte callback
    }
    else {
      (userData.Password == data.password) ? res.render('autenticar', { data: userData.Username }) : res.redirect('/login');
    }
  })
}, passport.authenticate('NOT2FA', {
  successRedirect: '/',
  failureRedirect: '/login'
}))


router.post('/signup', autenticacion.isNotLoggedIn, async (req, res) => {
  let data = req.body
  if (data.username.length > 0 && data.password.length > 0) {
    connection.query('INSERT INTO users SET Username = ?, Password = ?', [data.username, data.password], (error, resultado) => {
      if (error) {
        req.flash('succes', 'Error al ingresar el usuario')
        res.redirect('/login')
      }
      else {
        req.flash('succes', 'Usuario Ingresado Correctamente')
        res.redirect('/login')
      }
    })
  }
  else{
    req.flash('succes', 'Error al ingresar el usuario')
    res.redirect('/login')
  }
})

router.get('/logout', autenticacion.isLoggedIn, (req, res) => {
  req.logOut()
  res.redirect('/login')
})



module.exports = router;