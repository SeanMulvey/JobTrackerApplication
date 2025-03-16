import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Job {
  _id: string;
  company: string;
  title: string;
  location: string;
  status: string;
  offerDetails?: {
    baseSalary?: number;
    bonus?: number;
    stockOptions?: number;
  };
}

interface MarketData {
  salary: {
    min: number;
    max: number;
    median: number;
    source: string;
  };
  costOfLiving: {
    index: number;
    housingIndex: number;
    groceriesIndex: number;
    nationalAverage: number;
    source: string;
  };
}

interface JobWithMarketData extends Job {
  marketData?: MarketData;
  hasOffer: boolean;
  dataSource: 'api' | 'local'; // Track the source of market data
  dataLoading: boolean; // Track if we're loading data for this job
}

const JobMarketComparison: React.FC = () => {
  const [jobs, setJobs] = useState<JobWithMarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const dataFetchedRef = useRef<Record<string, boolean>>({});

  // Fetch user's jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/jobs');
        
        if (response.data.success) {
          // Add a flag to indicate if the job has an offer
          const jobsWithOfferStatus = response.data.data.map((job: Job) => {
            const hasOffer = !!(job.offerDetails && job.offerDetails.baseSalary);
            
            // Add data source tracking and loading state
            return {
              ...job,
              hasOffer,
              dataSource: 'local' as const, // Start with local data
              dataLoading: false, // Not loading initially
              // Pre-initialize with market data to avoid flickering
              marketData: !hasOffer ? {
                salary: generateMockSalaryData(job.title, job.location),
                costOfLiving: generateMockCostOfLivingData(job.location)
              } : undefined
            };
          });
          
          setJobs(jobsWithOfferStatus);
          
          // Pre-select up to 3 jobs
          const initialSelection = jobsWithOfferStatus
            .slice(0, 3)
            .map((job: Job) => job._id);
            
          setSelectedJobs(initialSelection);
        } else {
          setError('Failed to fetch jobs');
          toast.error('Failed to load your jobs');
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Error fetching job data');
        toast.error('Could not load your jobs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Fetch market data for selected jobs that don't have offers
  useEffect(() => {
    const fetchMarketData = async () => {
      if (!selectedJobs.length) return;
      
      const jobsNeedingMarketData = selectedJobs
        .map(id => jobs.find(job => job._id === id))
        .filter(job => job && !job.hasOffer) as JobWithMarketData[];
      
      if (!jobsNeedingMarketData.length) return;
      
      // Create new array to update
      const updatedJobs = [...jobs];
      
      // Flag to use local fallback data instead of API
      // Set to false to try the API again
      const useLocalDataOnly = false;
      
      for (const job of jobsNeedingMarketData) {
        // Skip jobs that already have API data or are currently loading
        if (job.dataSource === 'api' || job.dataLoading) {
          console.log(`Skipping data fetch for ${job.title} - already using API data or loading`);
          continue;
        }
        
        try {
          // Find the job in our state array and mark it as loading
          const loadingJobIndex = updatedJobs.findIndex(j => j._id === job._id);
          if (loadingJobIndex !== -1) {
            updatedJobs[loadingJobIndex] = {
              ...updatedJobs[loadingJobIndex],
              dataLoading: true
            };
          }
          // Update state to show loading indicator
          setJobs(updatedJobs);
          
          let salaryData, costOfLivingData;
          let apiSuccess = false; // Declare apiSuccess at this level so it's available throughout the function
          
          if (!useLocalDataOnly) {
            // Try a maximum of 2 times to fetch the data
            let maxRetries = 2;
            let attempt = 0;
            let salaryResponse, colResponse;
            
            while (attempt < maxRetries && !apiSuccess) {
              try {
                // Fetch market salary data
                console.log(`Attempting to fetch salary data for ${job.title} at ${job.location}`);
                salaryResponse = await axios.get(`/api/job-value/market-salary?title=${encodeURIComponent(job.title)}&location=${encodeURIComponent(job.location)}`);
                console.log(`Salary API response:`, salaryResponse.data);
                
                // Fetch cost of living data
                console.log(`Attempting to fetch COL data for ${job.location}`);
                colResponse = await axios.get(`/api/job-value/cost-of-living?location=${encodeURIComponent(job.location)}`);
                console.log(`COL API response:`, colResponse.data);
                
                // If both requests succeed, break the retry loop
                if (salaryResponse.data.success && colResponse.data.success) {
                  salaryData = salaryResponse.data.data;
                  costOfLivingData = colResponse.data.data;
                  apiSuccess = true;
                  break;
                }
              } catch (err) {
                console.log(`API attempt ${attempt + 1} failed for ${job.title}`);
                if ((err as any).response) {
                  console.error(`Error status: ${(err as any).response.status}`);
                  console.error(`Error data:`, (err as any).response.data);
                } else {
                  console.error(`Error with no response:`, err);
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
                console.log(`Retrying market data fetch for ${job.title} (attempt ${attempt + 1})...`);
                attempt++;
              }
            }
            
            // If API calls failed, fall back to local data
            if (!apiSuccess) {
              console.log(`Using fallback data for ${job.title} after API failures`);
              salaryData = generateMockSalaryData(job.title, job.location);
              costOfLivingData = generateMockCostOfLivingData(job.location);
            }
          } else {
            // Skip API calls and use local data directly
            console.log(`Using local data for ${job.title} (API bypass)`);
            salaryData = generateMockSalaryData(job.title, job.location);
            costOfLivingData = generateMockCostOfLivingData(job.location);
          }
          
          // Find the job in our state array and update it
          const updatedJobIndex = updatedJobs.findIndex(j => j._id === job._id);
          if (updatedJobIndex !== -1) {
            updatedJobs[updatedJobIndex] = {
              ...updatedJobs[updatedJobIndex],
              marketData: {
                salary: salaryData,
                costOfLiving: costOfLivingData
              },
              dataSource: apiSuccess ? 'api' : 'local',
              dataLoading: false
            };
            
            // Mark that we've attempted to fetch data for this job
            dataFetchedRef.current[job._id] = true;
          }
        } catch (err) {
          console.error(`Error processing market data for ${job.title} at ${job.company}:`, err);
          
          // Even in case of unexpected errors, try to use fallback data
          try {
            const salaryData = generateMockSalaryData(job.title, job.location);
            const costOfLivingData = generateMockCostOfLivingData(job.location);
            
            const errorJobIndex = updatedJobs.findIndex(j => j._id === job._id);
            if (errorJobIndex !== -1) {
              updatedJobs[errorJobIndex] = {
                ...updatedJobs[errorJobIndex],
                marketData: {
                  salary: salaryData,
                  costOfLiving: costOfLivingData
                },
                dataSource: 'local',
                dataLoading: false
              };
              console.log(`Fallback data applied for ${job.title} after error`);
            }
          } catch (fallbackErr) {
            // If even the fallback fails, just show a warning to the user
            console.error(`Fallback data generation failed for ${job.title}:`, fallbackErr);
            let errorMessage = `Could not generate market data for ${job.title} at ${job.company}`;
            toast.warning(errorMessage);
          }
        }
      }
      
      // Update state with the new data
      setJobs(updatedJobs);
    };
    
    fetchMarketData();
  }, [selectedJobs, jobs]);

  const handleJobSelection = (jobId: string) => {
    if (selectedJobs.includes(jobId)) {
      // Remove from selection
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    } else {
      // Add to selection (max 4 total)
      if (selectedJobs.length < 4) {
        setSelectedJobs([...selectedJobs, jobId]);
      } else {
        toast.warning('You can compare up to 4 jobs at a time');
      }
    }
  };

  // Function to format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Fallback generators for when API calls fail
  const generateMockSalaryData = (title: string, location: string) => {
    // Simple logic to generate somewhat realistic salary ranges based on job title and location
    const baseSalary = {
      min: 70000,
      max: 140000,
      median: 100000
    };
    
    // Adjust for senior positions
    if (title.toLowerCase().includes('senior') || title.toLowerCase().includes('lead')) {
      baseSalary.min = 100000;
      baseSalary.max = 180000;
      baseSalary.median = 135000;
    }
    
    // Adjust for engineering positions
    if (title.toLowerCase().includes('engineer') || title.toLowerCase().includes('developer')) {
      baseSalary.min += 10000;
      baseSalary.max += 20000;
      baseSalary.median += 15000;
    }
    
    // Adjust for location
    let locationMultiplier = 1;
    if (location.toLowerCase().includes('san francisco') || location.toLowerCase().includes('new york')) {
      locationMultiplier = 1.4;
    } else if (location.toLowerCase().includes('seattle') || location.toLowerCase().includes('boston')) {
      locationMultiplier = 1.25;
    } else if (location.toLowerCase().includes('austin') || location.toLowerCase().includes('denver')) {
      locationMultiplier = 1.1;
    }
    
    return {
      min: Math.round(baseSalary.min * locationMultiplier),
      max: Math.round(baseSalary.max * locationMultiplier),
      median: Math.round(baseSalary.median * locationMultiplier),
      source: 'Estimated (Local)'
    };
  };

  const generateMockCostOfLivingData = (location: string) => {
    // Default to national average
    const defaultData = {
      index: 100,
      housingIndex: 100,
      groceriesIndex: 100,
      nationalAverage: 100,
      source: 'Estimated (Local)'
    };
    
    // Adjust for common expensive cities
    if (location.toLowerCase().includes('san francisco')) {
      return {
        ...defaultData,
        index: 192.3,
        housingIndex: 296.5,
        groceriesIndex: 162.4
      };
    } else if (location.toLowerCase().includes('new york')) {
      return {
        ...defaultData,
        index: 187.2,
        housingIndex: 242.3,
        groceriesIndex: 169.8
      };
    } else if (location.toLowerCase().includes('seattle')) {
      return {
        ...defaultData,
        index: 152.8,
        housingIndex: 203.4,
        groceriesIndex: 139.5
      };
    } else if (location.toLowerCase().includes('los angeles')) {
      return {
        ...defaultData,
        index: 166.5,
        housingIndex: 243.1,
        groceriesIndex: 154.2
      };
    } else if (location.toLowerCase().includes('austin')) {
      return {
        ...defaultData,
        index: 119.3,
        housingIndex: 154.8,
        groceriesIndex: 109.7
      };
    }
    
    return defaultData;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Job Market Comparison</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-2">Job Market Comparison</h2>
        <div className="text-center text-red-500 py-8">
          {error}
        </div>
      </div>
    );
  }

  // Get the selected jobs data
  const jobsToCompare = selectedJobs
    .map(id => jobs.find(job => job._id === id))
    .filter(Boolean) as JobWithMarketData[];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Job Market Comparison</h2>
      
      {/* Job selection section */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Select Jobs to Compare (max 4)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {jobs.map(job => (
            <div 
              key={job._id}
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                selectedJobs.includes(job._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
              onClick={() => handleJobSelection(job._id)}
            >
              <div className="font-medium">{job.title} at {job.company}</div>
              <div className="text-sm text-gray-600">{job.location}</div>
              <div className="mt-1 text-xs">
                {job.hasOffer 
                  ? <span className="text-green-600">Has offer details</span> 
                  : job.dataLoading
                    ? <span className="text-blue-500">Loading market data...</span>
                    : <span className="text-orange-500">
                        {job.dataSource === 'api' 
                          ? 'Using API data' 
                          : 'Using local estimates'}
                      </span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Comparison table */}
      {jobsToCompare.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                {jobsToCompare.map(job => (
                  <th key={job._id} className="px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {job.company}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Title</td>
                {jobsToCompare.map(job => (
                  <td key={job._id} className="px-4 py-3 text-sm text-gray-700">{job.title}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Location</td>
                {jobsToCompare.map(job => (
                  <td key={job._id} className="px-4 py-3 text-sm text-gray-700">{job.location}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Status</td>
                {jobsToCompare.map(job => (
                  <td key={job._id} className="px-4 py-3 text-sm text-gray-700">{job.status}</td>
                ))}
              </tr>
              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Base Salary</td>
                {jobsToCompare.map(job => (
                  <td key={job._id} className="px-4 py-3 text-sm font-medium">
                    {job.hasOffer 
                      ? formatCurrency(job.offerDetails?.baseSalary)
                      : job.dataLoading
                        ? <div className="flex items-center">
                            <div className="mr-2 h-4 w-4 rounded-full animate-pulse bg-blue-400"></div>
                            <span>Loading...</span>
                          </div>
                        : job.marketData 
                          ? <div>
                              <div className="font-medium text-blue-600">{formatCurrency(job.marketData.salary.median)} (est.)</div>
                              <div className="text-xs text-gray-500">
                                Range: {formatCurrency(job.marketData.salary.min)} - {formatCurrency(job.marketData.salary.max)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Source: {job.dataSource === 'api' 
                                  ? 'API data' 
                                  : 'Local estimate'}
                              </div>
                            </div>
                          : <div>
                              <span className="text-gray-400 italic">Estimate unavailable</span>
                              <div className="text-xs text-gray-500 mt-1">Using job data for comparison only</div>
                            </div>
                    }
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Bonus</td>
                {jobsToCompare.map(job => (
                  <td key={job._id} className="px-4 py-3 text-sm text-gray-700">
                    {job.hasOffer 
                      ? formatCurrency(job.offerDetails?.bonus)
                      : <span className="text-gray-400 italic">Estimated: 0-15% of base</span>
                    }
                  </td>
                ))}
              </tr>
              <tr className="bg-green-50">
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Cost of Living</td>
                {jobsToCompare.map(job => (
                  <td key={job._id} className="px-4 py-3 text-sm text-gray-700">
                    {job.dataLoading
                      ? <div className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full animate-pulse bg-green-400"></div>
                          <span>Loading...</span>
                        </div>
                      : job.marketData 
                        ? <div>
                            <div className="font-medium">{job.marketData.costOfLiving.index.toFixed(1)}</div>
                            <div className="text-xs text-gray-500">
                              (US Average: {job.marketData.costOfLiving.nationalAverage})
                            </div>
                            <div className="mt-1 text-xs">
                              <div>Housing: {job.marketData.costOfLiving.housingIndex.toFixed(1)}</div>
                              <div>Groceries: {job.marketData.costOfLiving.groceriesIndex.toFixed(1)}</div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Source: {job.dataSource === 'api' 
                                ? 'API data' 
                                : 'Local estimate'}
                            </div>
                          </div>
                        : <div>
                            <span className="text-gray-400 italic">Data unavailable</span>
                            <div className="text-xs text-gray-500 mt-1">Using national average (100)</div>
                          </div>
                    }
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Adjusted Salary (CoL)</td>
                {jobsToCompare.map(job => {
                  const baseSalary = job.hasOffer 
                    ? job.offerDetails?.baseSalary 
                    : job.marketData?.salary.median;
                  const colIndex = job.marketData?.costOfLiving.index;
                  const adjustedSalary = baseSalary && colIndex 
                    ? (baseSalary / (colIndex / 100)) 
                    : undefined;
                    
                  return (
                    <td key={job._id} className="px-4 py-3 text-sm font-medium">
                      {job.dataLoading
                        ? <div className="flex items-center">
                            <div className="mr-2 h-4 w-4 rounded-full animate-pulse bg-blue-400"></div>
                            <span>Calculating...</span>
                          </div>
                        : baseSalary && colIndex 
                          ? <div className="text-green-600">{formatCurrency(adjustedSalary)}</div>
                          : <div>
                              <span className="text-gray-400 italic">Unable to calculate</span>
                              <div className="text-xs text-gray-500 mt-1">Missing salary or cost of living data</div>
                            </div>
                      }
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Please select jobs to compare
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Notes:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>For jobs without offers, market salary data is estimated based on title and location</li>
          <li>Cost of Living index uses 100 as the US national average</li>
          <li>Adjusted Salary shows the equivalent value after accounting for cost of living differences</li>
          <li>Data sources are now marked for each job (API data vs Local estimates)</li>
        </ul>
      </div>
    </div>
  );
};

export default JobMarketComparison; 