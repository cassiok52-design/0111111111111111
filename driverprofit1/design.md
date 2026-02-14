# DriverProfit - Planejamento de Design de Interface

## Visão Geral

Aplicativo mobile para gestão financeira de motoristas de aplicativo, com design inspirado no Uber (modo escuro nativo, fundo #000000, textos #FFFFFF, acentos em Azul/Verde). Interface otimizada para uso com uma mão, com botões amplos e cards de alta legibilidade.

## Orientação e Usabilidade

- **Orientação**: Portrait (9:16) - uso exclusivo vertical
- **Uso com uma mão**: Botões e ações principais na parte inferior da tela
- **Design System**: Inspirado no Uber com modo escuro nativo
- **Plataformas**: iOS e Android (cross-platform com Expo/React Native)

## Paleta de Cores

### Modo Escuro (Padrão)
- **Background Principal**: `#000000` (preto puro)
- **Background Secundário/Cards**: `#1C1C1E` (cinza escuro)
- **Texto Principal**: `#FFFFFF` (branco)
- **Texto Secundário**: `#8E8E93` (cinza claro)
- **Acento Primário (Azul)**: `#0A84FF` (ações principais, links)
- **Acento Sucesso (Verde)**: `#30D158` (lucro, ganhos positivos)
- **Acento Alerta (Amarelo)**: `#FFD60A` (avisos, metas próximas)
- **Acento Erro (Vermelho)**: `#FF453A` (custos, alertas críticos)
- **Borda/Divisor**: `#38383A` (separadores sutis)

## Lista de Telas

### 1. Dashboard (Tela Principal)
**Conteúdo Principal**:
- Header com saudação e data atual
- Cards de resumo do dia:
  - KM Rodados Hoje
  - Faturamento Bruto
  - Lucro Líquido
  - Eficiência (R$/KM)
- Barra de progresso da Meta Diária (visual e percentual)
- Botão principal "Iniciar Turno" (quando não há turno ativo)
- Status do turno ativo (quando em andamento):
  - Tempo decorrido
  - KM percorridos no turno
  - Ganhos do turno
- Botão flutuante (FAB) "+" para inserção rápida de ganhos

**Funcionalidade**:
- Visualização rápida dos principais indicadores
- Acesso rápido para iniciar turno ou adicionar ganhos
- Navegação para outras telas via bottom tabs

### 2. Histórico de Turnos
**Conteúdo Principal**:
- Lista de turnos anteriores (ordenados por data, mais recente primeiro)
- Cada item de turno mostra:
  - Data e horário (início - fim)
  - Duração do turno
  - KM percorridos
  - Faturamento bruto
  - Lucro líquido
  - Eficiência (R$/KM)
- Filtros: Hoje, Semana, Mês, Período personalizado
- Botão para exportar relatórios

**Funcionalidade**:
- Visualizar histórico completo de turnos
- Tocar em um turno para ver detalhes completos
- Filtrar por período
- Exportar dados (PDF/CSV)

### 3. Gráficos e Análises
**Conteúdo Principal**:
- Seletor de período (Semana, Mês, Trimestre, Ano)
- Gráfico de linha: Ganhos Acumulados vs Meta Diária
- Gráfico de barras: Comparativo Mensal de Lucro
- Cards com estatísticas:
  - Média de lucro diário
  - Total de KM no período
  - Eficiência média (R$/KM)
  - Dias trabalhados vs meta

**Funcionalidade**:
- Visualização gráfica de desempenho
- Comparação com metas estabelecidas
- Identificação de tendências e padrões

### 4. Veículos
**Conteúdo Principal**:
- Lista de veículos cadastrados
- Cada veículo mostra:
  - Modelo/Nome
  - Tipo de combustível
  - Consumo médio (KM/L)
  - Percentual de reserva para manutenção
  - Indicador de veículo ativo
- Botão "+" para adicionar novo veículo
- Botão de edição em cada veículo

**Funcionalidade**:
- Cadastrar múltiplos veículos
- Editar informações de consumo e manutenção
- Selecionar veículo ativo para turnos
- Excluir veículos (com confirmação)

### 5. Metas
**Conteúdo Principal**:
- Meta diária atual (valor em destaque)
- Calendário mensal com indicadores:
  - Dias que atingiram a meta (verde)
  - Dias que não atingiram (vermelho)
  - Dias sem trabalho (cinza)
- Estatísticas do mês:
  - Dias trabalhados
  - Taxa de sucesso (% de dias que atingiram meta)
  - Média de ganhos diários
- Botão para editar meta diária

**Funcionalidade**:
- Definir/editar meta diária de ganhos
- Visualizar histórico de cumprimento de metas
- Acompanhar progresso mensal

### 6. Perfil/Configurações
**Conteúdo Principal**:
- Informações do usuário (nome, email)
- Configurações:
  - Notificações (lembrete de meta, fim de turno)
  - Unidades (KM/Milhas, R$/USD)
  - Tema (escuro fixo nesta versão)
- Links:
  - FAQ/Ajuda
  - Sobre o app
  - Política de privacidade
- Botão de logout (se houver autenticação)

**Funcionalidade**:
- Gerenciar preferências do usuário
- Acessar ajuda e informações
- Configurar notificações

### 7. Modal: Iniciar Turno
**Conteúdo Principal**:
- Seleção de veículo (se houver múltiplos)
- Campo: KM inicial (odômetro)
- Campo: Preço do combustível no turno (R$/L)
- Botões: Cancelar / Iniciar

**Funcionalidade**:
- Capturar informações iniciais do turno
- Validar campos obrigatórios
- Iniciar rastreamento de localização em background

### 8. Modal: Adicionar Ganho
**Conteúdo Principal**:
- Campo: Valor do ganho (R$)
- Timestamp automático
- Botões: Cancelar / Adicionar

**Funcionalidade**:
- Inserção rápida de ganhos durante o turno
- Atualização automática do faturamento bruto

### 9. Modal: Finalizar Turno
**Conteúdo Principal**:
- KM final (odômetro)
- Resumo do turno:
  - Duração
  - KM percorridos
  - Faturamento bruto
  - Custo de combustível (calculado)
  - Reserva de manutenção (calculada)
  - Lucro líquido (calculado)
- Botões: Cancelar / Finalizar

**Funcionalidade**:
- Capturar KM final
- Calcular automaticamente custos e lucro
- Salvar turno no histórico
- Parar rastreamento de localização

### 10. Tela: FAQ/Ajuda
**Conteúdo Principal**:
- Lista de perguntas frequentes:
  - Como funciona o cálculo de consumo?
  - O que é reserva de manutenção?
  - Como otimizar a bateria com rastreamento?
  - Como funciona a geolocalização em background?
  - Como exportar relatórios?
- Cada pergunta expande para mostrar resposta detalhada

**Funcionalidade**:
- Ajudar usuários a entender funcionalidades
- Explicar cálculos e conceitos
- Fornecer dicas de uso

## Fluxos de Usuário Principais

### Fluxo 1: Iniciar e Finalizar Turno
1. Usuário abre o app → Dashboard
2. Toca em "Iniciar Turno"
3. Modal abre → Seleciona veículo, insere KM inicial e preço do combustível
4. Toca "Iniciar" → Modal fecha, Dashboard mostra status do turno ativo
5. Durante o turno: Toca no FAB "+" para adicionar ganhos
6. Ao final: Toca em "Finalizar Turno" no Dashboard
7. Modal abre → Insere KM final, vê resumo calculado
8. Toca "Finalizar" → Turno salvo, Dashboard volta ao estado inicial

### Fluxo 2: Adicionar Ganho Durante Turno
1. Turno ativo → Dashboard mostra FAB "+"
2. Usuário toca no FAB
3. Modal abre → Insere valor do ganho
4. Toca "Adicionar" → Ganho registrado, faturamento atualizado no Dashboard

### Fluxo 3: Visualizar Histórico e Exportar
1. Usuário navega para "Histórico" (bottom tab)
2. Vê lista de turnos anteriores
3. Seleciona filtro de período (ex: "Este Mês")
4. Toca em "Exportar"
5. Escolhe formato (PDF ou CSV)
6. Arquivo gerado e compartilhado via sistema

### Fluxo 4: Cadastrar Veículo
1. Usuário navega para "Veículos" (bottom tab)
2. Toca no botão "+"
3. Modal/Tela abre → Preenche:
   - Modelo do veículo
   - Tipo de combustível
   - Consumo médio (KM/L)
   - Percentual de reserva para manutenção
4. Toca "Salvar" → Veículo adicionado à lista

### Fluxo 5: Definir Meta Diária
1. Usuário navega para "Metas" (bottom tab)
2. Toca em "Editar Meta"
3. Modal abre → Insere valor da meta diária (R$)
4. Toca "Salvar" → Meta atualizada, Dashboard reflete nova meta

## Componentes de Interface Chave

### Cards de Resumo
- Fundo: `#1C1C1E`
- Borda arredondada: 12px
- Padding: 16px
- Ícone + Título + Valor grande + Subtítulo

### Botão Primário
- Fundo: `#0A84FF` (azul)
- Texto: `#FFFFFF`
- Altura: 56px (fácil de tocar)
- Borda arredondada: 12px
- Estado pressionado: opacidade 0.8 + haptic feedback

### Botão Flutuante (FAB)
- Fundo: `#30D158` (verde)
- Ícone: "+" branco
- Tamanho: 64x64px
- Posição: Canto inferior direito, 24px de margem
- Sombra elevada
- Estado pressionado: scale 0.95 + haptic feedback

### Barra de Progresso
- Fundo: `#38383A`
- Preenchimento: Gradiente verde (`#30D158` → `#34C759`)
- Altura: 8px
- Borda arredondada: 4px
- Animação suave ao atualizar

### Lista de Itens
- Cada item: fundo `#1C1C1E`, separador `#38383A`
- Altura mínima: 72px
- Padding: 16px
- Estado pressionado: opacidade 0.7

### Gráficos
- Linha: `#0A84FF` (ganhos), `#FFD60A` (meta)
- Barras: `#30D158` (lucro positivo), `#FF453A` (lucro negativo)
- Grid: `#38383A` (sutil)
- Labels: `#8E8E93`

## Navegação

### Bottom Tab Bar
- Fundo: `#1C1C1E`
- Altura: 80px (incluindo safe area)
- Ícones: 28x28px
- Cor ativa: `#0A84FF`
- Cor inativa: `#8E8E93`

**Tabs**:
1. Dashboard (ícone: casa)
2. Histórico (ícone: relógio)
3. Gráficos (ícone: gráfico de barras)
4. Veículos (ícone: carro)
5. Perfil (ícone: pessoa)

## Considerações de Performance

- **Geolocalização em Background**: Usar `expo-location` com `startLocationUpdatesAsync` para rastreamento eficiente
- **Banco de Dados Local**: SQLite via `expo-sqlite` para persistência offline-first
- **Otimização de Bateria**: Configurar intervalo de atualização de localização para equilibrar precisão e consumo
- **Animações**: Usar `react-native-reanimated` para animações suaves e performáticas
- **Listas**: Usar `FlatList` com `windowSize` otimizado para histórico de turnos

## Acessibilidade

- Tamanhos de fonte escaláveis
- Contraste mínimo WCAG AA (4.5:1 para texto normal)
- Labels descritivos para leitores de tela
- Áreas de toque mínimas de 44x44px

## Notas de Implementação

- **Não usar autenticação de usuário** nesta versão (armazenamento local apenas)
- **Não usar backend/cloud** (tudo offline com SQLite e AsyncStorage)
- **Permissões necessárias**: Localização em background (iOS e Android)
- **Notificações locais**: Lembrete de meta diária, alerta de turno longo
- **Exportação**: Usar bibliotecas nativas para gerar PDF e CSV
