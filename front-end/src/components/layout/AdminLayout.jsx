import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const AdminLayout = () => {
  const { logout } = useAuth();

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      perspective: "1000px",
    },
    sidebar: {
      width: "280px",
      background: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(10px)",
      color: "white",
      padding: "25px",
      boxShadow: "20px 0 30px rgba(0,0,0,0.3)",
      transform: "rotateY(5deg)",
      transformStyle: "preserve-3d",
      position: "relative",
      borderRight: "1px solid rgba(255,255,255,0.1)",
      animation: "slideIn 0.5s ease-out",
    },
    sidebarInner: {
      transform: "translateZ(20px)",
    },
    header: {
      fontSize: "28px",
      fontWeight: "bold",
      marginBottom: "40px",
      textAlign: "center",
      color: "#fff",
      textShadow: "0 0 10px rgba(255,255,255,0.5)",
      letterSpacing: "2px",
      position: "relative",
      padding: "10px 0",
      borderBottom: "2px solid rgba(255,255,255,0.2)",
    },
    nav: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    link: {
      color: "white",
      textDecoration: "none",
      padding: "12px 20px",
      borderRadius: "10px",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(5px)",
      border: "1px solid rgba(255,255,255,0.1)",
      transition: "all 0.3s ease",
      transform: "translateZ(0)",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    linkHover: {
      background: "rgba(255,255,255,0.15)",
      transform: "translateX(10px) translateZ(20px)",
      boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
    },
    linkBefore: {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-100%",
      width: "100%",
      height: "100%",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
      transition: "left 0.5s ease",
    },
    button: {
      marginTop: "30px",
      padding: "12px 20px",
      cursor: "pointer",
      background: "linear-gradient(45deg, #ff6b6b, #ff4757)",
      border: "none",
      borderRadius: "10px",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      letterSpacing: "1px",
      transition: "all 0.3s ease",
      transform: "translateZ(0)",
      boxShadow: "0 4px 15px rgba(255,71,87,0.4)",
      position: "relative",
      overflow: "hidden",
      // eslint-disable-next-line no-dupe-keys
      border: "1px solid rgba(255,255,255,0.2)",
    },
    buttonHover: {
      transform: "translateY(-2px) translateZ(10px)",
      boxShadow: "0 6px 20px rgba(255,71,87,0.6)",
    },
    content: {
      flex: 1,
      padding: "30px",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: "20px 0 0 20px",
      margin: "20px 20px 20px 0",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      transform: "rotateY(-2deg) translateZ(30px)",
      transformStyle: "preserve-3d",
      border: "1px solid rgba(255,255,255,0.3)",
      animation: "fadeIn 0.7s ease-out",
    },
    icon: {
      fontSize: "20px",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
    },
    floatingOrb: {
      position: "absolute",
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(102,126,234,0.3))",
      filter: "blur(30px)",
      zIndex: -1,
      animation: "float 6s infinite ease-in-out",
    },
  };

  // Add keyframe animations
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes slideIn {
      from {
        transform: rotateY(5deg) translateX(-100%);
        opacity: 0;
      }
      to {
        transform: rotateY(5deg) translateX(0);
        opacity: 1;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: rotateY(-2deg) translateZ(30px) translateY(20px);
      }
      to {
        opacity: 1;
        transform: rotateY(-2deg) translateZ(30px) translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) translateZ(0);
      }
      50% {
        transform: translateY(-20px) translateZ(50px);
      }
    }

    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
      }
      50% {
        box-shadow: 0 0 40px rgba(102, 126, 234, 0.6);
      }
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <div style={styles.container}>
      
      {/* Floating orbs for background effect */}
      <div style={{ ...styles.floatingOrb, top: "10%", left: "5%" }} />
      <div style={{ ...styles.floatingOrb, bottom: "10%", right: "5%", width: "200px", height: "200px" }} />

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarInner}>
          <h2 style={styles.header}>⚡ Admin Panel</h2>

          <nav style={styles.nav}>
            <Link 
              to="/admin/dashboard" 
              style={styles.link}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.linkHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0) translateZ(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
            >
              <span style={styles.icon}>📊</span> Dashboard
            </Link>

            <Link 
              to="/admin/doctors" 
              style={styles.link}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.linkHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0) translateZ(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
            >
              <span style={styles.icon}>👨‍⚕️</span> Doctors
            </Link>

            <Link 
              to="/admin/patients" 
              style={styles.link}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.linkHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0) translateZ(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
            >
              <span style={styles.icon}>👤</span> Patients
            </Link>

            <button
              onClick={logout}
              style={styles.button}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.buttonHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) translateZ(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,71,87,0.4)";
              }}
            >
              <span style={styles.icon}>🚪</span> Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;