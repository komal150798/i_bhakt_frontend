import styles from './StatsCards.module.css';

const STATS = [
  { id: 1, label: 'Total Users', value: '12,345', icon: 'bi-people', color: 'primary' },
  { id: 2, label: 'Active Users', value: '8,901', icon: 'bi-person-check', color: 'success' },
  { id: 3, label: 'Today Logins', value: '234', icon: 'bi-box-arrow-in-right', color: 'info' },
  { id: 4, label: 'Revenue', value: '$45,678', icon: 'bi-currency-dollar', color: 'accent' },
];

function StatsCards() {
  return (
    <div className="row g-4">
      {STATS.map((stat) => (
        <div key={stat.id} className="col-md-6 col-lg-3">
          <div className={`card ${styles.statCard}`}>
            <div className="card-body">
              <div className={styles.header}>
                <div className={styles.iconWrapper}>
                  <i className={`bi ${stat.icon} ${styles[stat.color]}`}></i>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.value}>{stat.value}</h3>
                <p className={styles.label}>{stat.label}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;

