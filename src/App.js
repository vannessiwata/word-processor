import { useEffect } from 'react';
import './App.css';
import WordProcessor from './WordProcessor'
import { gapi } from 'gapi-script';
import Login from './components/login';
import Logout from './components/logout';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidV4} from 'uuid';
import Home from './Home';

const clientId = "311597939342-9gm0olfshbia9ebfgv0e443oqbupuuf8.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />}>
          </Route> 
          <Route path="/documents" element={<Navigate to={`/documents/${uuidV4()}`} />} exact>
          </Route>
          <Route path="/documents/:id" element={ <WordProcessor />}>
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
