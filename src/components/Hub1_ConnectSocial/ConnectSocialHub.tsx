/**
 * Hub 1: Connect & Social Suite Container
 * Includes Encrypted Messaging only
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Messaging } from './Messaging';
import { MessageSquare } from 'lucide-react';

export const ConnectSocialHub: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      <Messaging />
    </div>
  );
};
