var express = require('express');
var router = express.Router(); //reemplaza el app.use 
var session = require('express-session')
var passport = require('passport');
var PassportLocal = require('passport-local').Strategy
const connection = require('../config/mysql')
const speakeasy = require('speakeasy');


router.use(session({ 
  secret: "mi secreto",
  resave: true, //guarda la session
  saveUninitialized: true //aun asi guarda la session
}))
router.use(passport.initialize()); //CONFIG INICIAL DE PASSPORT
router.use(passport.session()); //CONFIG INICIAL DE PASSPORT

passport.use( '2FA', new PassportLocal( async (username, password, done)=>{
  console.log("estoy en 2FA")
  connection.query('SELECT Username, Secreto, Estado2FA FROM users WHERE Username = ?', [username], (error, usuario)=>{
    if(error || usuario[0] == undefined ){ //si encuentra un error o no encuentra usuario
      done(null, false)
    }
    else{
      let verificar = speakeasy.totp.verify({
        secret: usuario[0].Secreto,
        encoding: 'ascii',
        token: password
      });
      console.log("el estado es: ", verificar);
      (verificar) ? done(null, usuario[0].Username) : done(null, false);
    }
  })
}))

passport.use( 'NOT2FA', new PassportLocal( async (username, password, done)=>{
  console.log("estoy en NOT2FA")
  connection.query('SELECT Username, Password, Secreto, Estado2FA FROM users WHERE Username = ?', [username], (error, usuario)=>{
    if(error || usuario[0] == undefined ){ //si encuentra un error o no encuentra usuario
      done(null, false)
    }
    else{
      (usuario[0].Username==username && usuario[0].Password == password) ? done(null, usuario[0].Username) : done(null, false);
    }
  })  
}))

passport.serializeUser((usuario, done)=>{
  console.log(`ESTOY EN SERIALIZE USER Y ENTRO EL USER: ${usuario}`)
  done(null, usuario);
})
    
passport.deserializeUser((id, done)=>{
  console.log(`ESTOY EN DESERIALIZE USER Y ENTRO LA ID: ${id}`)
  connection.query('SELECT Username, Password FROM users WHERE Username = ?', [id], async (error, userData) => {
    done(null, userData);
  })
})

module.exports = router;