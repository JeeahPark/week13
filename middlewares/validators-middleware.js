const {body, validationResult} = require('express-validator');

// Validation rules for user registration
const userRegisterationRules = ()=>{
    return [
        body('nickname')
            .isLength({min: 3})
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage('닉네임은 최소 3글자이며 알파벳 대소문자 혹은 숫자만 사용할 수 있습니다.'),
        body('password')
            .isLength({min: 4})
            .withMessage('비밀번호는 최소 4글자 입니다.')
            .custom((value, {req}) => {
                if (value.includes(req.body.nickname)){
                    throw new Error('비밀번호에는 닉네임을 포함할 수 없습니다.');
                }
                return true;
            }),
        body('confirmPassword')
            .custom((value, {req}) => {
                if (value !== req.body.password){
                    throw new Error('비밀번호 확인 값이 다릅니다.');
                }
                return true;
            }),
    ];
};

// Middleware to check for validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()){
        return next();
    }

    // remove unneccessary information
    const extractedErrors = errors.array().map(err =>{
        const {type, value, path, location, ...rest } = err;
        return rest;
    })

    return res.status(400).json({errors: extractedErrors });
};

module.exports = {
    userRegisterationRules,
    validate,
};