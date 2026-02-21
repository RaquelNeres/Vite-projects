import { useState, useEffect } from 'react'; 
import './App.css'
import AddTask from './components/AddTask'
import Tasks from './components/Tasks'
import Title from './components/Title';

function App() {
  const [tasks, setTasks] = useState(
    // acessando os dados do localStorage
    // se nao tiver nada no localStorage(primeiro acesso), vai ter uma lista vazia 
    JSON.parse(localStorage.getItem("tasks")) || []
  );

  function onTaskClick(taskId) {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, isCompleted: !task.isCompleted }; 
      }
      return task;
    });
    // atualizando o estado para a nova lista de tarefas
    setTasks(newTasks);
  }

  // ejecuta a primeira função sempre que o valor que esta na lista for alterado
  // se colocar uma nova task, aciona a função
  useEffect(() => {
    // 1: nome para identificar o dado usado, 2 oque quer armazena dado nomeado
    // convertendo o tasks para string
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  
  // ------------------------------ API ----------------------------------------
  // para pegar as tarefas na api
  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     // Chamar api
  //     const response = await fetch(
  //       'https://jsonplaceholder.typicode.com/todos/?_limit=10', 
  //       {
  //       method:'GET',
  //       }
  //     );

  //     const data = await response.json(); // convertendo para json

  //     setTasks(data);
  //   };
  //   fetchTasks();
  // }, []) // se o segundo parametro for uma lista vazia, função so roda 1 vez(primeiro acesso)


  function onDeleteTaskClick(taskId) {
    // vai manter na lista apenas as tarefas que não tem o id igual ao taskId
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
  }

  function onAddTaskSubmit(title, description){
    const newTask = {
      id: tasks.length + 1,
      title,
      description,
      isCompleted: false,
    };
    // coloca tudo que tava dentro do tasks e add o newTask
    setTasks([...tasks, newTask]);
  }

  return (
    <div className='w-screen h-screen bg-slate-500 flex justify-center p-6'>
      <div className="w-125 space-y-4">
        <Title>
            Detalhes da Tarefa
        </Title>
        <AddTask onAddTaskSubmit={onAddTaskSubmit}/>
        <Tasks tasks={tasks} onTaskClick={onTaskClick} onDeleteTaskClick={onDeleteTaskClick}/>
      </div>
    </div>
  );
}

export default App;