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

document.getElementById('report-form').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {};
    
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(message => {
        alert(message);
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});
