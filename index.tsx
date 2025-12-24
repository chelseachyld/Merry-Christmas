// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 获取 root 容器
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find root element");
}
