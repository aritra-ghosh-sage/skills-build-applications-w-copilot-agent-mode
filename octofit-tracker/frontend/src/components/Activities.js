import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DetailModal from './DetailModal';

const normalizePayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }
  return [];
};

const fallbackText = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  return value;
};

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const codespaceName = process.env.REACT_APP_CODESPACE_NAME;
  const endpoint = useMemo(
    () => (codespaceName ? `https://${codespaceName}-8000.app.github.dev/api/activities/` : ''),
    [codespaceName]
  );

  const fetchActivities = useCallback(async () => {
    if (!endpoint) {
      console.warn('[Activities] Missing REACT_APP_CODESPACE_NAME environment variable.');
      setLoading(false);
      setError('Missing REACT_APP_CODESPACE_NAME environment variable.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Activities] Fetching data from', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = await response.json();
      console.log('[Activities] Raw payload', payload);
      const normalized = normalizePayload(payload);
      console.log('[Activities] Normalized data', normalized);
      setActivities(normalized);
    } catch (fetchError) {
      console.error('[Activities] Fetch error', fetchError);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return activities;
    }
    return activities.filter((activity) =>
      JSON.stringify(activity).toLowerCase().includes(term)
    );
  }, [activities, searchTerm]);

  const handleRefresh = () => fetchActivities();
  const handleViewDetails = (activity) => {
    console.log('[Activities] Opening modal for', activity);
    setSelectedActivity(activity);
  };
  const handleCloseModal = () => setSelectedActivity(null);

  const tableContent = (() => {
    if (loading) {
      return (
        <div className="py-5 text-center">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <p className="mt-3 mb-0 text-muted">Loading activities...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger mb-0" role="alert">
          Unable to load activities: {error}
        </div>
      );
    }

    if (filteredActivities.length === 0) {
      return <p className="text-muted mb-0">No activities match your search.</p>;
    }

    return (
      <div className="table-responsive rounded-3 border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small text-muted">
            <tr>
              <th scope="col">Activity</th>
              <th scope="col">Description</th>
              <th scope="col">Duration</th>
              <th scope="col" className="text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.map((activity, index) => (
              <tr key={activity.id || activity._id || activity.uuid || activity.slug || index}>
                <td className="fw-semibold">
                  {fallbackText(activity.name || activity.title)}
                </td>
                <td>{fallbackText(activity.description)}</td>
                <td>{fallbackText(activity.duration)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleViewDetails(activity)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  })();

  return (
    <section className="py-4">
      <div className="card shadow-sm section-card">
        <div className="card-header">
          <div>
            <h2 className="h4 mb-1">Activities</h2>
            <p className="text-muted mb-0 small">Live feed of activities recorded by OctoFit.</p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {endpoint && (
              <a
                className="btn btn-link btn-sm text-decoration-none"
                href={endpoint}
                target="_blank"
                rel="noreferrer"
              >
                View API
              </a>
            )}
            <button type="button" className="btn btn-primary btn-sm" onClick={handleRefresh}>
              Refresh
            </button>
          </div>
        </div>
        <div className="card-body">
          <form className="row g-2 align-items-end mb-4" onSubmit={(event) => event.preventDefault()}>
            <div className="col-md-6">
              <label
                htmlFor="activitiesSearch"
                className="form-label text-muted text-uppercase fw-semibold"
              >
                Search Activities
              </label>
              <input
                id="activitiesSearch"
                type="search"
                className="form-control"
                placeholder="Search by name, description, or duration"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="col-md-6 d-flex justify-content-md-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </button>
              <button type="button" className="btn btn-outline-primary" onClick={handleRefresh}>
                Refresh Data
              </button>
            </div>
          </form>
          {tableContent}
        </div>
      </div>
      <DetailModal
        title={fallbackText(selectedActivity?.name || selectedActivity?.title || 'Activity Details')}
        data={selectedActivity}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Activities;
