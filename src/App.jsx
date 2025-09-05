import { useEffect, useState } from 'react';
import CropForm from '../../frontend/src/components/CropForm';
import WeatherBox from '../../frontend/src/components/WeatherBox';
import AdviceBox from '../../frontend/src/components/AdviceBox';

export default function App() {
  const [adviceData, setAdviceData] = useState(null);

  return (
    <div className="bg-yellow-50 min-h-screen text-gray-800 font-sans px-4 py-6">
      <h1 className="text-4xl font-bold text-center mb-2"> AgriAdvisor AI</h1>
      <p className="text-center mb-6">Get personalized, AI-powered agricultural advice.</p>

      <div className="flex flex-col lg:flex-row gap-6 justify-center items-start container mx-auto">
        {/* Pass setAdviceData to allow CropForm to update state */}
        <CropForm setAdviceData={setAdviceData} />
        <AdviceBox data={adviceData} />
        <WeatherBox />
      </div>

      <div className="mt-8 container mx-auto">
        {/* Debug: Show adviceData contents for troubleshooting */}
        <pre style={{background:'#f5f5f5',padding:'10px',borderRadius:'6px',color:'#333'}}>
          {adviceData ? JSON.stringify(adviceData, null, 2) : 'No adviceData yet.'}
        </pre>
        {/* Show AdviceBox only if adviceData is available */}
        {adviceData && <AdviceBox data={adviceData} />}
      </div>

      <footer className="text-center text-sm text-gray-500 mt-10">
        © 2025 AgriAdvisor AI. All rights reserved.
      </footer>
    </div>
  );
}
