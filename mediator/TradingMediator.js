class Mediator {
  constructor() {
    this.handlers = [];
  }

  addHandler(handler) {
    if (this.isValidHandler(handler)) {
      this.handlers.push(handler);
      return this;
    }
    let error = new Error('Attempt to register an invalid handler with the mediator.');
    error.handler = handler;
    throw error;
  }
  
  isValidHandler(handler) {
    return (typeof handler.canHandle === 'function') &&
    (typeof handler.handle === 'function');
  }
  
  request(price) {
    for (let i = 0; i < this.handlers.length; i++) {
      let handler = this.handlers[i];
      if (handler.canHandle(price)) {
        return handler.handle(price);
      }
    }
    let error = new Error('Mediator was unable to satisfy request.');
    error.request = price;
    return error;
  }
}


/* More handlers vs. more complex handlers */

const tempHandler = {
  canHandle: function (price) {
    return !!price.open || price.open === 0;
  },
  handle: function (price) {
    var reply = { open: price.open };
    if (price.open < 10) {
      reply.price = 'It is too cold!';
    }
    else if (price.open > 40) {
      reply.price = 'It is too hot!';
    }
    else {
      reply.price = 'It should be a pleasant day today!';
    }
    return reply;
  }
}

/* */
const bot1Handler = {
  canHandle: function (price) {
    return price.open < 10 || price.close < 15;
  },
  handle: function (price) {
    return {
      pair: price.pair,
      open: price.open,
      price: `Bot1 Says: Buy ${price.pair.split("_")[0]}!`
    };
  }
};

const bot2Handler = {
  canHandle: function (price) {
    return 40 <= price.open || price.close === 35;
  },
  handle: function (price) {
    return {
      pair: price.pair,
      open: price.open,
      price: `Bot2 says: Buy ${price.pair.split("_")[0]}!`
    };
  }
}

const strategyHandler = {
  canHandle: function (price) {
    return 35 <= price.open || price.close > 30
  },
  handle: function(price) {
    return {
      pair: price.pair,
      open: price.open,
      price: `Strategy says: Buy ${price.pair.split("_")[0]}!`
    }
  }
}

const mediator = new Mediator();
// a ordem vai influenciar
mediator.addHandler(bot1Handler);
mediator.addHandler(bot2Handler);
mediator.addHandler(strategyHandler);

let tradeRequest = {pair: "BTC_USD", open: 10, close: 35 };
let tradeReply = mediator.request(tradeRequest);
console.log(tradeReply)

let tradeRequest2 = {pair: "FCT_BTC", open: 20, close: 40 };
let tradeReply2 = mediator.request(tradeRequest2);
console.log(tradeReply2)