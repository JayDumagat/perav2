import { useEffect, useMemo, useState } from 'react'
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
  { label: 'Stocks', value: 54, color: '#1d4ed8' },
  { label: 'Portfolios', value: 26, color: '#475569' },
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

function App() {
  const [theme, setTheme] = useState<Theme>('light')
  const [authStep, setAuthStep] = useState<AuthStep>('login')
  const [onboardingStep, setOnboardingStep] = useState(false)
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

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'trading', label: 'Trading' },
    { id: 'pera', label: 'PERA' },
    { id: 'learning', label: 'Learning Hub' },
  ] as const

  const authView = (
    <div className="auth-shell">
      <aside className="auth-panel">
        <h1>PERA Trade</h1>
        <p>Secure investing in stocks, bundled portfolios, and retirement accounts.</p>
        <div className="segment">
          {(['login', 'register'] as AuthStep[]).map((step) => (
            <button
              key={step}
              className={authStep === step ? 'active' : ''}
              onClick={() => setAuthStep(step)}
              type="button"
            >
              {step[0].toUpperCase() + step.slice(1)}
            </button>
          ))}
        </div>
      </aside>

      <section className="card auth-card">
        {authStep === 'login' && (
          <>
            <h2>Login</h2>
            <p>Use secure credentials to access your account.</p>
            <label>
              Email
              <input type="email" placeholder="name@email.com" />
            </label>
            <label>
              Password
              <input type="password" placeholder="••••••••" />
            </label>
            <button type="button" className="primary" onClick={() => setAuthed(true)}>
              Sign in
            </button>
          </>
        )}

        {authStep === 'register' && (
          <>
            <h2>Registration</h2>
            <p>Create your account in a guided, minimal flow.</p>
            <div className="two-col">
              <label>
                First name
                <input type="text" placeholder="Jordan" />
              </label>
              <label>
                Last name
                <input type="text" placeholder="Lee" />
              </label>
            </div>
            <label>
              Email
              <input type="email" placeholder="name@email.com" />
            </label>
            <label>
              Password
              <input type="password" placeholder="Minimum 8 characters" />
            </label>
            <button type="button" className="primary" onClick={() => setOnboardingStep(true)}>
              Continue to onboarding
            </button>
          </>
        )}
      </section>
    </div>
  )

  const onboardingView = (
    <section className="card auth-card">
      <h2>Onboarding</h2>
      <p>Set your investing profile and initial setup path.</p>
      <label>
        Risk profile
        <select>
          <option>Conservative</option>
          <option>Balanced</option>
          <option>Aggressive</option>
        </select>
      </label>
      <label>
        Financial goal
        <select>
          <option>Capital growth</option>
          <option>Stable income</option>
          <option>Retirement planning</option>
        </select>
      </label>
      <label>
        Experience level
        <select>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </label>
      <label>
        Initial setup preference
        <select>
          <option>Start with Stocks</option>
          <option>Start with Portfolios</option>
          <option>Start with PERA</option>
        </select>
      </label>
      <button
        type="button"
        className="primary"
        onClick={() => {
          setOnboardingStep(false)
          setAuthed(true)
        }}
      >
        Finish setup
      </button>
    </section>
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

  const peraView = (
    <div className="grid pera-grid">
      <section className="card">
        <h3>PERA Contributions</h3>
        <p>
          YTD Contributions <strong>$9,600</strong>
        </p>
        <p>
          Current PERA Value <strong>$86,400</strong>
        </p>
        <p className="positive">+11.2% over 12 months</p>
      </section>

      <section className="card span-2">
        <h3>Growth Over Time</h3>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart">
          <path d={chartPath([12, 13, 14, 15.5, 17.2, 18.6, 20.3, 23.1, 24.8, 27.4, 29.1, 32])} />
        </svg>
      </section>

      <section className="card">
        <h3>Tax Advantages</h3>
        <ul className="list">
          <li>
            <div>
              <strong>Tax-deferred growth</strong>
              <p>Compounding without annual tax drag.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Contribution incentive</strong>
              <p>Estimated tax savings this year: $1,184.</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="card">
        <h3>Allocation Management</h3>
        <label>
          Auto-allocation profile
          <select>
            <option>Balanced (from onboarding risk profile)</option>
            <option>Conservative</option>
            <option>Growth</option>
          </select>
        </label>
        <label>
          Monthly contribution
          <input
            type="number"
            min={0}
            value={monthlyContribution}
            onChange={(event) => setMonthlyContribution(Number(event.target.value) || 0)}
          />
        </label>
        <label>
          Expected annual return (%)
          <input
            type="number"
            min={1}
            max={18}
            step="0.5"
            value={(annualReturn * 100).toFixed(1)}
            onChange={(event) => setAnnualReturn(Math.max(0.01, Number(event.target.value) / 100))}
          />
        </label>
        <button type="button" className="primary">
          Save recurring contribution
        </button>
      </section>

      <section className="card span-2">
        <h3>Retirement Projection</h3>
        <p>
          Estimated value at retirement: <strong>${projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
        </p>
        <p>Based on current balance, monthly contribution, and expected return assumptions.</p>
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
    return (
      <div className="app-shell">
        <header className="topbar">
          <p>Modern PERA and Trading Platform</p>
          <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </header>
        {onboardingStep ? onboardingView : authView}
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>PERA Trade</h1>
        <nav>
          {mainNav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={page === item.id ? 'active' : ''}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            setAuthed(false)
            setOnboardingStep(false)
            setAuthStep('login')
          }}
        >
          Sign out
        </button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h2>{page === 'learning' ? 'Learning Hub' : page.toUpperCase()}</h2>
            <p>Data-first interface for stocks, portfolios, and retirement planning.</p>
          </div>
          <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </header>

        {page === 'dashboard' && dashboardView}
        {page === 'trading' && tradingView}
        {page === 'pera' && peraView}
        {page === 'learning' && learningView}
      </main>
    </div>
  )
}

export default App
