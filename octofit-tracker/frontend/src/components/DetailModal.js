import React from 'react';

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  if (typeof value === 'object') {
    return (
      <pre className="mb-0 bg-light rounded-3 p-3 small text-break">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return value;
};

const DetailModal = ({ title, data, onClose }) => {
  if (!data) {
    return null;
  }

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <dl className="row mb-0 detail-list">
                {Object.entries(data).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <dt className="col-sm-4 text-capitalize text-muted">{key.replace(/_/g, ' ')}</dt>
                    <dd className="col-sm-8 mb-2">{formatValue(value)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default DetailModal;
