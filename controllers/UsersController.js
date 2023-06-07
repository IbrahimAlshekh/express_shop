const { UserModel } = require("../models");
const { deleteImage, storeImage } = require("../lib/utils");

class UsersController {
  static async index(req, res, next) {
    const user = new UserModel();
    res.render("admin/users/index", {
      title: "users",
      users: await user.getAll(),
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
      const { first_name, last_name, username, email, password, is_admin } =
        req.body;
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

      res.redirect("/admin/users");
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
