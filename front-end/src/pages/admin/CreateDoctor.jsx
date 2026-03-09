import { useState } from "react";
import { createUser } from "../../api/userService";

const CreateDoctor = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createUser({
        name,
        email,
        password,
        role: "DOCTOR"
      });

      alert("Doctor created successfully");
      setName("");
      setEmail("");
      setPassword("");
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Error creating doctor");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "40px 20px",
      perspective: "1000px",
    },
    header: {
      fontSize: "36px",
      fontWeight: "bold",
      marginBottom: "40px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textAlign: "center",
      transform: "translateZ(30px)",
      animation: "floatHeader 3s infinite ease-in-out",
    },
    formCard: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: "30px",
      padding: "40px",
      boxShadow: "0 30px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
      transform: "rotateX(2deg) rotateY(1deg) translateZ(20px)",
      transition: "all 0.5s ease",
      border: "1px solid rgba(255,255,255,0.2)",
      position: "relative",
      overflow: "hidden",
    },
    formCardHover: {
      transform: "rotateX(0deg) rotateY(0deg) translateZ(40px)",
      boxShadow: "0 40px 80px rgba(102,126,234,0.4), 0 0 0 2px rgba(255,255,255,0.3)",
    },
    inputGroup: {
      marginBottom: "25px",
      position: "relative",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
      textTransform: "uppercase",
      letterSpacing: "1px",
      transform: "translateZ(10px)",
    },
    input: {
      width: "100%",
      padding: "15px 20px",
      fontSize: "16px",
      border: "2px solid rgba(102,126,234,0.1)",
      borderRadius: "15px",
      background: "rgba(255,255,255,0.9)",
      transition: "all 0.3s ease",
      outline: "none",
      boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
      transform: "translateZ(5px)",
    },
    inputFocus: {
      borderColor: "#667eea",
      boxShadow: "0 8px 25px rgba(102,126,234,0.2)",
      transform: "translateZ(15px)",
    },
    button: {
      width: "100%",
      padding: "16px",
      fontSize: "18px",
      fontWeight: "bold",
      color: "white",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      border: "none",
      borderRadius: "15px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      transform: "translateZ(10px)",
      boxShadow: "0 10px 25px rgba(102,126,234,0.4)",
      position: "relative",
      overflow: "hidden",
      marginTop: "20px",
    },
    buttonHover: {
      transform: "translateZ(20px) scale(1.02)",
      boxShadow: "0 15px 35px rgba(102,126,234,0.6)",
    },
    buttonDisabled: {
      opacity: 0.7,
      cursor: "not-allowed",
    },
    icon: {
      marginRight: "10px",
      fontSize: "20px",
    },
    floatingOrb: {
      position: "absolute",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background: "radial-gradient(circle at 30% 30%, rgba(102,126,234,0.3), rgba(118,75,162,0.2))",
      filter: "blur(40px)",
      zIndex: -1,
      animation: "float 8s infinite ease-in-out",
    },
    shimmer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
      transform: "translateX(-100%)",
      animation: "shimmer 3s infinite",
    },
    loadingSpinner: {
      display: "inline-block",
      width: "20px",
      height: "20px",
      border: "2px solid rgba(255,255,255,0.3)",
      borderRadius: "50%",
      borderTopColor: "white",
      animation: "spin 1s infinite linear",
      marginRight: "10px",
    },
  };

  // Add keyframe animations
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes floatHeader {
      0%, 100% { transform: translateZ(30px) translateY(0); }
      50% { transform: translateZ(30px) translateY(-5px); }
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(20px, -20px) rotate(120deg); }
      66% { transform: translate(-20px, 20px) rotate(240deg); }
    }

    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <div style={styles.container}>
      
      {/* Floating background orbs */}
      <div style={{ ...styles.floatingOrb, top: "10%", right: "10%" }} />
      <div style={{ ...styles.floatingOrb, bottom: "10%", left: "10%", width: "200px", height: "200px" }} />

      <h1 style={styles.header}>👨‍⚕️ Create New Doctor</h1>

      <div 
        style={styles.formCard}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, styles.formCardHover);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "rotateX(2deg) rotateY(1deg) translateZ(20px)";
          e.currentTarget.style.boxShadow = "0 30px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)";
        }}
      >
        <div style={styles.shimmer} />

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.icon}>👤</span> Full Name
            </label>
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(102,126,234,0.2)";
                e.currentTarget.style.transform = "translateZ(15px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(102,126,234,0.1)";
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
                e.currentTarget.style.transform = "translateZ(5px)";
              }}
              placeholder="Enter doctor's full name"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.icon}>📧</span> Email Address
            </label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(102,126,234,0.2)";
                e.currentTarget.style.transform = "translateZ(15px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(102,126,234,0.1)";
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
                e.currentTarget.style.transform = "translateZ(5px)";
              }}
              placeholder="doctor@hospital.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.icon}>🔒</span> Password
            </label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(102,126,234,0.2)";
                e.currentTarget.style.transform = "translateZ(15px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(102,126,234,0.1)";
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
                e.currentTarget.style.transform = "translateZ(5px)";
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                Object.assign(e.currentTarget.style, styles.buttonHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateZ(10px) scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(102,126,234,0.4)";
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span style={styles.loadingSpinner} />
                Creating Doctor...
              </>
            ) : (
              <>
                <span style={styles.icon}>✨</span>
                Create Doctor
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDoctor;