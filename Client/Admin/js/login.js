document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    // Reset message
    messageDiv.textContent = '';
    messageDiv.className = 'message';

    if (!username || !password) {
        showMessage('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, 'success');
            // Store functionality if needed (e.g., localStorage)
            // localStorage.setItem('adminUser', JSON.stringify(data.admin));

            // Redirect after delay
            setTimeout(() => {
                // Redirect to dashboard or home - update this path as needed
                // window.location.href = 'dashboard.html'; 
                alert('Đăng nhập thành công! (Chưa có trang dashboard để chuyển hướng)');
            }, 1000);
        } else {
            showMessage(data.message || 'Đăng nhập thất bại', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi kết nối tới server', 'error');
    }
});

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
}
