import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../redux/authSlice';
import {
    fetchTasks,
    updateTask,
    selectEmployeeTasks,
    selectTasksLoading,
    selectTasksError
} from '../redux/tasksSlice';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    
    const employeeTasks = useSelector(selectEmployeeTasks(user?.employeeId));
    const loading = useSelector(selectTasksLoading);
    const error = useSelector(selectTasksError);

    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout());
    };

    const getAllowedTransitions = (currentStatus) => {
        switch (currentStatus) {
            case 'pending':
                return ['in-progress'];
            case 'in-progress':
                return ['completed'];
            case 'completed':
                return []; 
            default:
                return [];
        }
    };

    const handleStatusChange = async (taskId, currentStatus, newStatus) => {
        const allowedTransitions = getAllowedTransitions(currentStatus);

        if (!allowedTransitions.includes(newStatus)) {
            alert('Invalid status transition!');
            return;
        }

        setUpdatingTaskId(taskId);
        try {
           
            const task = employeeTasks.find(t => t.id === taskId);

            await dispatch(updateTask({
                id: taskId,
                title: task.title,
                description: task.description,
                assignedTo: task.assignedTo,
                status: newStatus
            })).unwrap();
        } catch (error) {
            alert(`Failed to update status: ${error}`);
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const getStatusBadgeClass = (status) => {
        return `status-badge ${status}`;
    };

    return (
        <div className="employee-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Employee Dashboard</h1>
                    <p>Welcome, {user?.name}!</p>
                </div>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>

            <div className="dashboard-content">
                <div className="section">
                    <div className="section-header">
                        <h2>My Tasks</h2>
                        <span className="task-count">
                            {employeeTasks.length} {employeeTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <p className="loading-text">Loading your tasks...</p>
                    ) : employeeTasks.length === 0 ? (
                        <div className="empty-state">
                            <p>No tasks assigned to you yet.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="tasks-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Created Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeTasks.map(task => {
                                        const allowedTransitions = getAllowedTransitions(task.status);
                                        const isCompleted = task.status === 'completed';
                                        const isUpdating = updatingTaskId === task.id;

                                        return (
                                            <tr key={task.id}>
                                                <td>{task.id}</td>
                                                <td className="task-title">{task.title}</td>
                                                <td className="task-description">{task.description}</td>
                                                <td>
                                                    <span className={getStatusBadgeClass(task.status)}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    {isUpdating ? (
                                                        <span className="updating-text">Updating...</span>
                                                    ) : isCompleted ? (
                                                        <span className="locked-badge">✓ Locked</span>
                                                    ) : (
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task.id, task.status, e.target.value)}
                                                            disabled={isUpdating}
                                                            className="status-select"
                                                        >
                                                            <option value={task.status}>
                                                                {task.status} (current)
                                                            </option>
                                                            {allowedTransitions.map(status => (
                                                                <option key={status} value={status}>
                                                                    Move to {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                
            </div>
        </div>
    );
};

export default EmployeeDashboard;
