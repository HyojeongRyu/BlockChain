const Blockchain = require('./Blockchain');
const bitcoin = new Blockchain();

bitcoin.createNewBlock(1234,'ABCDEFGHIJK','1234567890');
bitcoin.createNewTransaction(100,'JOHN','TOM');
bitcoin.createNewTransaction(100,'TOM','JANE');
bitcoin.createNewTransaction(100,'JANE','JHON');
bitcoin.createNewBlock(5678,'ABABABABABAB','A1A2A3A4A5');
console.log(bitcoin);
console.log('------------------');
console.log(bitcoin.chain[1]);