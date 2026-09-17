import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar        from '../../components/Navbar'
import Footer        from '../../components/Footer'
import WhatsAppFloat from '../../components/WhatsAppFloat'
import Ornament       from '../../components/Ornament'
import api from '../../services/api'
import { SERVICO_IMAGENS, SERVICO_ICONES } from '../../data/servicoImagens'
import { WHATSAPP } from '../../data/config'
import { formatPrice } from '../../utils/format'

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    api.get('/servicos')
      .then(res => { if (active) setServicos(res.data) })
      .catch(() => { if (active) setError('Não foi possível carregar os serviços agora. Tente novamente em instantes.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <>
      <Navbar />

      <header className="page-header">
        <Ornament center />
        <span className="section-label">O que fazemos</span>
        <h1 className="section-title">Nossos Serviços</h1>
        <p className="section-subtitle" style={{ maxWidth: 560, margin: '0 auto' }}>
          Do planejamento à execução, cuidamos de cada detalhe para que seu evento seja exatamente como você sempre sonhou.
        </p>
        <nav className="page-header__breadcrumb" aria-label="breadcrumb">
          <Link to="/">Início</Link>
          <span>/</span>
          <span>Serviços</span>
        </nav>
      </header>

      <section className="produtos">
        <div className="container">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-brand" role="status">
                <span className="visually-hidden">Carregando serviços...</span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger text-center" role="alert">{error}</div>
          )}

          {!loading && !error && (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
              {servicos.map((s) => {
                const mensagem = `Olá! Vim pelo site e tenho interesse no serviço de ${s.nome}.`
                return (
                  <div className="col" key={s.id}>
                    <div className="card h-100 border-0 shadow-sm produto-card">
                      <div className="produto-card__image">
                        <img src={SERVICO_IMAGENS[s.nome]} className="card-img-top" alt={s.nome} loading="lazy" />
                      </div>
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <h3 className="produto-card__title h5 mb-0">
                            <span aria-hidden="true" className="me-2">{SERVICO_ICONES[s.nome]}</span>
                            {s.nome}
                          </h3>
                        </div>
                        <p className="card-text text-muted small flex-grow-1">{s.descricao}</p>
                        <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
                          <span className="produto-card__price">a partir de {formatPrice(s.preco)}</span>
                        </div>
                        <a
                          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`}
                          className="btn btn-outline-primary btn-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Solicitar Orçamento
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
