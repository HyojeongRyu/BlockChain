const blockchain=require('./blockchain');
var bitcoin= new blockchain
bitcoin.createNewBlock(1,'abcd','abcd');
console.log(bitcoin.getLastBlock);
console.log(bitcoin.createNewTransaction);