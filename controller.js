const admins = [];
let users = [];
const { response } = require('express');
const db  = require('./model');
const { rejects } = require('assert');

//----------------CREATE ADMIN FUNCTION------------------------------
function createAdmin(admin) {
  return new Promise(async (resolve, reject) => { 
    try {
      const credentials = `${admin.email}:${admin.password}`; // Combine username and password
      delete admin.password;
      const base64Credentials = Buffer.from(credentials, 'utf-8').toString('base64'); // Convert to base64
      admin.credential = base64Credentials;
      // admins.push(admin);
      await db.insertIntoAdmin(admin);
      console.log("Admin created Successfuly");
      resolve(admin);
    } catch (error) {
      reject(error)
    }
  })
}

//----------------Verify admin FUNCTION---------------------------------

function getAdminDetails(credential) {
  return new Promise(async (resolve, reject) => {
    try {
      const decodedCredentials = Buffer.from(credential, 'base64').toString('utf-8');
      let [username, password] = decodedCredentials.split(':');
       await db.verifyAdmin(username,credential)
       .then((response) => {
        resolve();
       }) 
       .catch((error) => {
        reject(error);
       })
    }
    catch (error) {
       reject(error);
    }
  });
}


// ---------------createUser-------------------------------------------

function createUser(data){
  return new Promise(async (resolve, reject) => { 

    let emailId = await db.dbFindEmailId(data.email);
  if(!emailId){
    reject('Email already exists')
  }else{
    let userId = await db.dbGetUserId();
    console.log('New User ID: ',userId);
    let userNameId = await db.dbGetUserName(data.name)
    if(!userNameId){
      userNameId = await db.dbCreateUserName(data.name);
      console.log("User name cerated with id: ",userNameId);
    }
    let genderId = await db.dbGetGenderId(data.gender);
    if(!genderId){
      genderId = await db.dbCreateGender(data.gender);
      console.log("Gender cerated with id: ",genderId);
    }
    let insertedId = await db.dbCreateUser(userId, userNameId, data.email, genderId);
    console.log('user created with id: ', insertedId);
    
    resolve(insertedId);
  } 
})
}




































// ---------------DELETE USER-------------------------------------------
function deleteUser(userId) {
  return new Promise(async (resolve, reject) => {  
    let user = await db.getUserById(userId);
    if(user.length!=0){
      await db.deleteUser(userId)
      .then(()=>{
        resolve()
      })
      .catch(()=>{
        reject()
      })
    }else{
      reject('User not found')
    }
    
})
}



module.exports = {
  createAdmin,
  getAdminDetails,
  createUser,
};
