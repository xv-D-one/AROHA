import { Link } from "react-router-dom";

const DoctorsPage = () => {
  return (
    <div>
      <h1>Doctors Management</h1>

      <Link to="/admin/doctors/create">
        <button>Create Doctor</button>
      </Link>

      <p>Doctor list will appear here.</p>
    </div>
  );
};

export default DoctorsPage;