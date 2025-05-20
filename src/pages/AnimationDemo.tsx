import React, { useState } from 'react';
import { AnimatedNav } from '../components/AnimatedNav';
import { AnimatedModal } from '../components/AnimatedModal';
import { AnimatedCard } from '../components/AnimatedCard';
import { StaggeredList } from '../components/StaggeredList';
import { AnimatedElement } from '../components/AnimatedElement';
import { MicroInteraction } from '../components/MicroInteraction';
import { AnimatedChart } from '../components/AnimatedChart';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
];

const cardItems = [
  { title: 'Card 1', content: 'This is card 1' },
  { title: 'Card 2', content: 'This is card 2' },
  { title: 'Card 3', content: 'This is card 3' },
];

const chartData = {
  line: [
    { x: 0, y: 20 },
    { x: 50, y: 40 },
    { x: 100, y: 30 },
    { x: 150, y: 60 },
    { x: 200, y: 50 },
  ],
  bar: [
    { value: 60, label: 'Jan' },
    { value: 80, label: 'Feb' },
    { value: 40, label: 'Mar' },
    { value: 90, label: 'Apr' },
  ],
  pie: [
    { value: 30, label: 'A' },
    { value: 40, label: 'B' },
    { value: 30, label: 'C' },
  ],
};

export const AnimationDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie'>('line');

  const handleCardClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Animation Demo</h1>

      {/* Navigation Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Navigation</h2>
        <AnimatedNav items={navItems} className="w-64" />
      </section>

      {/* Cards Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StaggeredList
            items={cardItems.map((item) => (
              <AnimatedCard
                key={item.title}
                title={item.title}
                isLoading={isLoading}
                onClick={handleCardClick}
              >
                {item.content}
              </AnimatedCard>
            ))}
          />
        </div>
      </section>

      {/* Micro-interactions Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Micro-interactions</h2>
        <div className="flex gap-4">
          <MicroInteraction type="success" onClick={() => console.log('Success clicked')}>
            <button className="px-4 py-2 bg-green-500 text-white rounded-md">
              Success Action
            </button>
          </MicroInteraction>
          <MicroInteraction type="error" onClick={() => console.log('Error clicked')}>
            <button className="px-4 py-2 bg-red-500 text-white rounded-md">
              Error Action
            </button>
          </MicroInteraction>
          <MicroInteraction type="warning" onClick={() => console.log('Warning clicked')}>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded-md">
              Warning Action
            </button>
          </MicroInteraction>
        </div>
      </section>

      {/* Chart Animations Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Chart Animations</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveChart('line')}
            className={`px-4 py-2 rounded-md ${
              activeChart === 'line' ? 'bg-primary-main text-white' : 'bg-gray-700'
            }`}
          >
            Line Chart
          </button>
          <button
            onClick={() => setActiveChart('bar')}
            className={`px-4 py-2 rounded-md ${
              activeChart === 'bar' ? 'bg-primary-main text-white' : 'bg-gray-700'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setActiveChart('pie')}
            className={`px-4 py-2 rounded-md ${
              activeChart === 'pie' ? 'bg-primary-main text-white' : 'bg-gray-700'
            }`}
          >
            Pie Chart
          </button>
        </div>
        <div className="h-64 bg-card-background rounded-lg p-4">
          <AnimatedChart
            data={chartData[activeChart]}
            type={activeChart}
            className="w-full h-full"
          />
        </div>
      </section>

      {/* Modal Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Modal</h2>
        <AnimatedElement animation="scaleIn">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary-main text-primary-text rounded-md hover:bg-primary-dark transition-colors"
          >
            Open Modal
          </button>
        </AnimatedElement>

        <AnimatedModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Demo Modal"
        >
          <p className="text-text-primary">
            This is a demo modal with smooth animations. Click outside or press Escape to close.
          </p>
        </AnimatedModal>
      </section>

      {/* Animation Types Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Animation Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatedElement animation="fadeIn" className="p-4 bg-card-background rounded-lg">
            Fade In
          </AnimatedElement>
          <AnimatedElement animation="slideInUp" className="p-4 bg-card-background rounded-lg">
            Slide Up
          </AnimatedElement>
          <AnimatedElement animation="scaleIn" className="p-4 bg-card-background rounded-lg">
            Scale In
          </AnimatedElement>
          <AnimatedElement animation="rotateIn" className="p-4 bg-card-background rounded-lg">
            Rotate In
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}; 