import React, { useEffect, useState } from 'react';
import '../styles/css/EntitesManagement.css';
import FormStaff from './FormStaff';
import { useDashboard } from '../context/DashboardContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { UserType } from '../../../shared/types/UserType';
import api from '../../../shared/services/api';

const StaffManagement: React.FC = () => {
    const { users, trigger, fetchUsers, OpenModalForm, CloseModalForm, isAddMode, isModalFormOpen } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
    const [selectedStaff, setSelectedStaff] = useState<UserType | null>(null);

    // Фильтруем только менеджеров и водителей (role_id 2 и 3)
    const staffUsers = users.filter((user: UserType) => user.role_id === 2 || user.role_id === 3);

    useEffect(() => {
        fetchUsers();
    }, [trigger]);

    const handleEditStaff = (user: UserType) => {
        setSelectedStaff(user);
        OpenModalForm(false, user); // Открываем форму в режиме редактирования
    };

    const handleDeleteStaff = async (userId: number) => {
        try {
            await api.delete(`/users/delete/${userId}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const getRoleName = (roleId: number) => {
        switch (roleId) {
            case 2: return 'Менеджер';
            case 3: return 'Водитель';
            default: return 'Неизвестно';
        }
    };

    return (
        <div className="routes-management">
            <h2>Управление сотрудниками</h2>

            <div className="container">
                <table className="routes-management__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Фамилия</th>
                            <th>Отчество</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffUsers.map((user: UserType) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>{user.middle_name || '-'}</td>
                                <td>{user.email}</td>
                                <td>{getRoleName(user.role_id)}</td>
                                <td>
                                    <button
                                        className="routes-management__action"
                                        onClick={() => handleEditStaff(user)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="routes-management__action routes-management__action--delete"
                                        onClick={() => openModal('Вы уверены, что хотите удалить сотрудника?', () => handleDeleteStaff(user.id as number))}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="routes-management__actions">
                    <button className="routes-management__button__confirm" onClick={() => OpenModalForm(true, null)}>
                        Добавить сотрудника
                    </button>
                </div>
            </div>
            <FormStaff
                isOpen={isModalFormOpen}
                onClose={CloseModalForm}
                isActive={isAddMode}
                staff={selectedStaff}
                onSuccess={fetchUsers}
            />
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                message={modalMessage}
            />
        </div>
    );
};

export default StaffManagement;
