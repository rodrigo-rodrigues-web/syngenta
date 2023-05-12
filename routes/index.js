require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

var express = require('express');
const { selectEmployees, sql, poolPromise } = require('../db');
var router = express.Router();

//authentication
function verifyJWT(req, res, next){
  const token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    
    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}

router.post('/login', (req, res, next) => {
  //esse teste abaixo deve ser feito no seu banco de dados
  if(req.body.user === 'syngentaAPIs' && req.body.password === 'yxf6qn7B8QSRBckx'){
    //auth ok
    const id = 1; //esse id viria do banco de dados
    const token = jwt.sign({ id }, process.env.SECRET, {
      expiresIn: 3600 // expires in 60 min
    });
    return res.json({ auth: true, token: token });
  }
  
  res.status(500).json({message: 'Login inválido!'});
})

router.post('/logout', function(req, res) {
  res.json({ auth: false, token: null });
})

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/Time', verifyJWT, function(req, res, next) {
  const group = req.query.group;

  if (!Number.isInteger(parseInt(group))) {
    res.status(400).send("The parameter must be an integer number.");
  } else {
    selectEmployees(group, res);
  }
});

router.post('/api/Time', verifyJWT, async (req, res, next) => {
  // Extract the array of objects from the request body
  const objects = req.body.data;
  let recordIds = []; // Create an empty array to store the IDs of the inserted records

  //Iterate over the objects and insert them into the database
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    try {
      const pool = await poolPromise;
      
      const result = await pool
        .request()
        .input('Clock', sql.NVarChar, object.Clock)
        .input('TaskCode', sql.NVarChar, object.TaskCode)
        .input('Time', sql.DateTime, object.Time)
        .input('TimeUnit', sql.NVarChar, object.TimeUnit)
        .input('CropCode', sql.NVarChar, object.CropCode)
        .query('INSERT INTO [Syngenta].[dbo].[TimeSheet] (Clock, TaskCode, Time, TimeUnit, CropCode) VALUES (@Clock, @TaskCode, @Time, @TimeUnit, @CropCode);SELECT * FROM TimeSheet WHERE id=(SELECT @@IDENTITY AS id);').then(result => {
          recordIds.push(result.recordset[0]);
      })
      
    } catch (err) {
      res.status(500);
      res.send(err.message);
    }
  } // end of for loop
  // Send the array of record IDs as the response
  res.json(recordIds);
  
});


module.exports = router;
