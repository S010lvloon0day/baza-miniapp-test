import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import type { Profile, Config, Plan, Contributor } from '../api/client'

const tg = (window as any).Telegram?.WebApp

interface Props {
  scrollToPlans?: boolean
  onScrolled?: () => void
}

export default function ProfilePage({ scrollToPlans, onScrolled }: Props) {
  const [prof, setProf]   = useState<Profile | null>(null)
  const [cfg, setCfg]     = useState<Config>({ plans: [], currency: 'USDT' })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Plan | null>(null)
  const [paying, setPaying] = useState<'crypto' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [top, setTop] = useState<Contributor[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [myApproved, setMyApproved] = useState(0)
  const plansRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([api.profile().catch(() => null), api.config().catch(() => null)])
      .then(([p, c]) => {
        if (p) setProf(p)
        if (c) {
          setCfg(c)
          if (c.plans.length) setSelected(c.plans[0])
        }
      })
      .finally(() => setLoading(false))
    api.contributors().then(r => {
      setTop(r.contributors ?? [])
      setMyRank(r.my_rank ?? null)
      setMyApproved(r.my_approved ?? 0)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!scrollToPlans || loading) return
    setTimeout(() => {
      plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      onScrolled?.()
    }, 100)
  }, [scrollToPlans, loading])

  const buyWithCrypto = async () => {
    if (!selected || paying) return
    setPaying('crypto')
    setMsg(null)
    try {
      const { pay_url } = await api.cryptoInvoice(selected.days)
      tg?.openLink ? tg.openLink(pay_url) : window.open(pay_url, '_blank')
      setMsg('Счёт создан. После оплаты напишите /start боту.')
    } catch {
      setMsg('Ошибка создания счёта. Попробуйте позже.')
    } finally {
      setPaying(null)
    }
  }

  const openSubmit = () => {
    const u = cfg.bot_username
    if (!u) return
    const url = `https://t.me/${u}?start=submit`
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url)
      tg.close?.()           // сворачиваем мини-апп — юзер уходит в чат с ботом
    } else {
      window.open(url, '_blank')
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-2 h-2 bg-green rounded-full animate-pulse" />
    </div>
  )

  const name = prof?.name || 'Пользователь'
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className="flex-1 overflow-y-auto pb-14">
      <div className="p-4 flex flex-col gap-5">

        {/* Avatar + name + premium badge */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-[20px] font-extrabold shrink-0"
            style={{ background: 'radial-gradient(circle,rgba(34,197,94,.3),rgba(34,197,94,.05) 65%,transparent)', boxShadow: '0 0 18px rgba(34,197,94,.35)', color: '#4AE885' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[17px] font-extrabold truncate">{name}</div>
            {prof?.is_premium ? (
              <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md" style={{ background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.3)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
                <span className="text-[10px] font-bold text-green tracking-wide">PREMIUM{prof.premium_until ? ` · до ${prof.premium_until}` : ''}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-white/[.06] border border-white/[.08]">
                <span className="text-[10px] font-bold text-gray2 tracking-wide">FREE</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats card */}
        <div className="rounded-2xl px-4 py-1" style={{ border: '1px solid rgba(255,255,255,.08)', background: '#101014' }}>
          <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <span className="text-[13px] text-gray">Предложено материалов</span>
            <span className="text-[14px] font-bold">{prof?.contributions_total ?? 0}</span>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-[13px] text-gray">Одобрено</span>
            <span className="text-[14px] font-bold text-green">
              {prof?.contributions_approved ?? 0} · +{(prof?.contributions_approved ?? 0) * 2}д premium
            </span>
          </div>
        </div>

        {/* Предложить материал */}
        {cfg.bot_username && (
          <button
            onClick={openSubmit}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl active:bg-white/[.03] transition-colors"
            style={{ border: '1px solid rgba(34,197,94,.3)', background: 'rgba(34,197,94,.05)' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] shrink-0 text-green" style={{ background: 'rgba(34,197,94,.14)', border: '1px solid rgba(34,197,94,.35)' }}>
              ⬆
            </div>
            <div className="flex-1 text-left">
              <div className="text-[13px] font-semibold text-white">Предложить материал</div>
              <div className="text-[11px] text-gray">После модерации добавим в базу</div>
            </div>
            <span className="text-[18px] text-gray2">›</span>
          </button>
        )}

        {/* Топ контрибьюторов */}
        {top.length > 0 && (
          <div>
            <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#9a9aa2] mb-3">Топ контрибьюторов</div>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,.08)', background: '#101014' }}>
              {top.map((c, i) => {
                const me = c.user_id === prof?.user_id
                return (
                  <div
                    key={c.user_id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={i < top.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,.06)' } : undefined}
                  >
                    <span className="w-4 shrink-0 text-[13px] text-gray2">{i + 1}</span>
                    <span className={`flex-1 truncate text-[13px] ${me ? 'text-green font-semibold' : 'text-white/85'}`}>
                      {c.username ? `@${c.username}` : 'аноним'}{me ? ' (вы)' : ''}
                    </span>
                    <span className="text-[13px] font-bold text-green">{c.approved}</span>
                  </div>
                )
              })}
              {myRank !== null && myRank > top.length && (
                <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <span className="w-4 shrink-0 text-[13px] text-gray2">{myRank}</span>
                  <span className="flex-1 truncate text-[13px] text-green font-semibold">вы</span>
                  <span className="text-[13px] font-bold text-green">{myApproved}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plans */}
        {cfg.plans.length > 0 && (
          <div ref={plansRef}>
            <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#9a9aa2] mb-3">
              {prof?.is_premium ? 'Продлить premium' : 'Оформить premium'}
            </div>
            {prof?.is_premium && (
              <div className="text-[11px] text-gray mb-2 -mt-1.5">Дни добавятся к текущей подписке</div>
            )}

            {/* Period selector */}
            <div className="flex gap-2 mb-3">
              {cfg.plans.map(p => {
                const active = selected?.days === p.days
                return (
                  <button
                    key={p.days}
                    onClick={() => { setSelected(p); setMsg(null) }}
                    className="flex-1 flex flex-col items-center py-3.5 rounded-2xl transition-colors"
                    style={{
                      border: active ? '1px solid rgba(34,197,94,.5)' : '1px solid rgba(255,255,255,.08)',
                      background: active ? 'rgba(34,197,94,.08)' : '#101014',
                      boxShadow: active ? '0 0 16px rgba(34,197,94,.2)' : undefined,
                    }}
                  >
                    <span className={`text-[14px] font-bold ${active ? 'text-green' : 'text-white'}`}>{p.label}</span>
                    <span className="text-[11px] text-gray2 mt-0.5">${p.price}</span>
                  </button>
                )
              })}
            </div>

            {/* Pay */}
            {selected && (
              <button
                disabled={!!paying}
                onClick={buyWithCrypto}
                className="w-full py-[13px] rounded-xl bg-white text-bg text-[13px] font-bold active:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {paying === 'crypto'
                  ? 'Открываю…'
                  : `${prof?.is_premium ? 'Продлить' : 'Оплатить'} ${selected.price}$ · крипто`}
              </button>
            )}

            {/* Status message */}
            {msg && (
              <div className="mt-3 px-4 py-3 rounded-xl text-[13px] text-white/80" style={{ border: '1px solid rgba(34,197,94,.4)', background: 'rgba(34,197,94,.06)' }}>
                {msg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
