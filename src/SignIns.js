import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function SignIns() {
    const [loginUrl, setLoginUrl] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/auth', {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Something went wrong!');
            })
            .then((data) => setLoginUrl( data.url ))
            .catch((error) => console.error(error));
    }, []);

    return (
        // <div>
        //     {loginUrl != null && (
        //         <a href={loginUrl}>Google Sign In</a>
        //     )}
        // </div>
        <div className='h-screen flex justify-center items-center bg-gradient-to-br bg-gray-300'>
            <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-10 w-auto"
                        src="https://cdn-icons-png.freepik.com/256/2333/2333533.png?semt=ais_hybrid"
                        alt="Cipher Docs"
                    />
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Welcome to <span className='text-blue-600'>CipherDocs</span>, Please Sign in to continue
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <a
                        className="flex gap-2 w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold leading-6 text-gray-900 shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
                        href={loginUrl}
                    >
                        <img
                            className="w-6 h-6"
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            loading="lazy"
                            alt="google logo"
                        />
                        Sign in with Google
                    </a>
                </div>
            </div>
        </div>
    );
}

export default SignIns;
