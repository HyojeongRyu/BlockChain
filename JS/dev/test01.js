const Blockchain = require('./Blockchain'); //import해서 Blockchain에 할당
const bitcoin = new Blockchain();           //인스턴스 생성
bitcoin.createNewBlock(1234,'ABCDEFGHIJK1','123456789A');
bitcoin.createNewBlock(2234,'ABCDEFGHIJK2','123456789B');
bitcoin.createNewBlock(3234,'ABCDEFGHIJK3','123456789C');
console.log(bitcoin);
