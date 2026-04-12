import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@visiblefix_device_id';

interface DeviceContextType {
  deviceId: string;
  isLoading: boolean;
}

const DeviceContext = createContext<DeviceContextType>({
  deviceId: '',
  isLoading: true,
});

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDeviceId = async () => {
      try {
        let storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!storedId) {
          storedId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem(DEVICE_ID_KEY, storedId);
        }
        setDeviceId(storedId);
      } catch (error) {
        console.error('Failed to init device ID:', error);
        setDeviceId(`device_fallback_${Date.now()}`);
      } finally {
        setIsLoading(false);
      }
    };
    initDeviceId();
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceId, isLoading }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
