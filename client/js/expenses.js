const buttonContainer = document.querySelector('.two');
const buttonRegister = document.querySelector('.button');
const iconClose = document.querySelector('.registro__container--icon');




/***** EVENTOS *****/
/// Al cargar la página coloca el boton con una X
document.addEventListener('DOMContentLoaded', () => {
    const iconButton = document.querySelector('.fa-plus');
    iconButton.classList.add('fa-times');
    iconClose.style.display = 'block';
    const token = leerLocalStorage();
    if (token.token == 0) {
        window.location.href = 'index.html';
    }
})
/// Al presionar al boton cancela el registro y redirecciona al home versión Mobile
buttonContainer.addEventListener('click', cancelRegisterMobile);
/// Envía la petición del nuevo registro a la BD
buttonRegister.addEventListener('click', sendNewRegister);
/// Al presionar al boton cancela el registro y redirecciona al home versión Desktop
iconClose.addEventListener('click', cancelRegisterDesktop);









/***** FUNCIONES *****/


/// Funcion para leer el localStorage una vez iniciada la aplicación
function leerLocalStorage () {
    let tokenUser;
    tokenUser = obtenerTokenLocalStorage();
    return tokenUser;
}


/// Función que redirecciona a página de inicio versión Mobile
function cancelRegisterMobile() {
    window.location.href = 'home.html';
}


/// Función que redirecciona a página de inicio versión Desktop
function cancelRegisterDesktop() {
    window.location.href = 'home.html';
}


/// Función para obtener los datos guardados en LocalStorage
function obtenerTokenLocalStorage() {
    let tokenUser;

    //Comprobamos si hay algo en localStorage
    if (localStorage.getItem('token') === null) {
        tokenUser = [];
    } else {
        tokenUser = JSON.parse(localStorage.getItem('token'));
    }
    return tokenUser;
}


/// Función que redirecciona a la página de Login cuando el token esté vencido
function login() {
    location.reload();        
    window.location.href = 'index.html';
}


/// Funcion para guardar en localStorage
function guardarLS(user) {
    const token = {
        token: user
    };
    localStorage.setItem('token', JSON.stringify(token));
}


/// Funcion que realiza la peticion y envia los registros a la BD
async function sendNewRegister(e) {
    e.preventDefault();

    const token = await obtenerTokenLocalStorage();
    const concept = document.querySelector('.concept');
    const price = document.querySelector('.price');
    if (!price.value) {
        price.value = 0;
    }


    if (token.token != 0) {
        await axios({
            method: 'post',
            headers: { Authorization: `Bearer ${token.token}` },       
            params: { concept: `${concept.value}`, price: `${price.value}`, action: 2 } , 
            url: `http://localhost:3000/budget/v1/accounting`,        
            responseType: 'json'
        }).then((success) => {
            if (success.statusText) {
                console.log(success.data);
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 2000);
            } else {
                console.log('ERRORRRRR')
            }
        }).catch((err) => {            
            console.log(err);
            guardarLS(0);
            login();
        });
    } else {
        guardarLS(0);
        login();
    }
}



