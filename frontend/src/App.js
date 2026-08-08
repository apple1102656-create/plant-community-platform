import React, { useState, useEffect } from 'react';
import './App.css';

function PostItem({ post, onAddComment, onLike, onDelete }) {
  const [commentText, setCommentText] = useState('');

  const submitComment = (e) => {
    e.preventDefault();
    if (!commentText) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  // 카테고리별로 배지 색상을 다르게 설정합니다.
  const getCategoryColor = (category) => {
    switch(category) {
      case '🌱 자랑하기': return '#e8f5e9';
      case '🆘 질문/구조': return '#ffebee';
      case '🌿 정보공유': return '#e3f2fd';
      default: return '#f5f5f5';
    }
  };

  return (
    <li style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff', position: 'relative' }}>
      
      <button 
        onClick={() => onDelete(post.id)}
        style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#999' }}
        title="게시글 삭제"
      >
        🗑️
      </button>

      {/* 카테고리 배지 출력 */}
      <span style={{ display: 'inline-block', backgroundColor: getCategoryColor(post.category), padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
        {post.category || '기타'}
      </span>

      {post.imageUrl && (
        <div style={{ marginBottom: '15px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
          <img src={post.imageUrl} alt="식물 자랑 사진" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '30px' }}>
        <div>
          <strong style={{ fontSize: '18px' }}>{post.title}</strong> <br/>
          <span style={{ color: '#666', fontSize: '14px', marginTop: '5px', display: 'inline-block' }}>작성자: {post.author}</span>
        </div>
        
        <button 
          onClick={() => onLike(post.id)}
          style={{ backgroundColor: '#ffebee', color: '#e53935', border: '1px solid #ffcdd2', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          ❤️ {post.likes || 0}
        </button>
      </div>
      
      <ul style={{ marginTop: '15px', paddingLeft: '0', listStyle: 'none' }}>
        {post.comments && post.comments.map(comment => (
          <li key={comment.id} style={{ fontSize: '14px', backgroundColor: '#f1f8e9', padding: '8px 12px', borderRadius: '5px', marginBottom: '8px' }}>
            💬 {comment.text}
          </li>
        ))}
      </ul>

      <form onSubmit={submitComment} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
        <input 
          type="text" 
          placeholder="따뜻한 조언이나 댓글을 달아주세요..." 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#8bc34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          답글
        </button>
      </form>
    </li>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null); 
  
  // [새로운 상태] 글쓰기용 카테고리와 필터용 카테고리를 분리합니다.
  const [selectedCategory, setSelectedCategory] = useState('🌱 자랑하기'); // 작성용
  const [filterCategory, setFilterCategory] = useState('전체보기'); // 조회용
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = () => {
    fetch('http://localhost:8080/api/posts')
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error('서버 연결 오류:', error));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !author || !password) {
        alert("작성자, 비밀번호, 내용을 모두 입력해 주세요!");
        return;
    }

    const formData = new FormData();
    formData.append('category', selectedCategory); // 폼 데이터에 카테고리 추가
    formData.append('title', title);
    formData.append('author', author);
    formData.append('password', password);
    if (image) formData.append('image', image);

    fetch('http://localhost:8080/api/posts', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(newPost => {
      setPosts([...posts, newPost]); 
      setTitle('');
      setAuthor('');
      setPassword('');
      setImage(null);
      document.getElementById('file-input').value = ""; 
    })
    .catch(error => console.error('글 작성 오류:', error));
  };

  const handleAddComment = (postId, text) => {
    fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
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
    fetch(`http://localhost:8080/api/posts/${postId}/like`, {
      method: 'POST'
    })
    .then(response => response.json())
    .then(updatedPost => {
      setPosts(posts.map(p => p.id === postId ? updatedPost : p));
    })
    .catch(error => console.error('좋아요 처리 중 오류:', error));
  };

  const handleDelete = (postId) => {
    const inputPassword = window.prompt('게시글을 삭제하시려면 설정한 비밀번호를 입력하세요.');
    if (!inputPassword) return; 

    fetch(`http://localhost:8080/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: inputPassword })
    })
    .then(async (response) => {
      if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message); 
          throw new Error('비밀번호 불일치');
      }
      return response.json();
    })
    .then(() => {
      setPosts(posts.filter(p => p.id !== postId));
      alert("성공적으로 삭제되었습니다.");
    })
    .catch(error => console.error('게시글 삭제 중 오류:', error));
  };

  // [고도화된 필터 로직] 카테고리 탭과 검색어가 동시에 적용되도록 설정합니다.
  const filteredPosts = posts.filter(post => {
    const matchesCategory = filterCategory === '전체보기' || post.category === filterCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
        🪴 식물 집사 커뮤니티
      </h1>
      
      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>새 고민/자랑 글쓰기</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="작성자 닉네임" 
              value={author} 
              onChange={(e) => setAuthor(e.target.value)} 
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="password" 
              placeholder="삭제용 비밀번호 (필수)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* 글쓰기 카테고리 선택 드롭다운 */}
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', width: '130px' }}
            >
              <option value="🌱 자랑하기">🌱 자랑하기</option>
              <option value="🆘 질문/구조">🆘 질문/구조</option>
              <option value="🌿 정보공유">🌿 정보공유</option>
            </select>
            <input 
              type="text" 
              placeholder="식물에 대한 고민이나 자랑을 적어주세요!" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          
          <input 
            id="file-input"
            type="file" 
            accept="image/*" 
            onChange={(e) => setImage(e.target.files[0])}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
          />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            카테고리와 함께 등록하기
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0 }}>실시간 게시판</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* 게시판 필터링 카테고리 탭 */}
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '8px', borderRadius: '20px', border: '1px solid #4CAF50', color: '#4CAF50', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
          >
            <option value="전체보기">전체보기</option>
            <option value="🌱 자랑하기">🌱 자랑하기</option>
            <option value="🆘 질문/구조">🆘 질문/구조</option>
            <option value="🌿 정보공유">🌿 정보공유</option>
          </select>
          <input 
            type="text" 
            placeholder="🔍 검색어를 입력하세요..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', borderRadius: '20px', border: '1px solid #aaa', outline: 'none', width: '150px' }}
          />
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {[...filteredPosts].reverse().map(post => (
          <PostItem 
            key={post.id} 
            post={post} 
            onAddComment={handleAddComment} 
            onLike={handleLike} 
            onDelete={handleDelete} 
          />
        ))}
        {filteredPosts.length === 0 && (
          <li style={{ textAlign: 'center', color: '#999', padding: '20px' }}>조건에 맞는 게시글이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

export default App;