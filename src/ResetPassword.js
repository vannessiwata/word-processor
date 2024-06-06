import { Modal, Input, Button } from 'antd';
import z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import axios from 'axios';

const CryptoJS = require('crypto-js');

const validationSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPassword(props) {
    const defaultValues = {
        password: '',
        confirmPassword: '',
    };

    const token = window.localStorage.getItem('accessToken');

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: defaultValues
    });

    const onSubmit = async (data) => {
        var key = CryptoJS.enc.Utf8.parse('keysuntukenkripsipasswordskripsi');
        var iv = CryptoJS.lib.WordArray.random(32);

        var pwIv = CryptoJS.enc.Utf8.parse(iv);
        var passwordToArray = CryptoJS.enc.Utf8.parse(data.password.slice(0, 32));
        var encrypted = CryptoJS.AES.encrypt(passwordToArray, key, { iv: pwIv });
        var cipher = iv.toString() + encrypted.toString();

        var repetition = Math.ceil(32 / data.password.length);
        var password = data.password.repeat(repetition).slice(0, 32);
        var documentIv = CryptoJS.enc.Hex.parse(props.content.slice(0, 32));

        var docKey = CryptoJS.enc.Utf8.parse(password);
        var docIV = CryptoJS.enc.Utf8.parse(documentIv);
        var cipherText = CryptoJS.AES.encrypt(props.content.slice(32), docKey, { iv: docIV });

        var document = documentIv.toString() + cipherText.toString();

        var param = `{
            "document_id": "${props.documentId}",
            "password": "${cipher}",
            "content" : "${document}"
        }`;

        try{
        const response = await axios.post('https://iwata.my.id/api/reset-password', JSON.parse(param), {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        });
        
        if(response.status == 200){
            props.setAccessGranted(true);
            props.setPassword(data.password);
            props.setIsOtp(false);
        }
        }catch(err){
            console.log(err);
        }
    }

    function handleCancel(){
        props.setAccessGranted(false);
        props.isInputPassword(true);
    }

    return (
        <>
         <Modal
            open={true}
            onCancel={() => handleCancel()}
            footer={null}
            >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="my-2">
                <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                    <>
                        <label className="my-3 font-semibold">Password</label>
                        <Input
                        type="password"
                        className="p-2"
                        placeholder="Set Password..."
                        {...field}
                        />
                        {errors.password?.message && <p className="text-red-500">{errors.password.message}</p>}
                    </>
                    )}
                />
                </div>
                <div className="my-2">
                <Controller
                    name='confirmPassword'
                    control={control}
                    render={({ field }) => (
                    <>
                        <label className="my-3 font-semibold">Confirm Password</label>
                        <Input
                        type="password"
                        className="p-2"
                        placeholder="Re-enter your password"
                        {...field}
                        />
                        {errors.confirmPassword?.message && <p className="text-red-500">{errors.confirmPassword.message}</p>}
                    </>
                    )}
                />
                </div>
                <Button
                    type="primary"
                    htmlType="submit"
                    className="bg-gray-800 text-white rounded-md mt-3"
                >
                    Reset Password
                </Button>
            </form>
            </Modal>
        </>
    );
}