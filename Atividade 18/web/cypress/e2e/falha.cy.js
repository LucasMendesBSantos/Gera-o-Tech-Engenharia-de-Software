// Simula o backend fora do ar: não depende do banco nem da API
describe('Lojinha com backend indisponível', () => {
  it('avisa que não foi possível carregar os produtos (erro de rede)', () => {
    cy.intercept('GET', 'http://localhost:3001/produtos', { forceNetworkError: true });
    cy.visit('/');
    cy.get('#mensagem')
      .should('be.visible')
      .and('have.text', 'Não foi possível carregar os produtos. Tente novamente mais tarde.');
    cy.get('#lista-produtos li').should('have.length', 0);
  });

  it('avisa a falha quando a API responde com erro HTTP', () => {
    cy.intercept('GET', 'http://localhost:3001/produtos', { statusCode: 500, body: { erro: 'x' } });
    cy.visit('/');
    cy.get('#mensagem').should('be.visible');
    cy.get('#lista-produtos li').should('have.length', 0);
  });
});
