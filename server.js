const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'botanook-super-secret-key'; 

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
    const initialData = { users: [], posts: [], nextPostId: 1, nextCommentId: 1 };
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

// 토큰 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: "로그인이 필요합니다." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "유효하지 않은 입장권입니다." });
        req.user = user; 
        next();
    });
};

app.get('/api/test', (req, res) => {
    res.send('🌱 식물 집사 커뮤니티 서버 작동 중');
});

app.post('/api/signup', async (req, res) => {
    const db = readDB();
    const { username, password } = req.body;

    const userExists = db.users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ message: "이미 사용 중인 닉네임(아이디)입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: db.users.length + 1,
        username: username,
        password: hashedPassword,
        isAdmin: false // 기본 가입자는 관리자 아님
    };
    
    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({ message: "회원가입이 완료되었습니다!" });
});

app.post('/api/login', async (req, res) => {
    const db = readDB();
    const { username, password } = req.body;

    const user = db.users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: "존재하지 않는 닉네임입니다." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin || false }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: "로그인 성공!", token: token, username: user.username, isAdmin: user.isAdmin || false });
});

app.get('/api/posts', (req, res) => {
    const db = readDB();
    const safePosts = db.posts.map(post => {
        const { password, ...safePost } = post;
        return safePost;
    });
    res.json(safePosts);
});

app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
    const db = readDB();
    const newPost = {
        id: db.nextPostId++,
        category: req.body.category || '기타',
        title: req.body.title,
        author: req.user.username,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        comments: [],
        likes: 0
    };
    db.posts.push(newPost);
    writeDB(db);
    res.json(newPost);
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

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    const db = readDB();
    const postId = parseInt(req.params.id);
    const postIndex = db.posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        const post = db.posts[postIndex];
        
        // 작성자 본인이거나 관리자(isAdmin)일 경우 삭제 허용
        if (post.author === req.user.username || req.user.isAdmin === true) {
            db.posts.splice(postIndex, 1); 
            writeDB(db);
            res.json({ message: "성공적으로 삭제되었습니다." });
        } else {
            res.status(403).json({ message: "본인이 작성한 글만 삭제할 수 있습니다." });
        }
    } else {
        res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
});

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 정상적으로 작동 중입니다.`);
});