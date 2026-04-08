import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import type { Job, JobResponse } from '../types';
import JobCard from '../components/JobCard';
import { Search, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');
  const [roleCategory, setRoleCategory] = useState('');

  // Custom Fetch State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [isFetchingCustom, setIsFetchingCustom] = useState(false);

  const fetchJobs = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1); // Reset to first page on new search/filter
    }

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const { data } = await api.get<JobResponse>('/jobs', {
        params: { 
          page: currentPage, 
          title: roleCategory || search, // Prioritize roleCategory button if set
          location, 
          source: source || undefined 
        }
      });

      if (isLoadMore) {
        setJobs(prev => [...prev, ...data.jobs]);
        setPage(currentPage);
      } else {
        setJobs(data.jobs);
      }
      setTotalPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Run fetch on mount or when common filters change (search, location, source, roleCategory)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, location, source, roleCategory]);

  const handleCustomFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyword) return;
    setIsFetchingCustom(true);
    try {
      await api.post('/jobs/fetch', { keyword: customKeyword, location: customLocation });
      setIsModalOpen(false);
      setCustomKeyword('');
      setCustomLocation('');
      fetchJobs(false); // Refresh jobs after custom fetch
    } catch (err) {
      console.error('Failed to fetch custom job', err);
      alert('Error fetching custom job');
    } finally {
      setIsFetchingCustom(false);
    }
  };

  const handleRoleFilter = (role: string) => {
    if (roleCategory === role) {
      setRoleCategory(''); // Toggle off
    } else {
      setRoleCategory(role);
      setSearch(''); // Clear manual search when using quick filters
    }
  };

  return (
    <div className="dashboard-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Latest Jobs</h1>
          <p>Find your next opportunity from across the web. (Showing latest 100)</p>
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          + Custom Fetch
        </button>
      </header>

      <div className="filters-section">
        <div className="quick-filters">
          <button 
            className={`filter-pill ${roleCategory === 'Frontend' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('Frontend')}
          >
            Frontend Jobs
          </button>
          <button 
            className={`filter-pill ${roleCategory === 'Technical Engineering' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('Technical Engineering')}
          >
            Technical Engineering
          </button>
          <button 
            className={`filter-pill ${roleCategory === 'Cyber Security' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('Cyber Security')}
          >
            Cyber Security
          </button>
        </div>

        <div className="filters-bar">
          <div className="filter-input">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search roles..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setRoleCategory(''); // Clear quick filter if manual search typing
              }}
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
            value={roleCategory}
            onChange={(e) => setRoleCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Fullstack">Fullstack</option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Technical Engineering">Technical Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="DevOps">DevOps</option>
          </select>
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
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={40} />
          <p>Fetching jobs...</p>
        </div>
      ) : jobs.length > 0 ? (
        <>
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
          
          {page < totalPages && (
            <div className="load-more-container">
              <button 
                className="load-more-btn" 
                onClick={() => fetchJobs(true)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Loading...
                  </>
                ) : (
                  'Load More Jobs'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or preferences.</p>
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
