const { ProductModel, CartModel } = require("../models");
const { deleteImage, storeImage, isIterable } = require("../lib/utils");
const AuthController = require("./AuthController");

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

  static async search(req, res, next) {
    const product = new ProductModel();
    const products = await product.search(req.query.q);
    product.close();
    res.render("products/search_list", {
      title: "Search results",
      products
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
    try {
      const { name, description, price } = req.body;
      const thumbnail = await storeImage(
        req?.files?.thumbnail,
        res.locals.base_dir + "/public/images/"
      );
      const product = new ProductModel();
      let productId = null;

      if (req.body.action === "create") {
        productId = await product.create({
          name,
          description,
          thumbnail: thumbnail || "",
          price: parseFloat(price),
        });
      } else if (req.body.action === "edit") {
        productId = req.body.id;
        await product.update(req.body.id, {
          name,
          description,
          thumbnail: thumbnail || req.body.current_thumbnail_name,
          price: parseFloat(price),
        });
      }

      const galleryImages = Array.isArray(req.files.gallery)
        ? req.files.gallery
        : [req.files.gallery];
      for (const file of galleryImages) {
        const galleryImage = await storeImage(
          file,
          res.locals.base_dir + "/public/images/"
        );
        if (galleryImage) {
          await product.addGalleryImage(productId, galleryImage);
        }
      }

      const redirectUrl =
        req.body.action === "edit"
          ? "/admin/products/edit/" + productId
          : "/admin/products";
      res.redirect(redirectUrl);
    } catch (err) {
      console.log(__filename + ":" + err);
      next(err);
    }
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
