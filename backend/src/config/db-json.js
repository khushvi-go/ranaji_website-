const fs = require('fs');
const path = require('path');
const UserModel = require('../models/User');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'database.json');

// Initialize empty database
const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      collections: [],
      testimonials: [],
      gallery: [],
      services: [],
      bookings: [],
      contacts: [],
      users: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

// Read database
const readDB = () => {
  initDB();
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
};

// Write database
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Mock Mongoose Model Class
class JSONModel {
  constructor(collectionName) {
    this.collection = collectionName;
  }

  find(query = {}) {
    const db = readDB();
    let results = db[this.collection] || [];
    
    // Simple query filtering
    if (Object.keys(query).length > 0) {
      results = results.filter(item => {
        return Object.entries(query).every(([key, value]) => item[key] === value);
      });
    }
    
    return {
      sort: (sortSpec) => {
        // Handle MongoDB-style sort spec { field: -1 }
        if (typeof sortSpec === 'object' && sortSpec !== null) {
          const [field, order] = Object.entries(sortSpec)[0] || ['createdAt', -1];
          results.sort((a, b) => {
            const aVal = a[field] || '';
            const bVal = b[field] || '';
            return order === -1 ? 
              (bVal > aVal ? 1 : -1) : 
              (aVal > bVal ? 1 : -1);
          });
        }
        return { 
          data: results,
          exec: () => Promise.resolve(results)
        };
      },
      data: results,
      exec: () => Promise.resolve(results)
    };
  }

  findById(id) {
    const db = readDB();
    const items = db[this.collection] || [];
    return items.find(item => item._id === id);
  }

  create(data) {
    const db = readDB();
    const newItem = {
      _id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!db[this.collection]) db[this.collection] = [];
    db[this.collection].push(newItem);
    writeDB(db);
    
    return newItem;
  }

  findByIdAndUpdate(id, updateData) {
    const db = readDB();
    const items = db[this.collection] || [];
    const index = items.findIndex(item => item._id === id);
    
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(db);
    return items[index];
  }

  findByIdAndDelete(id) {
    const db = readDB();
    const items = db[this.collection] || [];
    const index = items.findIndex(item => item._id === id);
    
    if (index === -1) return null;
    
    const deleted = items[index];
    items.splice(index, 1);
    writeDB(db);
    
    return deleted;
  }

  countDocuments(query = {}) {
    return this.find(query).data.length;
  }
}

// Create models
const Collection = new JSONModel('collections');
const Testimonial = new JSONModel('testimonials');
const Gallery = new JSONModel('gallery');
const Service = new JSONModel('services');
const Booking = new JSONModel('bookings');
const Contact = new JSONModel('contacts');

// User model with special methods
const User = {
  collection: 'users',
  
  findById(id) {
    const db = readDB();
    const userData = db.users?.find(u => u._id === id);
    return userData ? new UserModel(userData) : null;
  },
  
  findByEmail(email) {
    const db = readDB();
    const userData = db.users?.find(u => u.email === email);
    return userData ? new UserModel(userData) : null;
  },
  
  create(data) {
    const db = readDB();
    const user = new UserModel(data);
    
    if (!db.users) db.users = [];
    db.users.push(user);
    writeDB(db);
    
    return user;
  },
  
  update(id, updateData) {
    const db = readDB();
    const index = db.users?.findIndex(u => u._id === id);
    
    if (index === -1 || index === undefined) return null;
    
    const user = new UserModel(db.users[index]);
    user.update(updateData);
    
    db.users[index] = user;
    writeDB(db);
    
    return user;
  },
  
  addOrder(userId, order) {
    const db = readDB();
    const index = db.users?.findIndex(u => u._id === userId);
    
    if (index === -1 || index === undefined) return null;
    
    const user = new UserModel(db.users[index]);
    user.addOrder(order);
    
    db.users[index] = user;
    writeDB(db);
    
    return user;
  },
  
  getAll() {
    const db = readDB();
    return (db.users || []).map(u => new UserModel(u));
  }
};

const connectDB = async () => {
  initDB();
  console.log('📁 JSON Database Connected');
  console.log('⚠️  Using file-based database - data stored in /backend/data/database.json');
};

module.exports = {
  connectDB,
  Collection,
  Testimonial,
  Gallery,
  Service,
  Booking,
  Contact,
  User
};
