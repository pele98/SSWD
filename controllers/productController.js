const Product = require("../models/product");
const User = require("../models/user");

module.exports = {
  index: (req, res, next) => {
    Product.find({})
      .then(product => {
        res.locals.product = product;
        res.locals.title = "All products"
        res.locals.owner = res.locals.currentUser !== undefined ? res.locals.currentUser.email : '';
        next();
      })
      .catch(error => {
        console.log(`Error fetching product: ${error.message}`);
        next(error);
      });
  },

  indexView: (req, res) => {
    res.render("products/index");
  },

  search: (req, res, next) => {
    let searchObj = {};
    
    req.query.name ? searchObj.name = {$regex: `${req.query.name}`, $options: "i"} : null;
    req.query.category ? searchObj.category = {$regex: `${req.query.category}`} : null;
    Product.find(searchObj)
      .then(product => {
        res.locals.product = product;
        res.locals.title = "Search results"
        res.locals.owner = res.locals.currentUser !== undefined ? res.locals.currentUser.email : '';
        next();
      })
      .catch(error => {
        console.log(`Error fetching product: ${error.message}`);
        next(error);
      });
  },

  searchView: (req, res) => {
    res.render("products/index");
  },

  new: (req, res) => {
    res.render("products/new");
  },

  create: (req, res, next) => {
    if (res.locals.currentUser === undefined) {
      req.flash("error", "Error: User logged out.");
      res.locals.redirect = "/users/login";
      next();
    }
    else {
    let productParams = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      image: req.body.image,
      price: req.body.price,
      ownerEmail: res.locals.currentUser.email,
      ownerZipCode: res.locals.currentUser.zipCode !== undefined ? res.locals.currentUser.zipCode : '',
      owner: res.locals.currentUser._id
    };
    Product.create(productParams)
      .then(product => {
        res.locals.redirect = "/products";
        res.locals.product = product;
        next();
      })
      .catch(error => {
        console.log(`Error saving product: ${error.message}`);
        next(error);
      });
    }
  },
  edit: (req, res, next) => {
    let productId = req.params.id;
    Product.findById(productId)
      .then(product => {
        res.render("products/edit", {
          product: product
        });
      })
      .catch(error => {
        console.log(`Error fetching product by ID: ${error.message}`);
        next(error);
      });
  },
  update: (req, res, next) => {
    let productId = req.params.id,
      productParams = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        image: req.body.image,
      };
    Product.findByIdAndUpdate(productId, {
      $set: productParams
    })
      .then(product => {
        res.locals.redirect = `/products/${productId}`;
        res.locals.product = product;
        next();
      })
      .catch(error => {
        console.log(`Error updating product by ID: ${error.message}`);
        next(error);
      });
  },
  updateUser: (req, res, next) => {
    if (res.locals.loggedIn) {
    const owner = res.locals.product.owner;
    const product = res.locals.product;
    User.findById(owner)
    .then(user => {
      user.ownProducts.push(product._id);
      user.save();
      next();
    })
    .catch(error => {
      console.log(`Error in finding user:${error.message}`);
      next(error);
    });
    } else {
      req.flash("error", "Error: User logged out.");
      res.locals.redirect = "/users/login";
      next();
    }
  },
  delete: (req, res, next) => {
    let productId = req.params.id;
    Product.findByIdAndRemove(productId)
      .then(() => {
        res.locals.redirect = "/products";
        next();
      })
      .catch(error => {
        console.log(`Error deleting product by ID: ${error.message}`);
        next();
      });
  },
  saveProduct: (req, res) => {
    let newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      image: req.body.image,
      price: req.body.price
    });
    newProduct
      .save()
      .then(result => {
        res.render("thanks");
      })
      .catch(error => {
        if (error) res.send(error);
      });
  },

  show: (req, res, next) => {
    let productId = req.params.id;
    Product.findById(productId)
      .then(product => {
        res.locals.product = product;
        res.locals.validator = res.locals.currentUser !== undefined
          ? res.locals.currentUser.email === product.ownerEmail
            ? true
            : false
          : false;
        next();
      })
      .catch(error => {
        console.log(`Error fetching product by ID: ${error.message}`);
        next(error);
      });
  },

  showView: (req, res) => {
    res.render("products/show");
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath !== undefined) res.redirect(redirectPath);
    else next();
  }
};