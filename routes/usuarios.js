const express = require('express');
const router = express.Router();
const passport = require('passport')
let autenticacion = require('../config/autenticacion');
const connection = require('../config/mysql');

router.get('/login', autenticacion.isNotLoggedIn, (req, res)=>{
  res.render('login')  
})

router.post('/login1', autenticacion.isNotLoggedIn, async(req, res, next)=>{
  let data = req.body;
  connection.query('SELECT Username, Password, Estado2FA FROM users WHERE Username = ?', [data.username], (error, userData)=>{
    
    if(userData[0] == undefined){ //no encuentra usuario
      console.log("entre a undefined")
      res.redirect('/login');
    }
    else if(userData[0].Estado2FA == false){
      next(); 
    }
    else{
      let resultado = (userData[0].Password == data.password) ?  true: false;
      console.log(`el resultado del usuario y contraseña es: ${resultado}`)
      if(resultado){
        res.render('autenticar', {data: userData[0].Username})
      }
      else{
        res.redirect('/login')
      }
    }
  })
}, passport.authenticate('NOT2FA',{
  successRedirect: '/',
  failureRedirect: '/login'
}))


router.post('/signup', autenticacion.isNotLoggedIn, async (req, res)=>{
  let data = req.body
  connection.query('INSERT INTO users SET Username = ?, Password = ?', [data.username, data.password], (error, resultado)=>{
    if(error){
      console.table(error)
      res.redirect('/login')
    }
    else{
      console.log("DEBUG: USUARIO INSERTADO")
      res.redirect('/login')
    }
  })
})

router.get('/logout', autenticacion.isLoggedIn, (req, res) => {
  req.logOut()
  res.redirect('/login')
})



module.exports = router;