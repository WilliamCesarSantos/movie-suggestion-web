
# Plano de Testes E2E

## Objetivo

Validar, em navegador, todas as features atuais do sistema de sugestao de filmes.
Este plano deve ser usado como fonte de verdade pelo agente de QA para execucao
de regressao apos alteracoes relevantes.

## Mapeamento de Cenarios para QA

- Login clean e autenticacao inicial: Funcionalidade Autenticacao e sessao.
- Home com recomendacoes e scroll infinito: Funcionalidade Home de recomendacoes com scroll infinito.
- Permissoes de menu e gestao de usuarios: Funcionalidade Navegacao e protecao de menu por role, Cadastro de usuarios e Listagem e edicao de usuarios.
- Fluxo de importacao de filmes: Funcionalidade Importacao de filmes.
- Fluxo detalhe -> assistir -> avaliar: Funcionalidade Detalhe do filme e fluxo assistir para avaliar.
- Quedas de permissao e bloqueio amigavel: Funcionalidade Resiliencia de acesso negado.

## Convencoes

- Sempre gerar emails unicos para usuarios criados durante os testes.
- Sempre preservar os dados minimos exigidos ao editar roles de um usuario.
- Sempre que o cenario exigir importacao, a palavra-chave do filme deve ser definida
  pelo executor de forma que seja facil localizar o resultado depois.
- Sempre que o cenario criar dados, registrar os valores usados para facilitar
  rastreabilidade e depuracao.

## Massa Base

- Usuario administrador:
  - Email: `william_cesar_santos@hotmail.com`
  - Senha: `123456`

---

Funcionalidade: Autenticacao e sessao
  Como usuario do sistema
  Quero autenticar, encerrar sessao e recuperar meu contexto de acesso
  Para navegar apenas nas telas permitidas pelas minhas roles

  Contexto:
    Dado que o frontend esta disponivel no navegador
    E que a API esta disponivel e funcional

  Cenario: Login com sucesso para usuario com permissao de filmes
    Dado que existe um usuario com a role `movies:read`
    Quando eu acessar a tela de login
    E informar email e senha validos
    Entao o login deve ser concluido com sucesso
    E eu devo ser redirecionado para a home
    E a lista de recomendacoes deve ser exibida

  Cenario: Logout apos sessao autenticada
    Dado que estou autenticado com o usuario administrador
    Quando eu acionar o logout
    Entao minha sessao deve ser encerrada
    E eu devo ser redirecionado para a tela de login
    E nao devo conseguir acessar uma rota protegida sem autenticar novamente

  Cenario: Login com usuario sem permissoes de filmes
    Dado que existe um usuario autenticavel sem as roles `movies:read`, `movies-watch:write` e `movies:write`
    Quando eu realizar login com esse usuario
    Entao eu devo ser redirecionado para a home
    E devo visualizar o fallback amigavel de acesso negado
    E a aplicacao nao deve apresentar erro de tela quebrada

---

Funcionalidade: Home de recomendacoes com scroll infinito
  Como usuario com acesso a filmes
  Quero navegar pela home de recomendacoes
  Para consultar filmes de forma continua

  Contexto:
    Dado que estou autenticado com um usuario que possui uma role entre `movies:read`, `movies-watch:write`, `movies:write` ou `*`

  Cenario: Carregamento inicial da home
    Quando eu acessar a home
    Entao devo visualizar a listagem inicial de filmes recomendados
    E cada item listado deve representar um filme valido

  Cenario: Carregamento de novas paginas ao usar scroll infinito
    Dado que a home possui mais de uma pagina de resultados
    Quando eu rolar a listagem ate o fim dos itens carregados
    Entao a proxima pagina de filmes deve ser carregada
    E os novos itens devem ser adicionados a lista atual
    E a aplicacao nao deve entrar em loop de carregamento duplicado

---

Funcionalidade: Navegacao e protecao de menu por role
  Como usuario autenticado
  Quero visualizar apenas os menus permitidos pelas minhas roles
  Para navegar sem acessar funcionalidades proibidas

  Cenario: Usuario com `users:read` visualiza apenas a listagem de usuarios
    Dado que estou autenticado com um usuario que possui as roles `movies:read`, `movies-watch:write` e `users:read`
    Quando eu abrir o menu de usuario
    Entao a opcao de listagem de usuarios deve estar visivel
    E a opcao de cadastro de usuario nao deve estar visivel

  Cenario: Usuario com `users:write` visualiza cadastro e edicao de usuarios
    Dado que estou autenticado com um usuario que possui as roles `movies:read`, `movies-watch:write`, `users:read` e `users:write`
    Quando eu abrir o menu de usuario
    Entao a opcao de listagem de usuarios deve estar visivel
    E a opcao de cadastro de usuario deve estar visivel

  Cenario: Usuario com role coringa possui acesso total
    Dado que estou autenticado com um usuario que possui a role `*`
    Quando eu abrir o menu do sistema
    Entao eu devo visualizar as opcoes de filmes e usuarios permitidas ao administrador
    E devo conseguir acessar as rotas protegidas de importacao, listagem e administracao

---

Funcionalidade: Cadastro de usuarios
  Como administrador ou operador com permissao de escrita
  Quero cadastrar usuarios com roles especificas
  Para controlar o acesso as funcionalidades do sistema

  Contexto:
    Dado que estou autenticado com o usuario administrador
    E que estou na tela de cadastro de usuario

  Cenario: Cadastrar usuario com acesso basico a filmes
    Quando eu criar um usuario com nome, email e senha validos
    E atribuir as roles `movies:read` e `movies-watch:write`
    Entao o usuario deve ser cadastrado com sucesso
    E eu realizar logout
    E realizar login com o novo usuario
    Entao devo visualizar a lista de filmes na home

  Cenario: Cadastrar usuario com acesso de leitura de usuarios
    Quando eu criar um usuario com nome, email e senha validos
    E atribuir as roles `movies:read`, `movies-watch:write` e `users:read`
    Entao o usuario deve ser cadastrado com sucesso
    E eu realizar logout
    E realizar login com o novo usuario
    E abrir o menu de usuario
    Entao devo conseguir acessar a listagem de usuarios
    E devo visualizar o usuario autenticado na lista

  Cenario: Cadastrar usuario com acesso de escrita em usuarios
    Quando eu criar um usuario com nome, email e senha validos
    E atribuir as roles `movies:read`, `movies-watch:write`, `users:read` e `users:write`
    Entao o usuario deve ser cadastrado com sucesso
    E eu realizar logout
    E realizar login com o novo usuario
    E acessar a listagem de usuarios
    Entao devo visualizar a acao de editar para os usuarios listados

  Cenario: Cadastrar usuario com acesso de importacao de filmes
    Quando eu criar um usuario com nome, email e senha validos
    E atribuir as roles `movies:read`, `movies-watch:write` e `movies:write`
    Entao o usuario deve ser cadastrado com sucesso
    E eu realizar logout
    E realizar login com o novo usuario
    Entao a opcao de importacao de filmes deve estar visivel no menu

---

Funcionalidade: Listagem e edicao de usuarios
  Como usuario com permissao administrativa
  Quero listar e editar usuarios
  Para manter as roles coerentes com as necessidades de acesso

  Cenario: Usuario com `users:read` nao pode editar
    Dado que estou autenticado com um usuario que possui as roles `movies:read`, `movies-watch:write` e `users:read`
    Quando eu acessar a listagem de usuarios
    Entao a lista deve ser exibida com sucesso
    E a acao de editar nao deve estar disponivel

  Cenario: Usuario com `users:write` pode editar roles
    Dado que estou autenticado com um usuario que possui as roles `movies:read`, `movies-watch:write`, `users:read` e `users:write`
    E que existe pelo menos um usuario editavel na listagem
    Quando eu acessar a listagem de usuarios
    E abrir a edicao de um usuario
    E incluir ou remover roles adicionais
    Mas manter as roles `movies:read`, `movies-watch:write`, `users:read` e `users:write`
    Entao a alteracao deve ser salva com sucesso
    E o usuario editado deve permanecer com as roles obrigatorias informadas

---

Funcionalidade: Importacao de filmes
  Como usuario com permissao de escrita em filmes
  Quero importar filmes por nome
  Para ampliar a base de recomendacoes disponivel

  Cenario: Importar filmes com sucesso
    Dado que estou autenticado com um usuario que possui as roles `movies:read`, `movies-watch:write` e `movies:write`
    E que defini uma palavra-chave exclusiva para a importacao
    Quando eu acessar a tela de importacao de filmes
    E informar um ou mais nomes de filmes relacionados a palavra-chave
    E disparar a acao de importacao
    Entao a importacao deve ser concluida com feedback visual de sucesso

  Cenario: Validar resultado da importacao na listagem com scroll infinito
    Dado que conclui uma importacao com uma palavra-chave exclusiva
    Quando eu voltar para a home de filmes
    E percorrer a listagem utilizando scroll infinito
    Entao devo encontrar filmes que contenham a palavra-chave importada

  Cenario: Ignorar duplicidades e linhas em branco na importacao
    Dado que estou autenticado com um usuario que possui a role `movies:write`
    Quando eu informar nomes duplicados e linhas em branco na importacao
    E disparar a acao de importacao
    Entao a operacao nao deve falhar por causa das duplicidades simples
    E o sistema deve apresentar um resultado consistente ao usuario

---

Funcionalidade: Detalhe do filme e fluxo assistir para avaliar
  Como usuario com acesso aos filmes
  Quero abrir o detalhe de um filme e registrar minha avaliacao
  Para classificar a experiencia apos assistir

  Contexto:
    Dado que estou autenticado com um usuario que possui uma role entre `movies:read`, `movies-watch:write`, `movies:write` ou `*`
    E que existe pelo menos um filme visivel na home

  Cenario: Abrir detalhe do filme a partir da home
    Quando eu selecionar um filme da home
    Entao devo ser redirecionado para a tela de detalhe do filme
    E devo visualizar as informacoes do filme selecionado

  Cenario: Avaliar um filme com nota abaixo de 7
    Dado que estou autenticado com um usuario que possui as roles `movies:read` e `movies-watch:write`
    E que estou no detalhe de um filme
    Quando eu acionar a funcionalidade de assistir
    Entao devo ser direcionado para o fluxo de avaliacao
    E eu informar uma nota inteira menor que 7
    E confirmar o envio
    Entao a avaliacao deve ser registrada com sucesso
    E a classificacao exibida deve indicar avaliacao ruim

  Cenario: Usuario sem `movies-watch:write` nao pode assistir para avaliar
    Dado que estou autenticado com um usuario que possui apenas a role `movies:read`
    E que estou no detalhe de um filme
    Quando eu visualizar as acoes disponiveis
    Entao a acao de assistir para avaliar nao deve estar visivel

---

Funcionalidade: Resiliencia de acesso negado
  Como usuario autenticado sem todas as permissoes
  Quero receber feedback amigavel quando eu nao puder acessar um recurso
  Para continuar navegando sem erros de interface

  Cenario: Acesso direto a rota protegida sem role suficiente
    Dado que estou autenticado com um usuario sem permissao para administracao de usuarios
    Quando eu tentar acessar diretamente a rota de cadastro de usuario
    Entao devo visualizar um fallback amigavel de acesso negado ou ser impedido de concluir o acesso
    E a aplicacao deve permanecer funcional

  Cenario: Acesso negado na home nao quebra a navegacao
    Dado que estou autenticado com um usuario sem roles de filmes
    Quando eu acessar a home
    Entao devo visualizar um fallback amigavel de acesso negado
    E devo conseguir continuar utilizando as areas permitidas do sistema