'use client'

import useSWR from 'swr'
import { FormEvent, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowUpRight, Banknote, Calculator, Check, Database, FileText, Plus, RefreshCw, Users } from 'lucide-react'

let supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    )
  }
  return supabase
}

const fetcher = async (key: string) => {
  const { data, error } = await getSupabase().from(key).select('*').order(key === 'EMPLOYEE' ? 'ID_KARYAWAN' : key === 'SALARY' ? 'ID_SALARY' : 'ID_BONUS', { ascending: false })
  if (error) throw error
  return data ?? []
}

function money(value: number) {
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`
}
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

type Employee = { ID_KARYAWAN: number; NAMA_KARYAWAN: string; KODE_KARYAWAB: string; TANGGAL_LAHIR: string; ALAMAT: string }
type Salary = { ID_SALARY: number; BULAN: number; TAHUN: number; SALARY: number; ID_KARYAWAN: number }
type Bonus = { ID_BONUS: number; BONUS: number; TOTAL: number; ID_KARYAWAN: number; ID_SALARY: number }

export default function PayrollApp({ initialActive = 'employee' }: { initialActive?: 'employee' | 'salary' | 'bonus' | 'report' }) {
  const employees = useSWR<Employee[]>('EMPLOYEE', fetcher)
  const salaries = useSWR<Salary[]>('SALARY', fetcher)
  const bonuses = useSWR<Bonus[]>('BONUS', fetcher)
  const pathname = usePathname()
  const router = useRouter()
  const active = pathname === '/salary' ? 'salary' : pathname === '/bonus' ? 'bonus' : pathname === '/report' ? 'report' : 'employee'
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const totalSalary = useMemo(() => salaries.data?.reduce((sum, row) => sum + Number(row.SALARY), 0) ?? 0, [salaries.data])
  const totalBonus = useMemo(() => bonuses.data?.reduce((sum, row) => sum + Number(row.TOTAL), 0) ?? 0, [bonuses.data])

  async function refresh() {
    await Promise.all([employees.mutate(), salaries.mutate(), bonuses.mutate()])
  }

  async function submitEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); setError('')
    const form = new FormData(event.currentTarget)
    const { error: insertError } = await (getSupabase() as any).from('EMPLOYEE').insert({ NAMA_KARYAWAN: form.get('name'), KODE_KARYAWAB: form.get('code'), TANGGAL_LAHIR: form.get('birth'), ALAMAT: form.get('address') })
    if (insertError) setError(insertError.message); else { setMessage('Data karyawan berhasil disimpan.'); event.currentTarget.reset(); await employees.mutate() }
    setBusy(false)
  }

  async function submitSalary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); setError('')
    const form = new FormData(event.currentTarget)
    const { error: insertError } = await (getSupabase() as any).from('SALARY').insert({ BULAN: Number(form.get('month')), TAHUN: Number(form.get('year')), SALARY: Number(form.get('salary')), ID_KARYAWAN: Number(form.get('employee')) })
    if (insertError) setError(insertError.message); else { setMessage('Transaksi salary berhasil disimpan.'); event.currentTarget.reset(); await salaries.mutate() }
    setBusy(false)
  }

  async function submitBonus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); setError('')
    const form = new FormData(event.currentTarget)
    const salary = salaries.data?.find((row) => row.ID_SALARY === Number(form.get('salaryId')))
    if (!salary) { setError('Pilih transaksi salary yang valid.'); setBusy(false); return }
    const { error: insertError } = await (getSupabase() as any).from('BONUS').insert({ BONUS: 0.05, TOTAL: Number(salary.SALARY) * 0.05, ID_KARYAWAN: salary.ID_KARYAWAN, ID_SALARY: salary.ID_SALARY })
    if (insertError) setError(insertError.message); else { setMessage('Bonus 5% berhasil dihitung dan disimpan.'); event.currentTarget.reset(); await bonuses.mutate() }
    setBusy(false)
  }

  const loading = employees.isLoading || salaries.isLoading || bonuses.isLoading
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">AS</div><div><strong>Asia Suaka</strong><span>Payroll Control</span></div></div>
        <div className="side-label">Modul transaksi</div>
        <nav className="nav-list" aria-label="Navigasi transaksi">
          {[['employee', 'Karyawan', Users], ['salary', 'Salary', Banknote], ['bonus', 'Bonus', Calculator], ['report', 'Report', FileText]].map(([key, label, Icon]) => <button key={key as string} className={active === key ? 'nav-item active' : 'nav-item'} onClick={() => router.push(`/${key as string}`)}><Icon size={18} /><span>{label as string}</span><ArrowUpRight size={14} /></button>)}
        </nav>
        <div className="sidebar-note"><Database size={18} /><div><strong>Supabase connected</strong><span>Data tersimpan real-time</span></div></div>
      </aside>
      <section className="content">
        <header className="topbar"><div><p className="eyebrow">PT ASIA SUAKA / HR OPERATIONS</p><h1>{active === 'report' ? 'Laporan Payroll & Bonus' : 'Payroll & Bonus Control'}</h1></div><button className="refresh" onClick={refresh}><RefreshCw size={16} /> Sinkronkan data</button></header>
        <div className="stats-grid"><Stat icon={<Users />} label="Total karyawan" value={String(employees.data?.length ?? 0)} detail="Data aktif pada master" /><Stat icon={<Banknote />} label="Total salary" value={money(totalSalary)} detail="Seluruh periode tercatat" /><Stat icon={<Calculator />} label="Total bonus" value={money(totalBonus)} detail="Formula salary × 5%" /></div>
        {active !== 'report' && <div className="workspace">
          <div className="panel form-panel"><div className="panel-heading"><div><p className="eyebrow">INPUT TRANSAKSI</p><h2>{active === 'employee' ? 'Master Karyawan' : active === 'salary' ? 'Transaksi Salary' : 'Transaksi Bonus'}</h2></div><span className="status-pill"><span />Terhubung</span></div>
            {active === 'employee' && <form onSubmit={submitEmployee}><Field label="Nama karyawan" name="name" placeholder="Contoh: Dimas Pratama" required /><div className="form-row"><Field label="Kode karyawan" name="code" placeholder="EMP004" maxLength={6} required /><Field label="Tanggal lahir" name="birth" type="date" required /></div><Field label="Alamat" name="address" placeholder="Alamat domisili" required /><Submit busy={busy} label="Simpan karyawan" /> </form>}
            {active === 'salary' && <form onSubmit={submitSalary}><div className="form-row"><label> Bulan<select name="month" defaultValue="2">{months.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}</select></label><Field label="Tahun" name="year" type="number" defaultValue="2026" min={2000} required /></div><label>Karyawan<select name="employee" required defaultValue=""> <option value="" disabled>Pilih karyawan</option>{employees.data?.map((employee) => <option key={employee.ID_KARYAWAN} value={employee.ID_KARYAWAN}>{employee.KODE_KARYAWAB} — {employee.NAMA_KARYAWAN.trim()}</option>)}</select></label><Field label="Nilai salary" name="salary" type="number" placeholder="12500000" min={1} required /><Submit busy={busy} label="Simpan salary" /></form>}
            {active === 'bonus' && <form onSubmit={submitBonus}><div className="formula-card"><Calculator size={22} /><div><strong>Formula bonus standar</strong><span>BONUS = SALARY periode × 5%</span></div><b>5%</b></div><label>Transaksi salary<select name="salaryId" required defaultValue=""><option value="" disabled>Pilih salary periode</option>{salaries.data?.map((salary) => <option key={salary.ID_SALARY} value={salary.ID_SALARY}>#{salary.ID_SALARY} · {months[salary.BULAN - 1]} {salary.TAHUN} · {money(salary.SALARY)}</option>)}</select></label><Submit busy={busy} label="Hitung & simpan bonus" /></form>}
            {message && <p className="feedback success"><Check size={15} />{message}</p>}{error && <p className="feedback error">{error}</p>}
          </div>
          <div className="panel rule-panel"><p className="eyebrow">ATURAN PROGRAM</p><h2>Siklus bonus tahunan</h2><div className="timeline"><div className="timeline-item current"><b>FEB</b><div><strong>Mulai perhitungan</strong><span>Bonus mulai diberikan pada bulan Februari tahun berjalan.</span></div></div><div className="timeline-item"><b>JAN</b><div><strong>Reset saldo bonus</strong><span>Nilai bonus kembali menjadi nol setiap bulan Januari.</span></div></div></div><div className="rule-foot"><span>Periode aktif</span><strong>Februari 2026</strong></div></div>
        </div>}
        <Report employees={employees.data ?? []} salaries={salaries.data ?? []} bonuses={bonuses.data ?? []} loading={loading} />
      </section>
    </main>
  )
}

function Stat({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) { return <div className="stat-card"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div> }
function Field({ label, name, type = 'text', placeholder, ...props }: { label: string; name: string; type?: string; placeholder?: string; [key: string]: unknown }) { return <label>{label}<input name={name} type={type} placeholder={placeholder} {...props} /></label> }
function Submit({ busy, label }: { busy: boolean; label: string }) { return <button className="submit" disabled={busy} type="submit"><Plus size={17} />{busy ? 'Menyimpan...' : label}</button> }
function Report({ employees, salaries, bonuses, loading }: { employees: Employee[]; salaries: Salary[]; bonuses: Bonus[]; loading: boolean }) { const employeeName = (id: number) => employees.find((item) => item.ID_KARYAWAN === id)?.NAMA_KARYAWAN.trim() ?? '-'; return <section className="panel report-panel"><div className="panel-heading"><div><p className="eyebrow">LIVE REPORT</p><h2>Rekap seluruh payroll & bonus</h2><small>Seluruh transaksi salary yang sudah diinput, termasuk bonus yang belum dihitung.</small></div><span className="record-count">{salaries.length} record</span></div><div className="table-wrap"><table><thead><tr><th>Nama</th><th>Bulan</th><th>Tahun</th><th>Salary</th><th>Bonus</th><th>Total</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="empty">Memuat data...</td></tr> : salaries.map((salary) => { const bonus = bonuses.find((item) => item.ID_SALARY === salary.ID_SALARY); return <tr key={salary.ID_SALARY}><td><strong>{employeeName(salary.ID_KARYAWAN)}</strong></td><td>{months[salary.BULAN - 1] ?? '-'}</td><td>{salary.TAHUN}</td><td>{money(salary.SALARY)}</td><td>{bonus ? <span className="rate">{Number(bonus.BONUS) * 100}%</span> : <span className="muted">Belum dihitung</span>}</td><td className="total">{money(Number(salary.SALARY) + (bonus ? Number(bonus.TOTAL) : 0))}</td></tr> })}{!loading && salaries.length === 0 && <tr><td colSpan={6} className="empty">Belum ada transaksi salary untuk direkap.</td></tr>}</tbody></table></div></section> }
