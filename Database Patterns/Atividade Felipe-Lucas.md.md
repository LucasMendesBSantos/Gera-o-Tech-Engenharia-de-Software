# Relatório Técnico: Padrões de Persistência para um Sistema de Controle de Presença em Aulas

---

## Parte I — O Prompt

### 1. Prompt original

> "Quero fazer um exemplo baseado num sistema de ponto onde os alunos entram num site, fazem login e marcam presença da aula no dia e horário da aula. Estudei os seguintes database patterns: transaction script, active record, data mapper, repository, cqrs. Quero escolher duas opções de padrões e usá-las no projeto."

### 2. Prompt aprimorado

> **Papel:** Atue como um arquiteto de software sênior com experiência em sistemas transacionais de alta concorrência e em padrões de persistência descritos por Martin Fowler em *Patterns of Enterprise Application Architecture*.
>
> **Contexto:** Estou cursando uma disciplina de Engenharia de Software e preciso produzir um relatório técnico sobre a escolha de padrões de acesso a dados para um sistema real. Estudei cinco padrões: Transaction Script, Active Record, Data Mapper, Repository e CQRS.
>
> **O sistema:** Um Sistema de Controle de Presença em Aulas para uma universidade. Os alunos acessam uma plataforma web, fazem login e registram presença na aula que está acontecendo naquele dia e horário. Professores acompanham a presença em tempo real e a coordenação consulta relatórios consolidados.
>
> **Dados de dimensionamento:**
> - Cerca de 8.000 alunos, 400 professores e 600 turmas ativas por semestre.
> - Turmas com até 120 alunos.
> - Nos horários de início de aula (7h, 9h, 13h, 15h, 18h30), até 3.000 alunos tentam registrar presença dentro de uma janela de aproximadamente 2 minutos.
> - Relatórios de frequência são consultados com mais intensidade no fim de cada mês e no fim do semestre.
>
> **Regras de negócio obrigatórias:**
> 1. O aluno só pode registrar presença em aulas de turmas em que está matriculado.
> 2. A marcação só é aceita entre 10 minutos antes do início da aula e 15 minutos após o início; marcações entre 1 e 15 minutos após o início são registradas como "atraso".
> 3. Cada aluno pode ter apenas um registro de presença por aula, mesmo que envie a requisição várias vezes.
> 4. Aulas canceladas ou não iniciadas pelo professor não aceitam marcações.
> 5. O professor pode corrigir manualmente uma presença, e essa correção precisa ficar registrada em histórico (quem alterou, quando e por quê).
> 6. Alunos com frequência abaixo de 75% devem aparecer em destaque nos relatórios.
>
> **Requisitos não funcionais:**
> - Uma marcação de presença deve ser confirmada ao aluno em menos de 1 segundo, mesmo no pico.
> - Relatórios pesados não podem degradar o desempenho das marcações.
> - O sistema deve ser testável e permitir troca futura de tecnologia de banco de dados.
> - A stack de referência é Node.js com TypeScript e um banco relacional (PostgreSQL).
>
> **O que preciso que você faça:**
> 1. Descreva o problema de forma técnica, destacando os desafios de concorrência, consistência e desempenho.
> 2. Explique brevemente cada um dos cinco padrões estudados e avalie a adequação de cada um a este cenário.
> 3. Monte e compare pelo menos quatro combinações de dois padrões, usando critérios objetivos (por exemplo: desempenho no pico, isolamento das regras de negócio, testabilidade, complexidade de implementação, adequação para relatórios) e uma nota para cada critério.
> 4. Escolha a melhor combinação e justifique, explicando também por que as outras foram descartadas.
> 5. Descreva a arquitetura proposta, detalhando o fluxo completo de uma marcação de presença e o fluxo de geração de um relatório.
> 6. Apresente um modelo de dados conceitual, separando as estruturas de escrita das estruturas de leitura.
> 7. Explique como a arquitetura trata concorrência, duplicidade e consistência entre escrita e leitura.
> 8. Apresente trade-offs, riscos com estratégias de mitigação e uma proposta de implantação em fases.
> 9. Liste cenários de teste que validem as regras de negócio.
>
> **Restrições de formato:**
> - Não inclua nenhum trecho de código, pseudocódigo ou comandos. A resposta deve ser inteiramente textual.
> - Use títulos, tabelas e listas para organizar o conteúdo.
> - Escreva em português, em tom técnico e acadêmico.
> - Descreva diagramas e fluxos em forma de etapas numeradas, sem usar desenho em caracteres.

---

## Parte II — A Resolução

### 1. Descrição técnica do problema

O Sistema de Controle de Presença em Aulas tem um perfil de uso bastante particular: passa a maior parte do tempo com carga baixa e, de forma previsível, recebe picos intensos de escrita concentrados em poucos minutos. No horário de início das aulas, até 3.000 alunos tentam registrar presença em uma janela de cerca de 2 minutos, o que corresponde a algo em torno de 25 marcações por segundo em média, com picos momentâneos bem superiores, já que os alunos tendem a marcar presença nos mesmos segundos.

Ao mesmo tempo, o sistema precisa atender a uma demanda de leitura de natureza totalmente diferente. Professores querem acompanhar, em tempo real, quem já marcou presença na aula atual. A coordenação precisa de relatórios consolidados, como frequência por aluno ao longo do semestre, percentual de presença por turma e lista de alunos em risco de reprovação por falta. Essas consultas envolvem cruzamento de várias tabelas e agregações sobre um volume grande de registros.

Os principais desafios técnicos são:

| Desafio | Descrição | Consequência se não for tratado |
|---|---|---|
| Concorrência de escrita | Muitos alunos gravando registros ao mesmo tempo nas mesmas tabelas | Lentidão, bloqueios e tempo de resposta acima de 1 segundo |
| Duplicidade | Alunos clicando várias vezes ou reenviando a requisição por instabilidade de rede | Registros duplicados e frequência calculada de forma errada |
| Validação de regras | Matrícula, janela de horário, status da aula, classificação como "atraso" | Presenças inválidas aceitas ou presenças válidas rejeitadas |
| Disputa entre leitura e escrita | Relatórios pesados consumindo recursos do mesmo banco usado nas marcações | Marcações lentas justamente no fim do mês, quando os relatórios são mais acessados |
| Auditoria | Correções manuais feitas pelo professor | Perda de rastreabilidade e possibilidade de contestação sem evidência |
| Evolução tecnológica | Exigência de trocar o banco de dados no futuro | Reescrita das regras de negócio se estiverem acopladas à tecnologia |

### 2. Análise dos padrões estudados

#### 2.1 Transaction Script
Organiza a lógica de negócio como procedimentos, em que cada operação do sistema (por exemplo, "marcar presença") é um roteiro único que valida, consulta e grava diretamente no banco.

- **Pontos fortes:** simples de entender e rápido de implementar; ótimo para sistemas pequenos.
- **Pontos fracos:** as regras de negócio se espalham e se repetem entre roteiros; à medida que as validações crescem, a manutenção fica difícil.
- **Adequação ao cenário:** baixa a média. Atenderia uma primeira versão, mas a regra de correção manual, a classificação de atraso e as validações de matrícula tenderiam a ser duplicadas em vários roteiros.

#### 2.2 Active Record
Cada objeto do domínio representa uma linha do banco e sabe se salvar, carregar e excluir.

- **Pontos fortes:** muito produtivo, com pouca estrutura adicional; bastante popular em ORMs.
- **Pontos fracos:** mistura regra de negócio com acesso a dados; dificulta testes sem banco; acopla o domínio à estrutura das tabelas.
- **Adequação ao cenário:** média. Funciona bem para cadastros simples (alunos, turmas), mas conflita diretamente com o requisito de trocar a tecnologia de banco sem reescrever regras.

#### 2.3 Data Mapper
Uma camada separada transfere dados entre os objetos do domínio e o banco, mantendo ambos independentes.

- **Pontos fortes:** domínio totalmente livre de detalhes de persistência; permite modelos de domínio ricos.
- **Pontos fracos:** exige mais estrutura; o mapeamento pode ser trabalhoso em modelos complexos.
- **Adequação ao cenário:** alta, principalmente como mecanismo interno usado por repositórios.

#### 2.4 Repository
Oferece ao domínio uma interface parecida com uma coleção de objetos ("buscar aula por identificador", "verificar se o aluno já tem presença nesta aula", "adicionar presença"), escondendo como os dados são realmente armazenados.

- **Pontos fortes:** isola as regras de negócio da tecnologia; facilita testes com repositórios em memória; centraliza as consultas usadas pelo domínio.
- **Pontos fracos:** acrescenta uma camada de abstração; se mal projetado, vira apenas um repasse sem valor.
- **Adequação ao cenário:** alta. Atende diretamente aos requisitos de testabilidade e troca de banco.

#### 2.5 CQRS (Command Query Responsibility Segregation)
Separa o modelo usado para alterar dados (comandos) do modelo usado para consultar dados (consultas). Cada lado pode ter estruturas, otimizações e até bancos diferentes.

- **Pontos fortes:** permite otimizar escrita e leitura de forma independente; evita que relatórios pesados concorram com transações; os modelos de leitura podem ser montados exatamente no formato que a tela precisa.
- **Pontos fracos:** aumenta a complexidade; se a leitura usar estruturas separadas, surge a consistência eventual.
- **Adequação ao cenário:** muito alta. O sistema tem, de forma evidente, dois perfis de carga opostos.

### 3. Comparação das combinações

Foram avaliadas cinco combinações de dois padrões. As notas vão de 1 (ruim) a 5 (excelente).

| Critério | Transaction Script + Active Record | Transaction Script + Data Mapper | Active Record + Repository | Data Mapper + Repository | Repository + CQRS |
|---|---|---|---|---|---|
| Desempenho no pico de marcações                | 3 | 3 | 3 | 3 | 5 |
| Desempenho dos relatórios sem afetar a escrita | 2 | 2 | 2 | 2 | 5 |
| Isolamento das regras de negócio               | 1 | 2 | 3 | 5 | 5 |
| Testabilidade                                  | 2 | 3 | 3 | 5 | 5 |
| Facilidade de trocar o banco de dados          | 1 | 4 | 2 | 5 | 5 |
| Simplicidade de implementação                  | 5 | 4 | 4 | 3 | 2 |
| Auditoria e histórico de correções             | 2 | 3 | 3 | 4 | 5 |
| **Total**                                      | 16| 21| 20|27 |32 |

**Leitura da tabela:**

- **Transaction Script + Active Record** é a opção mais rápida de construir, mas concentra todos os problemas de acoplamento e não oferece nenhum mecanismo para separar leitura de escrita.
- **Transaction Script + Data Mapper** resolve o acoplamento com o banco, mas mantém as regras de negócio em roteiros procedurais, que tendem a se repetir.
- **Active Record + Repository** é uma combinação incoerente: o repositório tenta esconder a persistência, mas os objetos de domínio continuam sabendo se salvar sozinhos, o que anula boa parte do benefício.
- **Data Mapper + Repository** é a segunda melhor opção e seria excelente para um sistema com carga equilibrada. Sua limitação é não tratar o conflito entre relatórios e marcações.
- **Repository + CQRS** obtém a maior nota justamente nos critérios mais críticos deste sistema (pico de escrita e relatórios pesados), pagando o custo de uma implementação mais trabalhosa.

### 4. Escolha e justificativa

**Padrões escolhidos: Repository + CQRS**, com Node.js e TypeScript como stack de referência e PostgreSQL como banco relacional. Internamente, os repositórios do lado de escrita aplicam a ideia do Data Mapper para traduzir entre objetos de domínio e tabelas, mas o Data Mapper não é tratado como um padrão escolhido, e sim como um detalhe de implementação do Repository.

**Por que CQRS:** o sistema tem duas cargas com características opostas.

| Aspecto | Lado de comando (marcar presença) | Lado de consulta (relatórios e painéis) |
|---|---|---|
| Natureza da operação | Escrita curta e frequente | Leitura longa e agregada |
| Momento de maior carga | Início das aulas | Fim do mês e fim do semestre |
| Prioridade | Consistência total e validação rigorosa | Rapidez e formato pronto para exibição |
| Tolerância a atraso nos dados | Nenhuma | Alguns segundos são aceitáveis |
| Estrutura ideal dos dados | Normalizada, com restrições de integridade | Desnormalizada, com totais pré-calculados |

Tratar esses dois perfis com o mesmo modelo obriga a escolher qual deles será prejudicado. O CQRS elimina esse dilema.

**Por que Repository:** o lado de comando concentra as regras mais importantes do sistema (matrícula, janela de horário, duplicidade, status da aula). Com o Repository, essas regras dependem apenas de contratos como "repositório de aulas", "repositório de matrículas" e "repositório de presenças", e não do PostgreSQL. Isso permite testar todas as regras sem banco de dados real e atende ao requisito de trocar a tecnologia de armazenamento no futuro.

**Por que não usar Repository também no lado de consulta:** no lado de leitura não há regras de negócio a proteger, apenas dados a exibir. Por isso, a consulta usa serviços de leitura que acessam diretamente estruturas já preparadas para cada tela, sem passar pelos objetos de domínio. Isso reduz a complexidade e melhora o desempenho.

### 5. Arquitetura proposta

A aplicação é dividida em quatro camadas:

1. **Camada de interface (API web):** recebe as requisições dos alunos, professores e coordenação, autentica o usuário e encaminha para o lado correto (comando ou consulta).
2. **Camada de aplicação:** contém os manipuladores de comando (por exemplo, "registrar presença" e "corrigir presença") e os serviços de consulta (por exemplo, "frequência da turma" e "alunos em risco").
3. **Camada de domínio:** contém as entidades e regras de negócio (Aula, Matrícula, Presença) e os contratos dos repositórios. Não conhece banco de dados nem framework web.
4. **Camada de infraestrutura:** contém as implementações concretas dos repositórios para PostgreSQL, as estruturas de leitura e o mecanismo que atualiza essas estruturas a partir dos eventos de escrita.

#### 5.1 Fluxo de uma marcação de presença (lado de comando)

1. O aluno, já autenticado, toca no botão "Marcar presença" na tela da aula atual. A requisição leva o identificador da aula e um identificador único da tentativa, gerado pela tela.
2. A API confirma a identidade do aluno pelo token de sessão (o identificador do aluno nunca é aceito a partir do corpo da requisição, para evitar que um aluno marque presença por outro).
3. A API cria o comando "Registrar Presença" e o entrega ao manipulador correspondente.
4. O manipulador pede ao repositório de aulas os dados da aula e verifica se ela está iniciada e não cancelada.
5. O manipulador pede ao repositório de matrículas a confirmação de que o aluno está matriculado na turma daquela aula.
6. O domínio calcula a situação da marcação com base no horário do servidor (nunca no horário do dispositivo do aluno): antes da janela, recusada; até o horário de início, "presente"; até 15 minutos depois, "atraso"; após isso, recusada.
7. O manipulador pede ao repositório de presenças que grave o registro em uma transação curta. A gravação é protegida por uma restrição de unicidade no banco para o par aluno e aula.
8. Na mesma transação, é gravado um evento "Presença Registrada" em uma tabela de saída de eventos.
9. A transação é confirmada e o aluno recebe a resposta "Presença registrada às 7h03, situação: presente".
10. Se a restrição de unicidade for violada, significa que o aluno já tinha presença. Nesse caso, o sistema não exibe erro: devolve a mesma confirmação da marcação original, tornando a operação idempotente.

#### 5.2 Fluxo de atualização das estruturas de leitura

1. Um processo em segundo plano lê periodicamente (por exemplo, a cada segundo) os eventos ainda não processados da tabela de saída.
2. Para cada evento "Presença Registrada", ele atualiza as estruturas de leitura: incrementa o total de presentes da aula, atualiza a frequência acumulada do aluno na turma e recalcula se o aluno está abaixo de 75%.
3. Para cada evento "Presença Corrigida", ele desfaz o efeito anterior e aplica o novo.
4. Ao terminar, marca o evento como processado. Se algo falhar, o evento continua pendente e é reprocessado, por isso cada atualização é projetada para produzir o mesmo resultado mesmo se for aplicada duas vezes.

Esse mecanismo é conhecido como **padrão Outbox** e garante que nenhuma presença gravada deixe de chegar aos relatórios, mesmo em caso de queda do processo.

#### 5.3 Fluxo de geração de um relatório (lado de consulta)

1. O coordenador acessa a tela "Frequência por turma" e escolhe a turma e o período.
2. A API verifica se o usuário tem perfil de coordenação e encaminha a consulta ao serviço de leitura.
3. O serviço de leitura consulta a estrutura "Frequência por Aluno na Turma", que já contém, para cada aluno, o total de aulas, presenças, atrasos, faltas e o percentual calculado.
4. Os dados são devolvidos prontos para exibição, sem joins nem agregações em tempo de consulta.
5. A tela destaca os alunos abaixo de 75% e informa a data e hora da última atualização dos dados.

### 6. Modelo de dados conceitual

#### 6.1 Estruturas do lado de escrita (normalizadas)

| Entidade | Informações principais | Restrições importantes |
|---|---|---|
| Aluno | identificador, matrícula acadêmica, nome, e-mail institucional | matrícula acadêmica única |
| Professor | identificador, nome, e-mail institucional | e-mail único |
| Turma | identificador, disciplina, semestre, professor responsável | — |
| Matrícula | aluno, turma, data de matrícula, situação | um aluno só pode estar matriculado uma vez em cada turma |
| Aula | identificador, turma, data, horário de início, horário de término, situação (agendada, iniciada, encerrada, cancelada) | — |
| Presença | aluno, aula, horário do registro, situação (presente, atraso), origem (aluno ou correção do professor) | **apenas um registro por par aluno e aula** |
| Histórico de Correção | presença, situação anterior, nova situação, professor responsável, data e hora, justificativa | justificativa obrigatória |
| Saída de Eventos | tipo do evento, dados do evento, data de criação, indicador de processamento | — |

#### 6.2 Estruturas do lado de leitura (desnormalizadas)

| Estrutura de leitura | Para que serve | Conteúdo |
|---|---|---|
| Resumo da Aula | painel do professor em tempo real | aula, total de matriculados, total de presentes, total de atrasos, lista de nomes já registrados |
| Frequência por Aluno na Turma | relatório da coordenação e consulta do próprio aluno | aluno, turma, total de aulas realizadas, presenças, atrasos, faltas, percentual, indicador de risco |
| Frequência Consolidada da Turma | estatísticas por turma | turma, média de frequência, quantidade de alunos em risco, evolução mensal |
| Histórico do Aluno | tela "minhas presenças" | aluno, data da aula, disciplina, situação |

Na primeira fase do projeto, essas estruturas podem ser tabelas no mesmo PostgreSQL, mas em um esquema separado. Em uma fase posterior, podem ser movidas para uma réplica de leitura ou para outra tecnologia, sem impacto no lado de escrita.

### 7. Tratamento de concorrência, duplicidade e consistência

**Concorrência no pico:**
- As transações de escrita são curtas e envolvem apenas uma inserção na tabela de presenças e uma na tabela de saída de eventos.
- Não há atualização de contadores compartilhados no momento da marcação. Se o total de presentes da aula fosse atualizado na mesma transação, centenas de alunos disputariam a mesma linha e causariam fila de bloqueios. Esse cálculo é deslocado para o processo em segundo plano.
- Dados que mudam pouco e são lidos em toda marcação, como os dados da aula e a lista de matrículas da turma, podem ser mantidos em cache por alguns minutos, reduzindo leituras no banco durante o pico.

**Duplicidade:**
- A primeira barreira é a interface, que desabilita o botão após o clique.
- A segunda é o identificador único da tentativa, que permite reconhecer reenvios.
- A barreira definitiva é a restrição de unicidade no banco. Ela é a única que funciona mesmo quando duas requisições do mesmo aluno chegam no mesmo milissegundo em servidores diferentes, porque a verificação feita pela aplicação ("já existe presença?") sozinha não é segura sob concorrência.

**Consistência entre escrita e leitura:**
- O lado de escrita é sempre consistente: a presença existe ou não existe, sem estado intermediário.
- O lado de leitura é eventualmente consistente, com atraso esperado de 1 a 2 segundos.
- Para o aluno, isso não é percebido, pois a confirmação vem do lado de escrita.
- Para o professor, o painel em tempo real mostra o horário da última atualização.
- Para relatórios mensais, um atraso de segundos é irrelevante.

### 8. Trade-offs

| Aspecto | Vantagem | Custo |
|---|---|---|
| Separação entre comando e consulta | Relatórios não afetam as marcações e cada lado é otimizado de forma independente | Mais estruturas para criar e manter, com duas representações dos mesmos dados |
| Repository | Regras de negócio testáveis sem banco e independentes de tecnologia | Camada adicional de abstração e mais arquivos no projeto |
| Estruturas de leitura pré-calculadas | Relatórios instantâneos, mesmo com milhões de registros | Necessidade de um processo de sincronização confiável |
| Consistência eventual | Escrita rápida no pico | Dados de leitura podem estar alguns segundos atrasados |
| Padrão Outbox | Nenhum evento é perdido | Mais uma tabela e um processo em segundo plano para monitorar |
| Restrição de unicidade no banco | Garantia absoluta contra duplicidade | Necessidade de tratar a violação como resposta de sucesso, e não como erro |

### 9. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Processo de sincronização parar | Relatórios desatualizados | Monitoramento da quantidade de eventos pendentes, com alerta se passar de um limite |
| Estruturas de leitura ficarem inconsistentes por erro de lógica | Percentuais errados nos relatórios | Rotina noturna que recalcula as estruturas de leitura a partir dos dados de escrita e compara os resultados |
| Excesso de complexidade para a equipe | Atraso no desenvolvimento | Implantação em fases, começando pela versão mais simples |
| Aluno marcar presença sem estar em sala | Fraude de frequência | Extensão futura com código temporário exibido pelo professor em sala, válido por poucos minutos |
| Divergência de horário entre dispositivos | Classificação errada de atraso | Uso exclusivo do horário do servidor |
| Pico maior que o previsto | Respostas lentas | Testes de carga simulando 3.000 marcações em 2 minutos antes da implantação |

### 10. Implantação em fases

| Fase | Escopo | Objetivo |
|---|---|---|
| Fase 1 | Repository no lado de escrita; consultas de leitura feitas em visões materializadas do próprio PostgreSQL, atualizadas periodicamente | Entregar valor rapidamente com baixa complexidade, já separando o código de comando do código de consulta |
| Fase 2 | Introdução da tabela de saída de eventos e do processo de sincronização, com estruturas de leitura em esquema próprio | Painel do professor em tempo quase real e relatórios sem concorrência com a escrita |
| Fase 3 | Estruturas de leitura movidas para réplica ou banco dedicado; código temporário contra fraude | Escalabilidade e segurança para toda a universidade |

Essa abordagem mostra que o CQRS não exige, desde o início, bancos separados. A separação começa no código e evolui para a infraestrutura somente quando a carga justificar.

### 11. Cenários de teste das regras de negócio

| Nº | Cenário | Resultado esperado |
|---|---|---|
| 1 | Aluno matriculado marca presença 5 minutos antes do início | Presença registrada como "presente" |
| 2 | Aluno matriculado marca presença 8 minutos após o início | Presença registrada como "atraso" |
| 3 | Aluno marca presença 20 minutos após o início | Marcação recusada, fora da janela |
| 4 | Aluno marca presença 30 minutos antes do início | Marcação recusada, janela ainda não aberta |
| 5 | Aluno não matriculado tenta marcar presença | Marcação recusada por falta de matrícula |
| 6 | Aluno tenta marcar presença em aula cancelada | Marcação recusada, aula cancelada |
| 7 | Aluno envia a marcação duas vezes seguidas | Apenas um registro gravado e a mesma confirmação devolvida nas duas tentativas |
| 8 | Duas requisições idênticas chegam simultaneamente a servidores diferentes | Apenas um registro gravado, garantido pela restrição do banco |
| 9 | Professor corrige uma falta para presença com justificativa | Presença atualizada e histórico de correção gravado |
| 10 | Professor tenta corrigir sem justificativa | Correção recusada |
| 11 | Aluno atinge frequência de 74% | Aluno aparece em destaque no relatório após a sincronização |
| 12 | 3.000 marcações em 2 minutos (teste de carga) | Todas confirmadas em menos de 1 segundo e totais corretos nas estruturas de leitura |

Os cenários 1 a 7, 9 e 10 podem ser testados sem banco de dados real, substituindo os repositórios por versões em memória, o que demonstra na prática o benefício do padrão Repository.

### 12. Conclusão

O Sistema de Controle de Presença em Aulas é um caso típico de aplicação com dois perfis de carga opostos: escrita intensa, curta e previsível no início das aulas, e leitura analítica pesada em períodos de fechamento. A combinação **Repository + CQRS** foi escolhida porque responde diretamente a essas duas forças. O CQRS separa os fluxos para que um não prejudique o outro, enquanto o Repository protege as regras de negócio, tornando-as testáveis e independentes da tecnologia de armazenamento.

O custo dessa escolha é uma complexidade maior e a aceitação de consistência eventual no lado de leitura. Esse custo é controlado pela implantação em fases, pelo uso do padrão Outbox para garantir a sincronização e pela rotina de reconciliação noturna. Para um sistema de pequeno porte, a combinação Data Mapper + Repository seria suficiente; para o volume e os requisitos apresentados, a separação entre comando e consulta se mostra a decisão mais adequada.
