const multer = require("multer");
const { validator, jwt, aws } = require("../utils");

const { systemConfig } = require("../configs");
const { productModel } = require("../models");

const registerProduct = async function (req, res) {
  try {
    const requestBody = req.body.json;

    const files = req.files;

    if (!validator.isValid(requestBody)) {
      res
        .status(400)
        .send({ status: false, message: "Invalid request , Body is required" });
      return;
    }

    if (!validator.isValidRequestBody(JSON.parse(requestBody))) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = JSON.parse(requestBody.trim());

    // Validation Starts

    if (!validator.isValid(title)) {
      res.status(400).send({ status: false, message: "Title is Required" });
      return;
    }

    if (!validator.isValid(description)) {
      res
        .status(400)
        .send({ status: false, message: "Description is Required" });
      return;
    }

    if (!validator.isValid(price)) {
      res.status(400).send({ status: false, message: "Price is Required" });
      return;
    }

    if (!validator.isValid(availableSizes)) {
      res
        .status(400)
        .send({ status: false, message: "availableSizes is Required" });
      return;
    }

    if (!validator.isValidArray(availableSizes)) {
      res.status(400).send({
        status: false,
        message: "Should have atleast one size available",
      });
      return;
    }

    if (!validator.isValid(files[0])) {
      res
        .status(400)
        .send({ status: false, message: "Product Image is required" });
      return;
    }

    // validation Ends

    // Parameter type Check

    if (!validator.isValidString(title)) {
      res
        .status(400)
        .send({ status: false, message: "title Should be a string" });
      return;
    }

    if (!validator.isValidString(description)) {
      res
        .status(400)
        .send({ status: false, message: "description Should be a string" });
      return;
    }

    if (!validator.isValidNumber(price)) {
      res
        .status(400)
        .send({ status: false, message: "price Should be a number" });
      return;
    }

    if (!validator.isValidString(currencyId)) {
      res
        .status(400)
        .send({ status: false, message: "currencyId Should be a String" });
      return;
    }

    let isTitleAlreadyInUse = await productModel.findOne({ title });

    if (isTitleAlreadyInUse) {
      res.status(400).send({ Status: false, msg: `${title} Already exists` });
      return;
    }

    

    if (!validator.isValidBoolean(isFreeShipping)) {
      res
        .status(400)
        .send({ status: false, message: "isFreeShipping Should be a boolean" });
      return;
    }

    if (style && !validator.isValidString(style)) {
      res
        .status(400)
        .send({ status: false, message: "style Should be a string" });
      return;
    }

    if (!validator.isArray(availableSizes)) {
      res
        .status(400)
        .send({ status: false, message: "AvailableSizes Should be a array" });
      return;
    }

    if (!validator.isValidSize(availableSizes)) {
      res.status(400).send({
        status: false,
        message: `AvailableSizes Should be among ${systemConfig.sizeEnumArray.join(
          ", "
        )}`,
      });
      return;
    }

    console.log(installments);
    if (
      installments &&
      (!validator.isValid(installments) ||
        !validator.isValidNumber(installments))
    ) {
      res
        .status(400)
        .send({ status: false, message: "installments Should be a number" });
      return;
    }

    // Validation Ends

    let productImage = await aws.uploadFile(files[0]);

    const productData = {
      title,
      description,
      price,
      currencyId,
      currencyFormat:"₹",
      isFreeShipping,
      productImage,
      style,
      availableSizes,
      installments,
    };

    const newProduct = await productModel.create(productData);
    res.status(201).send({
      status: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ Status: false, Msg: err.message });
  }
};

const listProducts = async function (req, res) {
  try {
    const filterQuery = { isDeleted: false };
    const queryParams = req.query;
    const sort = {};

    if (validator.isValidRequestBody(queryParams)) {
      const { size, productName, priceGreaterThan, priceLessThan, sortOrder } =
        queryParams;

      if (validator.isValid(productName)) {
        filterQuery["title"] = productName.trim();
      }

      if (validator.isValid(size)) {
        const sizeArr = size
          .trim()
          .split(",")
          .map((size1) => size1.trim());
        filterQuery["availableSizes"] = { $all: sizeArr };
      }
      if (validator.isValid(priceGreaterThan)) {
        filterQuery["price"] = { $gte: priceGreaterThan };
      }
      if (validator.isValid(priceLessThan)) {
        filterQuery["price"] = { $lte: priceLessThan };
      }
      if (validator.isValid(sortOrder)) {
        if (sortOrder === "ascending") {
          sortValue = 1;
        }
        if (sortOrder === "descending") {
          sortValue = -1;
        }
        sort.price = sortValue;
      }
    }

    const products = await productModel.find(filterQuery).sort(sort);

    if (Array.isArray(products) && products.length === 0) {
      res.status(404).send({ status: false, message: "No products found" });
      return;
    }

    res
      .status(200)
      .send({ status: true, message: "Products list", data: products });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId

        

        if (!validator.isValidObjectId(productId)) {
            res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
            return
        }


        const product = await productModel.findOne({_id: productId}, { __v: 0 })

        if (!product) {
            res.status(404).send({ status: false, message: "Product not found" })
        }

        res.status(200).send({ status: true, data:product})
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { registerProduct, listProducts,getProductById };
