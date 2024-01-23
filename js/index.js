const acces_token = 'David'
const

function actualizarVistaUsuario();

const token = localStorage, getItem('acces_token')

async function searchArtist(name) {
    const accessToken = localStorage.getItem('access_token');

    info.innerHTML = '<p>Cargando...</p>';

    const response = await fetch(`https://api.spotify.com/v1/search?q=${name}&type=artist`, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });


    const data = await response.json();
    if (data.error) {
        switch (data.error.status) {
            case 401:
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    await refreshTokenSpotify(refreshToken);
                    await searchArtist(encodeURIComponent(document.getElementById('artist').value));
                    return;
                } else {
                    localStorage.removeItem('access_token');
                    window.location = "http://127.0.0.1:5500/JS/P15/login.html";
                }
                break;
            default:
                info.innerHTML = '<p>Algo ha salido mal!</p>';
                return;
        }
    }


    let result = '';
    for (let i = 0; i < data.artists.limit; i++) {
        result += `
        <li>
            <img
                width="100px"
                src="
                    ${data.artists.items[i].images[0] ?
                data.artists.items[i].images[0].url :
                'https://uning.es/wp-content/uploads/2016/08/ef3-placeholder-image-300x203.jpg'}
                "
            />
            <button onclick="goToDetail('${data.artists.items[i].id}')">Ver albumes</button>
            <button onclick="goToTracks('${data.artists.items[i].id}')">Ver canciones</button>
            ${data.artists.items[i].name}
        </li>`;
    }

    info.innerHTML = `
    <ul>
        ${result}
    </ul>
`;
}