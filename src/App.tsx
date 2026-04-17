import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Theme = 'light' | 'dark'
type AuthStep = 'login' | 'register'
type MainPage = 'dashboard' | 'trading' | 'pera' | 'learning'
type Range = '1D' | '1W' | '1M' | '3M' | '1Y'

type Stock = {
  symbol: string
  name: string
  price: number
  change: number
  pe: number
  volume: string
  marketCap: string
  series: Record<Range, number[]>
}

const ranges: Range[] = ['1D', '1W', '1M', '3M', '1Y']

const initialStocks: Stock[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    price: 145.48,
    change: 1.2,
    pe: 75.1,
    volume: '41.2M',
    marketCap: '$3.5T',
    series: {
      '1D': [141, 142, 141.7, 142.8, 143.2, 144.1, 145.4],
      '1W': [138, 139, 140.5, 141, 142.8, 144.1, 145.4],
      '1M': [132, 133.5, 136, 138, 140.2, 143.1, 145.4],
      '3M': [120, 123, 126.4, 129, 134.1, 139.2, 145.4],
      '1Y': [84, 89.1, 93.5, 109.2, 122, 136.4, 145.4],
    },
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc',
    price: 129.12,
    change: -0.4,
    pe: 28.9,
    volume: '36.8M',
    marketCap: '$2.9T',
    series: {
      '1D': [129.8, 129.4, 130.1, 129.9, 129.6, 129.2, 129.1],
      '1W': [131.2, 130.4, 130.2, 129.7, 129.6, 129.2, 129.1],
      '1M': [126.2, 127.5, 128.4, 129.2, 129.8, 129.1, 129.1],
      '3M': [121.5, 123.8, 125.9, 127.2, 128.6, 129.3, 129.1],
      '1Y': [112.1, 114.2, 117.8, 121.3, 124.7, 127.8, 129.1],
    },
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc',
    price: 327.8,
    change: 2.6,
    pe: 66.4,
    volume: '58.7M',
    marketCap: '$1.0T',
    series: {
      '1D': [318, 320, 322, 321.2, 324, 326.1, 327.8],
      '1W': [305, 307.5, 312.1, 315.8, 320.4, 325.5, 327.8],
      '1M': [288, 292.3, 299.2, 307, 315.1, 321.2, 327.8],
      '3M': [250, 258.4, 271.2, 284.9, 297.3, 311.4, 327.8],
      '1Y': [182, 196.2, 223.4, 251.2, 279.3, 304.4, 327.8],
    },
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    price: 418.2,
    change: 0.9,
    pe: 37.3,
    volume: '22.1M',
    marketCap: '$3.1T',
    series: {
      '1D': [412, 412.5, 413.1, 414.2, 415.7, 417.4, 418.2],
      '1W': [405, 407.2, 410.1, 412.7, 414.5, 416.8, 418.2],
      '1M': [391, 395.4, 399.2, 404.1, 409.6, 414.2, 418.2],
      '3M': [365, 372.1, 381.4, 390.9, 401.2, 410.6, 418.2],
      '1Y': [314, 326.2, 347.8, 365.4, 381.7, 401.3, 418.2],
    },
  },
]

const defaultSelectedSymbol = 'TSLA'
const defaultSelectedStock = initialStocks.find((stock) => stock.symbol === defaultSelectedSymbol) ?? initialStocks[0]

const allocation = [
  { label: 'Stocks', value: 54, color: '#6366f1' },
  { label: 'Portfolios', value: 26, color: '#818cf8' },
  { label: 'PERA', value: 20, color: '#0f766e' },
]

const transactions = [
  { id: 'TX-1103', action: 'Buy', asset: 'NVDA', value: '$4,100', date: 'Today' },
  { id: 'TX-1102', action: 'PERA Contribution', asset: 'Retirement Core', value: '$800', date: 'Yesterday' },
  { id: 'TX-1101', action: 'Sell', asset: 'AAPL', value: '$2,320', date: '2 days ago' },
]

const bundles = [
  { name: 'Tech Momentum', holdings: 'NVDA, MSFT, AMD, AVGO', risk: 'High' },
  { name: 'Dividend Core', holdings: 'KO, JNJ, PG, PEP', risk: 'Low' },
  { name: 'ESG Future', holdings: 'ENPH, TSLA, NEE, VWS', risk: 'Medium' },
]

const articles = [
  { title: 'Understanding Risk and Return', level: 'Beginner', minutes: 8 },
  { title: 'How Portfolio Rebalancing Works', level: 'Intermediate', minutes: 10 },
  { title: 'Tax-Efficient PERA Strategies', level: 'Advanced', minutes: 12 },
]

const learningPaths = [
  { label: 'Beginner', progress: 78 },
  { label: 'Intermediate', progress: 42 },
  { label: 'Advanced', progress: 19 },
]

// ── PERA DATA ─────────────────────────────────────────────────────────────────

type PeraHolding = {
  fund: string
  type: string
  units: number
  navps: number
  value: number
  gain: number
}

type PeraContribMonth = {
  month: string
  amount: number
  target: number
}

type PeraFundAlloc = {
  label: string
  pct: number
  color: string
}

type PeraMilestone = {
  year: number
  label: string
  projected: number
  reached: boolean
}

const peraHoldings: PeraHolding[] = [
  { fund: 'BPI Retirement Core Fund', type: 'Balanced', units: 82340, navps: 0.6218, value: 51219.21, gain: 12.4 },
  { fund: 'BDO Equity Retirement Fund', type: 'Equity', units: 43800, navps: 0.4102, value: 17966.76, gain: 9.7 },
  { fund: 'Sun Life PERA Bond Fund', type: 'Bond', units: 19200, navps: 0.8904, value: 17095.68, gain: 4.1 },
]

const peraContribHistory: PeraContribMonth[] = [
  { month: 'Nov', amount: 800, target: 800 },
  { month: 'Dec', amount: 800, target: 800 },
  { month: 'Jan', amount: 900, target: 800 },
  { month: 'Feb', amount: 800, target: 800 },
  { month: 'Mar', amount: 900, target: 800 },
  { month: 'Apr', amount: 400, target: 800 },
]

const peraFundAlloc: PeraFundAlloc[] = [
  { label: 'Balanced', pct: 59, color: '#2dd4bf' },
  { label: 'Equity', pct: 21, color: '#34d399' },
  { label: 'Bond', pct: 20, color: '#6ee7b7' },
]

const peraMilestones: PeraMilestone[] = [
  { year: 2026, label: '₱100K PERA milestone', projected: 100000, reached: false },
  { year: 2029, label: '₱200K mark – compounding kicks in', projected: 200000, reached: false },
  { year: 2034, label: 'Half-way to target', projected: 500000, reached: false },
  { year: 2049, label: 'Full retirement target', projected: 1200000, reached: false },
]

const morningNotes = [
  { title: 'Good morning, Jordan', detail: 'US equities opened firmer with broad participation in mega-cap tech.', time: '6:45 AM' },
  { title: 'Macro watch', detail: 'Treasury yields are stable ahead of inflation guidance this afternoon.', time: '7:10 AM' },
  { title: 'Plan highlight', detail: 'Your PERA monthly contribution posts tomorrow. Current pace: 104% of target.', time: '7:28 AM' },
]

const marketBriefs = [
  { label: 'S&P 500', value: '5,349.21', change: 0.74, symbol: 'FOREXCOM:SPXUSD' },
  { label: 'NASDAQ 100', value: '18,775.40', change: 1.16, symbol: 'NASDAQ:NDX' },
  { label: 'BTC / USD', value: '$72,418', change: -0.58, symbol: 'BITSTAMP:BTCUSD' },
]

// ── ICONS ────────────────────────────────────────────────────────────────────

function SvgIcon({ children, size = 18 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function DashboardIcon() {
  return (
    <SvgIcon>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </SvgIcon>
  )
}

function TradingIcon() {
  return (
    <SvgIcon>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </SvgIcon>
  )
}

function PERAIcon() {
  return (
    <SvgIcon>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </SvgIcon>
  )
}

function LearningIcon() {
  return (
    <SvgIcon>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </SvgIcon>
  )
}

function BellIcon() {
  return (
    <SvgIcon>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </SvgIcon>
  )
}

function MoonIcon() {
  return (
    <SvgIcon size={16}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </SvgIcon>
  )
}

function SunIcon() {
  return (
    <SvgIcon size={16}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </SvgIcon>
  )
}

function ChevronDownIcon() {
  return (
    <SvgIcon size={14}>
      <polyline points="6 9 12 15 18 9" />
    </SvgIcon>
  )
}

function SignOutIcon() {
  return (
    <SvgIcon size={16}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </SvgIcon>
  )
}

function UserIcon() {
  return (
    <SvgIcon size={16}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </SvgIcon>
  )
}

// ── GEOMETRIC ART PANEL ──────────────────────────────────────────────────────

function GeometricPanel() {
  const S = 90

  return (
    <div className="auth-art-side">
      <svg
        viewBox="0 0 540 720"
        preserveAspectRatio="xMidYMid slice"
        className="auth-art-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="540" height="720" fill="#07090f" />

        {/* Cell shade variations */}
        {([[1,0],[3,0],[5,0],[0,1],[2,1],[4,1],[1,2],[3,2],[5,2],[0,3],[2,3],[4,3],[1,4],[3,4],[5,4],[0,5],[2,5],[4,5],[1,6],[3,6],[5,6],[0,7],[2,7],[4,7]] as [number,number][]).map(([c,r]) => (
          <rect key={`bg${c}${r}`} x={c*S} y={r*S} width={S} height={S} fill="#0d1117" />
        ))}

        {/* Row 0 */}
        <circle cx={0*S+S/2} cy={0*S+S/2} r={32} fill="white" />
        <polygon points={`${4*S+S/2},${0*S+12} ${4*S+S-12},${0*S+S/2} ${4*S+S/2},${0*S+S-12} ${4*S+12},${0*S+S/2}`} fill="white" />

        {/* Row 1 – dots */}
        {([0,1,2] as number[]).flatMap(r => ([0,1,2] as number[]).map(c2 => (
          <circle key={`d11${r}${c2}`} cx={1*S+22+c2*23} cy={1*S+22+r*23} r={5} fill="#4b5563" />
        )))}
        {/* half-circle top */}
        <path d={`M ${2*S+12},${1*S+S/2} A 33,33 0 0 1 ${2*S+S-12},${1*S+S/2} Z`} fill="white" />
        {/* outline circle */}
        <circle cx={5*S+S/2} cy={1*S+S/2} r={30} fill="none" stroke="#374151" strokeWidth="2.5" />

        {/* Row 2 */}
        {/* quarter arc – fills corner like in reference */}
        <path d={`M ${1*S+S/2},${2*S} A ${S/2},${S/2} 0 0 1 ${1*S+S},${2*S+S/2} L ${1*S+S/2},${2*S+S/2} Z`} fill="white" />
        <rect x={4*S+24} y={2*S+24} width={S-48} height={S-48} fill="white" />

        {/* Row 3 */}
        <circle cx={2*S+S/2} cy={3*S+S/2} r={28} fill="none" stroke="#4b5563" strokeWidth="2" />
        <circle cx={5*S+S/2} cy={3*S+S/2} r={30} fill="white" />

        {/* Row 4 */}
        <polygon points={`${0*S+S/2},${4*S+14} ${0*S+S-14},${4*S+S/2} ${0*S+S/2},${4*S+S-14} ${0*S+14},${4*S+S/2}`} fill="#6b7280" />
        {([0,1,2] as number[]).flatMap(r => ([0,1,2] as number[]).map(c2 => (
          <circle key={`d34${r}${c2}`} cx={3*S+22+c2*23} cy={4*S+22+r*23} r={5} fill="#374151" />
        )))}

        {/* Row 5 */}
        {/* half-circle bottom */}
        <path d={`M ${1*S+12},${5*S+S/2} A 33,33 0 0 0 ${1*S+S-12},${5*S+S/2} Z`} fill="white" />
        {/* quarter arc BR */}
        <path d={`M ${4*S},${5*S+S/2} A ${S/2},${S/2} 0 0 1 ${4*S+S/2},${5*S+S} L ${4*S+S/2},${5*S+S/2} Z`} fill="#6b7280" />

        {/* Row 6 */}
        {/* half-circle right */}
        <path d={`M ${3*S+S/2},${6*S+12} A 33,33 0 0 1 ${3*S+S/2},${6*S+S-12} Z`} fill="#4b5563" />
        <polygon points={`${5*S+S/2},${6*S+12} ${5*S+S-12},${6*S+S/2} ${5*S+S/2},${6*S+S-12} ${5*S+12},${6*S+S/2}`} fill="white" />

        {/* Row 7 */}
        <rect x={0*S+20} y={7*S+20} width={S-40} height={S-40} fill="white" />
        {([0,1,2] as number[]).flatMap(r => ([0,1,2] as number[]).map(c2 => (
          <circle key={`d27${r}${c2}`} cx={2*S+22+c2*23} cy={7*S+22+r*23} r={5} fill="#4b5563" />
        )))}
        <circle cx={5*S+S/2} cy={7*S+S/2} r={28} fill="none" stroke="#374151" strokeWidth="2" />

        {/* Grid lines */}
        {([1,2,3,4,5] as number[]).map(i => (
          <line key={`v${i}`} x1={i*S} y1="0" x2={i*S} y2="720" stroke="#0d1117" strokeWidth="1.5" />
        ))}
        {([1,2,3,4,5,6,7] as number[]).map(i => (
          <line key={`h${i}`} x1="0" y1={i*S} x2="540" y2={i*S} stroke="#0d1117" strokeWidth="1.5" />
        ))}

        {/* Bottom gradient fade for text legibility */}
        <defs>
          <linearGradient id="artFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="55%" stopColor="#07090f" stopOpacity="0" />
            <stop offset="100%" stopColor="#07090f" stopOpacity="0.92" />
          </linearGradient>
        </defs>
        <rect width="540" height="720" fill="url(#artFade)" />
      </svg>

      <div className="auth-art-text">
        <div className="auth-art-badge">PERA Trade</div>
        <h2>
          Modern Investing
          <br />
          for Everyone
        </h2>
        <p>Stocks, portfolios, and retirement planning — all in one place.</p>
      </div>
    </div>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function chartPath(points: number[]) {
  if (!points.length) return ''
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  return points
    .map((point, i) => {
      const x = (i / (points.length - 1 || 1)) * 100
      const y = 100 - ((point - min) / range) * 100
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function growthProjection(current: number, monthly: number, years: number, annualReturn: number) {
  const months = years * 12
  const monthlyRate = annualReturn / 12
  let value = current
  for (let i = 0; i < months; i += 1) {
    value = value * (1 + monthlyRate) + monthly
  }
  return value
}

function TradingViewWidget({ symbol, theme }: { symbol: string; theme: Theme }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.replaceChildren()
    const widgetHost = document.createElement('div')
    widgetHost.className = 'tradingview-widget-container__widget'
    container.appendChild(widgetHost)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: '60',
      timezone: 'Etc/UTC',
      theme: theme === 'dark' ? 'dark' : 'light',
      style: '1',
      locale: 'en',
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      support_host: 'https://www.tradingview.com',
    })
    container.appendChild(script)

    return () => {
      container.replaceChildren()
    }
  }, [symbol, theme])

  return (
    <div className="tradingview-widget-container tv-chart">
      <div className="tv-chart-host" ref={containerRef} />
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [authStep, setAuthStep] = useState<AuthStep>('login')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [page, setPage] = useState<MainPage>('dashboard')
  const [watchlist, setWatchlist] = useState(initialStocks)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(defaultSelectedSymbol)
  const [range, setRange] = useState<Range>('1D')
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market')
  const [orderSide, setOrderSide] = useState<'Buy' | 'Sell'>('Buy')
  const [quantity, setQuantity] = useState(10)
  const [limitPrice, setLimitPrice] = useState(defaultSelectedStock.price)
  const [monthlyContribution, setMonthlyContribution] = useState(900)
  const [annualReturn, setAnnualReturn] = useState(0.08)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dashboardSymbol, setDashboardSymbol] = useState(marketBriefs[0].symbol)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedStock = useMemo(
    () => watchlist.find((stock) => stock.symbol === selected) ?? watchlist[0],
    [selected, watchlist],
  )

  const filteredStocks = useMemo(
    () => watchlist.filter((stock) => `${stock.symbol} ${stock.name}`.toLowerCase().includes(search.toLowerCase())),
    [search, watchlist],
  )

  const estimatedOrderCost = useMemo(() => {
    const unit = orderType === 'Market' ? selectedStock.price : limitPrice || selectedStock.price
    return quantity * unit
  }, [limitPrice, orderType, quantity, selectedStock.price])

  const projected = useMemo(
    () => growthProjection(32600, monthlyContribution, 25, annualReturn),
    [annualReturn, monthlyContribution],
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setWatchlist((previous) =>
        previous.map((stock) => {
          const drift = Number(((Math.random() - 0.5) * 1.2).toFixed(2))
          const nextPrice = Number(Math.max(1, stock.price + drift).toFixed(2))
          const nextChange = Number((((nextPrice - stock.price) / stock.price) * 100).toFixed(2))
          return { ...stock, price: nextPrice, change: nextChange }
        }),
      )
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'trading', label: 'Trading', icon: <TradingIcon /> },
    { id: 'pera', label: 'PERA', icon: <PERAIcon /> },
    { id: 'learning', label: 'Learning Hub', icon: <LearningIcon /> },
  ] as const

  const pageTitle: Record<MainPage, string> = {
    dashboard: 'Dashboard',
    trading: 'Trading',
    pera: 'PERA',
    learning: 'Learning Hub',
  }

  const authView = (
    <div className="auth-root">
      <div className="auth-form-side">
        <div className="auth-logo">
          <span className="logo-mark">P</span>
          PERA Trade
        </div>

        <div className="auth-form-content">
          <div className="auth-heading">
            <h1>
              {authStep === 'login' && 'Sign in to your account'}
              {authStep === 'register' && 'Create your account'}
            </h1>
            <p>
              {authStep === 'login' && 'Please continue to sign in to your investing account'}
              {authStep === 'register' && 'Create your account in a guided, minimal flow'}
            </p>
          </div>

          <div className="auth-tabs">
            {(['login', 'register'] as AuthStep[]).map((step) => (
              <button
                key={step}
                type="button"
                className={`auth-tab ${authStep === step ? 'active' : ''}`}
                onClick={() => setAuthStep(step)}
              >
                {step === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <div className="auth-fields">
            {authStep === 'login' && (
              <>
                <div className="field-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" />
                </div>
                <div className="field-group">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setAuthed(true)}>
                  Continue
                </button>
              </>
            )}

            {authStep === 'register' && (
              <>
                <div className="two-col">
                  <div className="field-group">
                    <label>First name</label>
                    <input type="text" placeholder="Jordan" />
                  </div>
                  <div className="field-group">
                    <label>Last name</label>
                    <input type="text" placeholder="Lee" />
                  </div>
                </div>
                <div className="field-group">
                  <label>Email</label>
                  <input type="email" placeholder="name@email.com" />
                </div>
                <div className="field-group">
                  <label>Password</label>
                  <input type="password" placeholder="Minimum 8 characters" />
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setShowOnboarding(true)}>
                  Continue to onboarding
                </button>
              </>
            )}
          </div>

          <div className="auth-footer">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            </button>
          </div>
        </div>
      </div>

      <GeometricPanel />
    </div>
  )

  const onboardingView = (
    <div className="auth-root">
      <div className="auth-form-side">
        <div className="auth-logo">
          <span className="logo-mark">P</span>
          PERA Trade
        </div>

        <div className="auth-form-content">
          <div className="auth-heading">
            <h1>Set up your profile</h1>
            <p>Set your investing profile and initial setup path</p>
          </div>

          <div className="auth-fields">
            <div className="field-group">
              <label>Risk profile</label>
              <select>
                <option>Conservative</option>
                <option>Balanced</option>
                <option>Aggressive</option>
              </select>
            </div>
            <div className="field-group">
              <label>Financial goal</label>
              <select>
                <option>Capital growth</option>
                <option>Stable income</option>
                <option>Retirement planning</option>
              </select>
            </div>
            <div className="field-group">
              <label>Experience level</label>
              <select>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="field-group">
              <label>Initial setup preference</label>
              <select>
                <option>Start with Stocks</option>
                <option>Start with Portfolios</option>
                <option>Start with PERA</option>
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowOnboarding(false)
                setAuthed(true)
              }}
            >
              Finish setup
            </button>
          </div>

          <div className="auth-footer">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            </button>
          </div>
        </div>
      </div>

      <GeometricPanel />
    </div>
  )

  const dashboardView = (
    <div className="grid dashboard-grid">
      <section className="card kpi">
        <h3>Total Portfolio Value</h3>
        <strong>$1,271,962.84</strong>
        <p className="positive">+2.6% today · +$5,392.42</p>
        <div className="quick-actions">
          {['Buy', 'Sell', 'Deposit', 'Allocate to PERA'].map((action) => (
            <button key={action} type="button">
              {action}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="heading-row">
          <h3>Asset Allocation</h3>
        </div>
        {allocation.map((item) => (
          <div key={item.label} className="allocation-row">
            <span>{item.label}</span>
            <span>{item.value}%</span>
            <div className="bar-track">
              <span style={{ width: `${item.value}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </section>

      <section className="card chart-card span-2">
        <div className="heading-row">
          <h3>Live Market Chart (TradingView)</h3>
          <div className="segment slim">
            {marketBriefs.map((item) => (
              <button
                key={item.symbol}
                type="button"
                className={dashboardSymbol === item.symbol ? 'active' : ''}
                onClick={() => setDashboardSymbol(item.symbol)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <TradingViewWidget symbol={dashboardSymbol} theme={theme} />
      </section>

      <section className="card">
        <h3>Morning Notes</h3>
        <ul className="list snippet-list">
          {morningNotes.map((note) => (
            <li key={note.title}>
              <div>
                <strong>{note.title}</strong>
                <p>{note.detail}</p>
              </div>
              <small>{note.time}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Market Information</h3>
        <div className="snippet-metrics">
          {marketBriefs.map((item) => (
            <article key={item.label} className="snippet-metric">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p className={item.change >= 0 ? 'positive' : 'negative'}>
                {item.change >= 0 ? '+' : ''}
                {item.change.toFixed(2)}%
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="card snippet-spotlight span-2">
        <div className="heading-row">
          <h3>Sponsored Insight</h3>
          <button type="button" className="snippet-chip">
            Partner
          </button>
        </div>
        <h4>Emerald Core ETF Bundle</h4>
        <p>Curated income + growth basket for long-term investors looking for lower volatility and quarterly dividends.</p>
        <div className="quick-actions">
          <button type="button">View details</button>
          <button type="button">Add to watchlist</button>
        </div>
      </section>

      <section className="card">
        <div className="heading-row">
          <h3>Portfolio Performance</h3>
          <div className="segment slim">
            {ranges.map((item) => (
              <button key={item} type="button" className={range === item ? 'active' : ''} onClick={() => setRange(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart">
          <path d={chartPath(selectedStock.series[range])} />
        </svg>
      </section>

      <section className="card">
        <h3>Watchlist</h3>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Price</th>
              <th>Day</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((stock) => (
              <tr key={stock.symbol}>
                <td>{stock.symbol}</td>
                <td>${stock.price.toFixed(2)}</td>
                <td className={stock.change >= 0 ? 'positive' : 'negative'}>{stock.change.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Recent Transactions</h3>
        <ul className="list">
          {transactions.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.action}</strong>
                <p>
                  {item.asset} · {item.date}
                </p>
              </div>
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )

  const tradingView = (
    <div className="grid trading-grid">
      <section className="card span-2">
        <div className="heading-row">
          <h3>Stock Explorer</h3>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stock" />
        </div>
        <div className="stock-list">
          {filteredStocks.map((stock) => (
            <button
              key={stock.symbol}
              type="button"
              className={`stock-item ${selected === stock.symbol ? 'active' : ''}`}
              onClick={() => {
                setSelected(stock.symbol)
                setLimitPrice(stock.price)
              }}
            >
              <span>
                <strong>{stock.symbol}</strong>
                <small>{stock.name}</small>
              </span>
              <span>${stock.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>{selectedStock.name}</h3>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart">
          <path d={chartPath(selectedStock.series[range])} />
        </svg>
        <div className="metric-grid">
          <p>
            <span>P/E</span>
            <strong>{selectedStock.pe}</strong>
          </p>
          <p>
            <span>Volume</span>
            <strong>{selectedStock.volume}</strong>
          </p>
          <p>
            <span>Market Cap</span>
            <strong>{selectedStock.marketCap}</strong>
          </p>
          <p>
            <span>Price</span>
            <strong>${selectedStock.price.toFixed(2)}</strong>
          </p>
        </div>
      </section>

      <section className="card">
        <h3>Order Ticket</h3>
        <div className="segment">
          {(['Buy', 'Sell'] as const).map((item) => (
            <button key={item} type="button" onClick={() => setOrderSide(item)} className={orderSide === item ? 'active' : ''}>
              {item}
            </button>
          ))}
        </div>
        <label>
          Order type
          <select value={orderType} onChange={(event) => setOrderType(event.target.value as 'Market' | 'Limit')}>
            <option>Market</option>
            <option>Limit</option>
          </select>
        </label>
        <label>
          Quantity
          <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value) || 1)} />
        </label>
        {orderType === 'Limit' && (
          <label>
            Limit price
            <input
              type="number"
              min={0}
              step="0.01"
              value={limitPrice}
              onChange={(event) => setLimitPrice(Number(event.target.value) || selectedStock.price)}
            />
          </label>
        )}
        <p>
          Estimated cost: <strong>${estimatedOrderCost.toFixed(2)}</strong>
        </p>
        <button type="button" className="primary">
          {orderSide} {selectedStock.symbol}
        </button>
      </section>

      <section className="card span-3">
        <h3>Portfolio Bundles</h3>
        <div className="bundle-grid">
          {bundles.map((bundle) => (
            <article key={bundle.name} className="bundle">
              <h4>{bundle.name}</h4>
              <p>{bundle.holdings}</p>
              <p>Risk: {bundle.risk}</p>
              <button type="button">Invest in bundle</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )

  const totalPeraValue = peraHoldings.reduce((sum, h) => sum + h.value, 0)
  const ytdContrib = peraContribHistory.reduce((sum, m) => sum + m.amount, 0)
  const ytdTarget = peraContribHistory.reduce((sum, m) => sum + m.target, 0)
  const contribPct = Math.round((ytdContrib / ytdTarget) * 100)
  const maxContrib = Math.max(...peraContribHistory.map((m) => m.target))

  const peraView = (
    <div className="grid pera-grid">
      {/* ── KPI Summary Row ─────────────────────────────── */}
      <section className="card span-3 pera-kpi-row">
        <div className="pera-kpi">
          <span>Total PERA Value</span>
          <strong>₱{totalPeraValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          <p className="positive">+11.2% over 12 months</p>
        </div>
        <div className="pera-kpi">
          <span>YTD Contributions</span>
          <strong>₱{ytdContrib.toLocaleString()}</strong>
          <p>{contribPct}% of annual pace</p>
        </div>
        <div className="pera-kpi">
          <span>Estimated Tax Savings</span>
          <strong>₱1,184</strong>
          <p>This fiscal year</p>
        </div>
        <div className="pera-kpi">
          <span>Avg. Return (12 mo)</span>
          <strong>+8.7%</strong>
          <p>Across all funds</p>
        </div>
      </section>

      {/* ── Holdings ─────────────────────────────────────── */}
      <section className="card span-2">
        <h3>Holdings</h3>
        <table>
          <thead>
            <tr>
              <th>Fund</th>
              <th>Type</th>
              <th>Units</th>
              <th>NAVPS</th>
              <th>Value</th>
              <th>Gain</th>
            </tr>
          </thead>
          <tbody>
            {peraHoldings.map((h) => (
              <tr key={h.fund}>
                <td>{h.fund}</td>
                <td>
                  <span className={`pera-fund-badge pera-fund-badge--${h.type.toLowerCase()}`}>{h.type}</span>
                </td>
                <td>{h.units.toLocaleString()}</td>
                <td>₱{h.navps.toFixed(4)}</td>
                <td>₱{h.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className={h.gain >= 0 ? 'positive' : 'negative'}>+{h.gain}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Fund Allocation ───────────────────────────────── */}
      <section className="card">
        <h3>Fund Allocation</h3>
        {peraFundAlloc.map((item) => (
          <div key={item.label} className="allocation-row">
            <span>{item.label}</span>
            <span>{item.pct}%</span>
            <div className="bar-track">
              <span style={{ width: `${item.pct}%`, background: item.color }} />
            </div>
          </div>
        ))}
        <label>
          Rebalance profile
          <select>
            <option>Balanced (current)</option>
            <option>Conservative – more bonds</option>
            <option>Growth – more equity</option>
          </select>
        </label>
        <button type="button" className="primary">
          Apply rebalance
        </button>
      </section>

      {/* ── Contribution History ──────────────────────────── */}
      <section className="card">
        <div className="heading-row">
          <h3>Contribution History</h3>
          <span className="pera-pace-badge">{contribPct}% of pace</span>
        </div>
        <div className="pera-contrib-bars">
          {peraContribHistory.map((m) => (
            <div key={m.month} className="pera-contrib-col">
              <div className="pera-bar-wrap">
                <div
                  className="pera-bar"
                  style={{ height: `${(m.amount / maxContrib) * 100}%` }}
                  title={`₱${m.amount}`}
                />
              </div>
              <span>{m.month}</span>
            </div>
          ))}
        </div>
        <label>
          Monthly contribution target
          <input
            type="number"
            min={0}
            value={monthlyContribution}
            onChange={(event) => setMonthlyContribution(Number(event.target.value) || 0)}
          />
        </label>
      </section>

      {/* ── Growth Chart ─────────────────────────────────── */}
      <section className="card span-2 chart-card">
        <div className="heading-row">
          <h3>Portfolio Growth Over Time</h3>
          <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            Annual return %
            <input
              type="number"
              min={1}
              max={18}
              step="0.5"
              style={{ width: 72 }}
              value={(annualReturn * 100).toFixed(1)}
              onChange={(event) => setAnnualReturn(Math.max(0.01, Number(event.target.value) / 100))}
            />
          </label>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart">
          <path d={chartPath([12, 13, 14, 15.5, 17.2, 18.6, 20.3, 23.1, 24.8, 27.4, 29.1, 32])} />
        </svg>
      </section>

      {/* ── Retirement Projection ────────────────────────── */}
      <section className="card">
        <h3>Retirement Projection</h3>
        <div className="pera-kpi" style={{ paddingBottom: 4 }}>
          <span>Estimated at retirement</span>
          <strong>₱{projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          <p>Based on ₱{monthlyContribution}/mo · {(annualReturn * 100).toFixed(1)}% return · 25 yr</p>
        </div>
        <ul className="list">
          {peraMilestones.map((m) => (
            <li key={m.year} className={m.reached ? 'pera-milestone--done' : ''}>
              <div>
                <strong>{m.label}</strong>
                <p>{m.year} · ₱{m.projected.toLocaleString()}</p>
              </div>
              <span className={`pera-milestone-badge ${m.reached ? 'pera-milestone-badge--done' : ''}`}>
                {m.reached ? 'Reached' : 'Upcoming'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Tax Advantages ───────────────────────────────── */}
      <section className="card span-2">
        <h3>Tax Advantages</h3>
        <div className="pera-tax-grid">
          <article className="pera-tax-card">
            <strong>Tax-deferred growth</strong>
            <p>Investment returns compound annually without income tax drag, letting gains build on gains over decades.</p>
          </article>
          <article className="pera-tax-card">
            <strong>Contribution incentive</strong>
            <p>Estimated savings this year: ₱1,184. Your contributions reduce your taxable income by your effective rate.</p>
          </article>
          <article className="pera-tax-card">
            <strong>Tax-free withdrawal</strong>
            <p>Qualified withdrawals at retirement are 100% tax-free, unlike regular investment accounts.</p>
          </article>
          <article className="pera-tax-card">
            <strong>Lifetime limit: ₱200K / year</strong>
            <p>Maximize contributions to the annual limit to capture the full government incentive package.</p>
          </article>
        </div>
      </section>
    </div>
  )

  const learningView = (
    <div className="grid learning-grid">
      <section className="card span-2">
        <h3>Learning Paths</h3>
        {learningPaths.map((path) => (
          <div key={path.label} className="allocation-row">
            <span>{path.label}</span>
            <span>{path.progress}%</span>
            <div className="bar-track">
              <span style={{ width: `${path.progress}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Quick Quiz</h3>
        <p>Why is diversification important?</p>
        <div className="radio-group">
          {[
            'It reduces concentration risk',
            'It guarantees higher returns',
            'It removes market volatility',
          ].map((item) => (
            <label key={item}>
              <input
                type="radio"
                name="quiz"
                value={item}
                checked={quizAnswer === item}
                onChange={(event) => setQuizAnswer(event.target.value)}
              />
              {item}
            </label>
          ))}
        </div>
        {quizAnswer && (
          <p className={quizAnswer.startsWith('It reduces') ? 'positive' : 'negative'}>
            {quizAnswer.startsWith('It reduces') ? 'Correct: diversification helps balance portfolio risk.' : 'Try again: focus on risk control.'}
          </p>
        )}
      </section>

      <section className="card span-3">
        <h3>Articles & Guides</h3>
        <div className="bundle-grid">
          {articles.map((article) => (
            <article key={article.title} className="bundle">
              <h4>{article.title}</h4>
              <p>{article.level}</p>
              <p>{article.minutes} min read</p>
              <button type="button">Open guide</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )

  if (!authed) {
    return showOnboarding ? onboardingView : authView
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">P</span>
          PERA Trade
        </div>
        <nav className="sidebar-nav">
          {mainNav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="app-header">
          <div className="header-left">
            <h2>{pageTitle[page]}</h2>
            <p>Data-first interface for stocks, portfolios, and retirement planning.</p>
          </div>
          <div className="header-right">
            <button type="button" className="icon-btn" aria-label="Notifications">
              <BellIcon />
              <span className="notif-badge">3</span>
            </button>
            <div className="avatar-dropdown-wrapper" ref={dropdownRef}>
              <button type="button" className="avatar-btn" onClick={() => setDropdownOpen((v) => !v)}>
                <div className="avatar">JL</div>
                <span>Jordan Lee</span>
                <ChevronDownIcon />
              </button>
              {dropdownOpen && (
                <div className="avatar-dropdown">
                  <div className="dropdown-header">
                    <strong>Jordan Lee</strong>
                    <span>jordan@email.com</span>
                  </div>
                  <button type="button" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <UserIcon />
                    Profile
                  </button>
                  <button
                    type="button"
                    className="dropdown-item danger"
                    onClick={() => {
                      setAuthed(false)
                      setShowOnboarding(false)
                      setAuthStep('login')
                      setDropdownOpen(false)
                    }}
                  >
                    <SignOutIcon />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          {page === 'dashboard' && dashboardView}
          {page === 'trading' && tradingView}
          {page === 'pera' && peraView}
          {page === 'learning' && learningView}
        </div>
      </div>
    </div>
  )
}

export default App
