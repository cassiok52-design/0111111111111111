# DriverProfit - Lista de Tarefas

## Arquitetura e Configuração
- [x] Instalar dependências: expo-location, expo-sqlite, expo-task-manager
- [x] Configurar permissões de localização em background no app.config.ts
- [x] Configurar tema escuro inspirado no Uber (cores personalizadas)
- [x] Adicionar ícones personalizados ao icon-symbol.tsx

## Banco de Dados SQLite
- [x] Criar schema do banco de dados com tabelas: users, vehicles, goals, work_sessions, earnings_entries
- [x] Implementar funções de inicialização do banco de dados
- [x] Criar funções CRUD para veículos
- [x] Criar funções CRUD para metas
- [x] Criar funções CRUD para sessões de trabalho
- [x] Criar funções CRUD para entradas de ganhos

## Engine de Sessão e Geolocalização
- [x] Implementar serviço de rastreamento de localização em background
- [x] Criar lógica de cálculo de distância percorrida
- [x] Implementar cálculo de consumo de combustível
- [x] Implementar cálculo de custo de combustível
- [x] Implementar cálculo de reserva de manutenção
- [x] Implementar cálculo de lucro líquido
- [x] Implementar cálculo de eficiência financeira (R$/KM)

## Telas e Navegação
- [x] Configurar bottom tab navigation com 5 tabs
- [x] Criar tela Dashboard (index)
- [x] Criar tela Histórico de Turnos (placeholder)
- [x] Criar tela Gráficos e Análises (placeholder)
- [x] Criar tela Veículos (completa)
- [ ] Criar tela Metas
- [x] Criar tela Perfil/Configurações (placeholder)
- [ ] Criar tela FAQ/Ajuda

## Dashboard
- [x] Implementar header com saudação e data
- [x] Criar cards de resumo (KM, Bruto, Líquido, Eficiência)
- [x] Implementar barra de progresso da meta diária
- [x] Criar botão "Iniciar Turno"
- [x] Implementar status de turno ativo
- [x] Adicionar botão flutuante (FAB) para adicionar ganhos

## Modais
- [x] Criar modal "Iniciar Turno"
- [x] Criar modal "Adicionar Ganho"
- [x] Criar modal "Finalizar Turno"
- [x] Criar modal "Adicionar/Editar Veículo"
- [ ] Criar modal "Editar Meta Diária"

## Histórico de Turnos
- [x] Implementar lista de turnos com FlatList
- [x] Adicionar filtros por período (Hoje, Semana, Mês, Personalizado)
- [x] Criar tela de detalhes de turno individual
- [ ] Implementar botão de exportação

## Gráficos e Análises
- [ ] Instalar biblioteca de gráficos (react-native-chart-kit ou victory-native)
- [ ] Implementar gráfico de linha: Ganhos vs Meta
- [ ] Implementar gráfico de barras: Comparativo Mensal
- [ ] Criar cards de estatísticas do período

## Veículos
- [x] Implementar lista de veículos cadastrados
- [x] Adicionar funcionalidade de adicionar veículo
- [x] Adicionar funcionalidade de editar veículo
- [x] Adicionar funcionalidade de excluir veículo (com confirmação)
- [x] Implementar seleção de veículo ativo

## Metas
- [ ] Exibir meta diária atual
- [ ] Criar calendário mensal com indicadores de cumprimento
- [ ] Implementar estatísticas do mês
- [ ] Adicionar funcionalidade de editar meta

## Exportação de Relatórios
- [ ] Implementar geração de PDF com resumo de turnos
- [ ] Implementar geração de CSV com dados de turnos
- [ ] Adicionar compartilhamento de arquivos via sistema

## FAQ/Ajuda
- [ ] Criar conteúdo de perguntas frequentes
- [ ] Implementar lista expansível de FAQs
- [ ] Adicionar explicações sobre cálculos

## Branding
- [x] Gerar logo personalizado do aplicativo
- [x] Atualizar ícones do app (icon.png, splash-icon.png, etc.)
- [x] Atualizar app.config.ts com nome e logo

## Testes e Validação
- [x] Testar fluxo completo: iniciar turno → adicionar ganhos → finalizar turno
- [x] Testar cálculos financeiros com dados reais
- [x] Refinar contador de distância com validação de GPS
- [x] Implementar filtro de ruído GPS (acurácia > 50m rejeitada)
- [x] Implementar validação de velocidade (> 150 km/h rejeitada)
- [x] Criar 23 testes unitários para contador de distância (todos passando)
- [ ] Testar rastreamento de localização em background
- [ ] Testar persistência de dados no SQLite
- [ ] Testar exportação de relatórios
- [ ] Validar interface em diferentes tamanhos de tela
- [ ] Testar em iOS e Android

## Checkpoint Final
- [ ] Criar checkpoint do projeto completo

## BUG FIXES
- [ ] [BUG] Histórico de turnos não exibe dados - investigar por que getCompletedSessions retorna vazio
- [ ] [BUG] Filtros de período não funcionam
