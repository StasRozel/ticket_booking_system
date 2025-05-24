import React, { useState, useEffect } from 'react';
import '../styles/css/Hero.css';
import { useHome } from '../context/HomeContext';
import { searchSchema } from '../schemas/searchSchema';

const Hero: React.FC = () => {
  const {
    searchFrom,
    setSearchFrom,
    searchTo,
    setSearchTo,
    searchDate,
    setSearchDate,
    searchPassengers,
    setSearchPassengers,
  } = useHome();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Получить сегодняшнюю дату в формате YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Функция валидации при изменении полей
  const validateField = (name: string, value: string) => {
    const partialData = {
      searchFrom: name === 'searchFrom' ? value : searchFrom,
      searchTo: name === 'searchTo' ? value : searchTo,
      searchDate: name === 'searchDate' ? value : searchDate,
      searchPassengers: name === 'searchPassengers' ? value : searchPassengers,
    };

    const result = searchSchema.safeParse(partialData);
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === name) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Обработчики изменений с валидацией
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchFrom(value);
    validateField('searchFrom', value);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTo(value);
    validateField('searchTo', value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchDate(value);
    validateField('searchDate', value);
  };

  const handlePassengersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchPassengers(value);
    validateField('searchPassengers', value);
  };

  // Валидация всех полей при загрузке компонента (если данные уже есть в контексте)
  // useEffect(() => {
  //   validateField('searchFrom', searchFrom);
  //   validateField('searchTo', searchTo);
  //   validateField('searchDate', searchDate);
  //   validateField('searchPassengers', searchPassengers);
  // }, [searchFrom, searchTo, searchDate, searchPassengers]);

  return (
    <section className="hero">
      <div className="hero__background">
        <div className="container">
          <h1>Купить билет на маршрут или автобус по Беларуси</h1>
          <div className="hero__search">
            <div className="input-group">
              <input
                type="text"
                placeholder="Откуда?"
                value={searchFrom}
                onChange={handleFromChange}
              />
              {errors.searchFrom && <div className="error">{errors.searchFrom}</div>}
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Куда?"
                value={searchTo}
                onChange={handleToChange}
              />
              {errors.searchTo && <div className="error">{errors.searchTo}</div>}
            </div>
            <div className="input-group">
              <input
                type="date"
                value={searchDate}
                onChange={handleDateChange}
                min={today}
              />
              {errors.searchDate && <div className="error">{errors.searchDate}</div>}
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Пассажиры"
                value={searchPassengers}
                onChange={handlePassengersChange}
              />
              {errors.searchPassengers && <div className="error">{errors.searchPassengers}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;