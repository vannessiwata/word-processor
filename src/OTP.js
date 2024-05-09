import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from 'antd';
import z, { set } from 'zod';
import { InputOTP } from 'antd-input-otp';
import axios from 'axios';
import { useState } from 'react';

const validationSchema = z.object({
    otp: z.array(z.string()
    ).refine(data => data.length === 6, {
        message: 'OTP must be 6 characters'
    }),
});

export default function OTP(props) {
    const [otpFailed, setOtpFailed] = useState(false);
    const defaultValues = {
        otp: [],
    };
    
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: defaultValues
    });

    async function verifyOTP(data) {
        try{
          var otp = data.otp.join('');
          var param = `{
            "document_id": "${props.documentId}",
            "otp": "${otp}",
            "user_id": "${props.user.google_id}"
          }`;
    
          const response = await axios.post('http://127.0.0.1:8000/api/verify-otp', JSON.parse(param));
    
          if(response.status == 200){
            setOtpFailed(false);
            props.setIsOtp(true);
            props.setOpenOtpModal(false);
          }
        }catch(err){
            console.log(err);
            setOtpFailed(true);
        }
    }

    return (
        <>
             <Modal
                open={true}
                footer={null}
                onCancel={() => {props.setIsOtp(false)}}
              >
                <div className='mt-6'>
                    <div className='flex justify-center'>
                        <h1 className='my-2'>OTP Code has been sent to your email address. Please check your email!</h1>
                    </div>
                    <form onSubmit={handleSubmit(verifyOTP)}>
                    <div className="my-2">
                    <Controller
                            name='otp'
                            control={control}
                            render={({ field }) => (
                            <InputOTP length={6} {...field} />
                            )}
                        />
                        {otpFailed && 
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
                    <div className="flex justify-center"> {/* Apply flexbox to center the button */}
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="bg-gray-800 text-white rounded-md mt-3"
                            >
                                Verify
                            </Button>
                        </div>
                    </form>
                </div>
          </Modal>
        </>
    );
}