const validator = require('validator');

const validateSignupData = (req) => {
    const {firstName, lastName, emailId, password } = req?.body;

    if(!firstName || !lastName || !emailId || !password) {
        const errorObj = {
            status: false,
            message: 'Please fill all the fields'
        };
        throw new Error(JSON.stringify(errorObj));
    }
    if(!validator.isAlpha(firstName) || !validator.isAlpha(lastName)) {
        errorObj = {
            status: false,
            message: 'First name and last name should only contain alphabets'
        };
        throw new Error(JSON.stringify(errorObj));
    }
    if(!validator.isEmail(emailId)) {
        errorObj = {
            status: false,
            message: 'Invalid email'
        }
        throw new Error(JSON.stringify(errorObj));
    }
    if(!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
        errorObj = {
            status: false,
            message: 'Enter a strong password'
        }
        throw new Error(JSON.stringify(errorObj));
    }
    return {
        status: true,
        message: 'Valid data'
    }
}

module.exports = {
    validateSignupData
}