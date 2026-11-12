// Requer: banco populado (npm run db:init), backend em :3001 e página em :5500
describe('Lojinha', () => {
  const esperados = [
    { nome: 'Caderno', preco: 'R$ 19,90' },
    { nome: 'Caneta', preco: 'R$ 4,50' },
    { nome: 'Mochila', preco: 'R$ 89,90' },
  ];

  beforeEach(() => {
    cy.visit('/');
  });

  it('exibe o título da página', () => {
    cy.contains('h1', 'Lojinha');
  });

  it('lista os três produtos vindos do backend', () => {
    cy.get('#lista-produtos li').should('have.length', 3);
  });

  it('mostra o nome e o preço de cada produto', () => {
    cy.get('#lista-produtos li').each(($item, i) => {
      cy.wrap($item).should('have.text', `${esperados[i].nome}: ${esperados[i].preco}`);
    });
  });

  it('não mostra mensagem de erro', () => {
    cy.get('#mensagem').should('not.be.visible');
  });
});
