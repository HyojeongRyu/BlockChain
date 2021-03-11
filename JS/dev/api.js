// var express = require('express');
// var app=express();
// app.get('/',function(req,res){
//     res.send("Hello World!");
// });
// app.listen(3000);

// app.post('/blockchain',function(req,res){});
// app.post('/transaction',function(req,res){res.send('It works');});
// app.post('/mine',function(req,res){});
// app.listen(3000,function(){console.log('listening on port 3000...');});

//start명령어를 실행할때 nodemon이 감시하도록 script-start에 nodemon을 추가하였다

const express = require('express');
var app= new express();
const bodyparser=require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({exteded: false}));

// app.post('/transaction',function(req,res){
//     console.log(req.body);      //요청내용을 콘솔에 출력
//     res.send(`The amount of the transaction is ${req.body.amount} bitcoin from ${req.body.sender} to ${req.body.recipient}.`);
// });

const Blockchain = require('./blockchain');
var bitcoin = new Blockchain();
app.get('/blockchain',function(req,res){
    res.send(bitcoin);
});

app.post('/transaction', function(req,res){
    const blockIndex = bitcoin.createNewTransaction(    //url로 transaction을 실행해서 새 트랜잭션에 넣고
        req.body.amount,
        req.body.sender,
        req.body.recipient)
        //createNewTransaction의 리턴값은 체인길이+1 이다.
    res.json({note: `Transaction will be added in block ${blockIndex}.`});
});
app.listen(3000,function(){console.log('listening on port 3000...');});
