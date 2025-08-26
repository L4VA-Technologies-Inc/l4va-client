import { createFileRoute } from '@tanstack/react-router';
import { Inbox } from '@novu/react';

function SandboxComponent() {
  return (
    <Inbox
      applicationIdentifier="TeCf3Ck565vM"
      subscriberId="68ad74bcd8e299ea20802270"
      routerPush={path => console.log(path)}
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
