//api.js를 실행할때마다 서로 다른 네트워크 노드로 동작하도록 포트를 파라미터로 설정
const port = process.argv[2];
const express = require('express');
var app= new express();
const bodyparser=require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));
const Blockchain = require('./blockchain');
var bitcoin = new Blockchain();
const {v1: uuid}=require('uuid');

app.get('/blockchain',function(req,res){
    res.send(bitcoin);
});

app.post('/transaction', function(req,res){
    const newTransaction= req.body;   
    const blockIndex = bitcoin.addTransactionTonewTransactions(newTransaction);
    res.json({note: `Transaction will be added in block ${blockIndex}.`});
});

const reqp=require('request-promise');                  //API request repeat 함수
//자신의 서버에 등록하고 전체 네트워크에 브로드캐스팅
app.post(`/register-and-broadcast-node`,function(req,res){
    console.log("register-and-broadcast");
    const newNodeUrl=req.body.newNodeUrl;
    if(bitcoin.currentNodeUrl===newNodeUrl){
        res.json({note:'ERROR!'});
        return;
    }                                                   //newNodeUrl = 등록 요청 URL
    if(bitcoin.networkNodes.indexOf(newNodeUrl)==-1)    //networkNodes 배열에 등록요청 URL이 안 들어가있으면
        bitcoin.networkNodes.push(newNodeUrl);          //networkNodes 배열에 요청 URL을 push (곧 networknodes가 될거니깐)
    const regNodesPromises=[];                          //request 목록 선언
    bitcoin.networkNodes.forEach(networkNodeUrl=>{      //networknodes에 들어있는 요청 url을 가지고
        const requestOption={                           //request 옵션을 설정
            uri: networkNodeUrl + '/register-node',     //register-node를 요청할 것이다.
            method:'POST',                              //POST 방법으로
            body: {newNodeUrl: newNodeUrl},             //body는 요청url
            json:true                                   //형식은 json
        };
        regNodesPromises.push(reqp(requestOption));     //request옵션을 repeat 함수에 넣고 request 목록에 추가
    });
    Promise.all(regNodesPromises)   //request목록의 모든 것을 promise!
    .then(data=>{
        const bulkRegisterOptions={ //bulk 옵션을 설정
            uri: newNodeUrl+'/register-nodes-bulk', //register-nodes-bulk를 요청할 것이다
            method: 'POST',
            body: {allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]}, //모든노드=networknodeurl,argv로 받은 현재 url
            json: true
        };
        return reqp(bulkRegisterOptions); //최종 요청
    })
    .then(data=>{
        res.json({note:'New Node registered with network successfully'});
    })
});
//새로 등록 요청받은 노드를 자신의 서버에 등록
app.post(`/register-node`,function(req,res){
    console.log("register");
    const newNodeUrl=req.body.newNodeUrl;       //newnodeurl

    //배열 networkNodes에 없으면 true, 있으면false
    const nodeNotExist=(bitcoin.networkNodes.indexOf(newNodeUrl)==-1);
    //currentNodeUrl과 newNodeUrl이 다르면 true, 같다면 false
    const notCurrentNode = bitcoin.currentNodeUrl!==newNodeUrl;
    
    console.log(nodeNotExist+"\n");
    // console.log(currentNodeUrl+'\n');
    console.log(notCurrentNode);
    
    //기존에 없고 현재 노드의 url과 다르면 추가
    if(nodeNotExist&&notCurrentNode)
        bitcoin.networkNodes.push(newNodeUrl);
    //등록요청에 대한 회신
    res.json({note: `New node registered successfully.`});
});
//여러개의 노드를 자신의 서버에 한 번에 등록
app.post(`/register-nodes-bulk`,function(req,res){
    console.log("register bulk");
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => { //networknodeurl을
        const nodeNotAlreadyPresent= bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode= bitcoin.currentNodeUrl!==networkNodeUrl;
        if(nodeNotAlreadyPresent&&notCurrentNode)
            bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({note: "Bulk registration successful."});
});


app.post(`/transaction/broadcast`, function(req,res){
    console.log("transaction broadcast");
    const newTransaction = bitcoin.createNewTransaction(
        req.body.amount,req.body.sender, req.body.recipient);
    const requestPromises=[];
    bitcoin.addTransactionTonewTransactions(newTransaction);
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri: networkNodeUrl+'/transaction',
            method:'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(reqp(requestOptions));
    });
    Promise.all(requestPromises).then(data=> {
        res.json({note: 'Transaction created and broadcast successfully'});
    });
});
//전블록해쉬값와 현재블록데이터(newtransaction,index)를 해싱했을 때 앞 네글자가 0000이 나오는 nonce값을 구해서
    // 그 nonce값으로 전블록해쉬값과 현재데이터블록을 해싱한다.
    // 그렇게 나온 현재블록해쉬값 + 전블록해쉬값 + nonce 값으로 해싱해서
    // 해쉬값과 전블록해쉬값, nonce, 타임스탬프, 트랜잭션 등으로 새 블록을 만든다.
app.post('/mine',function(req, res){    
    console.log("mine"); 
    const lastBlock=bitcoin.getLastBlock();
    const preBlockHash=lastBlock[`hash`];
    const curBlockData={
        transaction: bitcoin.newTransactions,
        Index:lastBlock[`index`]+1
    };
    const nonce=bitcoin.proofOfWork(preBlockHash, curBlockData);    //nonce구하고
    const blockHash = bitcoin.hashBlock(preBlockHash, curBlockData, nonce);//블록해쉬
    const newBlock = bitcoin.createNewBlock(nonce, preBlockHash, blockHash);//새블록 만들기-newtransaction을 transaction으로 바꾸고 newtransaction=[]
    const requestPromises= [];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri: networkNodeUrl+`/receive-new-block`,   //receive-new-block 호출
            method:`POST`,
            body:{newBlock: newBlock},                  //body는 newblock
            json: true
        };
        requestPromises.push(reqp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(data=>{
        nodeAddress=uuid().split('-').join('');
        const requestOptions={
            uri: bitcoin.currentNodeUrl+`/transaction/broadcast`,   //transaction/broadcast 호출
            method: `POST`,                                         
            body:{                                                  //채굴 보상 transaction
                amount:12.5,                                        
                sender: `00`,
                recipient: nodeAddress
            },
            json: true
        };
        return reqp(requestOptions);
    })
    .then(data=>{
        res.json({
            note: `New block mined&broadcast successfully`,
            block:newBlock
        });
    });
});

//newblock은 index,timestamp, transactions, nonce, hash, prevblockhash가 있다.

app.post('/receive-new-block', function(req,res){
    console.log("receive new block");
    const newBlock= req.body.newBlock;
    const lastBlock= bitcoin.getLastBlock();
    const correctHash=lastBlock.hash===newBlock.prevBlockHash;//newBlock.previousBlockHash; //마지막블록의해쉬===새블록의 이전블록해쉬
    const correctIndex= lastBlock['index']+1===newBlock['index']; //마지막블록===새블록

    if(correctHash&&correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.newTransactions=[]; //다른 노드에서는 createnewblock을 하지 않았으니 newtransactions가 비어있지 않음
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        });
    }
    else{
        res.json({
            note: 'New block rejected.',
            newBlock: newBlock
        });
    }
});

app.get(`/consensus`, function(req,res){
    console.log("consensus");
    const requestPromises=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri:networkNodeUrl+'/blockchain',
            method:'GET',
            json:true
        };
        requestPromises.push(reqp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(blockchains=>{
        const currentChainLength=bitcoin.chain.length;  //현재노드에 있는 체인의 길이
        let maxChainLength=currentChainLength;          //더 긴 체인이 발견될 경우 변경할 변수
        let newLongestChain=null;
        let newTransactions=null;

        //가장 긴 블록체인을 검색(Longest chain을 채택한다.)
        //const Blockchain = require('./blockchain');
        //var bitcoin = new Blockchain();
        blockchains.forEach(blockchain=>{               //복사받은 체인을 하나씩 다 순회
            if(blockchain.chain.length>maxChainLength){ //복사받은체인이 현재 노드의 체인 길이보다 길면
                maxChainLength=blockchain.chain.length; //현재노드의 길이를 복사받은체인의 길이로 바꾸고
                newLongestChain=blockchain.chain;       //복사체인의 체인을 NewLongestchain에 대입
                newTransactions=blockchain.newTransactions;//복사체인의 트랜잭션을 Newtransaction에 대입
            };
        });
        if(!newLongestChain||(newLongestChain&&!bitcoin.chainlsValid(newLongestChain))){//더 긴 체인이 없거나, 있더라도 유효하지 않으면
            res.json({
                note: 'Current chain has not been replaced.',
                chain: bitcoin.chain
            });
        }
        else{
            bitcoin.chain=newLongestChain;  //현재 체인을 가장 긴 체인으로 바꾼다.
            bitcoin.newTransactions=newTransactions;
            res.json({
                note: 'This chain has been replaced.',
                chain: bitcoin.chain
            });
        }
    });
});

app.get('/block/:blockHash',function(req,res){
    const blockHash = req.params.blockHash;
    const correctBlock=bitcoin.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

app.get('/transaction/:transactionId', function(req,res){
    const transactionId=req.params.transactionId;
    const transactionData=bitcoin.getTransaction(transactionId);
    res.json({
        transaction:transactionData.transaction,
        block: transactionData.block
    });
});

app.get('/address/:address',function(req,res){
    const address=req.params.address;
    const addressData=bitcoin.getAddressData(address);
    res.json({
        addressData:addressData
    });
});

app.get('/block-explorer',function(req,res){
    res.sendFile(`./block-explorer/index.html`,{root:_dirname});
});

app.listen(port, function(){
    console.log(`listening on port ${port}...`)}
);