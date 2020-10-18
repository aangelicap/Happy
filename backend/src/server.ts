import express from 'express';
import 'express-async-errors';
import path from 'path';
import cors from 'cors';

import './database/connection';
import errorHandler from './errors/handler';

import routes from './routes'

const app = express();

app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.join(__dirname,'..', 'uploads')));
app.use(errorHandler);

app.use(cors());

app.listen(3333);

