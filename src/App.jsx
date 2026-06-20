import { useMemo, useState } from 'react'

/* ============================================================
   CONFIGURATION
   ⚠️ À adapter : remplace le chemin "/api/payment/initiate" par
   la vraie route de paiement de ton backend une fois confirmée.
   ============================================================ */
const API_BASE = 'https://tiozang-paiement-campay-production.up.railway.app'
const PAYMENT_ENDPOINT = `${API_BASE}/api/payer`

/* Mot de passe simple pour l'espace vendeur (démo locale).
   À remplacer plus tard par une vraie authentification côté backend. */
const ADMIN_PASSWORD = 'tiozang2026'

/* ============================================================
   DONNÉES PRODUITS (à remplacer par un vrai catalogue / API)
   ============================================================ */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    name: '237 — Édition Capitale',
    slogan: '237',
    color: '#15120F',
    textColor: '#F2EDE2',
    basePrice: 6000,
    desc: 'Coupe régulière, coton épais, impression sérigraphiée.',
  },
  {
    id: 'p2',
    name: 'On Gère',
    slogan: 'ON GÈRE',
    color: '#E8590C',
    textColor: '#15120F',
    basePrice: 6000,
    desc: 'Orange signature TIOZANG, message direct, finition mate.',
  },
  {
    id: 'p3',
    name: 'Sans Pression',
    slogan: 'SANS\nPRESSION',
    color: '#F2EDE2',
    textColor: '#15120F',
    basePrice: 6500,
    desc: 'Fond clair, idéal pour un look propre au quotidien.',
  },
  {
    id: 'p4',
    name: 'Mboa Spirit',
    slogan: 'MBOA',
    color: '#2F6F4E',
    textColor: '#F2EDE2',
    basePrice: 6500,
    desc: 'Vert profond, pour porter le pays sur les épaules.',
  },
]

/* Paliers de prix par quantité — séquence réelle, donc numérotée */
const TIERS = [
  { min: 1, max: 4, label: '1 – 4', discount: 0 },
  { min: 5, max: 9, label: '5 – 9', discount: 0.1 },
  { min: 10, max: 19, label: '10 – 19', discount: 0.2 },
  { min: 20, max: Infinity, label: '20+', discount: 0.3 },
]

function tierFor(quantity) {
  return TIERS.find((t) => quantity >= t.min && quantity <= t.max) ?? TIERS[0]
}

function unitPrice(basePrice, quantity) {
  const tier = tierFor(quantity)
  return Math.round(basePrice * (1 - tier.discount))
}

function formatFCFA(n) {
  return `${n.toLocaleString('fr-FR')} FCFA`
}

/* ============================================================
   MOCKUP T-SHIRT EN SVG — élément signature de la marque
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
    </svg>
  )
}

/* ============================================================
   EN-TÊTE
   ============================================================ */
function Header({ cartCount, onCartClick, onAdminClick }) {
  return (
    <header className="header">
      <div className="header-inner">
        <span className="logo">TIOZANG</span>
        <nav className="header-actions">
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
      <div className="tier-row">
        {TIERS.map((t) => (
          <div className="tier-tag" key={t.label}>
            <span className="tier-qty">{t.label}</span>
            <span className="tier-discount">
              {t.discount === 0 ? 'Prix plein' : `-${Math.round(t.discount * 100)}%`}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============================================================
   CARTE PRODUIT
   ============================================================ */
function ProductCard({ product, onAdd }) {
  const [size, setSize] = useState('M')
  const [quantity, setQuantity] = useState(1)

  const price = unitPrice(product.basePrice, quantity)

  return (
    <article className="product-card">
      <TshirtMockup color={product.color} textColor={product.textColor} slogan={product.slogan} />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-desc">{product.desc}</p>

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
        <span className="price-tag">{formatFCFA(price)} / unité</span>
        <button
          className="add-btn"
          onClick={() => onAdd({ productId: product.id, size, quantity })}
        >
          Ajouter au panier
        </button>
      </div>
    </article>
  )
}

/* ============================================================
   PANIER (panneau latéral)
   ============================================================ */
function CartDrawer({ open, onClose, items, products, onRemove, onCheckout }) {
  const totalQty = items.reduce((sum, it) => sum + it.quantity, 0)

  /* Le palier s'applique par modèle, selon la quantité commandée de CE modèle */
  const total = items.reduce((sum, it) => {
    const product = products.find((p) => p.id === it.productId)
    if (!product) return sum
    return sum + unitPrice(product.basePrice, it.quantity) * it.quantity
  }, 0)

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
              const price = unitPrice(product.basePrice, it.quantity)
              return (
                <li className="cart-item" key={idx}>
                  <div>
                    <p className="cart-item-name">{product.name}</p>
                    <p className="cart-item-meta">
                      Taille {it.size} · ×{it.quantity} · {formatFCFA(price)} / unité
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
            <span>{totalQty} article{totalQty > 1 ? 's' : ''}</span>
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
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const total = items.reduce((sum, it) => {
    const product = products.find((p) => p.id === it.productId)
    if (!product) return sum
    return sum + unitPrice(product.basePrice, it.quantity) * it.quantity
  }, 0)

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
      if (!res.ok) throw new Error(`Le serveur a répondu avec le code ${res.status}`)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        'Le paiement n\'a pas pu démarrer. Vérifie la route de paiement du backend ou réessaie.',
      )
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
   ESPACE VENDEUR (démo locale, à connecter au backend plus tard)
   ============================================================ */
function AdminPanel({ open, onClose, products, setProducts }) {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [draft, setDraft] = useState({ name: '', basePrice: '', desc: '', color: '#E8590C', slogan: '' })

  if (!open) return null

  function handleLogin(e) {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) setAuthed(true)
  }

  function handleAddProduct(e) {
    e.preventDefault()
    if (!draft.name || !draft.basePrice) return
    setProducts([
      ...products,
      {
        id: `p${Date.now()}`,
        name: draft.name,
        slogan: draft.slogan || draft.name.toUpperCase(),
        color: draft.color,
        textColor: '#F2EDE2',
        basePrice: Number(draft.basePrice),
        desc: draft.desc,
      },
    ])
    setDraft({ name: '', basePrice: '', desc: '', color: '#E8590C', slogan: '' })
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
                <span>Prix unitaire (FCFA)</span>
                <input
                  required
                  type="number"
                  value={draft.basePrice}
                  onChange={(e) => setDraft({ ...draft, basePrice: e.target.value })}
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

  const cartCount = useMemo(() => cart.reduce((sum, it) => sum + it.quantity, 0), [cart])

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
        onCartClick={() => setCartOpen(true)}
        onAdminClick={() => setAdminOpen(true)}
      />

      <Hero />
      <TierBoard />

      <section id="catalogue" className="catalogue">
        <h2 className="section-title">La collection</h2>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))}
        </div>
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

      {(cartOpen || checkoutOpen || adminOpen) && (
        <div
          className="backdrop"
          onClick={() => {
            setCartOpen(false)
            setCheckoutOpen(false)
            setAdminOpen(false)
          }}
        />
      )}
    </div>
  )
}
