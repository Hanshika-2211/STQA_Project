require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();

app.use(cors());
app.use(express.json());

// ── Product Seed Helper ──────────────────────────────────────────────
function parseProductsTxt() {
  const filePath = path.join(__dirname, 'products.txt');
  if (!fs.existsSync(filePath)) {
    console.log('products.txt not found at:', filePath);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  // Split on '[Product]' token
  const sections = content.split('[Product]');
  const products = [];

  for (const sec of sections) {
    const lines = sec.split('\n');
    const p = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.substring(0, colonIdx).trim().toLowerCase();
      const val = line.substring(colonIdx + 1).trim();

      if (key === 'name') p.name = val;
      if (key === 'category') p.category = val;
      if (key === 'price') p.price = parseFloat(val);
      if (key === 'description') p.description = val;
      if (key === 'image') p.image = val;
      if (key === 'stock') p.stock = parseInt(val, 10);
    }
    if (p.name && p.price !== undefined) {
      products.push(p);
    }
  }
  return products;
}

async function seedDatabase() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Product collection is empty. Seeding catalog...');
      const seedData = parseProductsTxt();
      if (seedData.length > 0) {
        await Product.insertMany(seedData);
        console.log(`Successfully seeded ${seedData.length} products.`);
      } else {
        console.log('No seed products found in products.txt.');
      }
    } else {
      console.log('Database already has product data. Skipping seed.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// ── Auth Routes ─────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Product Routes ──────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, rating, comment } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({ error: 'All review fields (userName, rating, comment) are required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.reviews.push({ userName, rating: Number(rating), comment });
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Cart Routes ─────────────────────────────────────────────────────
app.get('/api/user/:userId/cart', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('cart.product');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/:userId/cart', async (req, res) => {
  try {
    const { cart } = req.body; // array of { product: id, quantity }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.cart = cart.map(item => ({
      product: item.product,
      quantity: item.quantity
    }));
    await user.save();
    
    const updatedUser = await User.findById(req.params.userId).populate('cart.product');
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Wishlist Routes ─────────────────────────────────────────────────
app.get('/api/user/:userId/wishlist', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/:userId/wishlist', async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1); // remove if exists
    } else {
      user.wishlist.push(productId); // add if new
    }
    await user.save();

    const updatedUser = await User.findById(req.params.userId).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Order Routes ────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, total, deliveryDetails } = req.body;
    if (!userId || !items || !total || !deliveryDetails) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    // 1. Create the order
    const order = await Order.create({
      user: userId,
      items,
      total,
      deliveryDetails
    });

    // 2. Decrement stock for purchased items
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 3. Clear user's cart in database
    await User.findByIdAndUpdate(userId, { cart: [] });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Database Setup and Start ────────────────────────────────────────
async function start() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI provided. Starting in-memory MongoDB server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log('In-memory MongoDB Server URI:', uri);
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected successfully.');

  // Seed product catalogue if empty
  await seedDatabase();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
