import express from 'express';
import { useExpressServer } from 'routing-controllers';
import { AppDataSource } from './src/config/db.spec';
import bodyParser from 'body-parser';
import cors from 'cors'
import { RouteController } from './src/modules/routes/controller/controller';
import { ScheduleController } from './src/modules/schedules/controller/controller';

const app = express();

app.use(bodyParser.json());
app.use(cors());

useExpressServer(app, {
  controllers: [RouteController, ScheduleController],
});

AppDataSource.initialize()
    .then(() => {
        console.log("\x1b[32m", "Database initialise successfully")
    })
    .catch((error) => console.log(error))

app.listen(3001, () => {
    console.log("\x1b[32m", "Server running in http://localhost:3001");
});
