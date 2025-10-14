import express from 'express';
import { Agent, run } from '@openai/agents';
import dotenv from "dotenv";
import z  from 'zod';
import cors from 'cors';
dotenv.config();

console.log(process.env.OPENAI_API_KEY);

const app = express();
app.use(cors());
const subTaskSchma = z.object({
    message: z.string().min(1, 'Message cannot be empty'),
    timeFrame: z.string()
});
const taskSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  timeFrame: z.string(),
  subtasks: z.array(subTaskSchma),
});

const finalOutputSchema = z.object({
    finalOutput: z.array(taskSchema).min(1, 'At least one task is required'),
});
const agent = new Agent({
  name: 'Task Manager',
  outputType: finalOutputSchema,
  instructions:
   "you are a task management agent. You will be given a task, and you need to break it down into smaller subtasks if necessary. Each task should have a message describing the task and an optional list of subtasks. Your final output should be a JSON array of tasks, where each task is an object with a 'message' field and an optional 'subtasks' field. The 'subtasks' field should be an array of strings, each representing a subtask. Ensure that the JSON is properly formatted and adheres to the specified schema.",
});


app.get('/', async (req, res) => {
    try {
          const request = req.query.request;
          const result = await run(agent,request);
        return res.json({ output: Array.isArray(result.finalOutput) ? result.finalOutput : result.finalOutput?.finalOutput || [] });
    } catch (error) {
            console.error('Error:', error);
    return res.status(500).send('An error occurred');
    }

});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});