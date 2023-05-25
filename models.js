const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    orders: [{
        orderId: Number,
        firstname: String,
        lastname: String,
        phonenumber: Number,
        address1: String,
        address2: String,
        city: String,
        state: String,
        orderPlaced: String,
        serviceDate: String,
        expectedServiceDate: String,
        serviceStatus: String,
        totalPrice: Number,
        totalItems: Number,
        services: [{
            title: String,
            price: Number,
            quantity: Number,
            image: String
        }]
    }],
    cart: [{
        id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: "Services"
        },
        servicetype: Number,
        quantity: Number
    }]
});

const servicesSchema = new mongoose.Schema({
    title: String,
    rating: Number,
    description: [String],
    image: String,
    services: [{
        title: String,
        price: Number,
        eta: Number,
        description: [String],
        image: String
    }]
});

servicesSchema.statics.getService = function(servicetitle) {
    return this.findOne({ title: servicetitle });
}

module.exports = {
    User: mongoose.model('User', userSchema, 'user'),
    Services: mongoose.model('Services', servicesSchema, 'Services')
}