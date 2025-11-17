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



//  Root route
app.get("/", (req, res) => {
  res.send("Welcome to Bookify");
});


//  Get all rooms
app.get('/api/rooms', (req, res) => {
  const rooms = readData(roomsFile);
  res.json(rooms);
});

//  Add a new room
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

//  Get all bookings
app.get('/api/bookings', (req, res) => {
  const bookings = readData(bookingsFile);
  res.json(bookings);
});

//  Create a new booking
app.post('/api/bookings', (req, res) => {
  const bookings = readData(bookingsFile);
  const rooms = readData(roomsFile);

  const newBooking = req.body;
  newBooking.id = bookings.length ? bookings[bookings.length - 1].id + 1 : 1;

  // --- Update room availability ---
  const roomIndex = rooms.findIndex(r => r.id === newBooking.roomId);
  if (roomIndex !== -1) {
    rooms[roomIndex].available = false;
    writeData(roomsFile, rooms);
  }

  // --- Save booking ---
  bookings.push(newBooking);
  writeData(bookingsFile, bookings);

  res.status(201).json({
    message: 'Booking created successfully',
    booking: newBooking
  });
});

//  Update an existing booking
app.put('/api/bookings/:id', (req, res) => {
  const bookings = readData(bookingsFile);
  const rooms = readData(roomsFile);
  const bookingId = parseInt(req.params.id);
  const updatedData = req.body;

  const index = bookings.findIndex(b => b.id === bookingId);
  if (index === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const oldRoomId = bookings[index].roomId;

  // --- Update room availability if roomId changed ---
  if (updatedData.roomId && updatedData.roomId !== oldRoomId) {
    const oldRoomIndex = rooms.findIndex(r => r.id === oldRoomId);
    if (oldRoomIndex !== -1) rooms[oldRoomIndex].available = true; // free old room

    const newRoomIndex = rooms.findIndex(r => r.id === updatedData.roomId);
    if (newRoomIndex !== -1) rooms[newRoomIndex].available = false; // book new room

    writeData(roomsFile, rooms);
  }

  bookings[index] = { ...bookings[index], ...updatedData };
  writeData(bookingsFile, bookings);

  res.json({
    message: 'Booking updated successfully',
    booking: bookings[index]
  });
});

// Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
  const bookings = readData(bookingsFile);
  const rooms = readData(roomsFile);
  const bookingId = parseInt(req.params.id);

  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  // --- Free the room ---
  const roomIndex = rooms.findIndex(r => r.id === booking.roomId);
  if (roomIndex !== -1) {
    rooms[roomIndex].available = true;
    writeData(roomsFile, rooms);
  }

  const filtered = bookings.filter(b => b.id !== bookingId);
  writeData(bookingsFile, filtered);

  res.json({ message: 'Booking deleted successfully' });
});



//        START SERVER

app.listen(PORT, () => {
  console.log(`Welcome to Bookify http://localhost:${PORT}`);
});
