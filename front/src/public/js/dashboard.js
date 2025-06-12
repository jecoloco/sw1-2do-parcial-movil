document.getElementById('logout-button').addEventListener('click', async function () { 
    try {
        const response = await fetch(`${API_URL}/apis/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Logout exitoso');
            window.location.href = './login.html';
        } else {
            const errorData = await response.json();
            alert(`Error en el logout: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchUserInfo();
    fetchRooms();
});

function fetchUserInfo() {
    fetch(`${API_URL}/apis/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(handleResponse)
    .then(data => {
        if (!data.error) {
            const userInfo = `
                <strong>ID:</strong> ${data.data.id}<br>
                <strong>Nombre:</strong> ${data.data.name}<br>
                <strong>Email:</strong> ${data.data.email}
            `;
            document.getElementById('user-info').innerHTML = userInfo;
        } else {
            document.getElementById('user-info').innerHTML = 'No se pudo cargar la información del usuario.';
        }
    })
    .catch(error => {
        console.error('Hubo un problema con la operación fetch:', error);
        document.getElementById('user-info').innerHTML = 'Error al cargar los datos.';
    });
}

function fetchRooms() {
    fetch(`${API_URL}/apis/sala`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(handleResponse)
    .then(data => {
        const roomsBody = document.getElementById('rooms-body');
        roomsBody.innerHTML = '';
    
        if (!data.error && data.data.length > 0) {
            data.data.forEach(room => {
                const row = createRoomRow(room);
                roomsBody.appendChild(row);
            });            
        } else {
            roomsBody.innerHTML = '<tr><td colspan="4">No se encontraron salas.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Hubo un problema con la operación fetch para salas:', error);
        const roomsBody = document.getElementById('rooms-body');
        roomsBody.innerHTML = '<tr><td colspan="4">Error al cargar las salas.</td></tr>';
    });
}

document.getElementById('view-shared-rooms-button').addEventListener('click', () => {
    fetchSharedRooms();
});

function fetchSharedRooms() {
    fetch(`${API_URL}/apis/userSala/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(handleResponse)
    .then(data => {
        const roomsBody = document.getElementById('rooms-body');
        roomsBody.innerHTML = '';

        if (!data.error && data.data.length > 0) {
            data.data.forEach(room => {
                const id = encodeURIComponent(room.id);
                const title = encodeURIComponent(room.title || '');
                const description = encodeURIComponent(room.description || '');
                const url = `pizarra.html?id=${id}`;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><a href="${url}" style="color: white; font-size: 18px;">${room.id}</a></td>
                    <td><a href="${url}" style="color: white; font-size: 18px;">${room.title}</a></td>
                    <td><a href="${url}" style="color: white; font-size: 18px;">${room.description}</a></td>
                `;
                roomsBody.appendChild(row);
            });   
        } else {
            roomsBody.innerHTML = '<tr><td colspan="4">No se encontraron salas compartidas.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Hubo un problema con la operación fetch para salas compartidas:', error);
        const roomsBody = document.getElementById('rooms-body');
        roomsBody.innerHTML = '<tr><td colspan="4">Error al cargar las salas compartidas.</td></tr>';
    });
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.json();
}

function createRoomRow(room) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><a href="pizarra.html?id=${room.id}" style="color: white; font-size: 18px;">${room.id}</a></td>
        <td><a href="pizarra.html?id=${room.id}" style="color: white; font-size: 18px;">${room.title}</a></td>
        <td><a href="pizarra.html?id=${room.id}" style="color: white; font-size: 18px;">${room.description}</a></td>
        <td>
            <button class="action-button edit-button" onclick="editRoom(${room.id})">Editar</button>
            <button class="action-button delete-button" onclick="deleteRoom(${room.id})">Eliminar</button>
            <button class="action-button invite-button" onclick="inviteToRoom(${room.id})">Invitar</button>
        </td>
    `;
    return row;
}
