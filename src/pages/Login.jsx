import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BarChart2, ClipboardList, Building2, Users,
  ShieldCheck, TrendingUp, ChevronRight, Lock
} from 'lucide-react';

const features = [
  {
    icon: <ClipboardList size={22} />,
    title: 'Encuestas de Madurez',
    desc: 'Evalúa el nivel de madurez de la cadena de suministro de cada empresa con encuestas estructuradas y personalizadas.',
    color: '#8c5b30',
    bg: 'rgba(140,91,48,0.1)',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Reportes en Tiempo Real',
    desc: 'Visualiza los resultados con gráficas interactivas de barras, pastel y distribución por categoría.',
    color: '#b58c19',
    bg: 'rgba(181,140,25,0.1)',
  },
  {
    icon: <Building2 size={22} />,
    title: 'Vista por Empresa',
    desc: 'Analiza el desempeño de cada empresa con rankings, puntajes históricos y nivel de madurez consolidado.',
    color: '#4d661b',
    bg: 'rgba(77,102,27,0.12)',
  },
  {
    icon: <Users size={22} />,
    title: 'Gestión de Usuarios',
    desc: 'Administra los accesos con roles diferenciados: Administrador Global, Admin Empresa y Evaluador.',
    color: '#5b4fb5',
    bg: 'rgba(91,79,181,0.1)',
  },
];

const stats = [
  { value: '5 Niveles', label: 'de Madurez', icon: <TrendingUp size={18} /> },
  { value: 'Multi-Rol', label: 'de Acceso', icon: <ShieldCheck size={18} /> },
  { value: '100%', label: 'Trazabilidad', icon: <BarChart2 size={18} /> },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.error || 'Credenciales incorrectas');
    }
  };

  const handleQuickFill = (mockEmail, mockPassword) => {
    setEmail(mockEmail);
    setPassword(mockPassword);
  };

  return (
    <div className="login-landing-root">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      {/* ── Left panel: branding + features ── */}
      <div className="login-left-panel">
        {/* Logo */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <BarChart2 size={28} color="#fff" />
          </div>
          <div>
            <span className="login-brand-name">SurveyPulse</span>
            <span className="login-brand-tag">Analytics</span>
          </div>
        </div>

        {/* Hero headline */}
        <div className="login-hero-text">
          <h1 className="login-hero-h1">
            Inteligencia para tu<br />
            <span className="login-hero-gradient">cadena de suministro</span>
          </h1>
          <p className="login-hero-p">
            Plataforma integral de diagnóstico y seguimiento del nivel de madurez
            en Supply Chain para empresas de alto desempeño.
          </p>
        </div>

        {/* Stats bar */}
        <div className="login-stats-row">
          {stats.map((s, i) => (
            <div key={i} className="login-stat-item">
              <span className="login-stat-icon">{s.icon}</span>
              <span className="login-stat-value">{s.value}</span>
              <span className="login-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="login-features-grid">
          {features.map((f, i) => (
            <div key={i} className="login-feature-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="login-feature-icon" style={{ background: f.bg, color: f.color }}>
                {f.icon}
              </div>
              <div>
                <div className="login-feature-title">{f.title}</div>
                <div className="login-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer tagline */}
        <div className="login-panel-footer">
          <ShieldCheck size={14} />
          <span>Plataforma segura · Datos en tiempo real · Gestión centralizada</span>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="login-right-panel">
        <div className="login-form-card">
          {/* Card top accent */}
          <div className="login-form-card-bar" />

          <div className="login-form-header">
            <div className="login-form-lock-icon">
              <Lock size={20} color="#8c5b30" />
            </div>
            <h2 className="login-form-title">Acceso al Portal</h2>
            <p className="login-form-subtitle">Ingresa tus credenciales para continuar</p>
          </div>

          {errorMsg && (
            <div className="login-error-alert">
              <span>⚠</span> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-body">
            <div className="login-field">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={submitting}>
              {submitting ? (
                <span className="login-btn-loading">Iniciando sesión…</span>
              ) : (
                <>
                  Entrar
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;
