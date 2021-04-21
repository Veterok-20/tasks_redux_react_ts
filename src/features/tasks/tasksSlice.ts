import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Task, TaskDTO } from "../../types";

interface TasksState {
    status: string
    error: null | string | undefined
    tasks: TaskDTO[]
}

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async function () {
    const response = await fetch('/api/tasks')
    if (response.ok) {
        const tasksFromServer: TaskDTO[] = await response.json();
        return tasksFromServer
    }
    else throw new Error('Response is not ok')
})

export const createTask = createAsyncThunk('tasks/createTask', async function(newTask: Task) {
    const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    })
    if (response.ok) {
        const taskFromServer: TaskDTO = await response.json();
        return taskFromServer
    }
    else throw new Error('Response is not ok')
})

export const removeTask = createAsyncThunk('tasks/removeTask', async function(id: number) {
    const response = await fetch(`/api/task/${id}`, {
        method: 'DELETE'
    })        
    if (response.ok) {
        return id
    }
    else throw new Error('Response is not ok')
})

export const updateTask = createAsyncThunk('tasks/updateTask', async function(updatedTask: TaskDTO) {
    const response = await fetch(`/api/task/${updatedTask.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
    })
    if (response.ok) {        
        return updatedTask
    }
    else throw new Error('Response is not ok')
})

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {
        status: 'idle',
        error: null,
        tasks: []
    } as TasksState,
    reducers: {
        // taskAdded(state, action: PayloadAction<TaskDTO>) {
        //     state.tasks.push(action.payload)
        // }
    },
    extraReducers: builder => {
        builder.addCase(fetchTasks.pending, (state, action) => {
            state.status = 'loading'
        })
        builder.addCase(fetchTasks.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.tasks = state.tasks.concat(action.payload)
        })
        builder.addCase(fetchTasks.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        })
        builder.addCase(createTask.fulfilled, (state, action) => {
            state.tasks.push(action.payload)
        })
        builder.addCase(removeTask.fulfilled, (state, action) => {
            const newTasks = state.tasks.filter(task => task.id !== action.payload)
            return {...state, tasks: newTasks} 
        })
        builder.addCase(updateTask.fulfilled, (state, action) => {
            const updatedTask = state.tasks.find((task) => task.id == action.payload.id)!
            updatedTask.completed = action.payload.completed
            updatedTask.text = action.payload.text
        })
    }
})

// export const { taskAdded } = tasksSlice.actions

export default tasksSlice.reducer

export const selectAllTasks = (state: RootState) => state.tasks.tasks

export const selectStatus = (state: RootState) => state.tasks.status

export const selectError = (state: RootState) => state.tasks.error