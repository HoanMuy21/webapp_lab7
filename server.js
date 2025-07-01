const express = require('express');
const cors = require('cors');
const os = require('os'); // Thêm module os để lấy hostname
const app = express();
const port = process.env.PORT || 3000; // Sử dụng process.env.PORT cho Render

app.use(cors());
app.use(express.json());

// Mảng tạm thời để lưu ghi chú (thay cho database)
let notes = [];
let idCounter = 1;

// Endpoint để xác minh load balancing
app.get('/', (req, res) => {
    const hostname = os.hostname();
    res.send(`Hello from ${hostname} - Note App Server`);
});

// Lấy tất cả ghi chú (hỗ trợ tìm kiếm và lọc)
app.get('/api/notes', (req, res) => {
    const { search = '', category = '' } = req.query;
    let filteredNotes = notes;

    if (search) {
        const searchLower = search.toLowerCase();
        filteredNotes = filteredNotes.filter(note =>
            note.title.toLowerCase().includes(searchLower) ||
            note.content.toLowerCase().includes(searchLower)
        );
    }

    if (category) {
        filteredNotes = filteredNotes.filter(note => note.category === category);
    }

    res.json(filteredNotes);
});

// Lấy ghi chú theo ID
app.get('/api/notes/:id', (req, res) => {
    const note = notes.find(n => n.id === req.params.id);
    if (!note) return res.status(404).json({ error: 'Ghi chú không tồn tại' });
    res.json(note);
});

// Thêm ghi chú mới
app.post('/api/notes', (req, res) => {
    const { title, content, category, date } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
    }
    const note = { id: (idCounter++).toString(), title, content, server: os.hostname(), category, date }; // Thêm server hostname vào note
    notes.push(note);
    res.status(201).json(note);
});

// Cập nhật ghi chú
app.put('/api/notes/:id', (req, res) => {
    const note = notes.find(n => n.id === req.params.id);
    if (!note) return res.status(404).json({ error: 'Ghi chú không tồn tại' });
    const { title, content, category, date } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
    }
    note.title = title;
    note.content = content;
    note.category = category;
    note.date = date;
    note.server = os.hostname(); // Cập nhật server hostname
    res.json(note);
});

// Xóa ghi chú
app.delete('/api/notes/:id', (req, res) => {
    const index = notes.findIndex(n => n.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Ghi chú không tồn tại' });
    notes.splice(index, 1);
    res.status(204).send();
});

// Xóa tất cả ghi chú
app.delete('/api/notes', (req, res) => {
    notes = [];
    idCounter = 1;
    res.status(204).send();
});

// Phục vụ file tĩnh (index.html, styles.css, script.js)
app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port} trên ${os.hostname()}`);
});
