const login = document.querySelector('#form');
login.addEventListener('submit', succesLogin);


async function succesLogin(e) {
    e.preventDefault();
    const username = document.querySelector('#name').value;
    const pass = document.querySelector('#pass').value;
    await axios({
        method: 'get',
        params: {email: username, pass: pass },
        url: `http://localhost:3000/budget/v1/users/login`,
        responseType: 'json'
    }).then((success) => {
        if (success.statusText) {
            guardarLocalStorage(success.data.token, success.data.userId);
            window.location.href = 'home.html';
        } else {
            
        }
    }).catch((err) => {
        console.log(err);
    });
}


function guardarLocalStorage(token, id) {
    const user = {
        token: token,
        userId: id
    };
    localStorage.setItem('token', JSON.stringify(user));
}