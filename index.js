const express = require("express");
const path = require("path");
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const port = process.env.PORT || 3002


const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json())
app.use(cors({
    origin:"http://localhost:3004"
}))
const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/register/",async(request,response)=>{
    const { username,password} = request.body;
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const selectUserQuery = `SELECT * FROM register WHERE username like '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO 
          register (username,password) 
        VALUES 
          (
            '${username}', 
            '${hashedPassword}'
          )`;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status = 400;
      response.send("User already exists");
    }
})

app.post("/login/", async (request, response) => {
    const { username, password } = request.body;
    const selectUserQuery = `SELECT * FROM register WHERE username = '${username}'`;
    const dbUser1 = await db.get(selectUserQuery);
    if (dbUser1 === undefined) {
      response.status(400);
      response.send("Invalid User");
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser1.password);
      if (isPasswordMatched === true) {
        const payload = {
          username: username,
        };
        const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
        response.send({ jwtToken });
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
  });

  app.post("/register/adminca/",async(request,response)=>{
    const { username,password} = request.body;
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const selectUserQuery = `SELECT * FROM admin WHERE username like '${username}'`;
    const dbUser2 = await db.get(selectUserQuery);
    if (dbUser2 === undefined) {
      const createUserQuery = `
        INSERT INTO 
          admin (username,password) 
        VALUES 
          (
            '${username}', 
            '${hashedPassword}'
          )`;
      const dbResponse2 = await db.run(createUserQuery);
      const newUserId = dbResponse2.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status = 400;
      response.send("User already exists");
    }
})

  app.post("/login/admin/", async (request, response) => {
    const { username, password } = request.body;
    const selectUserQuery = `SELECT * FROM admin WHERE username = '${username}'`;
    const dbUser3 = await db.get(selectUserQuery);
    
    if (dbUser3 === undefined) {
      response.status(400);
      response.send("Invalid User");
    } else {
        const isPasswordMatched = await bcrypt.compare(password, dbUser3.password);
      if (isPasswordMatched === true) {
        const payload = {
          username: username,
        };
        const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
        response.send({ jwtToken });
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
  });

  app.post("/todo/post/",async(request,response)=>{
    const {name,id,heading,description}=request.body
    const query=`insert into todolist(name,id,heading,description)
    values ('${name}','${id}','${heading}','${description}');`
    const res1 = await db.run(query)
    const newUserId = res1.lastID;
    response.send(`Created new todo with ${newUserId}`);

  })

  app.get("/todo/get/:name",async(request,response)=>{
    const {name}=request.params;
    const query=`select * from todolist where name like '${name}';`
    const res2 = await db.all(query)
    response.send(res2);
  })

  app.delete("/delete/todo/:id",async(request,response)=>{
    const {id}=request.params
    const query=`delete from todolist
    where id like '${id}';`
    const res3 = await db.run(query)
    response.send("Todo successfully deleted");
  })

  app.post("/jobs/post/",async(request,response)=>{
    const {id,jobrole,company,salary,closeson}=request.body
    const query=`insert into jobsinfo(id,jobrole,company,salary,closeson)
    values ('${id}','${jobrole}','${company}','${salary}','${closeson}');`
    const res4 = await db.run(query)
    const newUserId = res4.lastID;
    response.send(`Created new job with ${newUserId}`);

  })

  app.get("/jobs/get/",async(request,response)=>{
    const query=`select * from jobsinfo;`
    const res5 = await db.all(query)
    response.send(res5);
  })

  app.delete("/delete/jobs/:id",async(request,response)=>{
    const {id}=request.params
    const query=`delete from jobsinfo
    where id like '${id}';`
    const res6 = await db.run(query)
    response.send("Company successfully deleted");
  })

  app.post("/apply/post/",async(request,response)=>{
    const {rollno,name,id,email}=request.body
    const query=`insert into apply(rollno,name,id,email)
    values ('${rollno}','${name}','${id}','${email}');`
    const res7= await db.run(query)
    const newUserId = res7.lastID;
    response.send(`Created new apply with ${newUserId}`);

  })


  app.get("/jobs/get/:company1/",async(request,response)=>{
    const {company1}=request.params
    const query=`select id from jobsinfo where company like '${company1}';`
    const res8 = await db.get(query)
    response.send(res8);
  })

  app.get("/apply/get/:id/",async(request,response)=>{
    const {id}=request.params
    const query=`select * from apply where id like '${id}';`
    const res9 = await db.all(query)
    response.send(res9);
  })

