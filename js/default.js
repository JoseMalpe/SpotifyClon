const clientId = '8a743db96b5a4fa9bb9063b42a9e231b'
const redirectUri = 'http://127.0.0.1:5500/JS/Spotify_Bulma_Final/html/index.html' // Nuestra URL de vuelta a la aplicación despues de obtener el token de acceso de Spotify
const botonIniciarSesion = `
    <div class="navbar-item">
        <div class="buttons">
        <a class="button text-base" style="background-color: var(--primary-color)" onclick="loginToSpotify()">
            <strong>Iniciar sesión</strong>
        </a>
        </div>
    </div>`;

const botonSesionIniciada = `
    <div id="user-dropdown" class="navbar-item dropdown" onclick="abrirDropDownUser()">
        <a class="button navbar-link is-arrowless">
        <span class="iconify" data-icon="mdi-account"></span>
        </a>

        <div class="navbar-dropdown is-right is-boxed mr-3 is-hidden">
        <a class="navbar-item">
            Perfil
        </a>
        <a class="navbar-item" onclick="cerrarSesion(event)">
            Cerrar sessión
        </a>
        </div>
    </div>`;

const mensajeIniciarSesion = `
    <section class="p-3">
        <article class="message">
            <div class="message-header">
                <p>Por favor, Inicie sesión</p>
            </div>
            <div class="message-body">
                Para poder consultar el contenido de <strong>Spotify</strong> es obligatorio.
                <br>
                <br>
                <button class="button text-base text-bold" style="background-color: var(--primary-color)" onclick="loginToSpotify()">Iniciar sesión</button>
            </div>
        </article>
    </section>`;

const info = [
    {
        img: 'https://i.scdn.co/image/ab67656300005f1f27b522c2cb6feb4ee83096ea',
        title: 'Crímenes Ibéricos',
        subtitle: 'Abbcast',
    },
    {
        img: 'https://i.scdn.co/image/ab67656300005f1f6e253899cc5cc1cbaa6ad5c3',
        title: 'Flash Deportes',
        subtitle: 'SER Podcast',
    },
    {
        img: 'https://i.scdn.co/image/ab67656300005f1f32da04be948f41862e2809c1',
        title: 'Radio Pirata',
        subtitle: 'Radio Pirata',
    },
    {
        img: 'https://i.scdn.co/image/1571d3ce9e501c6d2a0bd3bbd5a5900c9278bb94',
        title: 'Los Vikikos',
        subtitle: 'Vikikos',
    },
    {
        img: 'https://i.scdn.co/image/ab67656300005f1fdb0b107c63b8796f70dc0d80',
        title: 'Podcast de La Hora de Walter',
        subtitle: 'La Hora de Walter',
    },
];

function pintarGeneralCard(item) {
    return `
    <div class="column is-full-mobile is-3-tablet is-2-desktop is-2-widescreen is-2-fullhd">
        <div class="card">
        <div class="card-image">
            <figure class="image is-256x256">
            <img src="${item.img}" alt="Placeholder image">
            </figure>
        </div>
        <div class="card-content p-3">
            <div class="media">
            <div class="media-content truncate">
                <p class="text-bold truncate">${item.title}</p>
                <p class="text-normal truncate">${item.subtitle}</p>
            </div>
            </div>
        </div>
        </div>
    </div>`;
}
function loginToSpotify() {
    let codeVerifier = generateRandomString(128);

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
        let state = generateRandomString(16);
        let scope = 'user-read-private user-read-email';

        localStorage.setItem('code_verifier', codeVerifier);

        let args = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge
        });

        window.location = 'https://accounts.spotify.com/authorize?' + args;
    });
}

/* Funcion para generar un código aleatorio */
function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/* Función para generar el code_challenge */
async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    return base64encode(digest);
}

const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');

if (code && !localStorage.getItem('access_token')) {
    let codeVerifier = localStorage.getItem('code_verifier');

    let body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
    });

    const response = fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP status ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            actualizarVistaUsuario();
            // Eliminar code y state de la URL
            const urlObject = new URL(window.location.href);
            const params = urlObject.searchParams;
            params.delete('code');
            params.delete('state');
            window.history.replaceState({}, '', urlObject.toString());
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function actualizarVistaUsuario() {
    /* Mirar si tenemos token */
    const token = localStorage.getItem('access_token');
    if (token) {
        navBarLogin.innerHTML = botonSesionIniciada;
        /* Hacer llamada API Spotify para pedir el artista David */
        let listaCard = '';
        for (let i = 0; i < info.length; i++) {
            listaCard += pintarGeneralCard(info[i]);
        }
        main.innerHTML = `
            <section class="columns is-mobile is-multiline p-3">
                ${listaCard}
            </section>
        `;
    } else {
        navBarLogin.innerHTML = botonIniciarSesion;
        main.innerHTML = mensajeIniciarSesion;
    }
}


const main = document.getElementById('main');
const navBarLogin = document.getElementById('login-button');

actualizarVistaUsuario();

// Get all "navbar-burger" elements
const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
// Add a click event on each of them
$navbarBurgers.forEach(el => {
    el.addEventListener('click', () => {
        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

    });
});

function cerrarSesion(e) {
    localStorage.clear();
    actualizarVistaUsuario();
    e.stopPropagation();
}

function abrirDropDownUser() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('is-active');
    dropdown.getElementsByClassName('navbar-dropdown')[0].classList.toggle('is-hidden');
}