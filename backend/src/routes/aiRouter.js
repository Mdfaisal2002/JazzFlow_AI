import express from 'express'
import { deleteChat, getChat, getChats} from '../controllers/aiController.js'
import chatWithAi from '../controllers/aiController.js';
import { createChat } from '../controllers/createChatController.js';


const router = express.Router();

router.post('/chat/', createChat);
router.post('/chat/:id', chatWithAi);
router.get('/history', getChats)
router.get('/chat/:id', getChat)
router.delete('/chat/:id', deleteChat)

export default router;