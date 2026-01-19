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

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const codespaceName = process.env.REACT_APP_CODESPACE_NAME;
  const endpoint = useMemo(
    () => (codespaceName ? `https://${codespaceName}-8000.app.github.dev/api/leaderboard/` : ''),
    [codespaceName]
  );

  const fetchLeaders = useCallback(async () => {
    if (!endpoint) {
      console.warn('[Leaderboard] Missing REACT_APP_CODESPACE_NAME environment variable.');
      setLoading(false);
      setError('Missing REACT_APP_CODESPACE_NAME environment variable.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Leaderboard] Fetching data from', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = await response.json();
      console.log('[Leaderboard] Raw payload', payload);
      const normalized = normalizePayload(payload);
      console.log('[Leaderboard] Normalized data', normalized);
      setLeaders(normalized);
    } catch (fetchError) {
      console.error('[Leaderboard] Fetch error', fetchError);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  const filteredLeaders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return leaders;
    }
    return leaders.filter((entry) => JSON.stringify(entry).toLowerCase().includes(term));
  }, [leaders, searchTerm]);

  const handleRefresh = () => fetchLeaders();
  const handleViewDetails = (entry) => {
    console.log('[Leaderboard] Opening modal for', entry);
    setSelectedEntry(entry);
  };
  const handleCloseModal = () => setSelectedEntry(null);

  const tableContent = (() => {
    if (loading) {
      return (
        <div className="py-5 text-center">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <p className="mt-3 mb-0 text-muted">Loading leaderboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger mb-0" role="alert">
          Unable to load leaderboard: {error}
        </div>
      );
    }

    if (filteredLeaders.length === 0) {
      return <p className="text-muted mb-0">No leaderboard entries match your search.</p>;
    }

    return (
      <div className="table-responsive rounded-3 border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small text-muted">
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Participant</th>
              <th scope="col">Team</th>
              <th scope="col">Score</th>
              <th scope="col" className="text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaders.map((entry, index) => (
              <tr key={entry.id || entry._id || entry.uuid || entry.slug || index}>
                <td className="fw-semibold">{entry.rank || entry.position || index + 1}</td>
                <td>{fallbackText(entry.name || entry.user)}</td>
                <td>{fallbackText(entry.team || entry.affiliation)}</td>
                <td>{fallbackText(entry.score ?? entry.points ?? entry.total)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleViewDetails(entry)}
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
            <h2 className="h4 mb-1">Leaderboard</h2>
            <p className="text-muted mb-0 small">Top performers across the OctoFit community.</p>
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
                htmlFor="leaderboardSearch"
                className="form-label text-muted text-uppercase fw-semibold"
              >
                Search Leaderboard
              </label>
              <input
                id="leaderboardSearch"
                type="search"
                className="form-control"
                placeholder="Search by participant, team, or rank"
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
        title={fallbackText(
          selectedEntry?.name || selectedEntry?.user || 'Leaderboard Entry'
        )}
        data={selectedEntry}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Leaderboard;
