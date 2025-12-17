import { useState } from 'react';
import styles from './DataTable.module.css';

function DataTable({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = 'No data available',
  onRowClick,
  pagination,
  onPageChange,
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.empty}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={styles.th}
                onClick={() => column.sortable && handleSort(column.key)}
                style={{ cursor: column.sortable ? 'pointer' : 'default' }}
              >
                <div className={styles.thContent}>
                  {column.label}
                  {column.sortable && sortColumn === column.key && (
                    <i className={`bi ${sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className={styles.tr}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <td key={column.key} className={styles.td}>
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key] || '-'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <span className={styles.pageInfo}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            className={styles.pageButton}
            onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;



