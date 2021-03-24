const buttonContainer = document.querySelector('.two');
const buttonRegister = document.querySelector('.button');




/***** EVENTOS *****/
/// Al cargar la página coloca el boton con una X
document.addEventListener('DOMContentLoaded', () => {
    const iconButton = document.querySelector('.fa-plus');
    iconButton.classList.add('fa-times');
})
/// Al presionar al boton cancela el registro y redirecciona al home
buttonContainer.addEventListener('click', cancelRegister);
/// Envía la petición del nuevo registro a la BD
buttonRegister.addEventListener('click', sendNewRegister);








/***** FUNCIONES *****/


function cancelRegister() {
    window.location.href = 'index.html';
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
    window.location.href = 'login.html';
}


/// Funcion para guardar en localStorage
function guardarLS(user) {
    const token = {
        token: user
    };
    localStorage.setItem('token', JSON.stringify(token));
}


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
                    window.location.href = 'index.html';
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



