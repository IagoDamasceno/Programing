document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(message => {
        if (message === 'Login bem-sucedido') {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('form-container').style.display = 'block';
        } else {
            alert(message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});

document.getElementById('report-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('/submit', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(message => {
        alert(message);
        this.reset(); // Redefinir o formulário
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});

document.getElementById('logout-button').addEventListener('click', function () {
    fetch('/logout', {
        method: 'POST'
    })
    .then(() => {
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    })
    .catch(error => {
        console.error('Erro ao fazer logout:', error);
    });
});

