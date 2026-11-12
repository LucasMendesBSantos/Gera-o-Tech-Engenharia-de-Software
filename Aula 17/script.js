const formulario = document.querySelector("#formulário")
const nome = document.querySelector("#nome")
const email = document.querySelector("#email")
const res = document.querySelector("#res")

formulario.addEventListener("submit", (e) => {
    e.preventDefault()
    const nome_digitado = nome.value.trim()
    const email_digitado = email.value.trim()

    if (nome_digitado === "") {
        res.textContent = "Preencha seu nome!"
    } else if (email_digitado === "") {
        res.textContent = "Preencha seu email!"
    } else if (!email_digitado.includes("@")){
        res.textContent = "Email inválido!"
    } else {
        res.textContent = `Olá ${nome_digitado}, seu email é ${email_digitado} é valido!`
    }
})