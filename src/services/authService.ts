import {User} from '../models/UserModel.js';
import {Token} from '../models/TokenModel.js';
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

        async resetPassword(userId: string, token: string, password: string, confirmPassword: string): Promise<boolean> {

            const passwordResetToken = await Token.findOne({ userId });
            if (!passwordResetToken) {
                throw new Error('Invalid or expired password reset token');
            }

            //password Validation
            const authServiceInstance = new authService();
            const isValidPassword = await authServiceInstance.passwordValidation(password);
            if (!isValidPassword) {
                throw new Error('Password must be at least 6 characters, and one number');
            } else if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const isValid = await bcrypt.compare(token, passwordResetToken.token);
            if (!isValid) {
                throw new Error('Invalid or expired password reset token');
            }

            const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
            await User.updateOne(
                { _id: userId },
                { $set: { password: hash } },
                { new: true }
            );

            const user = await User.findById({ _id: userId });
            if (!user) {
                throw new Error('User not found');
            }

            sendEmail({
                email: user.email,
                subject: 'Password Reset Successfully',
                payload: { message: 'Your password has been reset successfully' },
                template: './template/resetPassword.handlebars',
            } as ISendEmailOptions);

            await passwordResetToken.deleteOne();
            return true;
        }

        async passwordValidation(password: string): Promise<boolean> {
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            } else if (password.length > 20) {
                throw new Error('Password must be less than 50 characters');
            } else if (!password.match(/\d/)) {
                throw new Error('Password must contain a number');
            } else if (!password.match(/[a-zA-Z]/)) {
                throw new Error('Password must contain a letter');
            } 
            return true;
        }

}
            
export default new authService();