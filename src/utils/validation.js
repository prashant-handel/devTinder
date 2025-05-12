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

const validateProfileEditData = (req) => {
    const allowedFields = ["firstName", "lastName", "photoUrl", "gender", "age", "skills", "about"];
    const dataToUpdate = req?.body;
    try {
        const keys = Object.keys(dataToUpdate);
        const isValidFields = keys.every((key) => allowedFields.includes(key));
        if(!isValidFields) {
            const errorObj = {
                status: false,
                message: 'Invalid fields'
            }
            throw new Error(errorObj);
        }

        return {
        status: true,
        message: 'Valid data'
    }
    }
    catch (err) {
        const errorObj = {
            status: false,
            message: 'Invalid fields'
        }
        throw new Error(JSON.stringify(errorObj));
    }
}

module.exports = {
    validateSignupData,
    validateProfileEditData
}