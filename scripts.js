document.getElementById('viral-loops-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Verificar se o nome e o e-mail são preenchidos
    if (!name || !email) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    // Enviar os dados para o Viral Loops
    window.vl.push(['add_lead', {
        'name': name,
        'email': email,
        'phone': phone,
        'source': 'landing-page', // Nome da fonte
    }]);

    // Exibir mensagem de sucesso ou erro
    alert('Cadastro realizado com sucesso! Você será notificado em breve.');
    document.getElementById('viral-loops-form').reset(); // Limpar o formulário após o envio
});
