const { CartModel, ProductModel } = require("../models");
const AuthController = require("./AuthController");


class OrdersController {
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
      quantity: quantity
    };

    if(action === "update") {
      cartModel.updateCartItem(cartItem,false);
    } else if(action === "delete") {
      cartModel.deleteCartItem(cartItem);
    }

    req.session.user.cart = await cartModel.get(cart_id);

    res.redirect("/users/"+req.session.user.id+"/cart");
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

    console.log(req.body);

    res.redirect("orders/order_success");
  }
}

module.exports = OrdersController;
