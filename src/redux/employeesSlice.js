import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { EmployeeService } from '../utils/AuthService';


export const fetchEmployees = createAsyncThunk(
    'employees/fetchEmployees',
    async (_, { rejectWithValue }) => {
        try {
            return await EmployeeService.fetchAll();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addEmployee = createAsyncThunk(
    'employees/addEmployee',
    async (employeeData, { rejectWithValue }) => {
        try {
            return await EmployeeService.create(employeeData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateEmployee = createAsyncThunk(
    'employees/updateEmployee',
    async ({ id, ...employeeData }, { rejectWithValue }) => {
        try {
            return await EmployeeService.update(id, employeeData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteEmployee = createAsyncThunk(
    'employees/deleteEmployee',
    async (id, { rejectWithValue }) => {
        try {
            return await EmployeeService.delete(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const employeesSlice = createSlice({
    name: 'employees',
    initialState: {
        employees: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(addEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.employees.push(action.payload);
            })
            .addCase(addEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.employees.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.employees[index] = action.payload;
                }
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
           
            .addCase(deleteEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = state.employees.filter(e => e.id !== action.payload);
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});


export const selectAllEmployees = (state) => state.employees.employees;
export const selectEmployeesLoading = (state) => state.employees.loading;
export const selectEmployeesError = (state) => state.employees.error;

export default employeesSlice.reducer;
