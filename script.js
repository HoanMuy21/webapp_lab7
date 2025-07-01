let editingNoteId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
});

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

async function addNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const category = document.getElementById('noteCategory').value;

    if (title === '' || content === '') {
        showNotification('Vui lòng nhập tiêu đề và nội dung!', 'error');
        return;
    }

    const note = { title, content, category, date: new Date().toLocaleString('vi-VN') };
    try {
        let response;
        if (editingNoteId) {
            response = await fetch(`http://localhost:3000/api/notes/${editingNoteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            });
            showNotification('Ghi chú đã được cập nhật!', 'success');
            editingNoteId = null;
        } else {
            response = await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            });
            showNotification('Ghi chú đã được thêm!', 'success');
        }

        if (!response.ok) throw new Error('Lỗi khi lưu ghi chú');
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        loadNotes();
    } catch (error) {
        showNotification('Lỗi: ' + error.message, 'error');
    }
}

async function loadNotes() {
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = '';
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filterCategory = document.getElementById('filterCategory').value;

    try {
        const response = await fetch(`http://localhost:3000/api/notes?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(filterCategory)}`);
        if (!response.ok) throw new Error('Lỗi khi tải ghi chú');
        const notes = await response.json();

        notes.forEach(note => {
            const li = document.createElement('li');
            li.className = 'note-item';
            li.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <small>Danh mục: ${note.category} | Ngày: ${note.date} | Server: ${note.server}</small>
                <div class="note-actions">
                    <button onclick="editNote('${note.id}')">Sửa</button>
                    <button onclick="deleteNote('${note.id}')">Xóa</button>
                </div>
            `;
            noteList.appendChild(li);
        });
    } catch (error) {
        showNotification('Lỗi: ' + error.message, 'error');
    }
}

async function editNote(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/notes/${id}`);
        if (!response.ok) throw new Error('Lỗi khi tải ghi chú');
        const note = await response.json();
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        document.getElementById('noteCategory').value = note.category;
        editingNoteId = id;
    } catch (error) {
        showNotification('Lỗi: ' + error.message, 'error');
    }
}

async function deleteNote(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/notes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Lỗi khi xóa ghi chú');
        showNotification('Ghi chú đã được xóa!', 'success');
        loadNotes();
    } catch (error) {
        showNotification('Lỗi: ' + error.message, 'error');
    }
}

async function deleteAllNotes() {
    if (confirm('Bạn có chắc muốn xóa tất cả ghi chú?')) {
        try {
            const response = await fetch('http://localhost:3000/api/notes', {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Lỗi khi xóa tất cả ghi chú');
            showNotification('Đã xóa tất cả ghi chú!', 'success');
            loadNotes();
        } catch (error) {
            showNotification('Lỗi: ' + error.message, 'error');
        }
    }
}

function searchNotes() {
    loadNotes();
}

function filterNotes() {
    loadNotes();
}
