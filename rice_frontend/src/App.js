// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateInspection from './components/CreateInspection';
import Result from './components/Result';
import EditResult from './components/EditResult';
import History from './components/History';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<History />} />
        <Route path="/create-inspection" element={<CreateInspection />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/edit/:id" element={<EditResult />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
