import dotenv from 'dotenv';

import R6Api from './core/api';
import { UPLAY } from './core/constants/platforms';

dotenv.config();

const api = new R6Api(process.env.UPLAY_USERNAME, process.env.UPLAY_PASSWORD);

const player = api.getPlayer('sctx', UPLAY);

console.log(player);
