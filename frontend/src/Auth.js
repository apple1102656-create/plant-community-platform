import React, { useState } from 'react';

function Auth({ onLogin }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 로그인 모드인지 회원가입 모드인지에 따라 서버에 요청할 주소가 달라집니다.
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
                    // 로그인 성공 시: 브라우저 금고(localStorage)에 입장권과 닉네임 저장
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.username);
                    onLogin(data.username); // 부모(App.js)에게 로그인 성공을 알림
                } else {
                    // 회원가입 성공 시: 로그인 화면으로 전환
                    setIsLoginMode(true);
                    setUsername('');
                    setPassword('');
                }
            } else {
                alert(data.message); // 실패 사유 알림 (예: 비밀번호 틀림)
            }
        } catch (error) {
            console.error('Error:', error);
            alert('서버와 통신하는 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ border: '1px solid #4CAF50', padding: '20px', marginBottom: '30px', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ marginTop: 0 }}>{isLoginMode ? '🌱 식물 집사 로그인' : '🌱 새 집사 등록 (회원가입)'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="text" placeholder="닉네임(아이디)" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                
                <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isLoginMode ? '로그인' : '가입하기'}
                </button>
                
                <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                    {isLoginMode ? '처음이신가요? 가입하기' : '이미 계정이 있어요'}
                </button>
            </form>
        </div>
    );
}

export default Auth;