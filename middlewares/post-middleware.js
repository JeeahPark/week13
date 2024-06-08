const {body, validationResult} = require('express-validator');

// Validation rules for Posting //권한 없는 경우는 auth middleware에서 처리
const postingRules = ()=>{
    return [
        body('title')
            .isLength({min: 1})
            .withMessage('제목을 입력해주세요.'),
        body('content')
            .isLength({min: 1})
            .withMessage('내용을 입력해주세요.'),
    ];
};

// Middleware to check Posting validation errors
const postValidate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()){
        return next();
    }

    return res.status(400).json({errors: errors });
};


module.exports = {
    postingRules,
    postValidate,
}