import React, { useState } from 'react';

function Auth({ onLogin }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLoginMode ? '/api/login' : '/api/signup';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                if (isLoginMode) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('isAdmin', data.isAdmin); 
                    onLogin(data.username, data.isAdmin); 
                } else {
                    setIsLoginMode(true);
                    setUsername('');
                    setPassword('');
                }
            } else {
                alert(data.message); 
            }
        } catch (error) {
            console.error('Error:', error);
            alert('서버와 통신하는 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ border: '1px solid #4CAF50', padding: '20px', marginBottom: '30px', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ marginTop: 0 }}>{isLoginMode ? '🌱 식물 집사 로그인' : '🌱 새 집사 등록 (회원가입)'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <input type="text" placeholder="닉네임(아이디)" value={username} onChange={e => setUsername(e.target.value)} required style={{ flex: '1 1 120px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required style={{ flex: '1 1 120px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 100%' }}>
                    <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {isLoginMode ? '로그인' : '가입하기'}
                    </button>
                    <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap', fontSize: '14px' }}>
                        {isLoginMode ? '처음이신가요? 가입하기' : '이미 계정이 있어요'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Auth;