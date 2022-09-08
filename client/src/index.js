import React from 'react';
import ReactDOM from 'react-dom/client';
import { Regform } from './component/Form/Regform/Regform.jsx'
import './index.css';
import { useState } from "react";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Regform />
  </React.StrictMode>
);
