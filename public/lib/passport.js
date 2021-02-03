const passport = require('passport')
const PassportLocal = require('passport-local').Strategy



passport.use(new PassportLocal((username, password, done)=>{
  if(username == "Nicolas" && password == "Oliva123"){
    return done(null, {id:1, name: "Nicolas"});
  }
  else{
    done(null, false);
  }
}))

passport.serializeUser((usuario, done)=>{
    done(null, usuario.id);
})
    

passport.deserializeUser((id, done)=>{
    done(null, {id:1, name: "Nicolas"});
})

