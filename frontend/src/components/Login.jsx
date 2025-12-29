const handleLogin = async (loginData) => {
    try {
        const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.email); // Store user email
            // Handle successful login...
        }
    } catch (error) {
        console.error('Login error:', error);
    }
};