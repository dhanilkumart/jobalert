import React, { useState } from 'react';
import type { Job } from '../types';
import { MapPin, Building2, Briefcase, Calendar, Banknote } from 'lucide-react';
import JobDescriptionModal from './JobDescriptionModal';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [showJD, setShowJD] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const capitalizedSource = job.source.charAt(0).toUpperCase() + job.source.slice(1);

  return (
    <>
      <div className="job-card">
        {/* Top Row: Source and Apply */}
        <div className="job-card-top">
          <div className="job-source-pill">
            {capitalizedSource}
          </div>
          <a 
            href={job.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="apply-pill-btn"
          >
            Apply Now
          </a>
        </div>

        {/* Title Row: Title and JD Button */}
        <div className="job-title-row">
          <h3 className="job-title">{job.title}</h3>
          {job.description && (
            <button className="jd-button" onClick={() => setShowJD(true)}>
              Job Description
            </button>
          )}
        </div>

        {/* Meta Row: Company, Location, Date, Exp, Salary */}
        <div className="job-meta-row">
          <div className="meta-item">
            <Building2 size={18} className="meta-icon" />
            <span>{job.company}</span>
          </div>

          <div className="meta-item">
            <MapPin size={18} className="meta-icon" />
            <span>{job.location}</span>
          </div>

          <div className="meta-item">
            <Calendar size={18} className="meta-icon" />
            <span>{formatDate(job.postedAt)}</span>
          </div>

          {job.experience && (
            <div className="meta-item">
              <Briefcase size={20} className="meta-icon" />
              <span>{job.experience}</span>
            </div>
          )}

          {job.salary && (
            <div className="meta-item">
              <Banknote size={20} className="meta-icon" />
              <span>{job.salary}</span>
            </div>
          )}
        </div>
      </div>

      {job.description && (
        <JobDescriptionModal 
          isOpen={showJD}
          onClose={() => setShowJD(false)}
          title={job.title}
          company={job.company}
          description={job.description}
        />
      )}
    </>
  );
};

export default JobCard;

