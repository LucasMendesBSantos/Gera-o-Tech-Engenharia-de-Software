describe('testando os negocios', () => {

beforeEach(() => {
    cy.visit('/index.html')
  })


  it('O cara é maior de idade', () => {
    cy.get('[data-cy="idade"]').type('25')
    cy.get('[data-cy="enviar"]').click()
    cy.get('[data-cy="resposta"]').should('be.visible').and('have.text', 'Você meteu um: 25 anos, e é maior de idade.')
  })
  it ('O cara é menor de idade', () => {
    cy.get('[data-cy="idade"]').type('15')
    cy.get('[data-cy="enviar"]').click()
    cy.get('[data-cy="resposta"]').should('be.visible').and('have.text', 'Você meteu um: 15 anos, e é menor de idade.')
  })

  it ('O cara é um ancião', () => {
    cy.get('[data-cy="idade"]').type('200')
    cy.get('[data-cy="enviar"]').click()
    cy.get('[data-cy="resposta"]').should('be.visible').and('have.text', 'A idade não pode ser maior que 150 anos, seu ancião.')
  })

  it ('O cara é um tech espermatozoide', () => {
    cy.get('[data-cy="idade"]').type('-5')
    cy.get('[data-cy="enviar"]').click()
    cy.get('[data-cy="resposta"]').should('be.visible').and('have.text', 'A idade não pode ser menor que 0, tech espermatozoide.')
  })

  it ('O cara é uma anta', () => {
    cy.get('[data-cy="idade"]').type('abc')
    cy.get('[data-cy="enviar"]').click()
    cy.get('[data-cy="resposta"]').should('be.visible').and('have.text', 'Digite apenas números, sua anta.')
  })
  
  it ('O cara meteu um decimal mano.... animal!!', () => {
    cy.get('[data-cy="idade"]').type('25.5')
    cy.get('[data-cy="enviar"]').click()
    cy.get('[data-cy="resposta"]').should('be.visible').and('have.text', 'A idade não pode ser número decimal.')
  })




})
