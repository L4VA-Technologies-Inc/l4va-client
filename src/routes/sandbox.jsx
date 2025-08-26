import { createFileRoute } from '@tanstack/react-router';
import { Inbox } from '@novu/react';
import { useNavigate } from 'react-router-dom';

function SandboxComponent() {
  const navigate = useNavigate();

  return (
    <Inbox
      applicationIdentifier="TeCf3Ck565vM"
      subscriberId="68ad74bcd8e299ea20802270"
      routerPush={path => navigate(path)}
      appearance={{
        variables: {
          colorPrimary: '#DD2450',
          colorForeground: '#0E121B',
        },
      }}
    />
  );
}

export const Route = createFileRoute('/sandbox')({
  component: SandboxComponent,
});
