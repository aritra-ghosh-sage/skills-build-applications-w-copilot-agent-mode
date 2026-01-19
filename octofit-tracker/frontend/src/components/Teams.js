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

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const codespaceName = process.env.REACT_APP_CODESPACE_NAME;
  const endpoint = useMemo(
    () => (codespaceName ? `https://${codespaceName}-8000.app.github.dev/api/teams/` : ''),
    [codespaceName]
  );

  const fetchTeams = useCallback(async () => {
    if (!endpoint) {
      console.warn('[Teams] Missing REACT_APP_CODESPACE_NAME environment variable.');
      setLoading(false);
      setError('Missing REACT_APP_CODESPACE_NAME environment variable.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Teams] Fetching data from', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = await response.json();
      console.log('[Teams] Raw payload', payload);
      const normalized = normalizePayload(payload);
      console.log('[Teams] Normalized data', normalized);
      setTeams(normalized);
    } catch (fetchError) {
      console.error('[Teams] Fetch error', fetchError);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const filteredTeams = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return teams;
    }
    return teams.filter((team) => JSON.stringify(team).toLowerCase().includes(term));
  }, [teams, searchTerm]);

  const handleRefresh = () => fetchTeams();
  const handleViewDetails = (team) => {
    console.log('[Teams] Opening modal for', team);
    setSelectedTeam(team);
  };
  const handleCloseModal = () => setSelectedTeam(null);

  const membersCount = (team) =>
    team?.members_count ?? team?.member_count ?? team?.members?.length ?? 'N/A';

  const teamLead = (team) => team?.captain || team?.owner || team?.lead || team?.coach || 'N/A';

  const tableContent = (() => {
    if (loading) {
      return (
        <div className="py-5 text-center">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <p className="mt-3 mb-0 text-muted">Loading teams...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger mb-0" role="alert">
          Unable to load teams: {error}
        </div>
      );
    }

    if (filteredTeams.length === 0) {
      return <p className="text-muted mb-0">No teams match your search.</p>;
    }

    return (
      <div className="table-responsive rounded-3 border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small text-muted">
            <tr>
              <th scope="col">Team</th>
              <th scope="col">Description</th>
              <th scope="col">Members</th>
              <th scope="col">Lead</th>
              <th scope="col" className="text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team, index) => (
              <tr key={team.id || team._id || team.uuid || team.slug || index}>
                <td className="fw-semibold">{fallbackText(team.name || team.title)}</td>
                <td>{fallbackText(team.description)}</td>
                <td>{membersCount(team)}</td>
                <td>{teamLead(team)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleViewDetails(team)}
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
            <h2 className="h4 mb-1">Teams</h2>
            <p className="text-muted mb-0 small">Collaborate with squads competing on OctoFit.</p>
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
              <label htmlFor="teamsSearch" className="form-label text-muted text-uppercase fw-semibold">
                Search Teams
              </label>
              <input
                id="teamsSearch"
                type="search"
                className="form-control"
                placeholder="Search by team name, lead, or description"
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
        title={fallbackText(selectedTeam?.name || selectedTeam?.title || 'Team Details')}
        data={selectedTeam}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Teams;
