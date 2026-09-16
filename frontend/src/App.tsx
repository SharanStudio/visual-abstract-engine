import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InputScreen from './pages/InputScreen';
import EditorScreen from './pages/EditorScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputScreen />} />
        <Route path="/editor" element={<EditorScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
