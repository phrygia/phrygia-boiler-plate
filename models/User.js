const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //공백제거
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: { //일반유저, 관리자 
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// user를 저장하기 전의 액션 설정
userSchema.pre('save', function(next) {
    var user = this;

    // 비밀번호를 수정할때만
    if(user.isModified('password')) {
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err);  //next 실행시 index.js의 user.save가 실행

            //salt 생성 - plain password
            bcrypt.hash(user.password, salt, function(err, hash) { //hash - 암호화된 비밀번호
                if(err) return next(err);
                user.password = hash;
                next();
            });
        }); 
    } else {
        next();
    };
})


userSchema.methods.comparePassword = function(plainPassword, cb) {
    // plainPassword와 bcrypt로 암호화된 password가 같은지 체크해야 함 
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        //비밀번호가 다르면
        if(err) return cb(err),

        //비밀번호가 같다면 - true
        cb(null, isMatch)
    })
    // cb
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToekn');
    // user._id + 'secretToken' = token
    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    });
}

//스키마를 model로 감싸줌
const User = mongoose.model('User', userSchema)

module.exports = { User };