import { keyframes } from '@emotion/react';

// Animation durations
export const durations = {
  fastest: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slowest: 500,
} as const;

// Animation easings
export const easings = {
  linear: 'linear',
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  spring: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const;

// Keyframe animations
export const keyframeAnimations = {
  fadeIn: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  fadeOut: keyframes`
    from { opacity: 1; }
    to { opacity: 0; }
  `,
  slideInUp: keyframes`
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  slideInDown: keyframes`
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  slideInLeft: keyframes`
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  slideInRight: keyframes`
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  scaleIn: keyframes`
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,
  scaleOut: keyframes`
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(0.95);
      opacity: 0;
    }
  `,
  rotateIn: keyframes`
    from {
      transform: rotate(-180deg);
      opacity: 0;
    }
    to {
      transform: rotate(0);
      opacity: 1;
    }
  `,
  rotateOut: keyframes`
    from {
      transform: rotate(0);
      opacity: 1;
    }
    to {
      transform: rotate(180deg);
      opacity: 0;
    }
  `,
  bounce: keyframes`
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  `,
  pulse: keyframes`
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  `,
  shimmer: keyframes`
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  `,
  shake: keyframes`
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  `,
} as const;

// Animation presets
export const animationPresets = {
  fadeIn: {
    animation: `${keyframeAnimations.fadeIn} ${durations.normal}ms ${easings.easeOut}`,
  },
  fadeOut: {
    animation: `${keyframeAnimations.fadeOut} ${durations.normal}ms ${easings.easeIn}`,
  },
  slideInUp: {
    animation: `${keyframeAnimations.slideInUp} ${durations.normal}ms ${easings.easeOut}`,
  },
  slideInDown: {
    animation: `${keyframeAnimations.slideInDown} ${durations.normal}ms ${easings.easeOut}`,
  },
  slideInLeft: {
    animation: `${keyframeAnimations.slideInLeft} ${durations.normal}ms ${easings.easeOut}`,
  },
  slideInRight: {
    animation: `${keyframeAnimations.slideInRight} ${durations.normal}ms ${easings.easeOut}`,
  },
  scaleIn: {
    animation: `${keyframeAnimations.scaleIn} ${durations.normal}ms ${easings.spring}`,
  },
  scaleOut: {
    animation: `${keyframeAnimations.scaleOut} ${durations.normal}ms ${easings.easeIn}`,
  },
  rotateIn: {
    animation: `${keyframeAnimations.rotateIn} ${durations.slow}ms ${easings.spring}`,
  },
  rotateOut: {
    animation: `${keyframeAnimations.rotateOut} ${durations.slow}ms ${easings.easeIn}`,
  },
  bounce: {
    animation: `${keyframeAnimations.bounce} ${durations.slow}ms ${easings.spring} infinite`,
  },
  pulse: {
    animation: `${keyframeAnimations.pulse} ${durations.slow}ms ${easings.easeInOut} infinite`,
  },
  shimmer: {
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    backgroundSize: '200% 100%',
    animation: `${keyframeAnimations.shimmer} ${durations.slowest}ms ${easings.linear} infinite`,
  },
  shake: {
    animation: `${keyframeAnimations.shake} ${durations.fast}ms ${easings.easeInOut}`,
  },
} as const;

// Animation variants for staggered animations
export const staggerVariants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  },
} as const;

// Animation utilities
export const getAnimationStyle = (
  preset: keyof typeof animationPresets,
  duration?: number,
  easing?: keyof typeof easings
) => {
  const basePreset = animationPresets[preset];
  const animation = basePreset.animation.split(' ');
  
  if (duration) {
    animation[1] = `${duration}ms`;
  }
  
  if (easing) {
    animation[2] = easings[easing];
  }
  
  return {
    ...basePreset,
    animation: animation.join(' '),
  };
}; 