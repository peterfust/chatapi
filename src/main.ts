import express, {Request, Response} from 'express';
import { ApiService } from './services/apiService';
import {chain} from "./services/llmService";
import { QuestionsRequest } from './types/types';

const app = express();
const port = 3000;

const apiService = new ApiService();

app.use(express.json());


app.get('/apis', (req: Request, res: Response): void=> {
    res.json(apiService.getApiTitle());
});

app.post('/questions', async (req: Request, res: Response): Promise<void> => {
    const { question, oas, json_document } = req.body as QuestionsRequest;
    const resp = await chain.invoke({question: question, oas: apiService.getOas(oas), json_document: json_document});
    res.status(200).send(resp);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
