import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-5 max-w-md">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <h2 className="text-3xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">
          You do not have permission to view this page. If you believe this is an error, please contact the administrator.
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
