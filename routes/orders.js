const express = require("express");
const ordersService = require("../services/orders-service");

const router = express.Router();

function orderResponse(order) {
  return {
    id: order.id,
    customerName: order.customerName,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.total,
    status: order.status,
  };
}

function validationProblem(message, details) {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message,
      details,
    },
  };
}

function notFoundProblem() {
  return {
    error: {
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    },
  };
}

router.post("/orders", (req, res) => {
  const validationErrors = ordersService.validateCreateOrder(req.body);

  if (validationErrors.length > 0) {
    return res
      .status(400)
      .json(validationProblem("Invalid order", validationErrors));
  }

  const newOrder = ordersService.createOrder(req.body);

  return res
    .status(201)
    .location(`/orders/${newOrder.id}`)
    .json(orderResponse(newOrder));
});

router.get("/orders", (req, res) => {
  const result = ordersService.listOrders().map(orderResponse);

  res.status(200).json({
    orders: result,
    count: result.length,
  });
});

router.get("/orders/:id", (req, res) => {
  const matchingOrder = ordersService.getOrder(req.params.id);

  if (!matchingOrder) {
    return res.status(404).json(notFoundProblem());
  }

  return res.status(200).json(orderResponse(matchingOrder));
});

router.delete("/orders/:id", (req, res) => {
  const deleted = ordersService.deleteOrder(req.params.id);

  if (!deleted) {
    return res.status(404).json(notFoundProblem());
  }

  return res.status(204).send();
});

module.exports = router;