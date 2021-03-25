const homeMobile = document.querySelector('.two');
const homeDesktop = document.querySelector('.item');
const btnData = document.querySelector('.data');
const main = document.querySelector('.main');
const btnPass = document.querySelector('.password');




/**** EVENTOS ****/

///
document.addEventListener('DOMContentLoaded', () => {
    const windowsMatch = window.matchMedia("(min-width: 1000px)");
    if (windowsMatch.matches) {
        homeDesktop.style.display = 'block';
    }
    
});
///
homeMobile.addEventListener('click', () => {
    window.location.href = 'index.html';
});
///
homeDesktop.addEventListener('click', () => {
    window.location.href = 'index.html';
});
///
btnData.addEventListener('click', updateData);
btnPass.addEventListener('click', updateData);



/**** FUNCIONES ****/

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


/// Funcion para guardar en localStorage
function guardarLS(user) {
    const token = {
        token: user
    };
    localStorage.setItem('token', JSON.stringify(token));
}


/// Función que redirecciona a la página de Login cuando el token esté vencido
function login() {
    location.reload();        
    window.location.href = 'login.html';
}


///
function updateData(ev) {
    if (ev.target.classList.contains('password__update')) {
        console.log('BTN pass');
        const floorPass = ev.target.parentElement.parentElement.parentElement.parentElement.children[2];
        // const modalData = document.querySelector('.main__data');
        floorPass.style.display = 'block';

        const modalClose = floorPass.children[0].children[0];
        // const modalClose = document.querySelector('.icon');
        modalClose.addEventListener('click', (ev) => {
            floorPass.style.display = 'none';
        })

        const btnUpdate = floorPass.children[0].children[2].children[2];
        // const btnUpdate = document.querySelector('.upgradeData');
        btnUpdate.addEventListener('click', sendUpdateData);
    } else {
        const modalData = document.querySelector('.main__data');
        modalData.style.display = 'block';

        const modalClose = document.querySelector('.icon');
        modalClose.addEventListener('click', (ev) => {
            modalData.style.display = 'none';
        })

        const btnUpdate = document.querySelector('.upgradeData');
        btnUpdate.addEventListener('click', sendUpdateData);
    }

    
}


///
async function sendUpdateData(ev) {
    ev.preventDefault();
    const floorPass = ev.target.parentElement.parentElement.parentElement.parentElement.children[2];
    if (ev.target.classList.contains('upgradePass')) {
        const password = floorPass.children[0].children[2].children[0];
        const repeatPassword = floorPass.children[0].children[2].children[1];
        const btnUpgrade = floorPass.children[0].children[2].children[2];
        password.addEventListener('click', () => {
            btnUpgrade.textContent = 'Actualizar'
        })
        repeatPassword.addEventListener('click', () => {
            btnUpgrade.textContent = 'Actualizar'
        })
        if ((password.value && repeatPassword.value) == '') {
            btnUpgrade.textContent = 'Campo vacio D;'
            password.value = '';
            repeatPassword.value = '';            
        } else if (password.value === repeatPassword.value){
            const token = await obtenerTokenLocalStorage();
            if (token.token != 0) {
                await axios({
                    method: 'put',
                    headers: { Authorization: `Bearer ${token.token}` },       
                    params: { password: `${password.value}` } , 
                    url: `http://localhost:3000/budget/v1/users`,        
                    responseType: 'json'
                }).then((success) => {
                    if (success.statusText) {
                        console.log(success);
                        // setTimeout(() => {
                        //     location.reload();
                        // }, 2000);
                    } else {
                        console.log('ERRORRRRR')
                    }
                }).catch((err) => {            
                    guardarLS(0);
                    console.log(err);
                });
            } else {
                console.log('ENtRA');
                guardarLS(0);
                login();
            }
        } else {
            console.log('No coinciden');            
            btnUpgrade.textContent = 'Contraseñas no coinciden'
            password.value = '';
            repeatPassword.value = '';
        }
    } else {
        const nameUpdate = document.querySelector('.form__name');
        const lastnameUpdate = document.querySelector('.form__lastname');
        const token = await obtenerTokenLocalStorage();
        if (token.token != 0) {
            await axios({
                method: 'put',
                headers: { Authorization: `Bearer ${token.token}` },       
                params: { name: `${nameUpdate.value}`, lastname: `${lastnameUpdate.value}` } , 
                url: `http://localhost:3000/budget/v1/users`,        
                responseType: 'json'
            }).then((success) => {
                if (success.statusText) {
                    console.log(success);
                    // setTimeout(() => {
                    //     location.reload();
                    // }, 2000);
                } else {
                    console.log('ERRORRRRR')
                }
            }).catch((err) => {            
                guardarLS(0);
                console.log(err);
            });
        } else {
            console.log('ENtRA');
            guardarLS(0);
            login();
        }
    }
    
}