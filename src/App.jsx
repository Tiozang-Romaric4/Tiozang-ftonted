import { useMemo, useState } from 'react'

/* ============================================================
   CONFIGURATION
   ============================================================ */
const API_BASE = 'https://tiozang-paiement-campay-production.up.railway.app'
const PAYMENT_ENDPOINT = `${API_BASE}/api/payer`

const ADMIN_PASSWORD = 'tiozang2026'

/* Numéro WhatsApp Business pour les demandes de devis.
   ⚠️ Remplace ce numéro par le tien (format: 237XXXXXXXXX, sans le +) */
const WHATSAPP_NUMBER = '237600000000'

/* ============================================================
   DONNÉES PRODUITS
   ============================================================ */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    name: '237 — Édition Capitale',
    slogan: '237',
    color: '#15120F',
    textColor: '#F2EDE2',
    desc: 'Coupe régulière, coton épais, impression sérigraphiée.',
  },
  {
    id: 'p2',
    name: 'On Gère',
    slogan: 'ON GÈRE',
    color: '#E8590C',
    textColor: '#15120F',
    desc: 'Orange signature TIOZANG, message direct, finition mate.',
  },
  {
    id: 'p3',
    name: 'Sans Pression',
    slogan: 'SANS\nPRESSION',
    color: '#F2EDE2',
    textColor: '#15120F',
    desc: 'Fond clair, idéal pour un look propre au quotidien.',
  },
  {
    id: 'p4',
    name: 'Mboa Spirit',
    slogan: 'MBOA',
    color: '#2F6F4E',
    textColor: '#F2EDE2',
    desc: 'Vert profond, pour porter le pays sur les épaules.',
  },
]

const TIERS = [
  { min: 1, max: 2, label: '1 – 2', price: 4500 },
  { min: 3, max: 5, label: '3 – 5', price: 4000 },
  { min: 6, max: 9, label: '6 – 9', price: 3800 },
  { min: 10, max: Infinity, label: '10+', price: 3600 },
]

function tierFor(quantity) {
  return TIERS.find((t) => quantity >= t.min && quantity <= t.max) ?? TIERS[0]
}

function globalUnitPrice(totalQuantity) {
  if (totalQuantity <= 0) return TIERS[0].price
  return tierFor(totalQuantity).price
}

function formatFCFA(n) {
  return `${n.toLocaleString('fr-FR')} FCFA`
}

const MIN_PRICE = TIERS[TIERS.length - 1].price
const MAX_PRICE = TIERS[0].price

/* ============================================================
   MOCKUP T-SHIRT EN SVG
   ============================================================ */
function TshirtMockup({ color, textColor, slogan }) {
  const lines = slogan.split('\n')
  return (
    <svg viewBox="0 0 200 220" className="tee-svg" role="img" aria-label={`T-shirt ${slogan}`}>
      <path
        d="M60 10 L100 28 L140 10 L182 38 L160 74 L138 60 L138 200 C138 206 134 210 128 210 L72 210
           C66 210 62 206 62 200 L62 60 L40 74 L18 38 Z"
        fill={color}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />
      <text
        x="100"
        y={lines.length > 1 ? 118 : 124}
        textAnchor="middle"
        fontFamily="Anton, sans-serif"
        fontSize="18"
        fill={textColor}
        letterSpacing="1"
      >
        {lines.map((line, i) => (
          <tspan key={i} x="100" dy={i === 0 ? 0 : 20}>
            {line}
          </tspan>
        ))}
      </text>
      {/* Signature TIOZANG, très discrète, en bas */}
      <text
        x="100"
        y="196"
        textAnchor="middle"
        fontFamily="Montserrat, sans-serif"
        fontWeight="700"
        fontSize="4.5"
        letterSpacing="1.5"
        fill={textColor}
        opacity="0.55"
      >
        TIOZANG
      </text>
    </svg>
  )
}

/* ============================================================
   EN-TÊTE
   ============================================================ */
function Header({ cartCount, query, onQueryChange, onCartClick, onAdminClick, onQuoteClick }) {
  return (
    <header className="header">
      <div className="header-inner">
        <span className="logo">TIOZANG</span>

        <div className="header-search">
          <input
            type="search"
            placeholder="Rechercher un modèle…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Rechercher un modèle de t-shirt"
          />
        </div>

        <nav className="header-actions">
          <button className="link-btn" onClick={onQuoteClick}>
            Demander un devis
          </button>
          <button className="link-btn" onClick={onAdminClick}>
            Espace vendeur
          </button>
          <button className="cart-btn" onClick={onCartClick} aria-label="Ouvrir le panier">
            Panier
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  )
}

/* ============================================================
   BADGES DE CONFIANCE
   ============================================================ */
function TrustBadges() {
  const badges = [
    { icon: '🔒', text: 'Paiement sécurisé Mobile Money' },
    { icon: '✅', text: 'Vendeur vérifié TIOZANG' },
    { icon: '🇨🇲', text: 'Imprimé au Cameroun' },
  ]
  return (
    <section className="trust-badges" aria-label="Garanties">
      {badges.map((b) => (
        <span className="trust-badge" key={b.text}>
          <span aria-hidden="true">{b.icon}</span> {b.text}
        </span>
      ))}
    </section>
  )
}

/* ============================================================
   HERO
   ============================================================ */
function Hero() {
  return (
    <section className="hero">
      <h1>
        PORTE TON
        <br />
        MESSAGE.
      </h1>
      <p className="hero-sub">
        T-shirts imprimés à la commande. Plus tu en prends, moins tu payes — paiement direct par
        Mobile Money.
      </p>
      <a href="#catalogue" className="cta-btn">
        Voir la collection
      </a>
    </section>
  )
}

/* ============================================================
   TABLEAU DES PALIERS
   ============================================================ */
function TierBoard() {
  return (
    <section className="tier-board" aria-label="Grille tarifaire par quantité">
      <h2 className="section-title">Le prix baisse, la quantité monte</h2>
      <p className="hero-sub">
        Le palier s'applique sur le total de t-shirts dans ton panier, tous modèles confondus.
      </p>
      <div className="tier-row">
        {TIERS.map((t) => (
          <div className="tier-tag" key={t.label}>
            <span className="tier-qty">{t.label}</span>
            <span className="tier-discount">{formatFCFA(t.price)} / unité</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============================================================
   FILTRE PAR COULEUR
   ============================================================ */
function FilterBar({ colors, activeColor, onSelect }) {
  return (
    <div className="filter-bar" role="group" aria-label="Filtrer par couleur">
      <button
        className={`filter-chip ${activeColor === null ? 'filter-chip-active' : ''}`}
        onClick={() => onSelect(null)}
      >
        Tous les modèles
      </button>
      {colors.map((c) => (
        <button
          key={c}
          className={`filter-chip ${activeColor === c ? 'filter-chip-active' : ''}`}
          onClick={() => onSelect(c)}
        >
          <span className="filter-swatch" style={{ background: c }} />
        </button>
      ))}
    </div>
  )
}

/* ============================================================
   CARTE PRODUIT
   ============================================================ */
function ProductCard({ product, onAdd, cartCount }) {
  const [size, setSize] = useState('M')
  const [quantity, setQuantity] = useState(1)

  const previewPrice = globalUnitPrice(cartCount + quantity)

  return (
    <article className="product-card">
      <TshirtMockup color={product.color} textColor={product.textColor} slogan={product.slogan} />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-desc">{product.desc}</p>

      <p className="price-range">
        {formatFCFA(MIN_PRICE)} – {formatFCFA(MAX_PRICE)} / unité
      </p>

      <div className="product-controls">
        <label className="field">
          <span>Taille</span>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Quantité</span>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
      </div>

      <div className="product-price-row">
        <span className="price-tag">{formatFCFA(previewPrice)} / unité*</span>
        <button
          className="add-btn"
          onClick={() => onAdd({ productId: product.id, size, quantity })}
        >
          Ajouter au panier
        </button>
      </div>
      <p className="product-desc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>
        *Prix estimé si ajouté maintenant — recalculé sur le total réel de ton panier.
      </p>
    </article>
  )
}

/* ============================================================
   PANIER (panneau latéral)
   ============================================================ */
function CartDrawer({ open, onClose, items, products, onRemove, onCheckout }) {
  const totalQty = items.reduce((sum, it) => sum + it.quantity, 0)
  const unitPrice = globalUnitPrice(totalQty)
  const total = unitPrice * totalQty

  return (
    <div className={`drawer ${open ? 'drawer-open' : ''}`} aria-hidden={!open}>
      <div className="drawer-header">
        <h2>Ton panier</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Fermer le panier">
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Ton panier est vide pour l'instant. Choisis un modèle dans la collection.</p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((it, idx) => {
              const product = products.find((p) => p.id === it.productId)
              if (!product) return null
              return (
                <li className="cart-item" key={idx}>
                  <div>
                    <p className="cart-item-name">{product.name}</p>
                    <p className="cart-item-meta">
                      Taille {it.size} · ×{it.quantity} · {formatFCFA(unitPrice)} / unité
                    </p>
                  </div>
                  <button className="link-btn" onClick={() => onRemove(idx)}>
                    Retirer
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="cart-summary">
            <span>{totalQty} article{totalQty > 1 ? 's' : ''} · {formatFCFA(unitPrice)}/unité</span>
            <span className="cart-total">{formatFCFA(total)}</span>
          </div>
          <button className="cta-btn cta-full" onClick={onCheckout}>
            Passer au paiement
          </button>
        </>
      )}
    </div>
  )
}

/* ============================================================
   PAIEMENT
   ============================================================ */
function CheckoutPanel({ open, onClose, items, products }) {
  const [form, setForm] = useState({ name: '', phone: '', operator: 'MTN', city: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const totalQty = items.reduce((sum, it) => sum + it.quantity, 0)
  const unitPrice = globalUnitPrice(totalQty)
  const total = unitPrice * totalQty

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch(PAYMENT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          phone: form.phone,
          orderId: `TIOZANG-${Date.now()}`,
          customerName: form.name,
          city: form.city,
          items,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const detail =
          data?.error?.detail ||
          data?.error?.message ||
          (data?.error ? JSON.stringify(data.error) : `Code ${res.status}`)
        throw new Error(detail)
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || "Le paiement n'a pas pu démarrer. Réessaie.")
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        {status === 'success' ? (
          <div className="status-block status-success">
            <h2>Paiement initié</h2>
            <p>Une demande de paiement Mobile Money a été envoyée. Confirme-la sur ton téléphone.</p>
            <button className="cta-btn" onClick={onClose}>
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>Finaliser la commande</h2>
            <p className="checkout-total">{formatFCFA(total)}</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '-0.5rem' }}>
              {totalQty} t-shirt{totalQty > 1 ? 's' : ''} × {formatFCFA(unitPrice)}
            </p>

            <label className="field">
              <span>Nom complet</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Ville</span>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Opérateur Mobile Money</span>
              <select
                value={form.operator}
                onChange={(e) => setForm({ ...form, operator: e.target.value })}
              >
                <option value="MTN">MTN Mobile Money</option>
                <option value="ORANGE">Orange Money</option>
              </select>
            </label>

            <label className="field">
              <span>Numéro Mobile Money</span>
              <input
                required
                type="tel"
                placeholder="6XXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>

            {status === 'error' && <p className="error-text">{errorMsg}</p>}

            <button className="cta-btn cta-full" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Envoi en cours…' : 'Payer maintenant'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   DEMANDE DE DEVIS
   ============================================================ */
function QuoteModal({ open, onClose, products }) {
  const [form, setForm] = useState({ name: '', phone: '', productId: '', quantity: 10, message: '' })

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    const product = products.find((p) => p.id === form.productId)
    const lines = [
      `Bonjour TIOZANG, je souhaite un devis :`,
      `Nom : ${form.name}`,
      `Téléphone : ${form.phone}`,
      product ? `Modèle souhaité : ${product.name}` : null,
      `Quantité estimée : ${form.quantity}`,
      form.message ? `Message : ${form.message}` : null,
    ].filter(Boolean)

    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
    onClose()
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>
        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Demander un devis</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '-0.5rem' }}>
            Pour une grosse commande ou une demande spéciale — on te répond directement sur WhatsApp.
          </p>

          <label className="field">
            <span>Nom complet</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="field">
            <span>Téléphone</span>
            <input
              required
              type="tel"
              placeholder="6XXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>

          <label className="field">
            <span>Modèle souhaité (optionnel)</span>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            >
              <option value="">— Choisir un modèle —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Quantité estimée</span>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>

          <label className="field">
            <span>Message (optionnel)</span>
            <input
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>

          <button className="cta-btn cta-full" type="submit">
            Envoyer sur WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}

/* ============================================================
   ESPACE VENDEUR
   ============================================================ */
function AdminPanel({ open, onClose, products, setProducts }) {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [draft, setDraft] = useState({ name: '', desc: '', color: '#E8590C', slogan: '' })

  if (!open) return null

  function handleLogin(e) {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) setAuthed(true)
  }

  function handleAddProduct(e) {
    e.preventDefault()
    if (!draft.name) return
    setProducts([
      ...products,
      {
        id: `p${Date.now()}`,
        name: draft.name,
        slogan: draft.slogan || draft.name.toUpperCase(),
        color: draft.color,
        textColor: '#F2EDE2',
        desc: draft.desc,
      },
    ])
    setDraft({ name: '', desc: '', color: '#E8590C', slogan: '' })
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        {!authed ? (
          <form onSubmit={handleLogin} className="checkout-form">
            <h2>Espace vendeur</h2>
            <label className="field">
              <span>Mot de passe</span>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoFocus
              />
            </label>
            <button className="cta-btn cta-full" type="submit">
              Entrer
            </button>
          </form>
        ) : (
          <div className="admin-content">
            <h2>Ajouter un modèle</h2>
            <form onSubmit={handleAddProduct} className="checkout-form">
              <label className="field">
                <span>Nom du modèle</span>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Texte imprimé</span>
                <input
                  value={draft.slogan}
                  onChange={(e) => setDraft({ ...draft, slogan: e.target.value })}
                  placeholder="Laisse vide pour reprendre le nom"
                />
              </label>
              <label className="field">
                <span>Couleur</span>
                <input
                  type="color"
                  value={draft.color}
                  onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Description</span>
                <input
                  value={draft.desc}
                  onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                />
              </label>
              <button className="cta-btn cta-full" type="submit">
                Ajouter à la collection
              </button>
            </form>

            <p className="admin-note">
              ⚠️ Pour l'instant ces modèles ne sont visibles que sur cet appareil — ils seront
              perdus au rechargement. La prochaine étape sera de connecter cet espace au backend.
              Le prix n'est plus défini par modèle : il dépend du total de t-shirts commandés.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeColor, setActiveColor] = useState(null)

  const cartCount = useMemo(() => cart.reduce((sum, it) => sum + it.quantity, 0), [cart])

  const colors = useMemo(() => Array.from(new Set(products.map((p) => p.color))), [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery =
        query.trim() === '' ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.slogan.toLowerCase().includes(query.toLowerCase())
      const matchesColor = activeColor === null || p.color === activeColor
      return matchesQuery && matchesColor
    })
  }, [products, query, activeColor])

  function addToCart(item) {
    setCart([...cart, item])
    setCartOpen(true)
  }

  function removeFromCart(idx) {
    setCart(cart.filter((_, i) => i !== idx))
  }

  return (
    <div className="app">
      <Header
        cartCount={cartCount}
        query={query}
        onQueryChange={setQuery}
        onCartClick={() => setCartOpen(true)}
        onAdminClick={() => setAdminOpen(true)}
        onQuoteClick={() => setQuoteOpen(true)}
      />

      <Hero />
      <TrustBadges />
      <TierBoard />

      <section id="catalogue" className="catalogue">
        <h2 className="section-title">La collection</h2>
        <FilterBar colors={colors} activeColor={activeColor} onSelect={setActiveColor} />

        {filteredProducts.length === 0 ? (
          <p className="empty-state">Aucun modèle ne correspond à ta recherche.</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} cartCount={cartCount} />
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <span>TIOZANG — imprimé au Cameroun.</span>
      </footer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        products={products}
        onRemove={removeFromCart}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutPanel
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cart}
        products={products}
      />

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        setProducts={setProducts}
      />

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} products={products} />

      {(cartOpen || checkoutOpen || adminOpen || quoteOpen) && (
        <div
          className="backdrop"
          onClick={() => {
            setCartOpen(false)
            setCheckoutOpen(false)
            setAdminOpen(false)
            setQuoteOpen(false)
          }}
        />
      )}
    </div>
  )
}
