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
            guardarLS(success.data.token);
            window.location.href = 'index.html';
        }
    }).catch((err) => {
        console.log(err);
    });
}


function guardarLS(user) {
    const token = {
        token: user
    };
    localStorage.setItem('token', JSON.stringify(token));
}