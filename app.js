var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var Handlebars = require('handlebars');
var {
    allowInsecurePrototypeAccess
} = require('@handlebars/allow-prototype-access');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo');
var favicons = require('favicons');
var path = require('path');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var mongoose = require('mongoose');

var app = express();


// Connection URL

mongoose.connect('mongodb://localhost:27017/cakes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
require('./config/passport');


// view engine setup
app.engine('.hbs', expressHbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', '.hbs');

app.use('/favicon.ico', express.static('images/favicon.ico'));

app.use(logger('dev'));
app.use(express.json());
// Bodyparser Middleware
app.use(express.urlencoded({
    extended: true
}));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'monikasecret',
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create(mongoose.connection),
    cookie: {
        maxAge: 180 * 60 * 1000
    }
}));

// flash  and passport has to be after  session secret is initialized 
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));


app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});


app.use('/user', userRouter);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
