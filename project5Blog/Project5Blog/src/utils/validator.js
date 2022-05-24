const mongoose = require('mongoose')

 const {systemConfig} = require('../configs')

const reemail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const rephone = /^[6-9][0-9]{9}$/;

const reimage = /.*\.(jpeg|jpg|png)$/

// mobile
const validatePhone = function (phone) {
  return rephone.test(phone);
};

// email
const validateEmail = function(email) {
    return reemail.test(email)
};

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


//password
const PasswordLength = function(password) {
    if(password.length >= 8 && password.length <= 15) return true
    return false;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

// file
const isValidFiles = function(requestFiles) {
    return requestFiles.length > 0 
}

// image 
const isValidImage = function(image) {
    return reimage.test(image.originalname)
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidString = function(value) {
    return Object.prototype.toString.call(value) === "[object String]"
}

const isValidNumber = function(value) {
    return Object.prototype.toString.call(value) === "[object Number]"
}

const isValidBoolean = function(value) {
    return Object.prototype.toString.call(value) === "[object Boolean]"
}

const isArray = function(arr) {
    return Array.isArray(arr)
}


const isValidArray = function(array) {
    return Object.keys(array).length > 0
}

const isValidSize = function(size) {
    let result = true;
    for(let i=0; i<size.length; i++){   
        if(systemConfig.sizeEnumArray.indexOf(size[i]) === -1) result = false
    }
    return result
}

//price
const isValidPrice = function(price){
    return price > 0
}

//currencyId 
const isValidCurrencyId = function(currencyId){
    return currencyId == "INR"
}

//currencyFormat 

// const isValidDate = function(value) {
//     return Object.prototype.toString.call(value) === "[object Date]"
// }

module.exports = {
    validateEmail,
    emailRegex : reemail,
    isValid,
    // isValidTitle,
    isValidRequestBody,
    isValidObjectId,
    isValidString,
    isArray,
    PasswordLength,
    // isValidDate,
    isValidNumber,
    // ratingRange,
    isValidFiles,
    validatePhone,
    phoneRegex : rephone,
    isValidImage,
    imageRegex : reimage,
    isValidPrice,
    isValidCurrencyId,
    isValidSize,
    isValidArray,
    isValidBoolean
};