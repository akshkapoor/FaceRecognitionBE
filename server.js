const express = require('express');
const knex = require('knex');
const bcrypt=require('bcrypt-nodejs');
const cors = require('cors');
const sqlite3=require('sqlite3').verbose();

const app=express();

app.use(express.json());
app.use(cors());

let db = new sqlite3.Database('C:/SQLite/DB/smartbrain.db');


app.get('/',(req,res)=>{
        let sql = `SELECT * FROM users ORDER BY joined`;

        db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
            res.json(rows);
            return;
        });
})

app.post('/signin',(req,res)=>{
    let {email,password}=req.body;

    db.all(`SELECT l.email as email,l.hash as hash,u.entries as entries,u.name as name FROM login l INNER JOIN users u on l.email=u.email
             where l.email=(?)`, [email], (err, rows) => {
        if(rows.length>0){
            if (err) {
                return res.status(404).json("Not Found");
            }   
            const isValid=bcrypt.compareSync(password,rows[0].hash)
                //console.log(isValid)
                if(isValid){
                //console.log(rows[0])
                res.json({status:"Success",entries:rows[0].entries,user:rows[0].name,email:rows[0].email})
                return;}
                else{
                    res.json("Could not verify")
                    return;
                }
            }
        else{
            return res.status(404).json("Not Found");
        }
            });

});

app.post('/register',(req,res)=>{
    const {name,email,password}=req.body;
    const hash=bcrypt.hashSync(password);
    //console.log(hash,email);

    db.run(`INSERT INTO users(name,email) VALUES((?),(?))`, [name,email], function(err) {
        if (err) {
          console.log(err.message);
          return res.status(404).json('Could Not add the user!')
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      });

    db.run(`INSERT INTO login(hash,email) VALUES((?),(?))`, [hash,email], function(err) {
        if (err) {
          console.log(err.message);
          return res.status(404).json('Could Not add the user!')
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      });
        return res.json("User Registered")
        });

app.put('/image',(req,res)=>{
    const {email}=req.body;
    let sql=`UPDATE users set entries=entries+1 where email=(?)`

    db.run(sql, [email], function(err) {
        if (err) {
            res.status(400).send("Error")
          return console.log(err.message);
        }
        db.all(`SELECT entries as entries from users where email=(?)`, [email], (err,rows)=> {
            if (err) {
              return console.log(err.message);
            }
            //console.log(rows[0].entries)
            return res.json(rows[0].entries)
            //return res.send(rows[0].email)
          });
      });
    

})

app.listen(3001,()=>{console.log("App is running on port 3001")});