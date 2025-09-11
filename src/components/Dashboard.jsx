import { useState } from 'react';
import CropForm from './CropForm';
import AdviceBox from './AdviceBox';

export default function Dashboard() {
  const [adviceData, setAdviceData] = useState(null);

  return (
    <div>
      <CropForm setAdviceData={setAdviceData} />
      {adviceData && <AdviceBox data={adviceData} />}
    </div>
  );
}
