import React, { useCallback, useState, useEffect } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import './styles.css'
import Login from './components/login'
import { Modal } from 'antd';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom'

const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'font': ['Times New Roman'] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'align': [] }],
  ['image', 'blockquote'],
  ['clean'],
]

export default function WordProcessor() {
  const {id : documentId} = useParams();
  const [fileClick, setFileClick] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState({});

  console.log(user)
  const [open, setIsOpen] = useState(true);

  
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

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
      quill.setContents(document);
      quill.enable();
    })

    socket.emit('get-document', documentId);
  }, [socket, quill, documentId])

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
        toolbar: TOOLBAR_OPTIONS
      }
    });
    q.disable();
    q.setText('Loading...');
    setQuill(q);
  }, [])

  function showFileDropdown() {
    setFileClick(!fileClick);
    console.log("Pencet")
  }

  return (
    <div>
      <div className='m-5 sticky'>
        <div className='flex col-lg-12 justify-between items-center mb-4'>
          <div className='row'>
            <div className='col-lg-6'>
              <h1 className='mb-2 font-bold text-lg'>Word Processor</h1>
              <div className="flex">
                  <ul className="flex">
                      <li className="mr-4 relative">
                        <a href="#" onClick={showFileDropdown} className="text-black hover:text-blue-700">File</a>
                        {fileClick &&
                          <div className='fileDropdown'>
                              <ul className="absolute bg-white py-2 rounded-lg shadow-md mt-2 z-10" id="fileDropdown">
                                <li><a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Open</a></li>
                                <li><a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Save</a></li>
                                <li><a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Margin</a></li>
                              </ul>
                          </div>
                        }
                      </li>
                      <li className="mr-4"><a href="#" className="text-black hover:text-blue-700">Edit</a></li>
                      <li className="mr-4"><a href="#" className="text-black hover:text-blue-700">View</a></li>
                      <li className="mr-4"><a href="#" className="text-black hover:text-blue-700">Insert</a></li>
                      <li><a href="#" className="text-black hover:text-blue-700">Format</a></li>
                  </ul>
                </div>
              </div>
              </div>
              <div className='col-lg-6'>
                {!isLogin ?
                  <Modal
                    open={open}
                    onCancel={null}
                    footer={null}
                  >
                    <h1 className='mb-2'>You must login to continue editing this document!</h1>
                    <Login user={setUser} setLogin={setIsLogin}></Login>
                 </Modal>
                 : 
                  <div className="flex flex-wrap items-center justify-center gap-3 border-2 p-2 rounded-2xl border-gray-600">
                      <div className="h-10 w-10">
                          <img className="h-full w-full rounded-full object-cover object-center ring ring-white" src={user.picture} alt="profile" />
                      </div>
                      <div>
                          <div className="text-sm font-medium text-secondary-500">{user.name}</div>
                          <div className="text-xs text-secondary-400">View Profile</div>
                      </div>
                  </div>
                 }
              </div>
          </div>
          </div>
        <div className='container' ref={wrapperRef}></div>
    </div>
  )
}
