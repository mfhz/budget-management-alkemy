const containerRegisters = document.querySelector('.items-register');
const containerMenu = document.querySelector('.menu');

const profile = document.querySelector('.my-profile');
profile.addEventListener('click', () => {
    window.location.href = 'profile.html';
});

/// Al cargar la página lee el Local Storage
document.addEventListener('DOMContentLoaded', leerLocalStorage);
/// Al cargar la página obtener registros de la BD
document.addEventListener('DOMContentLoaded', getRegistersBD);


/// Obtener e imprimir los resgistros realizados por el usuario
async function getRegistersBD(e) {
    e.preventDefault();
    let tokenUser = leerLocalStorage();
    if (tokenUser.token != 0) {  
        await axios({
            method: 'get',
            headers: { Authorization: `Bearer ${tokenUser.token}` },
            url: `http://localhost:3000/budget/v1/accounting`,
            responseType: 'json'
        }).then((success) => {
            if (success.statusText) {
                if (success.data.length) {
                    printContentRegisters(success.data);      
                } else {
                    printDefaulRegister();
                }
            }
        }).catch((err) => {
            guardarLS(0);
            login();
            console.log(err);
        });
    } else {
        login();
    }
}









/**** FUNCIONES ****/

function leerLocalStorage () {
    let tokenUser;
    tokenUser = obtenerTokenLocalStorage();
    return tokenUser;
}

function guardarLS(user) {
    const token = {
        token: user
    };
    localStorage.setItem('token', JSON.stringify(token));
}


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


function printContentRegisters(data) {
    data.forEach(element => {
        console.log(element);        
        const registersItems = document.createElement('div');
        const concept = document.createElement('p');
        const amount = document.createElement('p');
        const date = document.createElement('p');
        const actionType = document.createElement('p');
        const options = document.createElement('div');
        const icon = document.createElement('i');

        registersItems.classList.add('register');
        containerRegisters.appendChild(registersItems);

        concept.textContent = element.concept;
        concept.classList.add('register__concept');
        amount.textContent = `$ ${element.price}`;
        amount.classList.add('register__amount');
        date.textContent = element.date;
        date.textContent = date.textContent.substr(0,19);
        date.classList.add('register__date');
        actionType.textContent = element.action_id;
        actionType.classList.add('register__movement-type');
        options.classList.add('register__options');
        icon.classList.add('fas');
        icon.classList.add('fa-ellipsis-h');

        registersItems.appendChild(concept);
        registersItems.appendChild(amount);
        registersItems.appendChild(date);
        if (actionType.textContent == 1) {
            actionType.textContent = 'Ingreso';
            registersItems.appendChild(actionType);
        } else {
            actionType.textContent = 'Egreso';
            registersItems.appendChild(actionType);
        }
        registersItems.appendChild(options);
        options.appendChild(icon);
    });
}


function printDefaulRegister() {
    const buttons = document.querySelector('.main__registers--buttons');
    const mainTitle = document.querySelector('.main__registers--title');


    containerMenu.style.display = 'none';
    buttons.style.display = 'none';
    mainTitle.style.marginBottom = '5vw'


    const defaulRegister = document.createElement('div');
    const containerImg = document.createElement('div');
    const imgDefault = document.createElement('img');
    const textDefault = document.createElement('p');


    defaulRegister.classList.add('items-register__default');
    containerImg.classList.add('items-register__default--img');
    imgDefault.setAttribute('src', './assets/bad.svg');
    imgDefault.setAttribute('alt', 'null registers');
    textDefault.textContent = 'Ups! No tienes ningún movimiento. Intenta crear uno';
    textDefault.classList.add('items-register__default--text');


    containerRegisters.appendChild(defaulRegister);
    defaulRegister.appendChild(containerImg);
    containerImg.appendChild(imgDefault);
    defaulRegister.appendChild(textDefault);

}


function login() {
    location.reload();        
    window.location.href = 'login.html';
}