import React, { useState } from 'react';
import api from '../utils/api';
import { Trash2, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClearData = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    try {
      await api.delete('/jobs/clear-all');
      setSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clear data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and application data.</p>
      </header>

      <div className="pref-container">
        <div className="pref-section">
          <div className="pref-section-header">
            <div>
              <h2>Data Management</h2>
              <p>Control your stored job listings and history.</p>
            </div>
            <ShieldAlert className="text-muted" size={24} />
          </div>

          <div className="settings-card" style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: '12px' }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Clear Fetched Data</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Permanentely delete all job listings from the database.</p>
              </div>
            </div>

            {success ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--green)', background: 'var(--green-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 500 }}>
                <CheckCircle size={18} />
                <span>Successfully cleared all job data!</span>
              </div>
            ) : (
              <button 
                className="outline-btn" 
                style={{ color: 'var(--red)', borderColor: 'var(--red)', background: 'transparent' }}
                onClick={() => setShowConfirm(true)}
              >
                Clear All Data
              </button>
            )}

            {error && (
              <div style={{ marginTop: '12px', color: 'var(--red)', fontSize: '13px' }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                width: '64px', height: '64px', background: 'var(--red-bg)', color: 'var(--red)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <AlertTriangle size={32} />
              </div>
              <h2 style={{ marginBottom: '8px' }}>Are you sure?</h2>
              <p className="modal-subtitle" style={{ fontSize: '15px' }}>
                This action will delete <strong>all</strong> your fetched job data. This cannot be undone.
              </p>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
              <button 
                className="outline-btn" 
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="primary-btn" 
                style={{ background: 'var(--red)' }}
                onClick={handleClearData}
                disabled={loading}
              >
                {loading ? 'Clearing...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
