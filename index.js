const express = require('express');
const Database = require("@replit/database")
const redis =  require('redis');

const client = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    legacyMode: true,
    socket: {
        host: 'redis-11609.c233.eu-west-1-1.ec2.cloud.redislabs.com',
        port: 11609
    }
});

const app = express();

const db = new Database()

function onlyLettersAndNumbers(str) {
  return /^[A-Za-z0-9]*$/.test(str);
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

/** 
app.get('/gencodes', (req, res) => {
  d = 0
  while(d<50){
    d+=1
    code = makeid(10)
    console.log(code)
    client.set(`code.${code}`, 600, function(err, data) {
      console.log(code)
    })
  }
})
 */
app.get('/redeem', (req,res) => {
  if (!(req.query.hasOwnProperty("username"))){
    return res.status(200).json({"error":"You are not logged in"})
  }

  if (!(req.query.hasOwnProperty("password"))){
    return res.status(200).json({"error":"You are not logged in"})
  }

  if (!(req.query.hasOwnProperty("code"))){
    return res.status(200).json({"error":"You must enter a code to redeem"})
  }

  let username = req.query.username
  let password = req.query.password
  
  client.get(`code.${req.query.code}`, function(err, data) {
    if(data==null){
      return res.status(200).json({"error":"Code does not exist. Has someone used it already?"})
    }else{
      client.get(`account.${username}`, function(err2, data2) {
        if(data2==null){
          return res.status(200).json({"error":"Your account does not exist?"})
        }

        acc = JSON.parse(data2)
    
        if(!(acc.password==password)){
          return res.status(200).json({"error":"bad auth"})
        }

        amt = parseInt(data)
        acc.balance=parseInt(acc.balance)+amt

        client.del(`code.${req.query.code}`, function(err4, data4){
          if(err4!=null){
            return res.status(200).json({"error":"Internal error occured"})
          }
          client.set(`account.${username}`, JSON.stringify(acc), function(err3, data3){
            
            return res.status(200).json({"success":"Code redeemed"})
          })
        })
      })
    }
  })
})

app.get('/transfer', (req, res) => {
  if (!(req.query.hasOwnProperty("username"))){
    return res.status(200).json({"error":"You are not logged in"})
  }

  if (!(req.query.hasOwnProperty("password"))){
    return res.status(200).json({"error":"You are not logged in"})
  }

  if (!(req.query.hasOwnProperty("amount"))){
    return res.status(200).json({"error":"Please enter an amount to transfer"})
  }

  if (!(req.query.hasOwnProperty("sendto"))){
    return res.status(200).json({"error":"Please enter a username to send to"})
  }

  if (!(req.query.amount>0)){
    return res.status(200).json({"error":"You cannot send less than 0"})
  }

  let username = req.query.username
  let password = req.query.password
  
  client.get(`account.${username}`, function(err, data) {
    if(data==null){
      return res.status(200).json({"error":"Your account does not exist?"})
    }else{
      acc = JSON.parse(data)

      if(!(acc.password==password)){
        return res.status(200).json({"error":"bad auth"})
      }
      
      newAmt = parseInt(acc.balance)-parseInt(req.query.amount)
  
      if(!(newAmt>0)){
        return res.status(200).json({"error":"You cannot afford to send that much"})
      }
  
      client.get(`account.${req.query.sendto}`, function(err2, data2) {
        if(2!=null){
          return res.status(200).json({"error":"Internal error occured"})
        }
        if(data!=null){
          sendToAcc = JSON.parse(data2)
          sendToAcc.balance=parseInt(sendToAcc.balance)+parseInt(req.query.amount)
          acc.balance = newAmt
  
          client.set(`account.${req.query.sendto}`, JSON.stringify(sendToAcc), function(err3, data3){
            if(err3!=null){
              return res.status(200).json({"error":"Internal error occured"})
            }
            client.set(`account.${username}`, JSON.stringify(acc), function(err4, data4){
              if(err4!=null){
                return res.status(200).json({"error":"Internal error occured"})
              }
              return res.status(200).json({"success":"transfer complete"})
            })
          })
        }else{
          return res.status(200).json({"error":"An account with that username does not exist"})
        }
      })
      
      acc.balance = newAmt
      
      client.set(`account.${username}`, JSON.stringify(acc), function(err, data){
          return res.status(200).json({"success":req.query.username})
      })
    }
  })
  
})

app.get('/makeaccount', (req, res) => {
  
  if (!(req.query.hasOwnProperty("username"))){
    return res.status(200).json({"error":"Please enter a username"})
  }

  if (!(req.query.hasOwnProperty("password"))){
    return res.status(200).json({"error":"Please enter a password"})
  }

  let username = req.query.username
  let password = req.query.password
  
  if (!(onlyLettersAndNumbers(username))){
    return res.status(200).json({"error":"Username must only contain letters and numbers"})
  }
  client.get(`account.${username}`, function(err, data) {
    if(data!=null){
      return res.status(200).json({"error":"An account with that username already exists"})
    }else{
      acc = {
        username:username,
        password:password,
        balance:0
      }
      
      client.set(`account.${username}`, JSON.stringify(acc), function(err, data){
      
          return res.status(200).json({"success":req.query.username})
      
      })
    }
  })

})

app.get('/userinfo', (req, res) => {
    
  if (!(req.query.hasOwnProperty("username"))){
    return res.status(200).json({"error":"Please enter a username"})
  }

  if (!(req.query.hasOwnProperty("password"))){
    return res.status(200).json({"error":"Please enter a password"})
  }

  let username = req.query.username
  let password = req.query.password
  
  client.get(`account.${username}`, function(err, data){
    if(data==null){
      return res.status(200).json({"error":"Account doesn't exist. Try re-creating a new account."}) 
    }else{
      acc = JSON.parse(data)
      if(acc.password==password){
        return res.status(200).json({"success":"account exists","account":acc})
      }else{
        return res.status(200).json({"error":"bad auth"})
      }
      
    }
  })
  
})



app.get('/', (req, res) => {
  res.sendFile(__dirname+"/index.html");
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname+"/signup.html");
});
app.get('/login', (req, res) => {
  res.sendFile(__dirname+"/login.html");
});

app.listen(3000, () => {
  console.log('server started');
});

client.connect()
    .then(() => {
      console.log("Redis connected")
    })
    