import { Router } from 'express';
import * as ctrl from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authAndLoad } from '../../middleware/auth.js';
import {
  registerSchema, loginSchema, forgotSchema, resetSchema,
} from './auth.validators.js';

const r = Router();

r.post('/register', validate(registerSchema), ctrl.register);
r.post('/login', validate(loginSchema), ctrl.login);
r.post('/refresh', ctrl.refresh);
r.post('/logout', ctrl.logout);
r.post('/forgot', validate(forgotSchema), ctrl.forgot);
r.post('/reset', validate(resetSchema), ctrl.reset);
r.get('/me', authAndLoad, ctrl.me);

export default r;
