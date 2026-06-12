import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttemptDetails, savePartialAnswers, submitAttempt } from '../api/attempts';
import { getSurveyDetail } from '../api/surveys';
import { useAuth } from '../hooks/useAuth';
import { ClipboardList, Save, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

export const TakeSurvey = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [attempt, setAttempt] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [answersMap, setAnswersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load details
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const attResult = await getAttemptDetails(attemptId);
        if (attResult.success) {
          setAttempt(attResult.attempt);

          const srvResult = await getSurveyDetail(attResult.attempt.survey_id);
          setSurvey(srvResult);

          // Populate already saved answers
          const initialAnswers = {};
          attResult.answers.forEach(ans => {
            initialAnswers[ans.question_id] = {
              question_id: ans.question_id,
              score: ans.score || ans.numeric_value || 3, // fallback default score
              numeric_value: ans.numeric_value || ans.score || 3,
              selected_option_id: ans.selected_option_id || null,
              answer_text: ans.answer_text || ''
            };
          });
          setAnswersMap(initialAnswers);
        }
      } catch (err) {
        console.error('Error al cargar la encuesta:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [attemptId]);

  const handleLikertChange = (questionId, value) => {
    // Likert texts corresponding to scores
    const LIKERT_TEXTS = {
      1: 'Nunca se hace',
      2: 'Raras veces se hace',
      3: 'A veces se hace',
      4: 'Frecuentemente se hace',
      5: 'Siempre se hace sin falta'
    };

    // Find the specific question to get the option ID
    const question = survey?.questions?.find(q => q.id === questionId);
    const matchedOption = question?.options?.find(opt => Number(opt.valor) === Number(value));

    setAnswersMap(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        score: value,
        numeric_value: value,
        selected_option_id: matchedOption?.id || null,
        answer_text: matchedOption?.texto || LIKERT_TEXTS[value]
      }
    }));
  };

  const handleTextChange = (questionId, text) => {
    setAnswersMap(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        score: 3, // default score for text answers
        numeric_value: 3,
        selected_option_id: null,
        answer_text: text
      }
    }));
  };

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    const answersArray = Object.values(answersMap);
    const result = await savePartialAnswers(attemptId, answersArray);
    setSaving(false);

    if (result.success) {
      showToastMsg('Borrador guardado correctamente.');
    } else {
      showToastMsg(`Error al guardar: ${result.error || 'error desconocido'}`, 'error');
    }
  };

  const handleSubmit = async () => {
    // Check that all questions have been answered
    const unansweredCount = survey.questions.filter(q => !answersMap[q.id]).length;
    
    if (unansweredCount > 0) {
      showToastMsg(`Faltan ${unansweredCount} preguntas por responder.`, 'error');
      setShowConfirmModal(false);
      return;
    }

    setSaving(true);
    const answersArray = Object.values(answersMap);
    
    // 1. Save answers first
    const saveResult = await savePartialAnswers(attemptId, answersArray);
    if (!saveResult.success) {
      setSaving(false);
      setShowConfirmModal(false);
      showToastMsg(`Error al guardar respuestas: ${saveResult.error || 'error desconocido'}`, 'error');
      return;
    }
    
    // 2. Submit the attempt to trigger calculation
    const submitResult = await submitAttempt(attemptId);
    setSaving(false);
    setShowConfirmModal(false);

    if (submitResult.success) {
      navigate(`/surveys/${attempt.survey_id}?attempt=${attemptId}`);
    } else {
      showToastMsg(`Error al enviar: ${submitResult.error || 'error desconocido'}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 className="spinner" size={40} />
        <p>Cargando cuestionario y respuestas...</p>
      </div>
    );
  }

  if (!survey || !attempt) {
    return (
      <div className="page-container">
        <h2>Evaluación no encontrada</h2>
        <button className="logout-btn" onClick={() => navigate('/')}>Volver al Catálogo</button>
      </div>
    );
  }

  return (
    <div className="page-container survey-take-container">
      {/* Toast Alert Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="page-header survey-take-header">
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '0.5rem 1.1rem',
            background: 'var(--primary-light)',
            border: '1.5px solid rgba(140,91,48,0.30)',
            borderRadius: '10px',
            color: 'var(--primary-color)',
            fontWeight: 700, fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 4px rgba(140,91,48,0.08)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(140,91,48,0.16)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--primary-light)';
            e.currentTarget.style.borderColor = 'rgba(140,91,48,0.30)';
          }}
        >
          <ArrowLeft size={15} />
          Catálogo
        </button>
        <div>
          <h1>Respondiendo: {survey.titulo}</h1>
          <p className="page-subtitle">Compañía: <strong>{attempt.company?.nombre_empresa || user?.nombreEmpresa || 'Mi Empresa'}</strong></p>
        </div>
      </header>

      {/* Questions list */}
      <div className="take-questions-list">
        {survey.questions.map((q, idx) => {
          const currentAnswer = answersMap[q.id];
          const isLikert = q.tipo === 'LIKERT';
          
          return (
            <div key={q.id} className="take-question-card">
              <div className="take-question-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span className="question-number" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pregunta {idx + 1}</span>
                <span className="question-cat" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'var(--secondary-light)', color: 'var(--secondary-color)', border: '1px solid rgba(181,140,25,0.25)', whiteSpace: 'nowrap' }}>{q.category?.name || 'General'}</span>
              </div>
              <p className="take-question-text">{q.pregunta}</p>

              {/* Likert 1-5 selector */}
              {isLikert ? (
                <div className="likert-scale-container">
                  <div className="likert-scale-labels" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>⬇ Crítico</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>Excelente ⬆</span>
                  </div>
                  <div className="likert-options">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const isSelected = currentAnswer?.score === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          className={`likert-opt-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => handleLikertChange(q.id, score)}
                        >
                          <span className="likert-value">{score}</span>
                        </button>
                      );
                    })}
                  </div>
                  {currentAnswer?.answer_text && (
                    <p className="likert-selected-desc">
                      Seleccionado: <strong>{currentAnswer.answer_text}</strong>
                    </p>
                  )}
                </div>
              ) : (
                /* Text Input */
                <div className="text-answer-container">
                  <textarea
                    rows={4}
                    placeholder="Escribe tu respuesta detallada aquí..."
                    value={currentAnswer?.answer_text || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="take-actions-bar">
        <button 
          className="btn-secondary-custom" 
          onClick={handleSaveDraft}
          disabled={saving}
        >
          <Save size={18} />
          <span>Guardar Borrador</span>
        </button>

        <button 
          className="btn-primary-custom"
          onClick={() => setShowConfirmModal(true)}
          disabled={saving}
        >
          <CheckCircle size={18} />
          <span>Finalizar y Calificar</span>
        </button>
      </div>

      {/* Confirmation Submit Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Finalizar Evaluación</h3>
            <p>¿Estás seguro de que deseas enviar esta evaluación? Una vez finalizada, se calculará el puntaje de madurez y no podrás cambiar las respuestas.</p>
            <div className="modal-actions">
              <button 
                className="modal-cancel-btn" 
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                className="modal-submit-btn" 
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Enviando...' : 'Sí, enviar y calificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeSurvey;
