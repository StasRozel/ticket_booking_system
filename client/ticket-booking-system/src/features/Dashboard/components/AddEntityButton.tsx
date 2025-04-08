import React from 'react';
import '../styles/css/AddEntityButton.css';

// Определяем интерфейс для пропсов
interface AddEntityButtonProps {
  nameButton: string;
  onClick?: () => Promise<void> | undefined;
}

// Используем интерфейс для типизации пропсов
const AddEntityButton: React.FC<AddEntityButtonProps> = ({ nameButton, onClick }) => {
  return (
    <button type='button' className="add-entity-button" onClick={onClick}>{nameButton}</button>
  );
};

export default AddEntityButton;