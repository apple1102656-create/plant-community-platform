import Auth from './Auth';
import React, { useState, useEffect } from 'react';
import './App.css';

const handleSpeechToText = (setTextFunction) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert("현재 사용 중인 인터넷 창에서는 마이크 기능을 지원하지 않습니다. 크롬(Chrome)이나 사파리(Safari)를 이용해 주세요!");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR'; 
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log("마이크 녹음 시작됨");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setTextFunction(transcript); 
  };

  recognition.onerror = (event) => {
    console.error("음성 인식 오류:", event.error);
  };

  recognition.start();
};

function PostItem({ post, onAddComment, onLike, onDelete, currentUser, isAdmin, isLargeFont }) {
  const [commentText, setCommentText] = useState('');

  const quickComments = [
    "식물이 참 싱그럽네요! 🌿",
    "오늘도 화이팅입니다! ❤️",
    "꽃이 정말 예쁘게 피었네요! 🌸",
    "정성으로 키우신 게 보여요! 👍"
  ];

  const submitComment = (e) => {
    e.preventDefault();
    if (!commentText) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case '🌱 자랑하기': return '#e8f5e9';
      case '🆘 질문/구조': return '#ffebee';
      case '🌿 정보공유': return '#e3f2fd';
      default: return '#f5f5f5';
    }
  };

  const fontSize = {
    title: isLargeFont ? '22px' : '18px',
    body: isLargeFont ? '18px' : '14px',
    button: isLargeFont ? '16px' : '14px'
  };

  return (
    <li style={{ marginBottom: '25px', padding: '20px', border: '2px solid #81c784', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.08)', backgroundColor: '#fff', position: 'relative' }}>
      
      {(currentUser === post.author || isAdmin) && (
        <button 
          onClick={() => onDelete(post.id)}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#e53935' }}
          title="게시글 삭제"
        >
          🗑️
        </button>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span style={{ backgroundColor: getCategoryColor(post.category), padding: '6px 12px', borderRadius: '20px', fontSize: fontSize.body, fontWeight: 'bold' }}>
          {post.category || '기타'}
        </span>
        {post.plantType && (
          <span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '6px 12px', borderRadius: '20px', fontSize: fontSize.body, fontWeight: 'bold' }}>
            {post.plantType}
          </span>
        )}
        {post.plantStatus && (
          <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '6px 12px', borderRadius: '20px', fontSize: fontSize.body, fontWeight: 'bold', border: '1px solid #ffe0b2' }}>
            {post.plantStatus}
          </span>
        )}
      </div>

      {post.imageUrl && (
        <div style={{ marginBottom: '15px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
          <img src={post.imageUrl} alt="식물 사진" style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '30px', marginBottom: '15px' }}>
        <div>
          <strong style={{ fontSize: fontSize.title, color: '#1b5e20' }}>{post.title || '제목 없음'}</strong> <br/>
          <span style={{ color: '#555', fontSize: fontSize.body, marginTop: '6px', display: 'inline-block' }}>🏡 작성자: <strong>{post.author || '익명'}</strong>님</span>
        </div>
        
        <button 
          onClick={() => onLike(post.id)}
          style={{ backgroundColor: '#fce4ec', color: '#c2185b', border: '2px solid #f8bbd0', padding: '8px 16px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: fontSize.button, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          🌸 응원해요 {post.likes || 0}
        </button>
      </div>
      
      <ul style={{ marginTop: '15px', paddingLeft: '0', listStyle: 'none' }}>
        {post.comments && post.comments.map(comment => (
          <li key={comment.id} style={{ fontSize: fontSize.body, backgroundColor: '#f1f8e9', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid #7cb342' }}>
            💬 <strong>{comment.text}</strong>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: fontSize.body, fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '6px' }}>⚡ 클릭해서 빠른 인사 남기기:</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {quickComments.map((quickText, idx) => (
            <button 
              key={idx} 
              type="button" 
              onClick={() => setCommentText(quickText)}
              style={{ backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '15px', padding: '5px 10px', fontSize: '13px', cursor: 'pointer', color: '#2e7d32' }}
            >
              + {quickText}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submitComment} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <input 
          type="text" 
          placeholder="따뜻한 댓글을 남겨주세요..." 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '2px solid #a5d6a7', fontSize: fontSize.body }}
        />
        <button 
          type="button" 
          onClick={() => handleSpeechToText(setCommentText)}
          style={{ padding: '10px', backgroundColor: '#e3f2fd', color: '#1565c0', border: '2px solid #90caf9', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: fontSize.button }}
          title="음성으로 댓글 쓰기"
        >
          🎤
        </button>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: fontSize.button }}>
          등록
        </button>
      </form>
    </li>
  );
}

function App() {
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('username'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [isLargeFont, setIsLargeFont] = useState(false); 
  const [viewMode, setViewMode] = useState('all');

  const handleLogin = (username, adminStatus) => {
      setLoggedInUser(username);
      setIsAdmin(adminStatus); 
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isAdmin'); 
      setLoggedInUser(null);
      setIsAdmin(false); 
      setViewMode('all');
      alert('로그아웃 되었습니다.');
  };
  
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null); 
  
  const [selectedCategory, setSelectedCategory] = useState('🌱 자랑하기'); 
  const [plantType, setPlantType] = useState('🌸 꽃'); 
  const [plantStatus, setPlantStatus] = useState('💧 오늘 물 줬어요'); 
  
  const [filterCategory, setFilterCategory] = useState('모든 게시글'); 
  const [filterPlantType, setFilterPlantType] = useState('모든 식물'); 
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = () => {
    fetch('/api/posts')
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error('서버 연결 오류:', error));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert("글을 작성하려면 먼저 로그인해 주세요!");
        return;
    }

    if (!title) {
        alert("식물에 대한 내용을 입력해 주세요!");
        return;
    }

    const formData = new FormData();
    formData.append('category', selectedCategory); 
    formData.append('plantType', plantType); 
    formData.append('plantStatus', plantStatus); 
    formData.append('title', title);
    if (image) formData.append('image', image);

    fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }
      return response.json();
    })
    .then(newPost => {
      setPosts([...posts, newPost]); 
      setTitle('');
      setImage(null);
      document.getElementById('file-input').value = ""; 
      setViewMode('all'); 
    })
    .catch(error => {
      alert(error.message);
      console.error('글 작성 오류:', error);
    });
  };

  const handleAddComment = (postId, text) => {
    fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text }),
    })
    .then(response => response.json())
    .then(updatedPost => {
      setPosts(posts.map(p => p.id === postId ? updatedPost : p));
    })
    .catch(error => console.error('댓글 작성 오류:', error));
  };

  const handleLike = (postId) => {
    fetch(`/api/posts/${postId}/like`, {
      method: 'POST'
    })
    .then(response => response.json())
    .then(updatedPost => {
      setPosts(posts.map(p => p.id === postId ? updatedPost : p));
    })
    .catch(error => console.error('응원 처리 중 오류:', error));
  };

  const handleDelete = (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    })
    .then(async (response) => {
      if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message); 
          throw new Error('삭제 권한 없음');
      }
      return response.json();
    })
    .then(() => {
      setPosts(posts.filter(p => p.id !== postId));
      alert("성공적으로 삭제되었습니다.");
    })
    .catch(error => console.error('게시글 삭제 중 오류:', error));
  };

  const filteredPosts = posts.filter(post => {
    const safeCategory = post.category || '기타';
    const safePlantType = post.plantType || '기타';
    const safeTitle = post.title || '';
    const safeAuthor = post.author || '';

    const matchesCategory = filterCategory === '모든 게시글' || safeCategory === filterCategory;
    const matchesPlantType = filterPlantType === '모든 식물' || safePlantType === filterPlantType;
    const matchesSearch = safeTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          safeAuthor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMyPage = viewMode === 'all' || safeAuthor === loggedInUser;
    
    return matchesCategory && matchesPlantType && matchesSearch && matchesMyPage;
  });

  // [수정됨] 주석을 안전한 위치로 옮기고, 코드가 문법에 맞게 렌더링 되도록 수정했습니다.
  return (
    <div translate="no" className="notranslate" style={{ maxWidth: '650px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px' }}>
        <span style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>👀 화면 설정</span>
        <button 
          onClick={() => setIsLargeFont(!isLargeFont)}
          style={{ backgroundColor: isLargeFont ? '#2e7d32' : '#ffffff', color: isLargeFont ? '#ffffff' : '#2e7d32', border: '2px solid #2e7d32', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {isLargeFont ? '🔍 원래 크기로' : '🔍 글씨 크게 보기'}
        </button>
      </div>

      <h1 style={{ color: '#1b5e20', borderBottom: '3px solid #4CAF50', paddingBottom: '10px', fontSize: isLargeFont ? '32px' : '26px' }}>
        🪴 반려식물 쉼터 (Botanook)
      </h1>
      
      {!loggedInUser ? (
          <Auth onLogin={handleLogin} />
      ) : (
          <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: isLargeFont ? '18px' : '15px', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
              <span><strong>{loggedInUser}</strong> 님, 환영합니다! 🌿</span>
              {isAdmin && <span style={{ color: '#ff9800', fontWeight: 'bold' }}>[관리자]</span>}
              
              <button 
                onClick={() => setViewMode(viewMode === 'all' ? 'my' : 'all')}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: viewMode === 'my' ? '#2e7d32' : '#e8f5e9', color: viewMode === 'my' ? '#fff' : '#2e7d32', border: '2px solid #2e7d32', borderRadius: '6px', fontWeight: 'bold' }}
              >
                {viewMode === 'my' ? '🌱 모든 이웃 글 보기' : '📖 내 식물 기록 보기'}
              </button>

              <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>로그아웃</button>
          </div>
      )}
      
      <div style={{ backgroundColor: '#f1f8e9', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '2px solid #c8e6c9' }}>
        <h3 style={{ marginTop: 0, color: '#2e7d32', fontSize: isLargeFont ? '22px' : '18px' }}>📝 나의 반려식물 이야기 나누기</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '2px solid #a5d6a7', backgroundColor: '#fff', fontSize: isLargeFont ? '18px' : '14px', flex: '1' }}
            >
              <option value="🌱 자랑하기">🌱 자랑하기</option>
              <option value="🆘 질문/구조">🆘 질문/구조</option>
              <option value="🌿 정보공유">🌿 정보공유</option>
            </select>

            <select 
              value={plantType} 
              onChange={(e) => setPlantType(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '2px solid #90caf9', backgroundColor: '#e3f2fd', fontSize: isLargeFont ? '18px' : '14px', flex: '1', fontWeight: 'bold', color: '#1565c0' }}
            >
              <option value="🌸 꽃">🌸 꽃</option>
              <option value="🍅 열매/채소">🍅 열매/채소</option>
              <option value="🌿 관엽/화초">🌿 관엽/화초</option>
              <option value="🌵 다육/선인장">🌵 다육/선인장</option>
              <option value="기타 식물">기타 식물</option>
            </select>

            <select 
              value={plantStatus} 
              onChange={(e) => setPlantStatus(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '2px solid #ffcc80', backgroundColor: '#fff8e1', fontSize: isLargeFont ? '18px' : '14px', flex: '1', fontWeight: 'bold' }}
            >
              <option value="💧 오늘 물 줬어요">💧 오늘 물 줬어요</option>
              <option value="☀️ 햇빛 쬐는 중">☀️ 햇빛 쬐는 중</option>
              <option value="🌸 예쁜 꽃이 피었어요">🌸 예쁜 꽃이 피었어요</option>
              <option value="🪴 분갈이 했어요">🪴 분갈이 했어요</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="식물에 대한 소소한 이야기를 적어주세요!" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '2px solid #a5d6a7', fontSize: isLargeFont ? '18px' : '14px' }}
            />
            <button 
              type="button" 
              onClick={() => handleSpeechToText(setTitle)}
              style={{ padding: '12px', backgroundColor: '#e3f2fd', color: '#1565c0', border: '2px solid #90caf9', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: isLargeFont ? '20px' : '16px' }}
              title="음성으로 글 쓰기"
            >
              🎤
            </button>
          </div>
          
          <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '6px', border: '1px dashed #a5d6a7' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: isLargeFont ? '16px' : '14px', color: '#555' }}>📷 식물 사진 첨부하기:</label>
            <input 
              id="file-input"
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])}
              style={{ fontSize: isLargeFont ? '16px' : '14px' }}
            />
          </div>

          <button type="submit" style={{ padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: isLargeFont ? '20px' : '16px' }}>
            💚 이웃들과 이야기 공유하기
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#1b5e20', fontSize: isLargeFont ? '24px' : '20px' }}>
          {viewMode === 'my' ? '📖 나의 반려식물 기록' : '💬 이웃들의 식물 이야기'}
        </h2>
        
        {viewMode === 'all' && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '20px', border: '2px solid #4CAF50', color: '#2e7d32', fontWeight: 'bold', outline: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              <option value="모든 게시글">모든 게시글</option>
              <option value="🌱 자랑하기">🌱 자랑하기</option>
              <option value="🆘 질문/구조">🆘 질문/구조</option>
              <option value="🌿 정보공유">🌿 정보공유</option>
            </select>

            <select 
              value={filterPlantType} 
              onChange={(e) => setFilterPlantType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '20px', border: '2px solid #90caf9', color: '#1565c0', fontWeight: 'bold', outline: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              <option value="모든 식물">모든 식물</option>
              <option value="🌸 꽃">🌸 꽃</option>
              <option value="🍅 열매/채소">🍅 열매/채소</option>
              <option value="🌿 관엽/화초">🌿 관엽/화초</option>
              <option value="🌵 다육/선인장">🌵 다육/선인장</option>
              <option value="기타 식물">기타 식물</option>
            </select>

            <input 
              type="text" 
              placeholder="🔍 검색어..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '20px', border: '2px solid #aaa', outline: 'none', width: '130px', fontSize: '14px' }}
            />
          </div>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {[...filteredPosts].reverse().map(post => (
          <PostItem 
            key={post.id} 
            post={post} 
            onAddComment={handleAddComment} 
            onLike={handleLike} 
            onDelete={handleDelete} 
            currentUser={loggedInUser}
            isAdmin={isAdmin}
            isLargeFont={isLargeFont}
          />
        ))}
        {filteredPosts.length === 0 && (
          <li style={{ textAlign: 'center', color: '#777', padding: '30px', fontSize: isLargeFont ? '20px' : '16px' }}>
            {viewMode === 'my' ? '아직 작성하신 기록이 없습니다. 첫 소식을 나누어 보세요! 🌿' : '조건에 맞는 게시글이 없습니다. 첫 소식을 나누어 보세요! 🌿'}
          </li>
        )}
      </ul>
    </div>
  );
}

export default App;