import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const formatarPreco = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function App() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/produtos/categorias`)
      .then((res) => (res.ok ? res.json() : []))
      .then((dados) => setCategorias(Array.isArray(dados) ? dados : []))
      .catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    if (categoria) params.set('categoria', categoria)

    fetch(`${API_URL}/produtos?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((dados) => {
        setProdutos(Array.isArray(dados) ? dados : [])
        setErro('')
      })
      .catch(() => setErro('Não foi possível carregar os produtos. A API está rodando?'))
      .finally(() => setCarregando(false))
  }, [busca, categoria])

  return (
    <main>
      <h1>Lojinha</h1>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => {
            setCarregando(true)
            setBusca(e.target.value)
          }}
        />
        <select
          value={categoria}
          onChange={(e) => {
            setCarregando(true)
            setCategoria(e.target.value)
          }}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {!erro && carregando && <p>Carregando...</p>}
      {!erro && !carregando && produtos.length === 0 && <p>Nenhum produto encontrado.</p>}

      <ul className="produtos">
        {produtos.map((p) => (
          <li key={p.id}>
            <span className="categoria">{p.categoria}</span>
            <h2>{p.nome}</h2>
            <p>{p.descricao}</p>
            <strong>{formatarPreco(p.preco)}</strong>
            <small>Estoque: {p.estoque}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
