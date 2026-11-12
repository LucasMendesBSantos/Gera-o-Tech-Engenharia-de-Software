#include <stdio.h>

typedef struct {
    void (*criar_botao)(void);
    void (*criar_janela)(void);
} Fabrica;

void botao_win(void)  { printf("Botao Windows\n"); }
void janela_win(void) { printf("Janela Windows\n"); }
void botao_mac(void)  { printf("Botao Mac\n"); }
void janela_mac(void) { printf("Janela Mac\n"); }

Fabrica windows = { botao_win, janela_win };
Fabrica mac     = { botao_mac, janela_mac };

/*============================================================================================*/

void imprimir_antigo(const char *texto, int vezes) {   /* API incompativel */
    for (int i = 0; i < vezes; i++) printf("%s\n", texto);
}

void imprimir(const char *texto) {                     /* adaptador */
    imprimir_antigo(texto, 1);
}

int main(void) {
    printf("-- Abstract Factory --\n");
    Fabrica f = mac;           
    f.criar_botao();
    f.criar_janela();

    printf("-- Adapter --\n");
    imprimir("Ola pelo adaptador!");
    return 0;
}