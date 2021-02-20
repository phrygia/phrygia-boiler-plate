const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { User } = require('./models/User');
const { auth } = require('./middleware/auth');
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
app.post('/api/users/register', (req, res) => {

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
app.post('/api/users/login', (req, res) => {
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

            // 3. 비밀번호까지 같다면 token을 생성하기
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                // 토큰을 저장한다. 어디에? 쿠키 or 로컬스토리지 등
                res.cookie('x_auth', user.token).status(200).json({ loginSuccess: true, userId: user._id })
                
            })
        })
    })
})

// auth - 미들웨어
// role 0 -> 일반유저 0이 아니면 -> admin
app.get('/api/users/auth', auth, (req, res) => {

    // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authetication이 true라는 말
    res.status(200).json({
        _id: req.user.id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true, 
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role, 
        image: req.user.image
    })

})

// logout
app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user.id_id }, { token : '' }, (err, user) => {
        if(err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        })
    })
})

app.listen(port, () => console.log(`Express app listening on port ${port}!`));

// token을 계속 체크를 한다 클라이언트에서 서버에 가져왕서 복호화를 한다 쿠키를 

