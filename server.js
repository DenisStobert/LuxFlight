require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const fetch = require('node-fetch');
const sgMail = require('@sendgrid/mail');
const crypto = require("crypto");

const dataStore = {};

const app = express();
app.use(bodyParser.json());

const JSON_BIN_API_URL = 'https://api.jsonbin.io/v3/b/674f0face41b4d34e45f138c';

sgMail.setApiKey('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');

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Route to generate unique IDs
app.get('/generate-id', async (req, res) => {
  try {
    // Fetch the current counter value
    const response = await axios.get(JSON_BIN_API_URL, {
      headers: { 'X-Master-Key': process.env.JSONBIN_MASTER_KEY },
    });

    let uniqueIdCounter = response.data.record.uniqueIdCounter;

    // Increment the counter
    uniqueIdCounter++;

    // Update the bin with the new counter value
    await axios.put(
      JSON_BIN_API_URL,
      { uniqueIdCounter },
      { headers: { 'X-Master-Key': process.env.JSONBIN_MASTER_KEY, 'Content-Type': 'application/json' } }
    );

    res.json({ uniqueId: uniqueIdCounter });
  } catch (error) {
    console.error('Error with JSONBin:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/send-email', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      total_price,
      confirmation_number,
      net_price,
      tip_amount,
      gross_price,
      reservation_date,
      passenger_names,
      ticket_number,
      flight_segments,
    } = req.body;

    const msg = {
      to: customer_email,
      from: 'noreply@luxflighttravel.com', // Replace with your verified sender email
      subject: 'Ticket Receipt',
      templateId: 'd-7c2ba8e34bc24bcbb5d81b7c178ac16e', // Replace with your SendGrid template ID
      dynamic_template_data: {
        customer_name,
        customer_email,
        total_price,
        confirmation_number,
        net_price,
        tip_amount,
        gross_price,
        reservation_date,
        passenger_names,
        ticket_number,
        flight_segments,
        subject: 'Ticket Receipt',
      },
    };

    await sgMail.send(msg);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error in /send-email:', error.response?.body || error.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const masterBinId = '6726877eacd3cb34a8a1703c'; // Your actual master bin ID

// POST route to create a new customer in the bin
app.post('/createBin', async (req, res) => {
  const customerData = req.body;

  try {
    // Fetch current data from the master bin
    const response = await fetch(`https://api.jsonbin.io/v3/b/${masterBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve master bin data');
    }

    const masterBinData = await response.json();
    const customerList = masterBinData.record.customer || [];

    if (!Array.isArray(customerList)) {
      throw new Error('Master bin customer is not an array');
    }

    // Append the new customer data
    const updatedCustomerList = [...customerList, customerData];

    // Save the updated customer list back to the master bin
    const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${masterBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
      body: JSON.stringify({ customer: updatedCustomerList }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update master bin');
    }

    res.json({ message: 'Customer added successfully', updatedCustomerList });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
});

// GET route to retrieve customer data from the bin
app.get('/getBinData', async (req, res) => {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${masterBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve customer data');
    }

    const customerData = await response.json();
    res.json(customerData.record.customer);
  } catch (error) {
    console.error('Error retrieving customer data:', error);
    res.status(500).json({ message: 'Error retrieving customer data', error: error.message });
  }
});
app.get('/getCustomer', async (req, res) => {
  const { email } = req.query;  // Use query parameter to get the email

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${masterBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve master bin data');
    }

    const masterBinData = await response.json();
    const customerList = masterBinData.record.customer || [];

    // Find the customer by email
    const customer = customerList.find(customer => customer.email === email);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer); // Return the found customer data
  } catch (error) {
    console.error('Error retrieving customer data:', error);
    res.status(500).json({ message: 'Error retrieving customer data', error: error.message });
  }
});
app.post('/archiveCustomer', async (req, res) => {
  const { customerData } = req.body;

  try {
    // Fetch the current history bin data
    const archiveResponse = await fetch('https://api.jsonbin.io/v3/b/675fc24bacd3cb34a8ba4efa', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!archiveResponse.ok) {
      throw new Error('Failed to retrieve archive bin data');
    }

    const archiveBinData = await archiveResponse.json();
    const history = archiveBinData.record.history || [];

    // Add the customer data to the history array
    history.push(customerData);

    // Update the archive bin with the new history
    const updateArchiveResponse = await fetch('https://api.jsonbin.io/v3/b/675fc24bacd3cb34a8ba4efa', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
      body: JSON.stringify({ history: history }),
    });

    if (!updateArchiveResponse.ok) {
      throw new Error('Failed to update archive bin');
    }

    res.json({ message: 'Customer data archived successfully' });
  } catch (error) {
    console.error('Error archiving customer data:', error);
    res.status(500).json({ message: 'Error archiving customer data', error: error.message });
  }
});
// Server-side: Get archived customer data
app.get('/getArchivedData', async (req, res) => {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/675fc24bacd3cb34a8ba4efa/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve archived data');
    }

    const archivedData = await response.json();
    res.json(archivedData.record.history || []);
  } catch (error) {
    console.error('Error retrieving archived data:', error);
    res.status(500).json({ message: 'Error retrieving archived data', error: error.message });
  }
});

// PUT route to update customer data
app.put('/updateBin', async (req, res) => {
  const updatedCustomerData = req.body.customer;

  try {
    // Save the updated customer list back to the master bin
    const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${masterBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
      body: JSON.stringify({ customer: updatedCustomerData }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update customer data');
    }

    res.json({ message: 'Customer data updated successfully' });
  } catch (error) {
    console.error('Error updating customer data:', error);
    res.status(500).json({ message: 'Error updating customer data', error: error.message });
  }
});

// DELETE route to delete a customer
app.delete('/deleteCustomer', async (req, res) => {
  const { email } = req.body;

  try {
    // Fetch the master bin data
    const response = await fetch(`https://api.jsonbin.io/v3/b/${masterBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve master bin data');
    }

    const masterBinData = await response.json();
    const customerList = masterBinData.record.customer || [];

    // Filter out the customer by email
    const updatedCustomerList = customerList.filter(customer => customer.email !== email);

    // Update the master bin
    const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${masterBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
      body: JSON.stringify({ customer: updatedCustomerList }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update master bin');
    }

    res.json({ message: 'Customer deleted successfully', updatedCustomerList });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
});

const userBinId = '674c02edacd3cb34a8b1f69d'; // Replace with your actual user bin ID
const jsonBinMasterKey = process.env.JSONBIN_MASTER_KEY;

// POST route to register a new user
app.post('/register', async (req, res) => {
  const { role, username, password, name, email } = req.body; // Assuming you have name and email as additional info

  console.log('Received Data:', { role, username, password, name, email });
  try {
    // Fetch current user data from the user bin
    const response = await fetch(`https://api.jsonbin.io/v3/b/${userBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user bin data');
    }

    const userBinData = await response.json();
    const userList = userBinData.record.users || [];

    // Check if username already exists
    const existingUser = userList.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user object
    const newUser = { role, username, password, name, email };
    console.log('New User Object:', newUser);

    // Add new user to the list
    const updatedUserList = [...userList, newUser];

    // Save the updated user list back to the user bin
    const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${userBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
      body: JSON.stringify({ users: updatedUserList }),
    });

    const updatedData = await updateResponse.json();
    console.log('Updated JSONBin Data:', updatedData);
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update user bin');
    }

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});
// POST route to log in a user
app.post('/login', async (req, res) => {
  const { username, password } = req.body; // Getting username and password from the request

  try {
    // Fetch current data from the user bin
    const response = await fetch(`https://api.jsonbin.io/v3/b/${userBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user bin data');
    }

    const userBinData = await response.json();
    const userList = userBinData.record.users || [];

    // Find the user by username
    const user = userList.find(user => user.username === username);

    if (!user) {
      return res.status(404).json({ message: 'Username not found' });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Login successful, return user data (e.g., username, name, email)
    res.json({
      message: 'Login successful',
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});
// GET route to fetch user profile data after login (can be used on the front end to display user profile)
app.get('/getUserProfile', async (req, res) => {
  const { username } = req.query; // Assuming the username is sent in the query parameter

  try {
    // Fetch current data from the user bin
    const response = await fetch(`https://api.jsonbin.io/v3/b/${userBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user bin data');
    }

    const userBinData = await response.json();
    const userList = userBinData.record.users || [];

    // Find the user by username
    const user = userList.find(user => user.username === username);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the full user profile data (e.g., username, name, email)
    res.json({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
});
// Backend route to get user data (you already have the GET endpoint, let's refine it)
app.get('/getUsers', async (req, res) => {
  try {
    // Fetch current data from the user bin
    const response = await fetch(`https://api.jsonbin.io/v3/b/${userBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY, // Keep your master key on the server
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user data');
    }

    const userBinData = await response.json();
    const userList = userBinData.record.users || [];

    res.json(userList); // Send the list of users back to the frontend
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});
// POST route to delete a user
app.post('/deleteUser', async (req, res) => {
  const { username } = req.body; // Get username from request body

  try {
    // Step 1: Fetch the current users from JSON bin
    const response = await fetch(`https://api.jsonbin.io/v3/b/${userBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': jsonBinMasterKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users from JSON bin');
    }

    const userBinData = await response.json();
    const userList = userBinData.record.users || [];

    // Step 2: Check if the user exists
    const userIndex = userList.findIndex(user => user.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 3: Remove the user from the list
    userList.splice(userIndex, 1);

    // Step 4: Update the JSON bin with the new user list
    const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${userBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': jsonBinMasterKey,
      },
      body: JSON.stringify({ users: userList }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update user bin');
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});
// GET route to check if uniqueId exists in the master bin
app.get('/checkUniqueId', async (req, res) => {
  const { uniqueId } = req.query; // Extract uniqueId from query parameters

  if (!uniqueId) {
    return res.status(400).json({ message: 'Unique ID is missing in the request' });
  }

  try {
    // Fetch the master bin data
    const response = await fetch(`https://api.jsonbin.io/v3/b/${masterBinId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve master bin data');
    }

    const masterBinData = await response.json();
    const customerList = masterBinData.record.customer || [];

    // Check if the uniqueId exists
    const matchingCustomer = customerList.find(customer => customer.id === uniqueId);

    if (matchingCustomer) {
      return res.json({ exists: true, confirmationNumber: matchingCustomer.confirmationNumber });
    }

    // If not found, respond with exists: false
    res.json({ exists: false });
  } catch (error) {
    console.error('Error checking unique ID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/*
// In-memory storage for payment records
let paymentRecords = {};

// Nodemailer transporter configuration for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

let customerCount = 0;  // Initialize customer count

// 1. Endpoint to create a customer and setup payment method for future use
app.post('/create-setup-intent', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the customer already exists
    let customer = await stripe.customers.list({ email });

    if (!customer.data.length) {
      customer = await stripe.customers.create({
        email
      });
      customerCount++;  // Increment customer count when a new customer is created
    } else {
      customer = customer.data[0];
    }

    // Create a SetupIntent to save the payment method for future use
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: 'off_session',  // Allows reusing the card without requiring user interaction
    });

    res.json({ 
      clientSecret: setupIntent.client_secret, 
      customerId: customer.id,
      customerCount // Send the updated customer count
    });
  } catch (error) {
    console.error('Error creating setup intent:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Endpoint to store the payment method for future use (reusable off-session)
app.post('/store-payment-method', async (req, res) => {
  const { paymentMethodId, customerId } = req.body;

  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set it as the default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error storing payment method:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. Endpoint to create a payment intent with a saved payment method
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, customerId, paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,  // Attach the payment intent to the customer
      payment_method: paymentMethodId,  // Use saved payment method
      off_session: true,  // To use the card later without user interaction
      confirm: true,  // Automatically confirm the payment
      metadata: { customerEmail: req.body.customerEmail },
    });

    // Create a new payment record with status 'pending'
    const paymentRecord = {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: 'pending',
      customerEmail: req.body.customerEmail,
      paymentMethodId,  // Store the payment method for future use
      customerId  // Store the customerId for future use
    };
    paymentRecords[paymentIntent.id] = paymentRecord;

    res.json({ clientSecret: paymentIntent.client_secret, paymentId: paymentIntent.id });
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. Endpoint to confirm and capture the payment
app.post('/confirm-payment', async (req, res) => {
  const { paymentId } = req.body;

  try {
    // Check if the payment record exists
    const paymentRecord = paymentRecords[paymentId];
    if (!paymentRecord) {
      return res.status(404).json({ error: "Payment link is no longer valid" });
    }

    // Check if the payment is already completed
    if (paymentRecord.status === 'completed') {
      return res.status(400).json({ error: "Payment has already been processed" });
    }

    const paymentIntent = await stripe.paymentIntents.capture(paymentId);

    // Mark the payment as completed
    paymentRecords[paymentId].status = 'completed';

    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error('Error confirming payment:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 5. Endpoint to reuse the saved payment method for future payments (for external website)
app.post('/reuse-payment-method', async (req, res) => {
  const { customerId, amount, currency } = req.body;

  try {
    // Retrieve the stored payment method
    const paymentMethodId = paymentRecords[customerId].paymentMethodId;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,  // Use stored customer
      payment_method: paymentMethodId, // Use saved payment method
      off_session: true,
      confirm: true  // Automatically confirm the payment
    });

    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error('Error reusing payment method:', error.message);
    res.status(500).json({ error: error.message });
  }     
});
// 6. Endpoint for flight search
app.post('/search-flights', async (req, res) => {
  const { origin, destination, departureDate, returnDate, adults } = req.body;

  // Log received data for debugging
  console.log('Request data:', req.body);

  try {
    // Get Access Token from Amadeus API
    const tokenResponse = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: {
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET
      }
    });
    const accessToken = tokenResponse.data.access_token;

    // Make flight search request to Amadeus API
    const flightResponse = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        ...(returnDate && { returnDate }),
        adults: adults,
        currencyCode: 'USD',
        max: 5
      }
    });
    const flightOffers = flightResponse.data.data;
    res.json({ flights: flightOffers });
  } catch (error) {
    // Log more details of the error from Amadeus API
    console.error('Amadeus API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve flight data', details: error.response ? error.response.data : error.message });
  }  
});


// Nodemailer email sending example
const sendEmail = (email, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error.message);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
*/

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
