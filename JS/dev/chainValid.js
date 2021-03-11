const Blockchain = require('./Blockchain');
const bitcoin = new Blockchain();

const bc1 =
    {
      "chain": [
        {
          "index": 1,
          "timestamp": 1604635708849,
          "transactions": [
            
          ],
          "nonce": 100,
          "hash": "0",
          "prevBlockHash": "0"
        },
        {
          "index": 2,
          "timestamp": 1604635777992,
          "transactions": [
            {
              "amount": 100,
              "sender": "SALLY",
              "recipient": "TOM",
              "transactionId": "da0c67b01fe511ebbd5af3459ae47976"
            },
            {
              "amount": 100,
              "sender": "SALLY",
              "recipient": "TOM",
              "transactionId": "dad891501fe511ebbd5af3459ae47976"
            }
          ],
          "nonce": 16650,
          "hash": "0000cdae16b80d034e05c555b32dfcf45e1b33ed7d6937eaf56bf059650ef628",
          "prevBlockHash": "0"
        }
      ],
      "newTransactions": [
        {
          "amount": 12.5,
          "sender": "00",
          "recipient": "e2eb10c01fe511ebbd5af3459ae47976",
          "transactionId": "e2eb5ee01fe511ebbd5af3459ae47976"
        }
      ],
      "currentNodeUrl": "http://localhost:3003",
      "networkNodes": [
        "http://localhost:3002",
        "http://localhost:3001"
      ]
      };

console.log('Valid:',bitcoin.chainlsValid(bc1.chain));