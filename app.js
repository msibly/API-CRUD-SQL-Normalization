const express = require("express");
const app = express();
const PORT = 3000;
const db = require("./connection");
const opepration = require('./model');

app.use(express.json()); // readaing the JSOn body
app.use(express.urlencoded({ extended: false }));

const {
  createAdmin,
  createUser,
  // getAllUsers,
  // findUserByUserId,
  // findUser,
  // updateUser,
  deleteUser,
  // findUserByPinCode,
  getAdminDetails,
} = require("./controller");

const { request } = require("https");
const { json } = require("stream/consumers");
const { resolve } = require("path");
const { STATUS_CODES } = require("http");

// ------------------Middleware for Admin Verification-------------------
const verifyAdmin = async (req, res, next) => {
  try {
    console.log('verifyAdmin');
    let credential = req.headers.authorization;
    credential = credential.substring(6, credential.length);

    // Get validate admin deatils from admin database
    await getAdminDetails(credential)
    .then(()=>{
      console.log('logged --- in');
      next()
    })
    .catch((error) => {
      res.status(403).send(error)
    })
  } catch (error) {
    res.send(error);
  }
};

// -----------------------SERVER STARTING FUNCTION-------------------
app.listen(PORT, () => {
  console.log(`Server Started Successfully on ${PORT}`);
});

// -----------------------DB CONNECTION-------------------------------
db.connectDB((err) => {
  if (err){
    console.log(err);
  }else{
    console.log("DB Connected");
  }
})

// --------------------------HOME ROUTE---------------------------------
app.get("/", (req, res) => {
  res.send("Welcome Home");
});

//---------------------------ADMIN ROUTE POST--------------------------
app.post("/admin", async(req, res) => {
  try {
    await createAdmin(req.body);
    res.send("admin created");
  } catch (error) {
    res.status(403).send(error.message);
  }
});

//---------------------CREATE USER ROUTE - POST METHOD-----------------------
app.post("/user", verifyAdmin, async (req, res) => {
  try {
    console.log('------create user--------');
    const insertedId = await createUser(req.body);
      res.send("user successfully created user ID "+insertedId);
  } catch (error) {
    console.log('error creating user \n error: \n',error);
    res.status(403).send(error);
  }
});

//----------------------USERS ROUTE -GET METHOD------------------------------
app.get("/users", verifyAdmin, async (req, res) => {
  try {
    let allUsers = await getAllUsers();
    res.json(allUsers);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

//-------------------USER FIND BY USER ID PARAMS ROUTE (/user/1000)------------
app.get("/user/:userId", verifyAdmin, async (req, res) => {
  let userId = parseInt(req.params.userId);
  if(!isNaN(userId)){
  let user = await findUserByUserId(parseInt(req.params.userId));
  if (user.length!=0) {
    res.status(200).json(user);
  } else {
    res.send("No users found");
  } 
}else{
  res.status(403).send("Invalid User-Id");
}
});


// ---------------------FIND USER BY QUERY - NAME/EMAIL/CITY-------------------
app.get("/user?", verifyAdmin, async (req, res) => {
  try {
    const queryParameters = req.query;
    const [key] = Object.keys(queryParameters); // Assuming there's only one key-value pair in the query parameters
    const keyValue = queryParameters[key];
    let user = await findUser(key, keyValue);
    if (user.length!=0) {
      res.send(user);
    } else {
      res.send("No users found");
    }
  } catch (error) {
    res.send(error)
  }

});

// -------------------FIND USER BY PINCODE -req.params.pinCode------------------------
app.get("/user/address/:pinCode", verifyAdmin, async (req, res) => {
  let user = await findUser('pin',req.params.pinCode)
  if (user.length!=0) {
    res.send(user);
  } else {
    res.send("No users found");
  }
});


// -----------------------------UPDATE USER-------------------------------------
app.put("/user/:userId", verifyAdmin, async (req, res) => {
  try{
    let  userId = parseInt(req.params.userId);
    console.log('-------nana-----------',typeof(userId),userId);
    if(!isNaN(userId)){
      let user = await updateUser(req.params.userId,req.body);
      if (user.length!=0) {
        const responseObj = {
          message: "Successfully updated",
          user: user
        };
        res.json(responseObj);
      } else {
        res.send("No users found");
      }
    }else{ 
      res.status(403).send("Invalid User-Id");
    }
  }catch(error){
    res.send(error)
  } 
});

//-----------------------USER DELETE ROUTE (/user/?query=queryValue)--------------------
app.delete("/user/:userId", verifyAdmin, async (req, res) => {
  await deleteUser(req.params.userId)
    .then(() => {
      res.send("user deleted");
    })
    .catch((err) => {
      res.send(err);
    });
});

// 404 ERROR
app.get("*", (req, res) => {
  res.status(404).send("404 Error");
});
