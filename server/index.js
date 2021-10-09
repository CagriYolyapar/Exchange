const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1');


const key = ec.genKeyPair();
const key2 = ec.genKeyPair();
const key3 = ec.genKeyPair();

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

 const public1 = key.getPublic().encode("hex");
 const public2 = key2.getPublic().encode("hex");
 const public3 = key3.getPublic().encode("hex");



const private1 = key.getPrivate().toString(16);
const private2 = key2.getPrivate().toString(16);
const private3 = key3.getPrivate().toString(16);

// const balances = {
//   "1": 100,
//   "2": 50,
//   "3": 75,
// }

// const balances = {};
// balances[public1] = 100;
// balances[public2] = 100;
// balances[public3] = 100;
const account1 = {};
account1[public1] = public1;
account1["Money"]= 100;
account1["private"] = private1;

const account2 = {};
account2[public2]= public2;
account2["Money"] = 90;
account2["private"] = private2;

const account3 = {};
account3[public3]= public3;
account3["Money"] = 80;
account3["private"] = private3;

const balanceArray = [account1,account2,account3];



console.log("Public keys");
console.log(public1);
console.log(public2);
console.log(public3);

console.log("-----------------\nPrivate keys\n");

console.log(private1);
console.log(private2);
console.log(private3);

app.get('/balance/:address', (req, res) => {
  
//   const {address} = req.params;
//  console.log(req.params);
  
//    const balance = balances[address]|| 0;

  
// res.send({ balance });

const {address} = req.params;

for(let i = 0;i<balanceArray.length;i++){

  
  
  if(balanceArray[i][address]==address){
    
    const balance = balanceArray[i]["Money"]||0;
    res.send({balance});
  }
}


});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  console.log(sender);
  for(let i = 0;i<balanceArray.length;i++){
       if(balanceArray[i][sender] == sender){

        //signing
         const privateKey = balanceArray[i]["private"];
         console.log(privateKey);
         const key = ec.keyFromPrivate(privateKey);
         const amountHash = SHA256(amount).toString();
         const signature = key.sign(amountHash);

        //verifying

        const publicKey = balanceArray[i][sender];

        const keyFromPublic = ec.keyFromPublic(publicKey,'hex');

        const message = amountHash;

        const signRs = {
          r: signature.r.toString(16),
          s:signature.s.toString(16)
        };
        var result = keyFromPublic.verify(message,signRs);

        if(result){

          for(let x = 0;x<balanceArray.length;x++){
            if(balanceArray[x][recipient] == recipient){
              balanceArray[i]["Money"] -= amount;
              balanceArray[x]["Money"] = (balanceArray[x]["Money"]||0)+ +amount;
              res.send({balance:balanceArray[i]["Money"]});
            }
          }


 // balances[sender] -= amount;
  // balances[recipient] = (balances[recipient] || 0) + +amount;
  // res.send({ balance: balances[sender] });
        }

       }
      

  }

 
   
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
