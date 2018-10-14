import React from 'react';

interface ScrollableTabProps {
  tabLabel: string;
  children: any;
}
export default ({ tabLabel, children }: ScrollableTabProps) => {
  return <>{children}</>;
};
