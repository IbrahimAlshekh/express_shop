CREATE TABLE IF NOT EXISTS "users"
(
  "id"            int,
  "first_name"    string,
  "last_name"     string,
  "username"      string,
  "email"         string,
  "password"      string,
  "profile_image" string
);

CREATE TABLE IF NOT EXISTS "products"
(
  "id"          int,
  "name"        string,
  "description" string,
  "price"       float,
  "thumnail"    string
);

CREATE TABLE IF NOT EXISTS "product_images"
(
  "id"         int,
  "name"       string,
  "image"      string,
  "product_id" int,
  FOREIGN KEY("product_id") REFERENCES products("id")
);

CREATE TABLE IF NOT EXISTS "orders"
(
  "id"            int,
  "user_id"       int,
  "status"        string,
  "paymentmethod" string,
  "total_price"   float,
  "created_at"    datetime,
  FOREIGN KEY("user_id") REFERENCES users("id")
);

CREATE TABLE IF NOT EXISTS "order_items"
(
  "id"         int,
  "product_id" int,
  "price"      float,
  "quantity"   int,
  "order_id"   int,
  FOREIGN KEY("product_id") REFERENCES products("id"),
  FOREIGN KEY("order_id") REFERENCES orders("id")
);

CREATE TABLE IF NOT EXISTS "carts"
(
  "int"     id,
  "user_id" int,
  FOREIGN KEY("user_id") REFERENCES users("id")
);

CREATE TABLE IF NOT EXISTS "cart_items"
(
  "id"         int,
  "product_id" int,
  "price"      float,
  "quantity"   int,
  "cart_id"    int,
  FOREIGN KEY("product_id") REFERENCES products("id"),
  FOREIGN KEY("cart_id") REFERENCES carts("id")
);