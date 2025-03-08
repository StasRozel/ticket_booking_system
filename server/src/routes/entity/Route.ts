import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("routes") // Название таблицы
export class Route {
  @PrimaryGeneratedColumn()
  id: number; // Первичный ключ

  @Column({ type: "varchar", length: 255 }) // Поле для имени маршрута
  name: string;

  @Column({ type: "varchar", length: 255 }) // Поле для начальной точки
  starting_point: string;

  @Column({ type: "varchar", length: 255 }) // Поле для конечной точки
  ending_point: string;

  @Column({ type: "text", nullable: true }) // Поле для остановок (может быть пустым)
  stops: string;

  @Column({ type: "float" }) // Поле для расстояния
  distance: number;

  @Column({ type: "float" }) // Поле для цены
  price: number;
}