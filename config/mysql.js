let mysql = require('mysql')

let connection = mysql.createConnection({
    host: "blpho4emdxxveonnl9kq-mysql.services.clever-cloud.com",
    user: "uitiypc2lx8x45ov",
    password: "eL9rkHhl3ILu0VgMMxlu",
    database : 'blpho4emdxxveonnl9kq'
})

connection.connect();
module.exports = connection;