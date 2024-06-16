import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const stripeGateway = stripe(process.env.STRIPE_API_KEY);
const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('public'));
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// Success and cancel routes
app.get('/success', (req, res) => {
    res.sendFile('success.html', { root: 'public' });
});

app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', { root: 'public' });
});

app.get('/forgotPassword', (req, res) => {
    res.sendFile('forgotPassword.html', { root: 'public' });
});


//update password
app.post('/update-user', (req, res) => {
    const updatedUserData = req.body;
    const userFilePath = path.join(__dirname, 'public', 'user.json');
    fs.writeFile(userFilePath, JSON.stringify(updatedUserData, null, 2), (err) => {
        if (err) {
            res.status(500).send('Error updating user data.');
            return;
        }
        res.send('User data updated successfully.');
    });
});


//update username
app.post('/update-username', (req, res) => {
    const { email, newUsername } = req.body;
    const userFilePath = path.join(__dirname, 'public', 'user.json');

    fs.readFile(userFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading user data.');
            return;
        }

        let userData = JSON.parse(data);
        let user = userData.user.find(user => user.fields.email === email);

        if (user) {
            user.fields.username = newUsername;
            fs.writeFile(userFilePath, JSON.stringify(userData, null, 2), (err) => {
                if (err) {
                    res.status(500).send('Error updating user data.');
                    return;
                }
                res.send('Username updated successfully.');
            });
        } else {
            res.status(404).send('User not found.');
        }
    });
});


//register new user
app.post('/register-user', (req, res) => {
    const { email, password, username } = req.body;
    const userFilePath = path.join(__dirname, 'public', 'user.json');

    fs.readFile(userFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading user data.' });
        }

        const userData = JSON.parse(data);
        const userEmail = userData.user.find(user => user.fields.email === email);
        const userName = userData.user.find(user => user.fields.username === username);

        if (userEmail) {
            return res.status(400).json({ message: 'This Email has already been registered.' });
        }

        if (userName) {
            return res.status(400).json({ message: 'This Username has already been registered.' });
        }

        const newId = (parseInt(userData.user[userData.user.length - 1].sys.id) + 1).toString();
        const newUser = {
            sys: {
                id: newId
            },
            fields: {
                username: username,
                password: password,
                usedPassword: [],
                email: email
            }
        };

        userData.user.push(newUser);

        fs.writeFile(userFilePath, JSON.stringify(userData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing user data.' });
            }

            res.status(200).json({ message: 'User registered successfully.' });
        });
    });
});


// Stripe checkout
app.post('/stripe-checkout', async (req, res) => {
    try {
        const items = req.body.items;
        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.title,
                        images: [item.productImg],
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.amount,
            };
        });

        // Create checkout session
        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${DOMAIN}/success`,
            cancel_url: `${DOMAIN}/cancel`,
            line_items: lineItems,
            billing_address_collection: 'required'
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log(`Server started on port 3000 : http://localhost:3000`);
});
