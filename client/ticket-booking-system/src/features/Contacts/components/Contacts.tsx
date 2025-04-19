// src/components/Contacts.tsx
import React, { useState, FormEvent } from 'react';
import '../styles/css/Contacts.css';
import Footer from '../../Home/components/Footer';
import Header from '../../Home/components/Header';
import Telegram from '../../Home/img/telegram-icon.png';
import Instagram from '../../Home/img/instagram-icon.png';
import Vk from '../../Home/img/vk-icon.png';

interface FormData {
    name: string;
    email: string;
    message: string;
}

const Contacts: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Здесь можно добавить отправку данных на сервер
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <>
            <Header />
            <section className="contacts">
                <div className="container">
                    <div className="contacts__header">
                        <h1>Свяжитесь с нами</h1>
                        <p>Мы всегда готовы помочь! Если у вас есть вопросы или предложения, заполните форму ниже или воспользуйтесь контактными данными.</p>
                    </div>

                    <div className="contacts__content">
                        <form className="contacts__form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Ваше имя</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Введите ваше имя"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Электронная почта</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Введите вашу почту"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Сообщение</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Введите ваше сообщение"
                                    required
                                />
                            </div>
                            <button type="submit" className="contacts__submit">Отправить</button>
                        </form>

                        <div className="contacts__info">
                            <h2>Наши контакты</h2>
                            <ul>
                                <li><strong>Телефон:</strong> +375 (29) 123-45-67</li>
                                <li><strong>Email:</strong> info@routes.by</li>
                                <li><strong>Адрес:</strong> г. Минск, ул. Примерная, 10</li>
                                <li><strong>График работы:</strong> Пн-Пт: 9:00 - 18:00</li>
                            </ul>
                            <div className="contacts__social">
                                <h3>Мы в соцсетях</h3>
                                <div className="social-links">
                                    <a href="#" className="social-link">
                                        <img src={Telegram} alt="Telegram" />
                                    </a>
                                    <a href="#" className="social-link">
                                        <img src={Instagram} alt="Instagram" />
                                    </a>
                                    <a href="#" className="social-link">
                                        <img src={Vk} alt="Facebook" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Contacts;