import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    appointmentsToday: 0,
    revenue: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalDoctors: 45,
        totalPatients: 1234,
        appointmentsToday: 28,
        revenue: 45678
      });
      
      setRecentActivities([
        { id: 1, action: 'New patient registered', time: '5 min ago', user: 'John Doe' },
        { id: 2, action: 'Appointment completed', time: '15 min ago', user: 'Dr. Smith' },
        { id: 3, action: 'Prescription added', time: '32 min ago', user: 'Dr. Johnson' },
        { id: 4, action: 'Payment received', time: '1 hour ago', user: 'Sarah Wilson' },
      ]);
      
      setIsLoading(false);
    }, 1500);
  }, []);

  const styles = {
    container: {
      perspective: '1000px',
      transformStyle: 'preserve-3d',
    },
    header: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
      transform: 'translateZ(30px)',
      animation: 'floatText 3s infinite ease-in-out',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '25px',
      marginBottom: '40px',
      transformStyle: 'preserve-3d',
    },
    statCard: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '25px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.2)',
      transform: 'rotateX(5deg) rotateY(2deg) translateZ(20px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    statCardHover: {
      transform: 'rotateX(0deg) rotateY(0deg) translateZ(40px) scale(1.05)',
      boxShadow: '0 25px 45px rgba(102,126,234,0.4)',
    },
    statIcon: {
      fontSize: '40px',
      marginBottom: '15px',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#fff',
      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
      marginBottom: '5px',
    },
    statLabel: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.8)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    chartContainer: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '25px',
      marginBottom: '40px',
      transformStyle: 'preserve-3d',
    },
    chartCard: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      padding: '25px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
      transform: 'translateZ(15px)',
      border: '1px solid rgba(255,255,255,0.3)',
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    activityList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      animation: 'slideIn 0.5s ease-out',
    },
    activityDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      marginRight: '15px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      boxShadow: '0 0 10px rgba(102,126,234,0.5)',
    },
    activityContent: {
      flex: 1,
    },
    activityAction: {
      fontWeight: '600',
      color: '#333',
      marginBottom: '4px',
    },
    activityMeta: {
      fontSize: '12px',
      color: '#999',
      display: 'flex',
      gap: '10px',
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
    },
    quickActionBtn: {
      padding: '15px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: 'translateZ(10px)',
      boxShadow: '0 5px 15px rgba(102,126,234,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
    },
    floatingOrb: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(102,126,234,0.2))',
      filter: 'blur(40px)',
      zIndex: -1,
      animation: 'float 8s infinite ease-in-out',
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transform: 'translateX(-100%)',
      animation: 'shimmer 2s infinite',
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      borderTopColor: '#667eea',
      animation: 'spin 1s infinite linear',
      margin: '100px auto',
    },
  };

  // Add keyframe animations
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes floatText {
      0%, 100% { transform: translateZ(30px) translateY(0); }
      50% { transform: translateZ(30px) translateY(-5px); }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .stat-card:hover .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }
  `;
  document.head.appendChild(styleSheet);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={styles.loadingSpinner} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      {/* Floating background orbs */}
      <div style={{ ...styles.floatingOrb, top: '10%', right: '5%' }} />
      <div style={{ ...styles.floatingOrb, bottom: '10%', left: '5%', width: '200px', height: '200px' }} />

      {/* Header */}
      <h1 style={styles.header}>✨ Admin Dashboard</h1>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotateX(5deg) rotateY(2deg) translateZ(20px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
          }}
        >
          <div style={styles.shimmer} />
          <div style={styles.statIcon}>👨‍⚕️</div>
          <div style={styles.statValue}>{stats.totalDoctors}</div>
          <div style={styles.statLabel}>Total Doctors</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotateX(5deg) rotateY(2deg) translateZ(20px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
          }}
        >
          <div style={styles.shimmer} />
          <div style={styles.statIcon}>👤</div>
          <div style={styles.statValue}>{stats.totalPatients}</div>
          <div style={styles.statLabel}>Total Patients</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotateX(5deg) rotateY(2deg) translateZ(20px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
          }}
        >
          <div style={styles.shimmer} />
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statValue}>{stats.appointmentsToday}</div>
          <div style={styles.statLabel}>Appointments Today</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotateX(5deg) rotateY(2deg) translateZ(20px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
          }}
        >
          <div style={styles.shimmer} />
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statValue}>${stats.revenue.toLocaleString()}</div>
          <div style={styles.statLabel}>Monthly Revenue</div>
        </div>
      </div>

      {/* Charts and Activities */}
      <div style={styles.chartContainer}>
        {/* Analytics Chart Card */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            <span>📊</span> Weekly Analytics
          </h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
            {[65, 45, 85, 55, 75, 60, 80].map((height, index) => (
              <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: `${height}px`,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '10px 10px 0 0',
                  transition: 'height 0.3s ease',
                  animation: 'pulse 2s infinite',
                  animationDelay: `${index * 0.2}s`,
                }} />
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            <span>⏱️</span> Recent Activities
          </h3>
          <ul style={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <li key={activity.id} style={{
                ...styles.activityItem,
                animationDelay: `${index * 0.1}s`,
              }}>
                <div style={styles.activityDot} />
                <div style={styles.activityContent}>
                  <div style={styles.activityAction}>{activity.action}</div>
                  <div style={styles.activityMeta}>
                    <span>👤 {activity.user}</span>
                    <span>⏰ {activity.time}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <button 
          style={styles.quickActionBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateZ(20px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(102,126,234,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateZ(10px) scale(1)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(102,126,234,0.4)';
          }}
        >
          <span>➕</span> Add Doctor
        </button>
        <button 
          style={styles.quickActionBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateZ(20px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(102,126,234,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateZ(10px) scale(1)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(102,126,234,0.4)';
          }}
        >
          <span>📋</span> New Appointment
        </button>
        <button 
          style={styles.quickActionBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateZ(20px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(102,126,234,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateZ(10px) scale(1)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(102,126,234,0.4)';
          }}
        >
          <span>📊</span> Generate Report
        </button>
        <button 
          style={styles.quickActionBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateZ(20px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(102,126,234,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateZ(10px) scale(1)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(102,126,234,0.4)';
          }}
        >
          <span>⚙️</span> Settings
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;