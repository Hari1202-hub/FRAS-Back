
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '../css/index.css'

// Ensure the document has light mode class only
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');

createRoot(document.getElementById("root")!).render(<App />);
