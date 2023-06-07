const { LIMIT_FUNCTION_ARG } = require("sqlite3");
const { CartModel, ProductModel, OrderModel } = require("../models");
const AuthController = require("./AuthController");

class OrdersController {

  static async index(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    const orderModel = new OrderModel();
    const orders = await orderModel.getAll();

    res.render("admin/orders/index", {
      title: "orders",
      orders: orders,
      user: req.session.user,
    });
  }

  static async show(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    try {
      const orderModel = new OrderModel();
      const order = await orderModel.get(req.params.id);

      const productModel = new ProductModel();
      const orderItems = order.items;

      for (const item of orderItems) {
        item.product = await productModel.get(item.product_id);
      }

      order.items = orderItems;

      res.render("admin/orders/order", {
        title: "orders",
        user: req.session.user,
        order: order,
        total: order.items
          .reduce((acc, item) => {
            return acc + item.price * item.quantity;
          }, 0)
          .toFixed(2),
      });
    } catch (err) {
      console.log(err);
      res.locals.error = `Something went wrong, please try again later`;
      res.redirect(`/`);
    }
  }


  static async updateOrderStatus(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }
    const { status } = req.body;
    const { id } = req.params;

    console.log("------------------", status, id);

    const orderModel = new OrderModel();
    try {
      await orderModel.updateStatus(id, status);
      res.redirect(`/admin/orders/${id}`);
    }
    catch (err) {
      console.log(err);
      res.locals.error = `Something went wrong, please try again later`;
      res.redirect(`/`);
    }
  }

  static async addToCart(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    const { source, product_id, quantity } = req.body;

    try {
      const product = await new ProductModel().get(product_id);

      const cartModel = new CartModel();
      let cartId = req.session.user.cart?.id;
      if (!cartId) {
        cartId = await cartModel.create(req.session.user.id);
      }

      const cartItem = {
        cart_id: cartId,
        product_id: product.id,
        price: product.price,
        quantity: quantity,
      };

      await cartModel.addItem(cartId, cartItem);

      req.session.user.cart = await cartModel.get(cartId);

      cartModel.close();

      if (source === "product") {
        res.redirect(`/products/${product_id}`);
      } else if (source === "products") {
        res.redirect("/products");
      } else {
        res.redirect("/");
      }
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }

  static async showCart(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    if (req.session.user.cart?.items) {
      const productModel = new ProductModel();
      const cartItems = req.session.user.cart.items;

      for (const item of cartItems) {
        item.product = await productModel.get(item.product_id);
      }

      req.session.user.cart.items = cartItems;
      productModel.close();
    }

    res.render("cart/cart", {
      title: "users",
      user: req.session.user,
      total: req.session.user.cart?.items
        .reduce((acc, item) => {
          return acc + item.price * item.quantity;
        }, 0)
        .toFixed(2),
    });
  }

  static async updateCart(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }
    const { cart_id, product_id, quantity, action } = req.body;

    const cartModel = new CartModel();
    const cartItem = {
      cart_id: cart_id,
      product_id: product_id,
      quantity: quantity,
    };

    if (action === "update") {
      cartModel.updateCartItem(cartItem, false);
    } else if (action === "delete") {
      cartModel.deleteCartItem(cartItem);
    }

    req.session.user.cart = await cartModel.get(cart_id);

    res.redirect("/users/" + req.session.user.id + "/cart");
  }

  static async checkout(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    if (req.session.user.cart?.items) {
      const productModel = new ProductModel();
      const cartItems = req.session.user.cart.items;

      for (const item of cartItems) {
        item.product = await productModel.get(item.product_id);
      }

      req.session.user.cart.items = cartItems;
      productModel.close();
    }

    res.render("cart/CheckOut", {
      title: "users",
      user: req.session.user,
      total: req.session.user.cart?.items
        .reduce((acc, item) => {
          return acc + item.price * item.quantity;
        }, 0)
        .toFixed(2),
    });
  }

  static async makeOrder(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    const order = {
      user_id: req.session.user.id,
      number: Math.floor(Math.random() * 1000000000000),
      status: "pending",
      paymentmethod: req.body.paymentmethod,
      total_price: req.session.user.cart?.items.reduce((acc, item) => {
        return acc + item.price * item.quantity;
      }, 0).toFixed(2),
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      items: req.session.user.cart?.items.map((item) => {
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        };
      }),
    };

    try {
      const orderModel = new OrderModel();
      await orderModel.create(order);
      res.locals.success = `Your order with the number has been placed successfully, Thank you!`;
      await new CartModel().delete(req.session.user.cart.id);
      req.session.user.cart = null;
      res.redirect("/users/order-success");
    } catch (err) {
      console.log(err);
      res.locals.error = `Something went wrong, please try again later`;
      res.redirect(`/users/${req.session.user.id}/checkout`);
    }
  }

  static async orderSuccess(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    res.render("order/order_success", {
      title: "users",
      user: req.session.user,
    });
  }

  static async showUserOrders(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    try {
      const orderModel = new OrderModel();
      const orders = await orderModel.getByUserId(req.session.user.id);
      res.render("order/orders", {
        title: "users",
        user: req.session.user,
        orders: orders,
      });
    } catch (err) {
      console.log(err);
      res.locals.error = `Something went wrong, please try again later`;
      res.redirect(`/`);
    }
  }

  static async showUserOrderDetails(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    try {
      const orderModel = new OrderModel();
      const order = await orderModel.get(req.params.order_id);

      const productModel = new ProductModel();
      const orderItems = order.items;

      for (const item of orderItems) {
        item.product = await productModel.get(item.product_id);
      }

      order.items = orderItems;

      res.render("order/order_details", {
        title: "users",
        user: req.session.user,
        order: order,
        total: order.items
          .reduce((acc, item) => {
            return acc + item.price * item.quantity;
          }, 0)
          .toFixed(2),
      });
    } catch (err) {
      console.log(err);
      res.locals.error = `Something went wrong, please try again later`;
      res.redirect(`/`);
    }
  }
}

module.exports = OrdersController;
