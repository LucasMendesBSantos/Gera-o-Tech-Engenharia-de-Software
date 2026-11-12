const formulario = document.getElementById("formulario");
const campo = document.getElementById("campo");
const mensagem = document.getElementById("mensagem");

formulario.addEventListener("submit", (event) => {
  event.preventDefault();

  const valor = campo.value.trim();


  if (valor === "" || valor === null || !valor || valor.trim() === "" || isNaN(Number(valor))) {
    mensagem.textContent = "Digite apenas números, sua anta."; 
    campo.value = "";
    return;
  }

  const idade = Number(valor);


  if (idade < 0) {
    mensagem.textContent = "A idade não pode ser menor que 0, tech espermatozoide.";
    campo.value = "";
    return;
  }

  if (idade > 150) {
    mensagem.textContent = "A idade não pode ser maior que 150 anos, seu ancião.";
    campo.value = "";
    return;
  }

  if (!Number.isInteger(idade)) {
    mensagem.textContent = "A idade não pode ser número decimal.";
    campo.value = "";
    return;
  }

  if (idade >= 18) {
    mensagem.textContent = `Você meteu um: ${idade} anos, e é maior de idade.`;
  } else {
    mensagem.textContent = `Você meteu um: ${idade} anos, e é menor de idade.`;
  }
  campo.value = "";
});
