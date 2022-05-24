const { validator, jwt, aws } = require("../utils");

const { systemConfig } = require("../configs");
const { userModel } = require("../models");

const registerUser = async function (req, res) {
  try {
    const requestBody = JSON.parse(req.body.data)
    const files = req.files;
    

    if (!validator.isValidRequestBody(requestBody)) {
      res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameters. Please provide user details",
        });
      return;
    }

    // Extract params
    const { fname, lname, email, phone, password, address } =
      requestBody; // Object destructing

    // file validation
    if (!validator.isValidFiles(files)) {
      res.status(400).send({ status: false, message: "file must be sent" });
    }
    //image validation
    if (!validator.isValidImage(files[0])) {
      res
        .status(400)
        .send({ status: false, message: "file format should be image" });
    }

    // email validation
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }

    if (!validator.validateEmail(email)) {
      res
        .status(400)
        .send({
          status: false,
          message: `Email should be a valid email address`,
        });
      return;
    }

    const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property

    if (isEmailAlreadyUsed) {
      res
        .status(400)
        .send({
          status: false,
          message: `${email} email address is already registered`,
        });
      return;
    }

    // phone validation
    if (!validator.isValid(phone)) {
      res.status(400).send({ status: false, message: "phone is required" });
      return;
    }

    if (!validator.isValidNumber(parseInt(phone))) {
      res
        .status(400)
        .send({ status: false, message: "phone attribute should be a number" });
      return;
    }

    const isPhoneAlreadyUsed = await userModel.findOne({ phone });

    if (isPhoneAlreadyUsed) {
      res
        .status(400)
        .send({ status: false, message: `${phone} is already registered` });
      return;
    }

    // name validation
    if (!validator.isValid(fname)) {
      res.status(400).send({ status: false, message: "fname is required" });
      return;
    }

    if (!validator.isValid(lname)) {
      res.status(400).send({ status: false, message: "lname is required" });
      return;
    }

    // password validation
    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }

    if (!validator.PasswordLength(password)) {
      res
        .status(400)
        .send({
          status: false,
          message: `Password length should be 8 - 15 characters`,
        });
      return;
    }

   
    if (!validator.isValid(address)){
      res.status(400).send({ status: false, message: 'address is Required' })
      return
  };

  if (!validator.isValid(address.shipping)){
      res.status(400).send({ status: false, message: 'Shipping address is Required' })
      return
  };     
  
  // if (!validator.isValid(address.billing)){
  //     res.status(400).send({ status: false, message: 'Billing address is Required' })
  //     return
  // };  

  if (!validator.isValid(address.shipping.street)){
      res.status(400).send({ status: false, message: 'Shipping street address is Required' })
      return
  };  
  
  if (!validator.isValid(address.shipping.city)){
      res.status(400).send({ status: false, message: 'Shipping city address is Required' })
      return
  };  
  
  if (!validator.isValid(address.shipping.pincode)){
      res.status(400).send({ status: false, message: 'Shipping pincode address is Required' })
      return
  };  
   
     
  if (!validator.isValid(address.billing.street)){
    res.status(400).send({ status: false, message: 'Billing street address is Required' })
    return
};  

if (!validator.isValid(address.billing.city)){
    res.status(400).send({ status: false, message: 'Billing city address is Required' })
    return
};  

if (!validator.isValid(address.billing.pincode)){
    res.status(400).send({ status: false, message: 'Billing pincode address is Required' })
    return
}; 
    // validation ends

    // file code
    let profileImage = await aws.uploadFile(files[0]);

    if (!profileImage) {
      res.status(400).send({ status: false, msg: "file not uploaded" });
      return;
    }

    const userData = {
      fname,
      lname,
      email,
      profileImage,
      phone,
      password,
      address,
    };
    const newUser = await userModel.create(userData);

    res.status(201).send({ status: true, message: `Success`, data: newUser });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const loginUser = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameters. Please provide login details",
        });
      return;
    }

    // Extract params
    const { email, password } = requestBody;

    // Validation starts
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }

    if (!validator.validateEmail(email)) {
      res
        .status(400)
        .send({
          status: false,
          message: `Email should be a valid email address`,
        });
      return;
    }

    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }
    // Validation ends

    const user = await userModel.findOne({ email, password });

    if (!user) {
      res
        .status(401)
        .send({ status: false, message: `Invalid login credentials` });
      return;
    }

    const token = await jwt.createToken({ userId: user._id });

    res.header("x-api-key", token);
    res.status(200).send({ status: true, message: `success`, data: { token } });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
