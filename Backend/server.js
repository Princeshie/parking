import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'parking_management'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(express.json());

// Initialize database and admin user
async function initializeDatabase() {
  try {
    // Read and execute setup.sql
    const setupSQL = await fs.readFile(path.join(__dirname, 'db', 'setup.sql'), 'utf8');
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true // Enable multiple statements for setup
    });

    await connection.query(setupSQL);
    await connection.end();

    // Initialize admin user with hashed password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'UPDATE Users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );
    console.log('Database and admin user initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Call initialization when server starts
initializeDatabase();

// User authentication
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Send user data (excluding password)
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Register new user (admin only)
app.post('/api/users', async (req, res) => {
  const { username, password, fullName, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO Users (username, password, fullName, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, fullName, role]
    );
    
    res.json({ 
      success: true, 
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user' 
    });
  }
});

// Get all parking slots
app.get('/api/parking-slots', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ParkingSlot');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Record car entry
app.post('/api/car-entry', async (req, res) => {
  const { plateNumber, driverName, phoneNumber, slotNumber, entryTime } = req.body;
  try {
    // Check if slot is available
    const [slot] = await pool.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [slotNumber]);
    if (slot.length === 0 || slot[0].Status !== 'Available') {
      return res.status(400).json({ message: 'Slot not available' });
    }

    // Insert car record
    await pool.query(
      'INSERT INTO Car (PlateNumber, DriverName, PhoneNumber, EntryTime, SlotNumber, PaymentStatus) VALUES (?, ?, ?, ?, ?, ?)',
      [plateNumber, driverName, phoneNumber, entryTime, slotNumber, 'Pending']
    );

    // Update slot status
    await pool.query('UPDATE ParkingSlot SET Status = ? WHERE SlotNumber = ?', ['Occupied', slotNumber]);

    res.json({ message: 'Car entry recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Record car exit and calculate payment
app.post('/api/car-exit', async (req, res) => {
  const { plateNumber, exitTime } = req.body;
  try {
    const [car] = await pool.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (car.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const entryTime = new Date(car[0].EntryTime);
    const exit = new Date(exitTime);
    const duration = Math.round((exit - entryTime) / (1000 * 60)); // Duration in minutes
    
    // Calculate hours, rounding up to the nearest hour
    // If someone parks for 1 hour and 1 minute, they should pay for 2 hours
    const hours = Math.ceil(duration / 60);
    
    // Calculate amount: 500 RWF per hour
    const HOURLY_RATE = 500; // RWF per hour
    const amount = hours * HOURLY_RATE;

    await pool.query(
      'UPDATE Car SET ExitTime = ?, Duration = ?, Amount = ?, PaymentStatus = ? WHERE PlateNumber = ?',
      [exitTime, duration, amount, 'Pending', plateNumber]
    );

    // Free up the slot
    await pool.query('UPDATE ParkingSlot SET Status = ? WHERE SlotNumber = ?', ['Available', car[0].SlotNumber]);

    res.json({ 
      duration,
      hours,
      amount,
      hourlyRate: HOURLY_RATE,
      message: `Parking fee calculated at ${HOURLY_RATE} RWF per hour for ${hours} hour(s)`
    });
  } catch (error) {
    console.error('Car exit error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Record payment
app.post('/api/record-payment', async (req, res) => {
  const { plateNumber, amount, paymentDate } = req.body;
  try {
    await pool.query(
      'INSERT INTO PaymentRecord (PlateNumber, Amount, PaymentDate) VALUES (?, ?, ?)',
      [plateNumber, amount, paymentDate]
    );

    await pool.query('UPDATE Car SET PaymentStatus = ? WHERE PlateNumber = ?', ['Paid', plateNumber]);

    res.json({ message: 'Payment recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Generate reports
app.get('/api/reports', async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        Car.*,
        ParkingSlot.SlotNumber,
        PaymentRecord.PaymentDate
      FROM Car
      LEFT JOIN ParkingSlot ON Car.SlotNumber = ParkingSlot.SlotNumber
      LEFT JOIN PaymentRecord ON Car.PlateNumber = PaymentRecord.PlateNumber
      WHERE 1=1
    `;
    
    const queryParams = [];

    // Add date range filter if provided
    if (startDate && endDate) {
      query += ` AND Car.EntryTime BETWEEN ? AND ?`;
      queryParams.push(startDate, endDate);
    }

    // Add payment status filter if provided
    if (filter && filter !== 'all') {
      query += ` AND Car.PaymentStatus = ?`;
      queryParams.push(filter === 'paid' ? 'Paid' : 'Pending');
    }

    // Order by entry time descending (most recent first)
    query += ` ORDER BY Car.EntryTime DESC`;

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get parking records
app.get('/api/parking-records', async (req, res) => {
  try {
    const query = `
      SELECT 
        Car.*,
        ParkingSlot.SlotNumber
      FROM Car
      LEFT JOIN ParkingSlot ON Car.SlotNumber = ParkingSlot.SlotNumber
      ORDER BY Car.EntryTime DESC
    `;
    
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Parking records error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Update parking record
app.put('/api/parking-records/:id', async (req, res) => {
  const { id } = req.params;
  const { PlateNumber, DriverName, PhoneNumber, SlotNumber } = req.body;
  
  try {
    // First, check if the record exists
    const [existingRecord] = await pool.query('SELECT * FROM Car WHERE id = ?', [id]);
    if (existingRecord.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // If changing slot number, check if new slot is available
    if (SlotNumber !== existingRecord[0].SlotNumber) {
      const [slot] = await pool.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [SlotNumber]);
      if (slot.length === 0 || (slot[0].Status !== 'Available' && slot[0].SlotNumber !== existingRecord[0].SlotNumber)) {
        return res.status(400).json({ message: 'Selected parking slot is not available' });
      }

      // Update old slot to Available
      await pool.query(
        'UPDATE ParkingSlot SET Status = ? WHERE SlotNumber = ?',
        ['Available', existingRecord[0].SlotNumber]
      );

      // Update new slot to Occupied
      await pool.query(
        'UPDATE ParkingSlot SET Status = ? WHERE SlotNumber = ?',
        ['Occupied', SlotNumber]
      );
    }

    // Update the car record
    await pool.query(
      'UPDATE Car SET PlateNumber = ?, DriverName = ?, PhoneNumber = ?, SlotNumber = ? WHERE id = ?',
      [PlateNumber, DriverName, PhoneNumber, SlotNumber, id]
    );

    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Delete parking record
app.delete('/api/parking-records/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // First, get the record to free up the slot
    const [record] = await pool.query('SELECT * FROM Car WHERE id = ?', [id]);
    if (record.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Free up the parking slot
    await pool.query(
      'UPDATE ParkingSlot SET Status = ? WHERE SlotNumber = ?',
      ['Available', record[0].SlotNumber]
    );

    // Delete the record
    await pool.query('DELETE FROM Car WHERE id = ?', [id]);

    // Delete associated payment records if any
    await pool.query('DELETE FROM PaymentRecord WHERE PlateNumber = ?', [record[0].PlateNumber]);

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});