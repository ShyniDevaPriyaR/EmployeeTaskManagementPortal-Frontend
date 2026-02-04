import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../redux/authSlice';
import {
    fetchEmployees, addEmployee, updateEmployee, deleteEmployee,
    selectAllEmployees, selectEmployeesLoading, selectEmployeesError
} from '../redux/employeesSlice';
import {
    fetchTasks, addTask, updateTask, deleteTask, removeTasksByEmployee,
    selectAllTasks, selectTasksLoading, selectTasksError
} from '../redux/tasksSlice';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const employees = useSelector(selectAllEmployees);
    const employeesLoading = useSelector(selectEmployeesLoading);
    const employeesError = useSelector(selectEmployeesError);
    const tasks = useSelector(selectAllTasks);
    const tasksLoading = useSelector(selectTasksLoading);
    const tasksError = useSelector(selectTasksError);

    const [activeTab, setActiveTab] = useState('employees');

    
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', role: 'employee' });

   
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        assignedTo: '',
        status: 'pending'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);

    useEffect(() => {
        dispatch(fetchEmployees());
        dispatch(fetchTasks());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout());
    };

    
    const openAddEmployeeModal = () => {
        setEditingEmployee(null);
        setEmployeeForm({ name: '', email: '', role: 'employee' });
        setShowEmployeeModal(true);
    };

    const openEditEmployeeModal = (employee) => {
        setEditingEmployee(employee);
        setEmployeeForm({ name: employee.name, email: employee.email, role: employee.role });
        setShowEmployeeModal(true);
    };

    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingEmployee) {
                await dispatch(updateEmployee({ id: editingEmployee.id, ...employeeForm })).unwrap();
            } else {
                await dispatch(addEmployee(employeeForm)).unwrap();
            }
            setShowEmployeeModal(false);
            setEmployeeForm({ name: '', email: '', role: 'employee' });
        } catch (error) {
            alert(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (window.confirm('Are you sure? This will also delete all tasks assigned to this employee.')) {
            setDeletingItemId(id);
            try {
                await dispatch(deleteEmployee(id)).unwrap();
                
                dispatch(fetchTasks());
            } catch (error) {
                alert(error);
            } finally {
                setDeletingItemId(null);
            }
        }
    };

    
    const openAddTaskModal = () => {
        setEditingTask(null);
        setTaskForm({ title: '', description: '', assignedTo: '', status: 'pending' });
        setShowTaskModal(true);
    };

    const openEditTaskModal = (task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo || '',
            status: task.status
        });
        setShowTaskModal(true);
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const taskData = {
                ...taskForm,
                assignedTo: taskForm.assignedTo ? parseInt(taskForm.assignedTo) : null
            };
            if (editingTask) {
                await dispatch(updateTask({ id: editingTask.id, ...taskData })).unwrap();
            } else {
                await dispatch(addTask(taskData)).unwrap();
            }
            setShowTaskModal(false);
            setTaskForm({ title: '', description: '', assignedTo: '', status: 'pending' });
        } catch (error) {
            alert(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setDeletingItemId(id);
            try {
                await dispatch(deleteTask(id)).unwrap();
            } catch (error) {
                alert(error);
            } finally {
                setDeletingItemId(null);
            }
        }
    };

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(e => e.id === employeeId);
        return employee ? employee.name : 'Unassigned';
    };

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, {user?.name}!</p>
                </div>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>

            <div className="dashboard-tabs">
                <button
                    className={activeTab === 'employees' ? 'tab-btn active' : 'tab-btn'}
                    onClick={() => setActiveTab('employees')}
                >
                    Employees
                </button>
                <button
                    className={activeTab === 'tasks' ? 'tab-btn active' : 'tab-btn'}
                    onClick={() => setActiveTab('tasks')}
                >
                    Tasks
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'employees' && (
                    <div className="section">
                        <div className="section-header">
                            <h2>Employee Management</h2>
                            <button onClick={openAddEmployeeModal} className="add-btn">
                                + Add Employee
                            </button>
                        </div>
                        {employeesError && <div className="error-message">{employeesError}</div>}
                        {employeesLoading && employees.length === 0 ? (
                            <p className="loading-text">Loading employees...</p>
                        ) : (
                            <>
                                {employeesLoading && <p className="syncing-text">Updating list...</p>}
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map(employee => (
                                                <tr key={employee.id}>
                                                    <td>{employee.id}</td>
                                                    <td>{employee.name}</td>
                                                    <td>{employee.email}</td>
                                                    <td>
                                                        <span className="role-badge">{employee.role}</span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => openEditEmployeeModal(employee)}
                                                            className="edit-btn-small"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEmployee(employee.id)}
                                                            className="delete-btn-small"
                                                            disabled={deletingItemId === employee.id}
                                                        >
                                                            {deletingItemId === employee.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="section">
                        <div className="section-header">
                            <h2>Task Management</h2>
                            <button onClick={openAddTaskModal} className="add-btn">
                                + Add Task
                            </button>
                        </div>
                        {tasksError && <div className="error-message">{tasksError}</div>}
                        {tasksLoading && tasks.length === 0 ? (
                            <p className="loading-text">Loading tasks...</p>
                        ) : (
                            <>
                                {tasksLoading && <p className="syncing-text">Updating list...</p>}
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Title</th>
                                                <th>Description</th>
                                                <th>Assigned To</th>
                                                <th>Status</th>
                                                <th>Created At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map(task => (
                                                <tr key={task.id}>
                                                    <td>{task.id}</td>
                                                    <td>{task.title}</td>
                                                    <td className="description-cell">{task.description}</td>
                                                    <td>{getEmployeeName(task.assignedTo)}</td>
                                                    <td>
                                                        <span className={`status-badge ${task.status}`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => openEditTaskModal(task)}
                                                            className="edit-btn-small"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="delete-btn-small"
                                                            disabled={deletingItemId === task.id}
                                                        >
                                                            {deletingItemId === task.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}

               
                {showEmployeeModal && (
                    <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
                            <form onSubmit={handleEmployeeSubmit}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={employeeForm.name}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={employeeForm.email}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <input
                                        type="text"
                                        value={employeeForm.role}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                                        placeholder="employee"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowEmployeeModal(false)} className="cancel-btn" disabled={isSubmitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : (editingEmployee ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

              
                {showTaskModal && (
                    <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>{editingTask ? 'Edit Task' : 'Add Task'}</h2>
                            <form onSubmit={handleTaskSubmit}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={taskForm.title}
                                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={taskForm.description}
                                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Assign To</label>
                                    <select
                                        value={taskForm.assignedTo}
                                        onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                                    >
                                        <option value="">Unassigned</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={taskForm.status}
                                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowTaskModal(false)} className="cancel-btn" disabled={isSubmitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : (editingTask ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
