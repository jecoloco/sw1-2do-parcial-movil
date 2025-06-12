document.getElementById('registration-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch(`${API_URL}/apis/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Registro exitoso');
            window.location.href = './dashboard.html';
        } else {
            const errorData = await response.json();
            alert(`Error en el registro: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
});