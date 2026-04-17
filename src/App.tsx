import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import './App.css'

type Theme = 'light' | 'dark'
type AuthStep = 'login' | 'register'
type MainPage = 'dashboard' | 'trading' | 'pera' | 'learning'
type Range = '1D' | '1W' | '1M' | '3M' | '1Y'
type DashboardRange = '1M' | '6M' | '1Y' | 'All'
type DashboardAccountFilter = 'All' | 'Trading' | 'PERA'
type SponsoredContent = {
  title: string
  sponsor: string
  summary: string
  cta: string
  badge: string
  footnote: string
}
type DashboardActivity = {
  id: string
  action: string
  account: string
  time: string
  amount: number
  direction: 'in' | 'out'
}

function parseTheme(value: string | null): Theme | null {
  if (value === 'dark' || value === 'light') return value
  return null
}

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

const bundles = [
  { name: 'Tech Momentum', holdings: 'NVDA, MSFT, AMD, AVGO', risk: 'High' },
  { name: 'Dividend Core', holdings: 'KO, JNJ, PG, PEP', risk: 'Low' },
  { name: 'ESG Future', holdings: 'ENPH, TSLA, NEE, VWS', risk: 'Medium' },
]

type LearningContentType = 'video' | 'module' | 'game'

type LearningContent = {
  id: string
  type: LearningContentType
  title: string
  description: string
  topic: string
  image: string
  progress: number
  duration: string
}

const learningContents: LearningContent[] = [
  {
    id: 'video-risk-basics',
    type: 'video',
    title: 'Risk Basics in 6 Minutes',
    description: 'A quick explainer on volatility, drawdowns, and realistic return expectations.',
    topic: 'Risk Management',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    progress: 64,
    duration: '6 min',
  },
  {
    id: 'video-diversification',
    type: 'video',
    title: 'Diversification for Beginners',
    description: 'Learn how to spread exposure across sectors and asset classes.',
    topic: 'Portfolio Basics',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    progress: 31,
    duration: '9 min',
  },
  {
    id: 'module-portfolio-construction',
    type: 'module',
    title: 'Build Your Starter Portfolio',
    description: 'Step-by-step module to create a balanced beginner allocation.',
    topic: 'Portfolio Basics',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    progress: 52,
    duration: '4 lessons',
  },
  {
    id: 'module-retirement-planning',
    type: 'module',
    title: 'Retirement Planning Fundamentals',
    description: 'Understand contribution habits, compounding, and timeline planning.',
    topic: 'Retirement',
    image: 'https://images.unsplash.com/photo-1534951009808-766178b47a4f?auto=format&fit=crop&w=1200&q=80',
    progress: 18,
    duration: '5 lessons',
  },
  {
    id: 'game-allocation-challenge',
    type: 'game',
    title: 'Allocation Challenge',
    description: 'Rebalance a portfolio under changing market conditions and score your strategy.',
    topic: 'Risk Management',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    progress: 73,
    duration: '12 min',
  },
  {
    id: 'game-market-cycle',
    type: 'game',
    title: 'Market Cycle Simulator',
    description: 'Test decisions across bull, bear, and sideways market cycles.',
    topic: 'Market Behavior',
    image: 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?auto=format&fit=crop&w=1200&q=80',
    progress: 44,
    duration: '10 min',
  },
  {
    id: 'video-goal-based-investing',
    type: 'video',
    title: 'Goal-Based Investing',
    description: 'Connect financial goals to time horizons and suitable investment choices.',
    topic: 'Planning',
    image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?auto=format&fit=crop&w=1200&q=80',
    progress: 27,
    duration: '8 min',
  },
  {
    id: 'module-tax-aware',
    type: 'module',
    title: 'Tax-Aware Investing',
    description: 'Discover practical ways to improve after-tax outcomes in your long-term plan.',
    topic: 'Retirement',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80',
    progress: 39,
    duration: '3 lessons',
  },
  {
    id: 'game-budget-quest',
    type: 'game',
    title: 'Budget Quest',
    description: 'Complete weekly budgeting scenarios to unlock savings boosts for investing.',
    topic: 'Planning',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    progress: 83,
    duration: '15 min',
  },
]

const LEARNING_PAGE_SIZE = 6

const learningTypeLabel: Record<LearningContentType, string> = {
  video: 'Video',
  module: 'Module',
  game: 'Game',
}

// ── PERA DATA ─────────────────────────────────────────────────────────────────

type PeraHolding = {
  accountId: string
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

type PeraAccount = {
  id: string
  name: string
  institution: string
  strategy: string
  value: number
  ytdContrib: number
  yearlyTarget: number
  change: number
}

type PeraMilestone = {
  year: number
  label: string
  projected: number
  reached: boolean
}

const MAX_PERA_ACCOUNTS = 5

const initialPeraAccounts: PeraAccount[] = [
  {
    id: 'pera-1',
    name: 'Core Retirement',
    institution: 'BPI',
    strategy: 'Balanced',
    value: 86281.65,
    ytdContrib: 4600,
    yearlyTarget: 9600,
    change: 11.2,
  },
  {
    id: 'pera-2',
    name: 'Growth Track',
    institution: 'BDO',
    strategy: 'Equity tilt',
    value: 41824.45,
    ytdContrib: 5200,
    yearlyTarget: 9600,
    change: 9.4,
  },
  {
    id: 'pera-3',
    name: 'Income Shield',
    institution: 'Sun Life',
    strategy: 'Bond-focused',
    value: 23318.12,
    ytdContrib: 3600,
    yearlyTarget: 9600,
    change: 4.6,
  },
]

const initialPeraHoldingsByAccount: Record<string, PeraHolding[]> = {
  'pera-1': [
    { accountId: 'pera-1', fund: 'BPI Retirement Core Fund', type: 'Balanced', units: 82340, navps: 0.6218, value: 51219.21, gain: 12.4 },
    { accountId: 'pera-1', fund: 'BDO Equity Retirement Fund', type: 'Equity', units: 43800, navps: 0.4102, value: 17966.76, gain: 9.7 },
    { accountId: 'pera-1', fund: 'Sun Life PERA Bond Fund', type: 'Bond', units: 19200, navps: 0.8904, value: 17095.68, gain: 4.1 },
  ],
  'pera-2': [
    { accountId: 'pera-2', fund: 'ATRAM Global Equity PERA', type: 'Equity', units: 22600, navps: 0.9584, value: 21660.16, gain: 10.3 },
    { accountId: 'pera-2', fund: 'BPI Select Balanced Fund', type: 'Balanced', units: 30800, navps: 0.6542, value: 20164.36, gain: 8.6 },
  ],
  'pera-3': [
    { accountId: 'pera-3', fund: 'Sun Life Bond PERA', type: 'Bond', units: 17400, navps: 0.9372, value: 16307.28, gain: 4.2 },
    { accountId: 'pera-3', fund: 'BPI Stable Income PERA', type: 'Balanced', units: 12380, navps: 0.5663, value: 7010.84, gain: 5.1 },
  ],
}

const initialPeraContribByAccount: Record<string, PeraContribMonth[]> = {
  'pera-1': [
    { month: 'Nov', amount: 800, target: 800 },
    { month: 'Dec', amount: 800, target: 800 },
    { month: 'Jan', amount: 900, target: 800 },
    { month: 'Feb', amount: 800, target: 800 },
    { month: 'Mar', amount: 900, target: 800 },
    { month: 'Apr', amount: 400, target: 800 },
  ],
  'pera-2': [
    { month: 'Nov', amount: 800, target: 800 },
    { month: 'Dec', amount: 1000, target: 800 },
    { month: 'Jan', amount: 900, target: 800 },
    { month: 'Feb', amount: 1000, target: 800 },
    { month: 'Mar', amount: 900, target: 800 },
    { month: 'Apr', amount: 600, target: 800 },
  ],
  'pera-3': [
    { month: 'Nov', amount: 600, target: 800 },
    { month: 'Dec', amount: 600, target: 800 },
    { month: 'Jan', amount: 700, target: 800 },
    { month: 'Feb', amount: 600, target: 800 },
    { month: 'Mar', amount: 700, target: 800 },
    { month: 'Apr', amount: 400, target: 800 },
  ],
}

const peraMilestones: PeraMilestone[] = [
  { year: 2026, label: '₱100K PERA milestone', projected: 100000, reached: false },
  { year: 2029, label: '₱200K mark – compounding kicks in', projected: 200000, reached: false },
  { year: 2034, label: 'Half-way to target', projected: 500000, reached: false },
  { year: 2049, label: 'Full retirement target', projected: 1200000, reached: false },
]

const dashboardRanges: DashboardRange[] = ['1M', '6M', '1Y', 'All']
const dashboardFilters: DashboardAccountFilter[] = ['All', 'Trading', 'PERA']
const sponsoredContents: SponsoredContent[] = [
  {
    title: 'Priority ETF window',
    sponsor: 'Alpha Invest',
    summary: 'Deploy fresh cash into diversified ETFs with zero entry fee for today’s session.',
    cta: 'Review basket',
    badge: 'Low friction',
    footnote: 'Promo ends in 14h',
  },
  {
    title: 'Auto-rebalance for PERA',
    sponsor: 'FutureFund',
    summary: 'Lock your target allocation and rebalance quarterly to stay aligned with retirement goals.',
    cta: 'Enable strategy',
    badge: 'Tax-aware',
    footnote: 'Designed for long-term PERA accounts',
  },
  {
    title: 'Smart idle-cash sweep',
    sponsor: 'Crest Bank',
    summary: 'Move uninvested funds nightly into a higher-yield pocket while waiting for next trades.',
    cta: 'Activate sweep',
    badge: 'Automated',
    footnote: 'No lock-in period',
  },
]

const dashboardActivities: DashboardActivity[] = [
  { id: 'a1', action: 'Bought TSLA', account: 'Trading', time: '09:42 AM', amount: 12350, direction: 'out' },
  { id: 'a2', action: 'PERA contribution', account: 'PERA Core Retirement', time: '08:15 AM', amount: 800, direction: 'out' },
  { id: 'a3', action: 'Added to Growth Leaders', account: 'Trading', time: 'Yesterday', amount: 5000, direction: 'out' },
  { id: 'a4', action: 'Sold NVDA partial', account: 'Trading', time: 'Yesterday', amount: 7420, direction: 'in' },
  { id: 'a5', action: 'Dividend credited', account: 'PERA', time: '2 days ago', amount: 1340, direction: 'in' },
]

const marketWatch = [
  { name: 'PSEi', level: '6,845.14', change: 0.86, note: 'Financials leading' },
  { name: 'S&P 500', level: '5,216.48', change: 0.41, note: 'Broad risk-on tone' },
  { name: 'NASDAQ 100', level: '18,390.05', change: 0.73, note: 'AI megacaps firm' },
  { name: 'USD/PHP', level: '56.12', change: -0.27, note: 'Peso recovering' },
]

const tradingHoldings = [
  { symbol: 'NVDA', shares: 28, avgPrice: 131.4 },
  { symbol: 'MSFT', shares: 18, avgPrice: 402.7 },
  { symbol: 'TSLA', shares: 15, avgPrice: 302.9 },
  { symbol: 'AAPL', shares: 24, avgPrice: 134.1 },
]

const managedPortfolios = [
  { id: 'mp-1', name: 'Balanced Income', invested: 84000, value: 95640 },
  { id: 'mp-2', name: 'Growth Leaders', invested: 69000, value: 81280 },
  { id: 'mp-3', name: 'Global Diversified', invested: 52000, value: 58640 },
]

const dashboardSeriesWeights: Record<DashboardRange, number[]> = {
  '1M': [0.975, 0.98, 0.986, 0.982, 0.991, 0.996, 1],
  '6M': [0.87, 0.89, 0.9, 0.92, 0.94, 0.955, 0.97, 0.982, 0.99, 0.998, 1.004, 1.01],
  '1Y': [0.76, 0.79, 0.81, 0.83, 0.86, 0.88, 0.9, 0.93, 0.95, 0.98, 1, 1.03],
  All: [0.58, 0.62, 0.66, 0.7, 0.74, 0.79, 0.84, 0.88, 0.91, 0.94, 0.97, 1],
}
const SPONSORED_CAROUSEL_TICK_MS = 250
const SPONSORED_CAROUSEL_ADVANCE_MS = 5000

const retirementGoal = 1200000 // PHP target
// Synthetic daily return assumptions used for intraday estimate when live account-level delta feeds are unavailable.
const PERA_DAILY_RETURN_RATE = 0.0024 // ~0.24% daily estimate
const MANAGED_DAILY_RETURN_RATE = 0.0018 // ~0.18% daily estimate
const PROJECTION_EXTRA_MONTHLY_CONTRIBUTION = 4200
const PROJECTION_YEARS_HORIZON = 10
const AFTERNOON_HOUR_START = 12
const EVENING_HOUR_START = 18
const MAX_RECENT_ACTIVITIES_DISPLAY = 5
// Estimated equity exposure assumptions used for high-level risk insight.
const MANAGED_EQUITY_ALLOCATION = 0.58
const PERA_EQUITY_ALLOCATION = 0.46
const TRADING_EQUITY_ALLOCATION = 0.86
const TRADING_BOND_ALLOCATION = 0.04
const MANAGED_BOND_ALLOCATION = 0.28
const PERA_BOND_ALLOCATION = 0.34

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

function sumSeries(seriesA: number[], seriesB: number[]) {
  const length = Math.max(seriesA.length, seriesB.length)
  return Array.from({ length }, (_, index) => (seriesA[index] ?? 0) + (seriesB[index] ?? 0))
}

const PERA_PROJECTION_YEARS = 25
const DEFAULT_CHART_MAX_VALUE = 1
const SEED_CONTRIB_BASE_MULTIPLIER = 0.85
const SEED_CONTRIB_STEP_MULTIPLIER = 0.03
const SEED_HOLDING_BASE_MULTIPLIER = 0.38
const SEED_HOLDING_STEP_MULTIPLIER = 0.06
const PRIMARY_SEEDED_FUND_INDEX = 0
const SEED_FUND_NAME_PREFIX = 'Starter PERA Core Fund'
const DEFAULT_FUND_COLOR = '#6ee7b7'
const FUND_TYPE_COLORS: Record<string, string> = {
  Balanced: '#2dd4bf',
  Equity: '#34d399',
  Bond: DEFAULT_FUND_COLOR,
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

function getScalingFactor(seedNumber: number, baseMultiplier: number, stepMultiplier: number) {
  return baseMultiplier + seedNumber * stepMultiplier
}

function safePercentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0
  return Math.round((numerator / denominator) * 100)
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const storedTheme = parseTheme(window.localStorage.getItem('theme'))
    if (storedTheme) return storedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [authStep, setAuthStep] = useState<AuthStep>('login')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [page, setPage] = useState<MainPage>('dashboard')
  const [watchlist, setWatchlist] = useState(initialStocks)
  const [search, setSearch] = useState('')
  const [learningSearch, setLearningSearch] = useState('')
  const [learningTypeFilter, setLearningTypeFilter] = useState<'all' | LearningContentType>('all')
  const [learningTopicFilter, setLearningTopicFilter] = useState('All topics')
  const [learningPage, setLearningPage] = useState(1)
  const [learningFeedback, setLearningFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({})
  const [selectedLearningContentId, setSelectedLearningContentId] = useState<string | null>(null)
  const [selected, setSelected] = useState(defaultSelectedSymbol)
  const tradingRange: Range = '1D'
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market')
  const [orderSide, setOrderSide] = useState<'Buy' | 'Sell'>('Buy')
  const [quantity, setQuantity] = useState(10)
  const [limitPrice, setLimitPrice] = useState(defaultSelectedStock.price)
  const [monthlyContribution, setMonthlyContribution] = useState(900)
  const [annualReturn, setAnnualReturn] = useState(0.08)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dashboardRange, setDashboardRange] = useState<DashboardRange>('1Y')
  const [dashboardFilter, setDashboardFilter] = useState<DashboardAccountFilter>('All')
  const [sponsoredIndex, setSponsoredIndex] = useState(0)
  const [isSponsoredPaused, setIsSponsoredPaused] = useState(false)
  const [showPeraAccounts, setShowPeraAccounts] = useState(false)
  const [showManagedPortfolios, setShowManagedPortfolios] = useState(false)
  const [peraAccounts, setPeraAccounts] = useState(initialPeraAccounts)
  const [activePeraAccountId, setActivePeraAccountId] = useState(initialPeraAccounts[0].id)
  const [peraHoldingsByAccount, setPeraHoldingsByAccount] = useState(initialPeraHoldingsByAccount)
  const [peraContribByAccount, setPeraContribByAccount] = useState(initialPeraContribByAccount)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const learningModalRef = useRef<HTMLDivElement>(null)
  const isSponsoredPausedRef = useRef(false)
  const sponsoredElapsedRef = useRef(0)

  const selectedStock = useMemo(
    () => watchlist.find((stock) => stock.symbol === selected) ?? watchlist[0],
    [selected, watchlist],
  )

  const filteredStocks = useMemo(
    () => watchlist.filter((stock) => `${stock.symbol} ${stock.name}`.toLowerCase().includes(search.toLowerCase())),
    [search, watchlist],
  )
  const watchlistBySymbol = useMemo<Record<string, Stock>>(
    () => watchlist.reduce<Record<string, Stock>>((acc, stock) => ({ ...acc, [stock.symbol]: stock }), {}),
    [watchlist],
  )
  const learningTopics = useMemo(() => ['All topics', ...new Set(learningContents.map((item) => item.topic))], [])
  const filteredLearningContents = useMemo(
    () =>
      learningContents.filter((item) => {
        const matchesSearch = `${item.title} ${item.description} ${item.topic}`.toLowerCase().includes(learningSearch.toLowerCase())
        const matchesType = learningTypeFilter === 'all' || item.type === learningTypeFilter
        const matchesTopic = learningTopicFilter === 'All topics' || item.topic === learningTopicFilter
        return matchesSearch && matchesType && matchesTopic
      }),
    [learningSearch, learningTopicFilter, learningTypeFilter],
  )
  const learningTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredLearningContents.length / LEARNING_PAGE_SIZE)),
    [filteredLearningContents.length],
  )
  const currentLearningPage = Math.min(learningPage, learningTotalPages)
  const paginatedLearningContents = useMemo(
    () => filteredLearningContents.slice((currentLearningPage - 1) * LEARNING_PAGE_SIZE, currentLearningPage * LEARNING_PAGE_SIZE),
    [currentLearningPage, filteredLearningContents],
  )
  const selectedLearningContent = useMemo(
    () => learningContents.find((item) => item.id === selectedLearningContentId) ?? null,
    [selectedLearningContentId],
  )

  const estimatedOrderCost = useMemo(() => {
    const unit = orderType === 'Market' ? selectedStock.price : limitPrice || selectedStock.price
    return quantity * unit
  }, [limitPrice, orderType, quantity, selectedStock.price])

  const projected = useMemo(
    () => growthProjection(32600, monthlyContribution, PERA_PROJECTION_YEARS, annualReturn),
    [annualReturn, monthlyContribution],
  )
  const activePeraAccount = useMemo(() => peraAccounts.find((account) => account.id === activePeraAccountId) ?? null, [activePeraAccountId, peraAccounts])
  const activePeraHoldings = useMemo<PeraHolding[]>(() => {
    if (!activePeraAccount) return []
    return peraHoldingsByAccount[activePeraAccount.id] ?? []
  }, [activePeraAccount, peraHoldingsByAccount])
  const activePeraContrib = useMemo<PeraContribMonth[]>(() => {
    if (!activePeraAccount) return []
    return peraContribByAccount[activePeraAccount.id] ?? []
  }, [activePeraAccount, peraContribByAccount])

  function addPeraAccount() {
    setPeraAccounts((previous) => {
      if (previous.length >= MAX_PERA_ACCOUNTS) return previous
      const nextNumber = previous.length + 1
      const nextId = `pera-${nextNumber}`
      const contributionScalingFactor = getScalingFactor(nextNumber, SEED_CONTRIB_BASE_MULTIPLIER, SEED_CONTRIB_STEP_MULTIPLIER)
      const holdingScalingFactor = getScalingFactor(nextNumber, SEED_HOLDING_BASE_MULTIPLIER, SEED_HOLDING_STEP_MULTIPLIER)
      const seededContrib = initialPeraContribByAccount['pera-1'].map((entry) => ({
        ...entry,
        amount: Math.round(entry.amount * contributionScalingFactor),
      }))
      const seededHoldings = initialPeraHoldingsByAccount['pera-1'].map((holding, index) => ({
        ...holding,
        accountId: nextId,
        fund: index === PRIMARY_SEEDED_FUND_INDEX ? `${SEED_FUND_NAME_PREFIX} ${nextNumber}` : holding.fund,
        value: Number((holding.value * holdingScalingFactor).toFixed(2)),
        gain: Number((holding.gain * holdingScalingFactor).toFixed(1)),
      }))

      setPeraContribByAccount((existing) => ({ ...existing, [nextId]: seededContrib }))
      setPeraHoldingsByAccount((existing) => ({ ...existing, [nextId]: seededHoldings }))
      setActivePeraAccountId(nextId)

      const ytdContrib = seededContrib.reduce((sum, item) => sum + item.amount, 0)
      const yearlyTarget = seededContrib.reduce((sum, item) => sum + item.target, 0)
      const value = seededHoldings.reduce((sum, item) => sum + item.value, 0)

      return [
        ...previous,
        {
          id: nextId,
          name: `PERA Account ${nextNumber}`,
          institution: 'Custom',
          strategy: 'Balanced',
          value,
          ytdContrib,
          yearlyTarget,
          change: 6.2,
        },
      ]
    })
  }

  function toggleLearningReaction(itemId: string, reaction: 'like' | 'dislike') {
    setLearningFeedback((previous) => ({
      ...previous,
      [itemId]: previous[itemId] === reaction ? null : reaction,
    }))
  }

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
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    isSponsoredPausedRef.current = isSponsoredPaused
  }, [isSponsoredPaused])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (isSponsoredPausedRef.current) return
      sponsoredElapsedRef.current += SPONSORED_CAROUSEL_TICK_MS
      if (sponsoredElapsedRef.current < SPONSORED_CAROUSEL_ADVANCE_MS) return
      sponsoredElapsedRef.current = 0
      setSponsoredIndex((previous) => (previous + 1) % sponsoredContents.length)
    }, SPONSORED_CAROUSEL_TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

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

  useEffect(() => {
    if (!selectedLearningContentId) return
    learningModalRef.current?.focus()
  }, [selectedLearningContentId])

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

  const tradingTopHoldings = useMemo(() => {
    return tradingHoldings
      .map((holding) => {
        const stock = watchlistBySymbol[holding.symbol]
        const price = stock?.price ?? holding.avgPrice
        return {
          ...holding,
          price,
          value: price * holding.shares,
          dayChange: stock?.change ?? 0,
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  }, [watchlistBySymbol])

  const tradingMarketValue = useMemo(
    () => tradingHoldings.reduce((sum, holding) => sum + (watchlistBySymbol[holding.symbol]?.price ?? holding.avgPrice) * holding.shares, 0),
    [watchlistBySymbol],
  )
  const tradingCostBasis = useMemo(() => tradingHoldings.reduce((sum, holding) => sum + holding.avgPrice * holding.shares, 0), [])
  const tradingDailyPnL = useMemo(
    () =>
      tradingHoldings.reduce((sum, holding) => {
        const stock = watchlistBySymbol[holding.symbol]
        if (!stock) return sum
        const previous = stock.price / (1 + stock.change / 100)
        return sum + (stock.price - previous) * holding.shares
      }, 0),
    [watchlistBySymbol],
  )

  const totalPeraValueAllAccounts = useMemo(() => peraAccounts.reduce((sum, account) => sum + account.value, 0), [peraAccounts])
  const totalPeraContributions = useMemo(() => peraAccounts.reduce((sum, account) => sum + account.ytdContrib, 0), [peraAccounts])

  const managedTotalInvested = useMemo(() => managedPortfolios.reduce((sum, portfolio) => sum + portfolio.invested, 0), [])
  const managedTotalValue = useMemo(() => managedPortfolios.reduce((sum, portfolio) => sum + portfolio.value, 0), [])
  const managedTop = useMemo(() => managedPortfolios.slice(0, 2), [])
  const managedPerformancePct = safePercentage(managedTotalValue - managedTotalInvested, managedTotalInvested)

  const totalNetWorth = tradingMarketValue + totalPeraValueAllAccounts + managedTotalValue
  const contributionsTotal = tradingCostBasis + totalPeraContributions + managedTotalInvested
  const allTimeReturnAmount = totalNetWorth - contributionsTotal
  const allTimeReturnPct = safePercentage(allTimeReturnAmount, contributionsTotal)
  const todayChangeAmount = tradingDailyPnL + totalPeraValueAllAccounts * PERA_DAILY_RETURN_RATE + managedTotalValue * MANAGED_DAILY_RETURN_RATE
  const todayBase = totalNetWorth - todayChangeAmount
  const todayChangePct = safePercentage(todayChangeAmount, todayBase)
  const peraGoalProgress = safePercentage(totalPeraValueAllAccounts, retirementGoal)
  const retirementGap = Math.max(0, retirementGoal - totalPeraValueAllAccounts)
  const projectedNetWorth = useMemo(
    () =>
      growthProjection(
        totalNetWorth,
        monthlyContribution + PROJECTION_EXTRA_MONTHLY_CONTRIBUTION,
        PROJECTION_YEARS_HORIZON,
        annualReturn,
      ),
    [annualReturn, monthlyContribution, totalNetWorth],
  )
  const marketBreadth = useMemo(() => safePercentage(watchlist.filter((stock) => stock.change >= 0).length, watchlist.length), [watchlist])

  const accountSeriesByFilter = useMemo(() => {
    const scaleByTotal = (total: number) =>
      Object.fromEntries(
        dashboardRanges.map((item) => [item, dashboardSeriesWeights[item].map((weight) => Number((weight * total).toFixed(2)))]),
      ) as Record<DashboardRange, number[]>

    const tradingSeries = scaleByTotal(tradingMarketValue)
    const peraSeries = scaleByTotal(totalPeraValueAllAccounts)
    const managedSeries = scaleByTotal(managedTotalValue)
    const allSeries = Object.fromEntries(
      dashboardRanges.map((item) => [item, sumSeries(sumSeries(tradingSeries[item], peraSeries[item]), managedSeries[item])]),
    ) as Record<DashboardRange, number[]>

    return {
      Trading: tradingSeries,
      PERA: peraSeries,
      All: allSeries,
    } as Record<DashboardAccountFilter, Record<DashboardRange, number[]>>
  }, [managedTotalValue, totalPeraValueAllAccounts, tradingMarketValue])

  const currentDashboardSeries = accountSeriesByFilter[dashboardFilter][dashboardRange]
  const stocksAmount =
    tradingMarketValue * TRADING_EQUITY_ALLOCATION +
    managedTotalValue * MANAGED_EQUITY_ALLOCATION +
    totalPeraValueAllAccounts * PERA_EQUITY_ALLOCATION
  const bondsAmount =
    tradingMarketValue * TRADING_BOND_ALLOCATION + managedTotalValue * MANAGED_BOND_ALLOCATION + totalPeraValueAllAccounts * PERA_BOND_ALLOCATION
  const equitiesExposure = safePercentage(stocksAmount, totalNetWorth)
  const bondsExposure = safePercentage(bondsAmount, totalNetWorth)
  const cashExposure = Math.max(0, 100 - equitiesExposure - bondsExposure)
  const stocksExposureEnd = equitiesExposure
  const bondsExposureEnd = equitiesExposure + bondsExposure
  const peraAccountsCount = peraAccounts.length
  const equitiesExposurePct = equitiesExposure
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < AFTERNOON_HOUR_START) return 'morning'
    if (hour < EVENING_HOUR_START) return 'afternoon'
    return 'evening'
  }, [])
  const activeSponsoredContent = sponsoredContents[sponsoredIndex]
  function resumeSponsoredCarousel() {
    sponsoredElapsedRef.current = 0
    setIsSponsoredPaused(false)
  }
  function goToSponsoredIndex(index: number) {
    sponsoredElapsedRef.current = 0
    setSponsoredIndex(index)
  }
  function handleSponsoredTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % sponsoredContents.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + sponsoredContents.length) % sponsoredContents.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = sponsoredContents.length - 1
    if (nextIndex === index) return
    event.preventDefault()
    goToSponsoredIndex(nextIndex)
    window.requestAnimationFrame(() => {
      document.getElementById(`sponsored-dot-${nextIndex}`)?.focus()
    })
  }

  const dashboardView = (
    <div className="grid dashboard-unified fintech-dashboard">
      <section className="card span-2 dashboard-summary-card">
        <div className="dashboard-summary-top">
          <h3>Net Worth Summary</h3>
          <span className="summary-anchor">Live consolidated view</span>
        </div>
        <strong>₱{totalNetWorth.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
        <div className="dashboard-summary-metrics">
          <article>
            <span>Today’s Change</span>
            <p className={todayChangeAmount >= 0 ? 'positive' : 'negative'}>
              {todayChangeAmount >= 0 ? '+' : ''}₱{Math.abs(todayChangeAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })} (
              {todayChangePct >= 0 ? '+' : ''}
              {todayChangePct}%)
            </p>
            <small>PERA and managed deltas are estimated intraday.</small>
          </article>
          <article>
            <span>All-time Return</span>
            <p className={allTimeReturnAmount >= 0 ? 'positive' : 'negative'}>
              {allTimeReturnAmount >= 0 ? '+' : ''}₱{Math.abs(allTimeReturnAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })} (
              {allTimeReturnPct >= 0 ? '+' : ''}
              {allTimeReturnPct}%)
            </p>
          </article>
          <article>
            <span>Projected Value ({PROJECTION_YEARS_HORIZON}Y)</span>
            <p>₱{projectedNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <small>Based on current net worth + recurring contributions.</small>
          </article>
        </div>
      </section>

      <section className="card dashboard-morning-card">
        <h3>Morning Notes</h3>
        <p className="dashboard-morning-greeting">Good {timeOfDay}.</p>
        <ul className="list dashboard-note-list">
          <li>
            <div>
              <strong>Focus watchlist volatility</strong>
              <p>{marketBreadth}% of tracked names are green.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>PERA pace check</strong>
              <p>Contribution progress is at {peraGoalProgress}% of long-term target.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Cash ready to deploy</strong>
              <p>Use quick actions below to rebalance or add to PERA.</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="card span-3 dashboard-action-bar">
        <h3>Quick Actions</h3>
        <div className="dashboard-action-buttons">
          <button type="button">Deposit</button>
          <button type="button">Withdraw</button>
          <button type="button">Invest (managed portfolios)</button>
          <button type="button" className="primary">
            Contribute to PERA
          </button>
        </div>
      </section>

      <section className="card span-2 dashboard-performance-card">
        <div className="heading-row">
          <h3>Performance Chart</h3>
          <div className="dashboard-performance-controls">
            <div className="segment slim">
              {dashboardRanges.map((item) => (
                <button key={item} type="button" className={dashboardRange === item ? 'active' : ''} onClick={() => setDashboardRange(item)}>
                  {item === 'All' ? 'ALL' : item}
                </button>
              ))}
            </div>
            <div className="segment slim">
              {dashboardFilters.map((item) => (
                <button key={item} type="button" className={dashboardFilter === item ? 'active' : ''} onClick={() => setDashboardFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart dashboard-unified-chart">
          <path d={chartPath(currentDashboardSeries)} />
        </svg>
      </section>

      <section className="card dashboard-market-card">
        <h3>Market Information</h3>
        <ul className="list dashboard-market-list">
          {marketWatch.map((item) => (
            <li key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.note}</p>
              </div>
              <div className="dashboard-market-values">
                <span>{item.level}</span>
                <small className={item.change >= 0 ? 'positive' : 'negative'}>
                  {item.change >= 0 ? '+' : ''}
                  {item.change.toFixed(2)}%
                </small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card span-3 dashboard-money-card">
        <h3>Account Overview</h3>
        <div className="money-group-grid">
          <article className="money-group money-group--trading">
            <div className="money-group-head">
              <h4>Trading</h4>
              <button type="button" className="primary">Trade</button>
            </div>
            <p className="money-total">₱{tradingMarketValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p className={tradingDailyPnL >= 0 ? 'positive' : 'negative'}>
              Today’s P&amp;L: {tradingDailyPnL >= 0 ? '+' : ''}₱{Math.abs(tradingDailyPnL).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <ul className="money-preview-list">
              {tradingTopHoldings.map((holding) => (
                <li key={holding.symbol}>
                  <span>{holding.symbol}</span>
                  <small>
                    ₱{holding.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} · {holding.dayChange >= 0 ? '+' : ''}
                    {holding.dayChange.toFixed(2)}%
                  </small>
                </li>
              ))}
            </ul>
          </article>

          <article className="money-group money-group--pera">
            <div className="money-group-head">
              <h4>PERA (Aggregated)</h4>
              <button type="button" onClick={() => setShowPeraAccounts((value) => !value)}>
                {showPeraAccounts ? 'Hide accounts' : 'Expand to view'}
              </button>
            </div>
            <p className="money-total">₱{totalPeraValueAllAccounts.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p>Total contributions: ₱{totalPeraContributions.toLocaleString()}</p>
            <p>
              Accounts active: {peraAccountsCount}/{MAX_PERA_ACCOUNTS}
            </p>
            <div className="money-progress">
              <span>Progress toward goal · {peraGoalProgress}%</span>
              <div className="bar-track">
                <span style={{ width: `${Math.min(100, peraGoalProgress)}%` }} />
              </div>
            </div>
            {showPeraAccounts && (
              <ul className="money-expand-list">
                {peraAccounts.map((account) => (
                  <li key={account.id}>
                    <strong>{account.name}</strong>
                    <span>
                      ₱{account.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} · {account.change >= 0 ? '+' : ''}
                      {account.change.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="money-group money-group--managed">
            <div className="money-group-head">
              <h4>Managed Portfolios</h4>
              <button type="button" className="primary" onClick={() => setShowManagedPortfolios((value) => !value)}>
                {showManagedPortfolios ? 'Hide portfolios' : 'View portfolios'}
              </button>
            </div>
            <p className="money-total">₱{managedTotalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p>
              Total invested: ₱{managedTotalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })} ·
              <span className={managedPerformancePct >= 0 ? 'positive' : 'negative'}> {managedPerformancePct >= 0 ? '+' : ''}{managedPerformancePct}%</span>
            </p>
            <ul className="money-preview-list">
              {managedTop.map((portfolio) => (
                <li key={portfolio.id}>
                  <span>{portfolio.name}</span>
                  <small>₱{portfolio.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</small>
                </li>
              ))}
            </ul>
            {showManagedPortfolios && (
              <ul className="money-expand-list">
                {managedPortfolios.map((portfolio) => (
                  <li key={portfolio.id}>
                    <strong>{portfolio.name}</strong>
                    <span>
                      ₱{portfolio.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} · Invested ₱
                      {portfolio.invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>

      <section className="card dashboard-allocation-card">
        <h3>Allocation Snapshot</h3>
        <div
          className="allocation-pie"
          style={{
            background: `conic-gradient(var(--accent) 0% ${stocksExposureEnd}%, var(--allocation-bonds-color) ${stocksExposureEnd}% ${bondsExposureEnd}%, var(--allocation-cash-color) ${bondsExposureEnd}% 100%)`,
          }}
          aria-hidden
        />
        <div className="allocation-legend">
          <div className="allocation-row">
            <span>Stocks</span>
            <strong>{equitiesExposure}%</strong>
            <div className="bar-track">
              <span style={{ width: `${equitiesExposure}%` }} />
            </div>
          </div>
          <div className="allocation-row">
            <span>Bonds</span>
            <strong>{bondsExposure}%</strong>
            <div className="bar-track">
              <span style={{ width: `${bondsExposure}%`, background: 'var(--allocation-bonds-color)' }} />
            </div>
          </div>
          <div className="allocation-row">
            <span>Cash</span>
            <strong>{cashExposure}%</strong>
            <div className="bar-track">
              <span style={{ width: `${cashExposure}%`, background: 'var(--allocation-cash-color)' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="card dashboard-activity-card">
        <h3>Recent Activity</h3>
        <ul className="list dashboard-activity-list">
          {dashboardActivities.slice(0, MAX_RECENT_ACTIVITIES_DISPLAY).map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.action}</strong>
                <p>{item.account}</p>
              </div>
              <div className="dashboard-activity-values">
                <small>{item.time}</small>
                <span className={item.direction === 'in' ? 'positive' : 'negative'}>
                  {item.direction === 'in' ? '+' : '-'}₱{item.amount.toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="card dashboard-sponsored-card"
        onMouseEnter={() => setIsSponsoredPaused(true)}
        onMouseLeave={resumeSponsoredCarousel}
        onFocusCapture={() => setIsSponsoredPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            resumeSponsoredCarousel()
          }
        }}
      >
        <div className="dashboard-sponsored-top">
          <h3>Ad Spotlight</h3>
          <span>
            {sponsoredIndex + 1} / {sponsoredContents.length}
          </span>
        </div>
        <article
          id="sponsored-slide-panel"
          className="dashboard-sponsored-slide"
          role="tabpanel"
          aria-labelledby={`sponsored-dot-${sponsoredIndex}`}
        >
          <p>{activeSponsoredContent.sponsor}</p>
          <strong>{activeSponsoredContent.title}</strong>
          <small>{activeSponsoredContent.summary}</small>
          <div className="dashboard-sponsored-meta">
            <span>{activeSponsoredContent.badge}</span>
            <small>{activeSponsoredContent.footnote}</small>
          </div>
          <button type="button" className="primary">
            {activeSponsoredContent.cta}
          </button>
        </article>
        <div className="dashboard-sponsored-dots" role="tablist" aria-label="Navigate sponsored content slides">
          {sponsoredContents.map((item, index) => (
            <button
              key={item.title}
              id={`sponsored-dot-${index}`}
              type="button"
              role="tab"
              aria-controls="sponsored-slide-panel"
              aria-selected={sponsoredIndex === index}
              tabIndex={sponsoredIndex === index ? 0 : -1}
              className={sponsoredIndex === index ? 'active' : ''}
              onClick={() => goToSponsoredIndex(index)}
              onKeyDown={(event) => handleSponsoredTabKeyDown(event, index)}
            >
              <span className="sr-only">{item.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card span-3 dashboard-insights-card">
        <h3>Insights</h3>
        <ul className="list dashboard-insights-list">
          <li>
            <div>
              <strong>You’re {equitiesExposurePct}% allocated to equities</strong>
              <p>{equitiesExposurePct >= 60 ? 'High risk posture detected.' : 'Risk posture remains moderate.'}</p>
            </div>
          </li>
          <li>
            <div>
              <strong>You’ve contributed ₱{totalPeraContributions.toLocaleString()} to PERA this year</strong>
              <p>{peraGoalProgress >= 50 ? 'On track for your retirement target pace.' : 'Consider increasing monthly PERA contributions.'}</p>
            </div>
          </li>
          <li>
            <div>
              <strong>
                {retirementGap > 0
                  ? `You’re behind your retirement goal by ₱${retirementGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : 'You have reached your retirement goal'}
              </strong>
              <p>Goal benchmark: ₱{retirementGoal.toLocaleString()}.</p>
            </div>
          </li>
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
          <path d={chartPath(selectedStock.series[tradingRange])} />
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

  const totalPeraValue = activePeraHoldings.reduce((sum, h) => sum + h.value, 0)
  const ytdContrib = activePeraContrib.reduce((sum, m) => sum + m.amount, 0)
  const ytdTarget = activePeraContrib.reduce((sum, m) => sum + m.target, 0)
  const contribPct = safePercentage(ytdContrib, ytdTarget)
  const maxContrib = activePeraContrib.length
    ? Math.max(...activePeraContrib.map((m) => m.target))
    : DEFAULT_CHART_MAX_VALUE
  const activeFundAlloc = Object.entries(
    activePeraHoldings.reduce<Record<string, number>>((totals, holding) => {
      totals[holding.type] = (totals[holding.type] ?? 0) + holding.value
      return totals
    }, {}),
  ).map(([label, value]) => ({
    label,
    pct: safePercentage(value, totalPeraValue),
    color: FUND_TYPE_COLORS[label] ?? DEFAULT_FUND_COLOR,
  }))
  const accountSlotsLeft = Math.max(0, MAX_PERA_ACCOUNTS - peraAccounts.length)

  const peraView = (
    <div className="grid pera-grid">
      <section className="card span-3 pera-hero">
        <div>
          <span className="pera-hero-tag">PERA Accounts</span>
          <h3>Manage up to {MAX_PERA_ACCOUNTS} retirement accounts in one sleek workspace</h3>
          <p>Track balances, monitor contributions, and compare performance across all PERA providers in real time.</p>
        </div>
        <div className="pera-hero-meta">
          <div>
            <small>Active accounts</small>
            <strong>
              {peraAccounts.length}/{MAX_PERA_ACCOUNTS}
            </strong>
          </div>
          <button
            type="button"
            className="primary pera-add-account-btn"
            onClick={addPeraAccount}
            disabled={peraAccounts.length >= MAX_PERA_ACCOUNTS}
          >
            {peraAccounts.length >= MAX_PERA_ACCOUNTS ? 'Account limit reached' : 'Add account'}
          </button>
        </div>
      </section>

      <section className="card span-3 pera-accounts">
        <div className="heading-row">
          <h3>Account Portfolio</h3>
          <span className="pera-pace-badge">
            {accountSlotsLeft > 0 ? `${accountSlotsLeft} slot${accountSlotsLeft > 1 ? 's' : ''} available` : 'Maximum reached'}
          </span>
        </div>
        <div className="pera-account-grid">
          {peraAccounts.map((account) => {
            const pace = safePercentage(account.ytdContrib, account.yearlyTarget)
            return (
              <button
                key={account.id}
                type="button"
                className={`pera-account-card ${activePeraAccountId === account.id ? 'active' : ''}`}
                onClick={() => setActivePeraAccountId(account.id)}
              >
                <div className="pera-account-header">
                  <strong>{account.name}</strong>
                  <span>{account.institution}</span>
                </div>
                <p>{account.strategy}</p>
                <h4>₱{account.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
                <div className="pera-account-foot">
                  <small>{pace}% pace</small>
                  <small className={account.change >= 0 ? 'positive' : 'negative'}>
                    {account.change >= 0 ? '+' : ''}
                    {account.change.toFixed(1)}%
                  </small>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── KPI Summary Row ─────────────────────────────── */}
      <section className="card span-3 pera-kpi-row">
        <div className="pera-kpi">
          <span>Total PERA Value</span>
          <strong>₱{totalPeraValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          <p className={activePeraAccount?.change && activePeraAccount.change >= 0 ? 'positive' : 'negative'}>
            {activePeraAccount?.change && activePeraAccount.change >= 0 ? '+' : ''}
            {(activePeraAccount?.change ?? 0).toFixed(1)}% over 12 months
          </p>
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
        <h3>{activePeraAccount?.name} Holdings</h3>
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
            {activePeraHoldings.length === 0 ? (
              <tr>
                <td colSpan={6} className="pera-empty-state">
                  No holdings yet for this account.
                </td>
              </tr>
            ) : (
              activePeraHoldings.map((h) => (
                <tr key={h.fund}>
                  <td>{h.fund}</td>
                  <td>
                    <span className={`pera-fund-badge pera-fund-badge--${h.type.toLowerCase()}`}>{h.type}</span>
                  </td>
                  <td>{h.units.toLocaleString()}</td>
                  <td>₱{h.navps.toFixed(4)}</td>
                  <td>₱{h.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className={h.gain >= 0 ? 'positive' : 'negative'}>{h.gain >= 0 ? `+${h.gain}` : h.gain}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* ── Fund Allocation ───────────────────────────────── */}
      <section className="card">
        <h3>Fund Allocation</h3>
        {activeFundAlloc.map((item) => (
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
          {activePeraContrib.map((m) => (
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
          <label className="pera-return-label">
            Annual return %
            <input
              type="number"
              min={1}
              max={18}
              step="0.5"
              className="pera-return-input"
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
        <div className="pera-kpi pera-kpi--compact">
          <span>Estimated at retirement</span>
          <strong>₱{projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          <p>Based on ₱{monthlyContribution}/mo · {(annualReturn * 100).toFixed(1)}% return · {PERA_PROJECTION_YEARS} yr</p>
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
    <>
      <div className="grid learning-grid">
        <section className="card span-3 learning-hub-toolbar">
          <div>
            <h3>Learning Hub</h3>
            <p>Explore videos, modules, and games tailored to your investing journey.</p>
          </div>
          <div className="learning-hub-controls">
            <input
              value={learningSearch}
              onChange={(event) => {
                setLearningSearch(event.target.value)
                setLearningPage(1)
              }}
              placeholder="Search content"
              aria-label="Search learning content"
            />
            <div className="segment learning-type-filter">
              {(['all', 'video', 'module', 'game'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={learningTypeFilter === type ? 'active' : ''}
                  onClick={() => {
                    setLearningTypeFilter(type)
                    setLearningPage(1)
                  }}
                >
                  {type === 'all' ? 'All' : learningTypeLabel[type]}
                </button>
              ))}
            </div>
            <select
              value={learningTopicFilter}
              onChange={(event) => {
                setLearningTopicFilter(event.target.value)
                setLearningPage(1)
              }}
              aria-label="Filter by topic"
            >
              {learningTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="span-3 learning-content-grid">
          {paginatedLearningContents.length === 0 && (
            <article className="card learning-empty-state">
              <h4>No matching content</h4>
              <p>Try changing your search term or filters.</p>
            </article>
          )}
          {paginatedLearningContents.map((item) => (
            <article
              key={item.id}
              className="card learning-content-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedLearningContentId(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedLearningContentId(item.id)
                }
              }}
            >
              <img src={item.image} alt={item.title} className="learning-content-image" />
              <div className="learning-content-meta">
                <span className="learning-chip">{learningTypeLabel[item.type]}</span>
                <span>{item.topic}</span>
              </div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <div className="allocation-row learning-progress-row">
                <span>Progress</span>
                <span>{item.progress}%</span>
                <div className="bar-track">
                  <span style={{ width: `${item.progress}%` }} />
                </div>
              </div>
              <div className="learning-content-footer">
                <small>{item.duration}</small>
                <div className="learning-reaction-group">
                  <button
                    type="button"
                    className={learningFeedback[item.id] === 'like' ? 'active' : ''}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleLearningReaction(item.id, 'like')
                    }}
                    aria-label={`Like ${item.title}`}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    className={learningFeedback[item.id] === 'dislike' ? 'active' : ''}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleLearningReaction(item.id, 'dislike')
                    }}
                    aria-label={`Dislike ${item.title}`}
                  >
                    👎
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="card span-3 learning-pagination">
          <button
            type="button"
            onClick={() => setLearningPage((pageNumber) => Math.max(1, pageNumber - 1))}
            disabled={currentLearningPage === 1}
            aria-label="Go to previous page"
          >
            Previous
          </button>
          <p>
            Page {currentLearningPage} of {learningTotalPages}
          </p>
          <button
            type="button"
            onClick={() => setLearningPage((pageNumber) => Math.min(learningTotalPages, pageNumber + 1))}
            disabled={currentLearningPage === learningTotalPages}
            aria-label="Go to next page"
          >
            Next
          </button>
        </section>
      </div>

      {selectedLearningContent && (
        <div
          className="learning-modal-overlay"
          onClick={() => setSelectedLearningContentId(null)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setSelectedLearningContentId(null)
            }
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          ref={learningModalRef}
          aria-label={`${selectedLearningContent.title} details`}
        >
          <div className="card learning-modal" onClick={(event) => event.stopPropagation()} role="document">
            <img src={selectedLearningContent.image} alt={selectedLearningContent.title} className="learning-modal-image" />
            <div className="learning-content-meta">
              <span className="learning-chip">{learningTypeLabel[selectedLearningContent.type]}</span>
              <span>{selectedLearningContent.topic}</span>
            </div>
            <h3>{selectedLearningContent.title}</h3>
            <p>{selectedLearningContent.description}</p>
            <div className="allocation-row learning-progress-row">
              <span>Progress</span>
              <span>{selectedLearningContent.progress}%</span>
              <div className="bar-track">
                <span style={{ width: `${selectedLearningContent.progress}%` }} />
              </div>
            </div>
            <div className="learning-modal-actions">
              <button
                type="button"
                className={learningFeedback[selectedLearningContent.id] === 'like' ? 'active' : ''}
                onClick={() => toggleLearningReaction(selectedLearningContent.id, 'like')}
                aria-label={`Like ${selectedLearningContent.title}`}
              >
                👍 Like
              </button>
              <button
                type="button"
                className={learningFeedback[selectedLearningContent.id] === 'dislike' ? 'active' : ''}
                onClick={() => toggleLearningReaction(selectedLearningContent.id, 'dislike')}
                aria-label={`Dislike ${selectedLearningContent.title}`}
              >
                👎 Dislike
              </button>
              <button type="button" onClick={() => setSelectedLearningContentId(null)} aria-label="Close modal">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
