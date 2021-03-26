/**** VARIABLES GLOBALES ****/
const containerRegisters = document.querySelector('.items-register');
const containerMenu = document.querySelector('.menu');
// let desktop = window.matchMedia("(min-width: 1000px)");
const containerButton = document.querySelector('.two');
const header = document.querySelector('.header__menu');
const incomeDesktop = document.querySelector('.button-incomes__text');
const expenseDesktop = document.querySelector('.button-expenses__text');




/// Hipervinculo a la página del perfil
const profile = document.querySelector('.my-profile');
profile.addEventListener('click', () => {
    window.location.href = 'profile.html';
});


/**** EVENTOS ****/


/// Al cargar la página lee el Local Storage
document.addEventListener('DOMContentLoaded', leerLocalStorage);
/// Al cargar la página obtener registros de la BD
document.addEventListener('DOMContentLoaded', getRegistersBD);
/// Crea ingreso o egreso para versión mobile
containerButton.addEventListener('click', optionsRegisterMobile);
///
incomeDesktop.addEventListener('click', optionsRegisterIncome);
///
expenseDesktop.addEventListener('click', optionsRegisterExpense);




/**** FUNCIONES ****/


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
                    // console.log(success.data);
                    printContentRegisters(success.data);      
                    printBalance(success.data);      
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


/// Funcion para leer el localStorage una vez iniciada la aplicación
function leerLocalStorage () {
    let tokenUser;
    tokenUser = obtenerTokenLocalStorage();
    return tokenUser;
}


/// Funcion para guardar en localStorage
function guardarLS(user) {
    const token = {
        token: user
    };
    localStorage.setItem('token', JSON.stringify(token));
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


/// Función que imprime los registres del usuario una vez logueado
function printContentRegisters(data) {
    data.forEach(element => {
        // console.log(element);        
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
        options.setAttribute('data-id', element.accounting_id);
        icon.classList.add('fas');
        icon.classList.add('fa-ellipsis-h');

        registersItems.appendChild(concept);
        registersItems.appendChild(amount);
        registersItems.appendChild(date);
        if (actionType.textContent == 1) {
            actionType.textContent = 'Ingreso';
            actionType.style.color = '#21C08B';
            actionType.style.fontWeight = 'bold';
            registersItems.appendChild(actionType);
        } else {
            actionType.textContent = 'Egreso';
            actionType.style.color = '#F12972';
            actionType.style.fontWeight = 'bold';
            registersItems.appendChild(actionType);
        }
        registersItems.appendChild(options);
        options.appendChild(icon);

        /// Editar el monto de un movimiento registrado
        options.addEventListener('click', modalEdit);
    });
}


/// Función que imprime la vista Default donde no hay registros
function printDefaulRegister() {
    const btnExport = document.querySelector('.button-export');
    const mainTitle = document.querySelector('.main__registers--title');


    containerMenu.style.display = 'none';
    btnExport.style.display = 'none';
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


/// Función que redirecciona a la página de Login cuando el token esté vencido
function login() {
    location.reload();        
    window.location.href = 'index.html';
}


/// Función que imprime el balance total del usuario
function printBalance(data) {
    const incomes = document.querySelector('.incomes-value');
    const expenses = document.querySelector('.expenses-value');
    const balance = document.querySelector('.text-balance');
    let totalIncomes = 0;
    let totalExpenses = 0;

    data.forEach(element => {
        if (element.action_id === 1) {
            let price = element.price
            totalIncomes += price;
        } else {
            let price = element.price;
            totalExpenses += price;
        }
        incomes.textContent = `$ ${totalIncomes}`;
        expenses.textContent = `$ ${totalExpenses}`;
    });
    const totalBalance = totalIncomes - totalExpenses;
    balance.textContent = `$ ${totalBalance}`;
}


/// Función que muestra al presionar en opciones del registro un botón para editar el mismo
function modalEdit(ev) {
    ev.preventDefault();
    // console.log(ev.target);
    const container = ev.target.parentElement.parentElement;
    const iconOptions = ev.target;
    const modal = document.createElement('div');
    const listContainer = document.createElement('ul');
    const listModal = document.createElement('li');

    if (container.classList.contains('register-edit')) {
        iconOptions.classList.remove('fa-times');
        container.removeChild(ev.target.parentElement.parentElement.children[5]);
        container.classList.remove('register-edit');
    } else {
        container.classList.toggle('register-edit');

        modal.classList.add('register-modal');
        listContainer.classList.add('register-modal__menu');
        listModal.classList.add('register-modal__menu--list');
        listModal.textContent = 'Editar';
        iconOptions.classList.add('fa-times');


        container.appendChild(modal);
        modal.appendChild(listContainer);
        listContainer.appendChild(listModal);

        listModal.addEventListener('click', updateAmount);
    }
    
}


/// Función que muestra un modal para actualizar el valor del registro y una vez realiado en 2segundos lo manda al home
function updateAmount(ev) {
    const itemId = ev.target.parentElement.parentElement.parentElement.children[4];
    // console.log(itemId.getAttribute('data-id'));

    const main = document.querySelector('.main');
    const sectionModal = document.createElement('section');
    const containerModal = document.createElement('div')
    const modalIcon = document.createElement('i');
    const modalTitle = document.createElement('h3');
    const modalTable = document.createElement('div');
    const modaltext = document.createElement('p');
    const inputTable = document.createElement('input');
    const modalButton = document.createElement('input');

    if (ev.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[2]) {
        const containerModal = document.querySelector('.main');
        // console.log(containerModal.children[2]);
        containerModal.removeChild(containerModal.children[2]);
    }  

    sectionModal.classList.add('main__modal');
    containerModal.classList.add('main__modal--container');
    modalIcon.classList.add('fas');
    modalIcon.classList.add('fa-times');
    modalTitle.textContent = 'Actualiza el monto de tu registro';
    modalTitle.classList.add('text-modal');
    modalTable.classList.add('data-modal');
    modaltext.classList.add('data-modal__text');
    modaltext.textContent = 'Monto';
    inputTable.classList.add('data-modal__info');
    inputTable.setAttribute('type', 'number');
    inputTable.setAttribute('placeholder', 'Valor del nuevo monto');
    modalButton.setAttribute('type', 'button');
    modalButton.setAttribute('value', 'Actualizar');
    modalButton.classList.add('button-modal');
    sectionModal.style.display = 'block';

    main.appendChild(sectionModal);
    sectionModal.appendChild(containerModal);
    containerModal.appendChild(modalIcon);
    containerModal.appendChild(modalTitle);
    containerModal.appendChild(modalTitle);
    containerModal.appendChild(modalTable);
    modalTable.appendChild(modaltext);
    modalTable.appendChild(inputTable);
    containerModal.appendChild(modalButton);   


    modalIcon.addEventListener('click', closeWindowModal);
    modalButton.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const priceUpgrade = document.querySelector('.data-modal__info');
        if (!priceUpgrade.value) {
            priceUpgrade.value = 0;
        }
        const id = itemId.getAttribute('data-id');
        const token = await obtenerTokenLocalStorage();
        await axios({
            method: 'put',
            headers: { Authorization: `Bearer ${token.token}` },       
            params: { price: `${priceUpgrade.value}` } , 
            url: `http://localhost:3000/budget/v1/accounting/${id}`,        
            responseType: 'json'
        }).then((success) => {
            if (success.statusText) {
                // console.log(success.data);
                modalIcon.style.display = 'none';
                // upgradeSuccess();
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                console.log('ERRORRRRR')
            }
        }).catch((err) => {
            console.log(err);
        });
    });


}


/// Función que cierra la vista modal
function closeWindowModal(ev) {    
    const sectionModal = document.querySelector('.main__modal');
    sectionModal.style.display = 'none';
}


/// Función para agregar un ingreso o egreso en versión Mobile
function optionsRegisterMobile() {

    const buttonPrincipal = document.querySelector('.item-two')
    const optionsContainer = document.createElement('div');
    const incomesContainer = document.createElement('div');
    const incomesButton = document.createElement('i')
    const expensesContainer = document.createElement('div');
    const expensesButton = document.createElement('i')


    if (header.children[1]) {
        header.removeChild(header.children[1]);
        containerButton.children[0].classList.remove('fa-times');
    } else {
        containerButton.children[0].classList.add('fa-times');
        buttonPrincipal.classList.add('item-modal');
        optionsContainer.classList.add('header__menu--options');
        optionsContainer.style.display = 'block';
        incomesContainer.classList.add('options-incomes');
        expensesContainer.classList.add('options-expenses');
        expensesButton.classList.add('fas');
        expensesButton.classList.add('fa-arrow-circle-down');
        incomesButton.classList.add('fas');
        incomesButton.classList.add('fa-arrow-circle-up');


        header.appendChild(optionsContainer);
        optionsContainer.appendChild(incomesContainer);
        optionsContainer.appendChild(expensesContainer);
        incomesContainer.appendChild(incomesButton);
        expensesContainer.appendChild(expensesButton);
    }

    incomesContainer.addEventListener('click', registerNewIncome);
    expensesContainer.addEventListener('click', registerNewExpense);

}


/// Función que redirecciona a la página de Ingresos Mobile
function registerNewIncome() {
    window.location.href = 'incomes.html';
}


/// Función que redirecciona a la página de Egresos
function registerNewExpense() {
    window.location.href = 'expenses.html';
}


/// Función que redirecciona a la página de Ingresos Desktop
function optionsRegisterIncome() {
    window.location.href = 'incomes.html';
}


/// Función que redirecciona a la página de Egresos Desktop
function optionsRegisterExpense() {
    window.location.href = 'expenses.html';
}