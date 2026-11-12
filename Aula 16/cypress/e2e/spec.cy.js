describe('testando os negocios', () => {

beforeEach(() => {
    cy.visit('/index.html')
  })


  it('o nome depois de enviado', () => {
    cy.get('[data-cy="nome"]').type('Lucas')
    cy.get('[data-cy="enviar"]').click()
    cy.get('[data-cy="resposta"]').should('be.visible').and('have.text', 'Olá, Lucas!')
  })
  it ('o nome sem enviar nada', () => {
    cy.get('[data-cy="enviar"]').click()
    cy.get('[data-cy="resposta"]').should('be.visible').and('have.text', 'digite um nome.')
  })
})
