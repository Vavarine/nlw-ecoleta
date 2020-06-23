import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import ip from 'ip';
import { errors } from 'celebrate'  

console.log(ip.address());

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());

app.listen(3333);