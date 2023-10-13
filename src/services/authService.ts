import {User} from '../models/userModel.js';
import {Token} from '../models/tokenModel.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';
import { ISendEmailOptions } from '../@types/interfaces.js';

    class authService {
        constructor() {}

        async requestPasswordReset(email: string): Promise<{link:string}> {
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');
            
            const token = await Token.findOne({ userId: user._id });
            if (token) await token.deleteOne();

            const resetToken = crypto.randomBytes(32).toString('hex');
            const hash = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));

            await new Token({
                userId: user._id,
                token: hash,
                createdAt: Date.now(),
            }).save();

            const link = `${process.env.CLIENT_URL}}/passwordReset?token=${resetToken}&id=${user._id}`;

            sendEmail({
                email: user.email, 
                subject: 'Password Reset Request', 
                payload:{link}, 
                template: './template/requestResetPassword.handlebars'} as ISendEmailOptions );
            return {link};
        }
    }

    export default new authService();