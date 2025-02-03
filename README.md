# Indicação de Pacientes - Clínica Médica

Este projeto é uma página de cadastro de indicações de pacientes para uma clínica médica. A página permite que os usuários cadastrem suas indicações e ganhem recompensas exclusivas.

## Estrutura do Projeto

O projeto é composto pelos seguintes arquivos:

- `index.html`: Contém a estrutura HTML da página.
- `styles.css`: Contém os estilos CSS para a página.
- `scripts.js`: Contém o código JavaScript para manipulação do formulário e exibição de mensagens.

## Funcionalidades

### Formulário de Cadastro

A página possui um formulário de cadastro onde os usuários podem inserir as seguintes informações:

- Nome Completo
- E-mail
- Telefone (Opcional)

### Validação do Formulário

O formulário valida se os campos "Nome Completo" e "E-mail" foram preenchidos antes de enviar os dados. Caso algum desses campos esteja vazio, uma mensagem de alerta será exibida solicitando o preenchimento dos campos obrigatórios.

### Envio de Dados

Os dados do formulário são enviados para o serviço Viral Loops, que gerencia as indicações e recompensas.

### Mensagem de Sucesso

Após o envio bem-sucedido dos dados, uma mensagem de sucesso é exibida ao usuário, informando que o cadastro foi realizado com sucesso e que ele será notificado em breve.

### Modal de Sucesso

Um modal é exibido para informar que o cadastro foi concluído com sucesso.

## Estrutura HTML

O arquivo `index.html` contém a estrutura básica da página, incluindo o formulário de cadastro e o modal de sucesso.

## Estilos CSS

O arquivo `styles.css` contém os estilos para a página, incluindo a navbar, o formulário e o modal. A página é responsiva e se adapta a diferentes tamanhos de tela.

## JavaScript

O arquivo `scripts.js` contém o código JavaScript responsável por:

- Capturar o evento de submissão do formulário.
- Validar os campos obrigatórios.
- Enviar os dados para o serviço Viral Loops.
- Exibir a mensagem de sucesso e o modal.

## Como Executar

1. Clone o repositório para o seu ambiente local.
2. Abra o arquivo `index.html` em um navegador web.

## Exemplo de Uso

1. Preencha o formulário com as informações do paciente.
2. Clique no botão "Cadastrar Indicação".
3. Se os campos obrigatórios estiverem preenchidos, uma mensagem de sucesso será exibida e o modal será mostrado.

## Tecnologias Utilizadas

- HTML
- CSS
- JavaScript

## Autor

Davi
