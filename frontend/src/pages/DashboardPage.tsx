import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import type { Job, JobResponse } from '../types';
import JobCard from '../components/JobCard';
import { Search, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');

  // Custom Fetch State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [isFetchingCustom, setIsFetchingCustom] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<JobResponse>('/jobs', {
        params: { 
          page, 
          title: search, 
          location, 
          source: source || undefined 
        }
      });
      setJobs(data.jobs);
      setTotalPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timer);
  }, [page, search, location, source]);

  const handleCustomFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyword) return;
    setIsFetchingCustom(true);
    try {
      await api.post('/jobs/fetch', { keyword: customKeyword, location: customLocation });
      setIsModalOpen(false);
      setCustomKeyword('');
      setCustomLocation('');
      fetchJobs(); // Refresh jobs after custom fetch
    } catch (err) {
      console.error('Failed to fetch custom job', err);
      alert('Error fetching custom job');
    } finally {
      setIsFetchingCustom(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Latest Jobs</h1>
          <p>Find your next opportunity from across the web.</p>
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          + Custom Fetch
        </button>
      </header>

      <div className="filters-bar">
        <div className="filter-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search roles..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-input">
          <MapPin size={18} />
          <input 
            type="text" 
            placeholder="Location..." 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="linkedin">LinkedIn</option>
          <option value="naukri">Naukri</option>
          <option value="shine">Shine</option>
          <option value="indeed">Indeed</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={40} />
          <p>Fetching jobs...</p>
        </div>
      ) : jobs.length > 0 ? (
        <div className="jobs-grid">
          {jobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or preferences.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="jd-button"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="jd-button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h2>Custom Job Fetch</h2>
            <p className="modal-subtitle">Trigger an immediate fetch for a specific role and location.</p>
            <form onSubmit={handleCustomFetch}>
              <div className="input-group">
                <label>Job Role (Keyword)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Next.js Developer"
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Location (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bangalore, Remote"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="outline-btn" onClick={() => setIsModalOpen(false)} disabled={isFetchingCustom}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={isFetchingCustom}>
                  {isFetchingCustom ? <Loader2 className="animate-spin" /> : 'Fetch Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
