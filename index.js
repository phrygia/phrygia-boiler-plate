const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://phrygia:dusu5750@cluster0.jrrdo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err, 'error'))

app.get('/', (req, res) => res.send('Hello world!'));
app.listen(port, () => console.log(`Express app listening on port ${port}!`))