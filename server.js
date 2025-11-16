const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json()); // Parse JSON body

// --- File Paths ---
const roomsFile = './data/rooms.json';
const bookingsFile = './data/bookings.json';

// --- Helper Functions ---
function readData(file) {
  if (!fs.existsSync(file)) return []; // Return empty array if file missing
  const data = fs.readFileSync(file);
  if (!data) return [];
  return JSON.parse(data);
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ================================
//            ROUTES
// ================================

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Welcome to Bookify");
});

// ================================
//            ROOMS
// ================================

// ✅ Get all rooms
app.get('/api/rooms', (req, res) => {
  const rooms = readData(roomsFile);
  res.json(rooms);
});

// ✅ Add a new room
app.post('/api/rooms', (req, res) => {
  const rooms = readData(roomsFile);
  const newRoom = req.body;

  newRoom.id = rooms.length ? rooms[rooms.length - 1].id + 1 : 1;
  rooms.push(newRoom);

  writeData(roomsFile, rooms);

  res.status(201).json({
    message: 'Room added successfully',
    room: newRoom
  });
});

// ================================
//            BOOKINGS
// ================================

// ✅ Get all bookings
app.get('/api/bookings', (req, res) => {
  const bookings = readData(bookingsFile);
  res.json(bookings);
});

// ✅ Create a new booking
app.post('/api/bookings', (req, res) => {
  const bookings = readData(bookingsFile);
  const newBooking = req.body;

  newBooking.id = bookings.length ? bookings[bookings.length - 1].id + 1 : 1;
  bookings.push(newBooking);

  writeData(bookingsFile, bookings);

  res.status(201).json({
    message: 'Booking created successfully',
    booking: newBooking
  });
});

// ✅ Update an existing booking
app.put('/api/bookings/:id', (req, res) => {
  const bookings = readData(bookingsFile);
  const bookingId = parseInt(req.params.id);
  const updatedData = req.body;

  const index = bookings.findIndex(b => b.id === bookingId);
  if (index === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  bookings[index] = { ...bookings[index], ...updatedData };

  writeData(bookingsFile, bookings);

  res.json({
    message: 'Booking updated successfully',
    booking: bookings[index]
  });
});

// ✅ Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
  const bookings = readData(bookingsFile);
  const bookingId = parseInt(req.params.id);

  const filtered = bookings.filter(b => b.id !== bookingId);

  if (filtered.length === bookings.length) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  writeData(bookingsFile, filtered);

  res.json({ message: 'Booking deleted successfully' });
});

// ================================
//        START SERVER
// ================================
app.listen(PORT, () => {
  console.log(`Welcome to Bookify http://localhost:${PORT}`);
});
