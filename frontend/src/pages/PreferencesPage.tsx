import React, { useState } from 'react';
import type { JobPreference } from '../types';
import { Plus, X, Save, Search, MapPin } from 'lucide-react';

interface PreferencesPageProps {
  user: any;
  updatePreferences: (prefs: JobPreference[]) => Promise<void>;
}

const PreferencesPage: React.FC<PreferencesPageProps> = ({ user, updatePreferences }) => {
  const [prefs, setPrefs] = useState<JobPreference[]>(user?.jobPreferences || []);
  const [newTitle, setNewTitle] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [saving, setSaving] = useState(false);

  const addPreference = () => {
    if (!newTitle) return;
    if (prefs.length >= 5) return;
    setPrefs([...prefs, { title: newTitle, location: newLoc }]);
    setNewTitle('');
    setNewLoc('');
  };

  const removePreference = (index: number) => {
    setPrefs(prefs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    await updatePreferences(prefs);
    setSaving(false);
  };

  return (
    <div className="pref-page">
      <header className="page-header">
        <h1 className="page-title">Job Preferences</h1>
        <p className="page-subtitle">Set up to 5 job roles and locations you're interested in.</p>
      </header>

      <div className="pref-section">
        <div className="pref-section-header">
          <h2>Target Roles</h2>
        </div>
        
        <div className="filters-bar" style={{ boxShadow: 'none', marginBottom: '24px' }}>
          <div className="filter-input">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="e.g. Frontend Developer" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="filter-input">
            <MapPin size={18} />
            <input 
              type="text" 
              placeholder="e.g. Remote" 
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
            />
          </div>
          <button 
            className="primary-btn" 
            onClick={addPreference}
            disabled={prefs.length >= 5 || !newTitle}
            style={{ width: 'auto', padding: '12px 20px' }}
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="jobs-grid">
          {prefs.map((pref, idx) => (
            <div key={idx} className="job-card" style={{ padding: '16px 24px' }}>
              <div className="job-card-header">
                <h3 className="job-title">{pref.title}</h3>
                <div className="info-item">
                  <MapPin size={14} />
                  <span>{pref.location || 'Anywhere'}</span>
                </div>
              </div>
              <button 
                className="logout-btn" 
                onClick={() => removePreference(idx)}
                style={{ color: 'var(--red)' }}
              >
                <X size={18} />
              </button>
            </div>
          ))}
          {prefs.length === 0 && (
             <div className="empty-state" style={{ padding: '40px' }}>
                <p>No preferences set. You'll receive alerts for all software developer jobs.</p>
             </div>
          )}
        </div>
      </div>

      <div className="pref-actions">
        <button 
          className="primary-btn" 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} />
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      <div className="setup-box" style={{ marginTop: '32px' }}>
        <p><strong>💡 Tip:</strong> We'll only send you WhatsApp alerts when we find matches for these roles.</p>
      </div>
    </div>
  );
};

export default PreferencesPage;
