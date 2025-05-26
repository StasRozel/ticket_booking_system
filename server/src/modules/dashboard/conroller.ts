import 'reflect-metadata';
import { Controller, Get, Authorized } from 'routing-controllers';

@Controller('/api/dashboard')
@Authorized() // Применяем middleware ко всем маршрутам контроллера
export class DashboardController {
    @Get('/')
    getDashboard() {
        return { message: 'This is a protected dashboard route' };
    }
}   