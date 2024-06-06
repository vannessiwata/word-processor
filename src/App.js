import './App.css';
import WordProcessor from './WordProcessor'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidV4} from 'uuid';
import SignIns from './SignIns';
import GoogleCallback from './Callback';
// import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './Home';
import { useEffect } from 'react';
import NotFoundPage from './NotFound';
import SignUp from './SignUp';

// const clientId = "311597939342-9gm0olfshbia9ebfgv0e443oqbupuuf8.apps.googleusercontent.com";

// function App() {
//   return (
//     <GoogleOAuthProvider clientId={clientId}>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Home />}>
//           </Route> 
//           <Route path="/documents" element={<Navigate to={`/documents/${uuidV4()}`} />} exact>
//           </Route>
//           <Route path="/documents/:id" element={ <WordProcessor />}>
//           </Route>
//         </Routes>
//       </Router>
//     </GoogleOAuthProvider>
//   );
// }

// export default App;

// useEffect(() => {
//     return <Home />
// });

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/signup" element={<SignUp />}></Route>
              <Route path="/auth/google" element={<GoogleCallback />}></Route>
              <Route path="/404" element={<NotFoundPage />}></Route>
              <Route path="/documents" element={<Navigate to={`/documents/${uuidV4()}`} />} exact>
              </Route>
              <Route path="/documents/:id" element={ <WordProcessor />}></Route>
          </Routes>
      </Router>
  );
}

export default App;