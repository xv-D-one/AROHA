import { Link } from "react-router-dom";

const PatientsPage = () => {
  return (
    <div>
      <h1>Patients Management</h1>

      <Link to="/admin/patients/create">
        <button>Create Patient</button>
      </Link>

      <p>Patient list will appear here.</p>
    </div>
  );
};

export default PatientsPage;