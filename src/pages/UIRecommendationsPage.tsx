import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { uiRecommendationsService } from '../services/uiRecommendationsService';
import type { UIRecommendation } from '../services/uiRecommendationsService';

export const UIRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState<UIRecommendation[]>([]);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await uiRecommendationsService.getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleStatusUpdate = async (id: string, status: UIRecommendation['status']) => {
    try {
      await uiRecommendationsService.updateRecommendationStatus(id, status);
      await loadRecommendations(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating recommendation status:', error);
    }
  };

  const getRecommendationsByCategory = (category: UIRecommendation['category']) => {
    return recommendations.filter(rec => rec.category === category);
  };

  return (
    <div style={{ 
      padding: '5px',
      color: 'white',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      minHeight: '100vh',
      backdropFilter: 'blur(10px)'
    }}>
      <PageHeader 
        title="UI Recommendations"
        subtitle="Suggestions to improve your user experience"
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Visual Improvements</h2>
            <ul className="space-y-4">
              {getRecommendationsByCategory('visual').map(rec => (
                <RecommendationItem 
                  key={rec.id}
                  title={rec.title}
                  description={rec.description}
                  status={rec.status}
                  onStatusChange={(status) => handleStatusUpdate(rec.id, status)}
                />
              ))}
            </ul>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Interaction Improvements</h2>
            <ul className="space-y-4">
              {getRecommendationsByCategory('interaction').map(rec => (
                <RecommendationItem 
                  key={rec.id}
                  title={rec.title}
                  description={rec.description}
                  status={rec.status}
                  onStatusChange={(status) => handleStatusUpdate(rec.id, status)}
                />
              ))}
            </ul>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Optimizations</h2>
            <ul className="space-y-4">
              {getRecommendationsByCategory('performance').map(rec => (
                <RecommendationItem 
                  key={rec.id}
                  title={rec.title}
                  description={rec.description}
                  status={rec.status}
                  onStatusChange={(status) => handleStatusUpdate(rec.id, status)}
                />
              ))}
            </ul>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Animation Recommendations</h2>
              <button
                onClick={async () => {
                  const animationRecs = getRecommendationsByCategory('animation');
                  for (const rec of animationRecs) {
                    await handleStatusUpdate(rec.id, 'implemented');
                  }
                }}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Mark All Implemented
              </button>
            </div>
            <ul className="space-y-4">
              {getRecommendationsByCategory('animation').map(rec => (
                <RecommendationItem 
                  key={rec.id}
                  title={rec.title}
                  description={rec.description}
                  status={rec.status}
                  onStatusChange={(status) => handleStatusUpdate(rec.id, status)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RecommendationItemProps {
  title: string;
  description: string;
  status: 'implemented' | 'pending' | 'in-progress';
  onStatusChange: (status: 'implemented' | 'pending' | 'in-progress') => void;
}

const RecommendationItem = ({ title, description, status, onStatusChange }: RecommendationItemProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'implemented':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400 border border-green-700">Implemented</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700">Pending</span>;
      case 'in-progress':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-400 border border-blue-700">In Progress</span>;
      default:
        return null;
    }
  };

  return (
    <li className="flex items-start space-x-4">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white">{title}</h3>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as 'implemented' | 'pending' | 'in-progress')}
              className="ml-2 bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
            >
              <option value="implemented">Implemented</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
    </li>
  );
};

export default UIRecommendationsPage; 