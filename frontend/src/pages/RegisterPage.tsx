import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Smartphone, User as UserIcon, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  register: (name: string, phone: string) => Promise<void>;
  user: any;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ register, user }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    setLoading(true);
    await register(name, phone);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <Bell size={24} />
          </div>
        </div>
        <h1 className="auth-title">JobAlert</h1>
        <p className="auth-subtitle">Get instant WhatsApp alerts for new job opportunities across the web.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <UserIcon size={18} />
              <input 
                id="name"
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <Smartphone size={18} />
              <input 
                id="phone"
                type="tel" 
                placeholder="919876543210" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            <span>{loading ? 'Joining...' : 'Get Started'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-features">
          <p className="feature-item">✓ Real-time Aggregation</p>
          <p className="feature-item">✓ WhatsApp Notifications</p>
          <p className="feature-item">✓ Smart Keyword Matching</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
