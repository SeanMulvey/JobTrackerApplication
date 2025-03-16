import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface JobOffer {
  id: string;
  company: string;
  role: string;
  salary: number;
  benefits: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    visionInsurance: boolean;
    retirement401k: boolean;
    paidTimeOff: number;
    remoteWork: boolean;
    flexibleHours: boolean;
    stockOptions: boolean;
    bonus: number;
  };
}

const defaultBenefits = {
  healthInsurance: false,
  dentalInsurance: false,
  visionInsurance: false,
  retirement401k: false,
  paidTimeOff: 0,
  remoteWork: false,
  flexibleHours: false,
  stockOptions: false,
  bonus: 0,
};

const defaultOffer: JobOffer = {
  id: '',
  company: '',
  role: '',
  salary: 0,
  benefits: { ...defaultBenefits },
};

const JobValueComparison = () => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([
    { ...defaultOffer, id: '1' },
    { ...defaultOffer, id: '2' },
  ]);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (
    index: number,
    field: keyof JobOffer | `benefits.${keyof JobOffer['benefits']}`,
    value: string | number | boolean
  ) => {
    const newJobOffers = [...jobOffers];
    
    if (field.startsWith('benefits.')) {
      const benefitField = field.split('.')[1] as keyof JobOffer['benefits'];
      newJobOffers[index].benefits[benefitField] = value as never;
    } else {
      newJobOffers[index][field as keyof JobOffer] = value as never;
    }
    
    setJobOffers(newJobOffers);
  };

  const addJobOffer = () => {
    if (jobOffers.length >= 4) {
      toast.warning('You can compare up to 4 job offers at once');
      return;
    }
    
    setJobOffers([
      ...jobOffers,
      { ...defaultOffer, id: (jobOffers.length + 1).toString() },
    ]);
  };

  const removeJobOffer = (index: number) => {
    if (jobOffers.length <= 2) {
      toast.warning('You need at least 2 job offers to compare');
      return;
    }
    
    const newJobOffers = jobOffers.filter((_, i) => i !== index);
    setJobOffers(newJobOffers);
  };

  const calculateTotalValue = (offer: JobOffer) => {
    let totalValue = offer.salary;
    
    // Add monetary value for benefits
    totalValue += offer.benefits.bonus;
    
    // Estimated values for benefits (these could be customized)
    if (offer.benefits.healthInsurance) totalValue += 5000;
    if (offer.benefits.dentalInsurance) totalValue += 1000;
    if (offer.benefits.visionInsurance) totalValue += 500;
    if (offer.benefits.retirement401k) totalValue += 3000;
    totalValue += offer.benefits.paidTimeOff * 500; // Value per day of PTO
    if (offer.benefits.remoteWork) totalValue += 5000;
    if (offer.benefits.flexibleHours) totalValue += 3000;
    if (offer.benefits.stockOptions) totalValue += 5000;
    
    return totalValue;
  };

  const handleCompare = () => {
    // Validate inputs
    for (let i = 0; i < jobOffers.length; i++) {
      if (!jobOffers[i].company || !jobOffers[i].role || jobOffers[i].salary <= 0) {
        toast.error(`Please fill in all required fields for Job Offer ${i + 1}`);
        return;
      }
    }
    
    setShowResults(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Job Value Comparison</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Compare different job offers by entering salary and benefits information below.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={addJobOffer}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Job Offer
          </button>
          <button
            onClick={handleCompare}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Compare
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {jobOffers.map((offer, index) => (
          <div key={offer.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Job Offer {index + 1}</h2>
              {jobOffers.length > 2 && (
                <button
                  onClick={() => removeJobOffer(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company *</label>
                <input
                  type="text"
                  value={offer.company}
                  onChange={(e) => handleInputChange(index, 'company', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <input
                  type="text"
                  value={offer.role}
                  onChange={(e) => handleInputChange(index, 'role', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Salary ($) *</label>
                <input
                  type="number"
                  value={offer.salary || ''}
                  onChange={(e) => handleInputChange(index, 'salary', Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Bonus ($)</label>
                <input
                  type="number"
                  value={offer.benefits.bonus || ''}
                  onChange={(e) => handleInputChange(index, 'benefits.bonus', Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Paid Time Off (days)</label>
                <input
                  type="number"
                  value={offer.benefits.paidTimeOff || ''}
                  onChange={(e) => handleInputChange(index, 'benefits.paidTimeOff', Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <span className="block text-sm font-medium text-gray-700">Benefits</span>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`health-${index}`}
                    checked={offer.benefits.healthInsurance}
                    onChange={(e) => handleInputChange(index, 'benefits.healthInsurance', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`health-${index}`} className="text-sm text-gray-700">
                    Health Insurance
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`dental-${index}`}
                    checked={offer.benefits.dentalInsurance}
                    onChange={(e) => handleInputChange(index, 'benefits.dentalInsurance', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`dental-${index}`} className="text-sm text-gray-700">
                    Dental Insurance
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`vision-${index}`}
                    checked={offer.benefits.visionInsurance}
                    onChange={(e) => handleInputChange(index, 'benefits.visionInsurance', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`vision-${index}`} className="text-sm text-gray-700">
                    Vision Insurance
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`401k-${index}`}
                    checked={offer.benefits.retirement401k}
                    onChange={(e) => handleInputChange(index, 'benefits.retirement401k', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`401k-${index}`} className="text-sm text-gray-700">
                    401(k) Plan
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`remote-${index}`}
                    checked={offer.benefits.remoteWork}
                    onChange={(e) => handleInputChange(index, 'benefits.remoteWork', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`remote-${index}`} className="text-sm text-gray-700">
                    Remote Work
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`flexible-${index}`}
                    checked={offer.benefits.flexibleHours}
                    onChange={(e) => handleInputChange(index, 'benefits.flexibleHours', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`flexible-${index}`} className="text-sm text-gray-700">
                    Flexible Hours
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`stock-${index}`}
                    checked={offer.benefits.stockOptions}
                    onChange={(e) => handleInputChange(index, 'benefits.stockOptions', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`stock-${index}`} className="text-sm text-gray-700">
                    Stock Options
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showResults && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Comparison Results</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Criteria</th>
                  {jobOffers.map((offer, index) => (
                    <th key={offer.id} className="px-4 py-2 text-left">
                      {offer.company || `Job Offer ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Role</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.role}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Base Salary</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      ${offer.salary.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Annual Bonus</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      ${offer.benefits.bonus.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Paid Time Off</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.benefits.paidTimeOff} days
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Health Insurance</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.benefits.healthInsurance ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Dental Insurance</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.benefits.dentalInsurance ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Vision Insurance</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.benefits.visionInsurance ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">401(k) Plan</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.benefits.retirement401k ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Remote Work</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.benefits.remoteWork ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Flexible Hours</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.benefits.flexibleHours ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 font-medium">Stock Options</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      {offer.benefits.stockOptions ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
                <tr className="border-t bg-gray-100 font-bold">
                  <td className="px-4 py-2">Estimated Total Value</td>
                  {jobOffers.map((offer) => (
                    <td key={offer.id} className="px-4 py-2">
                      ${calculateTotalValue(offer).toLocaleString()}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 mb-2">How Total Value is Calculated</h3>
            <p className="text-sm text-blue-700">
              The estimated total value includes base salary and bonus, plus estimated monetary values for benefits:
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1 ml-5 list-disc">
              <li>Health Insurance: $5,000/year</li>
              <li>Dental Insurance: $1,000/year</li>
              <li>Vision Insurance: $500/year</li>
              <li>401(k) Plan: $3,000/year</li>
              <li>Paid Time Off: $500/day</li>
              <li>Remote Work: $5,000/year (savings on commute, etc.)</li>
              <li>Flexible Hours: $3,000/year</li>
              <li>Stock Options: $5,000/year (estimated value)</li>
            </ul>
            <p className="mt-2 text-sm italic text-blue-700">
              Note: These are approximate values for comparison purposes only. Actual values will vary based on personal circumstances.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobValueComparison; 