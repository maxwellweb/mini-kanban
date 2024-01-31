import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const history = useNavigate();

  const obtenerTareasDesdeAPI = async () => {
    try {
      const response = await axios.get('/api/tasks');
      if (response.data.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error al obtener tareas desde la API:', error);
    }
  };

  useEffect(() => {
    obtenerTareasDesdeAPI();
    const checkAccessToken = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          history('/');
        } else {
          await obtenerTareasDesdeAPI();
        }
      };

      // Llama a la función para verificar el token de acceso
      checkAccessToken();

      // Establece un temporizador para verificar continuamente
      const intervalId = setInterval(checkAccessToken, 5000);

      // Limpia el temporizador cuando el componente se desmonta
      return () => clearInterval(intervalId);
  }, [history]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Obtén la tarea que se está moviendo
    const tareaMovida = tasks.find((task) => task.id.toString() === draggableId);

    // Establece el user_id según la columna de destino
    const user_id = await obtenerUserIdDesdeAPI();

     // Verifica que el usuario tenga permiso para mover la tarea
   if (destination.droppableId === 'hecho' && tareaMovida.user_id !== user_id) {
        toast.warning('No tienes permisos para mover esta tarea a esta columna!', {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
        return;
      }
    // Si la tarea se movió a "Por Hacer" y estaba asignada, quita el user_id
    if (destination.droppableId === 'por_hacer' && tareaMovida.user_id !== null) {
      setTasks((prevTasks) => {
        const nuevasTareas = [...prevTasks];
        const tareaIndex = nuevasTareas.findIndex((task) => task.id === tareaMovida.id);
        nuevasTareas[tareaIndex].column = destination.droppableId;
        nuevasTareas[tareaIndex].user_id = null;
        return nuevasTareas;
      });
    } else {
      // Si la tarea se movió a "En Progreso" o "Completado", establece el user_id
      setTasks((prevTasks) => {
        const nuevasTareas = [...prevTasks];
        const tareaIndex = nuevasTareas.findIndex((task) => task.id === tareaMovida.id);
        nuevasTareas[tareaIndex].column = destination.droppableId;
        const userId = obtenerUserIdDesdeLocalStorage();
        nuevasTareas[tareaIndex].user_id = userId;
        return nuevasTareas;
      });
    }

    try {
      // Actualiza la tarea en la API
      await axios.put(`/api/tasks/${tareaMovida.id}`, {
        column: destination.droppableId,
        user_id: tareaMovida.user_id === null ? null : user_id,
      });

      // Recarga las tareas después de la actualización
      await obtenerTareasDesdeAPI();
    } catch (error) {
      console.error('Error al actualizar la tarea en la API:', error);
    }
  };

  const obtenerUserIdDesdeAPI = async () => {
    try {
      const response = await axios.post('/api/me', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      return response.data.id;
      //console.log(response.data.id);
    } catch (error) {
      console.log('Error al obtener el user_id desde la API:', error);
      return null;
    }
  };


  const renderColumna = (columnaId, titulo) => (
    <Droppable droppableId={columnaId} key={columnaId}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex-shrink-0 p-4 border rounded-md bg-white shadow-md w-72"
        >
          <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
          {tasks
            .filter((task) => task.column === columnaId)
            .map((task, index) => {
              // Verifica si el usuario tiene permisos para arrastrar la tarea en "En Progreso"
              const canDrag = columnaId !== 'hecho';

              return (
                <Draggable
                  key={task.id.toString()}
                  draggableId={task.id.toString()}
                  index={index}
                  isDragDisabled={!canDrag} // Desactiva el arrastre si el usuario no tiene permisos
                >
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className={`p-2 mb-2 bg-gray-100 rounded-md ${canDrag ? 'cursor-move' : 'cursor-not-allowed'}`}
                    >
                      <p className="text-sm font-semibold">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.description}</p>
                      <p className="text-xs text-gray-500">
                        {columnaId === 'por_hacer' ? 'Sin asignar' : `Asignado a: ${task.user ? task.user.name : 'N/A'}`}
                      </p>
                    </div>
                  )}
                </Draggable>
              );
            })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  const obtenerUserIdDesdeLocalStorage = async () => {
    // Implementa la lógica para obtener el user_id desde el JWT almacenado en localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
            const idUser = await axios.post('/api/me', {}, { headers: {"Authorization" : `Bearer ${token}`} });
            return idUser.id;
      } catch (error) {
         console.log(error);
      }
    }
    return null;
  };

  const handleAddTask = async () => {
    try {
      const response = await axios.post('/api/tasks', {
        title: newTaskTitle,
        description: newTaskDescription,
        column: 'por_hacer',
        user_id: null,
      });

      if (response.status === 201) {
        toast.success('Tarea agregada exitosamente!', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });

        setNewTaskTitle('');
        setNewTaskDescription('');
        await obtenerTareasDesdeAPI();
      } else {
        toast.error('Error al agregar la tarea. Inténtalo de nuevo.', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      }
    } catch (error) {
      console.error('Error al agregar la tarea:', error);
    }
  };

  const handleLogout = () => {
    // Borra el localStorage y redirige a la página de inicio de sesión
    localStorage.removeItem('accessToken');
    history('/');
    toast.success('Usuario desconectado, redireccionando al inicio de session.', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Tableros Kanban</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto">
          {renderColumna('por_hacer', 'Por Hacer')}
          {renderColumna('en_progreso', 'En Progreso')}
          {renderColumna('hecho', 'Completado')}

          {/* Nueva Columna con Formulario para Agregar Tareas */}
          <div className="flex-shrink-0 p-4 border rounded-md bg-white shadow-md w-72">
            <h3 className="text-lg font-semibold mb-4">Nueva Tarea</h3>
            <form className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Título:</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="mt-1 p-2 border rounded-md w-full"
              />
              <label className="block text-sm font-medium text-gray-700 mt-4">Descripción:</label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="mt-1 p-2 border rounded-md w-full"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="mt-4 px-4 py-2 w-full bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                Agregar Tarea
              </button>
            </form>
          </div>
        </div>
      </DragDropContext>

      <div className="text-sm text-center mt-8">
        <Link to="#" onClick={handleLogout} className="font-medium text-indigo-600 hover:text-indigo-500">
          Cerrar sesión
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Dashboard;
