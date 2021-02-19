const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { User } = require('./models/User');
const mongoose = require('mongoose');

//application/x-www.form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err, 'error'))

app.get('/', (req, res) => res.send('Hello world!'));

// register
app.post('/register', (req, res) => {

    // 회원 가입할때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body);

    //save 전에 비밀번호 암호화
    user.save((err, useInfo) => {
        // 에러가 있으면 client에 json형식으로 전달
        if(err) return res.json({ success: false, err})

        //성 공하면 json으로 return 
        return res.status(200).json({
            success: true
        })
    })
})

// login
app.post('/login', (req, res) => {
    // 1. 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: '제공된 이메일에 해당하는 사용자가 없습니다.'
            })
        }

        // 2. 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({ loginSuccess: false, message: '비밀번호가 틀렸습니다. '});

            // 비밀번호가 같다면 token 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                // 토큰을 저장한다. 어디에? 쿠키 or 로컬스토리지 등
                res.cookir('x_auth', user.token).status(200).json({ loginSuccess: true, userId: user._id })
                
            })
        })

    })

    

    // 3. 비밀번호까지 같다면 token을 생성하기
})

app.listen(port, () => console.log(`Express app listening on port ${port}!`));

