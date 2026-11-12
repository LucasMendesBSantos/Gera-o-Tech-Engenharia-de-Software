const form = document.querySelector('#Formulário');
const nome = document.querySelector('#name-input');
const resposta = document.querySelector('#resposta');


form.addEventListener('submit', (event) => {
    event.preventDefault()
    const nome_digitado = nome.value.trim()
    if (nome_digitado === '') {
        resposta.textContent = 'digite um nome.'
    } else {
        resposta.textContent = `Olá, ${nome_digitado}!`
    }
})
