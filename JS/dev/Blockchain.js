const sha256 = require('sha256');
const currentNodeUrl=process.argv[3];
const {v1: uuid}=require('uuid');

function Blockchain(){
    this.chain=[];  //블록을 저장하는 배열 chain
    this.newTransactions=[]; //블록에 아직 저장되지 않은 모든 트랜잭션 저장
    this.createNewBlock(100,'0','0');
    this.currentNodeUrl=currentNodeUrl;
    this.networkNodes=[];
} //생성자 함수

Blockchain.prototype.createNewBlock=function(nonce, prevBlockHash, hash)
{
    const newBlock={
        index:this.chain.length+1,
        timestamp: Date.now(),
        transactions:this.newTransactions,
        nonce:nonce,
        hash: hash,
        prevBlockHash : prevBlockHash,
    }   //새로운 블록에 담기는 것들을 newBlock에 할당
    this.newTransactions=[];
    this.chain.push(newBlock);
    return newBlock;
}

Blockchain.prototype.getLastBlock=function(){
    return this.chain[this.chain.length-1];     //마지막 블록의 키 반환(length는 체인의 길이니까 -1)
}

Blockchain.prototype.createNewTransaction=function(amount,sender,recipient)
{
    const newTransaction={
        amount:amount,
        sender:sender,
        recipient:recipient,
        transactionId: uuid().split('-').join('')
    };
    return newTransaction;
// this.newTransactions.push(newTransaction);   //마지막블록의[index]= 체인길이(키) 에 +1(=체인 길이 +1)
// return this.getLastBlock()[`index`]+1;       //여기에 들어갈 것이다.                                               
}

Blockchain.prototype.hashBlock = function(preBlockHash, curBlockData, nonce) //현재블록해쉬
{
    const dataString = preBlockHash     //그전블록의 해쉬
        +nonce.toString()               //+nonce를 문자열로 변경
        +JSON.stringify(curBlockData);  //+현재데이터를 문자열로 변경

    const hash = sha256(dataString);    //위 데이터를 해쉬함수 돌림
    return hash;
}

Blockchain.prototype.addTransactionTonewTransactions=function(transactionObj)
{
    this.newTransactions.push(transactionObj);
    return this.getLastBlock()[`index`]+1;  //여기에 들어갈 것이다.
}

Blockchain.prototype.proofOfWork = function(preBlockHash, curBlockData)
{
    let nonce = 0;
    let hash = this.hashBlock(preBlockHash, curBlockData, nonce);
    while(hash.substring(0,4)!=="0000"){
        nonce++;
        hash = this.hashBlock(preBlockHash, curBlockData, nonce);
    }
    return nonce;   //nonce를 0부터 시작해서 "0000"으로 시작하는 해쉬값이 나오는 nonce를 반환 
}

 //체인 내 블록을 순회하며 직전 블록의 해쉬 함수값과 현재 블록의 해쉬값을 비교하여 체인이 유효한지 확인
Blockchain.prototype.chainlsValid=function(blockchain){
    let validChain = true;
    for(var i=1; i<blockchain.length; i++){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i-1];
        const blockHash = this.hashBlock(prevBlock['hash'],
        {transaction: currentBlock['transactions'],Index:currentBlock['index']},
        currentBlock['nonce']);
        if(blockHash.substring(0,4)!=='0000')
            validChain=false;

        if(currentBlock['prevBlockHash']!==prevBlock['hash'])
            validChain = false;
    };
    //genesis 검증
    const genesisBlock= blockchain[0];
    const correctNonce = genesisBlock['nonce'] ===100;
    const correctPreviousBlockHash = genesisBlock['prevBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length===0;

    //genesis가 없다
    if(!correctNonce||!correctPreviousBlockHash||!correctHash ||!correctTransactions)
    validChain = false;

    return validChain;
};

Blockchain.prototype.getBlock=function(blockHash){  //특정 해시 관련 블록을 검색
    let correctBlock=null;
    this.chain.forEach(block=>{
        if(block.hash===blockHash)
            correctBlock=block;
    });
    return correctBlock;
};

Blockchain.prototype.getTransaction=function(transactionId){
    let correctTransaction=null;
    let correctBlock=null;
    this.chain.forEach(block=>{
        block.transactions.forEach(transaction=>{
            if(transaction.transactionId===transactionId){
                correctTransaction=transaction;
                correctBlock=block;
            };
        });
    });
    return{
        transaction: correctTransaction,
        block: correctBlock
    }
}

Blockchain.prototype.getAddressData=function(address){
    const addressTransactions=[];
    this.chain.forEach(block=>{
        block.transactions.forEach(transaction=>{
            if (transaction.sender===address||transaction.recipient===address){
                addressTransactions.push(transaction);
            };
        });
    });
    let balance = 0;
    addressTransactions.forEach(transaction=>{
        if(transaction.recipient===address)
            balance+=transaction.amount;
        else if(transaction.sender===address)
            balance-=transaction.amount;
    });
    return{
        addressTransactions: addressTransactions,
        addressBalance: balance
    };
};

module.exports=Blockchain;