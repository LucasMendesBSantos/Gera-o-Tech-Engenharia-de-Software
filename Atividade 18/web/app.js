const API_URL = 'http://localhost:3001/produtos';

const lista = document.getElementById('lista-produtos');
const mensagem = document.getElementById('mensagem');

async function buscarProdutos() {
  const resposta = await fetch(API_URL);

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ${resposta.status}`);
  }

  return resposta.json();
}

function criarItem(produto) {
  const item = document.createElement('li');
  item.className = 'produto';

  const nome = document.createElement('span');
  nome.className = 'produto-nome';
  nome.textContent = `${produto.nome}:`;

  const preco = document.createElement('span');
  preco.className = 'produto-preco';
  preco.textContent = produto.preco_formatado;

  item.append(nome, ' ', preco);
  return item;
}

function mostrarMensagem(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = false;
}

async function carregarProdutos() {
  try {
    const produtos = await buscarProdutos();
    lista.replaceChildren(...produtos.map(criarItem));
  } catch (erro) {
    console.error('Falha ao carregar produtos:', erro);
    mostrarMensagem('Não foi possível carregar os produtos. Tente novamente mais tarde.');
  }
}

carregarProdutos();
