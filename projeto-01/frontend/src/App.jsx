import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Produtos from './pages/Produtos'
import Servicos from './pages/Servicos'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/servicos" element={<Servicos />} />
      </Routes>
    </BrowserRouter>
  )
}
