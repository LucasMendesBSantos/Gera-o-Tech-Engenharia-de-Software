import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar        from '../../components/Navbar'
import Footer        from '../../components/Footer'
import WhatsAppFloat from '../../components/WhatsAppFloat'
import Ornament       from '../../components/Ornament'
import api from '../../services/api'
import { PRODUTO_IMAGENS } from '../../data/produtoImagens'
import { WHATSAPP } from '../../data/config'
import { formatPrice } from '../../utils/format'

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    api.get('/produtos')
      .then(res => { if (active) setProdutos(res.data) })
      .catch(() => { if (active) setError('Não foi possível carregar os produtos agora. Tente novamente em instantes.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <>
      <Navbar />

      <header className="page-header">
        <Ornament center />
        <span className="section-label">Nossa Loja</span>
        <h1 className="section-title">Produtos para sua Festa</h1>
        <p className="section-subtitle" style={{ maxWidth: 560, margin: '0 auto' }}>
          Itens essenciais para completar a decoração e o buffet do seu evento, com a qualidade que sua celebração merece.
        </p>
        <nav className="page-header__breadcrumb" aria-label="breadcrumb">
          <Link to="/">Início</Link>
          <span>/</span>
          <span>Produtos</span>
        </nav>
      </header>

      <section className="produtos">
        <div className="container">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-brand" role="status">
                <span className="visually-hidden">Carregando produtos...</span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger text-center" role="alert">{error}</div>
          )}

          {!loading && !error && (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
              {produtos.map((p) => {
                const mensagem = `Olá! Vim pelo site e tenho interesse em: ${p.nome}.`
                return (
                  <div className="col" key={p.id}>
                    <div className="card h-100 border-0 shadow-sm produto-card">
                      <div className="produto-card__image">
                        <img src={PRODUTO_IMAGENS[p.nome]} className="card-img-top" alt={p.nome} loading="lazy" />
                      </div>
                      <div className="card-body d-flex flex-column">
                        {p.categoria && <span className="produto-card__categoria">{p.categoria}</span>}
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <h3 className="produto-card__title h5 mb-0">{p.nome}</h3>
                        </div>
                        {p.marca && <span className="badge text-bg-brand mb-2 align-self-start">{p.marca}</span>}
                        <p className="card-text text-muted small flex-grow-1">{p.descricao}</p>
                        <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
                          <span className="produto-card__price">{formatPrice(p.preco)}</span>
                        </div>
                        <a
                          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`}
                          className="btn btn-outline-primary btn-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Peça pelo WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
