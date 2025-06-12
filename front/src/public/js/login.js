document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/apis/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Login exitoso');
            window.location.href = './dashboard.html'; 
        } else {
            const errorData = await response.json();
            alert(`Error en el login: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
});