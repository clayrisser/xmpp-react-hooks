import { useContext } from 'react';
import ServicesContext, { ServicesContextResult } from '../contexts/services';

export default function useServices(): ServicesContextResult {
  return useContext<ServicesContextResult>(ServicesContext);
}
