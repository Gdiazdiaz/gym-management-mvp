import dotenv from 'dotenv';
dotenv.config();
import { Main } from './server';

const app = Main();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));