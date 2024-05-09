import React, { useCallback, useState, useEffect } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import './styles.css'
import { Button, Modal } from 'antd';
import { io } from 'socket.io-client';
import { redirect, useParams } from 'react-router-dom'
import axios from 'axios'
import SignIns from './SignIns'
import { Input } from 'antd';
import z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import OTP from './OTP';
import ResetPassword from './ResetPassword';
import { useNavigate } from 'react-router-dom';

const SAVE_INTERVAL = 5000;
const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'font': ['Times New Roman'] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'align': [] }],
  ['clean'],
]

const CryptoJS = require('crypto-js');

const validationSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

export default function WordProcessor() {
  const {id : documentId} = useParams();
  const [fileClick, setFileClick] = useState(false);
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [documentTitle, setDocumentTitle] = useState();
  const [ownerDocument, setOwnerDocument] = useState(); 
  const [accessGranted, setAccessGranted] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [user, setUser] = useState();
  const [content, setContent] = useState();
  const [isOtp, setIsOtp] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isInputPassword, setIsInputPassword] = useState(true);
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [passwordTrue, setPasswordTrue] = useState(false);

  const navigate = useNavigate();
  const defaultValues = {
    password: '',
  };

  const { control, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(validationSchema),
      defaultValues: defaultValues
  });

  useEffect(() => {
      var token = localStorage.getItem('accessToken');
      if (token) {
          fetch(`http://127.0.0.1:8000/api/user`, {
              headers : {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': 'Bearer ' + token,
              }
          })
          .then((response) => {
              if (!response.ok) {
                  throw new Error('Failed to fetch user data');
              }
              return response.json();
          })
          .then((userData) => {
              setUser(userData);
          })
          .catch((error) => {
              console.error('Error fetching user data:', error);
          });
      } else {
          console.error('Access token not found');
      }
  }, []);

  useEffect(() => {
    if(user){
      if(user.google_id == ownerDocument){
        setIsOwner(true);
      }
    }
  }, [user, ownerDocument]);

  useEffect(() => {
    const s = io('http://localhost:3001');
    setSocket(s);
    
    return () => {
      s.disconnect();
    }
  }, [])
  
  useEffect(() => {
      if(socket == null || quill == null) return;
        socket.once('load-document', document => {
        if(document == null){
          navigate('/404');
        }
        setDocumentTitle(document.title);
        setOwnerDocument(document.owner);
        setContent(document.content);

        const testJson = JSON.parse(document.content);
        
        const delta = testJson.ops;

        quill.setContents(delta);
        quill.enable();
      })

      socket.emit('get-document', documentId);
    }
  , [socket, quill, documentId]);

  useEffect(() => {
    if(accessGranted){
      if(socket == null || quill == null) return;

      const interval = setInterval(() => {
        const documentData = {
          title: documentTitle,
          content: quill.getContents(),
          password: password,
          owner: ownerDocument,
          user_id: user.google_id
        }

        socket.emit('save-document', documentData);
      }, SAVE_INTERVAL);

      return () => {
        clearInterval(interval);
      }
    }
  }, [socket, quill, documentTitle, ownerDocument, password, accessGranted, user])

  useEffect(() => {
    if(socket == null || quill == null) return;

    const handler = delta => {
      quill.updateContents(delta)
    }
    socket.on('receive-changes', handler)

    return () => {
      socket.off('receive-changes', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if(socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if(source !== 'user') return;
      socket.emit('send-changes', delta);
    }

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
    }
  }, [socket, quill])

  const wrapperRef =  useCallback((wrapper) => {
    if(wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement('div');
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      }
    });
    q.disable();
    q.setText('Loading...');
    setQuill(q);
  }, [])

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    setDocumentTitle(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const onSubmit = async (data) => {
      var key = CryptoJS.enc.Utf8.parse('keysuntukenkripsipasswordskripsi');
      var iv = CryptoJS.enc.Utf8.parse('keyskeduaskripsi');
      var passwordToArray = CryptoJS.enc.Utf8.parse(data.password);
      var encrypted = CryptoJS.AES.encrypt(passwordToArray, key, { iv: iv });
      var cipher = encrypted.toString();

      var param = `{
        "document_id": "${documentId}",
        "password": "${cipher}"
      }`;

      var body = JSON.parse(param);
      try{
        const response = await axios.post('http://127.0.0.1:8000/api/documents/check-password', body);

        if(response.status == 200){
          setPassword(data.password);
          handleOtpModal('accessdoc')
        }else{
          setPasswordError(true);
        }
      }catch(err){
        setPasswordError(true);
      }
  }

  async function handleOtpModal(type){
    try{
      var param = `{
        "document_id": "${documentId}",
        "user_id": "${user.google_id}",
        "type": "${type}"
      }`;
      const response = await axios.post('http://127.0.0.1:8000/api/send-email-otp', JSON.parse(param));

      if(response.status == 200){
        if(type == 'accessdoc'){
          setPasswordTrue(true);
        }else{
          setOpenOtpModal(true);
          setIsInputPassword(false);
        }
      }
    }catch(err){
      console.log(err);
    }
  }

  return (
    <>
      {user ?
        <div className={accessGranted && user ? '' : 'hidden'}>
          {openOtpModal &&
            <OTP setOpenOtpModal={setOpenOtpModal} setIsOtp={setIsOtp} user={user} documentId={documentId}/>
          }
          {isOwner && isOtp && 
            <ResetPassword setAccessGranted={setAccessGranted} setIsOtp={setIsOtp} isInputPassword={setIsInputPassword} content={content} ownerDocument={ownerDocument} documentId={documentId} setIsInputPassword={setIsInputPassword} setPassword={setPassword}/>
          }
          <div className='m-5 sticky'>
            <div className='flex col-lg-12 justify-between items-center mb-4'>
              <div className='row'>
              <div className='col-lg-6'>
              <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {isEditing ? (
                  <Input
                    type="text" 
                    value={documentTitle} 
                    onChange={handleInputChange} 
                    onBlur={handleInputBlur} 
                    autoFocus 
                  />
                ) : (
                  <h1 className='mb-2 font-bold text-lg' onClick={handleTitleClick}>{documentTitle}</h1>
                )}
              </div>
            </div>
          </div>
                  <div>
                    {accessGranted == false ? 
                      <>
                       {passwordTrue ? 
                          <OTP setOpenOtpModal={setPasswordTrue} setIsOtp={setAccessGranted} user={user} documentId={documentId}/>
                        :
                          <Modal
                            open={isInputPassword}
                            footer={null}
                          >
                            <h1 className='font-bold'>You need to insert the password to access this document</h1>
                            <div className="mt-4">
                            <form onSubmit={handleSubmit(onSubmit)}>
                              <Controller
                                    name='password'
                                    control={control}
                                    render={({ field }) => (
                                    <>
                                      <Input
                                        type="password"
                                        className="p-2"
                                        placeholder="Password..."
                                        {...field}
                                      />
                                      {passwordError && <p className="text-red-500">Password is incorrect</p>}
                                      {errors.password?.message && <p className="text-red-500">{errors.password.message}</p>}
                                    </>
                                    )}
                                />
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="bg-gray-800 text-white rounded-md mt-3"
                                  >
                                    Create
                                  </Button>
                              </form>
                              {isOwner && 
                                <a className="my-2" onClick={() => handleOtpModal()}>Forgot Password ?</a>
                              }
                            </div>
                          </Modal>
                        }
                      </>
                    : 
                    <>
                    </>
                    } 
                    
                  </div>
              </div>
              </div>
            <div className='container' ref={wrapperRef}></div>
        </div>
      : 
        <Modal 
          open={true}
          onCancel={null}
          footer={null}
        >
          <h1 className='font-bold'>You need to sign in to access and edit this document</h1>
          <SignIns />           
        </Modal>
      }
    </>
  )
}
