const { UserModel, ProductModel } = require("../models");
const { deleteImage, storeImage } = require("../lib/utils");
const AuthController = require("./AuthController");

class UsersController {
  static async index(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }
    const user = new UserModel();
    res.render("admin/users/index", {
      title: "users",
      users: await user.getAll(),
    });
  }

  static async showProfile(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }
    res.render("users/profile", {
      title: "users",
      user: req.session.user,
    });
  }

  static async showCart(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    if (req.session.user.cart?.items) {
      const productModel = new ProductModel();
      const cartItems =req.session.user.cart.items;

      for (const item of cartItems) {
        item.product = await productModel.get(item.product_id);
      }

      req.session.user.cart.items = cartItems;
      productModel.close();
    }

    res.render("cart/cart", {
      title: "users",
      user: req.session.user,
      total: req.session.user.cart?.items.reduce((acc, item) => {
        return acc +(item.price * item.quantity);
      } , 0).toFixed(2),
    });
  }

  static async checkout(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    if (req.session.user.cart?.items) {
      const productModel = new ProductModel();
      const cartItems =req.session.user.cart.items;

      for (const item of cartItems) {
        item.product = await productModel.get(item.product_id);
      }

      req.session.user.cart.items = cartItems;
      productModel.close();
    }

    res.render("cart/CheckOut", {
      title: "users",
      user: req.session.user,
      total: req.session.user.cart?.items.reduce((acc, item) => {
        return acc +(item.price * item.quantity);
      } , 0).toFixed(2),
    });

  }


  static async editProfile(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }
    res.render("users/editprofile", {
      title: "users",
      user: req.session.user,
    });
  }

  static async edit(req, res, next) {
    const user = new UserModel();
    res.render("admin/users/edit", {
      title: "users",
      user: await user.get(req.params.id),
    });
  }

  static create(req, res, next) {
    res.render("admin/users/create", { title: "users", user: {} });
  }

  static async store(req, res, next) {
    try {
      const {
        action,
        user_id,
        first_name,
        last_name,
        username,
        email,
        password,
        is_admin,
      } = req.body;
      const profileImage = req?.files?.profile_image;
      let profileImageName = await storeImage(
        profileImage,
        res.locals.base_dir + "/public/images/"
      );

      const user = new UserModel();
      const userData = {
        first_name,
        last_name,
        username,
        email,
        password,
        profile_image: profileImageName,
        is_admin: is_admin === "on" ? 1 : 0,
      };

      if (req.body.action === "create") {
        await user.create(userData);
      } else if (req.body.action === "edit") {
        await user.update(req.body.id, userData);
      }

      if (action === "edit") {
        res.redirect("/admin/users");
      } else if (action === "edit_profile") {
        res.redirect("/users/" + user_id + "/profile");
      }
    } catch (err) {
      console.log(__filename + ":" + err);
      next(err);
    }
  }

  static async delete(req, res, next) {
    const user = new UserModel();
    const productData = await user.get(req.params.id);
    deleteImage(res.locals.image_dir + productData.profile_image);
    user.delete(req.params.id);
    res.redirect("/admin/users");
  }
}

module.exports = UsersController;
