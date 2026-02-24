# ✅ Gerenciador de Tarefas

Aplicação de gerenciamento de tarefas desenvolvida com **React** e **Vite**, construída como projeto prático de estudo baseado na [playlist de React](https://www.youtube.com/watch?v=2RWsLmu8yVc&list=PL6YyfjqNRrpfucLuZemff08oDFbDHWqI-&index=58).

---

## 📋 Sobre o Projeto

O Gerenciador de Tarefas permite ao usuário adicionar, visualizar, concluir e remover tarefas de forma simples e intuitiva. O projeto foi desenvolvido com foco no aprendizado dos conceitos fundamentais do React moderno.

---

## 🚀 Tecnologias Utilizadas

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- JavaScript (ES6+)
- CSS

---

## ⚛️ Conceitos do React Estudados

### 🔹 Componentes
A interface é dividida em componentes reutilizáveis, como o formulário de adição de tarefas e a lista de tarefas, seguindo a filosofia de componentização do React.

### 🔹 Props
Os componentes se comunicam através de **props**, passando dados e funções entre componente pai e filho — por exemplo, a função de remoção de tarefa é passada como prop do componente pai para o item da lista.

### 🔹 useState
O hook `useState` é utilizado para gerenciar o estado local da aplicação, como a lista de tarefas e o valor do campo de input.

```jsx
const [tarefas, setTarefas] = useState([]);
const [tarefa, setTarefa] = useState('');
```

### 🔹 Eventos
Manipulação de eventos do DOM como `onChange`, `onSubmit` e `onClick` para capturar a digitação do usuário, envio do formulário e interação com as tarefas.

### 🔹 Renderização de Listas
Uso do método `.map()` para renderizar dinamicamente a lista de tarefas, com uso da prop `key` para identificação única de cada elemento.

```jsx
{tarefas.map((item) => (
  <li key={item.id}>{item.texto}</li>
))}
```

### 🔹 Renderização Condicional
Exibição de mensagens ou elementos condicionalmente com base no estado — por exemplo, exibir uma mensagem quando não há tarefas cadastradas.

---

## ⚙️ Como Executar

```bash
# Clone o repositório
git clone https://github.com/RaquelNeres/Vite-projects.git

# Acesse a pasta do projeto
cd Vite-projects/gerenciador-tarefas

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: `http://localhost:5173`

---

## 📁 Estrutura do Projeto

```
gerenciador-tarefas/
├── public/
├── src/
│   ├── components/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
└── package.json
```

---

## 🎓 Referência de Estudo

Projeto desenvolvido com base no vídeo:
[▶️ Curso de React - Aula 58](https://www.youtube.com/watch?v=2RWsLmu8yVc&list=PL6YyfjqNRrpfucLuZemff08oDFbDHWqI-&index=58)

