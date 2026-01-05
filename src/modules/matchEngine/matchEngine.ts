import { prisma } from "../../db/prisma";
import { Prisma } from "../../generated/prisma";
import { ApiError } from "../../utils/ApiError";

const matchBuyOrder = async (orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const buyOrder = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!buyOrder || buyOrder.status !== "OPEN") return;

    let remainingQty = buyOrder.quantity - buyOrder.filledQuantity;

    // Find matching SELL orders (price <= buyOrder price, sorted by price and time)
    const sellOrders = await tx.order.findMany({
      where: {
        symbol: buyOrder.symbol,
        side: "SELL",
        status: {in: ["OPEN", "PARTIAL"]},
        price: { lte: buyOrder.price! },
        userId: {not:buyOrder.userId}
      },
      orderBy: [
        { price: "asc" },   // cheapestFirst
        { createdAt: "asc" }  // Oldest first
      ]
    });

    for (const sell of sellOrders) {
      if (remainingQty === 0) break;

      const sellRemaining = sell.quantity - sell.filledQuantity;
      const tradedQty = Math.min(remainingQty, sellRemaining);
      const tradePrice = sell.price!;   // use sellers price

      // 1. Create trade
      await tx.trade.create({
        data: {
          buyOrderId: buyOrder.id,
          sellOrderId: sell.id,
          symbol: buyOrder.symbol,
          price: tradePrice,
          quantity: tradedQty
        }
      });

      // 2. Update orders
      await tx.order.update({
        where: { id: buyOrder.id },
        data: {
          filledQuantity: { increment: tradedQty },
          status:
            tradedQty === remainingQty ? "FILLED" : "PARTIAL"
        }
      });

      await tx.order.update({
        where: { id: sell.id },
        data: {
          filledQuantity: { increment: tradedQty },
          status:
            tradedQty === sellRemaining ? "FILLED" : "PARTIAL"
        }
      });

      // Transfer locked funds
      const totalCost = new Prisma.Decimal(tradePrice).mul(tradedQty);

      // Release unused locked balance
      const priceDifference = buyOrder.price!.minus(tradePrice);
      const savedAmount = priceDifference.mul(tradedQty);

      await tx.wallet.update({
        where: { userId: buyOrder.userId },
        data: {
          lockedBalance: { decrement: totalCost },
          balance: { increment: savedAmount }  // return price difference to buyer
        }
      });

      // add funds to seller's wallet
      await tx.wallet.update({
        where: { userId: sell.userId },
        data: {
          balance: { increment: totalCost }
        }
      });

      // transfer stocks from seller to buyer
      // update seller's holding
      await tx.stockHolding.update({
        where: {
          userId_symbol: {
            userId: sell.userId,
            symbol: buyOrder.symbol
          }
        },
        data: {
          locked: { decrement: tradedQty }
        }
      });

      const initialBuyerHolding = await tx.stockHolding.findUnique({
        where: {
          userId_symbol: {
            userId: buyOrder.userId,
            symbol: buyOrder.symbol
          }
        }
      });

      let newBuyersAvgPrice;
      if (initialBuyerHolding) {
        const oldQty = initialBuyerHolding.quantity;
        const oldCost = initialBuyerHolding.avgPrice.mul(oldQty);
        const newCost = new Prisma.Decimal(tradePrice).mul(tradedQty);

        const totalQty = oldQty + tradedQty;
        newBuyersAvgPrice = oldCost.add(newCost).div(totalQty);
      }
      else {
        newBuyersAvgPrice = tradePrice.toNumber() / tradedQty;
      }
      
      //update buyer's holdings
      const buyerHolding = await tx.stockHolding.upsert({
        where: {
          userId_symbol: {
            userId: buyOrder.userId,
            symbol: buyOrder.symbol
          }
        },
        update: {
          quantity: { increment: tradedQty },
          avgPrice: newBuyersAvgPrice
        },
        create: {
          userId: buyOrder.userId,
          symbol: buyOrder.symbol,
          quantity: tradedQty,
          avgPrice: newBuyersAvgPrice
        }
      });


      remainingQty -= tradedQty;

    }
    // If order still has remaining quantity, leave it as OPEN/PARTIAL
    return await tx.order.findUnique({
      where: { id: orderId }
    })
  });
}


const matchSellOrder = async (orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const sellOrder = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!sellOrder || sellOrder.status !== "OPEN") return;

    let remainingQty = sellOrder.quantity - sellOrder.filledQuantity;

    const buyOrders = await tx.order.findMany({
      where: {
        symbol: sellOrder.symbol,
        side: "BUY",
        status: "OPEN",
        price: { gte: sellOrder.price! },
        userId: { not: sellOrder.userId }
      },
      orderBy: [
        { price: "desc" }, // highest price first
        { createdAt: "asc" } // oldest first
      ]
    });

    for (const buy of buyOrders) {
      if (remainingQty === 0) break;

      const buyRemaining = buy.quantity - buy.filledQuantity;
      const tradedQty = Math.min(remainingQty, buyRemaining);
      const tradedPrice = buy.price!; // user buyers price (higher)

      // 1. Create trade record
      await tx.trade.create({
        data: {
          buyOrderId: buy.id,
          sellOrderId: sellOrder.id,
          symbol: sellOrder.symbol,
          price: tradedPrice,
          quantity: tradedQty
        }
      });

      //2. update sell order
      await tx.order.update({
        where: { id: sellOrder.id },
        data: {
          filledQuantity: { increment: tradedQty },
          status: (tradedQty === remainingQty)
            ? "FILLED"
            : "PARTIAL"
        }
      });

      //3. update buy order
      await tx.order.update({
        where: { id: buy.id },
        data: {
          filledQuantity: { increment: tradedQty },
          status: (tradedQty === remainingQty)
            ? "FILLED"
            : "PARTIAL"
        }
      });

      //4. transfer funds from buyer to seller
      const totalCost = new Prisma.Decimal(tradedPrice).mul(tradedQty);

      await tx.wallet.update({
        where: { userId: sellOrder.userId },
        data: {
          balance: { increment: totalCost }
        }
      });

      await tx.wallet.update({
        where: { userId: buy.userId },
        data: {
          lockedBalance: { decrement: totalCost }
        }
      });

      //5. transfer stcok from seller to buyer
      //update seller holding
      await tx.stockHolding.update({
        where: {
          userId_symbol: {
            userId: sellOrder.userId,
            symbol: sellOrder.symbol
          }
        },
        data: {
          // quantity: { decrement: tradedQty },
          locked: { decrement: tradedQty }
        }
      });

      //update buyers holding
      const buyerHolding = await tx.stockHolding.upsert({
        where: {
          userId_symbol: {
            userId: buy.userId,
            symbol: sellOrder.symbol
          }
        },
        update: {
          quantity: { increment: tradedQty }
        },
        create: {
          userId: buy.userId,
          symbol: buy.symbol,
          quantity: tradedQty
        }
      });

      remainingQty -= tradedQty
    }

    // If order still has remaining quantity, leave it as OPEN/PARTIAL
    return await tx.order.findUnique({
      where: { id: orderId }
    });
  });
}

const matchMarketBuy = async (orderId: string) => {
  return await prisma.$transaction( async (tx) => {
    const buyOrder = await tx.order.findUnique({
      where: {id: orderId}
    });

    if(!buyOrder || buyOrder.status !== "OPEN") return;

    let remainingQty = buyOrder.quantity - buyOrder.filledQuantity;

    const sellOrders = await tx.order.findMany({
      where: {
        symbol: buyOrder.symbol,
        side: "SELL",
        status: {in: ["OPEN", "PARTIAL"]},
        userId: {not:buyOrder.userId}
      },
      orderBy: [
        { price: "asc" },   // cheapestFirst
        { createdAt: "asc" }  // Oldest first
      ]
    });

    for (const sell of sellOrders) {
      if (remainingQty === 0) break;

      const sellRemaining = sell.quantity - sell.filledQuantity;
      const tradedQty = Math.min(remainingQty, sellRemaining);
      const tradePrice = sell.price!;   // use sellers price
      const totalTradeCost = new Prisma.Decimal(tradePrice).mul(tradedQty);

      const wallet = await tx.wallet.findUnique({
        where: { userId : buyOrder.userId }
      })

      if (wallet!.balance.lt(totalTradeCost)) {
        break; // can't afford more
      }

      // 1. Create trade
      await tx.trade.create({
        data: {
          buyOrderId: buyOrder.id,
          sellOrderId: sell.id,
          symbol: buyOrder.symbol,
          price: tradePrice,
          quantity: tradedQty
        }
      });

      // 2. Update orders
      await tx.order.update({
        where: { id: buyOrder.id },
        data: {
          filledQuantity: { increment: tradedQty },
          status:
            tradedQty === remainingQty ? "FILLED" : "PARTIAL"
        }
      });

      await tx.order.update({
        where: { id: sell.id },
        data: {
          filledQuantity: { increment: tradedQty },
          status:
            tradedQty === sellRemaining ? "FILLED" : "PARTIAL"
        }
      });

      // Release unused locked balance
      const priceDifference = buyOrder.price!.minus(tradePrice);
      const savedAmount = priceDifference.mul(tradedQty);

      await tx.wallet.update({
        where: { userId: buyOrder.userId },
        data: {
          balance: { decrement: totalTradeCost }  // return price difference to buyer
        }
      });

      // add funds to seller's wallet
      await tx.wallet.update({
        where: { userId: sell.userId },
        data: {
          balance: { increment: totalTradeCost }
        }
      });

      // transfer stocks from seller to buyer
      // update seller's holding
      await tx.stockHolding.update({
        where: {
          userId_symbol: {
            userId: sell.userId,
            symbol: buyOrder.symbol
          }
        },
        data: {
          locked: { decrement: tradedQty }
        }
      });

      const initialBuyerHolding = await tx.stockHolding.findUnique({
        where: {
          userId_symbol: {
            userId: buyOrder.userId,
            symbol: buyOrder.symbol
          }
        }
      });

      let newBuyersAvgPrice;
      if (initialBuyerHolding) {
        const oldQty = initialBuyerHolding.quantity;
        const oldCost = initialBuyerHolding.avgPrice.mul(oldQty);
        const newCost = new Prisma.Decimal(tradePrice).mul(tradedQty);

        const totalQty = oldQty + tradedQty;
        newBuyersAvgPrice = oldCost.add(newCost).div(totalQty);
      }
      else {
        newBuyersAvgPrice = tradePrice.toNumber() / tradedQty;
      }
      
      //update buyer's holdings
      const buyerHolding = await tx.stockHolding.upsert({
        where: {
          userId_symbol: {
            userId: buyOrder.userId,
            symbol: buyOrder.symbol
          }
        },
        update: {
          quantity: { increment: tradedQty },
          avgPrice: newBuyersAvgPrice
        },
        create: {
          userId: buyOrder.userId,
          symbol: buyOrder.symbol,
          quantity: tradedQty,
          avgPrice: newBuyersAvgPrice
        }
      });


      remainingQty -= tradedQty;

    }
    // If order still has remaining quantity, leave it as OPEN/PARTIAL
    return await tx.order.findUnique({
      where: { id: orderId }
    })

  });
}


const matchMarketSell = async (orderId: string) => {
  return await prisma.$transaction( async (tx) => {
    const sellOrder = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!sellOrder || sellOrder.status !== "OPEN") return;

    let remainingQty = sellOrder.quantity - sellOrder.filledQuantity;

    const buyOrders = await tx.order.findMany({
      where: {
        symbol: sellOrder.symbol,
        side: "BUY",
        status: "OPEN",
        userId: { not: sellOrder.userId }
      },
      orderBy: [
        { price: "desc" }, // highest price first
        { createdAt: "asc" } // oldest first
      ]
    });

    for (const buy of buyOrders) {
      if (remainingQty === 0) break;

      const buyRemaining = buy.quantity - buy.filledQuantity;
      const tradedQty = Math.min(remainingQty, buyRemaining);
      const tradedPrice = buy.price!; // user buyers price (higher)

      // 1. Create trade record
      await tx.trade.create({
        data: {
          buyOrderId: buy.id,
          sellOrderId: sellOrder.id,
          symbol: sellOrder.symbol,
          price: tradedPrice,
          quantity: tradedQty
        }
      });

      //2. update sell order
      await tx.order.update({
        where: { id: sellOrder.id },
        data: {
          filledQuantity: { increment: tradedQty },
          status: (tradedQty === remainingQty)
            ? "FILLED"
            : "PARTIAL"
        }
      });

      //3. update buy order
      await tx.order.update({
        where: { id: buy.id },
        data: {
          filledQuantity: { increment: tradedQty },
          status: (tradedQty + buy.filledQuantity === buy.quantity)
            ? "FILLED"
            : "PARTIAL"
        }
      });

      //4. transfer funds from buyer to seller
      const totalCost = new Prisma.Decimal(tradedPrice).mul(tradedQty);

      await tx.wallet.update({
        where: { userId: sellOrder.userId },
        data: {
          balance: { increment: totalCost }
        }
      });

      await tx.wallet.update({
        where: { userId: buy.userId },
        data: {
          lockedBalance: { decrement: totalCost }
        }
      });

      //5. transfer stcok from seller to buyer
      //update seller holding
      await tx.stockHolding.update({
        where: {
          userId_symbol: {
            userId: sellOrder.userId,
            symbol: sellOrder.symbol
          }
        },
        data: {
          // quantity: { decrement: tradedQty },
          locked: { decrement: tradedQty }
        }
      });

      //update buyers holding
      const buyerHolding = await tx.stockHolding.upsert({
        where: {
          userId_symbol: {
            userId: buy.userId,
            symbol: sellOrder.symbol
          }
        },
        update: {
          quantity: { increment: tradedQty }
        },
        create: {
          userId: buy.userId,
          symbol: buy.symbol,
          quantity: tradedQty
        }
      });

      remainingQty -= tradedQty
    }

    // If order still has remaining quantity, leave it as OPEN/PARTIAL
    return await tx.order.findUnique({
      where: { id: orderId }
    });

  });
}



export {
  matchBuyOrder,
  matchSellOrder,
  matchMarketBuy,
  matchMarketSell
}