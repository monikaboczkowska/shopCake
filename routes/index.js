var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var fetch = require('node-fetch');

var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');


/* GET home page. */
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }

        res.render('shop/index', {
            title: 'Cake Shop',
            products: productChunks,
            successMsg: successMsg,
            noMessages: !successMsg
        });
    });

});

router.get('/add-to-cart/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function (err, product) {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/');
    });
});

router.get('/reduce/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id/', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {
            products: null
        });
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice
    });
});


router.get('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {
        total: cart.totalPrice,
        errMsg: errMsg,
        noError: !errMsg
    });
});


router.post('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);

    var stripe = require("stripe")("sk_test_51IoXBFEVeZ3umFBui5WgpBeOycfjHlxnQ97L5X2J5nO0UOPbQcXEdEExwn3EK2DegsAJWdc3suYQAdsioXBImXTo00POU2G49i");

    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "gbp",
        source: req.body.stripeToken,
        description: "Test Charge for Cakes Shop"
    }, function (err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }

        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });

        order.save(function (err, result) {
            req.flash('success', 'Thank you for shopping with us!');
            req.session.cart = null;
            res.redirect('/');
        });
    });
});


//*************************************SUBSCRIBE EMAIL

// Subscribe Form
router.get('/success', (req, res) => {
    res.render('success.hbs');
});

router.get('/fail', (req, res) => {
    res.render('fail.hbs');
});

router.post('/subscribe', function (req, res, next) {
    const {
        email
    } = req.body;

    // Make sure fields are filled
    if (!email) {
        res.redirect('/fail');
        return;
    }

    // Construct req data
    const data = {
        members: [
            {
                email_address: email,
                status: 'subscribed'
      }
    ]
    };

    const postData = JSON.stringify(data);

    fetch('https://us1.api.mailchimp.com/3.0/lists/3bf3fcf023', {
            method: 'POST',
            headers: {
                Authorization: 'auth 9dd931aaa37623f5a35c0a4f84a593b2-us1'
            },
            body: postData
        })
        .then(res.statusCode === 200 ?
            res.redirect('/success') :
            res.redirect('/fail'))
        .catch(err => console.log(err))
});




// *******************************finish subscribe form 

module.exports = router;


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
