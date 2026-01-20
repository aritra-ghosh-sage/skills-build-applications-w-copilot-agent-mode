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

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const codespaceName = process.env.REACT_APP_CODESPACE_NAME;
  const endpoint = useMemo(
    () => (codespaceName ? `https://${codespaceName}-8000.app.github.dev/api/workouts/` : ''),
    [codespaceName]
  );

  const fetchWorkouts = useCallback(async () => {
    if (!endpoint) {
      console.warn('[Workouts] Missing REACT_APP_CODESPACE_NAME environment variable.');
      setLoading(false);
      setError('Missing REACT_APP_CODESPACE_NAME environment variable.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Workouts] Fetching data from', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = await response.json();
      console.log('[Workouts] Raw payload', payload);
      const normalized = normalizePayload(payload);
      console.log('[Workouts] Normalized data', normalized);
      setWorkouts(normalized);
    } catch (fetchError) {
      console.error('[Workouts] Fetch error', fetchError);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const filteredWorkouts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return workouts;
    }
    return workouts.filter((workout) => JSON.stringify(workout).toLowerCase().includes(term));
  }, [workouts, searchTerm]);

  const handleRefresh = () => fetchWorkouts();
  const handleViewDetails = (workout) => {
    console.log('[Workouts] Opening modal for', workout);
    setSelectedWorkout(workout);
  };
  const handleCloseModal = () => setSelectedWorkout(null);

  const focusArea = (workout) =>
    workout?.focus || workout?.category || workout?.goal || workout?.type || 'N/A';

  const intensityLabel = (workout) =>
    workout?.intensity || workout?.level || workout?.difficulty || 'N/A';

  const durationLabel = (workout) =>
    workout?.duration || workout?.time || workout?.length || 'N/A';

  const tableContent = (() => {
    if (loading) {
      return (
        <div className="py-5 text-center">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <p className="mt-3 mb-0 text-muted">Loading workouts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger mb-0" role="alert">
          Unable to load workouts: {error}
        </div>
      );
    }

    if (filteredWorkouts.length === 0) {
      return <p className="text-muted mb-0">No workouts match your search.</p>;
    }

    return (
      <div className="table-responsive rounded-3 border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small text-muted">
            <tr>
              <th scope="col">Workout</th>
              <th scope="col">Focus</th>
              <th scope="col">Intensity</th>
              <th scope="col">Duration</th>
              <th scope="col" className="text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkouts.map((workout, index) => (
              <tr key={workout.id || workout._id || workout.uuid || workout.slug || index}>
                <td className="fw-semibold">{fallbackText(workout.name || workout.title)}</td>
                <td>{focusArea(workout)}</td>
                <td>{intensityLabel(workout)}</td>
                <td>{durationLabel(workout)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleViewDetails(workout)}
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
            <h2 className="h4 mb-1">Workouts</h2>
            <p className="text-muted mb-0 small">Curated training blocks tailored for each athlete.</p>
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
                htmlFor="workoutsSearch"
                className="form-label text-muted text-uppercase fw-semibold"
              >
                Search Workouts
              </label>
              <input
                id="workoutsSearch"
                type="search"
                className="form-control"
                placeholder="Search by name, focus, or intensity"
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
        title={fallbackText(selectedWorkout?.name || selectedWorkout?.title || 'Workout Details')}
        data={selectedWorkout}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Workouts;
