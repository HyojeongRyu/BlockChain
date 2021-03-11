const Blockchain = require('./Blockchain');
const bitcoin = new Blockchain();
const preBlockHash='6B86B2AA22F1D49C01E52DDB7875B4B'
const curBlockData=[
    {	amount: 100,	sender: 'JOHN',		recipient: 'TOM'		},
	{	amount: 50,		sender: 'TOM',		recipient: 'JANE'		},
	{	amount: 10,		sender: 'JANE',		recipient: 'JOHN'	}
];

bitcoin.proofOfWork=function(preBlockHash,curBlockData)
{
    var nonce = 1;
    while(1){
        var hash = this.hashBlock(preBlockHash, curBlockData, nonce);
        nonce++;
        console.log(hash);
        if(hash.substring(0,4)=="0000") break;
    }
    console.log(nonce);
}
bitcoin.proofOfWork(preBlockHash,curBlockData);

// bitcoin.proofOfWork = function(preBlockHash, curBlockData)
// {
//     let nonce = 0;
//     let hash = this.hashBlock(preBlockHash, curBlockData, nonce);
//     while(hash.substring(0,4)!=="0000"){
//         nonce++;
//         hash = this.hashBlock(preBlockHash, curBlockData, nonce);
//     }
//     return ;
// }