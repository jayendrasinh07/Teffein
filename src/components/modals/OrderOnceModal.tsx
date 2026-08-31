import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const OrderOnceModal: React.FC = () => {
  const { isOrderOnceModalOpen, setIsOrderOnceModalOpen, setActiveTab } = useApp();

  useEffect(() => {
    if (isOrderOnceModalOpen) {
      setIsOrderOnceModalOpen(false);
      setActiveTab('order_once');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOrderOnceModalOpen, setIsOrderOnceModalOpen, setActiveTab]);

  return null;
};
