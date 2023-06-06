const { ProductModel, CartModel } = require("../models");
const { deleteImage, storeImage, isIterable } = require("../lib/utils");
const AuthController = require("./AuthController");
const { log } = require("debug");

class ProductController {
  static async index(req, res, next) {
    const product = new ProductModel();
    res.render("admin/products/index", {
      title: "products",
      products: await product.getAll(false),
    });
  }

  static async indexCards(req, res, next) {
    const product = new ProductModel();
    res.render("products/products", {
      title: "products",
      products: await product.getAll(false),
    });
  }

  static async show(req, res, next) {
    const product = new ProductModel();
    const pickedProduct = await product.get(req.params.id);
    res.render("products/single_product", {
      title: pickedProduct.name,
      product: pickedProduct,
    });
  }

  static async addToCart(req, res, next) {
    if (!AuthController.isLoggedIn(req, res, next)) {
      return;
    }

    const { source, product_id, quantity } = req.body;

    const product = new ProductModel().get(product_id);

    if (req.session.user.cart) {
      log("cart exists");
      const cartId = req.session.user.cart.id;
      const cartModel = new CartModel();

      try {
        await cartModel.createCartItem(
          cartId,
          get(product_id).id,
          product.price,
          quantity
        );
      } catch (err) {
        next(err);
      }
    } else {
      log(">>>>cart does not exist");
      res.redirect("/");
      const cartModel = new CartModel();
      try {
        const cartId = await cartModel.create(req.session.user.id);
        log("cartID", cartId);
        await cartModel.createCartItem(
          cartId,
          product.id,
          product.price,
          quantity
        );
      } catch (err) {
        next(err);
      }
    }
  }

  static async edit(req, res, next) {
    const product = new ProductModel();
    res.render("admin/products/edit", {
      title: "products",
      product: await product.get(req.params.id),
    });
  }

  static create(req, res, next) {
    res.render("admin/products/create", { title: "products", product: {} });
  }

  static async store(req, res, next) {
    let thumbnail = storeImage(
      req?.files?.thumbnail,
      res.locals.base_dir + "/public/images/"
    );
    const product = new ProductModel();
    let productId = null;
    if (req.body.action === "create") {
      productId = await product.create({
        name: req.body.name,
        description: req.body.description,
        thumbnail: thumbnail ?? "",
        price: parseFloat(req.body.price),
      });
    } else if (req.body.action === "edit") {
      productId = req.body.id;
      product.update(req.body.id, {
        name: req.body.name,
        description: req.body.description,
        thumbnail: thumbnail ?? req.body.current_thumbnail_name,
        price: parseFloat(req.body.price),
      });
    }

    if (req.files) {
      if (isIterable(req.files.gallery)) {
        for (let file of req.files.gallery ?? []) {
          let galleryImage = storeImage(
            file,
            res.locals.base_dir + "/public/images/"
          );
          if (galleryImage) {
            product.addGalleryImage(productId, galleryImage);
          }
        }
      } else {
        let galleryImage = storeImage(
          req.files.gallery,
          res.locals.base_dir + "/public/images/"
        );
        if (galleryImage) {
          product.addGalleryImage(productId, galleryImage);
        }
      }
    }

    res.redirect(
      req.body.action === "edit"
        ? "/admin/products/edit/" + productId
        : "/admin/products"
    );
  }

  static async delete(req, res, next) {
    const product = new ProductModel();
    const productData = await product.get(req.params.id);
    deleteImage(res.locals.image_dir + productData.thumbnail);
    for (const image of productData.gallery) {
      deleteImage(res.locals.image_dir + image.image);
    }
    await product.delete(req.params.id);
    res.redirect("/admin/products");
  }

  static async deleteGalleryImage(req, res, next) {
    const product = new ProductModel();
    const galleryImage = await product.getGalleryImage(req.params.id);
    deleteImage(res.locals.image_dir + galleryImage.image);
    await product.deleteGalleryImage(req.params.id);
    res.redirect("/admin/products/edit/" + galleryImage.product_id);
  }
}

module.exports = ProductController;
