var Product = require('../models/product');

var mongoose = require('mongoose');

// Connection URL
mongoose.connect('mongodb://localhost:27017/cakes');



var products = [
    new Product({
        imagePath: '/images/img1.jpeg',
        title: 'Chocolate Brownie',
        description: 'Amazing cake!!!',
        price: 3.99
    }),

    new Product({
        imagePath: '/images/img2.jpeg',
        title: 'Cupcakes',
        description: 'Awesome Cupcakes!!!',
        price: 1.99
    }),

    new Product({
        imagePath: '/images/img3.jpeg',
        title: 'Oreo Cheesecake',
        description: 'Magnificent Heaven!',
        price: 2.50
    }),

    new Product({
        imagePath: '/images/img4.jpeg',
        title: 'Duo Cheesecake',
        description: 'Best cake ever!!!',
        price: 6.00
    }),

    new Product({
        imagePath: '/images/img5.jpeg',
        title: 'Pink Cheesecake',
        description: 'Amazing cake!!!',
        price: 2.50
    }),

    new Product({
        imagePath: '/images/img6.jpeg',
        title: 'Cherry Cake',
        description: 'Melts in the mouth!!!',
        price: 9.99
    }),

    new Product({
        imagePath: '/images/img7.jpeg',
        title: 'Blue Dream',
        description: 'Awesome Blue Dream!!!',
        price: 1.50
    }),

    new Product({
        imagePath: '/images/img8.jpeg',
        title: 'Tiramisu',
        description: 'Amazing cake!!!',
        price: 2.99
    }),

    new Product({
        imagePath: '/images/img9.jpeg',
        title: 'Flower Power',
        description: 'Awesome cake!!!',
        price: 12.99
    })

];


var done = 0;


for (var i = 0; i < products.length; i++) {
    products[i].save(function (err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}


function exit() {
    mongoose.disconnect();
}
