var express = require('express');
var router = express.Router();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode')
let autenticacion = require('../config/autenticacion');
const connection = require('../config/mysql');
const passport = require('passport');
const app = require('../app');



router.get('/crear2FA', autenticacion.isLoggedIn, (req, res)=>{
    let user = req.user;
    console.log(`El Password y user de la sesion son: ${user[0].Username} y ${user[0].Password}`)
    let secreto = speakeasy.generateSecret({
        'name': `USUARIO APP NICOLAS: ${user[0].Username}`
    })
    console.log(secreto)
    connection.query('UPDATE users SET Secreto = ?, Estado2FA = ? WHERE Username = ?', [secreto.ascii, true, user[0].Username], (error, resultado)=>{
      if(error){
        console.log(error)
      }
      else{
        qrcode.toDataURL(secreto.otpauth_url, (error, datos) => {
          res.render('qr_code', {
           data: `${datos}`
          })
        })    
      }
    })
})

router.post('/validar', autenticacion.isNotLoggedIn, passport.authenticate('2FA',{
  successRedirect: '/',
  failureRedirect: '/login'
}))




module.exports = router;