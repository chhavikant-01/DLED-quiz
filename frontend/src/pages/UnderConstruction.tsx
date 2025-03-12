
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/button';
const UnderConstruction: React.FC<{role: string}> = ({role}) => {

    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
      };
    

  return (
    <div className="flex justify-center items-center h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          {role === 'student' && (
            <p>Student features are not implemented yet. Please check back later.</p>
          )}
          {role === 'admin' && (
            <p>Admin features are not implemented yet. Please check back later.</p>
          )}
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderConstruction;
