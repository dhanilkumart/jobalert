import React from 'react';
import { X, Briefcase, Info } from 'lucide-react';

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  company: string;
  description: string;
}

const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  isOpen,
  onClose,
  title,
  company,
  description
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content jd-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-icon-bg">
              <Briefcase size={20} />
            </div>
            <div>
              <h2>Job Description</h2>
              <p className="modal-subtitle">{title} at {company}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body jd-body">
          <div className="jd-section">
            <div className="jd-section-header">
              <Info size={16} />
              <h3>Details</h3>
            </div>
            <div className="jd-text">
              {description.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="primary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionModal;
