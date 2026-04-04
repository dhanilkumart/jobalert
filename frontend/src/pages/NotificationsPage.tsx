import React, { useState } from 'react';
import api from '../utils/api';
import { Bell, BellOff, Clock, Smartphone, Check } from 'lucide-react';

interface NotificationsPageProps {
  user: any;
  setUser: (user: any) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ user, setUser }) => {
  const [alertsEnabled, setAlertsEnabled] = useState(user?.alertsEnabled ?? true);
  const [frequency, setFrequency] = useState(user?.frequency || 'instant');
  const [saving, setSaving] = useState(false);

  const handleToggleAlerts = async () => {
    setSaving(true);
    try {
      const { data } = await api.post('/users/toggle-alerts', {
        phone: user.phone,
        alertsEnabled: !alertsEnabled
      });
      setAlertsEnabled(!alertsEnabled);
      setUser(data);
    } catch (err) {
      console.error('Failed to toggle alerts', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = async (freq: string) => {
    setSaving(true);
    try {
      // In a real app, this would be an API call
      // For this MVP, we just update local state
      setFrequency(freq);
      // Simulate API update
      setUser({ ...user, frequency: freq });
    } catch (err) {
      console.error('Failed to update frequency', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notifications-page">
      <header className="page-header">
        <h1>Alert Settings</h1>
        <p>Manage how and when you receive job notifications.</p>
      </header>

      <div className="settings-section">
        <div className="settings-card">
          <div className="settings-info">
             <div className="settings-icon">
                {alertsEnabled ? <Bell className="text-primary" /> : <BellOff className="text-muted" />}
             </div>
             <div className="settings-text">
                <h3>WhatsApp Alerts</h3>
                <p>Receive notifications on your linked phone number.</p>
             </div>
          </div>
          <button 
            className={`toggle-button ${alertsEnabled ? 'on' : 'off'}`}
            onClick={handleToggleAlerts}
            disabled={saving}
          >
            <div className="toggle-slider"></div>
          </button>
        </div>

        {alertsEnabled && (
          <div className="frequency-picker">
            <h3>Alert Frequency</h3>
            <div className="frequency-options">
               {[
                 { id: 'instant', label: 'Instant', icon: <Bell size={18} /> },
                 { id: 'hourly', label: 'Hourly Digest', icon: <Clock size={18} /> },
                 { id: 'daily', label: 'Daily Summary', icon: <Smartphone size={18} /> }
               ].map((option) => (
                 <button 
                   key={option.id}
                   className={`frequency-option ${frequency === option.id ? 'active' : ''}`}
                   onClick={() => handleFrequencyChange(option.id)}
                 >
                   <div className="option-check">
                      {frequency === option.id ? <Check size={14} /> : null}
                   </div>
                   <div className="option-icon">{option.icon}</div>
                   <span>{option.label}</span>
                 </button>
               ))}
            </div>
          </div>
        )}
      </div>

      <div className="info-box">
        <p><strong>Note:</strong> To receive alerts, you must first send <code>join bright-elephant</code> to our WhatsApp number on Twilio.</p>
      </div>
    </div>
  );
};

export default NotificationsPage;
