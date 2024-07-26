document.getElementById('tipoOcorrencia').addEventListener('change', function() {
    document.querySelectorAll('.subtipo').forEach(function(div) {
        div.style.display = 'none';
    });

    if (this.value === 'seguranca') {
        document.getElementById('subtipoSeguranca').style.display = 'block';
    } else if (this.value === 'meioAmbiente') {
        document.getElementById('subtipoMeioAmbiente').style.display = 'block';
    }
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        const loginError = document.getElementById('loginError');
        if (data.success) {
            loginError.textContent = '';
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('reportForm').style.display = 'block';
        } else {
            loginError.textContent = data.message || 'Usuário ou senha incorretos.';
        }
    });
}

document.getElementById('reportForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const data = {
        nome: document.getElementById('nome').value,
        chapa: document.getElementById('chapa').value,
        data: document.getElementById('data').value,
        ordem: document.getElementById('ordem').value,
        tipoOcorrencia: document.getElementById('tipoOcorrencia').value,
        subtipo: document.querySelector('input[name="subtipo"]:checked') ? document.querySelector('input[name="subtipo"]:checked').value : '',
        local: document.getElementById('local').value,
        descricao: document.getElementById('descricao').value,
        acao: document.getElementById('acao').value,
        recomendacao: document.getElementById('recomendacao').value,
        status: document.querySelector('input[name="status"]:checked').value
    };

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('submitMessage').textContent = data.message;
    });
});
