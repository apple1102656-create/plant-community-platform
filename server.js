const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

app.use(cors()); 
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const DB_FILE = 'database.json';

if (!fs.existsSync(DB_FILE)) {
    const initialData = { posts: [], nextPostId: 1, nextCommentId: 1 };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

const readDB = () => {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/') },
    filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)) }
});
const upload = multer({ storage: storage });

app.get('/api/test', (req, res) => {
    res.send('🌱 식물 집사 커뮤니티 서버 작동 중');
});

app.get('/api/posts', (req, res) => {
    const db = readDB();
    const safePosts = db.posts.map(post => {
        const { password, ...safePost } = post;
        return safePost;
    });
    res.json(safePosts);
});

app.post('/api/posts', upload.single('image'), (req, res) => {
    const db = readDB();
    const newPost = {
        id: db.nextPostId++,
        category: req.body.category || '기타',
        title: req.body.title,
        author: req.body.author,
        password: req.body.password, 
        // [수정된 부분] 상대 경로(/uploads/...)를 사용하여 어떤 도메인/프로토콜에서도 이미지가 올바르게 표시되도록 합니다.
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        comments: [],
        likes: 0
    };
    db.posts.push(newPost);
    writeDB(db);
    
    const { password, ...safePost } = newPost;
    res.json(safePost);
});

app.post('/api/posts/:id/like', (req, res) => {
    const db = readDB();
    const postId = parseInt(req.params.id);
    const post = db.posts.find(p => p.id === postId);

    if (post) {
        post.likes = (post.likes || 0) + 1; 
        writeDB(db);
        const { password, ...safePost } = post;
        res.json(safePost);
    } else {
        res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
});

app.post('/api/posts/:id/comments', (req, res) => {
    const db = readDB();
    const postId = parseInt(req.params.id);
    const post = db.posts.find(p => p.id === postId);

    if (post) {
        const newComment = { id: db.nextCommentId++, text: req.body.text };
        post.comments.push(newComment);
        writeDB(db);
        const { password, ...safePost } = post;
        res.json(safePost);
    } else {
        res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
});

app.delete('/api/posts/:id', (req, res) => {
    const db = readDB();
    const postId = parseInt(req.params.id);
    const inputPassword = req.body.password; 
    
    const postIndex = db.posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        const post = db.posts[postIndex];
        
        if (!post.password || post.password === inputPassword) {
            db.posts.splice(postIndex, 1); 
            writeDB(db);
            res.json({ message: "성공적으로 삭제되었습니다." });
        } else {
            res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
        }
    } else {
        res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
});

// 압축된 리액트 빌드 폴더를 정적 파일로 제공합니다.
app.use(express.static(path.join(__dirname, 'frontend/build')));

// [수정된 부분] 문자열 대신 정규식(/.*/)을 사용하여 모든 경로를 index.html로 안전하게 포워딩합니다.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 정상적으로 작동 중입니다.`);
});