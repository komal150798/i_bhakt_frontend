import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import Table from '../../components/Table/Table';
import Loader from '../../../common/components/Loader/Loader';
import styles from './ContentPage.module.css';

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  {
    key: 'updatedAt',
    label: 'Last Updated',
    render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
  },
];

function ContentPage() {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await adminApi.getContent();
        setContent(data.content || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className={styles.contentPage}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Content</h1>
        <button className="btn btn-primary">Create Content</button>
      </div>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <Table columns={COLUMNS} data={content} />
    </div>
  );
}

export default ContentPage;

