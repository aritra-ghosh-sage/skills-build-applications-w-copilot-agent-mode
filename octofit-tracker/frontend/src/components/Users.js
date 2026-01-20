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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const codespaceName = process.env.REACT_APP_CODESPACE_NAME;
  const endpoint = useMemo(
    () => (codespaceName ? `https://${codespaceName}-8000.app.github.dev/api/users/` : ''),
    [codespaceName]
  );

  const fetchUsers = useCallback(async () => {
    if (!endpoint) {
      console.warn('[Users] Missing REACT_APP_CODESPACE_NAME environment variable.');
      setLoading(false);
      setError('Missing REACT_APP_CODESPACE_NAME environment variable.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Users] Fetching data from', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = await response.json();
      console.log('[Users] Raw payload', payload);
      const normalized = normalizePayload(payload);
      console.log('[Users] Normalized data', normalized);
      setUsers(normalized);
    } catch (fetchError) {
      console.error('[Users] Fetch error', fetchError);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return users;
    }
    return users.filter((user) => JSON.stringify(user).toLowerCase().includes(term));
  }, [users, searchTerm]);

  const handleRefresh = () => fetchUsers();
  const handleViewDetails = (user) => {
    console.log('[Users] Opening modal for', user);
    setSelectedUser(user);
  };
  const handleCloseModal = () => setSelectedUser(null);

  const userTeam = (user) =>
    user?.team?.name || user?.team_name || user?.team || user?.primary_team || 'N/A';

  const userPoints = (user) =>
    user?.points ?? user?.score ?? user?.total_points ?? user?.weekly_points ?? 'N/A';

  const tableContent = (() => {
    if (loading) {
      return (
        <div className="py-5 text-center">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <p className="mt-3 mb-0 text-muted">Loading users...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger mb-0" role="alert">
          Unable to load users: {error}
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return <p className="text-muted mb-0">No users match your search.</p>;
    }

    return (
      <div className="table-responsive rounded-3 border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small text-muted">
            <tr>
              <th scope="col">User</th>
              <th scope="col">Email</th>
              <th scope="col">Team</th>
              <th scope="col">Points</th>
              <th scope="col" className="text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id || user._id || user.uuid || user.slug || index}>
                <td className="fw-semibold">{fallbackText(user.name || user.username)}</td>
                <td>{fallbackText(user.email)}</td>
                <td>{userTeam(user)}</td>
                <td>{userPoints(user)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleViewDetails(user)}
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
            <h2 className="h4 mb-1">Users</h2>
            <p className="text-muted mb-0 small">Explore every athlete connected to OctoFit.</p>
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
              <label htmlFor="usersSearch" className="form-label text-muted text-uppercase fw-semibold">
                Search Users
              </label>
              <input
                id="usersSearch"
                type="search"
                className="form-control"
                placeholder="Search by name, email, or team"
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
        title={fallbackText(selectedUser?.name || selectedUser?.username || 'User Details')}
        data={selectedUser}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Users;
