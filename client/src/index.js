import React from 'react';
import ReactDOM from 'react-dom/client';
import { Main } from './component/Main/Main';
import { Regform } from './component/Regform/Regform.jsx'
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Regform />
  </React.StrictMode>
);
