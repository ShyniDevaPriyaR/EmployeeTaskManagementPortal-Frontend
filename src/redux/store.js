import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import employeesReducer from './employeesSlice';
import tasksReducer from './tasksSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        employees: employeesReducer,
        tasks: tasksReducer,
    },
});
