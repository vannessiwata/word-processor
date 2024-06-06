import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import VerifyOTP from './VerifyOTP';

const validationSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

function SignUp() {
    const [redirectToVerifyOTP, setRedirectToVerifyOTP] = useState(false);
    const [userData, setUserData] = useState({});

    const defaultValues = {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: defaultValues
    });

    async function onSubmit(data){
        try{
            const response = await axios.post('http://iwata.my.id/api/register', {
                "name": data.fullName,
                "email" : data.email,
                "password" : data.password
            });

            if(response.status == 200){
                setUserData(data);
                setRedirectToVerifyOTP(true);
            }
        }catch(err){
            console.log(err);
        }
    }

    if (redirectToVerifyOTP) {
        return <VerifyOTP name={userData.fullName} email={userData.email}/>;
    }

    return (
        <div className='h-screen flex justify-center items-center bg-gradient-to-br bg-gray-300'>
            <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Join <span className='text-blue-600'>CipherDocs</span> To Secure Your Document
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <Controller
                        name='fullName'
                        control={control}
                        render={({ field }) => (
                        <>
                        <label htmlFor="fullname" className="block text-sm font-medium leading-6 text-gray-900">
                            Fullname
                        </label>
                        <div className="mt-2">
                            <input
                                id="fullname"
                                name="fullname"
                                type="text"
                                autoComplete="fullname"
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                {...field}
                            />
                            {errors.fullName?.message && <p className="text-red-500">{errors.fullName.message}</p>}
                        </div>
                    </>
                    )}
                />
                </div>
                    <div>
                    <Controller
                        name='email'
                        control={control}
                        render={({ field }) => (
                        <>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                {...field}
                            />
                            {errors.email?.message && <p className="text-red-500">{errors.email.message}</p>}
                        </div>
                    </>
                    )}
                />
                </div>
                <div>
                <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                    <>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                            Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                {...field}
                            />
                            {errors.password?.message && <p className="text-red-500">{errors.password.message}</p>}
                        </div>
                    </>
                    )}
                />
                </div>
                <div>
                <Controller
                    name='confirmPassword'
                    control={control}
                    render={({ field }) => (
                    <>
                        <div className="flex items-center justify-between">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                            Confirm Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                {...field}
                            />
                            {errors.confirmPassword?.message && <p className="text-red-500">{errors.confirmPassword.message}</p>}
                        </div>
                    </>
                    )}
                />
                </div>
                <div>
                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-gray-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Sign Up
                    </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Already Have Account?{' '}
                    <a href="../" className="font-semibold leading-6 text-gray-800 hover:text-gray-500">
                    Sign In
                    </a>
                </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
