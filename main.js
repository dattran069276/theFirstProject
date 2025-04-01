// 1. Import các module cần thiết
const http = require('http'); // Module HTTP cơ bản của Node.js
const { Server } = require("socket.io"); // Import lớp Server từ thư viện socket.io

// 2. Tạo một máy chủ HTTP cơ bản
// Socket.IO cần một máy chủ HTTP để gắn vào
const httpServer = http.createServer((req, res) => {
  // Bạn có thể phục vụ một file HTML đơn giản ở đây nếu muốn
  // Nhưng cho ví dụ này, chúng ta chỉ cần máy chủ HTTP chạy
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO Server is running\n');
});

// 3. Khởi tạo một instance Socket.IO Server và gắn nó vào máy chủ HTTP
// Cấu hình CORS (Cross-Origin Resource Sharing) để cho phép kết nối từ các nguồn khác (ví dụ: trình duyệt chạy trên localhost: khác)
// Trong môi trường production, bạn nên cấu hình 'origin' cụ thể hơn thay vì "*"
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Cho phép tất cả các nguồn gốc (thận trọng khi dùng trong production)
    methods: ["GET", "POST"] // Các phương thức HTTP được phép
  }
});

// 4. Lắng nghe sự kiện 'connection' từ client
// Mỗi khi có một client mới kết nối, hàm callback này sẽ được thực thi
io.on('connection', (socket) => {
  console.log('Một người dùng đã kết nối:', socket.id); // In ra ID của socket vừa kết nối

  // Gửi một thông điệp chào mừng đến client vừa kết nối
  socket.emit('welcome', `Chào mừng bạn ${socket.id} đã tham gia!`);

  // Thông báo cho tất cả các client khác (trừ client vừa kết nối) rằng có người mới tham gia
  socket.broadcast.emit('user joined', `Người dùng ${socket.id} vừa tham gia.`);

  // Lắng nghe sự kiện 'chat message' từ client này
  socket.on('chat message', (msg) => {
    console.log(`Tin nhắn từ ${socket.id}: ${msg}`);
    // Gửi tin nhắn này đến *tất cả* các client đang kết nối (bao gồm cả người gửi)
    io.emit('chat message', { senderId: socket.id, message: msg });
  });

  // Lắng nghe sự kiện 'disconnect' (khi client ngắt kết nối)
  socket.on('disconnect', () => {
    console.log('Người dùng đã ngắt kết nối:', socket.id);
    // Thông báo cho tất cả các client còn lại
    io.emit('user left', `Người dùng ${socket.id} đã rời đi.`);
  });

  // Bạn có thể thêm các trình xử lý sự kiện tùy chỉnh khác ở đây
  // Ví dụ: socket.on('typing', () => { /* ... */ });
});

// 5. Khởi động máy chủ HTTP và lắng nghe trên một cổng cụ thể
const PORT = process.env.PORT || 3000; // Sử dụng cổng môi trường hoặc mặc định là 3000
httpServer.listen(PORT, () => {
  console.log(`Máy chủ đang lắng nghe trên cổng ${PORT}`);
  console.log(`Socket.IO server đã sẵn sàng nhận kết nối...`);
});