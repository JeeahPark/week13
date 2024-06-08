const {body, validationResult} = require('express-validator');

// Validation rules for Commenting //권한 없는 경우는 auth middleware에서 처리
const commentingRules = ()=>{
    return [
        body('comment')
            .isLength({min: 1})
            .withMessage('댓글 내용을 입력해주세요.')
    ];
};

// Middleware to check Commenting validation errors
const commentValidate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()){
        return next();
    }
    return res.status(400).json({ errors: errors });
};

module.exports = {
    commentingRules,
    commentValidate,
}