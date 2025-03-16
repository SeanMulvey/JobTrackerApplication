import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { toast } from 'react-toastify';

interface SankeyNode {
  id: string;
  name: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface JobStats {
  statusCounts: Record<string, number>;
  totalApplications: number;
}

// Interface for a job document
interface Job {
  _id: string;
  status: string;
  interview_process?: Array<any>;
  offerDetails?: {
    baseSalary?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

const SankeyChart: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sankeyData, setSankeyData] = useState<SankeyData | null>(null);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Colors for different nodes
  const nodeColors = {
    'Applied': 'rgba(31, 119, 180, 0.8)',
    'Interviewing': 'rgba(255, 127, 14, 0.8)',
    'Offer Received': 'rgba(44, 160, 44, 0.8)',
    'Accepted': 'rgba(23, 190, 207, 0.8)',
    'Rejected': 'rgba(214, 39, 40, 0.8)',
    'Withdrawn': 'rgba(148, 103, 189, 0.8)',
    'Pending': 'rgba(140, 140, 140, 0.8)' // Color for pending/static Applied jobs
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all jobs to analyze their full journey
        const jobsResponse = await axios.get('/api/jobs');
        
        // Fetch statistics for total counts
        const statsResponse = await axios.get('/api/analytics/stats');
        
        console.log('Stats response:', statsResponse.data);
        
        if (jobsResponse.data && jobsResponse.data.success && 
            statsResponse.data && statsResponse.data.success) {
          
          const jobs = jobsResponse.data.data as Job[];
          const stats = statsResponse.data.data as JobStats;
          
          setJobStats(stats);
          console.log('All jobs:', jobs);
          
          // Create nodes for the Sankey diagram
          const nodes = [
            { id: 'Applied', name: 'Applied' },
            { id: 'Interviewing', name: 'Interviewing' },
            { id: 'Offer Received', name: 'Offer Received' },
            { id: 'Accepted', name: 'Accepted' },
            { id: 'Rejected', name: 'Rejected' },
            { id: 'Withdrawn', name: 'Withdrawn' },
            { id: 'Pending', name: 'Pending' }
          ];
          
          // Initialize counters for each flow
          let appliedToInterviewing = 0;
          let appliedToRejected = 0;
          let appliedToWithdrawn = 0;
          let interviewingToOfferReceived = 0;
          let interviewingToRejected = 0;
          let interviewingToWithdrawn = 0;
          let offerReceivedToAccepted = 0;
          let offerReceivedToRejected = 0;
          let offerReceivedToWithdrawn = 0;
          
          // Count jobs that remain in Applied status without progressing
          let stillInApplied = 0;
          
          // Analyze each job to determine its progression path
          jobs.forEach(job => {
            const hasInterviews = job.interview_process && job.interview_process.length > 0;
            const hasOffer = job.offerDetails && job.offerDetails.baseSalary;
            
            // First count all jobs as having been applied
            // Then track their progression through the pipeline
            
            if (job.status === 'Applied') {
              // Job is still in Applied status
              stillInApplied++;
            } else if (job.status === 'Interviewing') {
              // Job moved from Applied to Interviewing
              appliedToInterviewing++;
            } else if (job.status === 'Offer Received') {
              // Job moved from Applied to Interviewing to Offer Received
              appliedToInterviewing++;
              interviewingToOfferReceived++;
            } else if (job.status === 'Accepted') {
              // Job completed the full successful path
              appliedToInterviewing++;
              interviewingToOfferReceived++;
              offerReceivedToAccepted++;
            } else if (job.status === 'Rejected') {
              if (hasOffer) {
                // Rejected after receiving an offer
                appliedToInterviewing++;
                interviewingToOfferReceived++;
                offerReceivedToRejected++;
              } else if (hasInterviews) {
                // Rejected after interviews
                appliedToInterviewing++;
                interviewingToRejected++;
              } else {
                // Rejected at application stage
                appliedToRejected++;
              }
            } else if (job.status === 'Withdrawn') {
              if (hasOffer) {
                // Withdrawn after receiving an offer
                appliedToInterviewing++;
                interviewingToOfferReceived++;
                offerReceivedToWithdrawn++;
              } else if (hasInterviews) {
                // Withdrawn after interviews
                appliedToInterviewing++;
                interviewingToWithdrawn++;
              } else {
                // Withdrawn at application stage
                appliedToWithdrawn++;
              }
            }
          });
          
          console.log('Applied to Interviewing:', appliedToInterviewing);
          console.log('Applied to Rejected:', appliedToRejected);
          console.log('Interviewing to Offer:', interviewingToOfferReceived);
          console.log('Still in Applied:', stillInApplied);
          
          // Create links with accurate values that represent the full journey
          const links = [];
          
          // Add all flow links with non-zero values
          if (appliedToInterviewing > 0) {
            links.push({ source: 'Applied', target: 'Interviewing', value: appliedToInterviewing });
          }
          
          if (appliedToRejected > 0) {
            links.push({ source: 'Applied', target: 'Rejected', value: appliedToRejected });
          }
          
          if (appliedToWithdrawn > 0) {
            links.push({ source: 'Applied', target: 'Withdrawn', value: appliedToWithdrawn });
          }
          
          if (interviewingToOfferReceived > 0) {
            links.push({ source: 'Interviewing', target: 'Offer Received', value: interviewingToOfferReceived });
          }
          
          if (interviewingToRejected > 0) {
            links.push({ source: 'Interviewing', target: 'Rejected', value: interviewingToRejected });
          }
          
          if (interviewingToWithdrawn > 0) {
            links.push({ source: 'Interviewing', target: 'Withdrawn', value: interviewingToWithdrawn });
          }
          
          if (offerReceivedToAccepted > 0) {
            links.push({ source: 'Offer Received', target: 'Accepted', value: offerReceivedToAccepted });
          }
          
          if (offerReceivedToRejected > 0) {
            links.push({ source: 'Offer Received', target: 'Rejected', value: offerReceivedToRejected });
          }
          
          if (offerReceivedToWithdrawn > 0) {
            links.push({ source: 'Offer Received', target: 'Withdrawn', value: offerReceivedToWithdrawn });
          }
          
          // Add link for jobs still in Applied status
          if (stillInApplied > 0) {
            links.push({ source: 'Applied', target: 'Pending', value: stillInApplied });
          }
          
          const enhancedData = { nodes, links };
          setSankeyData(enhancedData);
        } else {
          setError('Invalid data format from the API');
          toast.error('Failed to load application flow data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch job application flow data');
        toast.error('Failed to load application flow data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !sankeyData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-2">Application Flow</h2>
        <div className="text-center text-gray-500 py-8">
          {error || 'No data available to display the application flow.'}
        </div>
      </div>
    );
  }

  // Check if we have any data to show
  const hasData = sankeyData.links.some(link => link.value > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-2">Application Flow</h2>
        <div className="text-center text-gray-500 py-8">
          Not enough job data to display a flow chart. Add more jobs with different statuses to visualize your application journey.
        </div>
      </div>
    );
  }

  // Create a node name to index mapping for easier reference
  const nodeNameToIndex: Record<string, number> = {};
  sankeyData.nodes.forEach((node, index) => {
    nodeNameToIndex[node.id] = index;
  });

  // Transform data for Plotly
  const nodeLabels = sankeyData.nodes.map(node => node.name);
  
  // Create correct source and target arrays using the name to index mapping
  const sources = sankeyData.links.map(link => nodeNameToIndex[link.source]);
  const targets = sankeyData.links.map(link => nodeNameToIndex[link.target]);
  const values = sankeyData.links.map(link => link.value);
  
  // Create color array for nodes
  const colorArray = sankeyData.nodes.map(node => {
    const key = Object.keys(nodeColors).find(k => node.name.includes(k));
    return key ? nodeColors[key as keyof typeof nodeColors] : 'rgba(180, 180, 180, 0.8)';
  });

  // Create link colors based on source node
  const linkColors = sankeyData.links.map(link => {
    const sourceNode = sankeyData.nodes.find(node => node.id === link.source);
    if (sourceNode) {
      const key = Object.keys(nodeColors).find(k => sourceNode.name.includes(k));
      return key ? nodeColors[key as keyof typeof nodeColors].replace('0.8', '0.4') : 'rgba(180, 180, 180, 0.4)';
    }
    return 'rgba(180, 180, 180, 0.4)';
  });

  const sankeyPlotData = [{
    type: 'sankey' as const,
    orientation: 'h' as const,
    valueformat: '.0f',
    arrangement: 'fixed', // Use fixed arrangement to prevent nodes shifting
    node: {
      pad: 10,
      thickness: 20,
      line: {
        color: 'black',
        width: 0.5
      },
      label: nodeLabels,
      color: colorArray
    },
    link: {
      source: sources,
      target: targets,
      value: values,
      color: linkColors,
      hoverinfo: 'all',
      hoverlabel: {
        bgcolor: '#FFF',
        bordercolor: '#333',
        font: {
          family: 'Arial',
          size: 12,
          color: '#333'
        }
      }
    }
  }];

  const layout = {
    title: {
      text: 'Job Application Flow',
      font: {
        size: 18
      }
    },
    font: {
      size: 12
    },
    autosize: true,
    height: 380, // Smaller height to avoid overlapping with other elements
    margin: {
      l: 5,
      r: 5,
      b: 5,
      t: 40,
      pad: 0
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
  };

  // Find the pending link to show in the description
  const pendingLink = sankeyData.links.find(link => link.target === 'Pending');
  const pendingCount = pendingLink ? pendingLink.value : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-2">Application Flow</h2>
      <div className="h-[380px] w-full">
        <Plot
          data={sankeyPlotData}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            staticPlot: false
          }}
          onInitialized={(figure) => {
            console.log('Sankey chart initialized:', figure);
          }}
          onError={(err) => {
            console.error('Plotly error:', err);
          }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>This Sankey diagram shows the flow of your job applications through different stages.</p>
        <p>The "Pending" node shows {pendingCount} application{pendingCount !== 1 ? 's' : ''} that remain in the Applied status without moving to another stage yet.</p>
      </div>
    </div>
  );
};

export default SankeyChart; 