const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const config = require('./config/key');

const { User } = require('./models/User');
const mongoose = require('mongoose');

//application/x-www.form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err, 'error'))

app.get('/', (req, res) => res.send('Hello world!'));

app.post('/register', (req, res) => {

    // 회원 가입할때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body);
    user.save((err, useInfo) => {
        // 에러가 있으면 client에 json형식으로 전달
        if(err) return res.json({ success: false, err})

        //성 공하면 json으로 return 
        return res.status(200).json({
            success: true
        })
    })
})

app.listen(port, () => console.log(`Express app listening on port ${port}!`));

