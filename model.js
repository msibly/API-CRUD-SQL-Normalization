const { create } = require("domain");
const db = require("./connection");
const { error } = require("console");
const { json } = require("stream/consumers");
const { resolve } = require("path");
const { rejects } = require("assert");
const { query } = require("express");

const userTable = "userTable";
const adminTable = "adminTable";
const officeAddressTable = "officeAddressTable";
const homeAddressTable = "homeAddressTable";
const currentAddressTable = "currentAddressTable";




//insert into  admin table

module.exports = {
  // -----------------insert into adminTable----------------
  insertIntoAdmin: (admin) => {
    return new Promise((resolve, reject) => {
      db.get().query(
        `INSERT INTO ${adminTable} (ADNAME, EMAIL, PASSKEY) VALUES ('${admin.name}','${admin.email}','${admin.credential}')`,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  // ---------------------------verify admin details---------------------------
  verifyAdmin: (email, credential) => {
    return new Promise((resolve, reject) => {
      db.get().query(
        `SELECT * FROM ${adminTable} WHERE EMAIL = '${email}'`,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            if (result.length != 0) {
              if (result[0].PASSKEY === credential) {
                console.log('admin verified');
                resolve();
              } else {
                reject("password missmatch");
              }
            } else {
              reject("email missmatch");
            }
          }
        }
      );
    });
  },

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~NEW DATA STARTS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // -------------------------------get user found or not---------------------------------------

  dbFindEmailId : (email) => {
    return new Promise((resolve, reject) => { 
      db.get().query(
        `SELECT userEmail AS emailId FROM usertable WHERE userEmail =?`,[email],
        (error,results,fields) =>{
          if(error) { 
            console.log('erorrrrrrrrrrrrrrrrr');
            console.log(error);
            // reject(error);
          }
          else{
            if(results.length!=0){
              console.log('email found with id',results[0].emailId);
              resolve(false)
            }else{
              console.log('email not found- You can create a new user');
              resolve(true)
            }
          }
        });
     })
  },


  // -------------------------------get userId---------------------------------------

  dbGetUserId: () => {
    return new Promise(async (resolve, reject) => {
       await db.get().query(
        `
        SELECT COALESCE(MAX(userId), 999) + 1 as newUserId FROM userTable;
        `,(error,results,fields) =>{
          if(error) { 
            console.log('erorrrrrrrrrrrrrrrrr');
            console.log(error);
          }
          else{
            resolve(results[0].newUserId);
          }
        });
    });
  },

  // -------------------------------           ---------------------------------------

  dbGetUserName : (name) =>{
    return new Promise((resolve, reject) => { 
      db.get().query(
        `SELECT usernameid AS userNameId FROM nametable WHERE USERNAME = ?`,[name],
        (error,results,fields) =>{
          if(error) { 
            console.log('erorrrrrrrrrrrrrrrrr');
            console.log(error);
          }
          else{
            if(results.length!=0){
              console.log('username found with id',results[0].userNameId);
              resolve(results[0].userNameId)
            }else{
              console.log('name not found- please create a new name');
              resolve(undefined)
            }
          }
        });
     })
  },

  // -------------------------------           ---------------------------------------


  dbCreateUserName : (name) => {
    return new Promise(async (resolve, reject) => { 
      await db.get().query(
        `INSERT INTO nametable (username) VALUES (?)`,[name],
        (error,results,fields) =>{
          if(error) { 
            console.log('erorrrrrrrrrrrrrrrrr');
            console.log(error);
          }
          else{
            resolve(results.insertId);
          }
        });
     })
  },

  // -------------------------------           ---------------------------------------


  dbGetGenderId : (gender) => {
    return new Promise(async(resolve, reject) => { 
      await db.get().query(
        `
        SELECT genderid AS genderId FROM gendertable WHERE GENDER = ?
        `, [gender],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            if(result.length!=0){
              console.log('gender found with id',result[0].genderId);
              resolve(result[0].genderId);
            }else{
              console.log('gender not found- please create a new gender');
              resolve(undefined)
            }
          }
        }
      )
     })
  },

  // -------------------------------           ---------------------------------------


  dbCreateGender : (gender) => {
    return new Promise(async (resolve, reject) => { 
      await db.get().query(
        `INSERT INTO gendertable (gender) VALUES (?)`,[gender],
        (error,results,fields) =>{
          if(error) { 
            console.log('erorrrrrrrrrrrrrrrrr');
            console.log(error);
          }
          else{
            resolve(results.insertId);
          }
        });
     })
  },

  // -------------------------------           ---------------------------------------


  dbCreateUser : (userId, userNameId, email, genderId) => {
    return new Promise((resolve, reject) => { 
      console.log(userId, userNameId, email, genderId);
      db.get().query(
        `
        INSERT INTO userTable (userId, userNameId, userEmail, userGenderId) VALUES (?,?,?,?)
        `,[userId, userNameId, email, genderId],
        (error,results) =>{
          if(error) { 
            console.log('erorrrrrrrrrrrrrrrrr');
            console.log(error);
          }
          else{
            console.log(userId);
            resolve(userId);
          }
      })     
    })
  },




// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~NEW DATA ENDS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~










  //   --------------------------------get all users------------------------------
  dbGetAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.get().query(`SELECT * FROM ${userTable}`, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      })
    })
  },

  // get user by user id

  getUserById: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().query(
        `
        SELECT
        u.id,
        u.uname,
        u.email,
        u.gender,
        JSON_OBJECT(
          'city', ha.city,
          'pin', ha.pin
          ) AS HomeAddress,
        JSON_OBJECT(
          'city', oa.city,
          'pin', oa.pin
          ) AS OfficeAddress,
        JSON_OBJECT(
          'city', ca.city,
          'pin', ca.pin
          ) AS CurrentAddress
    FROM
        ${userTable} u
    LEFT JOIN
        ${homeAddressTable} ha ON u.id = ha.id
    LEFT JOIN
        ${officeAddressTable} oa ON u.id = oa.id
    LEFT JOIN
        ${currentAddressTable} ca ON u.id = ca.id
    WHERE
        u.id = ${userId}
        `
        , (error, results) => {
          if (error) {
            console.log(error);
            reject(error)
          } else {
            results.forEach(result => {
              result.HomeAddress = JSON.parse(result.HomeAddress);
              result.OfficeAddress = JSON.parse(result.OfficeAddress);
              result.CurrentAddress = JSON.parse(result.CurrentAddress);
            });
            resolve(results);
          }
        })
    })
  },

  // find user by key
  getUserbyKey: (key, keyValue) => {
    return new Promise((resolve, reject) => {
      db.get().query(
        `
      SELECT * FROM ${userTable} WHERE ${key} LIKE ?
      `, [`%${keyValue}%`],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            results = results.map(row => {
              return {
                ID: row.ID,
                UNAME: row.UNAME,
                EMAIL: row.EMAIL,
                GENDER: row.GENDER
              };
            });
            // results = JSON.parse(results);
            resolve(results);
          }
        }
      )
    })
  },

  // get user by key - CITY
  getUserByCityOrPincode: (key, keyValue) => {
    return new Promise((resolve, reject) => {
      try {
        db.get().query(
          `
      SELECT userTable.*
      FROM userTable
      JOIN homeAddressTable ON userTable.id = homeAddressTable.Id
      JOIN officeAddressTable ON userTable.id = officeAddressTable.Id
      JOIN currentAddressTable ON userTable.id = currentAddressTable.Id
      WHERE homeAddressTable.${key} LIKE ?
        OR officeAddressTable.${key} LIKE ?
        OR currentAddressTable.${key} LIKE ?
      `, [`%${keyValue}%`, `%${keyValue}%`, `%${keyValue}%`],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        )

      } catch (error) {
        reject(error);
      }


    })
  },

  // update User data
  dbUpdateUser: (userId, datas, upadteKeys, addressData) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.get().query(
          `
            UPDATE ${userTable} SET EMAIL = ? WHERE ID = ?
            `, [`${datas[0].email}`, userId],
          async (error, results) => {
            if (error) {
              reject(error);
            } else {
              if (addressData) {
                let updateAddress = addressData.map(async (e) => {
                  return new Promise((resolve, reject) => {
                    db.get().query(
                      `
                    UPDATE ${e.type}Table SET city  =?, pin =? where id =? 
                    `, [`${e.city}`, `${e.pin}`, userId], (error, results) => {
                      if (error) {
                        reject(error)
                      } else {
                        resolve(true);
                      }
                    })
                  })
                })
                await Promise.all(updateAddress);
                resolve(true)
              }
              resolve(true);
            }
          })
      } catch (error) {
        reject(error);
      }
    }
    )
  },

  // delete user

  deleteUser: async (userId) => {
    try {

      await db.get().query(`DELETE FROM ${homeAddressTable} WHERE Id = ?`, userId);

      await db.get().query(`DELETE FROM ${currentAddressTable} WHERE Id = ?`, userId);

      await db.get().query(`DELETE FROM ${officeAddressTable} WHERE Id = ?`, userId);

      await db.get().query("DELETE FROM userTable WHERE Id = ?", userId);

      return Promise.resolve();

    } catch (error) {
      return Promise.reject(error);
    }
  }
};
