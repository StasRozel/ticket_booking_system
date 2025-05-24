import React, { useState, FormEvent } from 'react';
import '../styles/css/Contacts.css';
import Footer from '../../../shared/components/Footer';
import Header from '../../../shared/components/Header';
import Telegram from '../../../shared/img/telegram-icon.png';
import Instagram from '../../../shared/img/instagram-icon.png';
import Vk from '../../../shared/img/vk-icon.png';
import { contactSchema } from '../schemas/contactSchema';

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Валидация с помощью Zod
    const result = contactSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Очистка ошибок при успешной валидации
    setErrors({});

    // Здесь можно добавить отправку данных на сервер
    console.log('Form submitted:', formData);
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
          {/* 
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
                {errors.name && <div className="error">{errors.name}</div>}
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
                {errors.email && <div className="error">{errors.email}</div>}
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
                {errors.message && <div className="error">{errors.message}</div>}
              </div>
              <button type="submit" className="contacts__submit">Отправить</button>
            </form> */}

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