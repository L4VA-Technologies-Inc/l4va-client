import { Navigate, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/context/auth';
import { useModal } from '@/context/modals';
import { MODAL_TYPES } from '@/constants/core.constants';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    openModal(MODAL_TYPES.LOGIN, {
      onSuccess: () => navigate({ to: window.location.pathname }),
    });
    return <Navigate to="/" />;
  }

  return children;
};