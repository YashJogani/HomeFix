const express = require("express");
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const { User, Services } = require('./models');
const path = require("path");
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
let userId = null;
let username = null;

app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    store: new MongoDBStore({
        uri: process.env.MONGO_URL,
        collection: 'sessions'
    }),
    cookie: {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

const options = { 
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    daySuffix: (d) => {
        switch (d % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
        }
    }
};

app.post("/validate-login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email: email });

        if (user && user.password === password) {
            userId = new mongoose.Types.ObjectId(user._id);
            username = user.firstname;
            req.session.username = username;
            req.session.userId = userId;
            res.status(200).send();
        }
        else if (user && user.password !== password) {
            res.status(401).send("Invalid Password!");
        }
        else {
            res.status(401).send("User have not registered!");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.send({ logout: true });
});

app.post("/place-order", async (req, res) => {
    try {
        const orderDetails = {};
        orderDetails.firstname = req.body.firstname;
        orderDetails.lastname = req.body.lastname;
        orderDetails.phonenumber = req.body.phonenumber;
        orderDetails.address1 = req.body.housenumber;
        orderDetails.address2 = req.body.area;
        orderDetails.city = req.body.city;
        orderDetails.state = req.body.state;
        orderDetails.serviceStatus = "Service Booked";
        orderDetails.serviceDate = "";

        const now = new Date();

        orderDetails.orderId = now.valueOf();

        now.setDate(now.getDate());
        let dateFormatted = now.toLocaleDateString('en-US', options);

        orderDetails.orderPlaced = dateFormatted;

        now.setDate(now.getDate() + 1);
        dateFormatted = now.toLocaleDateString('en-US', options);

        orderDetails.expectedServiceDate = dateFormatted;

        const userCart = await User.findOne({ _id: userId }, { cart: 1 }).populate({
            path: 'cart.id',
            model: 'Services',
            select: 'services'
        });

        let totalPrice = 0;
        let totalItems = 0;
        const services = [];

        userCart.cart.forEach(item => {
            totalPrice += item.id.services[item.servicetype].price * item.quantity;
            totalItems += item.quantity;
            const service = {};
            service.title = item.id.services[item.servicetype].title;
            service.price = item.id.services[item.servicetype].price;
            service.quantity = item.quantity;
            service.image = item.id.services[item.servicetype].image;

            services.push(service);
        });
        
        orderDetails.totalPrice = totalPrice;
        orderDetails.totalItems = totalItems;
        orderDetails.services = services;

        const order = await User.updateOne(
            { _id: userId },
            { $push: { orders: orderDetails } }
        );

        const cartEmpty = await User.updateOne(
            { _id: userId },
            { cart: [] }
        );
        res.send({ orderId: orderDetails.orderId });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/create-account", async (req, res) => {
    try {
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const password = req.body.password;

        let user = await User.findOne({ email: email });

        if (user) {
            return res.status(401).send("User already registered!");
        }

        const newUser = new User({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password,
            orders: [],
            cart: []
        });

        user = await newUser.save();
        username = user.firstname;
        userId = user._id;
        req.session.username = username;
        req.session.userId = userId;
        res.status(200).send();
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/addCartService", async (req, res) => {
    try {
        const service = await User.updateOne(
            { _id: userId },
            { $push: { cart: { id: new mongoose.Types.ObjectId(req.query.serviceid), servicetype: req.query.servicetype, quantity: 1 } } }
        );
        res.send(service);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/removeCartService", async (req, res) => {
    try {
        const service = await User.updateOne(
            { _id: userId },
            { $pull: { cart: { id: new mongoose.Types.ObjectId(req.query.serviceid), servicetype: req.query.servicetype } } }
        );
        res.send(service);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/updateCartItemQuantity", async (req, res) => {
    try {
        const service = await User.updateOne(
            { _id: userId, cart: {$elemMatch: {id: new mongoose.Types.ObjectId(req.query.serviceid), servicetype: req.query.servicetype}} },
            { $set: { "cart.$.quantity": req.query.quantity } }
        );
        res.send(service);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/", (req, res) => {
    userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
    username = typeof req.session.username !== 'undefined' ? req.session.username : null;
    
    res.render("index", { username });
});

app.get("/profile", async (req, res) => {
    userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
    username = typeof req.session.username !== 'undefined' ? req.session.username : null;

    if (!username) {
        return res.redirect("/login");
    }

    const user = await User.findById(userId, {password: 0, cart: 0, orders: 0});
    res.render("profile", { username, user });
});

app.get("/login", (req, res) => {
    userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
    username = typeof req.session.username !== 'undefined' ? req.session.username : null;

    if (username) {
        return res.redirect("/");
    }
    res.render("login");
});

app.get("/signup", (req, res) => {
    userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
    username = typeof req.session.username !== 'undefined' ? req.session.username : null;

    if (username) {
        return res.redirect("/");
    }
    res.render("signup");
});

app.get("/service", async (req, res) => {
    try {
        userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
        username = typeof req.session.username !== 'undefined' ? req.session.username : null;

        const serviceData = await Services.getService(req.query.service);

        if (username) {
            const userCart = await User.findById(userId, { cart: 1 }).populate({
                path: 'cart.id',
                model: 'Services',
                select: 'services'
            });
            const cart = userCart.cart;
            res.render("service", { username, serviceData, cart });
        }
        else {
            const cart = [];
            res.render("service", { username, serviceData, cart });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/orders", async (req, res) => {
    userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
    username = typeof req.session.username !== 'undefined' ? req.session.username : null;

    if (!username) {
        return res.redirect("/login");
    }
    try {
        const userOrders = await User.findById(userId, { orders: 1 });
        const orders = userOrders.orders;
        res.render("orders", { username, orders });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/cart", async (req, res) => {
    userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
    username = typeof req.session.username !== 'undefined' ? req.session.username : null;

    if (!username) {
        return res.redirect("/login");
    }
    try {
        const userCart = await User.findById(userId, { cart: 1 }).populate({
            path: 'cart.id',
            model: 'Services',
            select: 'services'
        });
        const cart = userCart.cart;
        res.render("cart", { username, cart });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/place-order", async (req, res) => {
    userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
    username = typeof req.session.username !== 'undefined' ? req.session.username : null;

    if (!username) {
        return res.redirect("/login");
    }
    try {
        const user = await User.findById(userId, { firstname: 1, lastname: 1, cart: 1 }).populate({
            path: 'cart.id',
            model: 'Services',
            select: 'services'
        });

        if (!user.cart.length) {
            return res.redirect("/");
        }

        const now = new Date();

        now.setDate(now.getDate() + 1);
        const dateFormatted = now.toLocaleDateString('en-US', options);
        res.render("place-order", { user, dateFormatted });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/order-details", async (req, res) => {
    userId = typeof req.session.userId !== 'undefined' ? req.session.userId : null;
    username = typeof req.session.username !== 'undefined' ? req.session.username : null;

    if (!username) {
        res.redirect("/login");
    }

    try {
        const userOrders = await User.findOne({ _id: userId, orders: {$elemMatch: {orderId: req.query.orderId}} }, { "orders.$": 1 });
        const order = userOrders.orders[0];

        res.render("order-details", { username, order });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(3000, () => {
    console.log("server started on port 3000");
});
