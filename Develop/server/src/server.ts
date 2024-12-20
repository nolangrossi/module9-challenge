import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

import routes from './routes/index.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();



const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.use(routes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));