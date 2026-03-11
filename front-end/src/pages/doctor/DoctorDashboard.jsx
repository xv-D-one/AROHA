import { useEffect, useState } from "react";
import axios from "axios";

const doctorId = "D1001";

const DoctorDashboard = () => {
const [patients, setPatients] = useState([]);
const [filteredPatients, setFilteredPatients] = useState([]);
const [selectedPatient, setSelectedPatient] = useState(null);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchPatients = async () => {
try {
const res = await axios.get(
`http://localhost:5000/api/doctors/${doctorId}/patients`
);

    setPatients(res.data);
    setFilteredPatients(res.data);
    setLoading(false);
  } catch (error) {
    console.error(error);
    setLoading(false);
  }
};

fetchPatients();

}, []);

const handleSearch = (value) => {
setSearch(value);

const filtered = patients.filter(
  (p) =>
    p.name.toLowerCase().includes(value.toLowerCase()) ||
    p.patientId.toLowerCase().includes(value.toLowerCase())
);

setFilteredPatients(filtered);

};

const totalPatients = patients.length;

return ( <div style={styles.wrapper}> <div style={styles.sidebar}>
<h2 style={{ color: "white" }}>AROHA</h2> <p>Dashboard</p> <p>Patients</p> <p>Appointments</p> <p>Prescriptions</p> </div>

  <div style={styles.main}>
    <h1 style={styles.title}>Doctor Dashboard</h1>

    <div style={styles.statsContainer}>
      <div style={styles.card}>
        <h3>Total Patients</h3>
        <p>{totalPatients}</p>
      </div>

      <div style={styles.card}>
        <h3>Today's Appointments</h3>
        <p>6</p>
      </div>

      <div style={styles.card}>
        <h3>Pending Reports</h3>
        <p>2</p>
      </div>
    </div>

    <input
      type="text"
      placeholder="Search patient..."
      value={search}
      onChange={(e) => handleSearch(e.target.value)}
      style={styles.search}
    />

    {loading ? (
      <p>Loading patients...</p>
    ) : (
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Blood Group</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredPatients.length === 0 ? (
            <tr>
              <td colSpan="6">No patients found</td>
            </tr>
          ) : (
            filteredPatients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.patientId}</td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.bloodGroup}</td>
                <td>
                  <button
                    style={styles.viewBtn}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )}

    {selectedPatient && (
      <div style={styles.patientCard}>
        <h2>Patient Details</h2>

        <p><strong>Name:</strong> {selectedPatient.name}</p>
        <p><strong>Age:</strong> {selectedPatient.age}</p>
        <p><strong>Gender:</strong> {selectedPatient.gender}</p>
        <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</p>
        <p><strong>Phone:</strong> {selectedPatient.phone}</p>
        <p><strong>Address:</strong> {selectedPatient.address}</p>

        <button
          style={styles.closeBtn}
          onClick={() => setSelectedPatient(null)}
        >
          Close
        </button>
      </div>
    )}
  </div>
</div>

);
};

const styles = {
wrapper: {
display: "flex",
minHeight: "100vh",
backgroundColor: "#caf0f8",
},

sidebar: {
width: "220px",
backgroundColor: "#03045e",
color: "white",
padding: "20px",
},

main: {
flex: 1,
padding: "30px",
},

title: {
color: "#03045e",
},

statsContainer: {
display: "flex",
gap: "20px",
marginBottom: "20px",
},

card: {
background: "#90e0ef",
padding: "20px",
borderRadius: "8px",
minWidth: "150px",
},

search: {
padding: "10px",
width: "300px",
marginBottom: "20px",
},

table: {
width: "100%",
borderCollapse: "collapse",
background: "white",
},

viewBtn: {
backgroundColor: "#0077b6",
color: "white",
border: "none",
padding: "6px 12px",
cursor: "pointer",
borderRadius: "4px",
},

patientCard: {
marginTop: "20px",
background: "#90e0ef",
padding: "20px",
borderRadius: "8px",
},

closeBtn: {
marginTop: "10px",
backgroundColor: "#03045e",
color: "white",
border: "none",
padding: "8px 14px",
cursor: "pointer",
borderRadius: "4px",
},
};

export default DoctorDashboard;
