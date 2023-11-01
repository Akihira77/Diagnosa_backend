import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { StatusCodes } from './constant.js';
import { Response } from 'express';
import { ISendEmailOptions } from '../@types/interfaces.js';

const __dirname = path.resolve();
let res:Response;

export const sendEmail = async ({email, subject, payload, template}:ISendEmailOptions): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 465,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
            });
            
            const templatePath = path.join(__dirname, template);
            const source = fs.readFileSync(templatePath, 'utf8');
            const compiledTemplate = handlebars.compile(source);
            const options = () => {
                return {
                    from: process.env.EMAIL,
                    to: email,
                    subject,
                    html: compiledTemplate(payload)
                }
            }
            
            transporter.sendMail(options(), (error, info) => {
            if (error) {
                console.log(error);
                return error;
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(StatusCodes.Ok200).send({message: 'Email sent'});
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error('An unknown error occurred'); 
        }        
    }
}