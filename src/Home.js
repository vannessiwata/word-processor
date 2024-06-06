import { useEffect, useState } from "react"
import SignIns from "./SignIns"
import axios from 'axios'
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faLock, faFile } from '@fortawesome/free-solid-svg-icons'
import { Input, FloatButton, Modal, Button } from 'antd'
import { useNavigate } from "react-router-dom"
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuid } from 'uuid';
import VerifyOTP from "./VerifyOTP";

const CryptoJS = require('crypto-js');

const validationSchema = z.object({
  title: z.string().min(1, 'Title must be at least 1 character long').max(255, 'Title must be at most 255 characters long'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});


export default function Home(){
    const [user, setUser] = useState();
    const [token, setToken] = useState();
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [documentList, setDocumentList] = useState([]);
    const [documentSharedList, setDocumentSharedList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [redirectToVerifyOTP, setRedirectToVerifyOTP] = useState(false);
    const navigate = useNavigate();

    const defaultValues = {
      title: '',
      password: '',
      confirmPassword: '',
    };

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: defaultValues
    });

    useEffect(() => {
        var token = localStorage.getItem('accessToken');
        setToken(token);
        if (token) {
            fetch(`https://iwata.my.id/api/user`, {
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
                if(userData.email_verified_at == null){
                  setRedirectToVerifyOTP(true);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
                setLoading(false);
            });
        } else {
            setLoading(false);
            console.error('Access token not found');
        }
    }, []);

    useEffect(() => {
        if (user) {
            getDocuments(user.user_id);
        }
    }, [user]);

    async function getDocuments(id){
        try{
            const response = await axios.get(`https://iwata.my.id/api/documents/get-by-user?userId=${id}&search=${searchFilter}`, {
              headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
            });
            if(response.data){
                setDocumentList(response.data.document);
                setDocumentSharedList(response.data.documentShared);
            }
        }catch(error){
            console.error('Error fetching documents:', error);
        }
    }
    
    if (loading) {
        return <div>Loading...</div>;
    }

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
      }

    const navigation = [

    ];

    function handleDocumentClick(id){
        if(id){
          window.location.href = `./documents/${id}`;
        }
    }

    function createNewDocument(){
        setIsModalOpen(true);
    }

    const onSubmit = async (data) => {
      const newId = uuid();

      var key = CryptoJS.enc.Utf8.parse('keysuntukenkripsipasswordskripsi');
      var iv = CryptoJS.lib.WordArray.random(16);

      var pwIv = CryptoJS.enc.Utf8.parse(iv);

      var passwordToArray = CryptoJS.enc.Utf8.parse(data.password);
      var encrypted = CryptoJS.AES.encrypt(passwordToArray, key, { iv: pwIv });

      var cipher = iv.toString() + encrypted.toString();

      var repetition = Math.ceil(32/ data.password.length);
      var passwordToKey = data.password.repeat(repetition).slice(0, 32);
      var documentIV = CryptoJS.lib.WordArray.random(16);

      var pwKeyToArray = CryptoJS.enc.Utf8.parse(passwordToKey);
      var pwiv = CryptoJS.enc.Utf8.parse(documentIV);

      var encryptedContent = CryptoJS.AES.encrypt(`{"ops":[]}`, pwKeyToArray, { iv: pwiv });

      const combinedContent = documentIV.toString() + encryptedContent.toString();

      try{
        const response = await axios.post(`https://iwata.my.id/api/documents`, {
            document_id: newId,
            title: data.title,
            password: cipher,
            user_id: user.user_id,
            content: combinedContent,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
          }
        }
      );

        if(response){
          navigate(`/documents/${newId}`);
          setIsModalOpen(false);
        }
      }catch(error){
        console.error('Error creating document:', error);
      }
    };

    function onSearchChange(e){
        setSearchFilter(e.target.value);
        getDocuments(user.user_id);
    }

    if (redirectToVerifyOTP) {
      return <VerifyOTP name={user.name} email={user.email}/>;
    }

    return (
        <>
            <Modal
                title="Create New Document"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
              >
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="my-2">
                    <Controller
                        name='title'
                        control={control}
                        render={({ field }) => (
                        <>
                          <label className="my-3 font-semibold">Document Title</label>
                          <Input
                            className="p-2"
                            placeholder="Insert title..."
                            {...field}
                          />
                          {errors.title?.message && <p className="text-red-500">{errors.title.message}</p>}
                        </>
                        )}
                    />
                  </div>
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
                    loading={submitting}
                  >
                    Create
                  </Button>
                </form>
              </Modal>
        <div>
            {user ? (
                <div>
                  <Disclosure as="nav" className="bg-gray-800">
                  {({ open }) => (
                    <>
                      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            {/* Mobile menu button*/}
                            <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                              <span className="absolute -inset-0.5" />
                              <span className="sr-only">Open main menu</span>
                              {open ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                              ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                              )}
                            </Disclosure.Button>
                          </div>
                          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                            <div className="flex flex-shrink-0 items-center">
                              <img
                                className="h-8 w-auto"
                                src="https://cdn-icons-png.freepik.com/256/2333/2333533.png?semt=ais_hybrid"
                                alt="Your Company"
                              />
                            </div>
                            <div className="hidden sm:ml-6 sm:block">
                              <div className="flex space-x-4">
                                {navigation.map((item) => (
                                  <a
                                    key={item.name}
                                    href={item.href}
                                    className={classNames(
                                      item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                      'rounded-md px-3 py-2 text-sm font-medium'
                                    )}
                                    aria-current={item.current ? 'page' : undefined}
                                  >
                                    {item.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            <button
                              type="button"
                              className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                              <span className="absolute -inset-1.5" />
                              <span className="sr-only">View notifications</span>
                              {user.name}
                            </button>
            
                            {/* Profile dropdown */}
                            <Menu as="div" className="relative ml-3">
                              <div>
                                <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                  <span className="absolute -inset-1.5" />
                                  <span className="sr-only">Open user menu</span>
                                  <img
                                    className="h-8 w-8 rounded-full"
                                    referrerPolicy={'no-referrer'}
                                    src={user.avatar}
                                    alt="avatar"
                                  />
                                </Menu.Button>
                              </div>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <a
                                        href="#"
                                        className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                      >
                                        Sign out
                                      </a>
                                    )}
                                  </Menu.Item>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                        </div>
                      </div>
            
                      <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                          {navigation.map((item) => (
                            <Disclosure.Button
                              key={item.name}
                              as="a"
                              href={item.href}
                              className={classNames(
                                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                'block rounded-md px-3 py-2 text-base font-medium'
                              )}
                              aria-current={item.current ? 'page' : undefined}
                            >
                              {item.name}
                            </Disclosure.Button>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
                <div className="mx-auto">
                  <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex justify-center items-center mt-10 mb-5">
                      <Input onChange={(e) => onSearchChange(e)} size="large" placeholder="Search" prefix={<FontAwesomeIcon className="mx-2" icon={faMagnifyingGlass} />} />
                    </div>
                    <div>
                      <h1 className="font-bold my-4">My Document</h1>
                    </div>
                    <div>
                      {documentList.length != 0 ? documentList.map(document => (
                        <div key={document.id} onClick={() => handleDocumentClick(document.id)} className="flex bg-white my-2 p-3 rounded-3xl justify-between hover:bg-slate-400">
                          <div className="flex items-center gap-3 mx-2">
                            <FontAwesomeIcon icon={faLock} />
                            <p>{document.title}</p>
                          </div>
                          <p className="mx-2 text-gray-600">{document.updated_at}</p>
                        </div>
                      )) : 
                      <div className="flex text-center justify-center">
                        <div>
                          <FontAwesomeIcon className="text-2xl my-2" icon={faFile} />
                          <p>Document is empty</p>
                        </div>
                      </div>
                      }  
                    </div>
                    <div>
                      <h1 className="font-bold my-4">Shared With Me</h1>
                    </div>
                    <div>
                      {documentSharedList.length != 0 ? documentSharedList.map(document => (
                        <div key={document.id} onClick={() => handleDocumentClick(document.id)} className="flex bg-white my-2 p-3 rounded-3xl justify-between hover:bg-slate-400">
                          <div className="flex items-center gap-3 mx-2">
                            <FontAwesomeIcon icon={faLock} />
                            <p>{document.title}</p>
                          </div>
                          <p className="mx-2 text-gray-600">{document.updated_at}</p>
                        </div>
                      )) : 
                      <div className="flex text-center justify-center">
                        <div>
                          <FontAwesomeIcon className="text-2xl my-2" icon={faFile} />
                          <p>Document is empty</p>
                        </div>
                      </div>
                      }  
                    </div>
                  </div>
                </div>
                <FloatButton onClick={createNewDocument} tooltip={<div>Documents</div>} />;
              </div>
            ) : (
                <SignIns user={setUser} setLogin={setIsLogin}></SignIns>
            )}
        </div>
        </>
    )
}