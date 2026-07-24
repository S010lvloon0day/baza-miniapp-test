import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown } from '@phosphor-icons/react'
import { api } from '../api/client'
import type { Section, Material, Banner } from '../api/client'
import BannerCard from '../components/BannerCard'
import CategoryIcon from '../components/CategoryIcon'
import BazaMark from '../components/BazaMark'

interface Props {
  onSection: (s: Section) => void
  onMaterial: (id: number, sectionId: number) => void
  onTabCats: () => void
  botUsername?: string
}

export default function HomePage({ onSection, onMaterial, onTabCats, botUsername }: Props) {
  const [sections, setSections] = useState<Section[]>([])
  const [recent, setRecent] = useState<Material[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [d, b, rd] = await Promise.all([
        api.sections().catch(() => ({ sections: [] as Section[] })),
        api.banner().catch(() => ({ banners: [] as Banner[] })),
        api.recent().catch(() => ({ materials: [] as Material[], today_count: 0, today_sections: [], total_count: 0 })),
      ])
      if (!alive) return
      setSections(d.sections.filter(s => !s.parent_id))
      setBanners(b.banners ?? [])
      setRecent((rd.materials ?? []).slice(0, 4))
      setTotalCount(rd.total_count ?? 0)
      setLoading(false)
    })()
    return () => { alive = false }
  }, [])

  const openSubmit = () => {
    if (!botUsername) return
    const url = `https://t.me/${botUsername}?start=submit`
    const tg = (window as any).Telegram?.WebApp
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

  const featured = sections.find(s => s.title === 'Знания S010lvloon')

  return (
    <div className="flex-1 overflow-y-auto pb-14">
      <div className="px-4 pt-3">

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-[22px] px-5 pt-[22px] pb-6 mb-5"
          style={{ border: '1px solid rgba(255,255,255,.08)', background: 'radial-gradient(120% 100% at 100% 0%, rgba(34,197,94,.10), transparent 55%), #0D0D11' }}
        >
          <div className="absolute pointer-events-none" style={{ opacity: .045, right: -30, top: 20 }}>
            <BazaMark size={200} color="#fff" />
          </div>

          <div className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-[18px]" style={{ border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.03)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green" style={{ boxShadow: '0 0 6px #22C55E' }} />
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#cfcfd4]">База знаний S010lvloon</span>
          </div>

          <div className="relative text-[27px] font-extrabold leading-[1.16] tracking-[-.4px] mb-2.5">
            Все материалы<br />
            <span className="text-green" style={{ textShadow: '0 0 24px rgba(34,197,94,.5)' }}>в одном месте</span>
          </div>
          <div className="relative text-[13px] text-[#9a9aa2] leading-relaxed mb-5 max-w-[270px]">
            Гайды, инструменты и разборы по темам. Открывай раздел или ищи материал по названию.
          </div>

          <div className="relative flex gap-2">
            <button
              onClick={onTabCats}
              className="flex-1 py-[13px] rounded-xl bg-white text-bg text-[13px] font-bold active:opacity-90 transition-opacity"
              style={{ boxShadow: '0 6px 18px rgba(255,255,255,.08)' }}
            >
              Смотреть разделы
            </button>
            <button
              onClick={openSubmit}
              className="flex-1 py-[13px] rounded-xl text-white text-[13px] font-bold active:bg-white/[.08] transition-colors"
              style={{ border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.03)' }}
            >
              Предложить материал
            </button>
          </div>
        </div>

        {/* Banner slot */}
        {banners.length > 0 && (
          <div className="rounded-[18px] overflow-hidden mb-5" style={{ border: '1px solid rgba(255,255,255,.08)' }}>
            <BannerCard banners={banners} />
          </div>
        )}

        {/* Stat bar */}
        <div className="flex rounded-2xl py-4 mb-6" style={{ border: '1px solid rgba(255,255,255,.08)', background: '#0D0D11' }}>
          <div className="flex-1 text-center">
            <div className="text-[18px] font-extrabold">{totalCount}+</div>
            <div className="text-[10px] text-[#8a8a93] mt-[3px]">материалов</div>
          </div>
          <div className="flex-1 text-center" style={{ borderLeft: '1px solid rgba(255,255,255,.08)', borderRight: '1px solid rgba(255,255,255,.08)' }}>
            <div className="text-[18px] font-extrabold">100%</div>
            <div className="text-[10px] text-[#8a8a93] mt-[3px]">бесплатно</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-[18px] font-extrabold">24/7</div>
            <div className="text-[10px] text-[#8a8a93] mt-[3px]">поддержка</div>
          </div>
        </div>

        {/* Новое */}
        {recent.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#9a9aa2]">Новое</span>
              <button onClick={onTabCats} className="text-green text-[12px] font-bold active:opacity-70 transition-opacity">Все ›</button>
            </div>
            <div className="flex flex-col gap-2.5 mb-7">
              {recent.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onMaterial(m.id, m.section_id)}
                  className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer active:border-green/40 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,.08)', background: '#101014' }}
                >
                  <div
                    className="shrink-0 w-[42px] h-[42px] rounded-xl flex items-center justify-center"
                    style={{ background: 'radial-gradient(circle,rgba(34,197,94,.28),rgba(34,197,94,.06) 65%,transparent)', boxShadow: '0 0 14px rgba(34,197,94,.3)' }}
                  >
                    <span className="text-lg">{m.section_emoji || '📁'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#8a8a93] mb-0.5 truncate">{m.section_title}</div>
                    <div className="text-[14px] font-semibold truncate">{m.title}</div>
                  </div>
                  {m.locked && <Crown size={14} weight="fill" className="shrink-0 text-violet opacity-80" />}
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Featured — авторский раздел S010lvloon */}
        {featured && (
            <div
              onClick={() => onSection(featured)}
              className="relative mb-5 cursor-pointer overflow-hidden rounded-md active:opacity-80 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, rgba(255,188,46,.12), rgba(255,140,0,.05))',
                border: '1px solid rgba(255,188,46,.45)',
                boxShadow: '0 0 22px rgba(255,188,46,.12)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,188,46,.8), transparent)' }} />
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,188,46,.14)', border: '1px solid rgba(255,188,46,.35)' }}>
                  {featured.emoji || '🧠'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-1 rounded-sm" style={{ background: 'rgba(255,188,46,.18)' }}>
                    <span className="text-[8px] font-bold tracking-[2px] uppercase" style={{ color: '#FFBC2E' }}>★ Автор</span>
                  </div>
                  <div className="text-[14px] font-bold text-white leading-tight truncate">{featured.title}</div>
                  <div className="text-[10px] font-mono mt-0.5 truncate" style={{ color: 'rgba(255,188,46,.7)' }}>// курс · публикации · фишки</div>
                </div>
                <span className="font-bold text-[20px] shrink-0" style={{ color: '#FFBC2E' }}>›</span>
              </div>
            </div>
        )}

        {/* Categories */}
        <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#9a9aa2] mb-3.5">Разделы</div>
        <div className="grid grid-cols-4 gap-2 pb-4">
          {sections.filter(s => s.title !== 'Знания S010lvloon').slice(0, 8).map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSection(s)}
              className="relative rounded-2xl p-3 flex flex-col items-center gap-1.5 cursor-pointer overflow-hidden transition-colors active:border-green/50"
              style={{ border: '1px solid rgba(255,255,255,.09)', background: 'radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,.05), transparent 60%), #101014' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent)' }} />
              <span className="absolute top-1.5 left-1.5 font-mono text-[8px] text-gray2/60 leading-none tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="w-10 h-10 flex items-center justify-center">
                <CategoryIcon title={s.title} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3px] text-[#d4d4d8] text-center leading-tight w-full line-clamp-2">
                {s.title}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Ad contact */}
        <div className="pb-6 pt-1">
          <button
            onClick={() => {
              const tg = (window as any).Telegram?.WebApp
              if (tg?.openTelegramLink) tg.openTelegramLink('https://t.me/S010lvloon_bot')
              else window.open('https://t.me/S010lvloon_bot', '_blank')
            }}
            className="w-full flex items-center justify-center gap-2 h-10 rounded border border-bd2 bg-s1 active:border-green active:bg-s2 transition-colors"
          >
            <span className="text-[13px]">📣</span>
            <span className="text-[11px] font-semibold tracking-[1px] uppercase text-gray2">
              По вопросам рекламы
            </span>
            <span className="text-[11px] text-green font-bold">@S010lvloon_bot</span>
          </button>
        </div>
      </div>
    </div>
  )
}
