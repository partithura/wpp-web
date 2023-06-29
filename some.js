const { catchMsg } = require('./src/util');
const message = {
  body: `Sorteia 2 times Lista do jogo de hj das 19 as 20, bora preeencher a lista, na play Beach 
  Lista
  1. Daniel
  2. André 
  3. Alexandre 
  4. Alan 
  5. Marcos
  6. André L 
  7. andrézinho 
  8.valdinei`,
};

console.log(catchMsg(message));
