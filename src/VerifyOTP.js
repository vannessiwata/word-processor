import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { InputOTP } from 'antd-input-otp';
import { useNavigate } from 'react-router-dom';

const validationSchema = z.object({
    otp: z.array(z.string()
    ).refine(data => data.length === 6, {
        message: 'OTP must be 6 characters'
    }),
});

function VerifyOTP(props) {
    const [otpFalse, setOtpFalse] = useState(false);  
    const token = useState(localStorage.getItem('accessToken'));
    const navigate = useNavigate();
    const defaultValues = {
        otp: [],
    };
    
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: defaultValues
    });

    useEffect(async () => {
        try{
            const response = await axios.post('https://iwata.my.id/api/send-email-verification', {
                "email" : props.email,
                "name" : props.name,
                "type" : "verifikasi"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });

            if(response.status == 200){
                console.log("success");
            }
        }catch(err){
            console.log(err);
        }
    }, []);

    async function onSubmit(data){
        try{
            const response = await axios.post('https://iwata.my.id/api/verify-email', {
                "email" : props.email,
                "otp" : data.otp.join(""),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });

            if(response.status == 200){
                window.location.href = '/';
            }
        }catch(err){
            if(err.response.status == 401){
                setOtpFalse(true);
            }
        }
    }

    return (
        <div className='h-screen flex justify-center items-center bg-gradient-to-br bg-gray-300'>
            <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-5 text-center text-lg font-bold leading-9 tracking-tight text-gray-900">
                        OTP has been sent to your email address. Please check your email!
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <Controller
                        name='otp'
                        control={control}
                        render={({ field }) => (
                            <InputOTP length={6} {...field} />
                        )}
                    />
                        {otpFalse && 
                            <div className='flex justify-center'>
                                <p className="text-red-500 my-2">OTP Incorrect</p>
                            </div>
                        }
                        {errors.otp?.message && 
                            <div className='flex justify-center'>
                                <p className="text-red-500 my-2">{errors.otp.message}</p>
                            </div>
                        }
                    </div>
                    <div>
                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-gray-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Verify
                    </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}

export default VerifyOTP;
