const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const serverless = require('serverless-http');

const app = express();
const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'bookings.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function ensureDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        location TEXT NOT NULL,
        preferred_brand TEXT,
        ac_type TEXT,
        capacity TEXT,
        budget TEXT,
        requirement TEXT,
        ac_brand TEXT,
        service_required TEXT,
        ac_problem TEXT,
        preferred_date TEXT,
        preferred_time TEXT,
        additional_message TEXT,
        status TEXT DEFAULT 'new',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}

ensureDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function sendFile(res, filePath) {
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(err.status || 500).json({ success: false, message: 'File not found.' });
    }
  });
}

function isSafeFilePath(filePath) {
  return filePath && !filePath.includes('..');
}

function sendStaticFile(relativePath, res, directory) {
  const safeRelativePath = decodeURIComponent(relativePath || '');

  if (!isSafeFilePath(safeRelativePath)) {
    return res.status(400).send('Invalid file path.');
  }

  const filePath = path.join(directory, safeRelativePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(res, filePath);
  }

  return res.status(404).send('Not found');
}

app.get('/robots.txt', (req, res) => {
  sendFile(res, path.join(__dirname, '..', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  sendFile(res, path.join(__dirname, '..', 'sitemap.xml'));
});

app.get('/css/*', (req, res) => {
  sendStaticFile(req.params[0], res, path.join(__dirname, '..', 'src', 'css'));
});

app.get('/js/*', (req, res) => {
  sendStaticFile(req.params[0], res, path.join(__dirname, '..', 'src', 'js'));
});

app.get('/data/*', (req, res) => {
  sendStaticFile(req.params[0], res, path.join(__dirname, '..', 'src', 'data'));
});

app.get('/images/*', (req, res) => {
  sendStaticFile(req.params[0], res, path.join(__dirname, '..', 'public', 'images'));
});

app.get('/', (req, res) => {
  sendFile(res, path.join(__dirname, '..', 'src', 'pages', 'index.html'));
});

app.get('/admin', (req, res) => {
  sendFile(res, path.join(__dirname, '..', 'src', 'pages', 'admin.html'));
});

const pageRoutes = [
  'about',
  'products',
  'services',
  'offers',
  'why-choose-us',
  'brands',
  'reviews',
  'faq',
  'contact',
  'quote',
  'book-service'
];

pageRoutes.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    sendFile(res, path.join(__dirname, '..', 'src', 'pages', `${page}.html`));
  });
});

function insertBooking(record) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO bookings (
        type,
        customer_name,
        phone_number,
        location,
        preferred_brand,
        ac_type,
        capacity,
        budget,
        requirement,
        ac_brand,
        service_required,
        ac_problem,
        preferred_date,
        preferred_time,
        additional_message,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      record.type,
      record.customerName,
      record.phoneNumber,
      record.location,
      record.preferredBrand || null,
      record.acType || null,
      record.capacity || null,
      record.budget || null,
      record.requirement || null,
      record.acBrand || null,
      record.serviceRequired || null,
      record.acProblem || null,
      record.preferredDate || null,
      record.preferredTime || null,
      record.additionalMessage || null,
      'new'
    ], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, status: 'new' });
    });
  });
}

function normalizeBooking(row) {
  return {
    id: row.id,
    type: row.type,
    customerName: row.customer_name,
    phoneNumber: row.phone_number,
    location: row.location,
    preferredBrand: row.preferred_brand,
    acType: row.ac_type,
    capacity: row.capacity,
    budget: row.budget,
    requirement: row.requirement,
    acBrand: row.ac_brand,
    serviceRequired: row.service_required,
    acProblem: row.ac_problem,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    additionalMessage: row.additional_message,
    status: row.status,
    createdAt: row.created_at
  };
}

app.post('/api/quote', async (req, res) => {
  const { customerName, phoneNumber, location, preferredBrand, acType, capacity, budget, requirement } = req.body || {};

  const errors = [];

  if (!customerName || !customerName.trim()) errors.push('Customer name is required.');
  if (!phoneNumber || !/^\+?[0-9]{10,12}$/.test(String(phoneNumber).replace(/\s+/g, ''))) {
    errors.push('Please enter a valid Indian phone number.');
  }
  if (!location || !location.trim()) errors.push('Location is required.');
  if (!preferredBrand || !preferredBrand.trim()) errors.push('Preferred brand is required.');
  if (!acType || !acType.trim()) errors.push('AC type is required.');
  if (!capacity || !capacity.trim()) errors.push('Capacity is required.');
  if (!budget || !budget.trim()) errors.push('Budget is required.');
  if (!requirement || !requirement.trim()) errors.push('Requirement details are required.');

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const booking = await insertBooking({
      type: 'quote',
      customerName: customerName.trim(),
      phoneNumber: String(phoneNumber).trim(),
      location: location.trim(),
      preferredBrand: preferredBrand.trim(),
      acType: acType.trim(),
      capacity: capacity.trim(),
      budget: budget.trim(),
      requirement: requirement.trim()
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you. Your AC enquiry has been received. We will contact you shortly.',
      bookingId: booking.id,
      status: booking.status
    });
  } catch (error) {
    return res.status(500).json({ success: false, errors: ['Unable to save enquiry. Please try again later.'] });
  }
});

app.post('/api/service', async (req, res) => {
  const {
    customerName,
    phoneNumber,
    location,
    acBrand,
    serviceRequired,
    acProblem,
    preferredDate,
    preferredTime,
    additionalMessage
  } = req.body || {};

  const errors = [];

  if (!customerName || !customerName.trim()) errors.push('Customer name is required.');
  if (!phoneNumber || !/^\+?[0-9]{10,12}$/.test(String(phoneNumber).replace(/\s+/g, ''))) {
    errors.push('Please enter a valid Indian phone number.');
  }
  if (!location || !location.trim()) errors.push('Location is required.');
  if (!acBrand || !acBrand.trim()) errors.push('AC brand is required.');
  if (!serviceRequired || !serviceRequired.trim()) errors.push('Service required is required.');
  if (!acProblem || !acProblem.trim()) errors.push('Please describe the AC problem.');
  if (!preferredDate || !preferredDate.trim()) errors.push('Preferred date is required.');
  if (!preferredTime || !preferredTime.trim()) errors.push('Preferred time is required.');

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const booking = await insertBooking({
      type: 'service',
      customerName: customerName.trim(),
      phoneNumber: String(phoneNumber).trim(),
      location: location.trim(),
      acBrand: acBrand.trim(),
      serviceRequired: serviceRequired.trim(),
      acProblem: acProblem.trim(),
      preferredDate: preferredDate.trim(),
      preferredTime: preferredTime.trim(),
      additionalMessage: additionalMessage ? additionalMessage.trim() : ''
    });

    return res.status(200).json({
      success: true,
      message: 'Your service request has been successfully submitted. Please keep your phone available for confirmation.',
      bookingId: booking.id,
      status: booking.status
    });
  } catch (error) {
    return res.status(500).json({ success: false, errors: ['Unable to save service request. Please try again later.'] });
  }
});

app.get('/api/bookings', (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Unable to fetch bookings.' });
    }

    return res.json({ success: true, bookings: rows.map(normalizeBooking) });
  });
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowedStatuses = ['new', 'confirmed', 'scheduled', 'completed', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Unable to update status.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.json({ success: true, message: 'Booking status updated successfully.' });
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AC business website is running.' });
});

app.get('*', (req, res) => {
  const pagePath = req.path.replace(/^\/+/, '');
  const directFile = path.join(__dirname, '..', 'src', 'pages', `${pagePath}.html`);

  if (pagePath && fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
    return sendFile(res, directFile);
  }

  return res.status(404).send('Not found');
});

module.exports = serverless(app);
